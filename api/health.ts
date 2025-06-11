import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Health check endpoint to verify that the API proxy is working
 * Can be used to check if the environment variables are properly set
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    proxy: {
      isConfigured: Boolean(process.env.BACKEND_API_URL),
      // Don't expose the actual URL for security
      hasBackendUrl: Boolean(process.env.BACKEND_API_URL)
    }
  });
}
