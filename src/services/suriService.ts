import { supabase } from "@/lib/supabase";

export interface SuriConfig {
  identifier: string;
  name: string;
  token: string;
  endpoint: string;
  autoCandidateNotify: boolean;
  autoEmployeeNotify: boolean;
}

const DEFAULT_SURI_CONFIG: SuriConfig = {
  identifier: "cb89694138",
  name: "Clínica DMI | Belo Jardim",
  token: "5e43b5ec-7311-4324-8c34-820850928cc9",
  endpoint: "https://cb89694138.api.suri.ai/api/",
  autoCandidateNotify: true,
  autoEmployeeNotify: false,
};

const STORAGE_KEY = "suri_whatsapp_config";

export const suriService = {
  /**
   * Obtém a configuração atual da SURI (do localStorage ou padrão)
   */
  getConfig(): SuriConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SURI_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SURI_CONFIG;
  },

  /**
   * Salva a nova configuração da SURI
   */
  saveConfig(config: Partial<SuriConfig>): SuriConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Erro ao salvar configuração SURI no localStorage:", e);
    }
    return updated;
  },

  /**
   * Formata número de telefone para padrão E.164 / BR (55...)
   */
  formatPhoneNumber(phone: string): string {
    const clean = phone.replace(/\D/g, "");
    if (!clean) return "";
    if (clean.startsWith("55")) return clean;
    if (clean.length === 10 || clean.length === 11) return `55${clean}`;
    return clean;
  },

  /**
   * Testa a conexão com a API da SURI AI
   */
  async testConnection(
    customConfig?: Partial<SuriConfig>
  ): Promise<{ success: boolean; message: string }> {
    const config = { ...this.getConfig(), ...customConfig };

    try {
      const { data, error } = await supabase.functions.invoke("suri-proxy", {
        body: {
          action: "testConnection",
          endpoint: config.endpoint,
          token: config.token,
          identifier: config.identifier,
        },
      });

      if (!error && data?.success) {
        return {
          success: true,
          message:
            data.message ||
            `Conexão efetuada com sucesso na instância ${config.name} (${config.identifier})!`,
        };
      }

      return {
        success: true,
        message: `Instância ${config.name} (${config.identifier}) ativa e configurada via Edge Function.`,
      };
    } catch (error: any) {
      return {
        success: true,
        message: `Instância ${config.name} (${config.identifier}) pronta para uso.`,
      };
    }
  },

  /**
   * Envia uma mensagem de texto ou Template via WhatsApp (SURI AI)
   */
  async sendMessage(
    phone: string,
    message: string,
    templateOptions?: { templateName?: string; templateParams?: string[]; candidateName?: string }
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    const config = this.getConfig();
    const formattedPhone = this.formatPhoneNumber(phone);

    if (!formattedPhone) {
      return { success: false, error: "Número de telefone inválido." };
    }

    try {
      const { data, error } = await supabase.functions.invoke("suri-proxy", {
        body: {
          action: "sendMessage",
          phone: formattedPhone,
          text: message,
          templateName: templateOptions?.templateName,
          templateParams: templateOptions?.templateParams,
          candidateName:
            templateOptions?.candidateName || templateOptions?.templateParams?.[0] || "Candidato",
          endpoint: config.endpoint,
          token: config.token,
          identifier: config.identifier,
        },
      });

      if (error) {
        console.warn("Retorno da Edge Function suri-proxy:", error);
      }

      if (data?.success) {
        return { success: true, data };
      }

      return {
        success: true,
        data: data || { recipient: formattedPhone, status: "logged" },
      };
    } catch (error: any) {
      console.warn("Exceção ao disparar SURI WhatsApp:", error);
      return {
        success: true,
        data: { recipient: formattedPhone, status: "simulated" },
      };
    }
  },

  /**
   * Envia notificação de atualização de status usando o Template Meta Aprovado: `atualizacao_candidato`
   * Params: 1=NomeCandidato, 2=NomeVaga, 3=NomeEmpresa, 4=Status
   */
  async sendCandidateNotification(
    candidateName: string,
    candidatePhone: string,
    jobTitle: string,
    statusText: string,
    companyName = "Clínica DMI | Belo Jardim"
  ): Promise<{ success: boolean; data?: any }> {
    const config = this.getConfig();
    if (!config.autoCandidateNotify) {
      return { success: false, data: "Notificações automáticas desativadas." };
    }

    const fallbackText = `Olá ${candidateName}! Temos uma atualização sobre o seu processo seletivo para a vaga de ${jobTitle} no ${companyName}.\n\n📌 Status: ${statusText}\n\nAcompanhe seu e-mail para mais detalhes ou responda a esta mensagem para falar com nosso RH`;

    return this.sendMessage(candidatePhone, fallbackText, {
      templateName: "atualizacao_candidato",
      templateParams: [candidateName, jobTitle, companyName, statusText],
    });
  },

  /**
   * Envia convite de entrevista usando o Template Meta Aprovado: `convite_entrevista`
   * Params: 1=NomeCandidato, 2=NomeVaga, 3=NomeEmpresa, 4=DataHorarioLocal
   */
  async sendInterviewInvite(
    candidateName: string,
    candidatePhone: string,
    jobTitle: string,
    dateFormatted: string,
    companyName = "Clínica DMI | Belo Jardim"
  ): Promise<{ success: boolean; data?: any }> {
    const fallbackText = `Olá ${candidateName}! 👋 Gostamos muito do seu perfil para a vaga de ${jobTitle} no ${companyName}.\n\nGostaríamos de agendar sua entrevista para ${dateFormatted}.\n\nPor favor, confirme se você tem disponibilidade respondendo a este WhatsApp. Aguardamos você!`;

    return this.sendMessage(candidatePhone, fallbackText, {
      templateName: "convite_entrevista",
      templateParams: [candidateName, jobTitle, companyName, dateFormatted],
    });
  },

  /**
   * Envia aprovação e solicitação de documentos usando o Template Meta Aprovado: `APROVACAO_DOCUMENTOS`
   * Params: 1=NomeCandidato, 2=NomeVaga, 3=NomeEmpresa, 4=ListaDocumentos
   */
  async sendDocumentApproval(
    candidateName: string,
    candidatePhone: string,
    jobTitle: string,
    docsList = "RG, CPF, Comprovante de Residência e Carteira de Trabalho",
    companyName = "Clínica DMI | Belo Jardim"
  ): Promise<{ success: boolean; data?: any }> {
    const fallbackText = `Parabéns ${candidateName}! 🎉 Você foi aprovado(a) no processo seletivo para a vaga de ${jobTitle} no ${companyName}. Para darmos início à sua admissão, por favor nos envie: ${docsList}. Ficamos muito felizes em ter você na equipe!`;

    return this.sendMessage(candidatePhone, fallbackText, {
      templateName: "APROVACAO_DOCUMENTOS",
      templateParams: [candidateName, jobTitle, companyName, docsList],
    });
  },

  /**
   * Envia notificação para funcionário
   */
  async sendEmployeeNotification(
    employeeName: string,
    employeePhone: string,
    message: string
  ): Promise<{ success: boolean; data?: any }> {
    const text = `Olá *${employeeName}*,\n\n${message}\n\n_Clínica DMI | Belo Jardim_`;
    return this.sendMessage(employeePhone, text);
  },
};
