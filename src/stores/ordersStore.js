import { defineStore } from 'pinia';
import { ORDERS_API } from '@/api/ordersApi';
import { formatDate, formatDateShort } from '@/utils/dateFormatter';

export const useOrdersStore = defineStore('orders', {
    state: () => ({
        orders: [],
        ordersReport: [],
        total: 0,
        totalOrdersReport: 0,
        loadingOrders: false,
        loadingOrdersReport: false,
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
                    order_id: null,
                    order_number: '',
                    order_status: '',
                    order_status_id: null,
                    table_number: '',
                    order_type: '',
                    total_quantity: null,
                    total_amount: null,
                    customer_change: null,
                    sales_status: '',
                    payment_method: '',
                    payment_method_id: null,
                };
            }

            return {
                order_id: order.order_id,
                order_number: order.order_number,
                order_status: order.order_status,
                order_status_id: order.order_status_id,
                table_number: order.table_number,
                order_type: order.order_type,
                total_quantity: order.total_quantity,
                total_amount: order.total_amount,
                customer_change: order.customer_change,
                sales_status: order.sales_status,
                payment_method: order.payment_method,
                payment_method_id: order.payment_method_id,
                updatedAtFormatted: order.updated_at ? formatDate(order.updated_at) : '',
                updatedAtShort: order.updated_at ? formatDateShort(order.updated_at) : '',
                ...order
            };
        },

        _transformOrdersHistory(orderHistory = {}) {
            if (!orderHistory || typeof orderHistory !== 'object') {
                return {
                    order_number: '',
                    updatedAtFormatted: '',
                    updatedAtShort: '',
                };
            }

            return {
                order_number: orderHistory.order_number,
                updatedAtFormatted: orderHistory.updated_at ? formatDate(orderHistory.updated_at) : '',
                updatedAtShort: orderHistory.updated_at ? formatDateShort(orderHistory.updated_at) : '',
                ...orderHistory
            };
        },

        clearError() {
            this.error = null;
        },

        _enrichOrderWithLabels(order) {
            const existing = this.orders.find(s => s.order_id === order.order_id);

            return {
                ...order,
                order_id: order.order_id || existing?.order_id || 0,
                order_number: order.order_number || existing?.order_number || '',
                order_status: order.order_status || existing?.order_status || '',
                order_status_id: order.order_status_id || existing?.order_status_id || null,
                table_number: order.table_number || existing?.table_number || '',
                order_type: order.order_type || existing?.order_type || '',
                total_quantity: order.total_quantity || existing?.total_quantity || null,
                total_amount: order.total_amount || existing?.total_amount || null,
                customer_change: order.customer_change || existing?.customer_change || null,
                sales_status: order.sales_status || existing?.sales_status || '',
                payment_method: order.payment_method || existing?.payment_method || '',
                payment_method_id: order.payment_method_id || existing?.payment_method_id || '',
                updatedAtFormatted: order.updated_at ? formatDate(order.updated_at) : existing?.updatedAtFormatted || '',
                updatedAtShort: order.updated_at ? formatDateShort(order.updated_at) : existing?.updatedAtShort || '',
            };
        },

        async fetchAllOrdersStore({ branchId, page = 1, itemsPerPage = 10, search = '' }) {
            if (!branchId) {
                this.error = 'Branch ID is required';
                return;
            }

            const cacheKey = this._getCacheKey(branchId, page, itemsPerPage, search);

            if (this._lastFetchHash === cacheKey && this.orders.length > 0) {
                return;
            }

            this.loadingOrders = true;
            this.error = null;

            try {
                const response = await ORDERS_API.fetchAllOrdersApi({
                    branchId,
                    page,
                    itemsPerPage,
                    search
                });

                if (!response?.success) {
                    throw new Error(response?.message || 'Failed to fetch orders');
                }

                let rawOrders = Array.isArray(response.data) ? response.data : [];
                const totalCount = response.total ?? rawOrders.length;

                const beforeLength = rawOrders.length;
                rawOrders = rawOrders.filter(s => s && typeof s === 'object');
                if (rawOrders.length !== beforeLength) {
                    console.warn('[ordersStore] removed invalid items from API response', {
                        before: beforeLength,
                        after: rawOrders.length,
                        branchId,
                        search
                    });
                }

                this.orders = rawOrders.map(s => this._transformOrders(s));
                this.total = totalCount;
                this._lastFetchHash = cacheKey;
                this._fetchCache = { rawOrders, totalCount };

            } catch (error) {
                this.error = error.message || 'Failed to fetch orders';
                this.orders = [];
                this.total = 0;
                this._lastFetchHash = null;
                throw error;
            } finally {
                this.loadingOrders = false;
            }
        },

        async fetchOrdersReportStore({ branchId, page = 1, itemsPerPage = 10, dateFilter = 1 }) {
            if (!branchId) {
                this.error = 'Branch ID is required';
                return;
            }

            const cacheKey = this._getCacheKey(branchId, page, itemsPerPage, dateFilter);

            if (this._lastFetchHash === cacheKey && this.ordersReport.length > 0) {
                return;
            }

            this.loadingOrdersReport = true;
            this.error = null;

            try {
                const response = await ORDERS_API.fetchOrdersReportApi({
                    branchId,
                    page,
                    itemsPerPage,
                    dateFilter
                });

                if (!response?.success) {
                    throw new Error(response?.message || 'Failed to fetch orders report');
                }

                let rawOrders = Array.isArray(response.data) ? response.data : [];
                const totalCount = response.totalOrdersReport ?? rawOrders.length;

                const beforeLength = rawOrders.length;
                rawOrders = rawOrders.filter(s => s && typeof s === 'object');
                if (rawOrders.length !== beforeLength) {
                    console.warn('[ordersStore] removed invalid items from API response', {
                        before: beforeLength,
                        after: rawOrders.length,
                        branchId,
                        dateFilter
                    });
                }

                this.ordersReport = rawOrders.map(s => this._transformOrders(s));
                this.totalOrdersReport = totalCount;
                this._lastFetchHash = cacheKey;
                this._fetchCache = { rawOrders, totalCount };

            } catch (error) {
                this.error = error.message || 'Failed to fetch orders report';
                this.ordersReport = [];
                this.totalOrdersReport = 0;
                this._lastFetchHash = null;
                throw error;
            } finally {
                this.loadingOrders = false;
            }

        },

    },
});