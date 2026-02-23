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
        // Cache tracking
        _fetchCache: null,
        _lastFetchHash: null
    }),

    getters: {
        hasProducts: (state) => state.products.length > 0,
        isEmpty: (state) => state.products.length === 0 && !state.loading,
        getProductById: (state) => (id) => state.products.find(p => p.product_id === id),
        getProductsByCategory: (state) => (categoryId) => state.products.filter(p => p.category_id === categoryId),
        getAvailableProducts: (state) => state.products.filter(p => p.availability_id === 1)
    },

    actions: {
        /**
         * Generate cache key from fetch params
         */
        _getCacheKey(branchId, page, itemsPerPage, search) {
            return JSON.stringify({ branchId, page, itemsPerPage, search });
        },

        /**
         * Transform raw product from API to display format
         */
        _transformProduct(product) {
            return {
                product_id: product.product_id,
                display_product_name: product.product_name || 'Unnamed Product',
                display_base_price: product.base_price ? `₱${parseFloat(product.base_price).toFixed(2)}` : '₱0.00',
                display_estimated_cost: product.cost_estimate ? `₱${parseFloat(product.cost_estimate).toFixed(2)}` : '₱0.00',
                availability_label: product.availability_label || (product.availability_id === 1 ? 'Available' : 'Unavailable'),
                availability_id: product.availability_id,
                // Keep original fields for reference
                ...product
            };
        },

        /**
         * Fetch all products with smart caching
         */
        async fetchAllProductsStore({ branchId, page = 1, itemsPerPage = 10, search = '', sortBy = [] }) {
            if (!branchId) {
                this.error = 'Branch ID is required';
                return;
            }

            const cacheKey = this._getCacheKey(branchId, page, itemsPerPage, search);

            // Return cached data if same request
            if (this._lastFetchHash === cacheKey && this.products.length > 0) {
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

                if (!response?.success) {
                    throw new Error(response?.message || 'Failed to fetch products');
                }

                // Extract data (API returns { success, data: [...], total, ... })
                const rawProducts = Array.isArray(response.data) ? response.data : [];
                const totalCount = response.total ?? rawProducts.length;

                // Transform products once and store
                this.products = rawProducts.map(p => this._transformProduct(p));
                this.total = totalCount;
                this._lastFetchHash = cacheKey;
                this._fetchCache = { rawProducts, totalCount };

            } catch (error) {
                this.error = error.message || 'Failed to fetch products';
                this.products = [];
                this.total = 0;
                this._lastFetchHash = null;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        clearError() {
            this.error = null;
        },

        async fetchTotalProductsCountStore(branchId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.fetchTotalProductsCountApi(branchId);
                if (response?.status === true) {
                    this.productsOnly = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch products count');
                }
            } catch (error) {
                this.error = error.message || 'Failed to fetch products count';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchProductIngredientsStore(productId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.fetchProductIngredientsApi(productId);
                if (response?.status === true) {
                    this.productItems = response.data;
                } else {
                    throw new Error('Failed to fetch product ingredients');
                }
            } catch (error) {
                this.error = error.message || 'Failed to fetch product ingredients';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchProductsHistoryStore(branchId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.fetchProductsHistoryApi(branchId);
                if (response?.status === true) {
                    this.product_history = response.data;
                } else {
                    throw new Error('Failed to fetch products history');
                }
            } catch (error) {
                this.error = error.message || 'Failed to fetch products history';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async saveProductsStore(products) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.saveProductsApi(products);
                if (response?.status === true) {
                    return response;
                } else {
                    throw new Error('Failed to save products');
                }
            } catch (error) {
                this.error = error.message || 'Failed to save products';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async saveProductIngredientsStore(products) {
            this.loading = true;
            this.error = null;
            try {
                const response = await PRODUCTS_API.saveProductIngredientsApi(products);
                if (response?.status === true) {
                    return response;
                } else {
                    throw new Error('Failed to save product ingredients');
                }
            } catch (error) {
                this.error = error.message || 'Failed to save product ingredients';
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
                if (!response?.data) {
                    throw new Error('Invalid server response');
                }
                const updated = this._transformProduct(response.data);
                const index = this.products.findIndex(p => p.product_id === updated.product_id);
                if (index !== -1) {
                    this.products.splice(index, 1, updated);
                } else {
                    this.products.push(updated);
                }
                return updated;
            } catch (error) {
                this.error = error.message || 'Failed to update product';
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
                if (!response?.data) {
                    throw new Error('Invalid server response');
                }
                const updated = response.data;
                const index = this.productItems.findIndex(p => p.product_item_id === updated.product_item_id);
                if (index !== -1) {
                    this.productItems.splice(index, 1, updated);
                } else {
                    this.productItems.push(updated);
                }
                return updated;
            } catch (error) {
                this.error = error.message || 'Failed to update ingredient';
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});