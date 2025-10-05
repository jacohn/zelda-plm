/** @type {import('next').NextConfig} */
const isGh = process.env.GITHUB_PAGES === 'true'
const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1]
const base = isGh && repo ? `/${repo}` : ''

export default {
  experimental: { appDir: true },
  output: 'export',
  trailingSlash: true,
  basePath: base,
  assetPrefix: base ? `${base}/` : undefined,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: base,
  },
}
