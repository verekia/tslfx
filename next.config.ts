import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',
  webpack: (config) => {
    config.module.rules.push({ test: /\.(glb)$/, type: 'asset/resource' })
    return config
  },
}

export default nextConfig
