export const locales = ["en", "fr", "es", "pt", "de", "ar"] as const;
export type Locale = typeof locales[number];

// Active locales shown in the language switcher
export const activeLocales = ["en", "es", "pt"] as const;

export const defaultLocale: Locale = "en";
