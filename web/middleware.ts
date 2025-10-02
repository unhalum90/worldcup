import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "never",
  localeDetection: true,
});

export const config = {
  // Temporarily disable middleware to diagnose 404s
  matcher: [],
};
