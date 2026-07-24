import { createRoot } from "react-dom/client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import App from "./App.tsx";
import "./index.css";

const reCaptchaKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || "").replace(/['"]/g, "");

createRoot(document.getElementById("root")!).render(
  <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="pt-BR">
    <App />
  </GoogleReCaptchaProvider>
);
