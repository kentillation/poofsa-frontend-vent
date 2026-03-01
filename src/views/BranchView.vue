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
                                                                <h2 class="my-2 text-white">{{ this.ordersStore.ordersCount }}</h2> &nbsp;
                                                                <span style="font-size: 18px;">
                                                                    <p class="text-white">{{ this.ordersStore.ordersCount > 1 ? 'items' : 'item' }}</p>
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
                                                @month-changed="fetchSalesByMonthReport"
                                                @sales-changed="fetchSalesOnly"/>
                                        </v-card-text>
                                    </v-card>
                                </v-container>
                            </v-tabs-window-item>

                            <!-- Orders -->
                            <v-tabs-window-item value="orders">
                                <v-container>
                                    <OrdersTable :shop-id="branchDetails.shop_id" :branch-id="branchDetails.branch_id"
                                        :branch-name="branchDetails.branch_name"/>
                                </v-container>
                            </v-tabs-window-item>

                            <!-- Products -->
                            <v-tabs-window-item value="products">
                                <v-container>
                                    <ProductsTable @edit-product="editProductDialog"
                                        @view-ingredients="ingredientsDialog"
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
                                    <StocksTable @edit-stock="openEditStockDialog"
                                        :shop-id="branchDetails.shop_id"
                                        :branch-id="branchDetails.branch_id" :branch-name="branchDetails.branch_name" />
                                    <StockEditDialog v-model="stockEditDialog"
                                        @update:modelValue="stockEditDialog = $event"
                                        @update:stock="currentStock = $event"
                                        @update:confirm="confirmUpdatingStockDialog = $event" :stock="currentStock"
                                        @save="updatingStock" :valid="formValid" :loading="isSaving"
                                        :confirm="confirmUpdatingStockDialog"
                                        :selected-stock="currentStock?.ingredient_name || ''" />

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
                                                :branch-address="branchDetails.branch_address"
                                                :branch-contact-number="branchDetails.branch_contact_number"
                                                :admin-name="branchDetails.admin_name" />

                                            <OrdersReportTable v-else-if="activeReportsTab === 'orders'"
                                                :shop-id="branchDetails.shop_id"
                                                :shop-name="branchDetails.shop_name"
                                                :branch-id="branchDetails.branch_id"
                                                :branch-name="branchDetails.branch_name"
                                                :branch-address="branchDetails.branch_address"
                                                :branch-contact-number="branchDetails.branch_contact_number"
                                                :admin-name="branchDetails.admin_name" />

                                            <StocksReportsTableSkeleton
                                                v-if="loadingStockReports && activeReportsTab === 'stocks'" />
                                            <StocksReportTable v-else-if="activeReportsTab === 'stocks'"
                                                :stocks="stockReports" :loading="loadingStockReports"
                                                :shop-id="branchDetails.shop_id" :shop-name="branchDetails.shop_name"
                                                :branch-id="branchDetails.branch_id"
                                                :branch-name="branchDetails.branch_name"
                                                :branch-address="branchDetails.branch_address"
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
import { useOrdersStore } from '@/stores/ordersStore';
import { useStocksStore } from '@/stores/stocksStore';
import { useIngredientsOptionsStore } from '@/stores/ingredientsOptionsStore';
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
import SalesReportTable from '@/components/SalesReportTable.vue';
import SalesReportsTableSkeleton from '@/components/SalesReportsTableSkeleton.vue';
import OrdersTable from '@/components/OrdersTable.vue';
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
        SalesReportTable,
        SalesReportsTableSkeleton,
        OrdersTable,
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
        const loadingStore = useLoadingStore();
        const branchStore = useBranchStore();
        const ordersStore = useOrdersStore();
        const stocksStore = useStocksStore();
        const ingredientsOptionsStore = useIngredientsOptionsStore();
        const ingredientUnitOption = computed(() => ingredientsOptionsStore.unitOption);
        const ingredientAvailabilityOption = computed(() => ingredientsOptionsStore.availabilityOption);
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
        // await ingredientsOptionsStore.fetchAllOptions();
        });

        return {
            loadingStore,
            branchStore,
            ordersStore,
            stocksStore,
            ingredientsOptionsStore,
            ingredientUnitOption,
            ingredientAvailabilityOption,
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
                { label: 'Branch address', value: this.branchDetails.branch_address },
                { label: 'Branch manager', value: this.branchDetails.branch_manager_name },
                { label: 'Branch contact', value: this.branchDetails.branch_contact_number },
            ];
        },

        cashier_Details() {
            return [
                { label: 'Cashier name', value: this.branchDetails.cashier_name },
                { label: 'Cashier email', value: this.branchDetails.cashier_email },
            ];
        },

        barista_Details() {
            return [
                { label: 'Barista name', value: this.branchDetails.barista_name },
                { label: 'Barista email', value: this.branchDetails.barista_email },
            ];
        },

        kitchen_Details() {
            return [
                { label: 'Kitchen personnel', value: this.branchDetails.kitchen_personnel_name },
                { label: 'Kitchen personnel email', value: this.branchDetails.kitchen_personnel_email },
            ];
        },

        tabs() {
            return [
                { label: 'Dashboard', value: 'dashboard' },
                { label: 'Orders', value: 'orders', },
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
            }
        },

    },
    methods: {

        async onDashboard() {
            this.activeTab = "dashboard";
            const currentMonth = new Date().getMonth() + 1;
            await this.fetchBranchDetails();
            await this.ordersStore.fetchOrdersCountStore(this.branchDetails.branch_id);
            await this.fetchSalesOnly(currentMonth);
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
                if (this.productsStore.productItems.length === 0) {
                    this.ingredients = [];
                } else {
                    this.ingredients = this.productsStore.productItems.map(i => this.formatIngredient(i));
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

        async fetchProductsOnly() {
            this.loadingProductsOnly = true;
            try {
                if (!this.branchDetails.branch_id) {
                    this.showError("Branch ID is not available!");
                    this.totalProducts = '';
                    return;
                }
                await this.productsStore.fetchTotalProductsCountStore(this.branchDetails.branch_id);
                if (this.productsStore.productsOnly.length === 0) {
                    this.totalProducts = '';
                } else {
                    this.totalProducts = Number(this.productsStore.productsOnly.total_products).toLocaleString('en-PH') || '';
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
                const stockData = {
                    ingredient_id: Number(this.currentStock.ingredient_id),
                    ingredient_name: this.currentStock.ingredient_name,
                    alert_quantity: parseFloat(this.currentStock.alert_quantity),
                    base_unit_id: Number(this.currentStock.base_unit_id),
                    availability_id: Number(this.currentStock.availability_id),
                    shop_id: Number(this.currentStock.shop_id),
                    branch_id: Number(this.currentStock.branch_id),
                };
                await this.stocksStore.updateStockStore(stockData);
                await this.ingredientsOptionsStore.fetchAllOptions();
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
                const productData = {
                    product_id: this.currentProduct.product_id,
                    product_name: this.currentProduct.product_name?.trim(),
                    base_price: this.currentProduct.base_price,
                    cost_estimate: this.currentProduct.cost_estimate || 0,
                    temp_id: Number(this.currentProduct.temp_id),
                    size_id: Number(this.currentProduct.size_id),
                    category_id: Number(this.currentProduct.category_id),
                    station_id: Number(this.currentProduct.station_id),
                    availability_id: Number(this.currentProduct.availability_id),
                    shop_id: this.currentProduct.shop_id,
                    branch_id: this.currentProduct.branch_id,
                };
                await this.productsStore.updateProductStore(productData);
                await this.productOptionsStore.fetchAllOptions();
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
            if (!this.currentIngredient || !this.currentIngredient.product_id || !this.currentIngredient.ingredient_id) {
                this.showError("Invalid ingredient data!");
                return;
            }
            this.isSaving = true;
            try {
                const productItemData = {
                    product_item_id: this.currentIngredient.product_item_id,
                    product_id: this.currentIngredient.product_id,
                    ingredient_id: this.currentIngredient.ingredient_id,
                    quantity_required: this.currentIngredient.quantity_required,
                    ingredient_capital: this.currentIngredient.ingredient_capital,
                };
                await this.productsStore.updateIngredientStore(productItemData);
                this.confirmUpdatingEditDialog = false;
                this.ingredientEditDialog = false;
                this.confirmUpdatingIngredientDialog = false
                this.showSuccess("Product items updated successfully!");
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

        formatIngredient(ingredient) {
            return {
                ...ingredient,
                ingredient_name: this.capitalizeFirstLetter(ingredient.ingredient_name),
                display_quantity_required: `${ingredient.quantity_required}${ingredient.unit_avb}`,
                display_ingredient_capital: `₱${ingredient.ingredient_capital}`,
                updated_at: this.formatDateTime(ingredient.updated_at),
            };
        },

        formatIngredientWithISO(ingredient) {
            return {
                ...ingredient,
                ingredient_name: this.capitalizeFirstLetter(ingredient.ingredient_name),
                display_quantity_required: `${ingredient.quantity_required}${ingredient.unit_avb}`,
                display_ingredient_capital: `${ingredient.ingredient_capital}`,
                updated_at: ingredient.updated_at,
            };
        },

        formatStock(stock) {
            const unit = this.ingredientUnitOption.find(u => u.unit_id === Number(stock.stock_unit));
            const availability = this.ingredientAvailabilityOption.find(a => a.availability_id === Number(stock.availability_id));
            return {
                ...stock,
                unit_label: unit?.unit_label,
                availability_label: availability?.availability_label,
                ingredient_name: this.capitalizeFirstLetter(stock.ingredient_name),
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
            const unit = this.ingredientUnitOption.find(u => u.unit_id === Number(stock.stock_unit));
            const availability = this.ingredientAvailabilityOption.find(a => a.availability_id === Number(stock.availability_id));
            return {
                ...stock,
                unit_label: unit?.unit_label,
                availability_label: availability?.availability_label,
                ingredient_name: this.capitalizeFirstLetter(stock.ingredient_name),
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
