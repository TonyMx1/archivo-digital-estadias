import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    '172.16.14.162',
    'http://172.16.14.162:3000',
    'http://172.16.14.162',
  ],
};

export default nextConfig;
