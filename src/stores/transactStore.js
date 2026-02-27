import { defineStore } from 'pinia';
import { TRANSACT_API } from '@/api/transactApi';
import { formatDate, formatDateShort } from '@/utils/dateFormatter';

export const useTransactStore = defineStore('transactions', {
    state: () => ({
        transactions: [],
        allOrders: [],
        orders: [],
        ordersHistory: [],
        total: 0,
        ordersHistoryTotal: 0,
        grossSalesByDate: [],
        salesByMonth: [],
        voidStatuses: [],
        voidOrdersByDate: [],
        voidOrders: [],
        grossSales: '',
        totalSales: null,
        ordersOnly: '',
        stocksOnly: '',
        loading: false,
        error: null,
        _fetchCache: null,
        _lastFetchHash: null
    }),

    actions: {

        _getCacheKey(branchId, page, itemsPerPage, search) {
            return JSON.stringify({ branchId, page, itemsPerPage, search });
        },

        _transformOrders(order = {}) {
            if (!order || typeof order !== 'object') {
                return {
                    ingredient_id: null,
                    ingredient_name: '',
                    base_unit_id: null,
                    unit_label: '',
                    unit_avb: '',
                    alert_quantity: '',
                    display_alert_quantity: '',
                    availability_id: null,
                    availability_label: '',
                    updatedAtFormatted: '',
                    updatedAtShort: '',
                };
            }

            return {
                ingredient_id: order.ingredient_id,
                ingredient_name: order.ingredient_name,
                base_unit_id: order.base_unit_id,
                unit_label: order.unit_label,
                unit_avb: order.unit_avb,
                alert_quantity: order.alert_quantity,
                display_alert_quantity: `${order.alert_quantity || 0}${order.unit_avb || ''}`,
                availability_id: order.availability_id,
                availability_label: order.availability_label,
                updatedAtFormatted: order.updated_at ? formatDate(order.updated_at) : '',
                updatedAtShort: order.updated_at ? formatDateShort(order.updated_at) : '',
                ...order
            };
        },

        _transformOrdersHistory(orderHistory = {}) {
            if (!orderHistory || typeof orderHistory !== 'object') {
                return {
                    ingredient_name: '',
                    updatedAtFormatted: '',
                    updatedAtShort: '',
                };
            }

            return {
                ingredient_name: orderHistory.ingredient_name,
                updatedAtFormatted: orderHistory.updated_at ? formatDate(orderHistory.updated_at) : '',
                updatedAtShort: orderHistory.updated_at ? formatDateShort(orderHistory.updated_at) : '',
                ...orderHistory
            };
        },

        clearError() {
            this.error = null;
        },

        _enrichOrderWithLabels(order) {
            const existing = this.stocks.find(s => s.ingredient_id === order.ingredient_id);

            return {
                ...order,
                ingredient_id: order.ingredient_id,
                ingredient_name: order.ingredient_name,
                base_unit_id: order.base_unit_id || existing?.base_unit_id || '',
                unit_label: order.unit_label || existing?.unit_label || '',
                unit_avb: order.unit_avb || existing?.unit_avb || '',
                alert_quantity: order.alert_quantity || existing?.alert_quantity || '',
                display_alert_quantity: `${order.alert_quantity || 0}${order.unit_avb || ''}` || `${existing?.alert_quantity || 0}${existing?.unit_avb || ''}` || '',
                availability_id: order.availability_id || existing?.availability_id || 0,
                availability_label: order.availability_label || existing?.availability_label || '',
                updatedAtFormatted: order.updated_at ? formatDate(order.updated_at) : existing?.updatedAtFormatted || '',
                updatedAtShort: order.updated_at ? formatDateShort(order.updated_at) : existing?.updatedAtShort || '',
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
                const response = await TRANSACT_API.fetchAllStocksApi({
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

                this.stocks = rawStocks.map(s => this._transformOrders(s));
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

        async fetchAllOrdersStore(branchId, dateFilterId = null) {
            this.loading = true;
            this.error = null;
            try {
                const response = await TRANSACT_API.fetchAllOrdersApi(branchId, dateFilterId);
                if (response && response.status === true) {
                    this.transactions = response.data;
                    this.allOrders = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch orders');
                }
            } catch (error) {
                console.error('Error in fetchAllOrdersApi:', error);
                this.error = error.message || 'Failed to fetch orders';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchGrossSalesByDateStore(branchId, dateFilterId = null) {
            this.loading = true;
            this.error = null;
            try {
                const response = await TRANSACT_API.fetchGrossSalesByDateApi(branchId, dateFilterId);
                if (response && response.status === true) {
                    this.grossSalesByDate = response.data;
                    this.grossSales = response.total_sales
                    this.totalSales = response.total_sales
                } else {
                    throw new Error(response?.message || 'Failed to fetch sales');
                }
            } catch (error) {
                console.error('Error in fetchGrossSalesByDateApi:', error);
                this.error = error.message || 'Failed to fetch sales';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchGrossSalesStore(branchId, dateFilterId = null) {
            this.loading = true;
            this.error = null;
            try {
                const response = await TRANSACT_API.fetchGrossSalesApi(branchId, dateFilterId);
                if (response && response.status === true) {
                    this.grossSales = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch sales');
                }
            } catch (error) {
                console.error('Error in fetchGrossSalesApi:', error);
                this.error = error.message || 'Failed to fetch sales';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchOrdersOnlyStore(branchId, dateFilterId = null) {
            this.loading = true;
            this.error = null;
            try {
                const response = await TRANSACT_API.fetchOrdersOnlyApi(branchId, dateFilterId);
                if (response && response.status === true) {
                    this.ordersOnly = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch sales');
                }
            } catch (error) {
                console.error('Error in fetchOrdersOnlyApi:', error);
                this.error = error.message || 'Failed to fetch sales';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchStocksOnlyStore(branchId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await TRANSACT_API.fetchStocksOnlyApi(branchId);
                if (response && response.status === true) {
                    this.stocksOnly = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch products');
                }
            } catch (error) {
                console.error('Error in fetchStocksOnlyApi:', error);
                this.error = error.message || 'Failed to fetch products';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchSalesByMonthStore(branchId, dateFilterId = null) {
            this.loading = true;
            this.error = null;
            try {
                const response = await TRANSACT_API.fetchSalesByMonthApi(branchId, dateFilterId);
                if (response && response.status === true) {
                    this.salesByMonth = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch sales');
                }
            } catch (error) {
                console.error('Error in fetchSalesByMonthApi:', error);
                this.error = error.message || 'Failed to fetch sales';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchVoidStatusStore() {
            this.loading = true;
            this.error = null;
            try {
                if (!TRANSACT_API || typeof TRANSACT_API.fetchVoidStatusApi !== 'function') {
                    throw new Error('TRANSACT_API service is not properly initialized');
                }
                const response = await TRANSACT_API.fetchVoidStatusApi();
                if (response && response.status === true) {
                    this.voidStatuses = response.data;
                } else {
                    throw new Error('Failed to fetch voidStatuses');
                }
            } catch (error) {
                console.error('Error in fetchVoidStatusApi:', error);
                this.error = 'Failed to fetch order status';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchVoidByDateStore(branchId, dateFilterId = null) {
            this.loading = true;
            this.error = null;
            try {
                const response = await TRANSACT_API.fetchVoidByDateApi(branchId, dateFilterId);
                if (response && response.status === true) {
                    this.voidOrdersByDate = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch void orders');
                }
            } catch (error) {
                console.error('Error in fetchSalesByMonthApi:', error);
                this.error = error.message || 'Failed to fetch void orders';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateVoidStatusStore(orderVoidID, branchId, referenceNumber) {
            this.loading = true;
            this.error = null;
            try {
                if (!referenceNumber) {
                    throw new Error('Invalid reference_number.');
                }
                const response = await TRANSACT_API.updateVoidStatusApi(orderVoidID, branchId, referenceNumber);
                if (response && response.status === true) {
                    this.voidOrders = this.voidOrders.map(voidOrder =>
                        voidOrder.id === referenceNumber ? { ...voidOrder } : voidOrder
                    );
                    return response;
                } else {
                    throw new Error(response?.message || 'Failed to update void order');
                }
            } catch (error) {
                console.error('Error updating void order:', error);
                this.error = error.message || 'Failed to update void order';
                throw error;
            }
            finally {
                this.loading = false;
            }
        },

    },
});