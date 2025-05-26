import type { StudentPreferences } from './types';
import axios from 'axios';

export const savePreferencesToDatabase = async (preferences: StudentPreferences): Promise<boolean> => {
  const api = import.meta.env.VITE_API_URL;

  try {
    const response = await axios.post(`${api}/submit`, preferences, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.success === true;
  } catch (error) {
    console.error('Gagal mengirim ke database:', error);
    return false;
  }
};