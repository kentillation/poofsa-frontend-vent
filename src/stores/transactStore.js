import { defineStore } from 'pinia';
import { TRANSACT_API } from '@/api/transactApi';

export const useTransactStore = defineStore('transactions', {
    state: () => ({
        transactions: [],
        allOrders: [],
        grossSalesByDate: [],
        salesByMonth: [],
        voidStatuses: [],
        voidOrdersByDate: [],
        voidOrders: [],
        grossSales: '',
        ordersOnly: '',
        productsOnly: '',
        stocksOnly: '',
        loading: false,
        error: null
    }),

    actions: {
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

        async fetchProductsOnlyStore(branchId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await TRANSACT_API.fetchProductsOnlyApi(branchId);
                if (response && response.status === true) {
                    this.productsOnly = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch products');
                }
            } catch (error) {
                console.error('Error in fetchProductsOnlyApi:', error);
                this.error = error.message || 'Failed to fetch products';
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

        async updateVoidStatusStore(transactionVoidID, branchId, referenceNumber, voidStatus) {
            this.loading = true;
            this.error = null;
            try {
                if (!referenceNumber || !voidStatus) {
                    throw new Error('Invalid branch_id, reference_number, or void status');
                }
                const response = await TRANSACT_API.updateVoidStatusApi(transactionVoidID, branchId, referenceNumber, voidStatus);
                if (response && response.status === true) {
                    this.voidOrders = this.voidOrders.map(voidOrder =>
                        voidOrder.id === referenceNumber ? { ...voidOrder, voidStatus } : voidOrder
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