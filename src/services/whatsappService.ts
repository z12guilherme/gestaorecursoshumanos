import { supabase } from '@/lib/supabase';

export const whatsappService = {
  /**
   * Envia uma mensagem de texto via Edge Function (Proxy)
   */
  async sendMessage(number: string, message: string) {
    try {
      // Limpa o número (remove caracteres não numéricos)
      const cleanNumber = number.replace(/\D/g, '');
      
      const { data, error } = await supabase.functions.invoke('evolution-proxy', {
        body: { 
          action: 'sendText',
          number: cleanNumber,
          text: message 
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      return { success: false, error };
    }
  },
};