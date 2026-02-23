<!-- eslint-disable -->
<template>
    <!-- Search -->
    <v-row>
        <v-col cols="12" lg="4" md="4" sm="6">
            <v-text-field v-model="search" label="Search product details" placeholder="Search product details"
                variant="outlined" density="comfortable" clearable />
        </v-col>
    </v-row>

    <!-- Products Table -->
    <BaseDataTable :headers="headers" :items="filteredProducts" :total-items="store.total ?? 0" :loading="store.loading"
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
                    @click="fetchProducts" />
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
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import BaseDataTable from '@/components/BaseDataTable.vue'
import Snackbar from '@/components/Snackbar.vue'

// Props & emits
// eslint-disable-next-line
const props = defineProps({
    shopId: Number,
    branchId: Number,
    branchName: String
})

// eslint-disable-next-line
const emit = defineEmits(['edit-product', 'view-ingredients'])

// Router & store
const router = useRouter()
const store = useProductsStore()

// Table & search state
const options = ref({ page: 1, itemsPerPage: 10 })
const search = ref('')

// Table headers
const headers = [
    { title: 'Availability', value: 'availability_label' },
    { title: 'Product Name', value: 'display_product_name' },
    { title: 'Base Price', value: 'display_base_price' },
    { title: 'Estimated Cost', value: 'display_estimated_cost' },
    { title: 'Category', value: 'category_label' },
    { title: 'Station', value: 'station_name' },
    { title: 'Updated At', value: 'updated_at' },
    { title: 'Actions', value: 'actions', sortable: false }
]

// Computed filtered products (search)
const filteredProducts = computed(() => {
    if (!search.value) return store.products
    return store.products.filter(p =>
        p.display_product_name.toLowerCase().includes(search.value.toLowerCase())
    )
})

// Fetch products from store
const fetchProducts = () => {
    store.fetchAllProductsStore({
        branchId: props.branchId,
        page: options.value.page,
        itemsPerPage: options.value.itemsPerPage,
        search: search.value
    })
}

// Watch pagination or search changes
watch([options, search], fetchProducts, { deep: true })

// Handle BaseDataTable options updates
const updateOptions = (val) => {
    options.value = val
}

// Initial fetch
fetchProducts()

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