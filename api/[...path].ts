import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check if the backend URL environment variable is set
  if (!process.env.BACKEND_API_URL) {
    return res.status(500).json({
      error: "Server configuration error: BACKEND_API_URL is not set in environment variables"
    });
  }

  const { path } = req.query;
  
  // Construct the path to your actual API
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  // Make sure we include the /api prefix when calling the backend
  const apiUrl = `${process.env.BACKEND_API_URL}/api/${apiPath}`;
  
  // Log request details for debugging
  console.log(`[API Proxy] Forwarding ${req.method} request: ${apiUrl}`);
  console.log(`[API Proxy] Request body:`, req.body);
  
  try {
    // Forward the request to your backend
    const response = await axios({
      method: req.method,
      url: apiUrl,
      data: req.body,
      headers: {
        // Only forward necessary headers
        'Content-Type': 'application/json',
        // Add any auth headers if needed
        ...req.headers.authorization && { 'Authorization': req.headers.authorization as string }
      }
    });
    
    // Log successful response
    console.log(`[API Proxy] Response received:`, {
      status: response.status,
      data: response.data
    });
    
    // Return the response from your backend
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    // Enhanced error handling with logging
    console.error('[API Proxy] Error forwarding request:', error);
    
    if (error.response) {
      console.error('[API Proxy] Backend response error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('[API Proxy] No response received from backend');
    } else {
      console.error('[API Proxy] Request setup error:', error.message);
    }
    
    // Handle errors gracefully
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'Internal server error' };
    return res.status(status).json(data);
  }
}
