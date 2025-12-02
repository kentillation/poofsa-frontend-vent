<template>
    <v-data-table :headers="headers" :items="skeletonItems" hide-default-footer class="elevation-1">
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
                    <v-autocomplete label="Date Filter" class="mx-3" clearable></v-autocomplete>
                </v-col>
            </v-row>
        </template>

        <template v-slot:[`item.reference_number`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.total_quantity`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.cash_render`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.customer_charge`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>
        
        <template v-slot:[`item.customer_change`]>
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
                { title: '', value: 'reference_number' },
                { title: '', value: 'total_quantity' },
                { title: '', value: 'cash_render' },
                { title: '', value: 'customer_charge' },
                { title: '', value: 'customer_change' },
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