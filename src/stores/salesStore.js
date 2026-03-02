import { defineStore } from 'pinia';
import { SALES_API } from '@/api/salesApi';
import { formatDate, formatDateShort } from '@/utils/dateFormatter';

export const useSalesStore = defineStore('sales', {
    state: () => ({
        sales: [],
        salesReport: [],
        totalSalesCount: 0,
        totalSalesReport: 0,
        loadingSales: false,
        loadingSalesReport: false,
        error: null,
        _fetchCache: null,
        _lastFetchHash: null,
        salesByMonth: [],
    }),

    actions: {

        _getCacheKey(branchId, page, itemsPerPage, search) {
            return JSON.stringify({ branchId, page, itemsPerPage, search });
        },

        _transformSales(sale = {}) {
            if (!sale || typeof sale !== 'object') {
                return {
                    sale_id: null,
                    sale_number: '',
                    table_number: '',
                    reference_number: '',
                    cashier_name: '',
                    sale_status: '',
                    sale_status_id: null,
                    sale_type: '',
                    total_quantity: null,
                    sales_status: '',
                };
            }
            return {
                sale_id: sale.sale_id,
                sale_number: sale.sale_number,
                table_number: sale.table_number,
                reference_number: sale.reference_number,
                cashier_name: sale.cashier_name,
                sale_status: sale.sale_status,
                sale_status_id: sale.sale_status_id,
                sale_type: sale.sale_type,
                total_quantity: sale.total_quantity,
                sales_status: sale.sales_status,
                updatedAtFormatted: sale.updated_at ? formatDate(sale.updated_at) : '',
                updatedAtShort: sale.updated_at ? formatDateShort(sale.updated_at) : '',
                ...sale
            };
        },

        _transformSalesHistory(saleHistory = {}) {
            if (!saleHistory || typeof saleHistory !== 'object') {
                return {
                    sale_history_id: null,
                    sale_id: null,
                    sale_number: '',
                    table_number: '',
                    reference_number: '',
                    cashier_name: '',
                    sale_status: '',
                    sale_status_id: null,
                    sale_type: '',
                    total_quantity: null,
                    sales_status: '',
                    updatedAtFormatted: '',
                    updatedAtShort: '',
                };
            }
            return {
                sale_history_id: saleHistory.sale_history_id,
                sale_id: saleHistory.sale_id,
                sale_number: saleHistory.sale_number,
                table_number: saleHistory.table_number,
                reference_number: saleHistory.reference_number,
                cashier_name: saleHistory.cashier_name,
                sale_status: saleHistory.sale_status,
                sale_status_id: saleHistory.sale_status_id,
                sale_type: saleHistory.sale_type,
                total_quantity: saleHistory.total_quantity,
                sales_status: saleHistory.sales_status,
                updatedAtFormatted: saleHistory.updated_at ? formatDate(saleHistory.updated_at) : '',
                updatedAtShort: saleHistory.updated_at ? formatDateShort(saleHistory.updated_at) : '',
                ...saleHistory
            };
        },

        async fetchSales(branchId, page = 1, itemsPerPage = 10, search = '') {
            const cacheKey = this._getCacheKey(branchId, page, itemsPerPage, search);
            if (this._fetchCache && this._lastFetchHash === cacheKey) {
                return this._fetchCache;
            }
            this.loadingSales = true;
            this.error = null;
            try {
                const response = await SALES_API.fetchSales(branchId, page, itemsPerPage, search);
                this.sales = response.data.sales.map(this._transformSales);
                this.totalSalesCount = response.data.total;
                this._fetchCache = response.data.sales;
                this._lastFetchHash = cacheKey;
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch sales';
            } finally {
                this.loadingSales = false;
            }
        },

        async fetchSalesReport(branchId, month, year) {
            this.loadingSalesReport = true;
            this.error = null;
            try {
                const response = await SALES_API.fetchSalesReport(branchId, month, year);
                this.salesReport = response.data.sales.map(this._transformSales);
                this.totalSalesReport = response.data.total;
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch sales report';
            } finally {
                this.loadingSalesReport = false;
            }
        },

        async fetchSalesCountStore(branchId) {
            if (!branchId) {
                this.error = 'Branch ID is required';
                return;
            }
            this.loadingSales = true;
            this.error = null;
            try {
                const response = await SALES_API.fetchSalesCountApi(branchId);
                if (!response?.success) {
                    throw new Error(response?.message || 'Failed to fetch total sales');
                }
                const totalSales = response.data.total_sales;
                const formattedTotalSales = (Math.round(totalSales * 100) / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '';
                this.totalSalesCount = formattedTotalSales;
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch total sales';
            } finally {
                this.loadingSales = false;
            }
        },

        async fetchSalesByMonthStore(branchId, dateFilterId = null) {
            this.error = null;
            try {
                const response = await SALES_API.fetchSalesByMonthApi(branchId, dateFilterId);
                if (response && response.status === true) {
                    this.salesByMonth = response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch sales');
                }
            } catch (error) {
                console.error('Error in fetchSalesByMonthApi:', error);
                this.error = error.message || 'Failed to fetch sales';
                throw error;
            }
        },

    }
});