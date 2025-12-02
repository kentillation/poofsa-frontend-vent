import { defineStore } from 'pinia';
import { STOCK_API } from '@/api/stocksApi';

export const useStocksStore = defineStore('stocks', {
    state: () => ({
        stocks: [],
        stocksByDate: [],
        lowStockBranches: [],
        totalLowStock: null,
        loading: false,
        error: null
    }),

    actions: {
        async fetchAllStocksStore(branchId) {
            this.loading = true;
            this.error = null;
            try {
                if (!STOCK_API || typeof STOCK_API.fetchAllStocksApi !== 'function') {
                    throw new Error('STOCK_API service is not properly initialized');
                }
                const response = await STOCK_API.fetchAllStocksApi(branchId);
                if (response && response.status === true) {
                    this.stocks = response.data;
                } else {
                    throw new Error('Failed to fetch stocks');
                }
            } catch (error) {
                console.error('Error in fetchAllStocksApi:', error);
                this.error = 'Failed to fetch stocks';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchStocksReportStore(branchId, dateFilterId = null) {
            this.loading = true;
            this.error = null;
            try {
                const response = await STOCK_API.fetchStocksReportByDateApi(branchId, dateFilterId);
                if (response && response.status === true) {
                    this.stocksByDate = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch sales');
                }
            } catch (error) {
                console.error('Error in fetchStocksReportByDateApi:', error);
                this.error = error.message || 'Failed to fetch sales';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async saveStocksStore(stocks) {
            this.loading = true;
            this.error = null;
            try {
                if (!STOCK_API || typeof STOCK_API.saveStocksApi !== 'function') {
                    throw new Error('STOCK_API service is not properly initialized');
                }
                const response = await STOCK_API.saveStocksApi(stocks);
                if (response && (response.status === true)) {
                    return response;
                } else {
                    throw new Error('Failed to save stocks');
                }
            } catch (error) {
                console.error('Error in saveStocksApi:', error);
                this.error = 'Failed to save stocks';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateStockStore(stocks) {
            this.loading = true;
            this.error = null;
            try {
                if (!STOCK_API || typeof STOCK_API.updateStockApi !== 'function') {
                    throw new Error('STOCK_API service is not properly initialized');
                }
                const response = await STOCK_API.updateStockApi(stocks);
                if (response && response.status === true) {
                    return response;
                } else {
                    throw new Error('Failed to update stocks');
                }
            } catch (error) {
                console.error('Error in updateStockApi:', error);
                this.error = 'Failed to update stocks';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchLowStocksStore() {
            this.loading = true;
            this.error = null;
            try {
                if (!STOCK_API || typeof STOCK_API.fetchLowStocksApi !== 'function') {
                    throw new Error('STOCK_API service is not properly initialized');
                }
                const response = await STOCK_API.fetchLowStocksApi();
                if (response?.status === true) {
                    this.lowStockBranches = response.data.branches;
                    this.totalLowStock = response.data.total_count;
                    return response;
                } else {
                    throw new Error(response?.message || 'Failed to fetch stocks');
                }
            } catch (error) {
                console.error('Error in fetchLowStocksApi:', error);
                this.error = error.message || 'Failed to fetch stocks';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
    getters: {
        stockNotificationQty: (state) => state.totalLowStock || 0,
    }
});