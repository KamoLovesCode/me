/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  basePath: '',
  assetPrefix: '',
};

export default nextConfig;
