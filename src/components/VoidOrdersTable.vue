<template>
    <SkeletonTable v-if="loadingVoidOrders" />
    <v-data-table :headers="headerVoidOrders" :items="mappedVoidOrdersByDate"
        :items-per-page="10" :sort-by="[{ key: 'updated_at', order: 'desc' }]" class="hover-table"
        density="comfortable">
        <template v-slot:top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of Void Orders</h2>
                <h2 class="ms-4 to-show">List</h2>
                <v-spacer></v-spacer>
                <div class="w-75 w-sm-50 d-flex align-center justify-space-between">
                    <v-autocomplete v-model="dateFilter" :items="dateFilterItems" item-title="filter_date_label"
                        item-value="filter_date_id" label="Date Filter" class="mt-5 me-3"></v-autocomplete>
                    <v-btn @click="fetchVoidOrders(dateFilter)" icon="mdi-refresh"
                        color="#0090b6" variant="flat" size="small" class="me-3"></v-btn>
                </div>
            </v-toolbar>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.from_quantity="{ item }">
            {{ item.from_quantity }} {{ item.from_quantity > 1 ? 'items' : 'item' }}
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.to_quantity="{ item }">
            {{ item.to_quantity }} {{ item.to_quantity > 1 ? 'items' : 'item' }}
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.void_status="{ item }">
            <v-chip :color="Number(item.void_status_id) === 1 ? 'red' : 'green'" size="small" variant="tonal">
                {{ item.void_status }}
            </v-chip>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.actions="{ item }">
            <div class="d-flex" style="gap: 8px;">
                <v-tooltip text="Confirm" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn :class="Number(item.void_status_id) === 1 ? 'd-flex' : 'd-none'" v-bind="props"
                            @click="editVoidOrder({ item })" color="green" variant="tonal" size="small"
                            icon="mdi-swap-horizontal"></v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>

        <template v-slot:no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                <span>&nbsp; No void order found
                    <template v-if="selectedFilterLabel">
                        for <strong>{{ selectedFilterLabel }}</strong>
                    </template>
                </span>
            </v-alert>
        </template>
    </v-data-table>
    <v-dialog v-model="confirmVoidDialog" height="260" width="400" transition="dialog-bottom-transition">
        <v-card class="pa-2">
            <v-card-title>
                <h5>Confirmation</h5>
            </v-card-title>
            <v-card-text class="d-flex flex-column">
                <span class="mb-3" style="font-size: 16px;">
                    <strong>{{ selectedProductText }} &nbsp; &nbsp; x{{ this.selectedProduct.to_quantity }}</strong>
                </span>
                <span class="text-center">Want to confirm this void?</span>
            </v-card-text>
            <v-card-actions class="d-flex">
                <v-btn color="red" variant="tonal" class="px-3 pt-1 pb-1" prepend-icon="mdi-close"
                    @click="confirmVoidDialog = false">No<span class="to-hide"> , I wont!</span>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="green" variant="tonal" class="px-3 pt-1 pb-1" prepend-icon="mdi-check"
                    @click="changeStatus(this.selectedProduct)">Yes<span class="to-hide"> , I want!</span>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <Snackbar ref="alertRef" />
</template>

<script>
import { useLoadingStore } from '@/stores/loading';
import { useTransactStore } from '@/stores/transactStore';
import Snackbar from '@/components/Snackbar.vue';
import SkeletonTable from '@/components/SkeletonTable.vue';


