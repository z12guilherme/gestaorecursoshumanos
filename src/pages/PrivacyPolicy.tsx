import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Login
        </Link>
        <div className="bg-card p-8 md:p-12 rounded-xl border shadow-sm">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Política de Privacidade</h1>
            <p className="text-sm text-muted-foreground mt-0 mb-8">Última atualização: 29 de Janeiro de 2026</p>

            <div className="text-justify leading-relaxed">
              <h2>1. Introdução</h2>
              <br />
              <p>A GestaoRH Inc. respeita sua privacidade e está comprometida em protegê-la através do nosso cumprimento desta política. Esta política descreve os tipos de informações que podemos coletar de você ou que você pode fornecer ao usar o sistema GestaoRH ("Serviço") e nossas práticas para coletar, usar, manter, proteger e divulgar essas informações.</p>
              <br /><br />
              <h2>2. Informações que Coletamos</h2>
              <br />
              <p>Coletamos vários tipos de informações dos e sobre os usuários do nosso Serviço, incluindo:</p>
              <ul>
                <li><strong>Informações Pessoais:</strong> Nome, e-mail, cargo, departamento, data de admissão e outras informações de RH fornecidas pelo administrador da sua empresa.</li>
                <li><strong>Dados de Uso:</strong> Detalhes de seus acessos e uso do Serviço, incluindo registros de ponto, solicitações de férias e interações com as funcionalidades.</li>
                <li><strong>Informações Técnicas:</strong> Endereço IP, tipo de navegador e informações do dispositivo.</li>
              </ul>
              <br /><br />
              <h2>3. Como Usamos Suas Informações</h2>
              <br />
              <p>Usamos as informações que coletamos sobre você ou que você nos fornece para:</p>
              <ul>
                <li>Apresentar nosso Serviço e seu conteúdo a você.</li>
                <li>Fornecer as funcionalidades principais do sistema de RH, como folha de pagamento, controle de ponto e gestão de benefícios.</li>
                <li>Notificá-lo sobre alterações em nosso Serviço ou quaisquer produtos ou serviços que oferecemos.</li>
                <li>Para qualquer outro propósito com o seu consentimento.</li>
              </ul>
              <br /><br />
              <h2>4. Divulgação de Suas Informações</h2>
              <br />
              <p>Não vendemos, alugamos ou trocamos suas informações pessoais com terceiros para fins de marketing. Podemos divulgar informações agregadas sobre nossos usuários sem restrição.</p>
              <br /><br />
              <h2>5. Segurança dos Dados</h2>
              <br />
              <p>Implementamos medidas projetadas para proteger suas informações pessoais contra perda acidental e acesso, uso, alteração e divulgação não autorizados. A segurança e a proteção de suas informações também dependem de você. Onde lhe demos (ou onde você escolheu) uma senha para acesso a certas partes do nosso Serviço, você é responsável por manter esta senha confidencial.</p>
              <br /><br />
              <h2>6. Contato</h2>
              <br />
              <p>Para fazer perguntas ou comentar sobre esta política de privacidade e nossas práticas de privacidade, entre em contato conosco em <a href="mailto:privacidade@gestaorh.com" className="text-primary hover:underline">contato@inovedev.com.br</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}