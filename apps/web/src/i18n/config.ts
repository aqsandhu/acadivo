import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

import en from "./locales/en.json";
import ur from "./locales/ur.json";

export const supportedLanguages = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ur", name: "اردو", dir: "rtl" },
];

export const defaultLanguage = "en";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    fallbackLng: defaultLanguage,
    supportedLngs: supportedLanguages.map((l) => l.code),
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "acadivo-language",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
