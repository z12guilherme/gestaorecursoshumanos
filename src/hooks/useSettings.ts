import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { mockDatabase, USE_MOCK } from "@/lib/mockDatabase";
import { buildAppTitle, DEFAULT_APP_NAME } from "@/lib/branding";

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
        // 🔀 Desvio Offline (Mock)
        if (USE_MOCK) {
          const data = mockDatabase.get("settings");
          // settings é um objeto único, não array
          const settingsData = Array.isArray(data) ? data[0] : data;
          if (settingsData) {
            setSettings(settingsData);
            document.title = buildAppTitle(settingsData.company_name);

            // Atualiza o manifesto PWA dinamicamente
            const companyName = settingsData.company_name || DEFAULT_APP_NAME;
            const companyLogo = settingsData.avatar_url;
            const manifest = {
              name: companyName,
              short_name: companyName,
              description: "Sistema de Gestão de Recursos Humanos",
              start_url: "/",
              display: "standalone",
              background_color: "#ffffff",
              theme_color: "#007bff",
              icons: [
                {
                  src: companyLogo || "/icon-192.png",
                  sizes: "192x192",
                  type: "image/png",
                  purpose: "any maskable",
                },
                {
                  src: companyLogo || "/icon-512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "any maskable",
                },
              ],
            };
            const manifestJSON = JSON.stringify(manifest);
            const blob = new Blob([manifestJSON], { type: "application/json" });
            const manifestURL = URL.createObjectURL(blob);
            const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
            if (manifestLink) {
              manifestLink.href = manifestURL;
            }
          }
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("settings")
          .select(
            "company_name, cnpj, avatar_url, theme, login_background_url, login_title, login_subtitle"
          )
          .single();
        if (data) {
          setSettings(data);

          // 🎨 Aplica o White-label dinamicamente
          // Título inicial (será sobrescrito pelo AppLayout em cada página)
          document.title = buildAppTitle(data.company_name);

          const companyName = data.company_name || DEFAULT_APP_NAME;
          const companyLogo = data.avatar_url;

          // Favicon e Apple Touch Icon
          if (companyLogo) {
            const updateIcon = (rel: string, href: string) => {
              let link: HTMLLinkElement | null = document.querySelector(`link[rel='${rel}']`);
              if (!link) {
                link = document.createElement("link");
                link.rel = rel;
                document.head.appendChild(link);
              }
              link.href = href;
            };
            updateIcon("icon", companyLogo);
            updateIcon("apple-touch-icon", companyLogo);
          }

          // Manifesto PWA dinâmico
          const manifest = {
            name: companyName,
            short_name: companyName,
            description: "Sistema de Gestão de Recursos Humanos",
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#007bff", // Pode ser dinâmico também se houver no settings
            icons: [
              {
                src: companyLogo || "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any maskable",
              },
              {
                src: companyLogo || "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable",
              },
            ],
          };

          const manifestJSON = JSON.stringify(manifest);
          const blob = new Blob([manifestJSON], { type: "application/json" });
          const manifestURL = URL.createObjectURL(blob);
          const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
          if (manifestLink) {
            manifestLink.href = manifestURL;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  return { settings, loading };
}
