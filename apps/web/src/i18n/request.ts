import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const SUPPORTED_LOCALES = ['en', 'vi', 'ja'] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

function detectLocaleFromHeader(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return 'en';

  // Parse "ja,en-US;q=0.9,en;q=0.8" → ["ja", "en-us", "en"]
  const candidates = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0].trim().toLowerCase());

  for (const lang of candidates) {
    const exact = SUPPORTED_LOCALES.find((l) => l === lang);
    if (exact) return exact;

    // Match prefix: "en-US" → "en", "ja-JP" → "ja"
    const prefix = SUPPORTED_LOCALES.find((l) => lang.startsWith(`${l}-`));
    if (prefix) return prefix;
  }

  return 'en';
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

  let locale: SupportedLocale;

  if (cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
    // User has an explicit preference stored
    locale = cookieLocale as SupportedLocale;
  } else {
    // First visit — detect from browser's Accept-Language header
    const headerStore = await headers();
    locale = detectLocaleFromHeader(headerStore.get('accept-language'));
  }

  const messages = locale === 'en'
    ? (await import('../../messages/en.json')).default
    : locale === 'ja'
      ? (await import('../../messages/ja.json')).default
      : (await import('../../messages/vi.json')).default;

  return { locale, messages };
});
