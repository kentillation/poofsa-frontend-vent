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

    <SkeletonTable v-if="store.loading && !store.products.length"  />

    <!-- Products Table -->
    <BaseDataTable v-else :key="tableKey" :headers="headers" :items="displayItems" :total-items="store.total"
        :loading="store.loading" :options="options" @update:options="onOptionsUpdate" class="elevation-1 hover-table">
        <!-- Toolbar -->
        <template #top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">Modified Products History</h2>
                <h2 class="ms-4 to-show">Modified Products</h2>
                <v-spacer />
                <v-btn icon="mdi-refresh" color="#0090b6" variant="flat" size="small" class="me-3"
                    @click="handleRefresh" :loading="store.loading" />
            </v-toolbar>
            <v-divider />
        </template>

        <!-- Custom Columns -->

        <!-- eslint-disable  -->
        <template #item.display_product_name="{ item }">
            <span>{{ item.display_product_name }}</span>
        </template>

        <!--  eslint-disable -->
        <template #item.modified_type="{ item }">
            <v-chip :color="item.modified_type_id === 2 ? 'blue' : 'green'" size="small" variant="tonal">
                {{ item.modified_type }}
            </v-chip>
        </template>

        <template #no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                No modified products found for this branch.
            </v-alert>
        </template>
    </BaseDataTable>

    <!-- Snackbar -->
    <Snackbar ref="snackbarRef" />
</template>

<script setup>
/* eslint-disable */
import { ref, watch, onMounted } from 'vue'
import { useProductsStore } from '@/stores/productsStore'
import SkeletonTable from '@/components/SkeletonTable.vue'
import BaseDataTable from '@/components/BaseDataTable.vue'
import Snackbar from '@/components/Snackbar.vue'

// Props & emits
const props = defineProps({
    branchId: {
        type: Number,
        required: true
    },
})


// Router & store
const store = useProductsStore()

// Local state
const displayItems = ref([])
const tableKey = ref(0)
const snackbarRef = ref(null)
const search = ref('')
const options = ref({
    page: 1,
    itemsPerPage: 10,
})

// Track if we're currently fetching to prevent multiple requests
const isFetching = ref(false)

// Track last fetch params to prevent duplicate requests
const lastFetchParams = ref('')

// Table headers
const headers = [
    { title: 'ProductName', value: 'display_product_name', sortable: true, align: 'start' },
    { title: 'Description', value: 'description', sortable: true },
    { title: 'ModifiedType', value: 'modified_type', sortable: true },
    { title: 'PerformedBy', value: 'admin_name', sortable: true },
    { title: 'LastUpdate', value: 'updatedAtFormatted', sortable: true },
]

// Debounce timer
let searchTimer = null

// Handle search change
const onSearchChange = (value) => {
    search.value = value
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        options.value.page = 1
        fetchProductsHistory()
    }, 300)
}

// Handle options update from table
const onOptionsUpdate = (val) => {
    // Check if options actually changed
    const optionsChanged =
        val.page !== options.value.page ||
        val.itemsPerPage !== options.value.itemsPerPage

    if (optionsChanged) {
        options.value = val
        fetchProductsHistory()
    }
}

// Handle refresh button
const handleRefresh = () => {
    options.value.page = 1
    lastFetchParams.value = '' // Clear cache to force fresh fetch
    fetchProductsHistory()
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
const fetchProductsHistory = async () => {
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
        await store.fetchProductsHistoryStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            search: search.value,
        })

        updateDisplayItems()

    } catch (error) {
        console.error('Fetch error:', error)
        if (snackbarRef.value) {
            snackbarRef.value.showSnackbar(error.message || 'Failed to load modified products history', 'error')
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
    if (newId) fetchProductsHistory()
}, { immediate: true })

// Initial fetch
onMounted(() => {
    if (props.branchId) {
        fetchProductsHistory()
    }
})
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