import apiClient from '../axios';

export const STOCK_API = {
    ENDPOINTS: {
        FETCH: '/admin/stocks',
        FETCH_STOCKS_BY_DATE: '/admin/stocks-report',
        SAVE: '/admin/save-stock',
        UPDATE: '/admin/update-stock',
        FETCH_LOW_STOCKS: '/admin/low-stocks',
    },

    /**
     * Stocks Information
     * @param {Object} stock - Stock data to update
     * @param {string|number} stock.stock_id - Required stock ID
     * @returns {Promise<Object>} Updated stock data
     * @throws {Error} Enhanced error with server response details
     */

    async fetchAllStocksApi(branchId) {
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
                `${this.ENDPOINTS.FETCH}/${branchId}`,
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
        try {
            if (!stock?.stock_id) {
                throw new Error('Stock ID is required for update');
            }
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('Authentication token not found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await apiClient.put(
                `${this.ENDPOINTS.UPDATE}/${stock.stock_id}`,
                stock,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[StockAPI] Error updating stock:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to update stock'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            enhancedError.isApiError = true;
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