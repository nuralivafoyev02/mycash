import { defineStore } from 'pinia';
import api from '../services/api';
import { ref } from 'vue';

export interface Company {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  [key: string]: any;
}

export const useCompanyStore = defineStore('company', () => {
  const companies = ref<Company[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCompanies = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/companies');
      if (response.data.status === 'success') {
        companies.value = response.data.data;
      } else {
        error.value = 'Failed to fetch companies';
      }
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while fetching companies';
    } finally {
      loading.value = false;
    }
  };

  const createCompany = async (companyData: Partial<Company>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/companies', companyData);
      if (response.data.status === 'success') {
        companies.value.push(response.data.data);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while creating company';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateCompany = async (id: string, companyData: Partial<Company>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put(`/companies/${id}`, companyData);
      if (response.data.status === 'success') {
        const index = companies.value.findIndex(c => c.id === id);
        if (index !== -1) {
          companies.value[index] = response.data.data;
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while updating company';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteCompany = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.delete(`/companies/${id}`);
      if (response.data.status === 'success') {
        companies.value = companies.value.filter(c => c.id !== id);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      error.value = err.message || 'An error occurred while deleting company';
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany
  };
});
