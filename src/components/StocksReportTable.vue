<template>
    <v-data-table :headers="stocksHeaders" :items="mappedStocks" :loading="loading" :items-per-page="10"
        :sort-by="[{ key: 'updated_at', order: 'desc' }]" class="hover-table" density="comfortable">
        <template v-slot:top>
            <div class="d-flex flex-wrap align-center mt-5">
                <v-autocomplete v-model="dateFilter" :items="dateFilterItems" item-title="filter_date_label"
                    item-value="filter_date_id" label="Date filter" class="me-1" density="compact" clearable />
                <div class="d-flex mb-5">
                    <v-btn @click="downloadStocks(dateFilter)" height="40" prepend-icon="mdi-download"
                        color="primary" variant="tonal" class="ps-6"><span class="to-hide">XLS</span></v-btn>&nbsp;
                    <v-btn @click="printStocks(dateFilter)" height="40" prepend-icon="mdi-printer" color="primary"
                        variant="tonal" class="ps-6"><span class="to-hide">PRINT</span></v-btn>&nbsp;
                    <v-btn @click="fetchStocksReport(dateFilter)" height="40" class="ps-7" prepend-icon="mdi-refresh" color="primary" variant="tonal"
                        :loading="loading"></v-btn>
                </div>
            </div>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.total_quantity="{ item }">
            <v-chip color="green" size="small" variant="tonal">
                {{ item.total_quantity }}
            </v-chip>
        </template>

        <template v-slot:no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                <span>&nbsp; No stocks report found
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
import { useStocksStore } from '@/stores/stocksStore';
import Snackbar from '@/components/Snackbar.vue';

