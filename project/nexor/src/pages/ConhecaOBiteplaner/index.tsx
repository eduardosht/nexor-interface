import * as S from './styles';

const GUIDE_LINKS = [
  { href: '#visao-geral', label: 'Visão geral' },
  { href: '#cuidados-essenciais', label: 'Cuidados essenciais' },
  { href: '#rotina-esportiva', label: 'Rotina esportiva' },
  { href: '#referencia-rapida', label: 'Referência rápida' },
  { href: '#substituicao', label: 'Substituição' },
];

const CARE_ITEMS = [
  {
    title: 'Lugar de biteplaner é em boca',
    body: 'Evite ficar brincando ou mastigando o dispositivo. Além de reduzir a vida útil, o traumatismo pode acontecer justamente nesses curtos momentos sem proteção.',
  },
  {
    title: 'Não lavar em água quente',
    body: 'Água quente, chuveiro de vestiário e tentativas de esterilização podem deformar o dispositivo.',
  },
  {
    title: 'Não deixe o dispositivo sob o sol',
    body: 'Evite painel do carro, banco de reservas, grama ou exposição junto ao capacete.',
  },
  {
    title: 'Guarde sempre seu dispositivo na caixinha',
    body: 'Não deixe o dispositivo solto na mochila, dentro da meia ou em locais onde ele possa amassar e deformar.',
  },
  {
    title: 'Higienize com água limpa e escova',
    body: 'Evite cremes dentais abrasivos, que podem desgastar a superfície do dispositivo.',
  },
  {
    title: 'Nunca compartilhe seu dispositivo',
    body: 'O uso do biteplaner é individual e não deve ser dividido com outros atletas.',
  },
];

const USE_NOTES = [
  'O biteplaner esportivo não deve ser utilizado para dormir.',
  'Placas noturnas não devem ser usadas como o dispositivo biteplaner, e o biteplaner não substituem placas noturnas.',
  'Durante jogo ou treino, evite guardar o dispositivo na meia, calção ou top para depois colocá-lo novamente na boca.',
  'Mantenha o dispositivo em local seguro quando estiver fora da boca.',
];

const QUICK_REFERENCE = [
  {
    situation: 'Após o uso',
    orientation: 'Lave com água limpa, use escova macia e seque antes de guardar.',
  },
  {
    situation: 'Durante treinos e jogos',
    orientation: 'Use o dispositivo na boca e guarde na caixa quando precisar remover.',
  },
  {
    situation: 'Transporte',
    orientation: 'Evite mochila, meia, calção ou top sem a caixa de proteção.',
  },
  {
    situation: 'Calor',
    orientation: 'Mantenha longe de água quente, sol, carro fechado e fontes de calor.',
  },
];

export function ConhecaOBiteplaner() {
  return (
    <S.Page id="main-content" tabIndex={-1}>
      <S.Header>
        <S.HeaderInner>
          <S.Kicker>Guia de cuidado e uso</S.Kicker>
          <S.Title>Cuidados com o biteplaner esportivo</S.Title>
          <S.Lead>
            Orientações objetivas para preservar a forma, a higiene e a função do seu dispositivo durante treinos e
            competições.
          </S.Lead>
        </S.HeaderInner>
      </S.Header>

      <S.Layout>
        <S.Sidebar aria-label="Seções do guia">
          <S.SidebarTitle>Nesta página</S.SidebarTitle>
          <S.SidebarList>
            {GUIDE_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </S.SidebarList>
        </S.Sidebar>

        <S.Article>
          <S.Section id="visao-geral">
            <S.SectionTitle>Visão geral</S.SectionTitle>
            <S.Paragraph>
              O biteplaner esportivo foi produzido para uso individual em atividade esportiva. Ele deve permanecer
              em boas condições de encaixe, higiene e armazenamento para continuar cumprindo sua função.
            </S.Paragraph>
          </S.Section>

          <S.Section id="cuidados-essenciais">
            <S.SectionTitle>Cuidados essenciais</S.SectionTitle>
            <S.DefinitionList>
              {CARE_ITEMS.map((item) => (
                <S.DefinitionItem key={item.title}>
                  <dt>{item.title}</dt>
                  <dd>{item.body}</dd>
                </S.DefinitionItem>
              ))}
            </S.DefinitionList>
          </S.Section>

          <S.Section id="rotina-esportiva">
            <S.SectionTitle>Uso correto durante a rotina esportiva</S.SectionTitle>
            <S.NoteList>
              {USE_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </S.NoteList>
          </S.Section>

          <S.Section id="referencia-rapida">
            <S.SectionTitle>Referência rápida</S.SectionTitle>
            <S.Table aria-label="Referência rápida de uso">
              <thead>
                <tr>
                  <th>Situação</th>
                  <th>Orientação</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_REFERENCE.map((row) => (
                  <tr key={row.situation}>
                    <td>{row.situation}</td>
                    <td>{row.orientation}</td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
          </S.Section>

          <S.Section id="substituicao">
            <S.SectionTitle>Biteplaner não é eterno</S.SectionTitle>
            <S.Paragraph>
              Seguir as orientações prolonga a vida útil do dispositivo, mas a substituição pode ser necessária com o
              tempo. O cirurgião-dentista deve avaliar o momento adequado de troca.
            </S.Paragraph>
          </S.Section>
        </S.Article>
      </S.Layout>
    </S.Page>
  );
}
