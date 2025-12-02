<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <h3>Edit Products in <span class="text-warning">{{ branchName }}</span> Branch </h3>
        <v-form ref="productForm" @submit.prevent="showConfirmDialog">
            <v-row v-for="(row, index) in productRows" :key="index"
                class="d-flex align-center border rounded my-3 pt-3 mx-auto">
                <v-col cols="12" lg="1" md="6" sm="6">
                    <v-btn color="red" variant="tonal" class="pe-1 mb-4" prepend-icon="mdi-trash-can-outline"
                        @click="removeRow(index)"></v-btn>
                </v-col>
                <v-col cols="12" lg="2" md="6" sm="6">
                    <v-text-field v-model="row.productName" label="Product name" :rules="[v => !!v || 'Required']"
                        variant="outlined" />
                </v-col>
                <v-col cols="12" lg="2" md="6" sm="6">
                    <v-text-field v-model="row.productPrice" label="Product price (₱)" type="text"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Required' || 'Must be a valid number']"
                        @input="e => row.productPrice = e.target.value.replace(/[^0-9.]/g, '')" variant="outlined" />
                </v-col>
                <v-col cols="12" lg="2" md="6" sm="6">
                    <v-autocomplete v-model="row.productTemp" @click="getProductTemperatureOption"
                        label="Product temparature" :items="productTemperatureOption" :rules="[v => !!v || 'Required']"
                        item-title="temp_label" item-value="temp_id" variant="outlined" />
                </v-col>
                <v-col cols="12" lg="2" md="6" sm="6">
                    <v-autocomplete v-model="row.productSize" @click="getProductSizeOption" label="Product size"
                        :items="productSizeOption" :rules="[v => !!v || 'Required']" item-title="size_label"
                        item-value="size_id" variant="outlined" />
                </v-col>
                <v-col cols="12" lg="2" md="6" sm="6">
                    <v-autocomplete v-model="row.productCategory" @click="getProductCategoryOption"
                        label="Product category" :items="productCategoryOption" :rules="[v => !!v || 'Required']"
                        item-title="category_label" item-value="category_id" variant="outlined" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-btn color="primary" variant="tonal" class="mb-3" prepend-icon="mdi-plus"
                        :disabled="validatingProduct" @click="addRow">
                        Add More
                    </v-btn>
                    <v-btn color="green" variant="tonal" class="ms-3 mb-3" prepend-icon="mdi-check"
                        :disabled="!isFormValid || validatingProduct" @click="showConfirmDialog">
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
                    <p class="text-center">Do you want to save new products for {{ branchName }} Branch?</p>
                </v-card-text>
                <v-card-actions class="mx-4 my-4">
                    <v-spacer></v-spacer>
                    <v-btn color="red" variant="tonal" class="px-3" prepend-icon="mdi-close"
                        @click="closeConfirmDialog">Check
                        again</v-btn>
                    <v-btn color="green" variant="tonal" class="px-3" prepend-icon="mdi-content-save"
                        @click="submitForm">
                        <v-progress-circular v-if="validatingProduct" size="20" color="white" label="Loading..."
                            indeterminate />
                        <span v-else>Save</span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <Snackbar ref="snackbarRef" />
        <LoaderUI :visible="validatingProduct" message="Saving..." />
    </v-container>
</template>

<script>
import apiClient from '../axios';
import Snackbar from '@/components/Snackbar.vue';
import LoaderUI from '@/components/LoaderUI.vue';
import { useProductsStore } from '@/stores/productsStore';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'EditProducts',
    components: {
        Snackbar,
        LoaderUI
    },
    data() {
        return {
            branchId: null,
            branchName: null,
            validatingProduct: false,
            confirmDialog: false,
            productRows: [
                {
                    productName: '',
                    productPrice: '',
                    productTemp: null,
                    productSize: null,
                    productCategory: null,
                },
            ],
            productTemperatureOption: [],
            productSizeOption: [],
            productCategoryOption: [],
        };
    },
    setup() {
        const productsStore = useProductsStore();
        return { productsStore };
    },
    created() {
        this.branchId = this.$route.query.branch_id;
        this.branchName = this.$route.query.branch_name;
    },
    computed: {
        isFormValid() {
            return this.productRows.every(row => {
                return (
                    row.productName &&
                    !isNaN(parseFloat(row.productPrice)) &&
                    row.productTemp &&
                    row.productSize &&
                    row.productCategory
                );
            });
        },
    },
    methods: {
        removeRow(index) {
            if (this.productRows.length > 1) {
                this.productRows.splice(index, 1);
            }
        },
        showConfirmDialog() {
            if (this.isFormValid) this.confirmDialog = true;
        },
        closeConfirmDialog() {
            this.confirmDialog = false;
        },
        addRow() {
            this.productRows.push({
                productName: '',
                productPrice: '',
                productTemp: null,
                productSize: null,
                productCategory: null,
            });
        },
        async submitForm() {
            this.confirmDialog = false;
            try {
                if (!this.$refs.productForm.validate()) return;
                this.validatingProduct = true;
                const payload = this.productRows.map(row => ({
                    product_name: row.productName,
                    product_price: parseFloat(row.productPrice.replace(/[^0-9.]/g, '')) || 0,
                    product_temp_id: row.productTemp,
                    product_size_id: row.productSize,
                    product_category_id: row.productCategory,
                    branch_id: this.branchId
                }));
                const response = await this.productsStore.updateProductStore(payload);
                this.validatingProduct = false;
                this.$refs.snackbarRef.showSnackbar(response.message, 'success');
                this.$refs.productForm.reset();
            } catch (error) {
                this.validatingProduct = false;
                const errorMessage = error.response?.data?.message || 'Failed to save product';
                this.$refs.snackbarRef.showSnackbar(errorMessage, 'error');
                console.error('Product submission error:', error);
            }
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
            this.getOptions('/product-temperature-option', 'productTemperatureOption', 'Failed to fetch product temperatures');
        },
        getProductSizeOption() {
            this.getOptions('/product-size-option', 'productSizeOption', 'Failed to fetch product sizes');
        },
        getProductCategoryOption() {
            this.getOptions('/product-category-option', 'productCategoryOption', 'Failed to fetch product category');
        },
    },

};
</script>