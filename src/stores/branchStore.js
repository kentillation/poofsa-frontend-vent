import { defineStore } from 'pinia';
import { BRANCH_API } from '@/api/branchApi';

export const useBranchStore = defineStore('branches', {
    state: () => ({
        branches: [],
        currentBranch: null,
        loading: false,
        validatingBranch: false,
        error: null
    }),

    actions: {

        async createBranch(branchData) {
            this.validatingBranch = true;
            this.error = null;
            try {
                if (!BRANCH_API || typeof BRANCH_API.createBranch !== 'function') {
                    throw new Error('BRANCH_API service is not properly initialized');
                }
                const response = await BRANCH_API.createBranch(branchData);
                if (response && response.message) {
                    await this.fetchAllBranch();
                    return response;
                }
                throw new Error('Failed to create branch');
            } catch (error) {
                console.error('Error in createBranch:', error);
                this.error = 'Failed to create branch';
                throw error;
            } finally {
                this.validatingBranch = false;
            }
        },
        
        async fetchAllBranch() {
            this.loading = true;
            this.error = null;
            try {
                if (!BRANCH_API || typeof BRANCH_API.fetchBranches !== 'function') {
                    throw new Error('BRANCH_API service is not properly initialized');
                }
                const response = await BRANCH_API.fetchBranches();
                if (response && response.success) {
                    this.branches = response.branches || [];
                } else {
                    throw new Error(response?.message || 'Failed to fetch branches');
                }
            } catch (error) {
                console.error('Error in fetchBranches:', error);
                this.error = error.message || 'Failed to fetch branches';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchBranchDetailsStore(branchName) {
            this.error = null;
            try {
                if (!BRANCH_API || typeof BRANCH_API.fetchBranchDetails !== 'function') {
                    throw new Error('BRANCH_API service is not properly initialized');
                }
                const response = await BRANCH_API.fetchBranchDetails(branchName);
                if (response && response.data && response.status === 200) {
                    this.currentBranch = response.data.data;
                    return response.data;
                }
            } catch (error) {
                console.error(error);
                this.error = error.message;
                throw error;
            } finally {
                this.error = null;
            }
        }
    },

    getters: {
        getBranchNames: (state) => {
            return state.branches.map(branch => [
                typeof branch === 'object' ? branch.branch_name : branch,
                'mdi-chevron-right'
            ]);
        },

        getBranchById: (state) => (id) => {
            return state.branches.find(branch => branch.id === id);
        }
    }
});