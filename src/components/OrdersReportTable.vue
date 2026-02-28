<template>
    <v-data-table :headers="transactionsHeaders" :items="mappedOrders" :loading="loading" :items-per-page="10"
        :sort-by="[{ key: 'updated_at', order: 'desc' }]" class="hover-table" density="comfortable">
        <template v-slot:top>
            <div class="d-flex flex-wrap align-center mt-5">
                <v-autocomplete v-model="dateFilter" :items="dateFilterItems" item-title="filter_date_label"
                    item-value="filter_date_id" label="Date filter" class="me-1" density="compact" clearable />

                <div class="d-flex mb-5">
                    <v-btn @click="downloadTransactions(dateFilter)" height="40" prepend-icon="mdi-download"
                        color="primary" variant="tonal" class="ps-6"><span class="to-hide">XLS</span></v-btn>&nbsp;
                    <v-btn @click="printTransactions(dateFilter)" height="40" prepend-icon="mdi-printer" color="primary"
                        variant="tonal" class="ps-6"><span class="to-hide">PRINT</span></v-btn>&nbsp;
                    <v-btn @click="fetchAllOrdersReport(dateFilter)" height="40" class="ps-7" prepend-icon="mdi-refresh" color="primary" variant="tonal"
                        :loading="loading"></v-btn>
                </div>
            </div>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.total_quantity="{ item }">
            {{ item.total_quantity }} {{ item.total_quantity > 1 ? 'items' : 'item' }}
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.payment_method="{ item }">
            <v-chip :color="item.payment_method === 'Cash' ? 'green' : 'blue'" size="small" variant="tonal">
                {{ item.payment_method }}
            </v-chip>
        </template>

        <template v-slot:no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                <span>&nbsp; No orders report found
                    <template v-if="selectedFilterLabel">
                        for <strong>{{ selectedFilterLabel }}</strong>
                    </template>
                </span>
            </v-alert>
        </template>
    </v-data-table>
    <Snackbar ref="snackbarRef" />
</template>

<script>
import { useLoadingStore } from '@/stores/loading';
import { useTransactStore } from '@/stores/transactStore';
import Snackbar from '@/components/Snackbar.vue';

