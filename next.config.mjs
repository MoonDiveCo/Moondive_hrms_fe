/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'moondive-bucket-s3.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hrms-bucket-s3.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      }
    ]
  }
};

export default nextConfig;
