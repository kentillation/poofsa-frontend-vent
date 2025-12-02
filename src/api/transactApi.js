import apiClient from '../axios';

export const TRANSACT_API = {
    ENDPOINTS: {
        FETCH_ALL_ORDERS: '/admin/all-orders',
        FETCH_GROSS_SALES_BY_DATE: '/admin/gross-sales-by-date',
        FETCH_GROSS_SALES: '/admin/gross-sales-only',
        FETCH_ORDERS_COUNT: '/admin/orders-only',
        FETCH_PRODUCTS: '/admin/products-only',
        FETCH_STOCKS: '/admin/stocks-only',
        FETCH_SALES_BY_MONTH: '/admin/sales-by-month',
        FETCH_VOID_STATUS: '/admin/void-status',
        FETCH_REVERSAL: '/admin/void-orders',
        UPDATE_VOID: '/admin/update-void',

    },

    async fetchAllOrdersApi(branchId, dateFilterId = null) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            let endpoint = `${this.ENDPOINTS.FETCH_ALL_ORDERS}/${branchId}`;
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
            console.error('[fetchAllOrdersApi] Error fetching orders:', error);
            throw error;
        }
    },

    async fetchGrossSalesByDateApi(branchId, dateFilterId = null) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            let endpoint = `${this.ENDPOINTS.FETCH_GROSS_SALES_BY_DATE}/${branchId}`;
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
            console.error('[fetchGrossSalesByDateApi] Error fetching sales:', error);
            throw error;
        }
    },

    async fetchGrossSalesApi(branchId, dateFilterId = null) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) throw new Error('No authentication token found');
            let endpoint = `${this.ENDPOINTS.FETCH_GROSS_SALES}/${branchId}`;
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
            console.error('[fetchGrossSalesApi] Error fetching sales:', error);
            throw error;
        }
    },

    async fetchOrdersOnlyApi(branchId, dateFilterId = null) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            let endpoint = `${this.ENDPOINTS.FETCH_ORDERS_COUNT}/${branchId}`;
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
            console.error('[fetchOrdersOnlyApi] Error fetching sales:', error);
            throw error;
        }
    },

    async fetchProductsOnlyApi(branchId) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            let endpoint = `${this.ENDPOINTS.FETCH_PRODUCTS}/${branchId}`;
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
            console.error('[fetchProductsOnlyApi] Error fetching sales:', error);
            throw error;
        }
    },

    async fetchStocksOnlyApi(branchId) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            let endpoint = `${this.ENDPOINTS.FETCH_STOCKS}/${branchId}`;
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
            console.error('[fetchProductsOnlyApi] Error fetching sales:', error);
            throw error;
        }
    },

    async fetchSalesByMonthApi(branchId, dateFilterId = null) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) throw new Error('No authentication token found');
            let endpoint = `${this.ENDPOINTS.FETCH_SALES_BY_MONTH}/${branchId}`;
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
            console.error('[fetchSalesByMonthApi] Error fetching sales:', error);
            throw error;
        }
    },

    async fetchVoidStatusApi() {
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
                `${this.ENDPOINTS.FETCH_VOID_STATUS}`,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[TRANSACT_API] Error fetching void status:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch void status'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchVoidByDateApi(branchId, dateFilterId = null) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) throw new Error('No authentication token found');
            let endpoint = `${this.ENDPOINTS.FETCH_REVERSAL}/${branchId}`;
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
            console.error('[fetchVoidByDateApi] Error fetching sales:', error);
            throw error;
        }
    },

    async updateVoidStatusApi(transactionVoidID, branchId, referenceNumber, voidStatus) {
        if (!referenceNumber || !voidStatus) {
            throw new Error('Invalid reference_number, or void_status');
        }
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
            const response = await apiClient.put(
                `${this.ENDPOINTS.UPDATE_VOID}/${branchId}`,
                { transactionVoidID, referenceNumber, voidStatus },
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[TRANSACT_API] Error updating void order:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to update void order'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },
};