import { defineStore } from 'pinia';
import api from '../services/api';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from './userStore';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  const login = async (email: string, password?: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token: authToken, user: userData } = response.data;
      
      token.value = authToken;
      user.value = userData;
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.response?.data?.error || err.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    router.push('/login');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user.value) return false;
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.put(`/users/${user.value.id}`, updates);
      user.value = { ...user.value, ...response.data };
      localStorage.setItem('user', JSON.stringify(user.value));
      return true;
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      error.value = err.response?.data?.error || err.message || 'Update failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    updateProfile
  };
});
