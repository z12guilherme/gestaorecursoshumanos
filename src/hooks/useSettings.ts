import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Settings {
    company_name: string | null;
    cnpj: string | null;
    avatar_url: string | null;
    theme: string | null;
    login_background_url: string | null;
    login_title: string | null;
    login_subtitle: string | null;
}

export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const { data, error } = await supabase.from('settings').select('company_name, cnpj, avatar_url, theme, login_background_url, login_title, login_subtitle').single();
                if (data) {
                    setSettings(data);

                    // 🎨 Aplica o White-label dinamicamente na aba do navegador (index.html)
                    if (data.company_name) {
                        document.title = `${data.company_name} | Portal RH`;
                    }
                    if (data.avatar_url) {
                        const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                        if (favicon) favicon.href = data.avatar_url;
                        const appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
                        if (appleIcon) appleIcon.href = data.avatar_url;
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar configurações:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    return { settings, loading };
}