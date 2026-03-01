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

    <SkeletonTable v-if="store.loadingOrdersReport && !displayItems.length" />

    <BaseDataTable v-else :key="tableKey" :headers="headers" :items="displayItems" :total-items="store.totalOrdersReport"
        :loading="store.loadingOrdersReport && displayItems.length > 0" :options="options" @update:options="onOptionsUpdate"
        class="elevation-1 hover-table">
        <template #top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of Orders Report</h2>
                <h2 class="ms-4 to-show">Orders Report</h2>
                <v-spacer />
                <v-btn icon="mdi-refresh" color="#0090b6" variant="flat" size="small" class="me-3"
                    @click="handleRefresh" :loading="store.loadingOrdersReport" />
            </v-toolbar>
            <v-divider />
        </template>

        <!-- Custom Columns -->

        <!--  eslint-disable -->
        <template #item.order_number="{ item }">
            <span>#{{ item.order_number }}</span>
        </template>

        <template #item.table_number="{ item }">
            <span>#{{ item.table_number }}</span>
        </template>

        <template #item.order_type="{ item }">
            <v-chip
                :color="item.order_type_id === 1 ? 'black' : item.order_type_id === 2 ? 'purple' : item.order_type_id === 3 ? 'teal' : 'grey'"
                size="small" variant="tonal">
                {{ item.order_type }}
            </v-chip>
        </template>

        <template #item.order_status="{ item }">
            <v-chip
                :color="item.order_status_id === 1 ? 'red' : item.order_status_id === 2 ? 'blue' : item.order_status_id === 3 ? 'green' : 'grey'"
                size="small" variant="tonal">
                {{ item.order_status }}
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

        <template #item.updated_at="{ item }">
            <span>{{ formatDateTime(item.updated_at) }}</span>
        </template>
        
        <!-- <template #item.timeFormat="{ item }">
            <span>{{ item.timeFormat }}</span>
        </template> -->

        <template #no-data>
            <v-alert v-if="!displayItems.length" type="warning" variant="tonal" class="ma-4">
                No orders report found for this branch.
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
    adminName: {
        type: String,
        required: true
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
    { title: 'OrderNumber', value: 'order_number', sortable: true, align: 'start' },
    { title: 'Reference', value: 'reference_number', sortable: false },
    { title: 'TableNumber', value: 'table_number', sortable: true },
    { title: 'TotalQuantity', value: 'total_quantity', sortable: true },
    { title: 'OrderType', value: 'order_type', sortable: true },
    { title: 'OrderStatus', value: 'order_status', sortable: true },
    { title: 'PaymentStatus', value: 'sales_status', sortable: true },
    { title: 'CashierName', value: 'cashier_name', sortable: true },
    { title: 'TransactionDate', value: 'updated_at', sortable: true },
]

const dateFilter = ref(1) // Default to 'Today'
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
    if (!Array.isArray(store.ordersReport)) {
        displayItems.value = []
    } else {
        displayItems.value = store.ordersReport
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
        dateFilter: dateFilter.value,
    })

    if (params === lastFetchParams.value) return

    isFetching.value = true
    lastFetchParams.value = params

    try {
        await store.fetchOrdersReportStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            dateFilter: dateFilter.value,
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

// Reactive fetch when date filter changes
watch(dateFilter, (newFilter) => {
    options.value.page = 1
    lastFetchParams.value = ''
    fetchOrdersReport()
})

// prepare date helpers for exports
const today = new Date();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const yyyy = today.getFullYear();
const currentNumberDate = `${mm}/${dd}/${yyyy}`;
const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
});
const formatCurrentDate = currentDate.replace(/,/g, '');

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

