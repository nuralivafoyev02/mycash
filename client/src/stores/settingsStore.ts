import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    currency: localStorage.getItem('currency') || 'UZS',
  }),
  actions: {
    setCurrency(currency: string) {
      this.currency = currency;
      localStorage.setItem('currency', currency);
    }
  }
});
