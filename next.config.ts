import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    '172.16.14.162',
    'http://172.16.14.162:3000',
    'http://172.16.14.162',
  ],
  // Configuración para permitir archivos grandes en API routes (App Router)
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
};

export default withFlowbiteReact(nextConfig);