<template>
    <div class="login-container">
        <!-- Animated background elements -->
        <div class="animated-bg">
            <div class="gradient-sphere sphere-1"></div>
            <div class="gradient-sphere sphere-2"></div>
            <div class="gradient-sphere sphere-3"></div>
        </div>

        <v-container>
            <v-card class="login-card" elevation="24">
                <v-row no-gutters>
                    <!-- Form Section -->
                    <v-col cols="12" lg="6" md="6" sm="12" class="form-section">
                        <div class="form-content">
                            <!-- Logo with enhanced animation -->
                            <div class="logo-wrapper">
                                <div class="logo-glow"></div>
                                <img :src="logo" class="logo-img" loading="lazy" alt="Poofsa Logo" />
                            </div>

                            <h1>
                                Welcome to <span class="brand-title">Locinder</span>
                            </h1>

                            <p class="subtitle">A food discovery app for local business in Sagay City</p>

                            <v-form ref="form" @submit.prevent="handleLogin" v-model="isFormValid" class="login-form">
                                <div class="input-wrapper">
                                    <div class="input-label">
                                        <v-icon icon="mdi-email-outline" size="18" class="label-icon" />
                                        <span>Email Address</span>
                                    </div>
                                    <v-text-field v-model="admin_email" :rules="[requiredRule, emailFormatRule]"
                                        placeholder="admin@poofsa.com" variant="outlined" density="comfortable"
                                        autocomplete="username" class="custom-input" :error="emailError"
                                        hide-details="auto" />
                                </div>

                                <div class="input-wrapper mt-4">
                                    <div class="input-label">
                                        <v-icon icon="mdi-lock-outline" size="18" class="label-icon" />
                                        <span>Password</span>
                                    </div>
                                    <v-text-field v-model="admin_password" :rules="[requiredRule]"
                                        placeholder="Enter your password" variant="outlined" density="comfortable"
                                        autocomplete="current-password" :type="showPassword ? 'text' : 'password'"
                                        class="custom-input" hide-details="auto">
                                        <template v-slot:append-inner>
                                            <v-icon :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                                @click="showPassword = !showPassword" class="cursor-pointer" />
                                        </template>
                                    </v-text-field>
                                </div>

                                <div class="forgot-pass-container">
                                    <p class="forgot-password" @click="$router.push('/forgot-password')">
                                        Forgot password?
                                    </p>
                                </div>

                                <v-btn :disabled="!isFormValid || loading" color="primary" type="submit" size="large"
                                    class="login-btn" height="52" block :loading="loading">
                                    <span v-if="!loading">Sign In</span>
                                    <span v-else>Authenticating...</span>
                                </v-btn>

                                <div class="register-link">
                                    <span>Don't have an account?</span>
                                    <span class="register-text" @click="$router.push('/register')">Create one</span>
                                </div>
                            </v-form>
                        </div>
                    </v-col>

                    <!-- Visual Section - Enhanced Discovery Theme -->
                    <v-col cols="12" lg="6" md="6" sm="12" class="visual-section">
                        <div class="visual-content">
                            <div class="feature-carousel">
                                <div class="feature-slide">
                                    <div class="feature-icon-wrapper">
                                        <v-icon size="48" color="white">mdi-map-marker-radius</v-icon>
                                    </div>
                                    <h3>Put your business where customers are already looking</h3>
                                    <p>Register your business on Locinder for free and start connecting with customers
                                        in your local
                                        community today.</p>
                                </div>
                                <div class="feature-badge">
                                    <span class="badge-dot"></span>
                                    <span>Discovery Mode Active</span>
                                </div>
                            </div>
                            <div class="benefits-container">
                                <div class="benefit-item">
                                    <span class="benefit-title">Free</span>
                                    <span class="benefit-label">Easy entry for your businesses. No barrier to
                                        start.</span>
                                </div>
                                <div class="stat-divider"></div>
                                <div class="benefit-item">
                                    <span class="benefit-title">Find</span>
                                    <span class="benefit-label">Let your customers discover your products.</span>
                                </div>
                                <div class="stat-divider"></div>
                                <div class="benefit-item">
                                    <span class="benefit-title">Feel</span>
                                    <span class="benefit-label">Experience connection, trust, and community
                                        support.</span>
                                </div>
                            </div>
                            <div class="cta-message">
                                <v-icon icon="mdi-rocket-launch-outline" size="20" />
                                <p>Ready to elevate your business?
                                    <span @click="$router.push('/register')" class="text-accent">Register today!</span>
                                </p>
                            </div>
                        </div>
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

