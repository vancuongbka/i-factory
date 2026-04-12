import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = process.env.APP_LOCALE ?? 'en';
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
