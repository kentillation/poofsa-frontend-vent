import apiClient from '../axios';

export const SALES_API = {
    ENDPOINTS: {
        FETCH_ALL_SALES: '/admin/sales',
        FETCH_SALES_REPORT: '/admin/sales-report',
        FETCH_SALES_COUNT: '/admin/total-sales',
        FETCH_SALES_BY_MONTH: '/admin/sales-by-month',
    },

    /**
     * Sales Information
     * @param {string|number} branchId - ID of the branch to fetch sales for
     * @returns {Promise<Object>} Sales data for the branch
     * @throws {Error} Enhanced error with server response details
     */

    async fetchAllSalesApi({ branchId, page = 1, itemsPerPage = 10, search = '' }) {
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

            const response = await apiClient.get(this.ENDPOINTS.FETCH_ALL_SALES, config);

            return {
                success: response.data?.success ?? true,
                data: response.data?.data ?? response.data ?? [],
                total: response.data?.total ?? (response.data?.data?.length ?? 0),
                message: response.data?.message ?? 'Success'
            };
        } catch (error) {
            console.error('[SALES_API] Error fetching sales:', error);
            throw error;
        }
    },

    async fetchSalesReportApi({ branchId, page = 1, itemsPerPage = 10, dateFilter = 1 }) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }

            const params = {
                branch_id: branchId,
                page,
                itemsPerPage,
                date_filter: dateFilter
            };

            if (dateFilter) {
                params.date_filter = dateFilter;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                params
            };

            const response = await apiClient.get(this.ENDPOINTS.FETCH_SALES_REPORT, config);

            return {
                success: response.data?.success ?? true,
                data: response.data?.data ?? response.data ?? [],
                total: response.data?.total ?? (response.data?.data?.length ?? 0),
                message: response.data?.message ?? 'Success'
            };

        } catch (error) {
            console.error('[SALES_API] Error fetching sales report:', error);
            throw error;
        }
    },

    async fetchSalesCountApi(branchId) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }

            const params = {
                branch_id: branchId
            };

            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                params
            };

            const response = await apiClient.get(this.ENDPOINTS.FETCH_SALES_COUNT, config);

            return {
                success: response.data?.success ?? true,
                data: response.data?.data ?? response.data ?? [],
                total: response.data?.total ?? (response.data?.data?.length ?? 0),
                message: response.data?.message ?? 'Success'
            };

        } catch (error) {
            console.error('[ORDERS_API] Error fetching orders count:', error);
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
};
