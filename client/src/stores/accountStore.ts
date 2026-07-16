import { defineStore } from 'pinia';
import api from '../services/api';
import { ref } from 'vue';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  created_at?: string;
  [key: string]: any;
}

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAccounts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/accounts');
      // In our new controllers, we return the array directly
      accounts.value = response.data;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while fetching accounts';
    } finally {
      loading.value = false;
    }
  };

  const createAccount = async (accountData: Partial<Account>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/accounts', accountData);
      accounts.value.unshift(response.data);
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while creating account';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateAccount = async (id: string, accountData: Partial<Account>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put(`/accounts/${id}`, accountData);
      const index = accounts.value.findIndex(a => a.id === id);
      if (index !== -1) {
        accounts.value[index] = { ...accounts.value[index], ...response.data };
      }
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while updating account';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteAccount = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/accounts/${id}`);
      accounts.value = accounts.value.filter(a => a.id !== id);
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while deleting account';
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount
  };
});
