<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <v-icon @click="back" class="mb-4">mdi-arrow-left</v-icon>
        <h3>Add Stock in <span class="text-warning">{{ branchName }}</span> Branch</h3>
        <v-form ref="stockForm" @submit.prevent="showConfirmDialog">
            <v-container v-for="(row, index) in stockRows" :key="index" class="parent border rounded my-3 pb-1 mx-auto">
                <v-btn color="red" class="d-flex align-center me-1 mb-5 pt-7 pb-7 ps-7" variant="tonal" prepend-icon="mdi-trash-can-outline"
                    @click="removeRow(index)">
                    <span class="to-hide">Remove</span>
                    <span class="to-show mt-5"></span>
                </v-btn>
                <v-text-field class="child" v-model="row.stockIngredient" label="Stock name" :rules="[v => !!v || 'Required']"
                    variant="outlined" />
                <v-text-field class="child" v-model="row.stockIn" label="Stock In (qty)" :rules="[v => !!v || 'Required']"
                    type="number" variant="outlined" />
                <v-text-field class="child" v-model="row.stockAlertQty" label="Stock alert (qty)" :rules="[v => !!v || 'Required']"
                    type="number" variant="outlined" />
                <v-autocomplete class="child" v-model="row.stockUnit" label="Unit" :items="unitOptions"
                    @click="getProductTemperatureOption" :rules="[v => !!v || 'Required']" item-title="unit_avb"
                    item-value="unit_id" variant="outlined" />
                <v-text-field class="child" v-model="row.costPerUnit" label="Cost Per Unit (₱)" type="text"
                    :rules="[v => !isNaN(parseFloat(v)) || 'Required' || 'Must be a valid number']"
                    @input="e => row.costPerUnit = e.target.value.replace(/[^0-9.]/g, '')" variant="outlined" />
            </v-container>
            <v-row>
                <v-col cols="12">
                    <v-btn color="primary" class="mb-3" variant="tonal" prepend-icon="mdi-plus"
                        :disabled="validatingStock" @click="addRow">
                        Add More
                    </v-btn>
                    <v-btn color="green" class="ms-3 mb-3" variant="tonal" prepend-icon="mdi-check"
                        :disabled="!isFormValid || validatingStock" @click="showConfirmDialog">
                        Confirm
                    </v-btn>
                </v-col>
            </v-row>
        </v-form>
        <v-dialog v-model="confirmDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Confirmation</span>
                </v-card-title>
                <v-card-text>
                    <p class="text-center">Do you want to save new stocks?</p>
                </v-card-text>
                <v-card-actions class="mx-4 my-4">
                    <v-spacer></v-spacer>
                    <v-btn color="red" class="px-3" variant="tonal" prepend-icon="mdi-close" text
                        @click="closeConfirmDialog">Check
                        again</v-btn>
                    <v-btn color="green" class="px-3" variant="tonal" prepend-icon="mdi-content-save"
                        @click="submitForm">
                        <v-progress-circular v-if="validatingStock" size="20" color="white" label="Loading..."
                            indeterminate />
                        <span v-else>Save</span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <Snackbar ref="snackbarRef" />
        <LoaderUI :visible="validatingStock" message="Saving..." />
    </v-container>
</template>

<script>
import apiClient from '../axios';
import Snackbar from '@/components/Snackbar.vue';
import LoaderUI from '@/components/LoaderUI.vue';
import { useStocksStore } from '@/stores/stocksStore';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'AddStock',
    components: {
        Snackbar,
        LoaderUI
    },
    data() {
        return {
            shopID: null,
            branchID: null,
            branchName: null,
            validatingStock: false,
            confirmDialog: false,
            stockRows: [
                {
                    stockIngredient: '',
                    stockIn: '',
                    stockAlertQty: '',
                    stockUnit: null,
                    costPerUnit: '',
                },
            ],
            unitOptions: [],
        };
    },
    setup() {
        const stocksStore = useStocksStore();
        return { stocksStore };
    },
    created() {
        this.shopID = this.$route.query.shop_id;
        this.branchID = this.$route.query.branch_id;
        this.branchName = this.$route.query.branch_name;
    },
    computed: {
        isFormValid() {
            return this.stockRows.every(row => {
                return (
                    row.stockIngredient &&
                    row.stockIn &&
                    row.stockAlertQty &&
                    row.stockUnit &&
                    !isNaN(parseFloat(row.costPerUnit))
                );
            });
        },
    },
    methods: {
        back() {
            this.$router.go(-1);
        },
        removeRow(index) {
            if (this.stockRows.length > 1) {
                this.stockRows.splice(index, 1);
            }
        },
        showConfirmDialog() {
            if (this.isFormValid) this.confirmDialog = true;
        },
        closeConfirmDialog() {
            this.confirmDialog = false;
        },
        addRow() {
            this.stockRows.push({
                stockIngredient: '',
                stockIn: '',
                stockAlertQty: '',
                stockUnit: null,
                costPerUnit: '',
            });
        },
        async getOptions(endpoint, targetArray, errorMessage) {
            try {
                const response = await apiClient.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                });
                this[targetArray] = response.data;
            } catch (error) {
                this.$refs.snackbarRef.showSnackbar(errorMessage, 'error');
            }
        },
        getProductTemperatureOption() {
            this.getOptions('/admin/stock-unit-option', 'unitOptions', 'Failed to fetch unit options');
        },
        async submitForm() {
            this.confirmDialog = false;
            try {
                if (!this.$refs.stockForm.validate()) return;
                this.validatingStock = true;
                const payload = this.stockRows.map(row => ({
                    stock_ingredient: row.stockIngredient,
                    stock_in: row.stockIn,
                    stock_alert_qty: row.stockAlertQty,
                    stock_unit: row.stockUnit,
                    stock_cost_per_unit: parseFloat(row.costPerUnit.replace(/[^0-9.]/g, '')) || 0,
                    branch_id: this.branchID
                }));
                await this.stocksStore.saveStocksStore(payload);
                this.validatingStock = false;
                this.showSuccess("Stocks saved successfully!");
                this.$refs.stockForm.reset();
            } catch (error) {
                this.validatingStock = false;
                this.showError("Failed to save stocks. Please try again!");
                console.error('Stocks submission error:', error);
            }
        },
        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },
        showSuccess(message) {
            this.$refs.snackbarRef.showSnackbar(message, "success");
        },
    },

};
</script>

<style scoped>
.parent {
    display: flex;
    flex-wrap: wrap;
}

.child {
    min-width: 250px;
    max-width: 400px;
    margin-left: 4px;
    margin-right: 4px;
}

.child:nth-last-child(1) {
    max-width: 500px;
}
</style>