<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" class="pa-5" 
        max-width="500px">
        <v-card class="pa-2">
            <v-card-title class="text-h6">Edit Stock</v-card-title>
            <v-card-text>
                <v-form ref="form" :model-value="valid">

                    <!-- <v-text-field :model-value="stock.quantity_received"
                        @update:modelValue="handleDecimalUpdate('quantity_received', $event)" label="Quantity receive"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']" type="text" outlined dense /> -->
                    
                    <!-- <v-text-field :model-value="stock.quantity_remaining"
                        @update:modelValue="handleDecimalUpdate('quantity_remaining', $event)" label="Quantity remaining"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']" type="text" outlined dense /> -->

                    <v-text-field :model-value="stock.ingredient_name"
                        @update:modelValue="handleInputUpdate('ingredient_name', $event)" label="Ingredient"
                        :rules="[v => !!v || 'Required']" outlined dense />

                    <v-autocomplete :model-value="stock.base_unit_id"
                        @update:modelValue="handleInputUpdate('base_unit_id', $event)" label="Unit"
                        :items="ingredientsUnitOption" item-title="unit_label" item-value="ingredient_unit_id" outlined dense />
                    
                    <v-text-field :model-value="stock.alert_quantity"
                        @update:modelValue="handleDecimalUpdate('alert_quantity', $event)" label="Alert quantity"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']" type="text" outlined dense />

                    <v-autocomplete :model-value="stock.availability_id"
                        @update:modelValue="handleInputUpdate('availability_id', $event)" label="Availability"
                        :items="ingredientsAvailabilityOption" item-title="availability_label" item-value="availability_id"
                        outlined dense />
                    <span style="font-size: small">
                        Last changes: {{ formatDate(stock.updated_at) }}
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
                        Are you sure you want to save changes to <strong>{{ selectedStock }}</strong>?
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn color="red" class="me-2 mb-2" variant="tonal" :disabled="loading"
                            @click="$emit('update:confirm', false)">
                            <v-icon>mdi-cancel</v-icon>&nbsp; Cancel
                        </v-btn>
                        <v-btn color="green" class="me-2 mb-2" variant="tonal" :disabled="loading"
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
import { computed } from 'vue'; // added
import { useIngredientsOptionsStore } from '@/stores/ingredientsOptionsStore';
import LoaderUI from '@/components/LoaderUI.vue';

export default {
    name: 'StockEditDialog',

    components: {
        LoaderUI,
    },

    data() {
        return {
        }
    },

    setup() {
        const ingredientsOptionsStore = useIngredientsOptionsStore();
        return {
            ingredientsUnitOption: computed(() => ingredientsOptionsStore.unitOption),
            ingredientsAvailabilityOption: computed(() => ingredientsOptionsStore.availabilityOption),
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
        stock: {
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
        selectedStock: {
            type: String,
            default: ''
        },
    },
    emits: [
        'update:modelValue',
        'update:confirm',
        'update:stock',
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
            this.$emit('update:stock', {
                ...this.stock,
                [field]: cleanedValue
            });
        },

        handleInputUpdate(field, value) {
            const updatedValue = field === 'stock_unit' || field === 'availability_id'
                ? Number(value)
                : value;
            this.$emit('update:stock', {
                ...this.stock,
                [field]: updatedValue
            });
        },
    }
}
</script>
