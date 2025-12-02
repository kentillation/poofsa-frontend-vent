<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" class="pa-5"
        max-width="500px">
        <v-card>
            <v-card-title class="text-h6">Edit Product</v-card-title>
            <v-card-text>
                <v-form ref="form" :model-value="valid">
                    <v-text-field :model-value="product.product_name"
                        @update:modelValue="handleInputUpdate('product_name', $event)" label="Product Name"
                        :rules="[v => !!v || 'Required']" outlined dense />

                    <v-text-field :model-value="product.product_price" @update:modelValue="handleCostUpdate($event)"
                        label="Product Price (₱)" :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']"
                        type="text" outlined dense />

                    <v-autocomplete :model-value="product.product_temp_id"
                        @update:modelValue="handleInputUpdate('product_temp_id', $event)" label="Product Temparature"
                        :items="productTemperatureOption" item-title="temp_label" item-value="temp_id" outlined dense />

                    <v-autocomplete :model-value="product.product_size_id"
                        @update:modelValue="handleInputUpdate('product_size_id', $event)" label="Product Size"
                        :items="productSizeOption" item-title="size_label" item-value="size_id" outlined dense />

                    <v-autocomplete :model-value="product.product_category_id"
                        @update:modelValue="handleInputUpdate('product_category_id', $event)" label="Product Category"
                        :items="productCategoryOption" item-title="category_label" item-value="category_id" outlined
                        dense />

                    <v-autocomplete :model-value="product.availability_id"
                        @update:modelValue="handleInputUpdate('availability_id', $event)" label="Availability"
                        :items="productAvailabilityOption" item-title="availability_label" item-value="availability_id"
                        outlined dense />

                    <span style="font-size: small">
                        Last changes: {{ formatDate(product.updated_at) }}
                    </span>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn color="green" class="ms-3 mb-2" variant="tonal" @click="$emit('update:confirm', true)"
                    :disabled="!valid">
                    <v-icon>mdi-content-save</v-icon>&nbsp; Save
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="red" class="me-3 mb-2" variant="tonal" @click="$emit('update:modelValue', false)">
                    <v-icon>mdi-close</v-icon>&nbsp; Close
                </v-btn>
            </v-card-actions>

            <v-dialog :model-value="confirm" @update:modelValue="$emit('update:confirm', $event)" max-width="600px"
                persistent>
                <v-card>
                    <v-card-title class="text-h6">Confirm Update</v-card-title>
                    <v-card-text>
                        Are you sure you want to save changes to <strong>{{ selectedProduct }}</strong>?
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn color="red" variant="tonal" class="me-2 mb-2" :disabled="loading"
                            @click="$emit('update:confirm', false)">
                            <v-icon>mdi-cancel</v-icon>&nbsp; Cancel
                        </v-btn>
                        <v-btn color="green" variant="tonal" class="me-2 mb-2" :disabled="loading"
                            @click="$emit('save')">
                            <v-icon>mdi-check</v-icon>&nbsp; Confirm
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <LoaderUI :visible="loading" message="Saving..." />
        </v-card>
    </v-dialog>
</template>

<script>
// import apiClient from '../axios'
import { computed } from 'vue'; // added
import { useProductOptionsStore } from '@/stores/productOptionsStore';
import LoaderUI from '@/components/LoaderUI.vue';

export default {
    name: 'ProductEditDialog',
    components: {
        LoaderUI,
    },
    data() {
        return {
        }
    },
     // added
    setup() {
        const productOptionsStore = useProductOptionsStore();
        return {
        productTemperatureOption: computed(() => productOptionsStore.temperatureOptions),
        productSizeOption: computed(() => productOptionsStore.sizeOptions),
        productCategoryOption: computed(() => productOptionsStore.categoryOptions),
        productAvailabilityOption: computed(() => productOptionsStore.availabilityOptions),
        };
    },
    props: {
        modelValue: {
            type: Boolean,
            required: true
        },
        confirm: {
            type: Boolean,
            required: true
        },
        product: {
            type: Object,
            default: null
        },
        valid: {
            type: Boolean,
            required: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        selectedProduct: {
            type: String,
            default: ''
        },
    },
    emits: [
        'update:modelValue',
        'update:confirm',
        'update:product',
        'save'
    ],
    methods: {
        formatDate(date) {
            if (!date) return 'Invalid date';
            return date
        },
        handleCostUpdate(value) {
            const cleanedValue = value.replace(/[^0-9.]/g, '');
            this.$emit('update:product', {
                ...this.product,
                product_price: cleanedValue
            });
        },
        handleInputUpdate(field, value) {
            const updatedValue = field === 'product_temp_id' || field === 'product_size_id' || field === 'product_category_id'
                ? Number(value)
                : value;

            this.$emit('update:product', {
                ...this.product,
                [field]: updatedValue
            });
        },
    }
}
</script>