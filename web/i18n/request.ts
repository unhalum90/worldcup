import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { locales, defaultLocale } from "../i18n";

// Import all message files explicitly to avoid dynamic import issues with Turbopack
import enMessages from "../messages/en.json";
import esMessages from "../messages/es.json";
import ptMessages from "../messages/pt.json";
import frMessages from "../messages/fr.json";
import arMessages from "../messages/ar.json";
import deMessages from "../messages/de.json";

const messagesMap: Record<string, any> = {
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
  fr: frMessages,
  ar: arMessages,
  de: deMessages,
};

export default getRequestConfig(async () => {
  // Get locale from cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  const lc = (localeCookie ?? defaultLocale) as (typeof locales)[number];
  const isSupported = (locales as readonly string[]).includes(lc);
  const current = (isSupported ? lc : defaultLocale) as string;

  return {
    locale: current,
    messages: messagesMap[current] || messagesMap[defaultLocale],
  };
});
