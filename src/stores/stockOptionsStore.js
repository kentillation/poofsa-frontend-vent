import { defineStore } from 'pinia';
import apiClient from '@/axios';

export const useStockOptionsStore = defineStore('stockOptions', {
  state: () => ({
    unitOption: [],
    availabilityOption: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    // Optional: Add getters if you need computed properties
    getTemperatureOptions: (state) => state.unitOption,
    getSizeOptions: (state) => state.availabilityOption,
  },

  actions: {
    async fetchOptions(endpoint) {
      try {
        const response = await apiClient.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
        return response.data;
      } catch (error) {
        this.error = error;
        console.error(`Failed to fetch options from ${endpoint}:`, error);
        throw error;
      }
    },

    async fetchAllOptions() {
      this.isLoading = true;
      try {
        // Fetch all options in parallel (better performance)
        const [units, availabilities] = await Promise.all([
          this.fetchOptions('/admin/stock-unit-option'),
          this.fetchOptions('/admin/product-availability-option'),
        ]);
        this.unitOption = units;
        this.availabilityOption = availabilities;
      } catch (error) {
        this.error = error;
        console.error('Failed to fetch all options:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});