export default {
    name: 'StocksReportTable',
    data() {
        return {
            shopLogoLink: '-',
            mappedStocks: [],
            dateFilter: 1,
            dateFilterItems: [
                { filter_date_id: 1, filter_date_label: 'Today' },
                { filter_date_id: 2, filter_date_label: 'Yesterday' },
                { filter_date_id: 3, filter_date_label: 'Last 7 days' },
                { filter_date_id: 4, filter_date_label: 'This Week' },
                { filter_date_id: 5, filter_date_label: 'Last 30 days' },
                { filter_date_id: 6, filter_date_label: 'This Month' },
                { filter_date_id: 7, filter_date_label: 'Last Month' },
            ],
            stocksHeaders: [
                { title: '', value: 'select', width: '5%' },
                { title: 'StockName', value: 'ingredient_name', sortable: 'true', width: '20%' },
                { title: 'RemainingStock', value: 'quantity_remaining', sortable: 'true', width: '10%' },
                { title: 'StockOut', value: 'stock_out', sortable: 'true', width: '10%' },
                { title: 'QuantitySold', value: 'total_quantity', sortable: 'true', width: '10%' },
                { title: 'Date', value: 'updated_at', sortable: 'true', width: '25%' },
            ],
        }
    },
    components: {
        Snackbar,
    },
    mounted() {
        this.fetchStocksReport(this.dateFilter);
    },
    watch: {
        stocksByDate: {
            handler(newVal) {
                this.mappedStocks = newVal.map(sale => this.formatStock(sale));
            },
            immediate: true
        },
        dateFilter(newVal) {
            this.fetchStocksReport(newVal);
        },
    },
    computed: {
        selectedFilterLabel() {
            const found = this.dateFilterItems.find(item => item.filter_date_id === this.dateFilter);
            return found ? found.filter_date_label : '';
        }
    },
    props: {
        stocksByDate: {
            type: Array,
            default: () => []
        },
        stocks: {
            type: Array,
            required: true
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
        const stocksStore = useStocksStore();
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
            stocksStore,
            currentNumberDate,
            formatCurrentDate,
        };
    },
    methods: {
        async fetchStocksReport(dateFilterId = null) {
            this.loadingStore.show('Preparing...');
            try {
                await this.stocksStore.fetchStocksReportStore(this.branchId, dateFilterId);
                if (this.stocksStore.stocksByDate.length === 0) {
                    this.mappedStocks = [];
                } else {
                    this.mappedStocks = this.stocksStore.stocksByDate.map(stock => this.formatStock(stock));
                }
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingStore.hide();
            }
        },

        async downloadStocks(dateFilterId = null) {
            await this.stocksStore.fetchStocksReportStore(this.branchId, dateFilterId);
            if (this.stocksStore.stocksByDate.length === 0) {
                this.showError("No available stocks report to download.");
                return;
            } else {
                this.loadingStore.show('Downloading stocks...');
            }
            const headings = [
                `Shop name: ${this.shopName}`,
                `Branch name: ${this.branchName} Branch`,
                `Branch address: ${this.branchAddress}`,
                `Contact: ${this.contact}`,
                `Date: ${this.formatCurrentDate}`,
                `Prepared by : ${this.adminName}`,
                '',
            ].join('\n');
            const stocksByDate = this.stocksStore.stocksByDate.map(stock => ({
                'Ingredients': stock.ingredient_name,
                'Remaining_stock': Number(stock.quantity_remaining),
                'Stock_out': Number(stock.stock_out),
                'Quantity_sold': Number(stock.total_quantity),
                'Date': this.formatDateTime(stock.updated_at),
            }));
            const csvContent = "data:text/csv;charset=utf-8,"
                + headings + "\n"
                + Object.keys(stocksByDate[0]).join(",") + "\n"
                + stocksByDate.map(e => Object.values(e).join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Stocks_Report_${this.branchName}_${this.currentNumberDate}.csv`);
            document.body.appendChild(link); // Required for FF
            this.showSuccess("Stocks downloaded successfully!");
            link.click();
            this.loadingStore.hide();
            document.body.removeChild(link);
        },

        async printStocks(dateFilterId = null) {
            await this.stocksStore.fetchStocksReportStore(this.branchId, dateFilterId);
            if (this.stocksStore.stocksByDate.length === 0) {
                this.showError("No available stocks report to print.");
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
                        <title>Stocks Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; }
                            h2 { margin: 0; }
                            h2, h4, h5 { text-align: center; }
                            h4, h5 { font-weight: normal; margin: 5px; }
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
                                <h5>${this.contact}</h5>
                            </div>
                            <h5>${this.formatCurrentDate}</h5>
                        </div>
                        <p><strong>Stocks Report for ${this.branchName} Branch</strong></p>
                        <table>
                            <tr>
                                <th>Ingredients</th>
                                <th>RemainingStock</th>
                                <th>StockOut</th>
                                <th>QuantitySold</th>
                                <th>Date</th>
                            </tr>
                            ${this.stocksStore.stocksByDate.map(stock => `
                                <tr>
                                    <td>${stock.ingredient_name}</td>
                                    <td>${Number(stock.quantity_remaining)}${stock.unit_avb}</td>
                                    <td>${Number(stock.stock_out)}${stock.unit_avb}</td>
                                    <td>x${Number(stock.total_quantity)}</td>
                                    <td>${this.formatDateTime(stock.updated_at)}</td>
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

        formatStock(stock) {
            return {
                ...stock,
                ingredient_name: this.capitalizeFirstLetter(stock.ingredient_name),
                quantity_remaining: `${Number(stock.quantity_remaining)}${stock.unit_avb}`,
                availability_id: Number(stock.availability_id),
                stock_out: `${Number(stock.stock_out)}${stock.unit_avb}`,
                total_quantity: `x${Number(stock.total_quantity)}`,
                updated_at: this.formatDateTime(stock.updated_at),
            };
        },

        capitalizeFirstLetter(text) {
            return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
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

        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },

        showSuccess(message) {
            this.$refs.snackbarRef.showSnackbar(message, "success");
        },
    }
}
</script>