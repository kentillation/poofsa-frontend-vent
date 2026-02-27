<!-- eslint-disable -->
<template>
    <v-dialog v-model="stocksHistoryDialog" max-width="1000px" persistent>
        <v-card class="pa-3">
            <v-card-text>
                <v-row>
                    <v-col cols="12" lg="4" md="4" sm="6">
                        <v-text-field v-model="search" label="Search stock details" placeholder="Search stock details"
                            variant="outlined" density="comfortable" clearable @update:model-value="onSearchChange" />
                    </v-col>
                </v-row>

                <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" dismissible @click:close="store.clearError">
                    {{ store.error }}
                </v-alert>

                <SkeletonTable v-if="store.loadingStocksHistory && !store.stocksHistory.length"  />

                <BaseDataTable v-else :key="tableKey" :headers="headers" :items="displayItems" :total-items="store.stocksHistoryTotal"
                    :loading="store.loadingStocksHistory" :options="options" @update:options="onOptionsUpdate" class="elevation-1 hover-table">
                    
                    <template #top>
                        <v-toolbar flat>
                            <h2 class="ms-4 to-hide">Modified Stocks History</h2>
                            <h2 class="ms-4 to-show">Modified Stocks</h2>
                            <v-spacer />
                            <v-btn icon="mdi-refresh" color="#0090b6" variant="flat" size="small" class="me-3"
                                @click="handleRefresh" :loading="store.loadingStocksHistory" />
                        </v-toolbar>
                        <v-divider />
                    </template>


                    <!-- eslint-disable  -->
                    <template #item.ingredient_name="{ item }">
                        <span>{{ item.ingredient_name }}</span>
                    </template>

                    <!--  eslint-disable -->
                    <template #item.modified_type="{ item }">
                        <v-chip :color="item.modified_type_id === 2 ? 'blue' : 'green'" size="small" variant="tonal">
                            {{ item.modified_type }}
                        </v-chip>
                    </template>

                    <template #no-data>
                        <v-alert type="warning" variant="tonal" class="ma-4">
                            No modified stocks found for this branch.
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
import { useStocksStore } from '@/stores/stocksStore'
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

const store = useStocksStore()

const displayItems = ref([])
const tableKey = ref(0)
const snackbarRef = ref(null)
const search = ref('')
const options = ref({
    page: 1,
    itemsPerPage: 10,
})

const stocksHistoryDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const isFetching = ref(false)

const lastFetchParams = ref('')

const headers = [
    { title: 'StockName', value: 'ingredient_name', sortable: true, align: 'start' },
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
        fetchStocksHistory()
    }, 300)
}

const closeDialog = () => {
    stocksHistoryDialog.value = false
}

const onOptionsUpdate = (val) => {
    const optionsChanged =
        val.page !== options.value.page ||
        val.itemsPerPage !== options.value.itemsPerPage

    if (optionsChanged) {
        options.value = val
        fetchStocksHistory()
    }
}

const handleRefresh = () => {
    options.value.page = 1
    lastFetchParams.value = ''
    fetchStocksHistory()
}

const updateDisplayItems = () => {
    if (!Array.isArray(store.stocksHistory)) {
        displayItems.value = []
    } else {
        displayItems.value = store.stocksHistory
            .filter(item => item && typeof item === 'object')
            .map(item => ({ ...item }))
    }
    tableKey.value++
}

const fetchStocksHistory = async () => {
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
        await store.fetchStocksHistoryStore({
            branchId: props.branchId,
            page: options.value.page,
            itemsPerPage: options.value.itemsPerPage,
            search: search.value,
        })

        updateDisplayItems()

    } catch (error) {
        console.error('Fetch error:', error)
        if (snackbarRef.value) {
            snackbarRef.value.showSnackbar(error.message || 'Failed to load modified stocks history', 'error')
        }
    } finally {
        isFetching.value = false
    }
}

watch(() => store.stocksHistory, () => {
    updateDisplayItems()
}, { deep: true })

watch(() => props.branchId, (newId) => {
    if (newId) fetchStocksHistory()
}, { immediate: true })

onMounted(() => {
    if (props.branchId) {
        fetchStocksHistory()
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