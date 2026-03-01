<!-- eslint-disable -->
<template>
    <div class="d-flex flex-wrap align-center mt-5">
        <v-autocomplete v-model="dateFilter" :items="dateFilterItems" item-title="filter_date_label"
            item-value="filter_date_id" label="Date filter" class="me-1" density="compact" clearable />

        <div class="d-flex mb-5">
            <v-btn @click="downloadTransactions(dateFilter)" height="40" prepend-icon="mdi-download" color="primary"
                variant="tonal" class="ps-6"><span class="to-hide">XLS</span></v-btn>&nbsp;
            <v-btn @click="printTransactions(dateFilter)" height="40" prepend-icon="mdi-printer" color="primary"
                variant="tonal" class="ps-6"><span class="to-hide">PRINT</span></v-btn>
        </div>
    </div>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" dismissible @click:close="store.clearError">
        {{ store.error }}
    </v-alert>

    <SkeletonTable v-if="store.loadingOrders && !displayItems.length" />

    <BaseDataTable v-else :key="tableKey" :headers="headers" :items="displayItems" :total-items="store.total"
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

        <template #item.payment_method="{ item }">
            <span :class="item.payment_method_id === 1 ? 'text-blue' : 'text-green'">{{ item.payment_method }}</span>
        </template>

        <template #item.table_number="{ item }">
            <span>#{{ item.table_number }}</span>
        </template>

        <template #item.order_number="{ item }">
            <span>#{{ item.order_number }}</span>
        </template>

        <template #item.total_quantity="{ item }">
            <span>x{{ item.total_quantity }}</span>
        </template>

        <template #item.total_amount="{ item }">
            <span>₱{{ item.total_amount }}</span>
        </template>

        <template #item.discount_amount="{ item }">
            <span>₱{{ item.discount_amount }}</span>
        </template>

        <template #item.customer_change="{ item }">
            <span>₱{{ item.customer_change }}</span>
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
    shopName: {
        type: String,
        default: ''
    },
    branchId: {
        type: Number,
        required: true
    },
    branchName: {
        type: String,
        default: ''
    },
    branchAddress: {
        type: String,
        default: ''
    },
    branchContactNumber: {
        type: String,
        default: ''
    },
})

const emit = defineEmits(['view-items'])

const store = useOrdersStore()

const displayItems = ref([])
const tableKey = ref(0)
const snackbarRef = ref(null)
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
    { title: 'PaymentMethod', value: 'payment_method', sortable: true },
    { title: 'TableNumber', value: 'table_number', sortable: true },
    { title: 'OrderNumber', value: 'order_number', sortable: true },
    { title: 'TotalQuantity', value: 'total_quantity', sortable: true },
    { title: 'TotalAmount', value: 'total_amount', sortable: true },
    { title: 'DiscountAmount', value: 'discount_amount', sortable: true },
    { title: 'CustomerChange', value: 'customer_change', sortable: true },
    { title: 'Actions', value: 'actions', sortable: false, align: 'center' }
]

const dateFilter = ref(1)
const dateFilterItems = [
    { filter_date_id: 1, filter_date_label: 'Today' },
    { filter_date_id: 2, filter_date_label: 'Yesterday' },
    { filter_date_id: 3, filter_date_label: 'Last 7 days' },
    { filter_date_id: 4, filter_date_label: 'This Week' },
    { filter_date_id: 5, filter_date_label: 'Last Week' },
    { filter_date_id: 6, filter_date_label: 'Last 30 days' },
    { filter_date_id: 7, filter_date_label: 'This Month' },
    { filter_date_id: 8, filter_date_label: 'Last Month' },
    { filter_date_id: 9, filter_date_label: 'This Year' },
    { filter_date_id: 10, filter_date_label: 'Last Year' },
    { filter_date_id: 11, filter_date_label: 'Custom Range' },
]

const onOptionsUpdate = (val) => {
    const optionsChanged =
        val.page !== options.value.page ||
        val.itemsPerPage !== options.value.itemsPerPage

    if (optionsChanged) {
        options.value = val
        fetchOrdersReport()
    }
}

const handleRefresh = () => {
    options.value.page = 1
    lastFetchParams.value = ''
    fetchOrdersReport()
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

const fetchOrdersReport = async () => {
    if (!props.branchId || isFetching.value) return

    const params = JSON.stringify({
        branchId: props.branchId,
        page: options.value.page,
        itemsPerPage: options.value.itemsPerPage,
        date_filter: dateFilter.value,
    })

    if (params === lastFetchParams.value) return

    isFetching.value = true
    lastFetchParams.value = params

    try {
        await store.fetchOrdersReportStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            date_filter: dateFilter.value,
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

const downloadTransactions = (filterDate) => {
    fetchOrdersReport({
        branchId: props.branchId,
        filterDate
    })
}
const ordersReport = fetchOrdersReport.map(order => ({
    'Reference': order.reference_number,
    'ModeOfPayment': order.payment_method,
    'Quantity': order.total_quantity,
    'CashRender': order.customer_cash,
    'TotalDue': order.total_due,
    'Discount': order.customer_discount,
    'Change': order.customer_change,
    'CashierName': order.cashier_name,
    'TransactionDate': this.formatDateTime(order.updated_at),
}));
const orderReportsHeadings = [
    `Shop Name: ${this.shopName}`,
    `Branch Name: ${this.branchName}`,
    `Branch Location: ${this.branchLocation}`,
    `Contact: ${this.contact}`,
    `Date: ${this.formatCurrentDate}`,
    `Prepared by : ${this.adminName}`,
    '',
].join('\n');
const csvContent = "data:text/csv;charset=utf-8,"
    + orderReportsHeadings + "\n"
    + Object.keys(ordersReport[0]).join(",") + "\n"
    + ordersReport.map(e => Object.values(e).join(",")).join("\n");
const encodedUri = encodeURI(csvContent);
const link = document.createElement("a");
link.setAttribute("href", encodedUri);
link.setAttribute("download", `Orders_Report_${this.branchName}_${this.currentNumberDate}.csv`);
document.body.appendChild(link);
this.showSuccess("Orders report downloaded successfully!");
link.click();
this.loadingStore.hide();
document.body.removeChild(link);

watch(() => store.orders, () => {
    updateDisplayItems()
}, { deep: true })

watch(() => props.branchId, (newId) => {
    if (newId) fetchOrdersReport()
}, { immediate: true })

onMounted(() => {
    if (props.branchId) {
        fetchOrdersReport()
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