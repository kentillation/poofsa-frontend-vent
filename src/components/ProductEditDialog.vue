<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" class="pa-5"
        max-width="500px">
        <v-card class="pa-2">
            <v-card-title class="text-h6">Edit Product</v-card-title>
            <v-card-text>
                <v-form ref="form" :model-value="valid">
                    <v-text-field :model-value="product.product_name"
                        @update:modelValue="handleInputUpdate('product_name', $event)" label="Product Name"
                        :rules="[v => !!v || 'Required']" outlined dense />

                    <v-text-field :model-value="product.base_price"
                        @update:modelValue="handleDecimalUpdate('base_price', $event)" label="Base Price (₱)"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']" type="text" outlined dense />

                    <v-text-field :model-value="product.cost_estimate ?? 0"
                        @update:modelValue="handleDecimalUpdate('cost_estimate', $event)" label="Estimated Cost (₱)"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']" type="text" outlined dense />
                    
                    <v-autocomplete :model-value="Number(product.size_id)"
                        @update:modelValue="handleInputUpdate('size_id', $event)" label="Product Size"
                        :items="productSizeOption" item-title="size_label" item-value="product_size_id" outlined
                        dense />
                    
                    <v-autocomplete :model-value="product.temp_id"
                        @update:modelValue="handleInputUpdate('temp_id', $event)" label="Product Temparature"
                        :items="productTemperatureOption" item-title="temp_label" item-value="product_temp_id" outlined
                        dense />

                    <v-autocomplete :model-value="product.category_id"
                        @update:modelValue="handleInputUpdate('category_id', $event)" label="Product Category"
                        :items="productCategoryOption" item-title="category_label" item-value="product_category_id"
                        outlined dense />

                    <v-autocomplete :model-value="product.station_id"
                        @update:modelValue="handleInputUpdate('station_id', $event)" label="Station"
                        :items="shopStationOption" item-title="station_name" item-value="shop_station_id" outlined
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
            <v-card-actions class="mx-3">
                <v-btn color="green" class="ms-3 mb-2" variant="flat" @click="$emit('update:confirm', true)"
                    :disabled="!valid">
                    <v-icon>mdi-content-save</v-icon>&nbsp; Save
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="red" class="me-3 mb-2" variant="flat" @click="$emit('update:modelValue', false)">
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
                        <v-btn color="red" variant="flat" class="me-2 mb-2" :disabled="loading"
                            @click="$emit('update:confirm', false)">
                            <v-icon>mdi-cancel</v-icon>&nbsp; Cancel
                        </v-btn>
                        <v-btn color="green" variant="flat" class="me-2 mb-2" :disabled="loading"
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
import { computed } from 'vue';
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

    setup() {
        const productOptionsStore = useProductOptionsStore();
        return {
            productTemperatureOption: computed(() => productOptionsStore.temperatureOptions),
            productSizeOption: computed(() => productOptionsStore.sizeOptions),
            productCategoryOption: computed(() => productOptionsStore.categoryOptions),
            shopStationOption: computed(() => productOptionsStore.stationOptions),
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

        formatDate(dateString) {
            if (!dateString) return 'Invalid date';
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
        handleDecimalUpdate(field, value) {
            const cleanedValue = value.replace(/[^0-9.]/g, '');
            this.$emit('update:product', {
                ...this.product,
                [field]: cleanedValue
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
