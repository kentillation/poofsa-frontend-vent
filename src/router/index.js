import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/views/Login.vue';
import NotFound from '@/views/NotFound.vue';
import Register from '@/views/Register.vue';
import Home from '@/views/Home.vue';
import NewBranch from '@/views/NewBranch.vue';
import AddStock from '@/views/AddStock.vue';
import AddProduct from '@/views/AddProduct.vue';
import AddProductIngredients from '@/views/AddProductIngredients.vue';
import EditProducts from '@/views/EditProducts.vue';
import Help from '@/views/Help.vue';
import About from '@/views/About.vue';
import Settings from '@/views/Settings.vue';
import LoaderUI from '@/components/LoaderUI.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    { path: '/', name: 'LoginPage', component: LoginPage, meta: { requiresAuth: false } },
    { path: '/register', name: 'Register', component: Register },
    { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true } },
    { path: '/new-branch', name: 'NewBranch', component: NewBranch, meta: { requiresAuth: true } },
    { path: '/branch/:branchName', name: 'BranchView', component: () => import('../views/BranchView.vue'), props: true, meta: { requiresAuth: true } },
    { path: '/add-stock', name: 'AddStock', component: AddStock, meta: { requiresAuth: true } },
    { path: '/add-product', name: 'AddProduct', component: AddProduct, meta: { requiresAuth: true } },
    { path: '/add-product-ingredients', name: 'AddProductIngredients', component: AddProductIngredients, meta: { requiresAuth: true } },
    { path: '/edit-products', name: 'EditProducts', component: EditProducts, meta: { requiresAuth: true } },
    { path: '/help', name: 'Help', component: Help, meta: { requiresAuth: true } },
    { path: '/about', name: 'About', component: About, meta: { requiresAuth: true } },
    { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },
    { path: '/loader', name: 'LoaderUI', component: LoaderUI, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

router.beforeEach(async (to) => {
    const authStore = useAuthStore();
    authStore.checkAuth(); // Optional: Check token validity
    
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return '/';
    }
    
    if (to.path === '/' && authStore.isAuthenticated) {
        return '/';
    }
});

export default router;
