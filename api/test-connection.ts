import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check if the backend URL environment variable is set
  if (!process.env.BACKEND_API_URL) {
    return res.status(500).json({
      error: "Server configuration error: BACKEND_API_URL is not set in environment variables"
    });
  }

  const backendUrl = process.env.BACKEND_API_URL;
  
  // Construct the test endpoint URL
  const testUrl = backendUrl.endsWith('/api') || backendUrl.includes('/api/') 
    ? `${backendUrl}/health`
    : `${backendUrl}/api/health`;
  
  console.log(`[Test Connection] Testing connection to: ${testUrl}`);
  
  try {
    // Try to reach the backend
    const response = await axios.get(testUrl, { timeout: 5000 });
    
    return res.status(200).json({
      success: true,
      message: 'Backend connection successful',
      backendResponse: response.data,
      backendUrl: testUrl
    });
  } catch (error: any) {
    // Log detailed error information
    console.error('[Test Connection] Error connecting to backend:', error.message);
    
    if (error.response) {
      console.error('Backend response error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response from backend');
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to backend',
      error: error.message,
      backendUrl: testUrl
    });
  }
}
