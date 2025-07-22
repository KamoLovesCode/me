/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize for static export
  experimental: {
    optimizeCss: true,
  },
  // Add base path if deploying to GitHub Pages subdirectory
  // basePath: '/portfolio',
  // assetPrefix: '/portfolio/',
}

export default nextConfig
