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

    async fetchAllProductsApi(branchId) {
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
                `${this.ENDPOINTS.FETCH_ALL}/${branchId}`,
                config
            );

            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[PRODUCTS_API] Error fetching products:', error);
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
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            if (!product.product_id) {
                throw new Error('Product ID is required for update');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await apiClient.put(
                `${this.ENDPOINTS.UPDATE}/${product.product_id}`,
                product,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
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

    async updateIngredientApi(ingredient) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            if (!ingredient.ingredient_id) {
                throw new Error('Product Ingredient ID is required for update');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await apiClient.put(
                `${this.ENDPOINTS.UPDATE_PRODUCT_ITEMS}/${ingredient.ingredient_id}`,
                ingredient,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[PRODUCTS_API] Error updating ingredient:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to update ingredient'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    }
};