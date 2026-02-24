<template>
    <v-dialog v-model="dialog" max-width="1000px" persistent>
        <v-card>
            <v-card-text>
                <SkeletonTable v-if="loadingProducts" />
                <v-data-table :headers="headers" :items="productsHistory" :items-per-page="10"
                    :sort-by="[{ key: 'updated_at', order: 'desc' }]" class="elevation-1 hover-table">
                    <template v-slot:top>
                        <v-toolbar flat>
                            <h2 class="ms-3 to-hide">Products History</h2>
                            <h2 class="ms-3 to-show">History</h2>
                            <v-spacer></v-spacer>
                            <v-btn color="#0090b6" variant="flat" @click="fetchProductsHistory"
                                prepend-icon="mdi-refresh" class="ps-6 me-4">
                                <span class="to-hide">Refresh</span>
                            </v-btn>
                        </v-toolbar>
                    </template>
                    <template v-slot:no-data>
                        <v-alert type="warning" variant="tonal" class="ma-4">
                            <span>&nbsp; No products history found for this branch.</span>
                        </v-alert>
                    </template>

                    <!--eslint-disable-next-line -->
                    <template v-slot:item.manage_id="{ item }">
                        <v-chip :color="getManageIdColor(item.manage_id)" size="small">
                            {{ formatManageId(item.manage_id) }}
                        </v-chip>
                    </template>

                    <!--eslint-disable-next-line -->
                    <template v-slot:item.updated_at="{ item }">
                        {{ formatDateTime(item.updated_at) }}
                    </template>
                </v-data-table>
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

<script>
import { useProductsStore } from '@/stores/productsStore';
import Snackbar from '@/components/Snackbar.vue';
import SkeletonTable from '@/components/SkeletonTable.vue';

export default {
    name: 'ProductsHistoryDialog',
    components: {
        Snackbar, SkeletonTable
    },
    props: {
        modelValue: {
            type: Boolean,
            required: true
        },
        branchId: {
            type: Number,
            required: true
        },
    },
    setup() {
        const productsStore = useProductsStore();
        return {
            productsStore,
        };
    },
    emits: ['update:modelValue'],
    computed: {
        dialog: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    },
    data() {
        return {
            loadingProducts: false,
            productsHistory: [],
            headers: [
                { title: 'ProductName', value: 'product_name', sortable: true },
                { title: 'Description', value: 'description', sortable: true },
                { title: 'Type', value: 'manage_id', sortable: true },
                { title: 'PerformedBy', value: 'admin_name', sortable: true },
                { title: 'LastUpdate', value: 'updated_at', sortable: true },
            ]
        };
    },
    watch: {
        dialog(newVal) {
            if (newVal && this.branchId) {
                this.fetchProductsHistory();
            }
        }
    },
    methods: {

        async fetchProductsHistory() {
            this.loadingProducts = true;
            try {
                await this.productsStore.fetchProductsHistoryStore(this.branchId);
                if (this.productsStore.product_history.length === 0) {
                    this.productsHistory = [];
                } else {
                    // this.productsHistory = this.productsStore.product_history.map(product => this.formatProduct(product));
                    this.productsHistory = this.productsStore.product_history;
                }
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loadingProducts = false;
            }
        },

        formatManageId(manageId) {
            const actions = {
                1: 'Save',
                2: 'Update',
            };
            return actions[manageId] || `Action ${manageId}`;
        },

        getManageIdColor(manageId) {
            const colors = {
                1: 'green',
                2: 'blue',
            };
            return colors[manageId] || 'grey';
        },

        formatDateTime(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        closeDialog() {
            this.dialog = false;
        },

        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },
    }
}
</script>