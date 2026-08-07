import axios from 'axios';
import { supabase } from '../lib/supabase/client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use(async (config) => {
  // Token Supabase (JWT platform — tidak ditulis sendiri)
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
    return config;
  }

  // Fallback ke token Express selama periode migrasi
  const legacyToken = localStorage.getItem('studiva_token');
  if (legacyToken) {
    config.headers.Authorization = `Bearer ${legacyToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('studiva_token');
      // studiva_user sudah dihapus — tidak ada lagi PII plaintext di localStorage
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
