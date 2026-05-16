import { motion } from 'framer-motion';
import { Button } from '@nexor/design-system';
import { fadeUp, staggerContainer } from '../../styles/motion';
import plexusBg from '../../assets/backgrounds/plexus_background.mp4';
import { publicOptimizedImages } from '../../assets/publicOptimizedImages';
import * as S from './styles';

export function Hero() {
  return (
    <S.SectionWrapper aria-label="Apresentação Nexor">
      <S.VideoBackground autoPlay muted loop playsInline preload="metadata" poster={publicOptimizedImages.home.heroPoster.webp}>
        <source src={plexusBg} type="video/mp4" />
      </S.VideoBackground>
      <S.VideoOverlay />
      <S.Section>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <S.Label variants={fadeUp}>
            <S.LabelLine />
            Nexor · Performance Atlética
          </S.Label>

          <S.Headline variants={fadeUp}>
            <S.HeadlinePrimary>Performance através</S.HeadlinePrimary>
            <S.HeadlineDim>da precisão.</S.HeadlineDim>
          </S.Headline>

          <S.Tagline variants={fadeUp}>
            A Nexor é uma plataforma de pesquisa, tecnologia e criação de produtos de alta performance para atletas e praticantes esportivos.
          </S.Tagline>

          <S.Ctas variants={fadeUp}>
            <S.CtaPrimary href="/biteplaner">
              <Button>Conheça o Biteplaner</Button>
            </S.CtaPrimary>
            <S.CtaSecondary href="#quem-somos">
              Sobre nós <span>→</span>
            </S.CtaSecondary>
          </S.Ctas>
        </motion.div>

        <S.ScrollIndicator aria-hidden="true">↓</S.ScrollIndicator>
      </S.Section>
    </S.SectionWrapper>
  );
}
