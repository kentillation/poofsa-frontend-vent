import apiClient from '../axios';

export const STOCK_API = {
    ENDPOINTS: {
        FETCH_ALL_STOCKS: '/admin/stocks',
        FETCH_STOCKS_BY_DATE: '/admin/stocks-report',
        FETCH_STOCKS_HISTORY: '/admin/stocks-history',
        SAVE_STOCKS: '/admin/save-stock',
        UPDATE_STOCK: '/admin/update-stock',
        FETCH_LOW_STOCKS: '/admin/low-stocks',
    },

    /**
     * Stocks Information
     * @param {Object} stock - Stock data to update
     * @param {string|number} stock.stock_id - Required stock ID
     * @returns {Promise<Object>} Updated stock data
     * @throws {Error} Enhanced error with server response details
     */

    async fetchAllStocksApi({ branchId, page = 1, itemsPerPage = 10, search = '' }) {
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

            const response = await apiClient.get(this.ENDPOINTS.FETCH_ALL_STOCKS, config);

            return {
                success: response.data?.success ?? true,
                data: response.data?.data ?? response.data ?? [],
                total: response.data?.total ?? (response.data?.data?.length ?? 0),
                message: response.data?.message ?? 'Success'
            };

        } catch (error) {
            console.error('[STOCKS_API] Error fetching stocks:', error);
            throw error;
        }
    },

    async fetchStocksHistoryApi({ branchId, page = 1, itemsPerPage = 10, search = '' }) {
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

            const response = await apiClient.get(this.ENDPOINTS.FETCH_STOCKS_HISTORY, config);

            return {
                success: response.data?.success ?? true,
                data: response.data?.data ?? response.data ?? [],
                total: response.data?.total ?? (response.data?.data?.length ?? 0),
                message: response.data?.message ?? 'Success'
            };

        } catch (error) {
            console.error('[STOCK_API] Error fetching modified stocks:', error);
            throw error;
        }
    },

    async fetchStocksReportByDateApi(branchId, dateFilterId = null) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            let endpoint = `${this.ENDPOINTS.FETCH_STOCKS_BY_DATE}/${branchId}`;
            if (dateFilterId) {
                endpoint += `?date_filter=${dateFilterId}`;
            }
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
            console.error('[fetchStocksReportByDateApi] Error fetching sales:', error);
            throw error;
        }
    },

    async saveStocksApi(stocks) {
        try {
            console.log('[api] Payload: ', stocks)
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
                this.ENDPOINTS.SAVE_STOCKS,
                stocks,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[StocksAPI] Error saving stocks:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to save stocks'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async updateStockApi(stock) {
        if (!stock.ingredient_id) throw new Error('Ingredient ID is required');

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
                `${this.ENDPOINTS.UPDATE_STOCK}/${stock.ingredient_id}`,
                stock,
                config
            );

            if (!response?.data?.success || !response?.data?.data) {
                throw new Error(response?.data?.message || 'Invalid server response');
            }

            return response.data; // contains success, message, data, changes
        } catch (error) {
            console.error('[STOCK_API] Error updating stock:', error);

            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to update stock'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchLowStocksApi() {
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
                this.ENDPOINTS.FETCH_LOW_STOCKS,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[StocksAPI] Error fetching stocks:', error);

            const enhancedError = new Error('Failed to fetch stocks');
            throw enhancedError;
        }
    },
};