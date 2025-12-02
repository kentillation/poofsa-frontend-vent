<template>
    <v-data-table :headers="headers" :items="skeletonItems" hide-default-footer class="elevation-1">
        <template v-slot:top>
            <v-toolbar flat color="transparent" class="mt-2">
                <v-btn prepend-icon="mdi-download" color="primary" variant="tonal">XLS</v-btn>&nbsp;
                <v-btn prepend-icon="mdi-printer" color="primary" variant="tonal">PRINT</v-btn>&nbsp;
                <v-btn prepend-icon="mdi-refresh" color="primary" variant="tonal" class="ps-7 me-3"></v-btn>
            </v-toolbar>
        </template>

        <template v-slot:[`item.stock_ingredient`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.unit_label`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.display_stock_in`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.display_unit_cost`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.updated_at`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>
    </v-data-table>
</template>

<script>
export default {
    name: 'StocksReportsTableSkeleton',
    data() {
        return {
            headers: [
                { title: '', value: 'stock_ingredient' },
                { title: '', value: 'unit_label' },
                { title: '', value: 'display_stock_in' },
                { title: '', value: 'display_unit_cost' },
                { title: '', value: 'updated_at' },
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