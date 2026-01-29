import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Login
        </Link>
        <div className="bg-card p-8 md:p-12 rounded-xl border shadow-sm">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Termos de Serviço</h1>
            <p className="text-sm text-muted-foreground mt-0 mb-8">Última atualização: 29 de Janeiro de 2026</p>
          
            <div className="text-justify leading-relaxed">
              <h2>1. Aceitação dos Termos</h2>
              <br />
              <p>Ao acessar e usar o sistema GestaoRH ("Serviço"), você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concorda com estes termos, não use o Serviço.</p>
              <br /><br />

              <h2>2. Descrição do Serviço</h2>
              <br />
              <p>O GestaoRH é um sistema de gerenciamento de recursos humanos que oferece funcionalidades como controle de ponto, gestão de férias, recrutamento e outras ferramentas para otimizar os processos de RH.</p>
              <br /><br />

              <h2>3. Contas de Usuário</h2>
              <br />
              <p>Para acessar a maioria das funcionalidades do Serviço, você deve ser um usuário autorizado com uma conta fornecida pelo administrador da sua empresa. Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as atividades que ocorrem em sua conta.</p>
              <br /><br />

              <h2>4. Uso Aceitável</h2>
              <br />
              <p>Você concorda em não usar o Serviço para violar qualquer lei ou regulamento aplicável ou para transmitir dados ilegais, abusivos ou que infrinjam a privacidade de terceiros.</p>
              <br /><br />

              <h2>5. Propriedade Intelectual</h2>
              <br />
              <p>O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva da GestaoRH Inc. e de seus licenciadores.</p>
              <br /><br />

              <h2>6. Rescisão</h2>
              <br />
              <p>Podemos rescindir ou suspender seu acesso ao nosso Serviço imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.</p>
              <br /><br />

              <h2>7. Limitação de Responsabilidade</h2>
              <br />
              <p>Em nenhuma circunstância a GestaoRH Inc. será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do seu acesso ou uso do Serviço.</p>
              <br /><br />

              <h2>8. Alterações nos Termos</h2>
              <br />
              <p>Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Notificaremos sobre quaisquer alterações publicando os novos Termos de Serviço nesta página.</p>
              <br /><br />

              <h2>9. Contato</h2>
              <br />
              <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em <a href="mailto:suporte@gestaorh.com" className="text-primary hover:underline">suporte@gestaorh.com</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}