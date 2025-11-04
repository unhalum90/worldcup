import {useFormatter} from 'next-intl';

type CurrencyCode = string;

/**
 * Centralized helpers around `next-intl` formatters.
 * Keeps date, number, and currency formatting consistent across locales.
 */
export function useI18nFormatters() {
  const formatter = useFormatter();

  return {
    date: (value: Date | number | string, options?: any) =>
      formatter.dateTime(new Date(value), {dateStyle: 'medium', ...options}),
    time: (value: Date | number | string, options?: any) =>
      formatter.dateTime(new Date(value), {timeStyle: 'short', ...options}),
    number: (value: number, options?: any) =>
      formatter.number(value, options),
    currency: (value: number, currency: CurrencyCode = 'USD', options?: any) =>
      formatter.number(value, {style: 'currency', currency, ...options}),
  };
}
