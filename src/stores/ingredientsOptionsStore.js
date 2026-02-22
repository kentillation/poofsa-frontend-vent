import { defineStore } from 'pinia';
import apiClient from '@/axios';

export const useIngredientsOptionsStore = defineStore('ingredientsOptions', {
  state: () => ({
    ingredientOptions: [],
    unitOption: [],
    availabilityOption: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getIngredientOptions: (state) => state.ingredientOptions,
    getUnitOptions: (state) => state.unitOption,
    getAvailabilityOptions: (state) => state.availabilityOption,
  },

  actions: {
    async fetchOptions(endpoint) {
      try {
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

    async fetchIngredientsOptions() {
      this.isLoading = true;
      try {
        // Fetch all options in parallel (better performance)
        const [ingredients] = await Promise.all([
          this.fetchOptions('/admin/ingredients-name'),
        ]);
        this.ingredientOptions = ingredients;
      } catch (error) {
        this.error = error;
        console.error('Failed to fetch ingredients options:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});