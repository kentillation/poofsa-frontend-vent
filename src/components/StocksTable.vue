<template>
    <v-row>
        <v-col cols="12" lg="4" md="4" sm="6">
            <v-text-field
                density="comfortable"
                v-model="searchStock" 
                placeholder="Search stock details" 
                variant="outlined" 
                label="Search stock details"
                clearable
                @click:clear="searchStock = ''"
                @update:modelValue="debounceSearch"></v-text-field>
        </v-col>
    </v-row>
    <v-data-table 
        :headers="stockHeaders" 
        :items="filteredStocks" 
        :loading="loading" 
        :items-per-page="10"
        class="elevation-1 hover-table" 
        density="comfortable">
        <template v-slot:top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of all Stocks</h2>
                <h2 class="ms-4 to-show">List</h2>
                <v-spacer></v-spacer>
                <AddStockDialog v-model="addStockDialog" />
                <v-btn @click="openAddStockDialog" :disabled="loading" prepend-icon="mdi-plus" color="#0090b6"
                    class="me-2" variant="flat">
                    <span class="to-hide">Add stocks</span>
                    <span class="to-show">Stocks</span>
                </v-btn>
                <v-btn @click="fetchStocks" :loading="loading" icon="mdi-refresh" color="#0090b6" variant="flat"
                    size="small" class="me-3"></v-btn>
            </v-toolbar>
        </template>

        <!--eslint-disable-next-line -->
        <!-- <template v-slot:item.select="{ item }">
            <v-checkbox v-model="item.selected" :value="true" color="primary"
                class="d-flex justify-center"></v-checkbox>
        </template> -->

        <!--eslint-disable-next-line -->
        <template v-slot:item.stock_ingredient="{ item }">
            <span :class="Number(item.availability_id) === 2 ? 'text-red' : ''">
                {{ item.stock_ingredient }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.unit_label="{ item }">
            <span :class="Number(item.availability_id) === 2 ? 'text-red' : ''">
                {{ item.unit_label }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.display_unit_cost="{ item }">
            <span :class="Number(item.availability_id) === 2 ? 'text-red' : ''">
                {{ item.display_unit_cost }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.updated_at="{ item }">
            <span :class="Number(item.availability_id) === 2 ? 'text-red' : ''">
                {{ item.updated_at }}
            </span>
        </template>
        
        <!--eslint-disable-next-line -->
        <template v-slot:item.display_stock_in="{ item }">
            <span :class="Number(item.availability_id) === 2 ? 'text-red' : ''">
                {{ item.display_stock_in }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.display_alert_qty="{ item }">
            <span :class="Number(item.availability_id) === 2 ? 'text-red' : ''">
                {{ item.display_alert_qty }}
            </span>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.availability_label="{ item }">
            <v-chip :color="Number(item.availability_id) === 1 ? 'green' : 'red'" size="small" variant="tonal">
                {{ item.availability_label }}
            </v-chip>
        </template>

        <!--eslint-disable-next-line -->
        <template v-slot:item.actions="{ item }">
            <v-btn @click="$emit('edit-stock', item)" color="green" variant="tonal" size="small" icon="mdi-pencil"></v-btn>
        </template>

        <template v-slot:no-data>
            <v-alert type="warning" variant="tonal" class="ma-4">
                <span>&nbsp; No stocks found for this branch.</span>
            </v-alert>
        </template>
    </v-data-table>
</template>

<script>
import { computed } from 'vue';
import { useLoadingStore } from '@/stores/loading';
import { useStocksStore } from '@/stores/stocksStore';
import { useStockOptionsStore } from '@/stores/stockOptionsStore';
import AddStockDialog from '@/components/AddStockDialog.vue';

export default {
    name: 'StocksTable',
    data() {
        return {
            searchStock: '',
            debounceTimer: null,
            mappedStocks: [],
            addStockDialog: false,
            stockHeaders: [
                { title: '', value: 'select', width: '5%' },
                { title: 'Ingredients', value: 'stock_ingredient', sortable: 'true', width: '20%' },
                { title: 'Unit', value: 'unit_label', sortable: 'true', width: '10%' },
                { title: 'StockQuantity', value: 'display_stock_in', sortable: 'true', width: '15%' },
                { title: 'AlertQuantity', value: 'display_alert_qty', sortable: 'true', width: '15%' },
                { title: 'UnitCost', value: 'display_unit_cost', sortable: 'true', width: '10%' },
                { title: 'Availability', value: 'availability_label', sortable: 'true', width: '15%' },
                { title: 'LastUpdate', value: 'updated_at', sortable: 'true', width: '25%' },
                { title: '', value: 'actions', width: '10%' },
            ],
        }
    },
    components: {
        AddStockDialog
    },
    props: {
        stocks: {
            type: Array,
            required: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        branchId: {
            type: Number,
            required: true
        },
        branchName: {
            type: String,
            required: true
        },
        shopId: {
            type: Number,
            required: true
        }
    },
    mounted() {
        this.fetchStocks();
    },
    watch: {
        stocks: {
            handler(newVal) {
                this.mappedStocks = newVal.map(stock => this.formatStock(stock));
            },
            immediate: true
        },
    },
    emits: [
        'edit-stock',
    ],
    computed: {
        filteredStocks() {
            if (!this.searchStock) {
                return this.mappedStocks;
            }
            const searchTerm = this.searchStock.toLowerCase();
            return this.mappedStocks.filter(stock => {
                return (stock.stock_ingredient.toLowerCase().includes(searchTerm)) ||
                (stock.unit_label.toLowerCase().includes(searchTerm)) ||
                (stock.availability_label.toLowerCase().includes(searchTerm)) ||
                (stock.display_stock_in.toLowerCase().includes(searchTerm)) ||
                (stock.display_unit_cost.toLowerCase().includes(searchTerm)) ||
                (stock.updated_at.toLowerCase().includes(searchTerm));
            });
        },
        // hasCheck() {
        //     return !this.stocks.some(item => item.selected);
        // },
    },
    setup() {
        const stocksStore = useStocksStore();
        const stockOptionsStore = useStockOptionsStore();
        const stockUnitOption = computed(() => stockOptionsStore.unitOption); 
        const stockAvailabilityOption = computed(() => stockOptionsStore.availabilityOption); 
        const loadingStore = useLoadingStore();
        return {
            stocksStore,
            stockOptionsStore,
            stockUnitOption,
            stockAvailabilityOption,
            loadingStore,
        };
    },
    methods: {
        debounceSearch() {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
            }, 300);
        },
        async fetchStocks() {
            this.loadingStore.show('Preparing...');
            try {
                await this.stocksStore.fetchAllStocksStore(this.branchId);
                if (this.stocksStore.stocks.length === 0) {
                    this.mappedStocks = [];
                } else {
                    this.mappedStocks = this.stocksStore.stocks.map(stock => this.formatStock(stock));
                }
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingStore.hide();
            }
        },
        openAddStockDialog() {
            this.$router.push({
                path: '/add-stock/',
                query: {
                    shop_id: this.shopId,
                    branch_id: this.branchId,
                    branch_name: this.branchName,
                }
            });
            // this.addStockDialog = true;
        },
        formatStock(stock) {
            const unit = this.stockUnitOption.find(u => u.unit_id === Number(stock.stock_unit)); 
            const availability = this.stockAvailabilityOption.find(a => a.availability_id === Number(stock.availability_id)); 
            return {
                ...stock,
                unit_label: unit?.unit_label,
                availability_label: availability?.availability_label,
                stock_ingredient: this.capitalizeFirstLetter(stock.stock_ingredient),
                stock_unit: Number(stock.stock_unit),
                stock_in: Number(stock.stock_in),
                display_alert_qty: `≤ ${Number(stock.stock_alert_qty)}`,
                availability_id: Number(stock.availability_id),
                display_stock_in: `x${stock.stock_in}`,
                display_unit_cost: `₱${stock.stock_cost_per_unit}`,
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
                hour12: true,
                timeZone: 'Asia/Manila'
            });
        },
        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },
    }
}
</script>