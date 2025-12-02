<template>
    <v-row>
        <v-col cols="12" lg="4" md="4" sm="6">
            <v-text-field  density="comfortable"
                v-model="searchProduct" 
                placeholder="Search product here..." 
                variant="outlined" 
                label="Search product"></v-text-field>
        </v-col>
    </v-row>
    <v-data-table :headers="headers" :items="skeletonItems" hide-default-footer class="elevation-1">
        <template v-slot:top>
            <v-toolbar flat>
                <h2 class="ms-3 to-hide">List of all Products</h2>
                <h2 class="ms-3 to-show">List</h2>
                <v-spacer></v-spacer>
                <v-btn prepend-icon="mdi-plus" color="#0090b6" class="me-2" variant="flat">
                    <span class="to-hide">Add products</span>
                    <span class="to-show">products</span>
                </v-btn>
                <v-btn icon="mdi-refresh" color="#0090b6" variant="flat" size="small" class="me-3"></v-btn>
            </v-toolbar>
        </template>

        <template v-slot:[`item.product_name`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.temp_label`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.size_label`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.product_price`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.category_label`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.availability_label`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.updated_at`]>
            <v-skeleton-loader type="text" width="100" class="bg-grey-lighten-1"></v-skeleton-loader>
        </template>

        <template v-slot:[`item.actions`]>
            <div class="d-flex">
                <v-skeleton-loader type="text" width="50" class="bg-grey-lighten-1"></v-skeleton-loader>
                <v-skeleton-loader type="text" width="50" class="bg-grey-lighten-1 ms-1"></v-skeleton-loader>
            </div>
        </template>
    </v-data-table>
</template>

<script>
export default {
    name: 'ProductsTableSkeleton',
    data() {
        return {
            headers: [
                { title: 'Product', value: 'product_name', sortable: true, width: '20%' },
                { title: 'Temp', value: 'temp_label', sortable: true, width: '10%' },
                { title: 'Size', value: 'size_label', sortable: true, width: '10%' },
                { title: 'Price', value: 'product_price', sortable: true, width: '10%' },
                { title: 'Category', value: 'category_label', sortable: true, width: '10%' },
                { title: 'Availability', value: 'availability_label', sortable: true, width: '15%' },
                { title: 'Last update', value: 'updated_at', sortable: true, width: '20%' },
                { title: '', value: 'actions', sortable: false, width: '15%' }
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