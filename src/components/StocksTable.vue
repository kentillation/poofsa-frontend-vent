<!-- eslint-disable -->
<template>
    <v-row>
        <v-col cols="12" lg="4" md="4" sm="6">
            <v-text-field v-model="search" label="Search stock details" placeholder="Search stock details"
                variant="outlined" density="comfortable" clearable @update:model-value="onSearchChange" />
        </v-col>
    </v-row>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" dismissible @click:close="store.clearError">
        {{ store.error }}
    </v-alert>

    <SkeletonTable v-if="store.loadingStocks && !store.stocks.length"  />

    <BaseDataTable v-else :key="tableKey" :headers="headers" :items="displayItems" :total-items="store.total"
        :loading="store.loadingStocks" :options="options" @update:options="onOptionsUpdate" class="elevation-1 hover-table">
        <template #top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of all Stocks</h2>
                <h2 class="ms-4 to-show">List</h2>
                <v-spacer />
                <v-btn prepend-icon="mdi-plus" color="#0090b6" variant="flat" class="me-2" @click="toAddStocks">
                    <span class="to-hide">Add Stocks</span>
                    <span class="to-show">Stocks</span>
                </v-btn>
                <v-btn icon="mdi-refresh" color="#0090b6" variant="flat" size="small" class="me-3"
                    @click="handleRefresh" :loading="store.loadingStocks" />
            </v-toolbar>
            <v-divider />
        </template>

        <!-- Custom Columns -->

        <!--  eslint-disable -->
        <template #item.availability_label="{ item }">
            <v-chip :color="item.availability_id === 2 ? 'red' : 'green'" size="small" variant="tonal">
                {{ item.availability_label }}
            </v-chip>
        </template>

        <template #item.ingredient_name="{ item }">
            <span :class="textClass(item)">{{ item.ingredient_name }}</span>
        </template>

        <template #item.unit_label="{ item }">
            <span :class="textClass(item)">{{ item.unit_label }}</span>
        </template>

        <template #item.display_alert_quantity="{ item }">
            <span :class="textClass(item)">{{ item.display_alert_quantity }}</span>
        </template>

        <template #item.updatedAtFormatted="{ item }">
            <span :class="textClass(item)">{{ item.updatedAtFormatted }}</span>
        </template>

        <template #item.actions="{ item }">
            <div class="d-flex" style="gap: 8px;">
                <v-tooltip text="Edit Stock" location="top">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" color="green" size="small" prepend-icon="mdi-pencil"
                            @click="$emit('edit-stock', item)">
                            Edit
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>

        <template #no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                No stocks found for this branch.
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
import { useStocksStore } from '@/stores/stocksStore'
import SkeletonTable from '@/components/SkeletonTable.vue'
import BaseDataTable from '@/components/BaseDataTable.vue'
import Snackbar from '@/components/Snackbar.vue'

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

const emit = defineEmits(['edit-stock'])

const router = useRouter()
const store = useStocksStore()

const displayItems = ref([])
const tableKey = ref(0)
const snackbarRef = ref(null)
const search = ref('')
const options = ref({
    page: 1,
    itemsPerPage: 10,
})

const isFetching = ref(false)
const lastFetchParams = ref('')

const headers = [
    { title: 'Availability', value: 'availability_label', sortable: true, align: 'start' },
    { title: 'StockName', value: 'ingredient_name', sortable: true },
    { title: 'BaseUnit', value: 'unit_label', sortable: true },
    { title: 'AlertQuantity', value: 'display_alert_quantity', sortable: true },
    { title: 'LastUpdate', value: 'updatedAtFormatted', sortable: true },
    { title: 'Actions', value: 'actions', sortable: false, align: 'center' }
]

let searchTimer = null

const onSearchChange = (value) => {
    search.value = value
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        options.value.page = 1
        fetchStocks()
    }, 300)
}

const onOptionsUpdate = (val) => {
    const optionsChanged =
        val.page !== options.value.page ||
        val.itemsPerPage !== options.value.itemsPerPage

    if (optionsChanged) {
        options.value = val
        fetchStocks()
    }
}

const handleRefresh = () => {
    options.value.page = 1
    lastFetchParams.value = ''
    fetchStocks()
}

const updateDisplayItems = () => {
    if (!Array.isArray(store.stocks)) {
        displayItems.value = []
    } else {
        displayItems.value = store.stocks
            .filter(item => item && typeof item === 'object')
            .map(item => ({ ...item }))
    }
    tableKey.value++
}

const fetchStocks = async () => {
    if (!props.branchId || isFetching.value) return

    const params = JSON.stringify({
        branchId: props.branchId,
        page: options.value.page,
        itemsPerPage: options.value.itemsPerPage,
        search: search.value
    })

    if (params === lastFetchParams.value) return

    isFetching.value = true
    lastFetchParams.value = params

    try {
        await store.fetchAllStocksStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            search: search.value,
        })

        updateDisplayItems()

    } catch (error) {
        console.error('Fetch error:', error)
        if (snackbarRef.value) {
            snackbarRef.value.showSnackbar(error.message || 'Failed to load stocks', 'error')
        }
    } finally {
        isFetching.value = false
    }
}

watch(() => store.stocks, () => {
    updateDisplayItems()
}, { deep: true })

watch(() => props.branchId, (newId) => {
    if (newId) fetchStocks()
}, { immediate: true })

onMounted(() => {
    if (props.branchId) {
        fetchStocks()
    }
})

const toAddStocks = () => {
    router.push({
        path: '/add-stock/',
        query: {
            shop_id: props.shopId,
            branch_id: props.branchId,
            branch_name: props.branchName
        }
    })
}

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