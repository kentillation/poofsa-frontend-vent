<template>
    <v-data-table :headers="productsHeaders" :items="products" :loading="loading" :items-per-page="10"
        :sort-by="[{ key: 'updated_at', order: 'desc' }]" class="hover-table" density="comfortable">
        <template v-slot:top>
            <v-toolbar flat color="transparent" class="mt-2">
                <v-btn @click="downloadProducts" prepend-icon="mdi-download" color="primary" variant="tonal">XLS</v-btn>&nbsp;
                <v-btn @click="printProducts" prepend-icon="mdi-printer" color="primary" variant="tonal">PRINT</v-btn>&nbsp;
                <v-btn prepend-icon="mdi-refresh" color="primary" variant="tonal" class="ps-7 me-3"
                    @click="$emit('refresh')" :loading="loading"></v-btn>
            </v-toolbar>
        </template>
        <!--eslint-disable-next-line -->
        <template v-slot:item.product_name="{ item }">
            <span :class="{ 'text-red': item.availability_id === 2 }">
                {{ item.product_name }}
            </span>
        </template>
        <template v-slot:no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                <span>&nbsp; No products found for this branch.</span>
            </v-alert>
        </template>
        <template v-slot:loading>
            <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
        </template>
    </v-data-table>
    <Snackbar ref="snackbarRef" />
</template>

<script>
import { useLoadingStore } from '@/stores/loading';
import { useProductsStore } from '@/stores/productsStore';
import Snackbar from '@/components/Snackbar.vue';


export default {
    name: 'ProductsReportTable',
    data() {
        return {
            shopLogoLink: '-',
            productsHeaders: [
                { title: '', value: 'select', width: '5%' },
                { title: 'ProductName', value: 'product_name', sortable: true, width: '20%' },
                { title: 'Price', value: 'display_product_price', sortable: true, width: '20%' },
                { title: 'Category', value: 'category_label', sortable: true, width: '20%' },
                { title: 'LastUpdate', value: 'updated_at', sortable: true, width: '25%' },
            ],
        }
    },
    components: {
        Snackbar,
    },
    props: {
        products: {
            type: Array,
            required: true,
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
        // shopLogoLink: {
        //     type: String,
        //     required: true
        // },
        adminName: {
            type: String,
            required: true
        },
    },
    emits: [
        'refresh',
    ],
    setup() {
        const loadingStore = useLoadingStore();
        const productsStore = useProductsStore();
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
            productsStore,
            currentNumberDate,
            formatCurrentDate,
        };
    },
    methods: {
        async downloadProducts(){
            await this.productsStore.fetchAllProductsStore(this.branchId);
            if (this.productsStore.products.length === 0) {
                this.showError("No products available to download.");
                return;
            } else {
                this.loadingStore.show('Downloading products...');
            }
            const products = this.productsStore.products.map(product => ({
                'Product Name': product.product_name + product.temp_label + product.size_label,
                'Price': product.product_price,
                'Category': product.category_label,
                'Last Update': this.formatDateTime(product.updated_at),
            }));

            const headings = [
                `Shop Name: ${this.shopName}`,
                `Branch Name: ${this.branchName} Branch`,
                `Branch Loc: ${this.branchLocation}`,
                `Contact: ${this.contact}`,
                `Date: ${this.formatCurrentDate}`,
                `Prepared by : ${this.adminName}`,
                '',
            ].join('\n');

            const csvContent = "data:text/csv;charset=utf-8," 
                + headings + "\n"
                + Object.keys(products[0]).join(",") + "\n"
                + products.map(e => Object.values(e).join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Products_Report_${this.branchName}_${this.currentNumberDate}.csv`);
            document.body.appendChild(link); // Required for FF
            this.showSuccess("Products downloaded successfully!");
            link.click();
            this.loadingStore.hide();
            document.body.removeChild(link);
            // this.$emit('refresh');
        },

        async printProducts() {
            await this.productsStore.fetchAllProductsStore(this.branchId);
            if (this.productsStore.products.length === 0) {
                this.showError("No products available to print.");
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
                        <title>Products Report</title>
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
                            <img src="${ this.shopLogoLink }" alt="Logo" style="width: 200px; height: auto;">
                            <div>
                                <h2>${this.shopName}</h2>
                                <h4>${this.branchName} Branch</h4>
                                <h5>${this.branchLocation}</h5>
                                <h5>${this.contact}</h5>
                            </div>
                            <h5>${ this.formatCurrentDate }</h5>
                        </div>
                        <p><strong>Products Report for ${this.branchName} Branch</strong></p>
                        <table>
                            <tr>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Last Update</th>
                            </tr>
                            ${this.productsStore.products.map(product => `
                                <tr>
                                    <td>${product.product_name}${product.temp_label}${product.size_label}</td>
                                    <td>₱${product.product_price}</td>
                                    <td>${product.category_label}</td>
                                    <td>${this.formatDateTime(product.updated_at)}</td>
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

        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },
        showSuccess(message) {
            this.$refs.snackbarRef.showSnackbar(message, "success");
        },
    }
}
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