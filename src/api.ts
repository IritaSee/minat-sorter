import type { StudentPreferences } from './types';
import axios from 'axios';

// Use environment-aware API URL
const isProduction = import.meta.env.PROD;

// For production: uses the relative /api path which goes to our Vercel proxy function
// For development: uses the direct backend URL from env
const BASE_URL = isProduction ? '/api' : import.meta.env.VITE_API_URL;

// Log the API base URL being used (helpful for debugging)
console.log(`API configured with base URL: ${isProduction ? '/api (proxy)' : BASE_URL}`);

// Check if we're missing the API URL in development mode
if (!isProduction && !import.meta.env.VITE_API_URL) {
  console.warn('Warning: VITE_API_URL is not set in development environment');
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add reasonable timeout
  timeout: 10000
});

export const savePreferencesToDatabase = async (preferences: StudentPreferences): Promise<boolean> => {
  try {
    // Log the complete URL that will be used for the request
    const requestUrl = `${BASE_URL}/submit-student`;
    console.log('Sending data to:', requestUrl);
    console.log('Request payload:', JSON.stringify(preferences, null, 2));
    
    const response = await api.post('/submit-student', preferences);
    console.log('Response received:', response.data);
    return response.data.success === true;
  } catch (error: any) {
    console.error('Gagal mengirim ke database:', error);
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    return false;
  }
};

// Student API methods
export const getStudents = async () => {
  try {
    const response = await api.get('/students');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch students');
  }
};

export const getStudentById = async (id: string) => {
  try {
    const response = await api.get(`/students/${id}/references`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch student with ID ${id}:`, error);
    throw new Error(error instanceof Error ? error.message : `Failed to fetch student with ID ${id}`);
  }
};

export default api;