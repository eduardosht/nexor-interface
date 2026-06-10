import { Brush, CircleAlert, Hand, PackageCheck, ShieldCheck, Sun, ThermometerSun } from 'lucide-react';
import * as S from './styles';

const CARE_ITEMS = [
  {
    icon: Hand,
    title: 'Lugar de protetor bucal é em boca',
    body: 'Evite ficar brincando ou mastigando o protetor. Além de reduzir a vida útil, o traumatismo pode acontecer justamente nesses curtos momentos sem proteção.',
  },
  {
    icon: ThermometerSun,
    title: 'Não lavar em água quente',
    body: 'Água quente, chuveiro de vestiário e tentativas de esterilização podem deformar o protetor.',
  },
  {
    icon: Sun,
    title: 'Não deixe o protetor sob o sol',
    body: 'Evite painel do carro, banco de reservas, grama ou exposição junto ao capacete.',
  },
  {
    icon: PackageCheck,
    title: 'Guarde sempre seu protetor na caixinha',
    body: 'Não deixe o protetor solto na mochila, dentro da meia ou em locais onde ele possa amassar e deformar.',
  },
  {
    icon: Brush,
    title: 'Higienize com água limpa e escova',
    body: 'Evite cremes dentais abrasivos, que podem desgastar a superfície do dispositivo.',
  },
  {
    icon: ShieldCheck,
    title: 'Nunca compartilhe seu protetor',
    body: 'O uso do protetor bucal é individual e não deve ser dividido com outros atletas.',
  },
];

const USE_NOTES = [
  'O protetor bucal esportivo não deve ser utilizado para dormir.',
  'Placas noturnas não devem ser usadas como protetores esportivos, e protetores esportivos não substituem placas noturnas.',
  'Durante jogo ou treino, evite guardar o protetor na meia, calção ou top para depois colocá-lo novamente na boca.',
  'Mantenha o protetor em local seguro quando estiver fora da boca.',
];

export function ConhecaOBiteplaner() {
  return (
    <S.Page id="main-content" tabIndex={-1}>
      <S.Hero>
        <S.HeroCopy>
          <S.Eyebrow>Guia de cuidado e uso</S.Eyebrow>
          <S.Title>Cuidados com o protetor bucal esportivo</S.Title>
          <S.Lead>
            Você está recebendo o seu protetor bucal esportivo. Cuidar bem dele é parte do cuidado com a sua segurança,
            conforto e desempenho durante treinos e competições.
          </S.Lead>
        </S.HeroCopy>
      </S.Hero>

      <S.ContentShell>
        <S.IntroPanel>
          <S.SectionTitle>Cuidados essenciais</S.SectionTitle>
          <S.SectionLead>
            As orientações abaixo ajudam a preservar a forma, a higiene e a função do protetor no uso esportivo.
          </S.SectionLead>
        </S.IntroPanel>

        <S.CareGrid aria-label="Cuidados essenciais com o protetor bucal">
          {CARE_ITEMS.map(({ icon: Icon, title, body }) => (
            <S.CareItem key={title}>
              <S.CareIcon>
                <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
              </S.CareIcon>
              <div>
                <S.CareTitle>{title}</S.CareTitle>
                <S.CareBody>{body}</S.CareBody>
              </div>
            </S.CareItem>
          ))}
        </S.CareGrid>

        <S.InfoBand>
          <S.InfoCopy>
            <S.SectionTitle>Uso correto durante a rotina esportiva</S.SectionTitle>
            <S.NoteList>
              {USE_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </S.NoteList>
          </S.InfoCopy>
        </S.InfoBand>

        <S.FinalNote>
          <CircleAlert aria-hidden="true" size={24} strokeWidth={1.8} />
          <div>
            <S.FinalTitle>Protetor bucal não é eterno</S.FinalTitle>
            <S.FinalText>
              Seguir as orientações prolonga a vida útil do protetor, mas a substituição pode ser necessária com o
              tempo. O cirurgião-dentista deve avaliar o momento adequado de troca. Pequenas bolhas podem aparecer e
              são naturais da última etapa de produção, essencial para a absorção de impactos.
            </S.FinalText>
          </div>
        </S.FinalNote>
      </S.ContentShell>
    </S.Page>
  );
}
