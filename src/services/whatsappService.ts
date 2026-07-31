import { suriService } from "./suriService";

export const whatsappService = {
  /**
   * Envia uma mensagem de texto via SURI WhatsApp API
   */
  async sendMessage(number: string, message: string) {
    return suriService.sendMessage(number, message);
  },

  /**
   * Envia convite de entrevista para candidato
   */
  async sendInterviewInvite(
    candidateName: string,
    candidatePhone: string,
    jobTitle: string,
    dateFormatted: string,
    locationOrLink: string
  ) {
    return suriService.sendInterviewInvite(
      candidateName,
      candidatePhone,
      jobTitle,
      dateFormatted,
      locationOrLink
    );
  },

  /**
   * Envia atualização de status de vaga para candidato
   */
  async sendCandidateNotification(
    candidateName: string,
    candidatePhone: string,
    jobTitle: string,
    statusText: string
  ) {
    return suriService.sendCandidateNotification(
      candidateName,
      candidatePhone,
      jobTitle,
      statusText
    );
  },
};
