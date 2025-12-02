<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <v-icon @click="back" class="mb-4">mdi-arrow-left</v-icon>
        <h3>Add Product in <span class="text-warning">{{ branchName }}</span> Branch</h3>
        <v-form ref="productForm" @submit.prevent="showConfirmDialog">
            <v-container v-for="(row, index) in productRows" :key="index" class="parent border rounded my-3 pb-1 mx-auto">
                <v-btn color="red" variant="tonal" class="d-flex align-center me-1 mb-5 pt-7 pb-7 ps-7" prepend-icon="mdi-trash-can-outline"
                    @click="removeRow(index)">
                    <span class="to-hide">Remove</span>
                    <span class="to-show mt-5"></span>
                </v-btn>
                <v-text-field class="child" v-model="row.productName" label="Product name"
                    :rules="[v => !!v || 'Required']" variant="outlined" />
                <v-text-field class="child" v-model="row.productPrice" label="Price (₱)" type="text"
                    :rules="[v => !isNaN(parseFloat(v)) || 'Required' || 'Must be a valid number']"
                    @input="e => row.productPrice = e.target.value.replace(/[^0-9.]/g, '')" variant="outlined" />
                <v-autocomplete class="child" v-model="row.productTemp" @click="getProductTemperatureOption"
                    label="Temparature" :items="productTemperatureOption" :rules="[v => !!v || 'Required']"
                    item-title="temp_label" item-value="temp_id" variant="outlined" />
                <v-autocomplete class="child" v-model="row.productSize" @click="getProductSizeOption" label="Size"
                    :items="productSizeOption" :rules="[v => !!v || 'Required']" item-title="size_label"
                    item-value="size_id" variant="outlined" />
                <v-autocomplete class="child" v-model="row.productCategory" @click="getProductCategoryOption"
                    label="Category" :items="productCategoryOption" :rules="[v => !!v || 'Required']"
                    item-title="category_label" item-value="category_id" variant="outlined" />
                <v-autocomplete class="child" v-model="row.productStation" @click="getProductStationOption"
                    label="Station" :items="productStationOption" :rules="[v => !!v || 'Required']"
                    item-title="station_name" item-value="station_id" variant="outlined" />
            </v-container>
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
                    <p class="text-center">Do you want to save new products in {{ branchName }} Branch?</p>
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
import { computed } from 'vue';
import Snackbar from '@/components/Snackbar.vue';
import LoaderUI from '@/components/LoaderUI.vue';
import { useProductsStore } from '@/stores/productsStore';
import { useProductOptionsStore } from '@/stores/productOptionsStore';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'AddProduct',
    components: {
        Snackbar,
        LoaderUI
    },
    data() {
        return {
            shopID: null,
            branchID: null,
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
                    productStation: null,
                },
            ],
        };
    },
    setup() {
        const productsStore = useProductsStore();
        const productOptionsStore = useProductOptionsStore();
        return { 
            productsStore,
            productTemperatureOption: computed(() => productOptionsStore.temperatureOptions),
            productSizeOption: computed(() => productOptionsStore.sizeOptions),
            productCategoryOption: computed(() => productOptionsStore.categoryOptions),
            productStationOption: computed(() => productOptionsStore.stationOptions),
        };
    },
    created() {
        this.shopID = this.$route.query.shop_id;
        this.branchID = this.$route.query.branch_id;
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
                    row.productCategory &&
                    row.productStation
                );
            });
        },
    },
    methods: {
        back() {
            this.$router.go(-1);
        },
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
                productStation: null,
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
                    station_id: row.productStation,
                    branch_id: this.branchID
                }));
                await this.productsStore.saveProductsStore(payload);
                this.validatingProduct = false;
                this.showSuccess("Product saved successfully!");
                this.$refs.productForm.reset();
            } catch (error) {
                this.validatingProduct = false;
                console.error(error);
                this.showError(error);
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

/* .child:nth-last-child(1) {
    max-width: 500px;
} */
</style>