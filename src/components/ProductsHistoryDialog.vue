<!-- eslint-disable -->
<template>
    <v-dialog v-model="productsHistoryDialog" max-width="1000px" persistent>
        <v-card class="pa-3">
            <v-card-text>
                <v-row>
                    <v-col cols="12" lg="4" md="4" sm="6">
                        <v-text-field v-model="search" label="Search product details" placeholder="Search product details"
                            variant="outlined" density="comfortable" clearable @update:model-value="onSearchChange" />
                    </v-col>
                </v-row>

                <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" dismissible @click:close="store.clearError">
                    {{ store.error }}
                </v-alert>

                <SkeletonTable v-if="store.loading && !store.productsHistory.length"  />

                <BaseDataTable v-else :key="tableKey" :headers="headers" :items="displayItems" :total-items="store.total"
                    :loading="store.loading" :options="options" @update:options="onOptionsUpdate" class="elevation-1 hover-table">
                    
                    <template #top>
                        <v-toolbar flat>
                            <h2 class="ms-4 to-hide">Modified Products History</h2>
                            <h2 class="ms-4 to-show">Modified Products</h2>
                            <v-spacer />
                            <v-btn icon="mdi-refresh" color="#0090b6" variant="flat" size="small" class="me-3"
                                @click="handleRefresh" :loading="store.loading" />
                        </v-toolbar>
                        <v-divider />
                    </template>


                    <!-- eslint-disable  -->
                    <template #item.display_product_name="{ item }">
                        <span>{{ item.display_product_name }}</span>
                    </template>

                    <!--  eslint-disable -->
                    <template #item.modified_type="{ item }">
                        <v-chip :color="item.modified_type_id === 2 ? 'blue' : 'green'" size="small" variant="tonal">
                            {{ item.modified_type }}
                        </v-chip>
                    </template>

                    <template #no-data>
                        <v-alert type="warning" variant="tonal" class="ma-4">
                            No modified products found for this branch.
                        </v-alert>
                    </template>
                </BaseDataTable>
            </v-card-text>
            <v-card-actions>
                <v-btn color="red" variant="flat" class="me-3 mb-2" @click="closeDialog">
                    <v-icon>mdi-close</v-icon>&nbsp; Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <Snackbar ref="snackbarRef" />
</template>

<script setup>
/* eslint-disable */
import { ref, watch, onMounted, computed } from 'vue'
import { useProductsStore } from '@/stores/productsStore'
import SkeletonTable from '@/components/SkeletonTable.vue'
import BaseDataTable from '@/components/BaseDataTable.vue'
import Snackbar from '@/components/Snackbar.vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    branchId: {
        type: Number,
        required: true
    },
})

const emit = defineEmits(['update:modelValue'])

const store = useProductsStore()

const displayItems = ref([])
const tableKey = ref(0)
const snackbarRef = ref(null)
const search = ref('')
const options = ref({
    page: 1,
    itemsPerPage: 10,
})

const productsHistoryDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const isFetching = ref(false)

const lastFetchParams = ref('')

const headers = [
    { title: 'ProductName', value: 'display_product_name', sortable: true, align: 'start' },
    { title: 'Description', value: 'description', sortable: true },
    { title: 'ModifiedType', value: 'modified_type', sortable: true },
    { title: 'PerformedBy', value: 'admin_name', sortable: true },
    { title: 'LastUpdate', value: 'updatedAtFormatted', sortable: true },
]

let searchTimer = null

const onSearchChange = (value) => {
    search.value = value
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        options.value.page = 1
        fetchProductsHistory()
    }, 300)
}

const closeDialog = () => {
    productsHistoryDialog.value = false
}

const onOptionsUpdate = (val) => {
    const optionsChanged =
        val.page !== options.value.page ||
        val.itemsPerPage !== options.value.itemsPerPage

    if (optionsChanged) {
        options.value = val
        fetchProductsHistory()
    }
}

const handleRefresh = () => {
    options.value.page = 1
    lastFetchParams.value = ''
    fetchProductsHistory()
}

const updateDisplayItems = () => {
    if (!Array.isArray(store.productsHistory)) {
        displayItems.value = []
    } else {
        displayItems.value = store.productsHistory
            .filter(item => item && typeof item === 'object')
            .map(item => ({ ...item }))
    }
    tableKey.value++
}

const fetchProductsHistory = async () => {
    if (!props.branchId || isFetching.value) return

    const params = JSON.stringify({
        branchId: props.branchId,
        page: options.value.page,
        itemsPerPage: options.value.itemsPerPage,
        search: search.value
    })

    if (params === lastFetchParams.value) return

    isFetching.value = true
    lastFetchParams.value = params

    try {
        await store.fetchProductsHistoryStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            search: search.value,
        })

        updateDisplayItems()

    } catch (error) {
        console.error('Fetch error:', error)
        if (snackbarRef.value) {
            snackbarRef.value.showSnackbar(error.message || 'Failed to load modified products history', 'error')
        }
    } finally {
        isFetching.value = false
    }
}

watch(() => store.productsHistory, () => {
    updateDisplayItems()
}, { deep: true })

watch(() => props.branchId, (newId) => {
    if (newId) fetchProductsHistory()
}, { immediate: true })

onMounted(() => {
    if (props.branchId) {
        fetchProductsHistory()
    }
})
</script>

<style scoped>
.hover-table:deep(.v-data-table__tr:hover) {
    background-color: rgba(0, 0, 0, 0.04);
}

.to-hide {
    display: inline;
}

.to-show {
    display: none;
}

@media (max-width: 768px) {
    .to-hide {
        display: none;
    }

    .to-show {
        display: inline;
    }
}
</style>