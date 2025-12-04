<template>
    <div class="login-container">
        <v-container class="pa-3">
            <v-card class="pa-3 login-card">
                <v-row>
                    <v-col cols="12" lg="6" md="6" sm="12" class="pa-8">
                        <div @click="this.$router.push('/')" class="text-info mb-5" style="cursor: pointer;">
                            <v-icon>mdi-arrow-left</v-icon>
                            <span>&nbsp; Back</span>
                        </div>
                        <div class="d-flex justify-center my-4">
                            <img :src="logo" style="width: 20%; min-width: 100px; border-radius: 50%;" loading="lazy" alt="Poofsa Logo" />
                        </div>
                        <h1 class="text-center">
                            Poofsa
                            <span class="text-info">.vent</span>
                            <v-chip color="#0090b6" size="x-small" class="position-absolute">BETA</v-chip>
                        </h1>
                        <p class="text-center mt-5">To continue, please enter your email below.</p>
                        <v-form ref="form" @submit.prevent="submitEmail" v-model="isFormValid" class="pa-5">
                            <div class="text-subtitle-1 text-medium-emphasis">Email</div>
                            <v-text-field v-model="admin_email" :rules="[requiredRule, emailFormatRule]"
                                placeholder="Type here..." prepend-inner-icon="mdi-email-outline" variant="outlined"
                                density="compact" autocomplete="username" />
                            <v-btn :disabled="!isFormValid || loading" color="#0090b6" type="submit" size="large"
                                class="mt-5" height="45" block rounded>
                                Continue
                            </v-btn>
                        </v-form>
                    </v-col>
                    <v-col cols="12" lg="6" md="6" sm="12">
                        <div class="feature-bg"></div>
                    </v-col>
                </v-row>
            </v-card>
            <Snackbar ref="snackbarRef" />
        </v-container>
    </div>
</template>

<script>
import Snackbar from '@/components/Snackbar.vue';
import { useAuthStore } from '@/stores/auth';
import { useLoadingStore } from '@/stores/loading';
import { shallowRef } from 'vue';

export default {
    name: 'ForgotPassword',
    components: { Snackbar },
    setup() {
        const loadingStore = useLoadingStore();
        return {
            mpin: shallowRef(''),
            loadingStore,
        };
    },
    data() {
        return {
            logo: require('@/assets/Poofsa-logo.png'),
            admin_email: '',
            isFormValid: false,
            loading: false,
            snackbar: {
                visible: false,
                message: '',
                color: ''
            },
        };
    },
    methods: {
        requiredRule(v) {
            return !!v || 'This field is required';
        },
        emailFormatRule(v) {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(v) || 'Invalid email format';
        },
        async submitEmail() {
            const isValid = await this.$refs.form.validate();
            if (!isValid) return;

            this.loading = true;
            try {
                this.loadingStore.show('');
                const authStore = useAuthStore();
                const result = await authStore.login({
                    admin_email: this.admin_email,
                    admin_password: this.admin_password
                });
                if (result.success) {
                    window.location.href = '/about';
                }
            } catch (error) {
                console.error(error);
                this.showError(error);
            } finally {
                this.loading = false;
                this.loadingStore.hide();
            }
        },
        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },
    }
};
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    min-width: 100vw;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.v-container {
    display: grid;
    place-items: center;
    height: 100vh;
    position: relative;
    z-index: 2;
}

.v-sheet {
    position: relative;
    z-index: 3;
}

.login-card {
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-bg {
    background-image: url('@/assets/img/jpg/login-feature-bg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #0198c2;
    background-blend-mode: hard-light;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    border-radius: 20px;
}

.forgot-pass-container {
    position: relative;
    margin-top: -20px;
}

.forgot-password {
    position: relative;
    float: right;
    cursor: pointer;
    font-size: 14px;
}

@media (max-width: 380px) {
    .forgot-password {
        margin-top: 15px;
        margin-bottom: 15px;
    }
}
</style>
