import { DEFAULT_APP_NAME } from "@/lib/branding";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Política de Privacidade" lastUpdated="29 de Janeiro de 2026">
      <h2>1. Introdução</h2>
      <br />
      <p>
        O titular licenciado respeita sua privacidade e está comprometido em protegê-la através do
        cumprimento desta política. Esta política descreve os tipos de informações que podem ser
        coletadas ao usar o sistema {DEFAULT_APP_NAME} ("Serviço") e as práticas para coletar, usar,
        manter, proteger e divulgar essas informações.
      </p>
      <br />
      <br />
      <h2>2. Informações que Coletamos</h2>
      <br />
      <p>
        Coletamos vários tipos de informações dos e sobre os usuários do nosso Serviço, incluindo:
      </p>
      <ul>
        <li>
          <strong>Informações Pessoais:</strong> Nome, e-mail, cargo, departamento, data de admissão
          e outras informações de RH fornecidas pelo administrador da sua empresa.
        </li>
        <li>
          <strong>Dados de Uso:</strong> Detalhes de seus acessos e uso do Serviço, incluindo
          registros de ponto, solicitações de férias e interações com as funcionalidades.
        </li>
        <li>
          <strong>Informações Técnicas:</strong> Endereço IP, tipo de navegador e informações do
          dispositivo.
        </li>
      </ul>
      <br />
      <br />
      <h2>3. Como Usamos Suas Informações</h2>
      <br />
      <p>Usamos as informações que coletamos sobre você ou que você nos fornece para:</p>
      <ul>
        <li>Apresentar nosso Serviço e seu conteúdo a você.</li>
        <li>
          Fornecer as funcionalidades principais do sistema de RH, como folha de pagamento, controle
          de ponto e gestão de benefícios.
        </li>
        <li>
          Notificá-lo sobre alterações em nosso Serviço ou quaisquer produtos ou serviços que
          oferecemos.
        </li>
        <li>Para qualquer outro propósito com o seu consentimento.</li>
      </ul>
      <br />
      <br />
      <h2>4. Divulgação de Suas Informações</h2>
      <br />
      <p>
        Não vendemos, alugamos ou trocamos suas informações pessoais com terceiros para fins de
        marketing. Podemos divulgar informações agregadas sobre nossos usuários sem restrição.
      </p>
      <br />
      <br />
      <h2>5. Segurança dos Dados</h2>
      <br />
      <p>
        Implementamos medidas projetadas para proteger suas informações pessoais contra perda
        acidental e acesso, uso, alteração e divulgação não autorizados. A segurança e a proteção de
        suas informações também dependem de você. Onde lhe demos (ou onde você escolheu) uma senha
        para acesso a certas partes do nosso Serviço, você é responsável por manter esta senha
        confidencial.
      </p>
      <br />
      <br />
      <h2>6. Contato</h2>
      <br />
      <p>
        Para fazer perguntas ou comentar sobre esta política de privacidade, entre em contato com o
        administrador do sistema para obter os canais oficiais de contato.
      </p>
    </LegalPageLayout>
  );
}
