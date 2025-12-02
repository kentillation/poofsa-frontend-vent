<template>
    <v-container>
        <h3>Add New Branch</h3>
        <v-row>
            <v-col cols="12" lg="6" md="6" sm="8">
                <v-card class="pa-5 mt-3">
                    <v-card-text>
                        <v-form ref="newBranchForm" @submit.prevent="showConfirmDialog">
                            <div class="parent mb-2">
                                <div class="child">
                                    <label for="branch_name"><span class="text-red">*</span> Branch name</label>
                                    <v-text-field v-model="branch_name" placeholder="e.g. Manila"
                                        :rules="[requiredRule]" variant="outlined" />
                                </div>
                                <div class="child">
                                    <label for="branch_location"><span class="text-red">*</span> Branch location</label>
                                    <v-text-field v-model="branch_location" placeholder="e.g. Manila City, Philippines"
                                        :rules="[requiredRule]" variant="outlined" />
                                </div>
                                <div class="child">
                                    <label for="m_name"><span class="text-red">*</span> Name of Supervisor</label>
                                    <v-text-field v-model="m_name" placeholder="e.g. Juan Dela Cruz"
                                        :rules="[requiredRule]" variant="outlined" />
                                </div>
                                <div class="child">
                                    <label for="contact"><span class="text-red">*</span> Contact # of Supervisor</label>
                                    <v-text-field v-model="contact" placeholder="e.g. 09123456789"
                                        :rules="[requiredRule]" variant="outlined" type="number"
                                        @input="e => contact = e.target.value.replace(/[^0-9.]/g, '')"  />
                                </div>
                                <div class="child">
                                    <label for="m_email"><span class="text-red">*</span> Email of Supervisor</label>
                                    <v-text-field v-model="m_email" placeholder="e.g. name@example.com"
                                        :rules="[requiredRule, emailFormatRule]" variant="outlined" type="email" />
                                </div>
                                <div class="child">
                                    <label for="staff_name">Name of Staff/Crew</label>
                                    <v-text-field v-model="staff_name" placeholder="e.g. Juan Dela Cruz" variant="outlined" />
                                </div>
                            </div>
                            <span class="text-grey"><em>Note: Asterisk (<span class="text-red">*</span>) indicates a required field</em></span>
                            <div class="mt-4 d-flex justify-end">
                                <v-btn prepend-icon="mdi-check" color="#0090b6" variant="tonal"
                                    :disabled="!isFormValid || validatingBranch" @click="showConfirmDialog">
                                    Confirm
                                </v-btn>
                            </div>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="confirmDialog" max-width="500px" persistent>
            <v-card>
                <v-card-title>
                    <span class="headline">Confirmation</span>
                </v-card-title>
                <v-card-text>
                    <p class="text-center">Do you want to save new branch?</p>
                </v-card-text>
                <v-card-actions class="mx-4 my-4">
                    <v-spacer></v-spacer>
                    <v-btn class="px-3" color="red" variant="tonal" prepend-icon="mdi-close-circle"
                        :disabled="validatingBranch" @click="closeConfirmDialog">Check
                        again</v-btn>
                    <v-btn class="px-3" color="success" variant="tonal" prepend-icon="mdi-content-save"
                        :disabled="validatingBranch" @click="submitNewBranch">
                        <v-progress-circular v-if="validatingBranch" size="20" color="white" label="Loading..."
                            indeterminate />
                        <span v-else>Save</span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <Snackbar ref="snackbarRef" />
    </v-container>
</template>

<script>
import { useBranchStore } from '../stores/branchStore';
import { useLoadingStore } from '@/stores/loading';
import Snackbar from '@/components/Snackbar.vue';
import { ref } from 'vue';

export default {
    name: 'NewBranchView',
    components: {
        Snackbar
    },
    setup() {
        const branchStore = useBranchStore();
        const loadingStore = useLoadingStore();
        const newBranchForm = ref(null);
        const snackbarRef = ref(null);
        const tabCreate = ref('option-1')

        return {
            branchStore,
            loadingStore,
            newBranchForm,
            snackbarRef,
            tabCreate,
        };
    },
    data() {
        return {
            branch_name: '',
            branch_location: '',
            m_name: '',
            m_email: '',
            contact: '',
            staff_name: '',
            confirmDialog: false,
        }
    },
    computed: {
        isFormValid() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return this.branch_name !== '' &&
                this.branch_location !== '' &&
                this.m_name !== '' &&
                this.m_email !== '' &&
                this.contact !== '' &&
                emailPattern.test(this.m_email);
        },
        validatingBranch() {
            return this.branchStore.validatingBranch;
        }
    },
    methods: {
        requiredRule(v) {
            return !!v || 'Required';
        },
        emailFormatRule(v) {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(v) || 'Invalid email format';
        },
        showConfirmDialog() {
            if (this.isFormValid) this.confirmDialog = true;
        },
        closeConfirmDialog() {
            this.confirmDialog = false;
        },
        async submitNewBranch() {
            try {
                if (!(await this.newBranchForm.validate())) return;
                this.loadingStore.show("Creating new branch...")
                const payload = {
                    branch_name: this.branch_name,
                    branch_location: this.branch_location,
                    m_name: this.m_name,
                    m_email: this.m_email,
                    contact: this.contact,
                    staff_name: this.staff_name,
                };
                const response = await this.branchStore.createBranch(payload);
                if (response && response.message) {
                    this.confirmDialog = false;
                    this.loadingStore.hide();
                    this.snackbarRef.showSnackbar(response.message, 'success');
                    this.resetForm();
                } else {
                    throw new Error('Branch creation failed');
                }
            } catch (error) {
                console.error('Error creating branch:', error);
                this.snackbarRef.showSnackbar('New branch creation failed!', 'error');
                this.confirmDialog = false;
            }
        },
        resetForm() {
            this.branch_name = ' ';
            this.branch_location = ' ';
            this.m_name = ' ';
            this.m_email = ' ';
            this.contact = ' ';
            this.staff_name = ' ';
            if (this.newBranchForm.resetValidation) {
                this.newBranchForm.resetValidation();
            }
        },
    }
};
</script>

<style scoped>
.parent {
    display: flex;
    flex-wrap: wrap;
}

.child {
    width: 500px;
    min-width: 250px;
    /* margin: 0 0 3px 3px; */
}

/* .child:nth-last-child(1) {
    max-width: 500px;
} */

/* .custom-avatar-clone .v-list-item__prepend .v-avatar,
.custom-avatar-manual .v-list-item__prepend .v-avatar {
    width: 150px !important;
    height: 150px !important;
} */
</style>