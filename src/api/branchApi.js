import apiClient from '../axios';

export const BRANCH_API = {
    ENDPOINTS: {
        FETCH_SHOP_BRANCHES: '/admin/shop-branches',
        SAVE_NEW_BRANCH: '/admin/save-branch',
        FETCH_BRANCH_DETAILS: '/admin/branch-details'
    },

    async createBranch(branchData) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) throw new Error('Authentication token not found');
            if (!branchData) {
                throw new Error('Branch data is required');
            }
            const response = await apiClient.post(
                this.ENDPOINTS.SAVE_NEW_BRANCH,
                branchData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );
            if (!response.data) {
                throw new Error('No data received from server');
            }
            if (response.data.success === false) {
                throw new Error(response.data.message || 'Failed to create branch');
            }
            return response.data;
        } catch (error) {
            console.error('[BranchService] Error creating branch:', error);
            throw this._enhanceError(error, 'Failed to create branch');
        }
    },

    async fetchBranches() {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) throw new Error('Authentication token not found');
            const response = await apiClient.get(this.ENDPOINTS.FETCH_SHOP_BRANCHES, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to fetch branches');
            }
            return response.data;
        } catch (error) {
            console.error('[BranchService] Error fetching branches:', error);
            throw this._enhanceError(error, 'Failed to fetch branches');
        }
    },

    async fetchBranchDetails(branchName) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) throw new Error('Authentication token not found');
            if (!branchName) {
                throw new Error('Branch name is required');
            }
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_BRANCH_DETAILS}/${branchName}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response;
        } catch (error) {
            console.error(error);
            throw this._enhanceError(error);
        }
    },

    _enhanceError(error, defaultMessage) {
        const enhancedError = new Error(
            error.response?.data?.message ||
            error.message ||
            defaultMessage
        );
        enhancedError.response = error.response;
        enhancedError.status = error.response?.status;
        enhancedError.isApiError = true;
        return enhancedError;
    }
};