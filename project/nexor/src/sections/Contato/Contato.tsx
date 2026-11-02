import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { motion, useInView } from 'framer-motion';
import { Button, Field, Select, sanitizePersonName } from '@nexor/design-system';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';

const ASSUNTOS = [
  { value: 'parceria', label: 'Parcerias' },
  { value: 'biteplaner', label: 'Dúvidas sobre BITEPLANER' },
  { value: 'elegibilidade', label: 'Especialista licenciado / Elegibilidade BITEPLANER' },
  { value: 'imprensa', label: 'Imprensa / Mídia' },
  { value: 'lgpd', label: 'LGPD' },
  { value: 'outro', label: 'Outro' },
];

interface FormState {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}

export function Contato() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'contato@nexoradvance.com.br';
  const contactWhatsapp = import.meta.env.VITE_CONTACT_WHATSAPP;
  const location = useLocation();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const [form, setForm] = useState<FormState>({ nome: '', email: '', assunto: '', mensagem: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const sendingRef = useRef(false);
  const [website, setWebsite] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldPreselectLgpd = location.hash === '#contato' && params.get('assunto') === 'lgpd';

    if (!shouldPreselectLgpd) {
      return;
    }

    setForm((prev) => (prev.assunto === 'lgpd' ? prev : { ...prev, assunto: 'lgpd' }));
    if (typeof ref.current?.scrollIntoView === 'function') {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'nome' ? sanitizePersonName(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || sendingRef.current) {
      return;
    }

    sendingRef.current = true;
    setSending(true);
    setError('');
    try {
      const response = await fetch('https://nexor-contact.eduardoshoitifujiwara.workers.dev/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ nome: form.nome.trim(), email: form.email.trim(), assunto: form.assunto, mensagem: form.mensagem.trim(), website }),
      });
      const result = await response.json();
      if (!response.ok || result?.ok !== true) {
        throw new Error(response.status === 429 ? 'rate_limit' : 'send_failed');
      }
      setSent(true);
    } catch (failure) {
      setError(failure instanceof Error && failure.message === 'rate_limit'
        ? 'Muitas tentativas. Aguarde um minuto e tente novamente.'
        : 'Não foi possível enviar sua mensagem. Tente novamente ou use o e-mail de contato.');
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const isValid = form.nome.trim().length >= 2 && form.nome.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && form.email.length <= 160 && ASSUNTOS.some((item) => item.value === form.assunto) && form.mensagem.trim().length >= 10 && form.mensagem.length <= 2000;

  return (
    <S.SectionOuter>
      <S.Section id="contato" ref={ref}>
        <motion.div variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <S.Title as={motion.h2} variants={fadeUp}>
            Fale com a Nexor Advance
          </S.Title>
          <S.Subtitle as={motion.p} variants={fadeUp}>
            Entre em contato para parcerias, distribuição ou dúvidas sobre nossos produtos.
          </S.Subtitle>

          <S.ContactLinks>
            {contactEmail && (
              <S.ContactLink href={`mailto:${contactEmail}`} data-testid="contact-email">
                <S.IconBox>✉</S.IconBox>
                {contactEmail}
              </S.ContactLink>
            )}
            {contactWhatsapp && (
              <S.ContactLink href={contactWhatsapp} data-testid="contact-whatsapp" rel="noopener noreferrer">
                <S.IconBox>💬</S.IconBox>
                WhatsApp
              </S.ContactLink>
            )}
          </S.ContactLinks>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <S.SuccessBanner tone="subtle" padding="md">
                Mensagem enviada! Retornaremos em breve.
              </S.SuccessBanner>
            </motion.div>
          ) : (
            <S.Form onSubmit={handleSubmit} noValidate aria-busy={sending}>
              <S.Honeypot aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
              </S.Honeypot>
              <S.Row>
                <Field
                  as="input"
                  id="nome"
                  name="nome"
                  label="Nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.nome}
                  onChange={handleChange}
                  required
                />
                <Field
                  as="input"
                  id="email"
                  name="email"
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </S.Row>

              <S.SelectIntro>
                Selecione o tema principal para direcionarmos a resposta com mais rapidez.
              </S.SelectIntro>
              <Select
                id="assunto"
                label="Assunto"
                value={form.assunto}
                placeholder="Selecione um assunto"
                onChange={(value) => {
                  setForm((prev) => ({ ...prev, assunto: value }));
                }}
                options={ASSUNTOS}
              />

              <Field
                as="textarea"
                id="mensagem"
                name="mensagem"
                label="Mensagem"
                placeholder="Descreva sua mensagem..."
                value={form.mensagem}
                onChange={handleChange}
                required
              />

              <S.SelectIntro>Não inclua dados de saúde ou documentos nesta mensagem.</S.SelectIntro>
              {error && <S.ErrorBanner role="alert">{error}</S.ErrorBanner>}
              <Button type="submit" disabled={!isValid || sending}>
                {sending ? 'Enviando...' : 'Enviar mensagem →'}
              </Button>
            </S.Form>
          )}
        </motion.div>
      </S.Section>
    </S.SectionOuter>
  );
}
