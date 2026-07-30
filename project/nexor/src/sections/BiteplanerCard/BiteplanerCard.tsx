import { publicOptimizedImages } from '../../assets/publicOptimizedImages';
import * as S from './styles';

const FEATURES = [
  'Avaliação odontológica completa com profissionais licenciados',
  'Produção externa personalizada coordenada pela Nexor',
  'Acompanhamento profissional durante todo o ciclo de uso',
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
          Protetor bucal personalizado desenvolvido com avaliação odontológica profissional e produção externa coordenada pela Nexor.
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
          <S.Cta>Saiba mais → </S.Cta>
        </S.CardFooter>
      </S.CardBody>
    </S.Card>
  );
}
