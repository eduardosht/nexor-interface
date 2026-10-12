import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../styles/motion';
import { publicOptimizedImages } from '../../assets/publicOptimizedImages';
import unbrandedProductImage from '../../assets/backgrounds/biteplaner-unbranded.webp';
import * as S from './styles';

const FEATURES = [
  'Avaliação e planejamento com especialista licenciado',
  'Produção personalizada direcionada pela Nexor Advance',
  'Ajuste fino de oclusão e adaptação individual',
  'Acompanhamento e retornos periódicos para máxima função e performance',
];

function CheckSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ProtocolSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function Produtos() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <S.SectionOuter>
      <S.Section id="produtos" ref={ref}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.div variants={fadeUp}>
            <S.Title>Tecnologia aplicada<br />à performance humana<span style={{ color: '#3C7C56' }}>.</span></S.Title>
          </motion.div>

          <motion.div variants={fadeUp}>
            <S.ProductGrid>
              <S.ImageCol>
                <S.ProductImage
                  src={unbrandedProductImage}
                  alt="Dois dispositivos esportivos individualizados em preto e branco, sem marcas."
                  width={759}
                  height={502}
                  loading="lazy"
                  decoding="async"
                />
              </S.ImageCol>

              <S.InfoCol>
                <div>
                  <picture>
                    <source srcSet={publicOptimizedImages.shared.biteplanerLogo.avif} type="image/avif" />
                    <S.ProductLogo
                      src={publicOptimizedImages.shared.biteplanerLogo.webp}
                      alt="Biteplaner"
                      width={320}
                      height={73}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>

                <S.ProductDesc>
                  Tecnologia aplicada e evolução contínua. Um dispositivo esportivo individualizado desenvolvido para acompanhar as demandas funcionais da região mandibular, considerando adaptação, biomecânica e proteção da região oral.
                </S.ProductDesc>

                <S.FeatureList>
                  {FEATURES.map((f) => (
                    <S.FeatureItem key={f}>
                      <S.CheckIcon><CheckSvg /></S.CheckIcon>
                      {f}
                    </S.FeatureItem>
                  ))}
                </S.FeatureList>

                <S.ProtocolBadge>
                  <S.ProtocolIconWrap><ProtocolSvg /></S.ProtocolIconWrap>
                  <S.ProtocolText>Personalização apoiada por precisão digital e acompanhamento profissional</S.ProtocolText>
                </S.ProtocolBadge>

                <S.CardFooter>
                  <S.Badges>
                    <S.Badge>Precision Fit</S.Badge>
                    <S.Badge>Performance</S.Badge>
                  </S.Badges>
                  <S.CtaLink to="/biteplaner">Conheça o BITEPLANER →</S.CtaLink>
                </S.CardFooter>
              </S.InfoCol>
            </S.ProductGrid>
          </motion.div>
        </motion.div>
      </S.Section>
    </S.SectionOuter>
  );
}
