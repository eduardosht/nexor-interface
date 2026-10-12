import * as S from './styles';

export function Evolucao() {
  return (
    <S.Section aria-labelledby="evolucao-title">
      <S.Inner>
        <S.Title id="evolucao-title">Evolução tecnológica contínua</S.Title>
        <S.Steps>
          <li><strong>Desenvolvimento</strong>Pesquisa e definição de parâmetros.</li>
          <li><strong>Validação</strong>Avaliação progressiva da tecnologia.</li>
          <li><strong>Documentação</strong>Registro do processo e dos aprendizados.</li>
          <li><strong>Evolução</strong>Aperfeiçoamento técnico contínuo.</li>
        </S.Steps>
      </S.Inner>
    </S.Section>
  );
}
