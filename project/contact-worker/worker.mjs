const origins = new Set(['https://nexoradvance.com.br', 'https://www.nexoradvance.com.br']);
const subjects = { parceria: 'Parcerias', biteplaner: 'Dúvidas sobre BITEPLANER', elegibilidade: 'Elegibilidade BITEPLANER', imprensa: 'Imprensa / Mídia', lgpd: 'LGPD', outro: 'Outro' };

export default {
  async fetch(request, env, _ctx, fetcher = fetch) {
    const origin = request.headers.get('Origin');
    const headers = { 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    const reply = (status, message) => Response.json(message, { status, headers });
    if (!origins.has(origin)) return reply(403, { error: 'origin_not_allowed' });
    headers['Access-Control-Allow-Origin'] = origin;
    if (new URL(request.url).pathname !== '/v1/contact') return reply(404, { error: 'not_found' });
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }
    if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
    if (!env.RESEND_API_KEY || !env.CONTACT_RATE_LIMITER) return reply(503, { error: 'temporarily_unavailable' });
    try {
      const ip = request.headers.get('CF-Connecting-IP');
      if (!ip) return reply(400, { error: 'invalid_request' });
      const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: `contact:${ip}` });
      if (!success) return new Response(JSON.stringify({ error: 'rate_limit' }), { status: 429, headers: { ...headers, 'Content-Type': 'application/json', 'Retry-After': '60' } });
      if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return reply(415, { error: 'invalid_content_type' });
      // Read at most 16 KB, including requests without Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return reply(400, { error: 'invalid_payload' });
      const chunks = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 16384) { await reader.cancel(); return reply(413, { error: 'payload_too_large' }); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let body;
      try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply(400, { error: 'invalid_payload' }); }
      if (!body || Array.isArray(body) || typeof body !== 'object') return reply(400, { error: 'invalid_payload' });
      const { nome, email, assunto, mensagem, website } = body;
      if (typeof nome !== 'string' || nome.trim().length < 2 || nome.length > 120 || /[\r\n]/.test(nome) ||
          typeof email !== 'string' || email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
          typeof assunto !== 'string' || !Object.hasOwn(subjects, assunto) ||
          typeof mensagem !== 'string' || mensagem.trim().length < 10 || mensagem.length > 2000 ||
          (website !== undefined && website !== '')) return reply(400, { error: 'invalid_payload' });
      const response = await fetcher('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Nexor Advance <contato@nexoradvance.com.br>', to: 'contato@nexoradvance.com.br',
          reply_to: email.trim().toLowerCase(), subject: `[Nexor] ${subjects[assunto]}`,
          text: `Novo contato pelo site Nexor Advance.\n\nNome: ${nome.trim()}\nE-mail: ${email.trim()}\nAssunto: ${subjects[assunto]}\n\n${mensagem.trim()}`
        })
      });
      if (!response.ok) return reply(502, { error: 'email_unavailable' });
      const result = await response.json();
      if (typeof result.id !== 'string' || !result.id) return reply(502, { error: 'email_unavailable' });
      return reply(200, { ok: true });
    } catch {
      return reply(502, { error: 'email_unavailable' });
    }
  }
};
