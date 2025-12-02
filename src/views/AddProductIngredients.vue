<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <v-icon @click="back" class="mb-4">mdi-arrow-left</v-icon>
        <h3>Add Product Ingredients</h3>
        <h4 class="text-grey mt-3">Branch name: {{ branchName }} Branch</h4>
        <h4 class="text-grey">Product name: {{ productName }}{{ productTemp }}{{ productSize }}</h4>
        <v-form ref="productIngredientsForm" @submit.prevent="showConfirmDialog">
            <v-row v-for="(row, index) in productIngredientsRows" :key="index"
                class="d-flex align-center border rounded my-3 pt-3 mx-auto">
                <v-col cols="12" lg="1" md="1" sm="6">
                    <v-btn color="red" variant="tonal" class="pe-1 mb-4" prepend-icon="mdi-trash-can-outline"
                        @click="removeRow(index)"></v-btn>
                </v-col>
                <v-col cols="12" lg="4" md="3" sm="6">
                    <v-autocomplete v-model="row.stock_id" @click="getStockOption" label="Ingredient Name"
                        :items="stocksOption" :rules="[v => !!v || 'Required']" item-title="stock_ingredient"
                        item-value="stock_id" variant="outlined" />
                </v-col>
                <v-col cols="12" lg="3" md="3" sm="6">
                    <v-text-field v-model="row.unit_usage" label="Unit Usage" type="text"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Required' || 'Must be a valid number']"
                        @input="e => row.unit_usage = e.target.value.replace(/[^0-9.]/g, '')" variant="outlined" />
                </v-col>
                <v-col cols="12" lg="3" md="3" sm="6">
                    <v-text-field v-model="row.ingredient_capital" label="Ingredient Capital (₱)" type="text"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Required' || 'Must be a valid number']"
                        @input="e => row.ingredient_capital = e.target.value.replace(/[^0-9.]/g, '')" variant="outlined" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-btn color="primary" variant="tonal" class="mb-3" prepend-icon="mdi-plus"
                        :disabled="validatingProductIngredients" @click="addRow">
                        Add More
                    </v-btn>
                    <v-btn color="green" variant="tonal" class="ms-3 mb-3" prepend-icon="mdi-check"
                        :disabled="!isFormValid || validatingProductIngredients" @click="showConfirmDialog">
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
                    <p class="text-center">Do you want to save new ingredient for {{ productName }} {{ productTemp }} {{ productSize }} product in  {{ branchName }} Branch?</p>
                </v-card-text>
                <v-card-actions class="mx-4 my-4">
                    <v-spacer></v-spacer>
                    <v-btn color="red" variant="tonal" class="px-3" prepend-icon="mdi-close"
                        @click="closeConfirmDialog">Check
                        again</v-btn>
                    <v-btn color="green" variant="tonal" class="px-3" prepend-icon="mdi-content-save"
                        @click="submitForm">
                        <v-progress-circular v-if="validatingProductIngredients" size="20" color="white" label="Loading..."
                            indeterminate />
                        <span v-else>Save</span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <Snackbar ref="snackbarRef" />
        <LoaderUI :visible="validatingProductIngredients" message="Saving..." />
    </v-container>
</template>

<script>
import apiClient from '../axios';
import Snackbar from '@/components/Snackbar.vue';
import LoaderUI from '@/components/LoaderUI.vue';
import { useProductsStore } from '@/stores/productsStore';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'AddProductIngredients',
    components: {
        Snackbar,
        LoaderUI
    },
    data() {
        return {
            shopID: null,
            branchID: null,
            branchName: null,
            productID: null,
            productName: null,
            productTemp: null,
            productSize: null,
            validatingProductIngredients: false,
            confirmDialog: false,
            productIngredientsRows: [
                {
                    unit_usage: '',
                    ingredient_capital: '',
                    productTemp: null,
                    productSize: null,
                    productCategory: null,
                },
            ],
            stocksOption: [],
            productSizeOption: [],
            productCategoryOption: [],
        };
    },
    setup() {
        const productsStore = useProductsStore();
        return { productsStore };
    },
    created() {
        this.shopID = this.$route.query.shop_id;
        this.branchID = this.$route.query.branch_id;
        this.branchName = this.$route.query.branch_name;
        this.productID = this.$route.query.product_id;
        this.productName = this.$route.query.product_name;
        this.productTemp = this.$route.query.product_temp;
        this.productSize = this.$route.query.product_size;

    },
    computed: {
        isFormValid() {
            return this.productIngredientsRows.every(row => {
                return (
                    row.stock_id &&
                    !isNaN(parseFloat(row.unit_usage)) &&
                    !isNaN(parseFloat(row.ingredient_capital))
                );
            });
        },
    },
    methods: {
        back () {
            this.$router.go(-1);
        },
        removeRow(index) {
            if (this.productIngredientsRows.length > 1) {
                this.productIngredientsRows.splice(index, 1);
            }
        },
        showConfirmDialog() {
            if (this.isFormValid) this.confirmDialog = true;
        },
        closeConfirmDialog() {
            this.confirmDialog = false;
        },
        addRow() {
            this.productIngredientsRows.push({
                stock_id: null,
                unit_usage: '',
                ingredient_capital: '',
            });
        },
        async submitForm() {
            this.confirmDialog = false;
            try {
                if (!this.$refs.productIngredientsForm.validate()) return;
                this.validatingProductIngredients = true;
                const payload = this.productIngredientsRows.map(row => ({
                    product_id: this.productID,
                    unit_usage: parseFloat(row.unit_usage.replace(/[^0-9.]/g, '')) || 0,
                    ingredient_capital: parseFloat(row.ingredient_capital.replace(/[^0-9.]/g, '')) || 0,
                    stock_id: row.stock_id,
                    shop_id: this.shopID,
                    branch_id: this.branchID,
                }));
                await this.productsStore.saveProductIngredientsStore(payload);
                this.validatingProductIngredients = false;
                this.showSuccess("Ingredients saved successfully!");
                this.$refs.productIngredientsForm.reset();
            } catch (error) {
                this.validatingProductIngredients = false;
                this.showError("Failed to save ingredients. Please try again!");
                console.error('Ingredients submission error:', error);
            }
        },
        async getOptions(endpoint, targetArray, errorMessage) {
            try {
                const response = await apiClient.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                });
                this[targetArray] = Array.isArray(response.data.data) ? response.data.data : [];
            } catch (error) {
                this[targetArray] = [];
                this.$refs.snackbarRef.showSnackbar(errorMessage, 'error');
            }
        },
        getStockOption() {
            this.getOptions(`/admin/stocks-name-only/${ this.branchID }`, 'stocksOption', 'Failed to fetch stocks');
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