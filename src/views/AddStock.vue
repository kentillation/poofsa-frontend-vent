<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <v-icon @click="back" class="mb-4">mdi-arrow-left</v-icon>
        <h3>Add Stock in <span class="text-warning">{{ branchName }}</span> Branch</h3>
        <v-form ref="stockForm" @submit.prevent="showSubmitDialog">
            <v-container v-for="(row, index) in stockRows" :key="index" class="parent border rounded my-3 pb-1 mx-auto">
                <v-btn color="red" class="pe-1 mb-4 me-1" prepend-icon="mdi-trash-can-outline"
                    @click="removeRow(index)">
                </v-btn>
                <!-- ingredientName, baseUnitId, alertQuantity, quantityReceived, unitCost  -->
                <v-text-field class="child" v-model="row.ingredientName" label="Item name"
                    :rules="[v => !!v || 'Required']" density="compact" variant="outlined" />

                <v-autocomplete class="child" v-model="row.baseUnitId" label="Base unit" :items="unitOptions"
                    @click="getUnitOption" :rules="[v => !!v || 'Required']" item-title="unit_label"
                    item-value="ingredient_unit_id" density="compact" variant="outlined" />

                <v-text-field class="child" v-model="row.alertQuantity" label="Alert quantity"
                    :rules="[v => !!v || 'Required']" type="number" density="compact" variant="outlined" />

                <v-text-field class="child" v-model="row.quantityReceived" label="Quantity received"
                    :rules="[v => !!v || 'Required']" type="number" density="compact" variant="outlined" />
                
                <v-text-field class="child" v-model="row.unitCost" label="Unit Cost (₱)" type="text"
                    :rules="[v => !isNaN(parseFloat(v)) || 'Required' || 'Must be a valid number']"
                    @input="e => row.unitCost = e.target.value.replace(/[^0-9.]/g, '')" density="compact"
                    variant="outlined" />
            </v-container>
            <v-row>
                <v-col cols="12">
                    <v-btn color="primary" class="mb-3" prepend-icon="mdi-plus"
                        :disabled="validatingStock" @click="addRow">
                        Add More
                    </v-btn>
                    <v-btn color="green" class="ms-3 mb-3" prepend-icon="mdi-check"
                        :disabled="!isFormValid || validatingStock" @click="showSubmitDialog">
                        Submit
                    </v-btn>
                </v-col>
            </v-row>
        </v-form>
        <v-dialog v-model="submitDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Confirmation</span>
                </v-card-title>
                <v-card-text>
                    <p class="text-center">Do you want to save new stocks in <span class="text-warning">{{ branchName }}</span> Branch?</p>
                </v-card-text>
                <v-card-actions class="mx-4 my-4">
                    <v-spacer></v-spacer>
                    <v-btn color="red" class="px-3" variant="flat" prepend-icon="mdi-close" text
                        @click="closeSubmitDialog">Check
                        again</v-btn>
                    <v-btn color="green" class="px-3" variant="flat" prepend-icon="mdi-content-save"
                        @click="submitForm">
                        <v-progress-circular v-if="validatingStock" size="20" color="white" label="Loading..."
                            indeterminate />
                        <span v-else>Save</span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <Snackbar ref="snackbarRef" />
    </v-container>
</template>

<script>
import apiClient from '../axios';
import Snackbar from '@/components/Snackbar.vue';
import { useStocksStore } from '@/stores/stocksStore';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'AddStock',
    components: {
        Snackbar
    },
    data() {
        return {
            shopID: null,
            branchID: null,
            branchName: null,
            validatingStock: false,
            submitDialog: false,
            stockRows: [
                {
                    ingredientName: '',
                    baseUnitId: null,
                    alertQuantity: '',
                    quantityReceived: '',
                    unitCost: '',
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
                    row.ingredientName &&
                    row.baseUnitId &&
                    row.alertQuantity &&
                    row.quantityReceived &&
                    !isNaN(parseFloat(row.unitCost))
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

        showSubmitDialog() {
            if (this.isFormValid) this.submitDialog = true;
        },

        closeSubmitDialog() {
            this.submitDialog = false;
        },

        addRow() {
            this.stockRows.push({
                ingredientName: '',
                baseUnitId: null,
                alertQuantity: '',
                quantityReceived: '',
                unitCost: '',
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

        getUnitOption() {
            this.getOptions('/admin/unit-option', 'unitOptions', 'Failed to fetch unit options');
        },

        async submitForm() {
            this.submitDialog = false;
            try {
                if (!this.$refs.stockForm.validate()) return;
                this.validatingStock = true;
                const payload = this.stockRows.map(row => ({
                    ingredient_name: row.ingredientName,
                    base_unit_id: row.baseUnitId,
                    alert_quantity: Number(row.alertQuantity) || 0,
                    quantity_received: parseFloat(row.quantityReceived.replace(/[^0-9.]/g, '')) || 0,
                    unit_cost: parseFloat(row.unitCost.replace(/[^0-9.]/g, '')) || 0,
                    branch_id: Number(this.branchID),
                }));
                await this.stocksStore.saveStocksStore(payload);
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