export default {
    name: 'TransactionsReportsTable',
    data() {
        return {
            mappedOrders: [],
            dateFilter: 1,
            shopLogoLink: '-',
            transactionsHeaders: [
                { title: 'Reference', value: 'reference_number', sortable: 'true', width: '10%' },
                { title: 'ModeOfPayment', value: 'payment_method', sortable: 'true', width: '10%' },
                { title: 'Quantity', value: 'display_total_quantity', sortable: 'true', width: '10%' },
                { title: 'CashRendered', value: 'display_customer_cash', sortable: 'true', width: '10%' },
                { title: 'TotalDue', value: 'display_total_amount', sortable: 'true', width: '10%' },
                { title: 'Discount', value: 'display_discount', sortable: 'true', width: '10%' },
                { title: 'Change', value: 'display_customer_change', sortable: 'true', width: '10%' },
                { title: 'CashierName', value: 'cashier_name', sortable: 'true', width: '10%' },
                { title: 'TransactionDate', value: 'updated_at', sortable: 'true', width: '10%' },
            ],
            dateFilterItems: [
                { filter_date_id: 1, filter_date_label: 'Today' },
                { filter_date_id: 2, filter_date_label: 'Yesterday' },
                { filter_date_id: 3, filter_date_label: 'Last 7 days' },
                { filter_date_id: 4, filter_date_label: 'This Week' },
                { filter_date_id: 5, filter_date_label: 'Last 30 days' },
                { filter_date_id: 6, filter_date_label: 'This Month' },
                { filter_date_id: 7, filter_date_label: 'Last Month' },
            ],
            snackbarRef: null,
        }
    },
    mounted() {
        this.fetchAllOrdersReport(this.dateFilter);
    },
    watch: {
        allOrders: {
            handler(newVal) {
                this.mappedOrders = newVal.map(order => this.formatOrder(order));
            },
            immediate: true
        },
        dateFilter(newVal) {
            this.fetchAllOrdersReport(newVal);
        },
    },
    computed: {
        selectedFilterLabel() {
            const found = this.dateFilterItems.find(item => item.filter_date_id === this.dateFilter);
            return found ? found.filter_date_label : '';
        }
    },
    components: {
        Snackbar,
    },
    props: {
        allOrders: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        shopId: {
            type: Number,
            required: true
        },
        shopName: {
            type: String,
            required: true
        },
        branchId: {
            type: Number,
            required: true
        },
        branchName: {
            type: String,
            required: true
        },
        branchLocation: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
        },
        adminName: {
            type: String,
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
        async fetchAllOrdersReport(dateFilterId = null) {
            this.loadingStore.show('Preparing...');
            try {
                await this.transactStore.fetchOrdersReportStore(this.branchId, dateFilterId);
                if (this.transactStore.allOrders.length === 0) {
                    this.mappedOrders = [];
                } else {
                    this.mappedOrders = this.transactStore.allOrders.map(t_order => this.formatOrder(t_order));
                }
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingStore.hide();
            }
        },

        async downloadTransactions(dateFilterId = null) {
            await this.transactStore.fetchOrdersReportStore(this.branchId, dateFilterId);
            if (this.transactStore.transactions.length === 0) {
                this.showError("No available orders report to download.");
                return;
            } else {
                this.loadingStore.show('Downloading transactions...');
            }
            const transactions = this.transactStore.transactions.map(order => ({
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
            const headings = [
                `Shop Name: ${this.shopName}`,
                `Branch Name: ${this.branchName}`,
                `Branch Location: ${this.branchLocation}`,
                `Contact: ${this.contact}`,
                `Date: ${this.formatCurrentDate}`,
                `Prepared by : ${this.adminName}`,
                '',
            ].join('\n');
            const csvContent = "data:text/csv;charset=utf-8,"
                + headings + "\n"
                + Object.keys(transactions[0]).join(",") + "\n"
                + transactions.map(e => Object.values(e).join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Orders_Report_${this.branchName}_${this.currentNumberDate}.csv`);
            document.body.appendChild(link); // Required for FF
            this.showSuccess("Transactions downloaded successfully!");
            link.click();
            this.loadingStore.hide();
            document.body.removeChild(link);
        },

        async printTransactions(dateFilterId = null) {
            await this.transactStore.fetchOrdersReportStore(this.branchId, dateFilterId);
            if (this.transactStore.transactions.length === 0) {
                this.showError("No available orders report to print.");
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
                            <img src="${this.shopLogoLink}" alt="Logo" style="width: 200px; height: auto;">
                            <div>
                                <h2>${this.shopName}</h2>
                                <h4>${this.branchName} Branch</h4>
                                <h5>${this.branchLocation}</h5>
                                <h5>${this.contact}</h5>
                            </div>
                            <h5>${this.formatCurrentDate}</h5>
                        </div>
                        <p><strong>Transactions Report for ${this.branchName} Branch | ${this.selectedFilterLabel}</strong></p>
                        <table>
                            <tr>
                                <th>Reference #</th>
                                <th>ModeOfPayment</th>
                                <th>Quantity</th>
                                <th>CashRender</th>
                                <th>TotalDue</th>
                                <th>Discount</th>
                                <th>Change</th>
                                <th>CashierName</th>
                                <th>TransactionDate</th>
                            </tr>
                            ${this.transactStore.transactions.map(order => `
                                <tr>
                                    <td>${order.reference_number}</td>
                                    <td>₱${order.payment_method}</td>
                                    <td>${order.total_quantity} ${order.total_quantity > 1 ? 'items' : 'item'}</td>
                                    <td>₱${order.customer_cash}</td>
                                    <td>₱${order.total_due}</td>
                                    <td>₱${order.customer_discount}</td>
                                    <td>₱${order.customer_change}</td>
                                    <td>₱${order.cashier_name}</td>
                                    <td>${this.formatDateTime(order.updated_at)}</td>
                                </tr>`).join('')}
                        </table>
                        <footer>
                            <p style="margin-top: 30px;">
                                Prepared by: <strong>${this.adminName}</strong>
                            </p>
                        </footer>
                    </body>
                </html>`);
            printWindow.document.close();
            printWindow.print();
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

        formatOrder(order) {
            const customer_cash_value = Number(order.customer_cash);
            const display_customer_cash = (Math.round(customer_cash_value * 100) / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '';

            const total_amount_value = Number(order.total_amount);
            const display_total_amount = (Math.round(total_amount_value * 100) / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '';

            const customer_change_value = Number(order.customer_change);
            const display_customer_change = (Math.round(customer_change_value * 100) / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '';

            return {
                ...order,
                display_customer_cash: `₱${display_customer_cash}`,
                display_total_amount: `₱${display_total_amount}`,
                display_discount: `₱${order.discount_amount}`,
                display_customer_change: `₱${display_customer_change}`,
                display_total_quantity: `${order.total_quantity} ${order.total_quantity > 1 ? 'items' : 'item'}`,
                updated_at: this.formatDateTime(order.updated_at),
            };
        },

        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },

        showSuccess(message) {
            this.$refs.snackbarRef.showSnackbar(message, "success");
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
