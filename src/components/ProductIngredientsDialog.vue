<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" max-width="1000px">
        <v-card>
            <v-card-title class="text-h6">{{ productName }}{{ productTemp }}{{ productSize }}</v-card-title>
            <v-card-text>
                <v-data-table :headers="headers" :items="productItems" :loading="loading" density="comfortable"
                    class="elevation-1 hover-table">
                    <template v-slot:no-data>
                        <v-alert type="warning" variant="tonal" class="ma-4">
                            <span>&nbsp; No items found for this product.</span>
                        </v-alert>
                    </template>

                    <!--eslint-disable-next-line -->
                    <template v-slot:item.availability_label="{ item }">
                        <v-chip :color="item.availability_label === 'Available' ? 'green' : 'red'" size="small"
                            variant="tonal">
                            {{ item.availability_label }}
                        </v-chip>
                    </template>

                    <!--eslint-disable-next-line -->
                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex" style="gap: 8px;">
                            <v-tooltip text="Edit Item" location="top">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" @click="$emit('edit-ingredient', item)" color="green"
                                        size="small" prepend-icon="mdi-pencil">Edit</v-btn>
                                </template>
                            </v-tooltip>
                        </div>
                    </template>

                </v-data-table>
            </v-card-text>
            <v-card-actions class="mb-2">
                <v-btn @click="toAddProductItems" prepend-icon="mdi-plus" variant="flat" color="primary" class="ms-4">
                    <span class="to-hide">Add Items</span>
                    <span class="to-show">Items</span>
                </v-btn>
                <!-- <v-btn color="gray">
                    <v-icon>mdi-history</v-icon>
                    <span class="to-hide">&nbsp; Items history</span>
                    <span class="to-show">&nbsp;Items</span>
                </v-btn> -->
                <v-spacer></v-spacer>
                <v-btn @click="$emit('update:modelValue', false)" prepend-icon="mdi-close" variant="flat" color="red"
                    class="me-4">
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="editItemDialog">
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
        productItems: {
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
            editItemDialog: false,
            headers: [
                { title: 'ItemName', value: 'stock_ingredient', sortable: true },
                { title: 'Usage', value: 'unit', sortable: true },
                { title: 'Capital', value: 'display_capital', sortable: true },
                { title: 'Availability', value: 'availability_label', sortable: true },
                { title: 'LastUpdate', value: 'updated_at', sortable: true },
                { title: 'Action', value: 'actions', sortable: false },
            ]
        }
    },
    methods: {
        toAddProductItems() {
            this.$router.push({
                path: '/add-product-items/',
                query: {
                    shop_id: this.shopId,
                    branch_id: this.branchId,
                    product_id: this.productItems.length > 0 ? this.productItems[0].product_id : this.productId,
                    branch_name: this.branchName,
                    product_name: this.productName,
                    product_temp: this.productTemp,
                    product_size: this.productSize,
                }
            });
        },
    }
}
</script>