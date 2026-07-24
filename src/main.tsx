import { createRoot } from "react-dom/client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import App from "./App.tsx";
import "./index.css";

const reCaptchaKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || "").replace(/['"]/g, "");

if (!reCaptchaKey) {
  console.error(
    "[reCAPTCHA] VITE_RECAPTCHA_SITE_KEY não está definida no .env. " +
      "Reinicie o servidor de desenvolvimento após alterar variáveis de ambiente."
  );
}

createRoot(document.getElementById("root")!).render(
  <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="pt-BR">
    <App />
  </GoogleReCaptchaProvider>
);
