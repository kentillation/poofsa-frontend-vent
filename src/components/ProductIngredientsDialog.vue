<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" max-width="1000px">
        <v-card>
            <v-card-title class="text-h6">{{ productName }}{{ productTemp }}{{ productSize }}</v-card-title>
            <v-card-text>
                <v-data-table :headers="headers" :items="productIngredients" :loading="loading"
                    density="comfortable" class="elevation-1 hover-table">
                    <template v-slot:no-data>
                        <v-alert type="warning" variant="tonal" class="ma-4">
                            <span>&nbsp; No ingredients found for this product.</span>
                        </v-alert>
                    </template>
                    
                    <!--eslint-disable-next-line -->
                    <template v-slot:item.availability_label="{ item }">
                        <v-chip :color="item.availability_label === 'Available' ? 'green' : 'red'" size="small" variant="flat">
                            {{ item.availability_label }}
                        </v-chip>
                    </template>

                    <!--eslint-disable-next-line -->
                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex" style="gap: 8px;">
                            <v-tooltip text="Edit Ingredient" location="top">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" @click="$emit('edit-ingredient', item)" color="green" variant="tonal"
                                        size="small" icon="mdi-pencil"></v-btn>
                                </template>
                            </v-tooltip>
                        </div>
                    </template>

                </v-data-table>
            </v-card-text>
            <v-card-actions class="mb-2">
                <v-btn color="primary" class="ms-4" variant="tonal" @click="toAddProductIngredients">
                    <v-icon>mdi-plus</v-icon>
                    <span class="to-hide">&nbsp; Add Ingredients</span>
                    <span class="to-show">&nbsp;Ingredients</span>
                </v-btn>
                <!-- <v-btn color="gray" variant="tonal">
                    <v-icon>mdi-history</v-icon>
                    <span class="to-hide">&nbsp; Ingredients history</span>
                    <span class="to-show">&nbsp;Ingredients</span>
                </v-btn> -->
                <v-spacer></v-spacer>
                <v-btn color="red" class="me-4" variant="tonal" @click="$emit('update:modelValue', false)">
                    <v-icon>mdi-close</v-icon>&nbsp; Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="editIngredientDialog">
        <v-card>
            <v-card-title class="text-h6">{{ productName }}{{ productTemp }}{{ productSize }}</v-card-title>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'ProductIngredientsDialog',
    props: {
        modelValue: {
            type: Boolean,
            // required: true
        },
        shopId: {
            type: Number,
        },
        branchId: {
            type: Number,
        },
        branchName: {
            type: String,
            default: ''
        },
        productId: {
            type: Number,
        },
        productName: {
            type: String,
            default: ''
        },
        productTemp: {
            type: String,
            default: ''
        },
        productSize: {
            type: String,
            default: ''
        },
        productIngredients: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: [
        'update:modelValue',
        'edit-ingredient',
    ],
    data() {
        return {
            editIngredientDialog: false,
            headers: [
                { title: 'Ingredient', value: 'stock_ingredient', sortable: true },
                { title: 'Usage', value: 'unit', sortable: true },
                { title: 'Capital', value: 'ingredient_capital', sortable: true },
                { title: 'Availability', value: 'availability_label', sortable: true },
                { title: 'Updated', value: 'updated_at', sortable: true },
                { title: 'Action', value: 'actions', sortable: false },
            ]
        }
    },
    methods: {
        toAddProductIngredients() {
            this.$router.push({
                path: '/add-product-ingredients/',
                query: {
                    shop_id: this.shopId,
                    branch_id: this.branchId,
                    product_id: this.productIngredients.length > 0 ? this.productIngredients[0].product_id : this.productId,
                    branch_name: this.branchName,
                    product_name: this.productName,
                    product_temp: this.productTemp,
                    product_size: this.productSize,
                }
            });
        },
        // getAvailabilityIdColor(availabilityId) {
        //     const colors = {
        //         1: 'green',
        //         2: 'blue',
        //     };
        //     return colors[availabilityId] || 'grey';
        // },
        // formatAvailabilityId(availabilityId) {
        //     const actions = {
        //         1: 'Save',
        //         2: 'Update',
        //     };
        //     return actions[availabilityId] || `Action ${availabilityId}`;
        // },
    }
}
</script>