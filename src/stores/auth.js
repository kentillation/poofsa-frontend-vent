import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();

    // State
    const token = ref(localStorage.getItem('auth_token') || null);    
    const shopName = ref(localStorage.getItem('shop_name') || null);
    const shopId = ref(localStorage.getItem('shop_id') || null);
    const error = ref(null);

    // Getters
    const isAuthenticated = computed(() => !!token.value);
    const getShopName = computed(() => shopName.value);

    // Actions
    const login = async (credentials) => {
        error.value = null;
        try {
            const response = await apiClient.post('/admin/login', credentials);

            if (response.status === 200) {
                localStorage.setItem('auth_token', response.data.access_token);
                localStorage.setItem('shop_id', response.data.shop_id);
                localStorage.setItem('shop_name', response.data.shop_name);

                token.value = response.data.access_token;
                shopId.value = response.data.shop_id;
                shopName.value = response.data.shop_name;
                
                return { 
                    success: true,
                    shop_id: response.data.shop_id,
                    shop_name: response.data.shop_name,
                };
            }
        } catch (err) {
            error.value = err.response?.data?.message ||
                err.message ||
                'Login failed. Please try again.';
            throw error.value;
        }
    };

    const logout = async () => {
        const currentToken = token.value;
        token.value = null;
        shopId.value = null;
        shopName.value = null;
        error.value = null;
        localStorage.removeItem('auth_token', token.value);        
        localStorage.removeItem('shop_id', shopId.value);
        localStorage.removeItem('shop_name', shopName.value);
        // localStorage.clear();
        try {
            if (currentToken) {
                await apiClient.post('/admin/logout', null, {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    },
                    timeout: 1000
                });
            }
        } catch (err) {
            console.error('Logout API error:', err);
        }
        window.location.href = '/';
    };

    // Auto-logout if token expires
    const checkAuth = () => {
        if (!token.value) {
            const savedToken = localStorage.getItem('auth_token');
            if (savedToken) {
                token.value = savedToken;
            } else if (router.currentRoute.value.meta.requiresAuth) {
                logout();
            }
        }
    };

    return {
        token,
        shopId,
        shopName,
        error,
        isAuthenticated,
        getShopName,
        login,
        logout,
        checkAuth,
    };
});
