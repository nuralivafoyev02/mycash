import { defineStore } from 'pinia';
import api from '../services/api';
import { ref } from 'vue';

export interface Transaction {
  id: string;
  account_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at?: string;
  accounts?: { name: string };
  [key: string]: any;
}

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTransactions = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/transactions');
      transactions.value = response.data;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while fetching transactions';
    } finally {
      loading.value = false;
    }
  };

  const createTransaction = async (transactionData: Partial<Transaction>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/transactions', transactionData);
      // Let's refetch to get the joined account name, or just push. Refetching is safer for now.
      await fetchTransactions();
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while creating transaction';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    loading.value = true;
    error.value = null;
    try {
      await api.put(`/transactions/${id}`, transactionData);
      await fetchTransactions();
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while updating transaction';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteTransaction = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/transactions/${id}`);
      transactions.value = transactions.value.filter(t => t.id !== id);
      return true;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while deleting transaction';
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
  };
});
