/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@iarpg/shared', '@iarpg/ui', '@iarpg/db'],
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./node_modules/**/*'],
    },
  },
};

module.exports = nextConfig;
