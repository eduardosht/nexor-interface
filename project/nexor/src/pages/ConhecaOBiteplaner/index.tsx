import { ArrowRight, BadgeCheck, Dumbbell, ShieldCheck, Stethoscope } from 'lucide-react';
import * as S from './styles';

const HIGHLIGHTS = [
  {
    icon: Stethoscope,
    title: 'Avaliação profissional',
    body: 'A jornada começa com elegibilidade e orientação odontológica antes da compra.',
  },
  {
    icon: ShieldCheck,
    title: 'Proteção personalizada',
    body: 'Um dispositivo feito para a rotina real de atletas, treinos intensos e esportes de contato.',
  },
  {
    icon: BadgeCheck,
    title: 'Acompanhamento',
    body: 'Da avaliacao inicial aos ajustes, o processo segue com profissionais licenciados.',
  },
];

export function ConhecaOBiteplaner() {
  return (
    <S.Page id="main-content" tabIndex={-1}>
      <S.Hero>
        <S.HeroCopy>
          <S.Eyebrow>Você chegou aqui pelo QR Code</S.Eyebrow>
          <S.Title>Conheça o Biteplaner</S.Title>
          <S.Lead>
            Protetor bucal premium para atletas, criado para unir segurança, conforto e uma jornada acompanhada por
            profissionais.
          </S.Lead>
          <S.Actions>
            <S.PrimaryCta to="/cadastro">
              Iniciar minha jornada
              <ArrowRight aria-hidden="true" size={18} />
            </S.PrimaryCta>
            <S.SecondaryCta to="/biteplaner">Ver página completa</S.SecondaryCta>
          </S.Actions>
        </S.HeroCopy>

        <S.ProductPanel aria-label="Resumo Biteplaner">
          <S.ProductMark aria-hidden="true">
            <Dumbbell size={54} strokeWidth={1.5} />
          </S.ProductMark>
          <S.ProductName>Biteplaner</S.ProductName>
          <S.ProductText>
            Feito sob medida para quem treina, compete e precisa decidir com clareza antes de comprar.
          </S.ProductText>
        </S.ProductPanel>
      </S.Hero>

      <S.HighlightGrid aria-label="Diferenciais do Biteplaner">
        {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
          <S.HighlightCard key={title}>
            <Icon aria-hidden="true" size={30} strokeWidth={1.7} />
            <S.HighlightTitle>{title}</S.HighlightTitle>
            <S.HighlightBody>{body}</S.HighlightBody>
          </S.HighlightCard>
        ))}
      </S.HighlightGrid>
    </S.Page>
  );
}
