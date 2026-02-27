<template>
    <v-data-table :headers="salesReportHeaders" :items="mappedSales" :loading="loading" :items-per-page="10"
        :sort-by="[{ key: 'updated_at', order: 'desc' }]" class="hover-table" density="comfortable">
        <template v-slot:top>
            <v-row class="mt-5">
                <v-col cols="12" lg="6" md="6" sm="6" class="pa-0">
                    <div class="d-flex ms-3 mb-5">
                        <v-btn @click="downloadSales(dateFilter)" prepend-icon="mdi-download" color="primary"
                            variant="tonal">XLS</v-btn>&nbsp;
                        <v-btn @click="printSales(dateFilter)" prepend-icon="mdi-printer" color="primary"
                            variant="tonal">PRINT</v-btn>&nbsp;
                        <v-btn class="ps-7" prepend-icon="mdi-refresh" color="primary" variant="tonal"
                            @click="fetchSalesReport(dateFilter)" :loading="loading"></v-btn>
                    </div>
                </v-col>
                <v-col cols="12" lg="6" md="6" sm="6" class="pa-0">
                    <div class="d-flex">
                        <v-autocomplete v-model="dateFilter" :items="dateFilterItems" item-title="filter_date_label"
                            item-value="filter_date_id" label="Date Filter" class="ms-3 me-2" clearable>
                        </v-autocomplete>
                        <!-- <span class="w-25">Net sales: <br /><h3>₱{{ Number(totalSales).toLocaleString('en-PH') }}</h3></span> -->
                    </div>
                </v-col>
            </v-row>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.total_quantity="{ item }">
            {{ item.total_quantity }} {{ item.total_quantity > 1 ? 'items' : 'item' }}
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.display_gross_sales="{ item }">
            <v-chip color="blue" size="small" variant="tonal">
                {{ item.display_gross_sales }}
            </v-chip>
        </template>

        <template v-slot:no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                <span>&nbsp; No sales report found
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
    name: 'SalesReportTable',
    data() {
        return {
            // totalSales: null,
            mappedSales: [],
            dateFilter: 1,
            shopLogoLink: '-',
            salesReportHeaders: [
                { title: 'Product', value: 'display_product_name', sortable: 'true', width: '25%' },
                { title: 'Price', value: 'display_base_price', sortable: 'true', width: '10%' },
                { title: 'Quantity', value: 'display_total_quantity', sortable: 'true', width: '10%' },
                { title: 'Category', value: 'category_label', sortable: 'true', width: '15%' },
                { title: 'GrossSale', value: 'display_gross_sales', sortable: 'true', width: '15%' },
                { title: 'Date', value: 'updated_at', sortable: 'true', width: '25%' },
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
        this.fetchSalesReport(this.dateFilter);
    },
    watch: {
        salesByDate: {
            handler(newVal) {
                this.mappedSales = newVal.map(sale => this.formatSales(sale));
            },
            immediate: true
        },
        dateFilter(newVal) {
            this.fetchSalesReport(newVal);
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
        salesByDate: {
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
        branchAddress: {
            type: String,
            required: true
        },
        branchContactNumber: {
            type: String,
            required: true
        },
        // shopLogoLink: {
        //     type: String,
        //     required: true
        // },
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
        async fetchSalesReport(dateFilterId = null) {
            this.loadingStore.show('Preparing...');
            try {
                await this.transactStore.fetchGrossSalesByDateStore(this.branchId, dateFilterId);
                if (this.transactStore.grossSalesByDate.length === 0) {
                    this.mappedSales = [];
                    // this.totalSales = [];
                } else {
                    this.mappedSales = this.transactStore.grossSalesByDate.map(t_order => this.formatSales(t_order));
                    // this.totalSales = this.transactStore.grossSales;
                }
            } catch (error) {
                console.error(error);
                this.showError();
            } finally {
                this.loadingStore.hide();
            }
        },

        async downloadSales(dateFilterId = null) {
            try {
                this.loadingStore.show('Preparing...');
                await this.transactStore.fetchGrossSalesByDateStore(this.branchId, dateFilterId);
                if (this.transactStore.grossSalesByDate.length === 0) {
                    this.loadingStore.hide();
                    this.showError("No available sales report to download.");
                    return;
                } else {
                    this.loadingStore.show('Downloading sales...');
                }
                const headings = [
                    `Shop name: ${this.shopName}`,
                    `Branch name: ${this.branchName} Branch`,
                    `Branch address: ${this.branchAddress}`,
                    `Branch contact number: ${this.branchContactNumber}`,
                    `Date: ${this.formatCurrentDate}`,
                    `Prepared by : ${this.adminName}`,
                    `TOTAL SALES : ₱${this.formatSalesDisplay(this.transactStore.totalSales)}`,
                    '',
                ].join('\n');
                const grossSalesByDate = this.transactStore.grossSalesByDate.map(t_order => ({
                    'Product name': `${t_order.product_name}${t_order.temp_label}${t_order.size_label}`,
                    'Product price': t_order.base_price,
                    'Total quantity': t_order.total_quantity,
                    'Product category': t_order.category_label,
                    'Subtotal': this.formatSalesDisplay(t_order.gross_sales),
                    'Date': this.formatDateTime(t_order.updated_at),
                }));
                const csvContent = "data:text/csv;charset=utf-8,"
                    + headings + "\n"
                    + Object.keys(grossSalesByDate[0]).join(",") + "\n"
                    + grossSalesByDate.map(e => Object.values(e).join(",")).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `Sales_Report_${this.branchName}_${this.currentNumberDate}.csv`);
                document.body.appendChild(link);
                this.showSuccess("Sales downloaded successfully!");
                link.click();
                this.loadingStore.hide();
                document.body.removeChild(link);
            } catch (error) {
                this.showError("Error fetching sales!");
            }
        },

        async printSales(dateFilterId = null) {
            await this.transactStore.fetchGrossSalesByDateStore(this.branchId, dateFilterId);
            if (this.transactStore.grossSalesByDate.length === 0) {
                this.showError("No available sales report to print.");
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
                        <title>Sales Report</title>
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
                                <h5>${this.branchAddress}</h5>
                                <h5>${this.branchContactNumber}</h5>
                            </div>
                            <h5>${this.formatCurrentDate}</h5>
                        </div>
                        <p>
                            <strong>Sales Report for ${this.branchName} Branch | ${ this.selectedFilterLabel }</strong>
                            <br />
                            <strong>Total Sales: ${this.formatSalesDisplay(this.transactStore.totalSales)}</strong>
                        </p>
                        <table>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantiy</th>
                                <th>Category</th>
                                <th>Subtotal</th>
                                <th>Date</th>
                            </tr>
                            ${this.transactStore.grossSalesByDate.map(t_order => `
                                <tr>
                                    <td>${t_order.product_name}${t_order.temp_label}${t_order.size_label}</td>
                                    <td>₱${t_order.base_price}</td>
                                    <td>${t_order.total_quantity } ${ t_order.total_quantity > 1 ? 'items' : 'item'} </td>
                                    <td>${t_order.category_label}</td>
                                    <td>₱${this.formatSalesDisplay(t_order.gross_sales)}</td>
                                    <td>${this.formatDateTime(t_order.updated_at)}</td>
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

        formatSales(sale) {
            const value = Number(sale.gross_sales);
            const display_sales = (Math.round(value * 100) / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '';
            return {
                ...sale,
                display_product_name: `${sale.product_name}${sale.temp_label}${sale.size_label}`,
                updated_at: this.formatDateTime(sale.updated_at),
                display_base_price: `₱${sale.base_price}`,
                display_total_quantity: `x${sale.total_quantity}`,
                display_gross_sales: `₱${display_sales}`,
            };
        },

        formatSalesDisplay(sales) {
            if (!sales) return '0.00';
            const value = Number(sales);
            return (Math.round(value * 100) / 100).toLocaleString('en-PH', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }) || '';
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
