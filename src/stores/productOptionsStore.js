import { defineStore } from 'pinia';
import apiClient from '@/axios';

export const useProductOptionsStore = defineStore('productOptions', {
  state: () => ({
    temperatureOptions: [],
    sizeOptions: [],
    categoryOptions: [],
    availabilityOptions: [],
    stationOptions: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    // Optional: Add getters if you need computed properties
    getTemperatureOptions: (state) => state.temperatureOptions,
    getSizeOptions: (state) => state.sizeOptions,
    getCategoryOptions: (state) => state.categoryOptions,
    getAvailabilityOptions: (state) => state.availabilityOptions,
    getStationOptions: (state) => state.stationOptions,
  },

  actions: {
    async fetchOptions(endpoint) {
      try {
        // const response = await apiClient.get(endpoint, {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        //   },
        // });
        const response = await apiClient.get(endpoint);
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
        const [temps, sizes, categories, availabilities, stations] = await Promise.all([
          this.fetchOptions('/admin/product-temperature-option'),
          this.fetchOptions('/admin/product-size-option'),
          this.fetchOptions('/admin/product-category-option'),
          this.fetchOptions('/admin/product-availability-option'),
          this.fetchOptions('/admin/product-station-option'),
        ]);

        this.temperatureOptions = temps;
        this.sizeOptions = sizes;
        this.categoryOptions = categories;
        this.availabilityOptions = availabilities;
        this.stationOptions = stations;
      } catch (error) {
        this.error = error;
        console.error('Failed to fetch all options:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});