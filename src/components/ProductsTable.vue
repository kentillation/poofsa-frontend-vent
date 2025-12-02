<template>
    <v-row>
        <v-col cols="12" lg="4" md="4" sm="6">
            <v-text-field
                density="comfortable"
                v-model="searchProduct" 
                placeholder="Search product details" 
                variant="outlined" 
                label="Search product details"
                clearable
                @click:clear="searchProduct = ''"
                @update:modelValue="debounceSearch">
            </v-text-field>
        </v-col>
    </v-row>
    <v-data-table 
        :headers="productHeaders" 
        :items="filteredProducts" 
        :loading="loading" 
        :items-per-page="10"
        class="elevation-1 hover-table"
        density="comfortable">
        <template v-slot:top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of all Products</h2>
                <h2 class="ms-4 to-show">List</h2>
                <v-spacer></v-spacer>
                <AddProductDialog v-model="addProductDialog" />
                <v-btn @click="openAddProductDialog" :disabled="loading" prepend-icon="mdi-plus" color="#0090b6"
                    class="me-2" variant="flat">
                    <span class="to-hide">Add products</span>
                    <span class="to-show">products</span>
                </v-btn>
                <v-btn @click="fetchProducts" :loading="loading" icon="mdi-refresh" color="#0090b6" variant="flat"
                    size="small" class="me-3"></v-btn>
            </v-toolbar>

            <v-divider></v-divider>
        </template>

        <!--eslint-disable-next-line -->
        <!-- <template v-slot:item.select="{ item }">
            <v-checkbox v-model="item.selected" :value="true" color="primary"
                class="d-flex justify-center"></v-checkbox>
        </template> -->

        <!--eslint-disable-next-line -->
        <template v-slot:item.product_name="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.product_name }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.temp_label="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.temp_label }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.size_label="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.size_label }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.display_product_price="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.display_product_price }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.category_label="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.category_label }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.updated_at="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.updated_at }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.availability_label="{ item }">
            <v-chip :color="item.availability_id === 2 ? 'red' : 'green'" size="small" variant="tonal">
                {{ item.availability_label }}
            </v-chip>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.actions="{ item }">
            <div class="d-flex" style="gap: 8px;">
                <v-tooltip text="View Ingredients" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="$emit('view-ingredients', item)" color="blue" variant="tonal"
                            size="small" icon="mdi-eye-outline"></v-btn>
                    </template>
                </v-tooltip>

                <v-tooltip text="Edit Product" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="$emit('edit-product', item)" color="green" variant="tonal"
                            size="small" icon="mdi-pencil"></v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>

        <template v-slot:no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                <span>&nbsp; No products found for this branch.</span>
            </v-alert>
        </template>

        <template v-slot:loading>
            <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
        </template>
    </v-data-table>
    <Snackbar ref="snackbarRef" />
</template>

<script>
import { computed } from 'vue';
import { useLoadingStore } from '@/stores/loading';
import { useProductsStore } from '@/stores/productsStore';
import { useProductOptionsStore } from '@/stores/productOptionsStore'; 
import Snackbar from '@/components/Snackbar.vue';
import AddProductDialog from '@/components/AddProductDialog.vue';

export default {
    name: 'ProductsTable',
    data() {
        return {
            debounceTimer: null,
            mappedProducts: [],
            searchProduct: '',
            addProductDialog: false,
            productHeaders: [
                { title: '', value: 'select', width: '5%' },
                { title: 'Product', value: 'product_name', sortable: true, width: '20%' },
                { title: 'Temp', value: 'temp_label', sortable: true, width: '10%' },
                { title: 'Size', value: 'size_label', sortable: true, width: '10%' },
                { title: 'Price', value: 'display_product_price', sortable: true, width: '10%' },
                { title: 'Category', value: 'category_label', sortable: true, width: '10%' },
                { title: 'Availability', value: 'availability_label', sortable: true, width: '15%' },
                { title: 'LastUpdate', value: 'updated_at', sortable: true, width: '20%' },
                { title: '', value: 'actions', sortable: false, width: '15%' }
            ],
        };
    },
    components: {
        AddProductDialog,
        Snackbar,
    },
    props: {
        products: {
            type: Array,
            required: true,
        },
        loading: {
            type: Boolean,
            default: false
        },
        shopId: {
            type: Number,
            required: true
        },
        branchId: {
            type: Number,
            required: true
        },
        branchName: {
            type: String,
            required: true
        },
        error: {
            type: [String, Error, null],
            default: null
        }
    },
    mounted() {
        this.fetchProducts();
    },
    watch: {
        products: {
            handler(newVal) {
                this.mappedProducts = newVal.map(product => this.formatProduct(product));
            },
            immediate: true
        },
    },
    emits: [
        'edit-product',
        'view-ingredients',
    ],
    computed: {
        filteredProducts() {
            if (!this.searchProduct) {
                return this.mappedProducts;
            }
            const searchTerm = this.searchProduct.toLowerCase();
            return this.mappedProducts.filter(product => {
                return (product.product_name.toLowerCase().includes(searchTerm)) ||
                    (product.temp_label && product.temp_label.toLowerCase().includes(searchTerm)) ||
                    (product.size_label && product.size_label.toLowerCase().includes(searchTerm)) ||
                    (product.category_label && product.category_label.toLowerCase().includes(searchTerm)) ||
                    (product.availability_label && product.availability_label.toLowerCase().includes(searchTerm)) ||
                    product.display_product_price.toLowerCase().includes(searchTerm) ||
                    product.updated_at.toLowerCase().includes(searchTerm);
            });
        },
        // hasCheck() {
        //     return !this.products.some(item => item.selected);
        // }
    },
    setup() {
        const loadingStore = useLoadingStore();
        const productsStore = useProductsStore();
        const productOptionsStore = useProductOptionsStore(); 
        const productTemperatureOption = computed(() => productOptionsStore.temperatureOptions); 
        const productSizeOption = computed(() => productOptionsStore.sizeOptions); 
        const productCategoryOption = computed(() => productOptionsStore.categoryOptions); 
        const productAvailabilityOption = computed(() => productOptionsStore.availabilityOptions); 
        return {
            loadingStore,
            productsStore,
            productOptionsStore,
            productTemperatureOption,
            productSizeOption,
            productCategoryOption,
            productAvailabilityOption
        };
    },
    methods: {
        debounceSearch() {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                // The computed property will automatically update
            }, 300);
        },
        async fetchProducts() {
            this.loadingStore.show('Preparing...');
            try {
                await this.productsStore.fetchAllProductsStore(this.branchId);
                if (this.productsStore.products.length === 0) {
                    this.mappedProducts = [];
                } else {
                    this.mappedProducts = this.productsStore.products.map(product => this.formatProduct(product));
                }
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingStore.hide();
            }
        },
        openAddProductDialog() {
            this.$router.push({
                path: '/add-product/',
                query: {
                    shop_id: this.shopId,
                    branch_id: this.branchId,
                    branch_name: this.branchName,
                }
            });
        },
        formatProduct(product) {
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
                display_product_price: `₱${product.product_price}`,
                updated_at: this.formatDateTime(product.updated_at),
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
    }
}
</script>

<style scoped>
.hover-table:deep(.v-data-table__tr:hover) {
    background-color: rgba(0, 0, 0, 0.04);
}

.to-hide {
    display: inline;
}

.to-show {
    display: none;
}

@media (max-width: 768px) {
    .to-hide {
        display: none;
    }

    .to-show {
        display: inline;
    }
}
</style>