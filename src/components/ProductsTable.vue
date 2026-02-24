<!-- eslint-disable -->
<template>
    <!-- Search -->
    <v-row>
        <v-col cols="12" lg="4" md="4" sm="6">
            <v-text-field v-model="search" label="Search product details" placeholder="Search product details"
                variant="outlined" density="comfortable" clearable @update:model-value="onSearchChange" />
        </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" dismissible @click:close="store.clearError">
        {{ store.error }}
    </v-alert>

    <SkeletonTable v-if="store.loading"  />

    <!-- Products Table -->
    <BaseDataTable :key="tableKey" :headers="headers" :items="displayItems" :total-items="store.total"
        :loading="store.loading" :options="options" @update:options="onOptionsUpdate" class="elevation-1 hover-table">
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
                    @click="handleRefresh" :loading="store.loading" />
            </v-toolbar>
            <v-divider />
        </template>

        <!-- Custom Columns -->

        <!-- eslint-disable  -->
        <template #item.display_product_name="{ item }">
            <span :class="textClass(item)">{{ item.display_product_name }}</span>
        </template>

        <!-- eslint-disable  -->
        <template #item.cost_estimate="{ item }">
            <span :class="textClass(item)">{{ item.cost_estimate ?? '₱0' }}</span>
        </template>

        <!--  eslint-disable -->
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
/* eslint-disable */
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import SkeletonTable from '@/components/SkeletonTable.vue'
import BaseDataTable from '@/components/BaseDataTable.vue'
import Snackbar from '@/components/Snackbar.vue'

// Props & emits
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

const emit = defineEmits(['edit-product', 'view-ingredients'])

// Router & store
const router = useRouter()
const store = useProductsStore()

// Local state
const displayItems = ref([])
const tableKey = ref(0)
const snackbarRef = ref(null)
const search = ref('')
const options = ref({
    page: 1,
    itemsPerPage: 10,
    sortBy: []
})

// Track if we're currently fetching to prevent multiple requests
const isFetching = ref(false)
// Track last fetch params to prevent duplicate requests
const lastFetchParams = ref('')

// Table headers
const headers = [
    { title: 'Availability', value: 'availability_label', sortable: true, align: 'start' },
    { title: 'Product Name', value: 'display_product_name', sortable: true },
    { title: 'Base Price', value: 'display_base_price', sortable: true },
    { title: 'Estimated Cost', value: 'display_cost_estimate', sortable: true },
    { title: 'Category', value: 'category_label', sortable: true },
    { title: 'Station', value: 'station_name', sortable: true },
    { title: 'Updated At', value: 'updatedAtFormatted', sortable: true },
    { title: 'Actions', value: 'actions', sortable: false, align: 'center' }
]

// Debounce timer
let searchTimer = null

// Handle search change
const onSearchChange = (value) => {
    search.value = value
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        options.value.page = 1
        fetchProducts()
    }, 300)
}

// Handle options update from table
const onOptionsUpdate = (val) => {
    // Check if options actually changed
    const optionsChanged =
        val.page !== options.value.page ||
        val.itemsPerPage !== options.value.itemsPerPage ||
        JSON.stringify(val.sortBy) !== JSON.stringify(options.value.sortBy)

    if (optionsChanged) {
        options.value = val
        fetchProducts()
    }
}

// Handle refresh button
const handleRefresh = () => {
    options.value.page = 1
    lastFetchParams.value = '' // Clear cache to force fresh fetch
    fetchProducts()

    // Manually set loading state
    // store.loading = true
    
    // try {
    //     fetchProducts()
    // } finally {
    //     store.loading = false
    // }
}

// Update display items from store
const updateDisplayItems = () => {
    if (!Array.isArray(store.products)) {
        displayItems.value = []
    } else {
        displayItems.value = store.products
            .filter(item => item && typeof item === 'object')
            .map(item => ({ ...item }))
    }
    tableKey.value++
}

// Fetch products with duplicate prevention
const fetchProducts = async () => {
    if (!props.branchId || isFetching.value) return

    // Create params string to check for duplicates
    const params = JSON.stringify({
        branchId: props.branchId,
        page: options.value.page,
        itemsPerPage: options.value.itemsPerPage,
        search: search.value
    })

    // Skip if same params as last fetch
    if (params === lastFetchParams.value) return

    isFetching.value = true
    lastFetchParams.value = params

    try {
        await store.fetchAllProductsStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            search: search.value,
            sortBy: options.value.sortBy
        })

        updateDisplayItems()

    } catch (error) {
        console.error('Fetch error:', error)
        if (snackbarRef.value) {
            snackbarRef.value.showSnackbar(error.message || 'Failed to load products', 'error')
        }
    } finally {
        isFetching.value = false
    }
}

// Watch for store changes
watch(() => store.products, () => {
    updateDisplayItems()
}, { deep: true }) // Use shallow watch to avoid loops

// Watch for branchId prop changes (fetch when it becomes available)
watch(() => props.branchId, (newId) => {
    if (newId) fetchProducts()
}, { immediate: true })

// Initial fetch
onMounted(() => {
    if (props.branchId) {
        fetchProducts()
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