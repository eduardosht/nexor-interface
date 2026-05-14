import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button, Field, Select, sanitizePersonName } from '@nexor/design-system';
import { env } from '../../config/env';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';

const ASSUNTOS = [
  { value: 'parceria', label: 'Parceria comercial' },
  { value: 'produto', label: 'Dúvidas sobre produto' },
  { value: 'performance', label: 'Consultoria de performance' },
  { value: 'imprensa', label: 'Imprensa / Mídia' },
  { value: 'outro', label: 'Outro' },
];

interface FormState {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}

export function Contato() {
  const { contactEmail, contactWhatsapp } = env;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const [form, setForm] = useState<FormState>({ nome: '', email: '', assunto: '', mensagem: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'nome' ? sanitizePersonName(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 900);
  };

  const isValid = form.nome.trim() && form.email.trim() && form.assunto && form.mensagem.trim();

  return (
    <S.SectionOuter>
      <S.Section id="contato" ref={ref}>
        <motion.div variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <S.Title as={motion.h2} variants={fadeUp}>
            Fale com
            <br />
            a Nexor
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
              <S.ContactLink href={contactWhatsapp} data-testid="contact-whatsapp" rel="noreferrer">
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
            <S.Form onSubmit={handleSubmit} noValidate>
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

              <Button type="submit" disabled={!isValid || submitting}>
                {submitting ? 'Enviando…' : 'Enviar mensagem →'}
              </Button>
            </S.Form>
          )}
        </motion.div>
      </S.Section>
    </S.SectionOuter>
  );
}
