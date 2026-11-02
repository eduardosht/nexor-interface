import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';

const payload = { nome: 'Maria Cliente', email: 'maria@example.com', assunto: 'lgpd', mensagem: 'Gostaria de uma informação.', website: '' };
const env = { RESEND_API_KEY: 'test-only', CONTACT_RATE_LIMITER: { limit: async () => ({ success: true }) } };
function request(body = payload, origin = 'https://nexoradvance.com.br') {
  return new Request('https://contact.nexoradvance.com.br/v1/contact', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' }, body: JSON.stringify(body) });
}
test('sends to the fixed inbox and uses visitor email only as reply-to', async () => {
  let message;
  const response = await worker.fetch(request({ ...payload, to: 'attacker@example.com' }), env, undefined, async (url, init) => {
    assert.equal(url, 'https://api.resend.com/emails');
    message = JSON.parse(init.body);
    return Response.json({ id: 'accepted-message' });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(message.to, 'contato@nexoradvance.com.br');
  assert.equal(message.reply_to, 'maria@example.com');
  assert.match(message.subject, /LGPD/);
});
for (const [label, body, origin, status] of [
  ['invalid email', { ...payload, email: 'bad' }, 'https://nexoradvance.com.br', 400],
  ['unknown subject', { ...payload, assunto: 'injected' }, 'https://nexoradvance.com.br', 400],
  ['oversized message', { ...payload, mensagem: 'a'.repeat(2001) }, 'https://nexoradvance.com.br', 400],
  ['untrusted origin', payload, 'https://evil.example', 403],
  ['honeypot', { ...payload, website: 'spam' }, 'https://nexoradvance.com.br', 400],
]) test(`rejects ${label} without contacting Resend`, async () => {
  const response = await worker.fetch(request(body, origin), env, undefined, async () => { throw new Error('must not send'); });
  assert.equal(response.status, status);
});
test('rejects requests after the rate limit', async () => {
  const response = await worker.fetch(request(), { ...env, CONTACT_RATE_LIMITER: { limit: async () => ({ success: false }) } });
  assert.equal(response.status, 429);
});
test('fails closed without secrets or rate limiter', async () => {
  for (const config of [{}, { RESEND_API_KEY: 'test-only' }]) {
    assert.equal((await worker.fetch(request(), config)).status, 503);
  }
});
test('does not report success or expose provider details when Resend rejects', async () => {
  const response = await worker.fetch(request(), env, undefined, async () => Response.json({ message: 'private-provider-details' }, { status: 403 }));
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /private-provider-details|test-only/);
});
test('preflight allows only POST and JSON for the Nexor origin', async () => {
  const response = await worker.fetch(new Request('https://contact.nexoradvance.com.br/v1/contact', { method: 'OPTIONS', headers: { Origin: 'https://nexoradvance.com.br' } }), env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://nexoradvance.com.br');
});
