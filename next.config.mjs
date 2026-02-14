/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
};

export default nextConfig;
