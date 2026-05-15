import {
  LegalBody,
  LegalContainer,
  LegalList,
  LegalPage,
  LegalSection,
  LegalSectionTitle,
  LegalTitle,
  LegalUpdatedAt
} from '../Legal/styles';

export function Termos() {
  return (
    <LegalPage>
      <LegalContainer>
        <LegalTitle>Termos de Uso</LegalTitle>
        <LegalUpdatedAt>Última atualização: abril de 2026</LegalUpdatedAt>
        <LegalSection>
          <LegalSectionTitle>1. Objeto</LegalSectionTitle>
          <LegalBody>
            Este site institucional da Nexor e a camada de conta do ecossistema Nexor possuem caráter informativo e
            operacional. O acesso e uso da plataforma implica a aceitação integral destes Termos de Uso.
          </LegalBody>
          <LegalBody>
            As informações aqui veiculadas não constituem oferta vinculante de produtos ou serviços, e a disponibilidade
            de funcionalidades pode evoluir ao longo do tempo.
          </LegalBody>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>2. Uso permitido</LegalSectionTitle>
          <LegalBody>O site e a conta Nexor destinam-se a:</LegalBody>
          <LegalList>
            <li>Navegação e consulta de informações institucionais sobre a Nexor e seus produtos.</li>
            <li>Cadastro, autenticação e gerenciamento da conta central do ecossistema Nexor.</li>
            <li>Contato comercial e solicitações de informações.</li>
          </LegalList>
          <LegalBody>
            É vedado utilizar a plataforma para fins ilícitos, difamatórios, fraudulentos ou que violem direitos de terceiros.
          </LegalBody>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>3. Propriedade intelectual</LegalSectionTitle>
          <LegalBody>
            Todo o conteúdo disponível neste site, incluindo textos, imagens, logotipos, ícones, design e código-fonte,
            é de propriedade exclusiva da Nexor ou de seus licenciantes e está protegido pela legislação brasileira de
            propriedade intelectual.
          </LegalBody>
          <LegalBody>
            É proibida a reprodução, distribuição ou modificação de qualquer conteúdo sem autorização prévia e expressa por escrito.
          </LegalBody>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>4. Comunicações da conta e informativos</LegalSectionTitle>
          <LegalBody>
            Ao criar uma conta Nexor, o usuário concorda em receber comunicações essenciais para a operação da conta e
            dos produtos relacionados, incluindo confirmação de cadastro, verificação de e-mail, recuperação de senha,
            alertas de segurança, avisos operacionais e mensagens necessárias para a prestáção do serviço.
          </LegalBody>
          <LegalBody>
            O envio de newsletters e de comunicações promocionais, comerciais ou educativas por e-mail depende de
            consentimento específico é opcional do usuário, que poderá ser revogado a qualquer momento pelos canais
            informados pela Nexor.
          </LegalBody>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>5. Isenção de responsabilidade</LegalSectionTitle>
          <LegalBody>
            As informações deste site são fornecidas no estado em que se encontram e podem ser alteradas a qualquer momento
            sem aviso prévio. A Nexor não garante a completude ou atualidade de todo o conteúdo públicado.
          </LegalBody>
          <LegalBody>
            Links para sites de terceiros são fornecidos por conveniência. A Nexor não se responsabiliza pelo conteúdo ou
            práticas de privacidade desses sites.
          </LegalBody>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>6. Lei aplicável e foro</LegalSectionTitle>
          <LegalBody>
            Estes Termos são regidos pela legislação brasileira. Quaisquer disputas serão dirimidas no foro da comarca de
            [cidade], Estado de [estado], com renúncia expressa a qualquer outro, por mais privilegiado que seja.
          </LegalBody>
        </LegalSection>
      </LegalContainer>
    </LegalPage>
  );
}
