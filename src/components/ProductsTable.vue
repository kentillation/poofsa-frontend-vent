<template>
    <v-row>
        <v-col cols="12" lg="4" md="4" sm="6">
            <v-text-field density="comfortable" v-model="searchProduct" placeholder="Search product details"
                variant="outlined" label="Search product details" clearable @click:clear="searchProduct = ''"
                @update:modelValue="debounceSearch">
            </v-text-field>
        </v-col>
    </v-row>
    <SkeletonTable v-if="loadingVoidOrders" />
    <v-data-table :headers="productHeaders" :items="filteredProducts" :items-per-page="10"
        class="elevation-1 hover-table" density="comfortable">
        <template v-slot:top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of all Products</h2>
                <h2 class="ms-4 to-show">List</h2>
                <v-spacer></v-spacer>
                <v-btn @click="toAddProduct" prepend-icon="mdi-plus" color="#0090b6" class="me-2" variant="flat">
                    <span class="to-hide">Add Products</span>
                    <span class="to-show">Products</span>
                </v-btn>
                <v-btn @click="fetchProducts" icon="mdi-refresh" color="#0090b6" variant="flat" size="small"
                    class="me-3"></v-btn>
            </v-toolbar>

            <v-divider></v-divider>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.select="{ item }">
            <v-checkbox v-model="item.selected" :value="true" color="primary"
                class="d-flex justify-center"></v-checkbox>
        </template>

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
        <template v-slot:item.station_name="{ item }">
            <span :class="item.availability_id === 2 ? 'text-red' : ''">
                {{ item.station_name }}
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
                        <v-btn v-bind="props" @click="$emit('view-ingredients', item)" color="blue" size="small"
                            prepend-icon="mdi-eye-outline">Items</v-btn>
                    </template>
                </v-tooltip>

                <v-tooltip text="Edit Product" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="$emit('edit-product', item)" color="green" size="small"
                            prepend-icon="mdi-pencil">Edit</v-btn>
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
import { ref, computed } from 'vue';
import { useProductsStore } from '@/stores/productsStore';
import { useProductOptionsStore } from '@/stores/productOptionsStore';
import Snackbar from '@/components/Snackbar.vue';
import SkeletonTable from '@/components/SkeletonTable.vue';

export default {
    name: 'ProductsTable',
    components: { Snackbar, SkeletonTable },
    props: {
        shopId: { type: Number, required: true },
        branchId: { type: Number, required: true },
        branchName: { type: String, required: true }
    },
    setup(props) {
        const productsStore = useProductsStore();
        const productOptionsStore = useProductOptionsStore();

        const searchProduct = ref('');
        const loadingVoidOrders = ref(false);
        const debounceTimer = ref(null);

        // Computed: reactive products from store
        const products = computed(() => productsStore.products);

        // Computed: transform products for table display
        const mappedProducts = computed(() =>
            products.value.map(product => formatProduct(product))
        );

        // Computed: filtered products based on search
        const filteredProducts = computed(() => {
            if (!searchProduct.value) return mappedProducts.value;

            const term = searchProduct.value.toLowerCase();
            return mappedProducts.value.filter(p => {
                return (
                    p.product_name.toLowerCase().includes(term) ||
                    p.temp_label?.toLowerCase().includes(term) ||
                    p.size_label?.toLowerCase().includes(term) ||
                    p.category_label?.toLowerCase().includes(term) ||
                    p.station_name?.toLowerCase().includes(term) ||
                    p.availability_label?.toLowerCase().includes(term) ||
                    p.display_base_price.toLowerCase().includes(term) ||
                    p.display_estimated_cost?.toLowerCase().includes(term) ||
                    p.updated_at.toLowerCase().includes(term)
                );
            });
        });

        // Transform product for table display
        const formatProduct = (product) => {
            const temp = productOptionsStore.temperatureOptions.find(t => t.product_temp_id === Number(product.temp_id));
            const size = productOptionsStore.sizeOptions.find(s => s.product_size_id === Number(product.size_id));
            const category = productOptionsStore.categoryOptions.find(c => c.product_category_id === Number(product.category_id));
            const availability = productOptionsStore.availabilityOptions.find(a => a.availability_id === Number(product.availability_id));
            const station = productOptionsStore.stationOptions.find(s => s.shop_station_id === Number(product.station_id));
            return {
                ...product,
                category_label: category?.category_label,
                availability_label: availability?.availability_label,
                station_name: station?.station_name,
                product_temp_id: Number(product.temp_id),
                product_size_id: Number(product.size_id),
                product_category_id: Number(product.category_id),
                availability_id: Number(product.availability_id),
                display_product_name: `${capitalizeFirstLetter(product.product_name)}${temp?.temp_label ?? ''}${size?.size_label ?? ''}`,
                display_base_price: `₱${product.base_price}`,
                display_estimated_cost: product.cost_estimate ? `₱${product.cost_estimate}` : null,
                updated_at: formatDateTime(product.updated_at),
            };
        };

        // Helpers
        const capitalizeFirstLetter = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
        const formatDateTime = (dateString) => {
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
        };

        const fetchProducts = async () => {
            loadingVoidOrders.value = true;
            try {
                await productsStore.fetchAllProductsStore(props.branchId);
            } catch (error) {
                showError(error.message || 'Failed to fetch products');
            } finally {
                loadingVoidOrders.value = false;
            }
        };

        const toAddProduct = () => {
            window.$router.push({
                path: '/add-product/',
                query: {
                    shop_id: props.shopId,
                    branch_id: props.branchId,
                    branch_name: props.branchName,
                }
            });
        };

        const showError = (message) => {
            const snackbarRef = ref('snackbarRef');
            snackbarRef.value?.showSnackbar(message, "error");
        };

        // Debounced search
        const debounceSearch = () => {
            if (debounceTimer.value) clearTimeout(debounceTimer.value);
            debounceTimer.value = setTimeout(() => {
                // reactive searchProduct triggers filteredProducts automatically
            }, 300);
        };

        // Initial fetch
        fetchProducts();

        return {
            loadingVoidOrders,
            searchProduct,
            debounceSearch,
            filteredProducts,
            toAddProduct,
            fetchProducts,
            productsStore,
            productOptionsStore
        };
    },
    data() {
        return {
            productHeaders: [
                { title: '', value: 'select', width: '5%' },
                { title: 'Availability', value: 'availability_label', sortable: true, width: '10%' },
                { title: 'ProductName', value: 'display_product_name', sortable: true, width: '20%' },
                { title: 'BasePrice', value: 'display_base_price', sortable: true, width: '10%' },
                { title: 'EstimatedCost', value: 'display_estimated_cost', sortable: true, width: '10%' },
                { title: 'Category', value: 'category_label', sortable: true, width: '10%' },
                { title: 'StationName', value: 'station_name', sortable: true, width: '10%' },
                { title: 'LastUpdate', value: 'updated_at', sortable: true, width: '10%' },
                { title: '', value: 'actions', width: '15%' }
            ],
        };
    },
    emits: ['edit-product', 'view-ingredients'],
};
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