export default {
    name: 'VoidOrdersTable',
    components: {
        Snackbar,
        SkeletonTable
    },
    data() {
        return {
            void_statuses: [],
            mappedVoidOrdersByDate: [],
            dateFilter: 1,
            searchStock: '',
            loadingVoidOrders: false,
            headerVoidOrders: [
                { title: 'Reference', value: 'reference_number', width: '10%' },
                { title: 'Table#', value: 'table_number', width: '10%' },
                { title: 'ProductName', value: 'display_product_name', width: '20%' },
                { title: 'BeforeVoid(qty)', value: 'from_quantity', width: '10%' },
                { title: 'AfterVoid(qty)', value: 'to_quantity', width: '10%' },
                { title: 'Status', value: 'void_status', width: '10%' },
                { title: 'DateCreated', value: 'updated_at', width: '20%' },
                { title: '', value: 'actions', sortable: false, width: '10%' }
            ],
            dateFilterItems: [
                { filter_date_id: 1, filter_date_label: 'Today' },
                { filter_date_id: 2, filter_date_label: 'Yesterday' },
                { filter_date_id: 3, filter_date_label: 'Last 2 days' },
                { filter_date_id: 4, filter_date_label: 'Last 3 days' },
                { filter_date_id: 5, filter_date_label: 'Last 4 days' },
                { filter_date_id: 6, filter_date_label: 'Last 5 days' },
                { filter_date_id: 7, filter_date_label: 'Last 6 days' },
                { filter_date_id: 8, filter_date_label: 'Last 7 days' },
            ],
            selectedProduct: null,
            confirmVoidDialog: false,
            snackbarRef: null,
        }
    },
    mounted() {
        this.fetchVoidOrders(this.dateFilter);
        this.fetchVoidStatus();
    },
    watch: {
        voidByDate: {
            handler(newVal) {
                this.mappedVoidOrdersByDate = newVal.map(order => this.formatVoidOrders(order));
            },
            immediate: true
        },
        dateFilter(newVal) {
            this.fetchVoidOrders(newVal);
        },
    },
    computed: {
        selectedFilterLabel() {
            const found = this.dateFilterItems.find(item => item.filter_date_id === this.dateFilter);
            return found ? found.filter_date_label : '';
        },
        selectedProductText() {
            if (!this.selectedProduct) return '';
            return `${this.selectedProduct.product_name || ''}
                ${this.selectedProduct.temp_label || ''}
                ${this.selectedProduct.size_label || ''}`;
        },
    },
    props: {
        voidByDate: {
            type: Array,
            default: () => []
        },
        // loading: {
        //     type: Boolean,
        //     default: true
        // },
        branchId: {
            type: Number,
            required: true
        },

    },
    setup() {
        const loadingStore = useLoadingStore();
        const transactStore = useTransactStore();
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
        return {
            loadingStore,
            transactStore,
            currentNumberDate,
            formatCurrentDate,
        };
    },
    methods: {
        async fetchVoidOrders(dateFilterId = null) {
            this.loadingVoidOrders = true;
            try {
                await this.transactStore.fetchVoidByDateStore(this.branchId, dateFilterId);
                this.mappedVoidOrdersByDate = this.transactStore.voidOrdersByDate.map(order => this.formatVoidOrders(order));
            } catch (error) {
                console.error('Error fetching void orders:', error);
            } finally {
                this.loadingVoidOrders = false;
            }
        },

        async fetchVoidStatus() {
            try {
                await this.transactStore.fetchVoidStatusStore();
                this.void_statuses = this.transactStore.voidStatuses;
            } catch (error) {
                console.error('Error fetching void status:', error);
                this.showError("Error fetching void status!");
            }
        },

        editVoidOrder({ item }) {
            this.selectedProduct = { ...item };
            this.confirmVoidDialog = true;
        },

        changeStatus(voidOrder) {
            if (!voidOrder || !voidOrder.reference_number) {
                this.showError("Invalid void data!");
                return;
            }
            const currentStatusIndex = this.void_statuses.findIndex(
                status => Number(status.void_status_id) === Number(voidOrder.void_status_id)
            );

            if (currentStatusIndex === -1) {
                this.showError("Current void status not found!");
                return;
            }
            const nextStatusIndex = (currentStatusIndex + 1) % this.void_statuses.length;
            const newStatus = Number(this.void_statuses[nextStatusIndex].void_status_id);

            if (isNaN(newStatus)) {
                this.showError("Next void status is invalid!");
                return;
            }
            this.loadingStore.show("Updating status...");
            this.transactStore.updateVoidStatusStore(voidOrder.order_void_id, this.branchId, voidOrder.reference_number)
                .then(() => {
                    const statusName = this.getStatusName(newStatus);
                    this.showSuccess(`Void has been ${statusName} successfully!`);
                    voidOrder.void_status_id = newStatus;
                    this.fetchVoidOrders(this.dateFilter);
                })
                .catch(error => {
                    console.error('Error updating void order:', error);
                    this.showError("Failed to update void order. Please try again!");
                })
                .finally(() => {
                    this.loadingStore.hide();
                    this.confirmVoidDialog = false;
                });
        },

        getStatusName(statusId) {
            const status = this.void_statuses.find(s => Number(s.void_status_id) === Number(statusId));
            return status ? status.void_status : 'Unknown';
        },

        formatVoidOrders(order) {
            return {
                ...order,
                display_product_name: `${order.product_name}${order.temp_label}${order.size_label}` || '',
                updated_at: order.updated_at ? this.formatDateTime(order.updated_at) : 'N/A',
            };
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
                timeZone: 'Asia/Manila'
            });
        },

        showSuccess(message) {
            this.$refs.alertRef.showSnackbar(message, "success");
        },

        showError(message) {
            this.$refs.alertRef.showSnackbar(message, "error");
        },
    }
}
</script>

<style>
.action-section {
    display: flex;
    flex-wrap: wrap;
}

.action-section-item {
    width: 200px;
}
</style>