async function downloadTransactions(filterDate = null) {
    if (!props.branchId) return;
    store.loadingOrdersReport = true;
    try {
        await store.fetchOrdersReportStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            dateFilter: filterDate ?? dateFilter.value,
        });

        if (!Array.isArray(store.ordersReport) || store.ordersReport.length === 0) {
            if (snackbarRef.value) snackbarRef.value.showSnackbar('No available orders report to download.', 'error');
            return;
        }

        const transactions = store.ordersReport.map(order => ({
            OrderNumber: order.order_number,
            Reference: order.reference_number,
            TableNumber: order.table_number,
            Quantity: order.total_quantity,
            OrderType: order.order_type,
            OrderStatus: order.order_status,
            PaymentStatus: order.sales_status,
            CashierName: order.cashier_name,
            TransactionDate: formatDateTime(order.updated_at),
        }));

        const headings = [
            `Shop Name: ${props.shopName}`,
            `Branch Name: ${props.branchName}`,
            `Branch Location: ${props.branchAddress}`,
            `Contact: ${props.branchContactNumber}`,
            `Date: ${formatCurrentDate}`,
            `Prepared by : ${props.adminName}`,
            '',
        ].join('\n');

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            headings +
            '\n' +
            Object.keys(transactions[0]).join(',') +
            '\n' +
            transactions.map(e => Object.values(e).join(',')).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Orders_Report_${props.branchName}_${currentNumberDate}.csv`);
        document.body.appendChild(link);
        if (snackbarRef.value) snackbarRef.value.showSnackbar('Orders report downloaded successfully!', 'success');
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error(err);
        if (snackbarRef.value) snackbarRef.value.showSnackbar(err.message || 'Failed to download report', 'error');
    } finally {
        store.loadingOrdersReport = false;
    }
}

async function printTransactions(filterDate = null) {
    await store.fetchOrdersReportStore({
        branchId: props.branchId,
        page: options.value.page,
        itemsPerPage: options.value.itemsPerPage,
        dateFilter: filterDate ?? dateFilter.value,
    });

    if (!Array.isArray(store.ordersReport) || store.ordersReport.length === 0) {
        if (snackbarRef.value) snackbarRef.value.showSnackbar('No available orders report to print.', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups for this website to print the report.');
        return;
    }
    printWindow.document.write(`
        <html>
            <head>
                <title>Orders Report</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    h2 { margin: 0; }
                    h2, h4, h5 { text-align: center; }
                    h4, h5 { font-weight: normal; margin: 5px; }
                    p { margin-top: 25px; }
                    .headings { display: flex; align-items: center; justify-content: space-between;}
                </style>
            </head>
            <body>
                <div class="headings">
                    <div>
                        <h2>${props.shopName}</h2>
                        <h4>${props.branchName} Branch</h4>
                        <h5>${props.branchAddress}</h5>
                        <h5>${props.branchContactNumber}</h5>
                    </div>
                    <h5>${formatCurrentDate}</h5>
                </div>
                <p><strong>Orders report for ${props.branchName} branch</strong></p>
                <table>
                    <tr>
                        <th>OrderNumber</th>
                        <th>Reference</th>
                        <th>TableNumber</th>
                        <th>Quantity</th>
                        <th>OrderType</th>
                        <th>OrderStatus</th>
                        <th>PaymentStatus</th>
                        <th>CashierName</th>
                        <th>TransactionDate</th>
                    </tr>
                    ${store.ordersReport
                        .map(order => `
                            <tr>
                                <td>${order.order_number}</td>
                                <td>${order.reference_number}</td>
                                <td>${order.table_number}</td>
                                <td>${order.total_quantity}</td>
                                <td>${order.order_type}</td>
                                <td>${order.order_status}</td>
                                <td>${order.sales_status}</td>
                                <td>${order.cashier_name}</td>
                                <td>${formatDateTime(order.updated_at)}</td>
                            </tr>`)
                        .join('')}
                </table>
                <footer>
                    <p style="margin-top: 30px;">
                        Prepared by: <strong>${props.adminName}</strong>
                    </p>
                </footer>
            </body>
        </html>`);
    printWindow.document.close();
    printWindow.print();
}

watch(() => store.ordersReport, () => {
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