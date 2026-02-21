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
    <SkeletonTable v-if="loadingVoidOrders" />
    <v-data-table 
        :headers="productHeaders" 
        :items="filteredProducts" 
        :items-per-page="10"
        class="elevation-1 hover-table"
        density="comfortable">
        <template v-slot:top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of all Products</h2>
                <h2 class="ms-4 to-show">List</h2>
                <v-spacer></v-spacer>
                <v-btn @click="toAddProduct" prepend-icon="mdi-plus" color="#0090b6"
                    class="me-2" variant="flat">
                    <span class="to-hide">Add Products</span>
                    <span class="to-show">Products</span>
                </v-btn>
                <v-btn @click="fetchProducts" icon="mdi-refresh" color="#0090b6" variant="flat"
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
        <template v-slot:item.display_product_name="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.display_product_name }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.display_estimated_cost="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.display_estimated_cost ? item.display_estimated_cost : 0 }}
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
        <template v-slot:item.display_base_price="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.display_base_price }}
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
                <v-tooltip text="View Items" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="$emit('view-ingredients', item)" color="blue"
                            size="small" prepend-icon="mdi-eye-outline">Items</v-btn>
                    </template>
                </v-tooltip>

                <v-tooltip text="Edit Product" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="$emit('edit-product', item)" color="green"
                            size="small" prepend-icon="mdi-pencil">Edit</v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>

        <template v-slot:no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                <span>&nbsp; No products found for this branch.</span>
            </v-alert>
        </template>
    </v-data-table>
    <Snackbar ref="snackbarRef" />
</template>

<script>
import { computed } from 'vue';
import { useProductsStore } from '@/stores/productsStore';
import { useProductOptionsStore } from '@/stores/productOptionsStore'; 
import Snackbar from '@/components/Snackbar.vue';
import SkeletonTable from '@/components/SkeletonTable.vue';

export default {
    name: 'ProductsTable',
    data() {
        return {
            loadingVoidOrders: false,
            debounceTimer: null,
            mappedProducts: [],
            searchProduct: '',
            productHeaders: [
                { title: '', value: 'select', width: '5%' },
                { title: 'ProductName', value: 'display_product_name', sortable: true, width: '20%' },
                { title: 'BasePrice', value: 'display_base_price', sortable: true, width: '10%' },
                { title: 'EstimatedCost', value: 'display_estimated_cost', sortable: true, width: '10%' },
                { title: 'Category', value: 'category_label', sortable: true, width: '10%' },
                { title: 'Availability', value: 'availability_label', sortable: true, width: '10%' },
                { title: 'LastUpdate', value: 'updated_at', sortable: true, width: '10%' },
                { title: '', value: 'actions', width: '15%' }
            ],
        };
    },
    components: {
        Snackbar, SkeletonTable
    },
    props: {
        products: {
            type: Array,
            required: true,
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
                    product.display_base_price.toLowerCase().includes(searchTerm) ||
                    product.display_estimated_cost.toLowerCase().includes(searchTerm) ||
                    product.updated_at.toLowerCase().includes(searchTerm);
            });
        },
        // hasCheck() {
        //     return !this.products.some(item => item.selected);
        // }
    },
    setup() {
        const productsStore = useProductsStore();
        const productOptionsStore = useProductOptionsStore(); 
        const productTemperatureOption = computed(() => productOptionsStore.temperatureOptions); 
        const productSizeOption = computed(() => productOptionsStore.sizeOptions); 
        const productCategoryOption = computed(() => productOptionsStore.categoryOptions); 
        const productAvailabilityOption = computed(() => productOptionsStore.availabilityOptions); 
        return {
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
            this.loadingVoidOrders = true;
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
                this.loadingVoidOrders = false;
            }
        },

        toAddProduct() {
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
            const temp = this.productTemperatureOption.find(t => t.product_temp_id === Number(product.temp_id)); 
            const size = this.productSizeOption.find(s => s.product_size_id === Number(product.size_id)); 
            const category = this.productCategoryOption.find(c => c.product_category_id === Number(product.category_id)); 
            const availability = this.productAvailabilityOption.find(a => a.availability_id === Number(product.availability_id)); 
            return {
                ...product,
                category_label: category?.category_label,
                availability_label: availability?.availability_label,
                product_temp_id: Number(product.temp_id),
                product_size_id: Number(product.size_id),
                product_category_id: Number(product.category_id),
                availability_id: Number(product.availability_id),
                display_product_name: this.capitalizeFirstLetter(product.product_name) + temp?.temp_label + size?.size_label,
                display_base_price: `₱${product.base_price}`,
                display_estimated_cost: product.cost_estimate ? `₱${product.cost_estimate}` : null,
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