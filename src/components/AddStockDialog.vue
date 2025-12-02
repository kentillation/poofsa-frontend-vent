<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" max-width="800px"
        persistent>
        <v-card>
            <v-card-title class="text-h6">Add Stock</v-card-title>
            <v-card-text class="border rounded">
                <v-list class="d-flex align-center justify-center">
                    <v-list-item prepend-avatar="/img/svg/copy.svg"
                        class="d-flex flex-column py-10 rounded border ma-2 custom-avatar-clone" @click="addClone"
                        large>
                        Clone from Branch
                    </v-list-item>
                    <v-list-item prepend-avatar="/img/svg/manual-add.svg"
                        class="d-flex flex-column py-10 rounded border ma-2 custom-avatar-manual" @click="addManual"
                        large>
                        Add Stocks Manually
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-btn color="red" variant="tonal" class="me-3 mb-2" @click="closeDialog">
                    <v-icon>mdi-close</v-icon>&nbsp; Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

export default {
    name: 'AddStockDialog',
    props: {
        modelValue: {
            type: Boolean,
        }
    },
    data() {
        return {
            currentDialog: false,
        };
    },
    methods: {
        closeDialog() {
            this.$emit('update:modelValue', false);
        },
        addClone() {
            this.$emit('add-clone');
            this.closeDialog();
        },
        addManual() {
            this.$router.push({
                path: '/add-stock/',
                query: {
                    branch_id: this.branchId,
                    branch_name: this.branchName,
                    shop_id: this.shopId,
                }
            });
            this.$emit('add-manual');
            this.closeDialog();
        },
    }
}
</script>

<style>
.custom-avatar-clone .v-list-item__prepend .v-avatar,
.custom-avatar-manual .v-list-item__prepend .v-avatar {
    width: 150px !important;
    height: 150px !important;
}

.v-avatar {
    border-radius: 0% !important;
}
</style>