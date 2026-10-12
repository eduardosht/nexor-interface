import { publicOptimizedImages } from '../../assets/publicOptimizedImages';
import * as S from './styles';

const FEATURES = [
  'Avaliação com especialista licenciado',
  'Produção personalizada direcionada pela Nexor Advance',
  'Personalização apoiada por precisão digital',
  'Acompanhamento e retornos periódicos para máxima função e performance',
];

export function BiteplanerCard() {
  return (
    <S.Card to="/biteplaner" aria-label="Conhecer Biteplaner">
      <S.CardHero>
        <S.AccentLine />
        <S.Logo
          src={publicOptimizedImages.shared.biteplanerLogoWhite.webp}
          alt="Biteplaner"
          width={320}
          height={73}
          loading="lazy"
          decoding="async"
        />
        <S.Tagline>
          Tecnologia aplicada e evolução contínua. Um dispositivo esportivo individualizado desenvolvido para acompanhar as demandas funcionais da região mandibular, considerando adaptação, biomecânica e proteção da região oral.
        </S.Tagline>
      </S.CardHero>

      <S.CardBody>
        <S.Features>
          {FEATURES.map((f) => (
            <S.Feature key={f}>{f}</S.Feature>
          ))}
        </S.Features>

        <S.CardFooter>
          <S.Badges>
            <S.Badge>Premium</S.Badge>
            <S.Badge>Biteplaner · 2026</S.Badge>
          </S.Badges>
          <S.Cta>Conheça o BITEPLANER → </S.Cta>
        </S.CardFooter>
      </S.CardBody>
    </S.Card>
  );
}