export default {
    name: 'LoginPage',
    components: { Snackbar },
    setup() {
        //
    },
    data() {
        return {
            logo: require('@/assets/Poofsa-logo.png'),
            admin_email: '',
            admin_password: '',
            showPassword: false,
            isFormValid: false,
            loading: false,
            emailError: false,
        };
    },
    methods: {
        requiredRule(v) {
            return !!v || 'This field is required';
        },
        emailFormatRule(v) {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(v) || 'Please enter a valid email address';
        },
        async handleLogin() {
            const { valid } = await this.$refs.form.validate();
            if (!valid) return;

            this.loading = true;
            try {
                const authStore = useAuthStore();
                const result = await authStore.login({
                    admin_email: this.admin_email,
                    admin_password: this.admin_password
                });
                if (result.success) {
                    // Smooth transition to dashboard
                    document.body.style.opacity = '0';
                    setTimeout(() => {
                        window.location.href = '/branch/Main';
                    }, 300);
                }
            } catch (error) {
                console.error(error);
                this.showError(error?.message || 'Invalid credentials. Please try again.');
            } finally {
                this.loading = false;
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
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: linear-gradient(135deg, #faf8f5 0%, #fff6e3 100%);
    overflow: hidden;
}

/* Animated Background */
.animated-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
}

.gradient-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;
    animation: float 20s infinite ease-in-out;
}

.sphere-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(212, 162, 0, 0.3) 0%, rgba(180, 126, 0, 0.1) 100%);
    top: -200px;
    left: -200px;
    animation-delay: 0s;
}

.sphere-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(220, 147, 0, 0.25) 0%, rgba(180, 126, 0, 0.08) 100%);
    bottom: -100px;
    right: -100px;
    animation-delay: -5s;
}

.sphere-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 162, 0, 0.2) 0%, rgba(180, 108, 0, 0.05) 100%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: -10s;
}

/* Login Card */
.login-card {
    border-radius: 32px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    max-width: 1200px;
    margin: 0 auto;
}

.login-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.3);
}

/* Form Section */
.form-section {
    padding: 48px 40px;
    background: white;
}

.form-content {
    max-width: 400px;
    margin: 0 auto;
    padding: 25px;
}

.form-content h1 {
    font-size: 2rem;
    font-weight: 500;
    text-align: center;
    margin: 6px 0 0;
    position: relative;
    display: inline-block;
    width: 100%;
}

/* Logo Animation */
.logo-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 10px auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

.logo-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(212, 120, 0, 0.762) 0%, rgba(212, 106, 0, 0.548) 70%) !important;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.logo-img {
    width: 100%;
    height: auto;
    border-radius: 50%;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
}

.logo-wrapper:hover .logo-img {
    transform: scale(1.05);
}

