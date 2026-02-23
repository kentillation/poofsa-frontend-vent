import apiClient from '../axios';

export const PRODUCTS_API = {
    ENDPOINTS: {
        FETCH_ALL: '/admin/products',
        FETCH_TOTAL_PRODUCTS_COUNT: '/admin/total-products-count',
        FETCH_PRODUCT_ALONE: '/admin/product-alone',
        FETCH_PRODUCT_ITEMS: '/admin/product-items',
        FETCH_PRODUCTS_HISTORY: '/admin/products-history',
        SAVE: '/admin/save-product',
        SAVE_PRODUCT_ITEMS: '/admin/save-product-items',
        UPDATE: '/admin/update-product',
        UPDATE_PRODUCT_ITEMS: '/admin/update-product-items'
    },

    /**
     * Products Information
     * @param {string|number} branchId - ID of the branch to fetch products for
     * @returns {Promise<Object>} Products data for the branch
     * @throws {Error} Enhanced error with server response details
     */

    async fetchAllProductsApi({ branchId, page = 1, itemsPerPage = 10, search = '', sortBy = [] }) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }

            // Build params object
            const params = {
                branch_id: branchId,
                page,
                itemsPerPage,
            };

            // Only add search if it has value
            if (search) {
                params.search = search;
            }

            // Add sorting if provided
            if (sortBy && sortBy.length > 0) {
                params.sortBy = JSON.stringify(sortBy);
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'X-Request-ID': crypto.randomUUID() // For request tracing
                },
                params,
                timeout: 30000 // 30 second timeout
            };

            const response = await apiClient.get(this.ENDPOINTS.FETCH_ALL, config);

            // Log response structure in development
            if (import.meta.env) {
                console.log('API Response:', response.data);
            }

            // Standardize response format
            if (!response.data) {
                throw new Error('Empty response from server');
            }

            // Handle different response formats
            let formattedResponse = {
                success: response.data.success ?? true,
                message: response.data.message ?? 'Products fetched successfully'
            };

            // Handle nested data structure
            if (response.data.data && Array.isArray(response.data.data)) {
                formattedResponse.data = response.data.data;
                formattedResponse.total = response.data.total ?? response.data.data.length;
                formattedResponse.page = response.data.page ?? page;
                formattedResponse.perPage = response.data.perPage ?? itemsPerPage;
            } else if (Array.isArray(response.data.data)) {
                formattedResponse.data = response.data.data;
                formattedResponse.total = response.data.total ?? response.data.data.length;
            } else if (Array.isArray(response.data)) {
                formattedResponse.data = response.data;
                formattedResponse.total = response.total ?? response.data.length;
            } else {
                formattedResponse.data = [];
                formattedResponse.total = 0;
                formattedResponse.message = 'No products found';
            }
            return formattedResponse;
        } catch (error) {
            console.error('[PRODUCTS_API] Error fetching products:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch products'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            enhancedError.code = error.code;
            throw enhancedError;
        }
    },

    async fetchTotalProductsCountApi(branchId) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            let endpoint = `${this.ENDPOINTS.FETCH_TOTAL_PRODUCTS_COUNT}/${branchId}`;
            const response = await apiClient.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[fetchTotalProductsCountApi] Error fetching sales:', error);
            throw error;
        }
    },

    async fetchProductIngredientsApi(productId) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            };
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_PRODUCT_ITEMS}/${productId}`,
                config
            );

            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[PRODUCTS_API]: ', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch products'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchProductsHistoryApi(branchId) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            };
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_PRODUCTS_HISTORY}/${branchId}`,
                config
            );

            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[PRODUCTS_API]: ', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch products history'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async saveProductsApi(products) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await apiClient.post(
                this.ENDPOINTS.SAVE,
                products,
                config
            );

            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[PRODUCTS_API] Error saving products:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to save products'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async saveProductIngredientsApi(products) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await apiClient.post(
                this.ENDPOINTS.SAVE_PRODUCT_ITEMS,
                products,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[PRODUCTS_API] Error saving products:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to save products'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async updateProductApi(product) {
        if (!product.product_id) throw new Error('Product ID is required');

        const authToken = localStorage.getItem('auth_token');
        if (!authToken) throw new Error('No authentication token found');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10s timeout
            };

            const response = await apiClient.put(
                `${this.ENDPOINTS.UPDATE}/${product.product_id}`,
                product,
                config
            );

            if (!response?.data?.success || !response?.data?.data) {
                throw new Error(response?.data?.message || 'Invalid server response');
            }

            return response.data; // contains success, message, data, changes
        } catch (error) {
            console.error('[PRODUCTS_API] Error updating product:', error);

            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to update product'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async updateIngredientApi(productItemData) {
        if (!productItemData.product_item_id) throw new Error('Product Item ID is required');
        if (!productItemData.product_id) throw new Error('Product ID is required');
        if (!productItemData.ingredient_id) throw new Error('Item ID is required');

        const authToken = localStorage.getItem('auth_token');
        if (!authToken) throw new Error('No authentication token found');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10s timeout
            };

            const response = await apiClient.put(
                `${this.ENDPOINTS.UPDATE_PRODUCT_ITEMS}/${productItemData.product_item_id}`,
                productItemData,
                config
            );

            if (!response?.data?.success || !response?.data?.data) {
                throw new Error(response?.data?.message || 'Invalid server response');
            }
            return response.data;
        } catch (error) {
            console.error('[PRODUCTS_API] Error updating productItemData:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to update productItemData'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    }
};