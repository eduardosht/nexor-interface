import * as S from './styles';

const items = [
  ['Individualização', 'Características do usuário e da atividade são consideradas em cada configuração.'],
  ['Função', 'A tecnologia é orientada às demandas funcionais específicas do usuário.'],
  ['Biomecânica', 'Consideramos a relação entre função, musculatura, estruturas ósseas e articulares.'],
  ['Desempenho e controle', 'A literatura investiga relações entre dispositivos, força, desempenho, precisão e equilíbrio postural.'],
];

export function CienciaAplicada() {
  return (
    <S.Section aria-labelledby="ciencia-aplicada-title">
      <S.Inner>
        <S.Heading id="ciencia-aplicada-title">Ciência aplicada ao desenvolvimento</S.Heading>
        <S.Grid>
          {items.map(([title, description]) => (
            <S.Item key={title}><h3>{title}</h3><p>{description}</p></S.Item>
          ))}
        </S.Grid>
      </S.Inner>
    </S.Section>
  );
}
