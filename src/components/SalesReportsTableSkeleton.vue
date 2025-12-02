<template>
    <v-data-table :headers="headers" :items="skeletonItems">
        <template v-slot:top>
            <v-row class="mt-5">
                <v-col cols="12" lg="6" md="6" sm="6" class="pa-0">
                    <div class="d-flex ms-3 mb-5">
                        <v-btn prepend-icon="mdi-download" color="primary"
                            variant="tonal">XLS</v-btn>&nbsp;
                        <v-btn prepend-icon="mdi-printer" color="primary"
                            variant="tonal">PRINT</v-btn>&nbsp;
                        <v-btn class="ps-7" prepend-icon="mdi-refresh" color="primary" variant="tonal"></v-btn>
                    </div>
                </v-col>
                <v-col cols="12" lg="6" md="6" sm="6" class="pa-0">
                    <div class="d-flex">
                        <v-autocomplete label="Date Filter" class="ms-3 me-2" clearable></v-autocomplete>
                        <span class="w-25">Net sales: <br /><h3>₱0</h3></span>
                    </div>
                </v-col>
            </v-row>
        </template>

        <template v-slot:[`item.display_product_name`]>
            <v-skeleton-loader type="text" width="300" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.display_product_price`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.display_total_quantity`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.category_label`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>
        
        <template v-slot:[`item.display_sales`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.updated_at`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>
    </v-data-table>
</template>

<script>
export default {
    name: 'SalesReportsTableSkeleton',
    data() {
        return {
            headers: [
                { title: 'Product', value: 'display_product_name', sortable: 'true', width: '25%' },
                { title: 'Price', value: 'display_product_price', sortable: 'true', width: '10%' },
                { title: 'Quantity', value: 'display_total_quantity', sortable: 'true', width: '10%' },
                { title: 'Category', value: 'category_label', sortable: 'true', width: '15%' },
                { title: 'Subtotal', value: 'display_sales', sortable: 'true', width: '15%' },
                { title: 'Date', value: 'updated_at', sortable: 'true', width: '25%' },
            ],
            skeletonItems: Array(10).fill({})
        }
    }
}
</script>

<style scoped>
.v-skeleton-loader {
    margin: 4px 0;
}

::v-deep(.v-skeleton-loader__bone) {
    background-color: rgba(0, 0, 0, 0.05) !important;
}

::v-deep(.v-skeleton-loader__animation-wave) {
    background: linear-gradient(90deg,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.5),
            rgba(255, 255, 255, 0)) !important;
    animation-duration: 1.5s !important;
}
</style>