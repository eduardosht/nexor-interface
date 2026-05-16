import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { depoimentos } from '../../data/depoimentos';
import { fadeUp, staggerContainer } from '../../styles/motion';
import { publicOptimizedImages } from '../../assets/publicOptimizedImages';
import * as S from './styles';

export function Depoimentos() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <S.Section id="depoimentos" ref={ref}>
      <S.Inner
        as={motion.div}
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        <S.Header as={motion.div} variants={fadeUp}>
          <div>
            <S.Title>O que dizem<br />nossos clientes</S.Title>
          </div>
        </S.Header>

        <S.Cards as={motion.div} variants={fadeUp}>
          {depoimentos.map((d) => (
            <S.Card key={d.nome}>
              <S.ProductBadge>
                <img
                  src={publicOptimizedImages.shared.biteplanerLogoWhite.webp}
                  alt="Biteplaner"
                  width={320}
                  height={73}
                  loading="lazy"
                  decoding="async"
                />
              </S.ProductBadge>
              <S.QuoteMark>"</S.QuoteMark>
              <S.QuoteText>{d.texto}</S.QuoteText>
              <S.Divider />
              <S.Attribution>
                <S.Name>{d.nome}</S.Name>
                <S.Context>{d.contexto}</S.Context>
              </S.Attribution>
            </S.Card>
          ))}
        </S.Cards>
      </S.Inner>
    </S.Section>
  );
}
