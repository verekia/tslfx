import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  output: 'export',
  webpack: config => {
    config.module.rules.push({ test: /\.(glb)$/, type: 'asset/resource' })
    return config
  },
}

export default nextConfig
