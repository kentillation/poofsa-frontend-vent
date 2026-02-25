import { defineStore } from 'pinia';
import { STOCK_API } from '@/api/stocksApi';
import { formatDate, formatDateShort } from '@/utils/dateFormatter';

export const useStocksStore = defineStore('stocks', {
    state: () => ({
        stocks: [],
        stocksHistory: [],
        stocksByDate: [],
        lowStockBranches: [],
        totalLowStock: null,
        total: 0,
        stockHistoryTotal: 0,
        loading: false,
        error: null,
        _fetchCache: null,
        _lastFetchHash: null
    }),

    getters: {
        stockNotificationQty: (state) => state.totalLowStock || 0,
        hasStocks: (state) => state.stocks.length > 0,
        isEmpty: (state) => state.stocks.length === 0 && !state.loading,
        getStockById: (state) => (id) => state.stocks.find(p => p.ingredient_id === id),
        getStocksByCategory: (state) => (categoryId) => state.stocks.filter(p => p.category_id === categoryId),
        getAvailableStocks: (state) => state.stocks.filter(p => p.availability_id === 1)
    },

    actions: {

        _getCacheKey(branchId, page, itemsPerPage, search) {
            return JSON.stringify({ branchId, page, itemsPerPage, search });
        },

        _transformStocks(stock = {}) {
            if (!stock || typeof stock !== 'object') {
                return {
                    ingredient_id: null,
                    ingredient_name: '',
                    base_unit_id: null,
                    unit_label: '',
                    unit_avb: '',
                    alert_quantity: '',
                    availability_id: null,
                    availability_label: '',
                    updatedAtFormatted: '',
                    updatedAtShort: '',
                };
            }

            return {
                ingredient_id: stock.ingredient_id,
                ingredient_name: stock.ingredient_name,
                base_unit_id: stock.base_unit_id,
                unit_label: stock.unit_label,
                unit_avb: stock.unit_avb,
                alert_quantity: stock.alert_quantity,
                availability_id: stock.availability_id,
                availability_label: stock.availability_label,
                updatedAtFormatted: stock.updated_at ? formatDate(stock.updated_at) : '',
                updatedAtShort: stock.updated_at ? formatDateShort(stock.updated_at) : '',
                ...stock
            };
        },

        _transformStocksHistory(stockHistory = {}) {
            if (!stockHistory || typeof stockHistory !== 'object') {
                return {
                    ingredient_name: '',
                    updatedAtFormatted: '',
                    updatedAtShort: '',
                };
            }

            return {
                ingredient_name: stockHistory.ingredient_name,
                updatedAtFormatted: stockHistory.updated_at ? formatDate(stockHistory.updated_at) : '',
                updatedAtShort: stockHistory.updated_at ? formatDateShort(stockHistory.updated_at) : '',
                ...stockHistory
            };
        },

        clearError() {
            this.error = null;
        },

        _enrichstockWithLabels(stock) {
            const existing = this.stocks.find(s => s.ingredient_id === stock.ingredient_id);

            return {
                ...stock,
                ingredient_id: stock.ingredient_id,
                ingredient_name: stock.ingredient_name,
                base_unit_id: stock.base_unit_id || existing?.base_unit_id || '',
                unit_label: stock.unit_label || existing?.unit_label || '',
                unit_avb: stock.unit_avb || existing?.unit_avb || '',
                alert_quantity: stock.alert_quantity || existing?.alert_quantity || '',
                availability_id: stock.availability_id || existing?.availability_id || 0,
                availability_label: stock.availability_label || existing?.availability_label || '',
                updatedAtFormatted: stock.updated_at ? formatDate(stock.updated_at) : existing?.updatedAtFormatted || '',
                updatedAtShort: stock.updated_at ? formatDateShort(stock.updated_at) : existing?.updatedAtShort || '',
            };
        },

        async fetchAllStocksStore({ branchId, page = 1, itemsPerPage = 10, search = '' }) {
            if (!branchId) {
                this.error = 'Branch ID is required';
                return;
            }

            const cacheKey = this._getCacheKey(branchId, page, itemsPerPage, search);

            if (this._lastFetchHash === cacheKey && this.stocks.length > 0) {
                return;
            }

            this.loading = true;
            this.error = null;

            try {
                const response = await STOCK_API.fetchAllStocksApi({
                    branchId,
                    page,
                    itemsPerPage,
                    search
                });

                if (!response?.success) {
                    throw new Error(response?.message || 'Failed to fetch stocks');
                }

                let rawStocks = Array.isArray(response.data) ? response.data : [];
                const totalCount = response.total ?? rawStocks.length;

                const beforeLength = rawStocks.length;
                rawStocks = rawStocks.filter(s => s && typeof s === 'object');
                if (rawStocks.length !== beforeLength) {
                    console.warn('[stocksStore] removed invalid items from API response', {
                        before: beforeLength,
                        after: rawStocks.length,
                        branchId,
                        search
                    });
                }

                this.stocks = rawStocks.map(s => this._transformStocks(s));
                this.total = totalCount;
                this._lastFetchHash = cacheKey;
                this._fetchCache = { rawStocks, totalCount };

            } catch (error) {
                this.error = error.message || 'Failed to fetch stocks';
                this.stocks = [];
                this.total = 0;
                this._lastFetchHash = null;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchStocksHistoryStore(branchId) {
            this.loading = true;
            this.error = null;
            try {
                if (!STOCK_API || typeof STOCK_API.fetchStocksHistoryApi !== 'function') {
                    throw new Error('STOCK_API service is not properly initialized');
                }
                const response = await STOCK_API.fetchStocksHistoryApi(branchId);
                if (response && response.status === true) {
                    this.stocksHistory = response.data;
                } else {
                    throw new Error('Failed to fetch stocks');
                }
            } catch (error) {
                console.error(error);
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
                console.error(error);
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
                console.error(error);
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
                console.error(error);
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
                console.error(error);
                this.error = error.message || 'Failed to fetch stocks';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});