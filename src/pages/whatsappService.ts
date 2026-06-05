/**
 * Serviço de integração com WPPConnect-Server
 * Gerencia sessões e envio de mensagens via REST API
 */

// Em produção, estas variáveis viriam do process.env (Vite) ou de uma tabela de configurações
const API_URL = import.meta.env.VITE_WPP_API_URL || 'http://localhost:21465';
const ADMIN_SECRET_KEY = import.meta.env.VITE_WPP_ADMIN_KEY || 'THISISMYSECURETOKEN';
const DEFAULT_SESSION = 'rh_rede_dmi';

export const whatsappService = {
    /**
     * Gera um token de sessão. O WPPConnect exige isso para autorizar 
     * as chamadas de envio de mensagem.
     */
    async getSessionToken(session: string = DEFAULT_SESSION): Promise<string | null> {
        try {
            const response = await fetch(`${API_URL}/api/${session}/${ADMIN_SECRET_KEY}/generate-token`, {
                method: 'POST',
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data.token; // O token JWT da sessão
        } catch (error) {
            console.error('Erro ao gerar token do WhatsApp:', error);
            return null;
        }
    },

    /**
     * Envia uma mensagem de texto simples
     */
    async sendMessage(phone: string, message: string, session: string = DEFAULT_SESSION) {
        try {
            // 1. Obtém o token de autorização da sessão
            const token = await this.getSessionToken(session);
            if (!token) throw new Error('Não foi possível autorizar a sessão do WhatsApp');

            // 2. Formatação do número (Garante padrão internacional)
            const cleanPhone = phone.replace(/\D/g, "");
            const formattedPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

            // 3. Disparo da mensagem via endpoint de Chat do WPPConnect
            const response = await fetch(`${API_URL}/api/${session}/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phone: formattedPhone,
                    message: message,
                    isGroup: false
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro no servidor WPPConnect');
            }

            return { success: true, data: result };
        } catch (error: any) {
            console.error('WhatsApp Service Error:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Retorna a URL do QR Code para ser exibida em um modal no seu sistema
     */
    getQrCodeUrl(session: string = DEFAULT_SESSION) {
        return `${API_URL}/api/${session}/qrcode-session`;
    }
};