<template>
    <v-container>
        <h2>{{ branchDetails.branch_name || branchName }} Branch</h2>
        <template v-if="branchDetails.branch_name">
            <v-card class="pa-4 mt-3">
                <v-tabs v-model="activeTab" class="mt-5" align-tabs="center" color="white" show-arrows>
                    <v-tab v-for="tab in tabs" :key="tab.value" class="rounded" :value="tab.value"
                        :class="{ 'active-tab': activeTab === tab.value }"
                        @click="tab.clickHandler ? tab.clickHandler() : null">
                        {{ tab.label }}
                    </v-tab>
                </v-tabs>
                <v-tabs-window v-model="activeTab">
                    <transition name="slide-x-transition" mode="out-in">
                        <div :key="activeTab">
                            <!-- Dashboard -->
                            <v-tabs-window-item value="dashboard">
                                <v-container>
                                    <v-row>
                                        <!-- Sales -->
                                        <v-col cols="12" lg="3" md="6" sm="6">
                                            <v-card elevation="5" color="#0090b6" height="138">
                                                <v-card-text>
                                                    <p class="text-grey-lighten-4">Total Sales</p>
                                                    <div class="d-flex justify-center">
                                                        <template v-if="textSkeleton">
                                                            <v-skeleton-loader type="text" 
                                                            style="background-color: #0090b6;" 
                                                            width="100" />
                                                        </template>
                                                        <template v-else>
                                                            <h2 class="my-2 text-white">₱ {{ totalSales }}</h2>
                                                        </template>
                                                    </div>
                                                </v-card-text>
                                                <v-icon class="position-absolute"
                                                    style="top: 75px; left: -10px;" 
                                                    size="80">mdi-account-cash</v-icon>
                                            </v-card>
                                        </v-col>

                                        <!-- Orders -->
                                        <v-col cols="12" lg="3" md="6" sm="6">
                                            <v-card elevation="5" color="#0090b6" height="138">
                                                <v-card-text>
                                                    <p class="text-grey-lighten-4">Total Orders</p>
                                                    <div class="d-flex justify-center">
                                                        <template v-if="textSkeleton">
                                                            <v-skeleton-loader type="text" 
                                                            style="background-color: #0090b6;" 
                                                            width="100" />
                                                        </template>
                                                        <template v-else>
                                                            <div class="d-flex align-center">
                                                                <h2 class="my-2 text-white">{{ totalOrders }}</h2> &nbsp;
                                                                <span style="font-size: 18px;">
                                                                    <p class="text-white">{{ totalOrders > 1 ? 'items' : 'item' }}</p>
                                                                </span>
                                                            </div>
                                                        </template>
                                                    </div>
                                                </v-card-text>
                                                <v-icon class="position-absolute"
                                                    style="top: 70px; left: -10px;"
                                                    size="80">mdi-invoice-text-outline</v-icon>
                                            </v-card>
                                        </v-col>

                                        <!-- Products -->
                                        <v-col cols="12" lg="3" md="6" sm="6">
                                            <v-card elevation="5">
                                                <v-card-text>
                                                    <p class="text-grey">Total Products</p>
                                                    <div class="d-flex  align-center justify-center">
                                                        <template v-if="textSkeleton">
                                                            <v-skeleton-loader type="text" width="100" />
                                                        </template>
                                                        <template v-else>
                                                            <h2 class="my-2">{{ totalProducts }}</h2> &nbsp;
                                                            <span style="font-size: 18px;">
                                                                <p>{{ totalProducts > 1 ? 'items' : 'item' }}</p>
                                                            </span>
                                                        </template>
                                                    </div>
                                                    <div class="d-flex justify-end mt-3">
                                                        <v-btn color="#0090b6"
                                                            class="pa-2 w-50 d-flex justify-center rounded" size="small"
                                                            @click="switchToProductsTab()">
                                                            <v-icon>mdi-eye-outline</v-icon>&nbsp; View
                                                        </v-btn>
                                                    </div>
                                                </v-card-text>
                                                <v-icon color="brown" class="position-absolute"
                                                    style="top: 75px; left: -10px;" size="80">mdi-food-outline</v-icon>
                                            </v-card>
                                        </v-col>

                                        <!-- Stocks -->
                                        <v-col cols="12" lg="3" md="6" sm="6">
                                            <v-card elevation="5">
                                                <v-card-text>
                                                    <p class="text-grey">Total Stocks</p>
                                                    <div class="d-flex align-center justify-center">
                                                        <template v-if="textSkeleton">
                                                            <v-skeleton-loader type="text" width="100" />
                                                        </template>
                                                        <template v-else>
                                                            <h2 class="my-2">{{ totalStocks }}</h2> &nbsp;
                                                            <span style="font-size: 18px;">
                                                                <p>{{ totalStocks > 1 ? 'items' : 'item' }}</p>
                                                            </span>
                                                        </template>
                                                    </div>
                                                    <div class="d-flex justify-end mt-3">
                                                        <v-btn color="#0090b6"
                                                            class="pa-2 w-50 d-flex justify-center rounded" size="small"
                                                            @click="switchToStocksTab()">
                                                            <v-icon>mdi-eye-outline</v-icon>&nbsp; View
                                                        </v-btn>
                                                    </div>
                                                </v-card-text>
                                                <v-icon color="brown" class="position-absolute"
                                                    style="top: 70px; left: -10px;"
                                                    size="80">mdi-archive-outline</v-icon>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </v-container>

                                <!-- Sales Visualization -->
                                <v-container>
                                    <h3 class="my-3">Sales Trends</h3>
                                    <v-card>
                                        <v-card-text>
                                            <SalesChart :sales-by-month="salesByMonthReports" :sales-only="totalSales"
                                                :orders-only="totalOrders" @month-changed="fetchSalesByMonthReport"
                                                @sales-changed="fetchSalesOnly" @orders-changed="fetchOrdersOnly" />
                                            <!-- added (:orders-only="totalOrders" and @orders-changed="fetchOrdersOnly -->
                                        </v-card-text>
                                    </v-card>
                                </v-container>
                            </v-tabs-window-item>

                            <!-- Products -->
                            <v-tabs-window-item value="products">
                                <v-container>
                                    <ProductsTable @edit-product="editProductDialog"
                                        @view-ingredients="ingredientsDialog" :products="products"
                                        :shop-id="branchDetails.shop_id"
                                        :branch-id="branchDetails.branch_id" :branch-name="branchDetails.branch_name" />
                                    <ProductEditDialog v-model="productEditDialog"
                                        @update:modelValue="productEditDialog = $event"
                                        @update:product="currentProduct = $event"
                                        @update:confirm="confirmUpdatingProductDialog = $event"
                                        :product="currentProduct" @save="updatingProduct" :valid="formValid"
                                        :loading="isSaving" :confirm="confirmUpdatingProductDialog"
                                        :selected-product="currentProduct?.product_name || ''" />
                                    <ProductIngredientsDialog v-model="dialogIngredients"
                                        :product-items="ingredients" :loading="loadingIngredient"
                                        @edit-ingredient="editIngredientDialog" :shop-id="branchDetails.shop_id"
                                        :branch-id="branchDetails.branch_id" :branch-name="branchDetails.branch_name"
                                        :product-id="productId" :product-name="productName" :product-temp="productTemp"
                                        :product-size="productSize" />
                                    <IngredientEditDialog v-model="ingredientEditDialog"
                                        @update:modelValue="ingredientEditDialog = $event"
                                        @update:ingredient="currentIngredient = $event"
                                        @update:confirm="confirmUpdatingIngredientDialog = $event"
                                        :ingredient="currentIngredient" @save="updatingIngredient" :valid="formValid"
                                        :loading="isSaving" :confirm="confirmUpdatingIngredientDialog" />
                                    <ProductsHistoryDialog v-model="productsHistoryDialog"
                                        :branch-id="branchDetails.branch_id" />
                                    <v-btn @click="openProductHistory" prepend-icon="mdi-history" color="#0090b6"
                                        class="mt-3" variant="flat">
                                        <span class="to-hide">Products History</span>
                                        <span class="to-show">History</span>
                                    </v-btn>
                                </v-container>
                            </v-tabs-window-item>

                            <!-- Stocks -->
                            <v-tabs-window-item value="stocks">
                                <v-container>
                                    <StocksTable @edit-stock="openEditStockDialog" :stocks="stocks"
                                        :shop-id="branchDetails.shop_id"
                                        :branch-id="branchDetails.branch_id" :branch-name="branchDetails.branch_name" />
                                    <StockEditDialog v-model="stockEditDialog"
                                        @update:modelValue="stockEditDialog = $event"
                                        @update:stock="currentStock = $event"
                                        @update:confirm="confirmUpdatingStockDialog = $event" :stock="currentStock"
                                        @save="updatingStock" :valid="formValid" :loading="isSaving"
                                        :confirm="confirmUpdatingStockDialog"
                                        :selected-stock="currentStock?.stock_ingredient || ''" />

                                    <StocksHistoryDialog v-model="stockHistoryDialog"
                                        :branch-id="branchDetails.branch_id" />
                                    <v-btn @click="openStockHistory" prepend-icon="mdi-history" color="#0090b6"
                                        class="mt-3" variant="flat">
                                        <span class="to-hide">Stocks History</span>
                                        <span class="to-show">History</span>
                                    </v-btn>
                                </v-container>
                            </v-tabs-window-item>

                            <!-- Void Orders -->
                            <v-tabs-window-item value="void-orders">
                                <v-container>
                                    <VoidOrdersTable :void-by-date="transactStore.voidOrdersByDate"
                                        :branch-id="branchDetails.branch_id" />
                                </v-container>
                            </v-tabs-window-item>

                            <!-- Branch Info -->
                            <v-tabs-window-item value="branch-info">
                                <v-container>
                                    <v-tabs v-model="activeBranchInfoTab" style="background: #01546b;"
                                        class="d-flex px-3 rounded" align-tabs="left" color="white" stacked show-arrows>
                                        <v-tab v-for="tab in branchInfoTabs" :key="tab.value"
                                            class="rounded text-white mt-4 mx-2" :value="tab.value"
                                            :class="{ 'active-tab': activeBranchInfoTab === tab.value }"
                                            @click="tab.clickHandler ? tab.clickHandler() : null">
                                            {{ tab.label }}
                                        </v-tab>
                                    </v-tabs>
                                    <transition name="slide-x-transition" mode="out-in">
                                        <div :key="activeBranchInfoTab">

                                            <v-container v-if="activeBranchInfoTab === 'details'" class="mt-5">
                                                <v-row>
                                                    <v-col v-for="(detail, i) in branch_Details" :key="i" cols="12"
                                                        lg="4" md="4" sm="6">
                                                        <p class="text-grey-darken-1">{{ detail.label }}</p>
                                                        <h4 class="mb-5">{{ detail.value }}</h4>
                                                    </v-col>
                                                </v-row>
                                                <div class="d-flex justify-end">
                                                    <v-btn prepend-icon="mdi-pencil" color="#0090b6" variant="flat"
                                                        @click="activeBranchInfoTab = 'details'">&nbsp; Edit</v-btn>
                                                </div>
                                            </v-container>

                                            <v-container v-if="activeBranchInfoTab === 'cashier'" class="mt-5">
                                                <v-row>
                                                    <v-col v-for="(detail, i) in cashier_Details" :key="i" cols="12"
                                                        lg="4" md="4" sm="6">
                                                        <p class="text-grey-darken-1">{{ detail.label }}</p>
                                                        <h4 class="mb-5">{{ detail.value }}</h4>
                                                    </v-col>
                                                </v-row>
                                            </v-container>

                                            <v-container v-if="activeBranchInfoTab === 'barista'" class="mt-5">
                                                <v-row>
                                                    <v-col v-for="(detail, i) in barista_Details" :key="i" cols="12"
                                                        lg="4" md="4" sm="6">
                                                        <p class="text-grey-darken-1">{{ detail.label }}</p>
                                                        <h4 class="mb-5">{{ detail.value }}</h4>
                                                    </v-col>
                                                </v-row>
                                            </v-container>

                                            <v-container v-if="activeBranchInfoTab === 'kitchen'" class="mt-5">
                                                <v-row>
                                                    <v-col v-for="(detail, i) in kitchen_Details" :key="i" cols="12"
                                                        lg="4" md="4" sm="6">
                                                        <p class="text-grey-darken-1">{{ detail.label }}</p>
                                                        <h4 class="mb-5">{{ detail.value }}</h4>
                                                    </v-col>
                                                </v-row>
                                            </v-container>

                                        </div>
                                    </transition>
                                </v-container>
                            </v-tabs-window-item>

                            <!-- Reports -->
                            <v-tabs-window-item value="reports">
                                <v-container>
                                    <v-tabs v-model="activeReportsTab" style="background: #01546b;"
                                        class="d-flex px-3 rounded" align-tabs="left" color="white" stacked show-arrows>
                                        <v-tab v-for="tab in reportsTabs" :key="tab.value"
                                            class="text-white rounded mt-4 mx-2" :value="tab.value"
                                            :class="{ 'active-tab': activeReportsTab === tab.value }"
                                            @click="tab.clickHandler ? tab.clickHandler() : null">
                                            {{ tab.label }}
                                        </v-tab>
                                    </v-tabs>
                                    <transition name="slide-x-transition" mode="out-in">
                                        <div :key="activeReportsTab">
                                            <SalesReportsTableSkeleton
                                                v-if="loadingSalesReports && activeReportsTab === 'sales'" />
                                            <SalesReportTable v-else-if="activeReportsTab === 'sales'"
                                                :sales-by-date="transactStore.grossSalesByDate"
                                                :loading="loadingSalesReports" :shop-id="branchDetails.shop_id"
                                                :shop-name="branchDetails.shop_name"
                                                :branch-id="branchDetails.branch_id"
                                                :branch-name="branchDetails.branch_name"
                                                :branch-location="branchDetails.branch_location"
                                                :contact="branchDetails.contact"
                                                :admin-name="branchDetails.admin_name" />

                                            <OrdersReportsTableSkeleton
                                                v-if="loadingTransactionsReports && activeReportsTab === 'orders'" />
                                            <OrdersReportTable v-else-if="activeReportsTab === 'orders'"
                                                :all-orders="transactStore.transactions"
                                                :loading="loadingTransactionsReports" :shop-id="branchDetails.shop_id"
                                                :shop-name="branchDetails.shop_name"
                                                :branch-id="branchDetails.branch_id"
                                                :branch-name="branchDetails.branch_name"
                                                :branch-location="branchDetails.branch_location"
                                                :contact="branchDetails.contact"
                                                :admin-name="branchDetails.admin_name" />

                                            <StocksReportsTableSkeleton
                                                v-if="loadingStockReports && activeReportsTab === 'stocks'" />
                                            <StocksReportTable v-else-if="activeReportsTab === 'stocks'"
                                                :stocks="stockReports" :loading="loadingStockReports"
                                                :shop-id="branchDetails.shop_id" :shop-name="branchDetails.shop_name"
                                                :branch-id="branchDetails.branch_id"
                                                :branch-name="branchDetails.branch_name"
                                                :branch-location="branchDetails.branch_location"
                                                :contact="branchDetails.contact"
                                                :admin-name="branchDetails.admin_name" />
                                        </div>
                                    </transition>
                                </v-container>
                            </v-tabs-window-item>
                        </div>
                    </transition>
                </v-tabs-window>
            </v-card>
        </template>
        <Snackbar ref="snackbarRef" />
        <Alert ref="lowStockAlertRef" />
    </v-container>
</template>

<script>
// import apiClient from '../axios';
import { ref, computed, onMounted } from 'vue';
import { useLoadingStore } from '@/stores/loading';
import { useBranchStore } from '@/stores/branchStore';
import { useStocksStore } from '@/stores/stocksStore';
import { useStockOptionsStore } from '@/stores/stockOptionsStore';
import { useProductsStore } from '@/stores/productsStore';
import { useProductOptionsStore } from '@/stores/productOptionsStore';
import { useTransactStore } from '@/stores/transactStore';
import Snackbar from '@/components/Snackbar.vue';
import Alert from '@/components/Alert.vue';
import ProductsTable from '@/components/ProductsTable.vue';
import ProductEditDialog from '@/components/ProductEditDialog.vue';
import IngredientEditDialog from '@/components/IngredientEditDialog.vue';
import ProductIngredientsDialog from '@/components/ProductIngredientsDialog.vue';
import StocksTable from '@/components/StocksTable.vue';
import StockEditDialog from '@/components/StockEditDialog.vue';
import StocksHistoryDialog from '@/components/StocksHistoryDialog.vue';
import ProductsHistoryDialog from '@/components/ProductsHistoryDialog.vue';
import StocksReportTable from '@/components/StocksReportTable.vue';
import StocksReportsTableSkeleton from '@/components/StocksReportsTableSkeleton.vue';
import OrdersReportTable from '@/components/OrdersReportTable.vue';
import OrdersReportsTableSkeleton from '@/components/OrdersReportsTableSkeleton.vue';
import SalesReportTable from '@/components/SalesReportTable.vue';
import SalesReportsTableSkeleton from '@/components/SalesReportsTableSkeleton.vue';
import VoidOrdersTable from '@/components/VoidOrdersTable.vue';
import SalesChart from '@/components/SalesChart.vue';

export default {
    name: 'BranchView',
    components: {
        Snackbar,
        Alert,
        ProductsTable,
        ProductEditDialog,
        ProductIngredientsDialog,
        IngredientEditDialog,
        StocksTable,
        StockEditDialog,
        StocksHistoryDialog,
        ProductsHistoryDialog,
        StocksReportTable,
        StocksReportsTableSkeleton,
        OrdersReportTable,
        OrdersReportsTableSkeleton,
        SalesReportTable,
        SalesReportsTableSkeleton,
        VoidOrdersTable,
        SalesChart,
    },
    data() {
        return {
            // Branch
            branchDetails: {},
            loadingBranchDetails: false,

            // Dashboard
            textSkeleton: false,
            totalSales: null,
            totalOrders: null,
            totalProducts: null,
            totalStocks: null,
            loadingSalesOnly: false,
            loadingOrdersOnly: false,
            loadingProductsOnly: false,
            loadingStocksOnly: false,

            // Products
            products: [],
            editProduct: [],
            selectedProduct: '',
            product_alone: '',
            productEditDialog: false,
            confirmUpdatingProductDialog: false,
            productsHistoryDialog: false,
            productsLoaded: false,
            currentProduct: null,

            // Product Ingredients
            ingredients: [],
            editIngredient: [],
            productName: '',
            productTemp: '',
            productSize: '',
            productId: 0,
            loadingIngredient: false,
            dialogIngredients: false,
            ingredientEditDialog: false,
            confirmUpdatingIngredientDialog: false,
            currentIngredient: null,

            // Stocks
            stocks: [],
            editStock: [],
            selectedStock: '',
            stockEditDialog: false,
            confirmUpdatingStockDialog: false,
            stockHistoryDialog: false,
            stocksLoaded: false,
            currentStock: null,

            // Void Blotter
            voidByDate: [],

            // Reports
            dateFilter: 1,
            formValid: true,
            isSaving: false,
            stockReports: [],
            stockReportsLoaded: false,
            loadingStockReports: false,
            transactionReports: [],
            transactionReportsLoaded: false,
            loadingTransactionsReports: false,
            salesByDateReports: [],
            salesByDateReportsLoaded: false,
            loadingSalesReports: false,
            salesByMonthReports: [],
            loadingSalesByMonthReports: false,



        };
    },
    props: {
        branchName: {
            type: String,
            required: true
        },
    },
    setup() {
        const branchStore = useBranchStore();
        const loadingStore = useLoadingStore();
        const stocksStore = useStocksStore();
        const stockOptionsStore = useStockOptionsStore();
        const stockUnitOption = computed(() => stockOptionsStore.unitOption);
        const stockAvailabilityOption = computed(() => stockOptionsStore.availabilityOption);
        const productsStore = useProductsStore();
        const productOptionsStore = useProductOptionsStore();
        const productTemperatureOption = computed(() => productOptionsStore.temperatureOptions);
        const productSizeOption = computed(() => productOptionsStore.sizeOptions);
        const productCategoryOption = computed(() => productOptionsStore.categoryOptions);
        const shopStationOption = computed(() => productOptionsStore.stationOptions);
        const productAvailabilityOption = computed(() => productOptionsStore.availabilityOptions);
        const transactStore = useTransactStore();
        const activeTab = ref('dashboard');
        const activeReportsTab = ref('sales');
        const activeBranchInfoTab = ref('details');

        onMounted(async () => {
        // await productOptionsStore.fetchAllOptions();
        // await stockOptionsStore.fetchAllOptions();
        });

        return {
            branchStore,
            loadingStore,
            stocksStore,
            stockOptionsStore,
            stockUnitOption,
            stockAvailabilityOption,
            productsStore,
            productOptionsStore,
            productTemperatureOption,
            productSizeOption,
            productCategoryOption,
            shopStationOption,
            productAvailabilityOption,
            transactStore,
            activeTab,
            activeReportsTab,
            activeBranchInfoTab
        };
    },
    computed: {

        branch_Details() {
            return [
                { label: 'Branch name', value: this.branchDetails.branch_name },
                { label: 'Branch manager', value: this.branchDetails.m_name },
                { label: 'Contact', value: this.branchDetails.contact },
                { label: 'Email', value: this.branchDetails.m_email },
                { label: 'Location', value: this.branchDetails.branch_location },
            ];
        },

        cashier_Details() {
            return [
                { label: 'Name', value: this.branchDetails.cashier_name },
                { label: 'Email', value: this.branchDetails.cashier_email },
            ];
        },

        barista_Details() {
            return [
                { label: 'Name', value: this.branchDetails.barista_name },
                { label: 'Email', value: this.branchDetails.barista_email },
            ];
        },

        kitchen_Details() {
            return [
                { label: 'Name', value: this.branchDetails.kitchen_name },
                { label: 'Email', value: this.branchDetails.kitchen_email },
            ];
        },

        tabs() {
            return [
                { label: 'Dashboard', value: 'dashboard' },
                { label: 'Products', value: 'products', },
                { label: 'Stocks', value: 'stocks', },
                { label: 'Void Orders', value: 'void-orders', },
                { label: 'Branch Info', value: 'branch-info', },
                { label: 'Reports', value: 'reports', },
            ];
        },

        reportsTabs() {
            return [
                { label: 'Sales', value: 'sales', },
                { label: 'Orders', value: 'orders', },
                { label: 'Stocks', value: 'stocks', },
            ];
        },

        branchInfoTabs() {
            return [
                { label: 'Details', value: 'details', },
                { label: 'Cashier', value: 'cashier', },
                { label: 'Barista', value: 'barista', },
                { label: 'Kitchen', value: 'kitchen', },
            ];
        },
    },
    watch: {
        '$route.params.branchName': {
            immediate: true,
            async handler(newBranchName) {
                if (newBranchName) {
                    this.loadingStore.show("Preparing...");
                    this.onDashboard();
                    this.loadingStore.hide();
                }
            }
        },

        activeTab(newTab) {
            // const currentMonth = new Date().getMonth() + 1;
            if (newTab === 'dashboard') {
                this.loadingStore.show("Preparing...");
                this.onDashboard();
                this.loadingStore.hide();
            } else if (newTab === 'products') {
                console.log("Current Reports Tab: ", newTab);
                this.productOptionsStore.fetchAllOptions();
            } else if (newTab === 'stocks') {
                console.log("Current Reports Tab: ", newTab);
                this.stockOptionsStore.fetchAllOptions();
            } else if (newTab === 'void-orders') {
                console.log("Current Reports Tab: ", newTab);
            } else if (newTab === 'branch-info') {
                console.log("Current Reports Tab: ", newTab);
            } else if (newTab === 'reports') {
                console.log("Current Reports Tab: ", newTab);
            }
        },

        activeBranchInfoTab(newBranchInfoTab) {
            if (newBranchInfoTab === 'details') {
                this.loadingStore.show("Preparing...");
                this.fetchBranchDetails();
                this.loadingStore.hide();
            } else if (newBranchInfoTab === 'cashier') {
                this.loadingStore.show("Preparing...");
                // this.fetchCashierPersonnel();
                this.loadingStore.hide();
            } else if (newBranchInfoTab === 'barista') {
                this.loadingStore.show("Preparing...");
                // this.fetchBaristaPersonnel();
                this.loadingStore.hide();
            } else if (newBranchInfoTab === 'kitchen') {
                this.loadingStore.show("Preparing...");
                // this.fetchKitchenPersonnel();
                this.loadingStore.hide();
            }
        },
    },
    methods: {

        async onDashboard() {
            this.activeTab = "dashboard";
            const currentMonth = new Date().getMonth() + 1;
            await this.fetchBranchDetails();
            await this.fetchSalesOnly(currentMonth);
            await this.fetchOrdersOnly(currentMonth);
            await this.fetchProductsOnly(currentMonth);
            await this.fetchStocksOnly();
            await this.fetchSalesByMonthReport(currentMonth);
        },

        async fetchBranchDetails() {
            this.loadingBranchDetails = true;
            try {
                const response = await this.branchStore.fetchBranchDetailsStore(this.$route.params.branchName);
                this.branchDetails = this.branchStore.currentBranch;
                console.log('Data', response)
            } catch (error) {
                console.error(error);
                this.showError(error);
                this.$router.push('/about');
            } finally {
                this.loadingBranchDetails = false;
            }
        },

        async ingredientsDialog(item) {
            this.dialogIngredients = true;
            this.productId = item.product_id;
            this.productName = item.product_name;
            this.productTemp = item.temp_label;
            this.productSize = item.size_label;
            this.loadingIngredient = true;
            try {
                await this.productsStore.fetchProductIngredientsStore(this.productId);
                if (this.productsStore.product_ingredients.length === 0) {
                    this.ingredients = [];
                } else {
                    this.ingredients = this.productsStore.product_ingredients.map(i => this.formatIngredient(i));
                }
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingIngredient = false;
            }
        },

        async fetchSalesOnly(month = null) {
            this.loadingSalesOnly = true;
            this.textSkeleton = true;
            try {
                if (!this.branchDetails.branch_id) {
                    this.showError("Branch ID is not available!");
                    this.totalSales = '';
                    this.textSkeleton = false;
                    return;
                }
                await this.transactStore.fetchGrossSalesStore(this.branchDetails.branch_id, month);
                const value = Number(this.transactStore.grossSales.total_sales);
                this.totalSales = (Math.round(value * 100) / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '';
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingSalesOnly = false;
                this.textSkeleton = false;
            }
        },

        async fetchOrdersOnly(month = null) {
            this.loadingOrdersOnly = true;
            this.textSkeleton = true;
            try {
                if (!this.branchDetails.branch_id) {
                    this.showError("Branch ID is not available!");
                    this.totalOrders = '';
                    this.textSkeleton = false;
                    return;
                }
                await this.transactStore.fetchOrdersOnlyStore(this.branchDetails.branch_id, month);
                this.totalOrders = Number(this.transactStore.ordersOnly.total_orders).toLocaleString('en-PH') || '';
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingOrdersOnly = false;
                this.textSkeleton = false;
            }
        },

        async fetchProductsOnly() {
            this.loadingProductsOnly = true;
            try {
                if (!this.branchDetails.branch_id) {
                    this.showError("Branch ID is not available!");
                    this.totalProducts = '';
                    return;
                }
                await this.transactStore.fetchProductsOnlyStore(this.branchDetails.branch_id);
                if (this.transactStore.productsOnly.length === 0) {
                    this.totalProducts = '';
                } else {
                    this.totalProducts = Number(this.transactStore.productsOnly.total_products).toLocaleString('en-PH') || '';
                }
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingProductsOnly = false;
            }
        },

        async fetchStocksOnly() {
            this.loadingStocksOnly = true;
            try {
                if (!this.branchDetails.branch_id) {
                    this.showError("Branch ID is not available!");
                    this.totalStocks = '';
                    return;
                }
                await this.transactStore.fetchStocksOnlyStore(this.branchDetails.branch_id);
                if (this.transactStore.stocksOnly.length === 0) {
                    this.totalStocks = '';
                } else {
                    this.totalStocks = Number(this.transactStore.stocksOnly.total_stocks).toLocaleString('en-PH') || '';

                }
                this.loadingStocksOnly = false;
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingStocksOnly = false;
            }
        },

        async fetchSalesByMonthReport(month = null) {
            this.loadingSalesByMonthReports = true;
            try {
                this.isSaving = false;
                if (!this.branchDetails.branch_id) {
                    this.showError("Branch ID is not available!");
                    this.salesByMonthReports = [];
                    return;
                }
                await this.transactStore.fetchSalesByMonthStore(this.branchDetails.branch_id, month);
                this.salesByMonthReports = this.transactStore.salesByMonth || [];
                this.loadingSalesByMonthReports = true;
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingSalesByMonthReports = false;
            }
        },

        async updatingStock() {
            this.isSaving = true;
            this.confirmUpdatingStockDialog = false;
            try {
                const now = new Date();
                const isoString = now.toISOString().replace(/\.\d{3}Z$/, '.000000Z');
                const stockData = {
                    stock_id: Number(this.currentStock.stock_id),
                    stock_ingredient: this.currentStock.stock_ingredient,
                    stock_in: parseFloat(this.currentStock.stock_in),
                    stock_unit: Number(this.currentStock.stock_unit),
                    stock_unit_cost: parseFloat(this.currentStock.stock_unit_cost),
                    stock_alert_qty: parseFloat(this.currentStock.stock_alert_qty),
                    availability_id: Number(this.currentStock.availability_id),
                    branch_id: Number(this.currentStock.branch_id),
                    shop_id: Number(this.currentStock.shop_id),
                    updated_at: isoString,
                };
                this.updated_at = isoString;
                
                await this.stocksStore.updateStockStore(stockData);
                await this.stockOptionsStore.fetchAllOptions();

                // For reactive effect
                this.stocks = await this.stocksStore.stocks;
                const index = this.stocks.findIndex(
                    p => p.stock_id === this.currentStock.stock_id
                );
                if (index !== -1) {
                    const updatedStock = this.formatStockWithISO({
                        ...this.currentStock,
                        ...stockData
                    });
                    this.stocks.splice(index, 1, updatedStock);
                }
                this.stockEditDialog = false;
                this.showSuccess("Stock updated successfully!");
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.isSaving = false;
            }
        },

        async updatingProduct() {
            if (!this.currentProduct || !this.currentProduct.product_id) {
                this.showError("Invalid product data!");
                return;
            }
            this.isSaving = true;
            this.confirmUpdatingProductDialog = false;
            try {
                const now = new Date();
                const isoString = now.toISOString().replace(/\.\d{3}Z$/, '.000000Z');
                const productData = {
                    product_id: this.currentProduct.product_id,
                    product_name: this.currentProduct.product_name?.trim(),
                    base_price: Number(this.currentProduct.base_price),
                    cost_estimate: Number(this.currentProduct.cost_estimate),
                    temp_id: Number(this.currentProduct.temp_id),
                    size_id: Number(this.currentProduct.size_id),
                    category_id: Number(this.currentProduct.category_id),
                    station_id: Number(this.currentProduct.station_id),
                    availability_id: Number(this.currentProduct.availability_id),
                    shop_id: this.currentProduct.shop_id,
                    branch_id: this.currentProduct.branch_id,
                    updated_at: isoString,
                };
                this.updated_at = isoString;

                await this.productsStore.updateProductStore(productData);
                await this.productOptionsStore.fetchAllOptions();

                // For reactive effect
                this.products = await this.productsStore.products;
                const index = this.products.findIndex(
                    p => p.product_id === this.currentProduct.product_id
                );
                if (index !== -1) {
                    const updatedProduct = this.formatProductWithISO({
                        ...this.currentProduct,
                        ...productData
                    });
                    this.products.splice(index, 1, updatedProduct);
                }
                this.productEditDialog = false;
                this.showSuccess("Product updated successfully!");
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.isSaving = false;
            }
        },

        async updatingIngredient() {
            this.isSaving = true;
            try {
                const now = new Date();
                const isoString = now.toISOString().replace(/\.\d{3}Z$/, '.000000Z');
                const ingredientData = {
                    product_ingredient_id: this.currentIngredient.product_ingredient_id,
                    product_id: this.currentIngredient.product_id,
                    stock_id: this.currentIngredient.stock_id,
                    unit_usage: this.currentIngredient.unit_usage,
                    ingredient_capital: parseFloat(this.currentIngredient.ingredient_capital),
                    updated_at: isoString,
                };
                await this.productsStore.updateIngredientStore(ingredientData);

                // For reactive effect
                this.ingredients = await this.productsStore.products;
                const index = this.ingredients.findIndex(
                    i => i.product_ingredient_id === this.currentIngredient.product_ingredient_id
                );
                if (index !== -1) {
                    const updatedIngredient = this.formatIngredientWithISO({
                        ...this.currentIngredient,
                        ...ingredientData
                    });
                    this.ingredients.splice(index, 1, updatedIngredient);
                }
                this.productEditDialog = false;
                this.confirmUpdatingEditDialog = false;
                this.ingredientEditDialog = false;
                this.dialogIngredients = false;
                this.confirmUpdatingIngredientDialog = false
                this.showSuccess("Ingredient updated successfully!");
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.isSaving = false;
            }
        },

        async editProductDialog(item) {
            this.currentProduct = { ...item };
            this.productEditDialog = true;
        },

        async editIngredientDialog(item) {
            this.currentIngredient = { ...item };
            this.ingredientEditDialog = true;
        },

        switchToProductsTab() {
            this.activeTab = 'products';
        },

        switchToStocksTab() {
            this.activeTab = 'stocks';
        },

        openEditStockDialog(item) {
            this.currentStock = { ...item };
            this.stockEditDialog = true;
        },

        openProductHistory() {
            this.currentProduct = { ...this.currentProduct };
            this.productsHistoryDialog = true;
        },

        openStockHistory() {
            this.currentStock = { ...this.currentStock };
            this.stockHistoryDialog = true;
        },

        // formatProduct(product) {
        //     const temp = this.productTemperatureOption.find(t => t.temp_id === Number(product.product_temp_id));
        //     const size = this.productSizeOption.find(s => s.size_id === Number(product.product_size_id));
        //     const category = this.productCategoryOption.find(c => c.category_id === Number(product.product_category_id));
        //     const availability = this.productAvailabilityOption.find(a => a.availability_id === Number(product.availability_id));
        //     return {
        //         ...product,
        //         temp_label: temp?.temp_label,
        //         size_label: size?.size_label,
        //         category_label: category?.category_label,
        //         availability_label: availability?.availability_label,
        //         product_temp_id: Number(product.product_temp_id),
        //         product_size_id: Number(product.product_size_id),
        //         product_category_id: Number(product.product_category_id),
        //         availability_id: Number(product.availability_id),
        //         product_name: this.capitalizeFirstLetter(product.product_name),
        //         display_base_price: `₱${product.base_price}`,
        //         display_estimated_cost: `₱${product.estimated_cost}`,
        //         updated_at: this.formatDateTime(product.updated_at),
        //     };
        // },

        formatProductWithISO(product) {
            const temp = this.productTemperatureOption.find(t => t.temp_id === Number(product.product_temp_id));
            const size = this.productSizeOption.find(s => s.size_id === Number(product.product_size_id));
            const category = this.productCategoryOption.find(c => c.category_id === Number(product.product_category_id));
            const availability = this.productAvailabilityOption.find(a => a.availability_id === Number(product.availability_id));
            return {
                ...product,
                temp_label: temp?.temp_label,
                size_label: size?.size_label,
                category_label: category?.category_label,
                availability_label: availability?.availability_label,
                product_temp_id: Number(product.product_temp_id),
                product_size_id: Number(product.product_size_id),
                product_category_id: Number(product.product_category_id),
                availability_id: Number(product.availability_id),
                product_name: this.capitalizeFirstLetter(product.product_name),
                display_base_price: `₱${product.base_price}`,
                display_estimated_cost: `₱${product.cost_estimate}`,
                updated_at: this.updated_at,
            };
        },

        formatIngredient(ingredient) {
            return {
                ...ingredient,
                stock_ingredient: this.capitalizeFirstLetter(ingredient.stock_ingredient),
                unit: `${ingredient.unit_usage}${ingredient.unit_avb}`,
                display_capital: `₱${ingredient.ingredient_capital}`,
                updated_at: this.formatDateTime(ingredient.updated_at),
            };
        },

        formatIngredientWithISO(ingredient) {
            return {
                ...ingredient,
                stock_ingredient: this.capitalizeFirstLetter(ingredient.stock_ingredient),
                unit: `${ingredient.unit_usage}${ingredient.unit_avb}`,
                updated_at: ingredient.updated_at,
            };
        },

        formatStock(stock) {
            const unit = this.stockUnitOption.find(u => u.unit_id === Number(stock.stock_unit));
            const availability = this.stockAvailabilityOption.find(a => a.availability_id === Number(stock.availability_id));
            return {
                ...stock,
                unit_label: unit?.unit_label,
                availability_label: availability?.availability_label,
                stock_ingredient: this.capitalizeFirstLetter(stock.stock_ingredient),
                stock_unit: Number(stock.stock_unit),
                stock_in: Number(stock.stock_in),
                stock_alert_qty: Number(stock.stock_alert_qty),
                availability_id: Number(stock.availability_id),
                display_stock_in: `${stock.stock_in} ${stock.stock_in > 1 ? 'items' : 'item'}`,
                display_unit_cost: `₱${stock.stock_unit_cost}`,
                updated_at: this.formatDateTime(stock.updated_at),
            };
        },

        formatStockWithISO(stock) {
            const unit = this.stockUnitOption.find(u => u.unit_id === Number(stock.stock_unit));
            const availability = this.stockAvailabilityOption.find(a => a.availability_id === Number(stock.availability_id));
            return {
                ...stock,
                unit_label: unit?.unit_label,
                availability_label: availability?.availability_label,
                stock_ingredient: this.capitalizeFirstLetter(stock.stock_ingredient),
                stock_unit: Number(stock.stock_unit),
                stock_in: Number(stock.stock_in),
                stock_alert_qty: Number(stock.stock_alert_qty),
                availability_id: Number(stock.availability_id),
                display_stock_in: `${stock.stock_in} ${stock.stock_in > 1 ? 'items' : 'item'}`,
                display_unit_cost: `₱${stock.stock_unit_cost}`,
                updated_at: this.updated_at,
            };
        },

        capitalizeFirstLetter(text) {
            return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
        },

        formatDateTime(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Manila'
            });
        },

        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },

        showSuccess(message) {
            this.$refs.snackbarRef.showSnackbar(message, "success");
        },

    }
};
</script>
