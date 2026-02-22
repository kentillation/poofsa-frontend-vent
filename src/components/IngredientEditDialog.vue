<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" class="pa-5"
        max-width="500px">
        <v-card class="pa-2">
            <v-card-title class="text-h6">Edit Ingredient</v-card-title>
            <v-card-text>
                <v-form ref="form" :model-value="valid">
                    <v-text-field :model-value="ingredient.product_name"
                        @update:modelValue="handleInputUpdate('product_id', $event)" label="Product Name"
                        :rules="[v => !!v || 'Required']" class="text-grey-darken-1" outlined dense readonly />
                        
                    <v-autocomplete :model-value="ingredient.ingredient_name"
                        @update:modelValue="handleInputUpdate('ingredient_id', $event)" label="Item Name"
                        item-title="ingredient_name" item-value="ingredient_id"
                        :items="ingredientNames" outlined dense>
                    </v-autocomplete>
                    
                    <v-text-field :model-value="ingredient.quantity_required"
                        @update:modelValue="handleDecimalUpdate('quantity_required', $event)" label="Quantity Required"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']" type="text" outlined dense />

                    <v-text-field :model-value="ingredient.ingredient_capital"
                        @update:modelValue="handleDecimalUpdate('ingredient_capital', $event)" label="Ingredient capital (₱)"
                        :rules="[v => !isNaN(parseFloat(v)) || 'Must be a valid number']" type="text" outlined dense />
                    
                    <span style="font-size: small">
                        Last changes: {{ formatDate(ingredient.updated_at) }}
                    </span>
                </v-form>
            </v-card-text>
            <v-card-actions>
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
                        Are you sure you want to save changes to <strong>{{ ingredient.product_name }}</strong> items?
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
import { useIngredientsOptionsStore } from '@/stores/ingredientsOptionsStore';
import LoaderUI from '@/components/LoaderUI.vue';


export default {
    name: 'IngredientEditDialog',

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
            ingredientNames: computed(() => ingredientsOptionsStore.ingredientOptions),

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
        handleDecimalUpdate(field, value) {
            const cleanedValue = value.replace(/[^0-9.]/g, '');
            this.$emit('update:ingredient', {
                ...this.ingredient,
                [field]: cleanedValue
            });
        },
        handleInputUpdate(field, value) {
            this.$emit('update:ingredient', {
                ...this.ingredient,
                [field]: value
            });
        },
    }
}
</script>