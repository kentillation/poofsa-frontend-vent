import { defineStore } from 'pinia';
import { PRODUCTS_API } from '@/api/productsApi';

export const useProductsStore = defineStore('products', {
    state: () => ({
        products: [],
        productsOnly: null,
        product_ingredients: '',
        product_history: [],
        productAlone: '',
        loading: false,
        error: null
    }),

    actions: {

        async fetchAllProductsStore(branchId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.fetchAllProductsApi(branchId);
                if (!response?.success) throw new Error(response?.message || 'Failed to fetch products');
                // Ensure reactivity
                if (!Array.isArray(this.products)) this.products = [];
                this.products.splice(0, this.products.length, ...response.data);
            } catch (error) {
                console.error('Error in fetchAllProductsApi:', error);
                this.error = 'Failed to fetch products';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchTotalProductsCountStore(branchId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.fetchTotalProductsCountApi(branchId);
                if (response && response.status === true) {
                    this.productsOnly = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch products');
                }
            } catch (error) {
                console.error('Error in fetchTotalProductsCountApi:', error);
                this.error = error.message || 'Failed to fetch products';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchProductIngredientsStore(productId) {
            this.loading = true;
            this.error = null;
            try {
                if (!PRODUCTS_API || typeof PRODUCTS_API.fetchProductIngredientsApi !== 'function') {
                    throw new Error('PRODUCTS_API service is not properly initialized');
                }
                const response = await PRODUCTS_API.fetchProductIngredientsApi(productId);
                if (response && response.status === true) {
                    this.product_ingredients = response.data;
                } else {
                    throw new Error('Failed to fetch product ingredients');
                }
            } catch (error) {
                console.error(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchProductsHistoryStore(branchId) {
            this.loading = true;
            this.error = null;
            try {
                if (!PRODUCTS_API || typeof PRODUCTS_API.fetchProductsHistoryApi !== 'function') {
                    throw new Error('PRODUCTS_API service is not properly initialized');
                }
                const response = await PRODUCTS_API.fetchProductsHistoryApi(branchId);
                if (response && response.status === true) {
                    this.product_history = response.data;
                } else {
                    throw new Error('Failed to fetch product ingredients');
                }
            } catch (error) {
                console.error(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async saveProductsStore(products) {
            this.loading = true;
            this.error = null;
            try {
                if (!PRODUCTS_API || typeof PRODUCTS_API.saveProductsApi !== 'function') {
                    throw new Error('PRODUCTS_API service is not properly initialized');
                }
                const response = await PRODUCTS_API.saveProductsApi(products);
                if (response && (response.status === true)) {
                    return response;
                } else {
                    throw new Error('Failed to save products');
                }
            } catch (error) {
                console.error('Error in saveProductsApi:', error);
                this.error = 'Failed to save products';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async saveProductIngredientsStore(products) {
            this.loading = true;
            this.error = null;
            try {
                if (!PRODUCTS_API || typeof PRODUCTS_API.saveProductIngredientsApi !== 'function') {
                    throw new Error('PRODUCTS_API service is not properly initialized');
                }
                const response = await PRODUCTS_API.saveProductIngredientsApi(products);
                if (response && (response.status === true)) {
                    return response;
                } else {
                    throw new Error('Failed to save product ingredients');
                }
            } catch (error) {
                console.error('Error in saveProductIngredientsApi:', error);
                this.error = 'Failed to save product ingredients';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateProductStore(product) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.updateProductApi(product);
                const updated = response.data;
                const index = this.products.findIndex(p => p.product_id === updated.product_id);
                if (index !== -1) {
                    this.products.splice(index, 1, updated); // ensures reactivity
                } else {
                    this.products.push(updated);
                }
                return updated;
            } catch (error) {
                this.error = error.message || 'Failed to save product';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateIngredientStore(ingredient) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.updateIngredientApi(ingredient);
                const updated = response.data;
                const index = this.product_ingredients.findIndex(p => p.product_id === updated.product_id);
                if (index !== -1) {
                    this.product_ingredients.splice(index, 1, updated); // ensures reactivity
                } else {
                    this.product_ingredients.push(updated);
                }
                return updated;
            } catch (error) {
                console.error('Error in updateIngredientApi:', error);
                this.error = 'Failed to save ingredient';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});