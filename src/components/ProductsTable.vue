<!-- eslint-disable -->
<template>
    <!-- Search -->
    <v-row>
        <v-col cols="12" lg="4" md="4" sm="6">
            <v-text-field v-model="search" label="Search product details" placeholder="Search product details"
                variant="outlined" density="comfortable" clearable @update:model-value="debouncedSearch" />
        </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" dismissible @click:close="store.clearError">
        {{ store.error }}
    </v-alert>

    <!-- Products Table -->
    <BaseDataTable :headers="headers" :items="filteredProducts" :total-items="store.total" :loading="store.loading"
        :options="options" @update:options="updateOptions" class="elevation-1 hover-table">
        <!-- Toolbar -->
        <template #top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of all Products</h2>
                <h2 class="ms-4 to-show">List</h2>
                <v-spacer />
                <v-btn prepend-icon="mdi-plus" color="#0090b6" variant="flat" class="me-2" @click="toAddProduct">
                    <span class="to-hide">Add Products</span>
                    <span class="to-show">Products</span>
                </v-btn>
                <v-btn icon="mdi-refresh" color="#0090b6" variant="flat" size="small" class="me-3"
                    @click="fetchProducts" :loading="store.loading" />
            </v-toolbar>
            <v-divider />
        </template>

        <!-- Custom Columns -->
        <template #item.display_product_name="{ item }">
            <span :class="textClass(item)">{{ item.display_product_name }}</span>
        </template>

        <template #item.display_estimated_cost="{ item }">
            <span :class="textClass(item)">{{ item.display_estimated_cost ?? '₱0' }}</span>
        </template>

        <template #item.availability_label="{ item }">
            <v-chip :color="item.availability_id === 2 ? 'red' : 'green'" size="small" variant="tonal">
                {{ item.availability_label }}
            </v-chip>
        </template>

        <template #item.actions="{ item }">
            <div class="d-flex" style="gap: 8px;">
                <v-tooltip text="View Items" location="top">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" color="blue" size="small" prepend-icon="mdi-eye-outline"
                            @click="$emit('view-ingredients', item)">
                            Items
                        </v-btn>
                    </template>
                </v-tooltip>

                <v-tooltip text="Edit Product" location="top">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" color="green" size="small" prepend-icon="mdi-pencil"
                            @click="$emit('edit-product', item)">
                            Edit
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>

        <template #no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                No products found for this branch.
            </v-alert>
        </template>
    </BaseDataTable>

    <!-- Snackbar -->
    <Snackbar ref="snackbarRef" />
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import BaseDataTable from '@/components/BaseDataTable.vue'
import Snackbar from '@/components/Snackbar.vue'

// Props & emits
// eslint-disable-next-line
const props = defineProps({
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
        default: ''
    }
})

// eslint-disable-next-line
const emit = defineEmits(['edit-product', 'view-ingredients'])

// Router & store
const router = useRouter()
const store = useProductsStore()

// Refs
const snackbarRef = ref(null)
const search = ref('')
const options = ref({
    page: 1,
    itemsPerPage: 10,
    sortBy: []
})

// Table headers
const headers = [
    { title: 'Availability', value: 'availability_label', sortable: true, align: 'start' },
    { title: 'Product Name', value: 'display_product_name', sortable: true },
    { title: 'Base Price', value: 'display_base_price', sortable: true },
    { title: 'Estimated Cost', value: 'display_estimated_cost', sortable: true },
    { title: 'Category', value: 'category_label', sortable: true },
    { title: 'Station', value: 'station_name', sortable: true },
    { title: 'Updated At', value: 'updated_at', sortable: true },
    { title: 'Actions', value: 'actions', sortable: false, align: 'center' }
]

// Computed filtered products (client-side search enhancement)
const filteredProducts = computed(() => {
    if (!search.value) return store.products

    const searchTerm = search.value.toLowerCase()
    return store.products.filter(p =>
        p.display_product_name?.toLowerCase().includes(searchTerm) ||
        p.category_label?.toLowerCase().includes(searchTerm) ||
        p.station_name?.toLowerCase().includes(searchTerm)
    )
})

// Debounced search - fixed unused variable issue
// Replace the lodash import with this custom debounce
const debouncedSearch = (() => {
    let timeoutId = null
    return () => {
        options.value.page = 1
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            fetchProducts()
        }, 300)
    }
})()

// Show snackbar message
const showSnackbar = (message, color = 'error') => {
    if (snackbarRef.value) {
        snackbarRef.value.showSnackbar(message, color)
    } else {
        console.error('Snackbar not available:', message)
    }
}

// Fetch products from store with error handling
const fetchProducts = async () => {
    if (!props.branchId) {
        showSnackbar('Branch ID is required', 'error')
        return
    }

    try {
        await store.fetchAllProductsStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            search: search.value,
            sortBy: options.value.sortBy
        })
    } catch (error) {
        showSnackbar(error.message || 'Failed to load products', 'error')
    }
}

// Watch pagination changes
watch(
    () => [
        options.value.page,
        options.value.itemsPerPage,
        options.value.sortBy
    ],
    () => {
        fetchProducts()
    },
    { deep: true }
)

// Watch search for debugging (optional, can be removed)
watch(search, (newValue) => {
    // Log search changes in development only
    if (import.meta.env.DEV) {
        console.log('Search term:', newValue)
    }
})

// Handle BaseDataTable options updates
const updateOptions = (val) => {
    options.value = val
}

// Initial fetch
onMounted(() => {
    if (props.branchId) {
        fetchProducts()
    } else {
        showSnackbar('Branch ID is missing', 'error')
    }
})

// Navigate to add product page
const toAddProduct = () => {
    router.push({
        path: '/add-product/',
        query: {
            shop_id: props.shopId,
            branch_id: props.branchId,
            branch_name: props.branchName
        }
    })
}

// Row text color for availability
const textClass = (item) => item.availability_id === 2 ? 'text-red' : ''
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