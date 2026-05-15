import { Cookie, FileText, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';

const items = [
  {
    to: '/privacidade',
    icon: <ShieldCheck width={18} height={18} strokeWidth={1.8} aria-hidden />,
    title: 'Política de Privacidade',
    desc: 'Como coletamos, usamos e protegemos seus dados pessoais.',
  },
  {
    to: '/termos',
    icon: <FileText width={18} height={18} strokeWidth={1.8} aria-hidden />,
    title: 'Termos de Uso',
    desc: 'Condições gerais que regem o uso de nossos produtos e plataforma.',
  },
  {
    to: '/cookies',
    icon: <Cookie width={18} height={18} strokeWidth={1.8} aria-hidden />,
    title: 'Política de Cookies',
    desc: 'Quais cookies utilizamos e como você pode gerenciá-los.',
  },
];

export function Legal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <S.SectionOuter>
    <S.Section id="legal" ref={ref}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        <motion.div variants={fadeUp}>
          <S.SectionLabel>Legal</S.SectionLabel>
          <S.Title>Transparência e privacidade</S.Title>
          <S.Subtitle>
            Acesse nossos documentos legais para entender seus direitos
            e como tratamos suas informações.
          </S.Subtitle>
        </motion.div>

        <S.Cards as={motion.div} variants={fadeUp}>
          {items.map((item) => (
            <S.Card key={item.to} to={item.to}>
              <S.CardIcon>{item.icon}</S.CardIcon>
              <S.CardTitle>{item.title}</S.CardTitle>
              <S.CardDesc>{item.desc}</S.CardDesc>
              <S.CardArrow>Ler documento →</S.CardArrow>
            </S.Card>
          ))}
        </S.Cards>
      </motion.div>
    </S.Section>
    </S.SectionOuter>
  );
}
