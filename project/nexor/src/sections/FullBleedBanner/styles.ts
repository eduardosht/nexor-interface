import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fullBleedSection } from '../../styles/layout';

export const Wrapper = styled.div`
  ${fullBleedSection}
  min-height: 55vh;
  position: relative;
  overflow: hidden;
`;

export const BgImage = styled(motion.div)<{ $src: string }>`
  position: absolute;
  inset: -15%;
  background: url(${({ $src }) => $src}) center/cover no-repeat;
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
`;
