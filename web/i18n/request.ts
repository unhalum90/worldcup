import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { locales, defaultLocale } from "../i18n";

export default getRequestConfig(async () => {
  // Get locale from cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  const lc = (localeCookie ?? defaultLocale) as (typeof locales)[number];
  const isSupported = (locales as readonly string[]).includes(lc);
  const current = (isSupported ? lc : defaultLocale) as string;

  return {
    locale: current,
    messages: (await import(`../messages/${current}.json`)).default,
  };
});
