import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@i-factory/ui', '@i-factory/utils', '@i-factory/api-types'],
};

export default withNextIntl(nextConfig);
