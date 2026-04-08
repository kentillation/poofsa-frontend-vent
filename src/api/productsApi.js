import apiClient from '../axios';

export const PRODUCTS_API = {
    ENDPOINTS: {
        FETCH_ALL_PRODUCTS: '/admin/products',
        FETCH_TOTAL_PRODUCTS_COUNT: '/admin/total-products-count',
        FETCH_PRODUCT_ALONE: '/admin/product-alone',
        FETCH_PRODUCT_ITEMS: '/admin/product-items',
        FETCH_PRODUCTS_HISTORY: '/admin/products-history',
        SAVE: '/admin/save-product',
        SAVE_PRODUCT_ITEMS: '/admin/save-product-items',
        UPDATE_PRODUCT: '/admin/update-product',
        UPDATE_PRODUCT_ITEMS: '/admin/update-product-items'
    },

    /**
     * Products Information
     * @param {string|number} branchId - ID of the branch to fetch products for
     * @returns {Promise<Object>} Products data for the branch
     * @throws {Error} Enhanced error with server response details
     */

    async fetchAllProductsApi({ branchId, page = 1, itemsPerPage = 10, search = '' }) {
        try {
            const shopId = localStorage.getItem('shop_id');
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }

            const params = {
                shop_id: shopId,
                branch_id: branchId,
                page,
                itemsPerPage,
            };

            if (search) {
                params.search = search;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                params
            };

            const response = await apiClient.get(this.ENDPOINTS.FETCH_ALL_PRODUCTS, config);

            return {
                success: response.data?.success ?? true,
                data: response.data?.data ?? response.data ?? [],
                total: response.data?.total ?? (response.data?.data?.length ?? 0),
                message: response.data?.message ?? 'Success'
            };

        } catch (error) {
            console.error('[PRODUCTS_API] Error fetching products:', error);
            throw error;
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
            console.error('[api] Error fetching sales:', error);
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

    async fetchProductsHistoryApi({ branchId, page = 1, itemsPerPage = 10, search = '' }) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }

            const params = {
                branch_id: branchId,
                page,
                itemsPerPage,
            };

            if (search) {
                params.search = search;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                params
            };

            const response = await apiClient.get(this.ENDPOINTS.FETCH_PRODUCTS_HISTORY, config);

            return {
                success: response.data?.success ?? true,
                data: response.data?.data ?? response.data ?? [],
                total: response.data?.total ?? (response.data?.data?.length ?? 0),
                message: response.data?.message ?? 'Success'
            };

        } catch (error) {
            console.error('[PRODUCTS_API] Error fetching modified products:', error);
            throw error;
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
                `${this.ENDPOINTS.UPDATE_PRODUCT}/${product.product_id}`,
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