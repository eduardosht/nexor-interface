import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import * as S from './styles';

interface FullBleedBannerProps {
  src: string;
  ariaLabel: string;
}

export function FullBleedBanner({ src, ariaLabel }: FullBleedBannerProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <S.Wrapper ref={ref} role="img" aria-label={ariaLabel}>
      <S.BgImage $src={src} style={{ backgroundPositionY: y }} />
      <S.Overlay />
    </S.Wrapper>
  );
}
