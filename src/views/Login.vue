<template>
    <div class="login-bg">
        <v-container class="fill-height d-flex align-center justify-center">
            <v-sheet class="pa-6 mx-auto ma-4" max-width="500" rounded="lg" width="100%">
                <div class="d-flex justify-center mb-4">
                    <img :src="logo" loading="lazy" alt="Poofsa Logo" />
                </div>
                <h1 class="text-center">
                    Poofsa 
                    <span class="text-info">.vent</span>
                    <v-chip color="#0090b6" size="x-small" class="position-absolute">BETA</v-chip>
                </h1>
                <p class="text-center my-3">Admin personnel only can log in.</p>
                <v-form ref="form" @submit.prevent="handleLogin" v-model="isFormValid" class="pa-4">
                    <div class="text-subtitle-1 text-medium-emphasis">Email</div>
                    <v-text-field v-model="admin_email" 
                        :rules="[requiredRule, emailFormatRule]" 
                        placeholder="Type here..."
                        prepend-inner-icon="mdi-email-outline" 
                        variant="outlined"
                        density="compact" 
                        autocomplete="username" />
                    <div class="text-subtitle-1 text-medium-emphasis">Password</div>
                    <v-text-field v-model="admin_password" 
                        :rules="[requiredRule]" 
                        placeholder="Type here..."
                        prepend-inner-icon="mdi-lock-outline" 
                        variant="outlined" 
                        density="compact" 
                        autocomplete="admin_password"
                        :type="showPassword ? 'text' : 'password'"
                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye-outline'"
                        @click:append-inner="showPassword = !showPassword" />

                    <v-btn :disabled="!isFormValid || loading" type="submit" color="#0090b6" size="large" class="mt-5" height="45" block rounded>
                        Proceed
                    </v-btn>
                </v-form>
                <div class="text-center mb-5">
                    <p color="#0090b6" style="cursor: pointer;" @click="$router.push('/forgot-password')">Forgot password?</p>
                </div>
            </v-sheet>
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
    name: 'LoginPage',
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
            admin_password: '',
            showPassword: false,
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
        async handleLogin() {
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
.login-bg {
    min-height: 100vh;
    min-width: 100vw;
    width: 100vw;
    height: 100vh;
    background: url('@/assets/Login-Bg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.login-bg::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);
    z-index: 1;
    pointer-events: none;
    border-radius: inherit;
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

img {
    min-width: 70px;
    width: 25%;
    border-radius: 10px;
}
</style>
