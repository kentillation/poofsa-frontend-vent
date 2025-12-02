<template>
    <v-data-table 
        :headers="headers" 
        :items="skeletonItems" 
        density="comfortable">
        <template v-slot:top>
            <v-toolbar flat>
                <h2 class="ms-4 to-hide">List of Reversal Orders</h2>
                <h2 class="ms-4 to-show">List</h2>
                <v-spacer></v-spacer>
                <div class="w-75 w-sm-50 d-flex align-center justify-space-between">
                    <v-autocomplete label="Date Filter" model-value="Today" class="mt-5 me-3"></v-autocomplete>
                    <v-btn icon="mdi-refresh" color="#0090b6" variant="flat" size="small" class="me-3"></v-btn>
                </div>
            </v-toolbar>
        </template>

        <template v-slot:[`item.reference_number`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.table_number`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.product_name`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.quantity`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.status`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.updated_at`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>
    </v-data-table>
</template>

<script>
export default {
    name: 'TransactionsReportsTableSkeleton',
    data() {
        return {
            headers: [
                { title: 'Reference', value: 'reference_number', sortable: 'true', width: '10%' },
                { title: 'Table#', value: 'table_number', sortable: 'true', width: '10%' },
                { title: 'Product', value: 'product_name', sortable: 'true', width: '20%' },
                { title: 'Quantity', value: 'quantity', sortable: 'true', width: '10%' },
                { title: 'Status', value: 'status', sortable: 'true', width: '10%' },
                { title: 'Date created', value: 'updated_at', sortable: 'true', width: '20%' },
                { title: '', value: 'actions', sortable: false, width: '10%' }
            ],
            skeletonItems: Array(10).fill({}) // Creates 10 empty rows
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