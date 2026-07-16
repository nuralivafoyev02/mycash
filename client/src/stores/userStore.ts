import { defineStore } from 'pinia';
import api from '../services/api';
import { ref } from 'vue';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  [key: string]: any;
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/users');
      users.value = response.data;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while fetching users';
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData: Partial<User>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/users', userData);
      users.value.unshift(response.data);
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while creating user';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put(`/users/${id}`, userData);
      const index = users.value.findIndex(u => u.id === id);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...response.data };
      }
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while updating user';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/users/${id}`);
      users.value = users.value.filter(u => u.id !== id);
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while deleting user';
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
});
