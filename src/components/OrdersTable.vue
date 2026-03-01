<!-- eslint-disable -->
<template>
    <v-row>
        <v-col cols="12" lg="4" md="4" sm="6">
            <v-text-field v-model="search" label="Search order details" placeholder="Search order details"
                variant="outlined" density="compact" @update:model-value="onSearchChange" class="me-1" clearable />
        </v-col>
    </v-row>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" dismissible @click:close="store.clearError">
        {{ store.error }}
    </v-alert>

    <SkeletonTable v-if="store.loadingOrders && !displayItems.length" />

    <BaseDataTable v-else :key="tableKey" :headers="headers" :items="displayItems" :total-items="store.totalOrders"
        :loading="store.loadingOrders && displayItems.length > 0" :options="options" @update:options="onOptionsUpdate"
        class="elevation-1 hover-table">
        <template #top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of All Orders</h2>
                <h2 class="ms-4 to-show">All Orders</h2>
                <v-spacer />
                <v-btn icon="mdi-refresh" color="#0090b6" variant="flat" size="small" class="me-3"
                    @click="handleRefresh" :loading="store.loadingOrders" />
            </v-toolbar>
            <v-divider />
        </template>

        <!-- Custom Columns -->

        <!--  eslint-disable -->
        <template #item.order_status="{ item }">
            <v-chip
                :color="item.order_status_id === 1 ? 'red' : item.order_status_id === 2 ? 'blue' : item.order_status_id === 3 ? 'green' : 'grey'"
                size="small" variant="tonal">
                {{ item.order_status }}
            </v-chip>
        </template>

        <template #item.order_type="{ item }">
            <v-chip
                :color="item.order_type_id === 1 ? 'black' : item.order_type_id === 2 ? 'purple' : item.order_type_id === 3 ? 'teal' : 'grey'"
                size="small" variant="tonal">
                {{ item.order_type }}
            </v-chip>
        </template>

        <template #item.sales_status="{ item }">
            <v-chip :color="item.sales_status === 1 ? 'warning' : 'green'" size="small" variant="tonal">
                {{ item.sales_status }}
            </v-chip>
        </template>

        <template #item.total_quantity="{ item }">
            <span>x{{ item.total_quantity }}</span>
        </template>

        <template #item.table_number="{ item }">
            <span>#{{ item.table_number }}</span>
        </template>

        <template #item.order_number="{ item }">
            <span>#{{ item.order_number }}</span>
        </template>

        <template #item.updated_at="{ item }">
            <span>{{ formatDateTime(item.updated_at) }}</span>
        </template>

        <!-- <template #item.timeFormat="{ item }">
            <span>{{ item.timeFormat }}</span>
        </template> -->

        <template #item.actions="{ item }">
            <div class="d-flex" style="gap: 8px;">
                <v-tooltip text="View Items" location="top">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" color="green" size="small" prepend-icon="mdi-eye-outline"
                            @click="$emit('view-items', item)">
                            View Items
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>

        <template #no-data>
            <v-alert v-if="!displayItems.length" type="warning" variant="tonal" class="ma-4">
                No orders found for this branch.
            </v-alert>
        </template>
    </BaseDataTable>

    <!-- Snackbar -->
    <Snackbar ref="snackbarRef" />
</template>

<script setup>
/* eslint-disable */
import { ref, watch, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/ordersStore'
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

const emit = defineEmits(['view-items'])

const store = useOrdersStore()

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
    { title: 'OrderStatus', value: 'order_status', sortable: true, align: 'start' },
    { title: 'OrderType', value: 'order_type', sortable: true },
    { title: 'PaymentStatus', value: 'sales_status', sortable: true },
    { title: 'TotalQuantity', value: 'total_quantity', sortable: true },
    { title: 'TableNumber', value: 'table_number', sortable: true },
    { title: 'OrderNumber', value: 'order_number', sortable: true },
    { title: 'Reference', value: 'reference_number', sortable: true },
    { title: 'CashierName', value: 'cashier_name', sortable: true },
    { title: 'TransactionDate', value: 'updated_at', sortable: true },
    { title: 'Actions', value: 'actions', sortable: false, align: 'center' }
]

let searchTimer = null

const onSearchChange = (value) => {
    search.value = value
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        options.value.page = 1
        fetchOrders()
    }, 300)
}

const onOptionsUpdate = (val) => {
    const optionsChanged =
        val.page !== options.value.page ||
        val.itemsPerPage !== options.value.itemsPerPage

    if (optionsChanged) {
        options.value = val
        fetchOrders()
    }
}

const handleRefresh = () => {
    options.value.page = 1
    lastFetchParams.value = ''
    fetchOrders()
}

const updateDisplayItems = () => {
    if (!Array.isArray(store.orders)) {
        displayItems.value = []
    } else {
        displayItems.value = store.orders
            .filter(item => item && typeof item === 'object')
            .map(item => ({ ...item }))
    }
    tableKey.value++
}

const fetchOrders = async () => {
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
        await store.fetchAllOrdersStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            search: search.value,
        })

        updateDisplayItems()

    } catch (error) {
        console.error('Fetch error:', error)
        if (snackbarRef.value) {
            snackbarRef.value.showSnackbar(error.message || 'Failed to load orders', 'error')
        }
    } finally {
        isFetching.value = false
    }
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Manila'
    });
}

watch(() => store.orders, () => {
    updateDisplayItems()
}, { deep: true })

watch(() => props.branchId, (newId) => {
    if (newId) fetchOrders()
}, { immediate: true })

onMounted(() => {
    if (props.branchId) {
        fetchOrders()
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