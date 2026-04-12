import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = (cookieLocale === 'en' || cookieLocale === 'vi')
    ? cookieLocale
    : (process.env.APP_LOCALE ?? 'vi');
  const messages = locale === 'en'
    ? (await import('../../messages/en.json')).default
    : (await import('../../messages/vi.json')).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
