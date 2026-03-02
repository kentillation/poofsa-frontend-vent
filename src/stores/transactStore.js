import { defineStore } from 'pinia';
import { TRANSACT_API } from '@/api/transactApi';

export const useTransactStore = defineStore('transactions', {
    state: () => ({
        transactions: [],
        orders: [],
        ordersHistory: [],
        total: 0,
        ordersHistoryTotal: 0,
        grossSalesByDate: [],
        voidStatuses: [],
        voidOrdersByDate: [],
        voidOrders: [],
        grossSales: '',
        totalSales: null,
        ordersOnly: '',
        stocksOnly: '',
        loading: false,
        error: null,
    }),

    actions: {

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
                console.error('Error in fetchVoidByDateApi:', error);
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