.brand-title {
    background: linear-gradient(135deg, #5c3a21 0%, #d46600 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    font-weight: 800;
}

.text-accent {
    background: linear-gradient(135deg, #5c3a21 0%, #d46600 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.text-accent:hover {
    background: linear-gradient(135deg, #d46600 0%, #5c3a21 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.beta-chip {
    position: relative;
    top: -8px;
    margin-left: 8px;
    font-weight: 500;
    background: linear-gradient(135deg, #5c3a21, #d49100);
    color: white;
    letter-spacing: 0.5px;
}

.subtitle {
    text-align: center;
    color: #a2a2a2;
    font-size: 1rem;
    margin-bottom: 25px;
}

/* Form Elements */
.login-form {
    margin-top: 16px;
}

.input-wrapper {
    margin-bottom: 4px;
}

.input-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
    font-size: 0.85rem;
    font-weight: 500;
    color: #50452c;
}

.label-icon {
    color: #5c3a21;
}

.custom-input :deep(.v-field) {
    border-radius: 10px;
    transition: all 0.2s ease;
}

.custom-input :deep(.v-field:hover) {
    border-color: #5c3a21;
}

.custom-input :deep(.v-field--focused) {
    border-color: #5c3a21;
    box-shadow: 0 0 0 2px rgba(182, 112, 0, 0.2);
}

.forgot-pass-container {
    text-align: right;
    margin: 5px 0 20px;
}

.forgot-password {
    font-size: 0.85rem;
    color: #5c3a21;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.2s ease;
    display: inline-block;
}

.forgot-password:hover {
    color: #d49f00;
    text-decoration: underline;
}

.login-btn {
    background: linear-gradient(135deg, #5c3a21 0%, #d46600 100%);
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: none;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 144, 182, 0.3);
    border-radius: 30px;
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 144, 182, 0.4);
}

.login-btn:disabled {
    opacity: 0.7;
    transform: none;
}

.register-link {
    text-align: center;
    margin-top: 20px;
    font-size: 0.8rem;
    color: #6c7a8a;
}

.register-text {
    color: #5c3a21;
    font-weight: 500;
    cursor: pointer;
    margin-left: 5px;
    transition: color 0.2s ease;
}

.register-text:hover {
    color: #d49f00;
    text-decoration: underline;
}

/* Visual Section */
.visual-section {
    background: linear-gradient(135deg, #5c3a21 0%, #d46600 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 500px;
}

.visual-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.1"><path fill="white" d="M20,20 L30,20 L25,30 Z M70,30 L80,30 L75,40 Z M40,70 L50,70 L45,80 Z M80,80 L90,80 L85,90 Z M10,60 L20,60 L15,70 Z M90,10 L100,10 L95,20 Z"/><circle cx="50" cy="50" r="8"/><circle cx="30" cy="70" r="5"/><circle cx="70" cy="30" r="5"/></svg>') repeat;
    background-size: 30px;
    animation: movePattern 30s linear infinite;
}

.visual-content {
    position: relative;
    z-index: 2;
    padding: 40px;
    text-align: center;
    color: white;
}

.feature-carousel {
    margin-bottom: 48px;
}

.feature-slide {
    animation: fadeInUp 0.8s ease-out;
}

.feature-icon-wrapper {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    transition: transform 0.3s ease;
}

.feature-slide:hover .feature-icon-wrapper {
    transform: scale(1.1) rotate(5deg);
}

.feature-slide h3 {
    font-size: 1.8rem;
    font-weight: 500;
    margin-bottom: 16px;
    color: #f6f6f6;
}

.feature-slide p {
    font-size: 0.9rem;
    opacity: 0.9;
    max-width: 480px;
    margin: 0 auto;
    line-height: 1.5;
    color: #ffffff;
}

.feature-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 8px 16px;
    border-radius: 40px;
    margin-top: 24px;
    font-size: 0.85rem;
    font-weight: 500;
}

.badge-dot {
    width: 8px;
    height: 8px;
    background: #4cff9e;
    border-radius: 50%;
    animation: blink 1.5s infinite;
}

.benefits-container {
    display: flex;
    justify-content: center;
    align-items: start;
    gap: 24px;
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.benefit-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.benefit-title {
    font-size: 1.8rem;
    font-weight: 800;
    line-height: 1.2;
}

.benefit-label {
    font-size: 0.75rem;
    opacity: 0.8;
    letter-spacing: 0.5px;
}

.stat-divider {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.3);
}

.cta-message {
    margin-top: 32px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #f6f6f6;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 500;
    backdrop-filter: blur(2px);
}

.cta-message p,
.cta-message .v-icon {
    color: #7d7d7d;
}

.cta-message span {
    color: #5c3a21;
    font-weight: 700;
    cursor: pointer;
}

@keyframes float {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    33% {
        transform: translate(30px, -40px) scale(1.1);
    }

    66% {
        transform: translate(-20px, 30px) scale(0.95);
    }
}

@keyframes movePattern {
    0% {
        background-position: 0 0;
    }

    100% {
        background-position: 100px 100px;
    }
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(0.8);
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.5;
    }

    50% {
        transform: scale(1.2);
        opacity: 0.8;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 960px) {
    .form-section {
        padding: 32px 24px;
    }

    .visual-section {
        min-height: 400px;
    }

    .feature-slide h3 {
        font-size: 1.4rem;
    }

    .cta-message p {
        font-size: 1rem;
    }

    .benefit-title {
        font-size: 1.4rem;
    }
}

@media (max-width: 600px) {
    .form-content h1 {
        font-size: 1.8rem;
    }

    .benefits-container {
        gap: 16px;
    }

    .benefit-title {
        font-size: 1.2rem;
    }

    .feature-icon-wrapper {
        width: 60px;
        height: 60px;
    }

    .cta-message p {
        font-size: 0.8rem;
    }
}

/* Cursor pointer utility */
.cursor-pointer {
    cursor: pointer;
}
</style>