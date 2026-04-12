import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import { AuthProvider } from '@/providers/auth-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

const SUPPORTED_LOCALES = ['en', 'vi', 'ja'] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

function detectLocaleFromHeader(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return 'en';
  const candidates = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0].trim().toLowerCase());
  for (const lang of candidates) {
    const exact = SUPPORTED_LOCALES.find((l) => l === lang);
    if (exact) return exact;
    const prefix = SUPPORTED_LOCALES.find((l) => lang.startsWith(`${l}-`));
    if (prefix) return prefix;
  }
  return 'en';
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

  let locale: SupportedLocale;
  if (cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
    locale = cookieLocale as SupportedLocale;
  } else {
    const headerStore = await headers();
    locale = detectLocaleFromHeader(headerStore.get('accept-language'));
  }

  const messages = locale === 'en'
    ? (await import('../../messages/en.json')).default
    : locale === 'ja'
      ? (await import('../../messages/ja.json')).default
      : (await import('../../messages/vi.json')).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
