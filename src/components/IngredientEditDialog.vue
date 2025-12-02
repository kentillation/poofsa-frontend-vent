<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" class="pa-5"
        max-width="500px">
        <v-card>
            <v-card-title class="text-h6">Edit Ingredient</v-card-title>
            <v-card-text>
                <v-form ref="form" :model-value="valid">
                    <v-text-field :model-value="ingredient.product_name"
                        @update:modelValue="handleInputUpdate('product_id', $event)" label="Product Name"
                        :rules="[v => !!v || 'Required']" class="text-grey-darken-1" outlined dense readonly />
                    <v-autocomplete :model-value="ingredient.stock_ingredient"
                        @update:modelValue="handleInputUpdate('stock_id', $event)" label="Stock Name"
                        item-title="stock_ingredient" item-value="stock_id"
                        :items="stocksOption" @click="getStocksOption" outlined dense>
                    </v-autocomplete>
                    
                    <v-text-field :model-value="ingredient.unit_usage"
                        @update:modelValue="handleUnitUpdate($event)" label="Unit usage"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']" type="text" outlined dense />

                    <v-text-field :model-value="ingredient.ingredient_capital"
                        @update:modelValue="handleCapitalUpdate($event)" label="Ingredient capital (₱)"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']" type="text" outlined dense />
                    
                    <span style="font-size: small">
                        Last changes: {{ formatDate(ingredient.updated_at) }}
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
                        Are you sure you want to save changes to <strong>{{ selectedIngredient }}</strong>?
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
            <Snackbar ref="snackbarRef" />
        </v-card>
    </v-dialog>
</template>

<script>
import apiClient from '../axios'
import LoaderUI from '@/components/LoaderUI.vue';
import Snackbar from '@/components/Snackbar.vue';


export default {
    name: 'IngredientEditDialog',
    components: {
        LoaderUI,
        Snackbar,
    },
    data() {
        return {
            stocksOption: [],
        }
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
        ingredient: {
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
        selectedIngredient: {
            type: String,
            default: ''
        },
    },
    emits: [
        'update:modelValue',
        'update:confirm',
        'update:ingredient',
        'save'
    ],
    methods: {
        formatDate(date) {
            if (!date) return 'Invalid date';
            return date
        },
        handleUnitUpdate(value) {
            const cleanedValue = value.replace(/[^0-9.]/g, '');
            this.$emit('update:ingredient', {
                ...this.ingredient,
                unit_usage: cleanedValue,
            });
        },
        handleCapitalUpdate(value) {
            const cleanedValue = value.replace(/[^0-9.]/g, '');
            this.$emit('update:ingredient', {
                ...this.ingredient,
                ingredient_capital: cleanedValue,
            });
        },
        handleInputUpdate(field, value) {
            const updatedValue = field === 'stock_id'
                ? Number(value)
                : value;

            this.$emit('update:ingredient', {
                ...this.ingredient,
                [field]: updatedValue
            });
        },
        async getOptions(endpoint, targetArray, errorMessage) {
            try {
                const response = await apiClient.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                });
                this[targetArray] = Array.isArray(response.data)
            ? response.data
            : (Array.isArray(response.data.data) ? response.data.data : []);
            } catch (error) {
                this.$refs.snackbarRef.showSnackbar(errorMessage, 'error');
            }
        },
        getStocksOption() {
            this.getOptions(`/admin/stocks-name/${this.ingredient.branch_id}/${this.ingredient.stock_id}`, 'stocksOption', 'Failed to fetch stock names');
        },
    }
}
</script>