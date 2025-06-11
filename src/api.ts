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
    const response = await api.post('/submit-student', preferences);
    return response.data.success === true;
  } catch (error) {
    console.error('Gagal mengirim ke database:', error);
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