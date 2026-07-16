import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Category {
  id: string;
  name: string;
  type: string;
  inn?: string;
  phone?: string;
  description?: string;
  total_amount: number;
}

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as Category[],
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    incomeCategories: (state) => state.categories.filter(c => c.type === 'income'),
    expenseCategories: (state) => state.categories.filter(c => c.type === 'expense'),
    counterparties: (state) => state.categories.filter(c => c.type === 'counterparty'),
  },
  
  actions: {
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/categories`);
        this.categories = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.error || err.message;
        console.error('Failed to fetch categories:', err);
      } finally {
        this.loading = false;
      }
    },
    
    async createCategory(categoryData: { name: string; type: string; inn?: string; phone?: string; description?: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post(`${API_URL}/categories`, categoryData);
        this.categories.unshift({ ...response.data, total_amount: 0 });
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.error || err.message;
        console.error('Failed to create category:', err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id: string, categoryData: Partial<Category>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.put(`${API_URL}/categories/${id}`, categoryData);
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          this.categories[index] = { ...this.categories[index], ...response.data };
        }
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.error || err.message;
        console.error('Failed to update category:', err);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteCategory(id: string) {
      try {
        await axios.delete(`${API_URL}/categories/${id}`);
        this.categories = this.categories.filter(c => c.id !== id);
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.error || err.message;
        console.error('Failed to delete category:', err);
        return false;
      }
    }
  }
});
