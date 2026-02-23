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

        async fetchAllProductsStore({ branchId, page = 1, itemsPerPage = 10, search = '', sortBy = [] }) {
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

                console.log('Raw API Response:', response); // Debug log

                if (!response) {
                    throw new Error('No response from server');
                }

                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch products');
                }

                // CRITICAL FIX: Extract data based on your actual response structure
                let rawProducts = [];
                let totalCount = 0;

                // Based on your example response: { success: true, data: [...], total: 7 }
                if (response.data && Array.isArray(response.data)) {
                    // Direct array in data property
                    rawProducts = response.data;
                    totalCount = response.total || rawProducts.length;
                }
                // If data is nested: { success: true, data: { data: [...], total: 7 } }
                else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    rawProducts = response.data.data;
                    totalCount = response.data.total || rawProducts.length;
                }
                // If response itself is the array
                else if (Array.isArray(response)) {
                    rawProducts = response;
                    totalCount = rawProducts.length;
                }
                // Handle the specific structure from your API
                else if (response.data && typeof response.data === 'object') {
                    // Try to find array anywhere in the response
                    const possibleArray = Object.values(response.data).find(val => Array.isArray(val));
                    if (possibleArray) {
                        rawProducts = possibleArray;
                        totalCount = response.total || response.data.total || rawProducts.length;
                    }
                }

                console.log('Raw Products Extracted:', rawProducts); // Debug log

                // Transform data to ensure display fields exist
                const transformedProducts = rawProducts.map(product => {
                    // Create display_product_name if it doesn't exist
                    const displayName = product.display_product_name ||
                        product.product_name ||
                        'Unnamed Product';

                    // Create display_base_price if it doesn't exist
                    const basePrice = product.display_base_price ||
                        (product.base_price ? `₱${parseFloat(product.base_price).toFixed(2)}` : '₱0.00');

                    // Create display_estimated_cost if it doesn't exist
                    const estimatedCost = product.display_estimated_cost ||
                        (product.cost_estimate ? `₱${parseFloat(product.cost_estimate).toFixed(2)}` : '₱0.00');

                    return {
                        // Ensure all required fields exist
                        product_id: product.product_id,
                        display_product_name: displayName,
                        display_base_price: basePrice,
                        display_estimated_cost: estimatedCost,
                        availability_label: product.availability_label ||
                            (product.availability_id === 1 ? 'Available' : 'Unavailable'),
                        availability_id: product.availability_id,
                        category_label: product.category_label || '',
                        station_name: product.station_name || '',
                        updated_at: product.updated_at || '',
                        // Keep all original data
                        ...product
                    };
                });

                console.log('Transformed Products:', transformedProducts); // Debug log

                // Update state
                this.products = transformedProducts;
                this.total = totalCount;
                this.lastFetch = new Date().toISOString();

                console.log('Store state after update:', {
                    productsLength: this.products.length,
                    total: this.total
                });

            } catch (error) {
                console.error('[ProductsStore] fetchProducts error:', error);
                this.error = error.response?.data?.message || error.message || 'Failed to fetch products';
                this.products = [];
                this.total = 0;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        clearError() {
            this.error = null
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