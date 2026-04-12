import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const resolved = (await requestLocale) ?? process.env.APP_LOCALE ?? 'vi';
  const locale = (cookieLocale === 'en' || cookieLocale === 'vi') ? cookieLocale : resolved;
  const messages = locale === 'en'
    ? (await import('../../messages/en.json')).default
    : (await import('../../messages/vi.json')).default;
  return { locale, messages };
});
