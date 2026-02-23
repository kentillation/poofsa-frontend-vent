import { defineStore } from 'pinia';
import { PRODUCTS_API } from '@/api/productsApi';

export const useProductsStore = defineStore('products', {
    state: () => ({
        products: [],
        productsOnly: null,
        productItems: [],
        product_history: [],
        productAlone: '',
        total: 0,
        loading: false,
        error: null,
        lastFetch: null
    }),

    getters: {
        // Safe getters with fallbacks
        hasProducts: (state) => state.products.length > 0,
        isEmpty: (state) => state.products.length === 0 && !state.loading,
        getProductById: (state) => (id) => state.products.find(p => p.product_id === id)
    },

    actions: {

        clearError() {
            this.error = null
        },

        async fetchAllProductsStore({ branchId, page = 1, itemsPerPage = 10, search = '', sortBy = [] }) {
            // Validate inputs
            if (!branchId) {
                this.error = 'Branch ID is required';
                return;
            }

            this.loading = true;
            this.error = null;

            try {
                const response = await PRODUCTS_API.fetchAllProductsApi({
                    branchId,
                    page,
                    itemsPerPage,
                    search,
                    sortBy
                });

                // Enterprise-level response validation
                if (!response) {
                    throw new Error('No response from server');
                }

                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch products');
                }

                // Handle nested data structure
                let productsData = [];
                let totalCount = 0;

                if (response.data && Array.isArray(response.data.data)) {
                    // If response has nested data property
                    productsData = response.data.data;
                    totalCount = response.data.total || productsData.length;
                } else if (Array.isArray(response.data)) {
                    // If response.data is directly the array
                    productsData = response.data;
                    totalCount = response.total || productsData.length;
                } else if (response.data && typeof response.data === 'object') {
                    // Handle object response
                    productsData = response.data.data || [];
                    totalCount = response.data.total || response.total || productsData.length;
                }

                // Update state with new data
                this.products = productsData || [];
                this.total = totalCount;
                this.lastFetch = new Date().toISOString();

                // Safe development logging - check if import.meta exists
                if (typeof import.meta !== 'undefined' && import.meta.env) {
                    console.log('Products fetched:', {
                        count: this.products.length,
                        total: this.total,
                        page,
                        itemsPerPage
                    });
                }

            } catch (error) {
                console.error('[ProductsStore] fetchProducts error:', error);

                // Enhanced error handling
                this.error = error.response?.data?.message ||
                    error.message ||
                    'Failed to fetch products';

                // Clear data on error to prevent stale display
                this.products = [];
                this.total = 0;

                // Re-throw for component handling
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
                    this.productItems = response.data;
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

        async updateIngredientStore(productItemData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.updateIngredientApi(productItemData);
                const updated = response.data;

                console.log("productItems:", this.productItems);
                console.log("updated:", updated);

                const index = this.productItems.findIndex(p => p.product_item_id === updated.product_item_id);

                if (index !== -1) {
                    this.productItems = this.productItems.map(item =>
                        item.product_item_id === updated.product_item_id ? updated : item
                    );
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