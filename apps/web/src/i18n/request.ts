import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? process.env.APP_LOCALE ?? 'vi';
  const messages = locale === 'en'
    ? (await import('../../messages/en.json')).default
    : (await import('../../messages/vi.json')).default;
  return { locale, messages };
});
