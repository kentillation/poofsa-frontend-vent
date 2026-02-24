import { defineStore } from 'pinia';
import { PRODUCTS_API } from '@/api/productsApi';
import { formatDate, formatDateShort } from '@/utils/dateFormatter';

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
        _transformProduct(product = {}) {
            // defensive: if the API returned a falsy value (null/undefined) we still
            // want to return a harmless object so that downstream code and the
            // table renderer don't blow up.  Vue was warning because one of the
            // items passed to <v-data-table> was `undefined` and the render
            // function attempted to read a property from it.
            if (!product || typeof product !== 'object') {
                return {
                    display_product_name: '',
                    display_base_price: '₱0',
                    display_cost_estimate: '₱0',
                    product_id: null,
                    product_name: '',
                    base_price: 0,
                    cost_estimate: 0,
                    temp_id: null,
                    size_id: null,
                    category_id: null,
                    station_id: null,
                    availability_id: null,
                    availability_label: '',
                    updatedAtFormatted: '',
                    updatedAtShort: '',
                };
            }

            return {
                display_product_name: `${product.product_name || ''}${product.size_label || ''}${product.temp_label || ''}`,
                display_base_price: `₱${product.base_price ?? 0}`,
                display_cost_estimate: `₱${product.cost_estimate ?? 0}`,
                product_id: product.product_id,
                product_name: product.product_name,
                base_price: product.base_price,
                cost_estimate: product.cost_estimate,
                temp_id: product.temp_id,
                size_id: product.size_id,
                category_id: product.category_id,
                station_id: product.station_id,
                availability_id: product.availability_id,
                availability_label: product.availability_label,
                updatedAtFormatted: product.updated_at ? formatDate(product.updated_at) : '',
                updatedAtShort: product.updated_at ? formatDateShort(product.updated_at) : '',
                ...product
            };
        },

        /**
         * Clearing error in a statement
         */
        clearError() {
            this.error = null;
        },

        /**
         * Enrich a product with missing display labels from the current product list
         */
        _enrichProductWithLabels(product) {
            const existing = this.products.find(p => p.product_id === product.product_id);
            
            return {
                ...product,
                display_product_name: `${product.product_name}${existing.size_label}${existing.temp_label}`,
                display_base_price: `₱${product.base_price}`,
                display_cost_estimate: `₱${product. cost_estimate}`,
                category_label: product.category_label || existing?.category_label || '',
                station_name: product.station_name || existing?.station_name || '',
                availability_label: product.availability_label || existing?.availability_label || (product.availability_id === 1 ? 'Available' : 'Unavailable'),
                temp_label: product.temp_label || existing?.temp_label || '',
                size_label: product.size_label || existing?.size_label || '',
                updatedAtFormatted: product.updated_at ? formatDate(product.updated_at) : existing?.updatedAtFormatted || '',
                updatedAtShort: product.updated_at ? formatDateShort(product.updated_at) : existing?.updatedAtShort || '',
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
                let rawProducts = Array.isArray(response.data) ? response.data : [];
                const totalCount = response.total ?? rawProducts.length;

                // defensive: filter out any falsy entries that could slip through the
                // API (search queries sometimes return `[null]` or similar when there
                // are no matches).  mapping `null` would have thrown inside
                // `_transformProduct` and triggered the render warning you saw.
                const beforeLen = rawProducts.length;
                rawProducts = rawProducts.filter(p => p && typeof p === 'object');
                if (rawProducts.length !== beforeLen) {
                    console.warn('[productsStore] removed invalid items from API response', {
                        before: beforeLen,
                        after: rawProducts.length,
                        branchId,
                        search
                    });
                }

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
                
                // Enrich the response with labels from existing product
                const enrichedProduct = this._enrichProductWithLabels(response.data);
                const transformed = this._transformProduct(enrichedProduct);
                
                const index = this.products.findIndex(p => p.product_id === transformed.product_id);
                if (index !== -1) {
                    this.products.splice(index, 1, transformed);
                } else {
                    this.products.push(transformed);
                }
                return transformed;
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