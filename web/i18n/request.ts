import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "../i18n";

export default getRequestConfig(async ({ locale }) => {
  const lc = (locale ?? defaultLocale) as (typeof locales)[number];
  const isSupported = (locales as readonly string[]).includes(lc);
  const current = (isSupported ? lc : defaultLocale) as string;

  return {
    locale: current,
    messages: (await import(`../messages/${current}.json`)).default,
  };
});
