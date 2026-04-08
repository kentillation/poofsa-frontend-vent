<template>
    <div class="register-container">
        <!-- Animated background elements -->
        <div class="animated-bg">
            <div class="gradient-sphere sphere-1"></div>
            <div class="gradient-sphere sphere-2"></div>
            <div class="gradient-sphere sphere-3"></div>
        </div>

        <v-container>
            <v-card class="register-card" elevation="24">
                <v-row no-gutters>
                    <!-- Form Section -->
                    <v-col cols="12" lg="6" md="6" sm="12" class="form-section">
                        <div class="form-content">
                            <!-- Logo with enhanced animation -->
                            <div class="logo-wrapper">
                                <div class="logo-glow"></div>
                                <img :src="logo" class="logo-img" loading="lazy" alt="Locinder Logo" />
                            </div>

                            <h1>
                                Join the movement of <span class="brand-title">Locinder</span>
                            </h1>

                            <p class="subtitle">A food discovery app for local business in Sagay City</p>

                            <!-- Step Indicator -->
                            <div class="step-indicator">
                                <div v-for="step in steps" :key="step.number" class="step-item" :class="{
                                    active: currentStep === step.number,
                                    completed: currentStep > step.number
                                }" @click="goToStep(step.number)">
                                    <div class="step-circle">
                                        <v-icon v-if="currentStep > step.number" size="16"
                                            color="white">mdi-check</v-icon>
                                        <span v-else>{{ step.number }}</span>
                                    </div>
                                    <span class="step-label">{{ step.label }}</span>
                                </div>
                            </div>

                            <v-form ref="form" @submit.prevent="handleRegister" v-model="isFormValid"
                                class="register-form">
                                <!-- Step 1: Business Info -->
                                <div v-show="currentStep === 1" class="step-content" key="step1">
                                    <div class="input-wrapper">
                                        <div class="input-label">
                                            <v-icon icon="mdi-account-outline" size="18" class="label-icon" />
                                            <span>Owner's Full Name</span>
                                        </div>
                                        <v-text-field v-model="formData.owner_name" :rules="[requiredRule]"
                                            placeholder="Juan Dela Cruz" variant="outlined" density="comfortable"
                                            class="custom-input" hide-details="auto" />
                                    </div>

                                    <div class="input-wrapper mt-4">
                                        <div class="input-label">
                                            <v-icon icon="mdi-storefront-outline" size="18" class="label-icon" />
                                            <span>Store / Business Name</span>
                                        </div>
                                        <v-text-field v-model="formData.store_name" :rules="[requiredRule]"
                                            placeholder="Cafe Delight" variant="outlined" density="comfortable"
                                            class="custom-input" hide-details="auto" />
                                    </div>

                                    <div class="input-wrapper mt-4">
                                        <div class="input-label">
                                            <v-icon icon="mdi-domain" size="18" class="label-icon" />
                                            <span>Store Type</span>
                                        </div>
                                        <v-select v-model="formData.store_type" :items="storeTypes"
                                            :rules="[requiredRule]" placeholder="Select store type" variant="outlined"
                                            density="comfortable" class="custom-input" hide-details="auto" />
                                    </div>
                                </div>

                                <!-- Step 2: Location & Hours -->
                                <div v-show="currentStep === 2" class="step-content" key="step2">
                                    <div class="input-wrapper">
                                        <div class="input-label">
                                            <v-icon icon="mdi-map-marker-outline" size="18" class="label-icon" />
                                            <span>Store Address</span>
                                        </div>
                                        <v-textarea v-model="formData.address" :rules="[requiredRule]"
                                            placeholder="Street, Barangay, Sagay City, Negros Occidental"
                                            variant="outlined" density="comfortable" rows="2" class="custom-input"
                                            hide-details="auto" />
                                    </div>

                                    <div class="row mt-4">
                                        <div class="col-6">
                                            <div class="input-label">
                                                <v-icon icon="mdi-clock-start-outline" size="18" class="label-icon" />
                                                <span>Open Hour</span>
                                            </div>
                                            <v-text-field v-model="formData.open_hour"
                                                :rules="[requiredRule, timeFormatRule]" placeholder="09:00 AM"
                                                variant="outlined" density="comfortable" class="custom-input"
                                                hide-details="auto" />
                                        </div>
                                        <div class="col-6">
                                            <div class="input-label">
                                                <v-icon icon="mdi-clock-end-outline" size="18" class="label-icon" />
                                                <span>Close Hour</span>
                                            </div>
                                            <v-text-field v-model="formData.close_hour"
                                                :rules="[requiredRule, timeFormatRule]" placeholder="09:00 PM"
                                                variant="outlined" density="comfortable" class="custom-input"
                                                hide-details="auto" />
                                        </div>
                                    </div>
                                </div>

                                <!-- Step 3: Contact & Auth -->
                                <div v-show="currentStep === 3" class="step-content" key="step3">
                                    <div class="input-wrapper">
                                        <div class="input-label">
                                            <v-icon icon="mdi-phone-outline" size="18" class="label-icon" />
                                            <span>Mobile Number</span>
                                        </div>
                                        <v-text-field v-model="formData.mobile_number"
                                            :rules="[requiredRule, mobileNumberRule]" placeholder="0912 345 6789"
                                            variant="outlined" density="comfortable" class="custom-input"
                                            hide-details="auto" />
                                    </div>

                                    <div class="input-wrapper mt-4">
                                        <div class="input-label">
                                            <v-icon icon="mdi-email-outline" size="18" class="label-icon" />
                                            <span>Email Address</span>
                                        </div>
                                        <v-text-field v-model="formData.email" :rules="[requiredRule, emailFormatRule]"
                                            placeholder="business@locinder.com" variant="outlined" density="comfortable"
                                            class="custom-input" hide-details="auto" />
                                    </div>

                                    <div class="input-wrapper mt-4">
                                        <div class="input-label">
                                            <v-icon icon="mdi-lock-outline" size="18" class="label-icon" />
                                            <span>Password</span>
                                        </div>
                                        <v-text-field v-model="formData.password" :rules="[requiredRule, passwordRule]"
                                            placeholder="Create a strong password" variant="outlined"
                                            density="comfortable" :type="showPassword ? 'text' : 'password'"
                                            class="custom-input" hide-details="auto">
                                            <template v-slot:append-inner>
                                                <v-icon :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                                    @click="showPassword = !showPassword" class="cursor-pointer" />
                                            </template>
                                        </v-text-field>
                                    </div>

                                    <div class="input-wrapper mt-4">
                                        <div class="input-label">
                                            <v-icon icon="mdi-lock-check-outline" size="18" class="label-icon" />
                                            <span>Confirm Password</span>
                                        </div>
                                        <v-text-field v-model="formData.confirm_password"
                                            :rules="[requiredRule, confirmPasswordRule]"
                                            placeholder="Confirm your password" variant="outlined" density="comfortable"
                                            :type="showConfirmPassword ? 'text' : 'password'" class="custom-input"
                                            hide-details="auto">
                                            <template v-slot:append-inner>
                                                <v-icon :icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                                    @click="showConfirmPassword = !showConfirmPassword"
                                                    class="cursor-pointer" />
                                            </template>
                                        </v-text-field>
                                    </div>
                                </div>

                                <!-- Navigation Buttons -->
                                <div class="navigation-buttons">
                                    <v-btn v-if="currentStep > 1" variant="outlined" size="large"
                                        class="nav-btn prev-btn" @click="prevStep" :disabled="loading">
                                        <v-icon left>mdi-arrow-left</v-icon>
                                        Previous
                                    </v-btn>

                                    <v-btn v-if="currentStep < totalSteps" color="primary" size="large"
                                        class="nav-btn next-btn" @click="nextStep" :disabled="!isStepValid || loading">
                                        Next
                                        <v-icon right>mdi-arrow-right</v-icon>
                                    </v-btn>

                                    <v-btn v-if="currentStep === totalSteps" color="primary" type="submit" size="large"
                                        class="nav-btn register-btn" :loading="loading"
                                        :disabled="!isFormValid || loading">
                                        <span v-if="!loading">Create Account</span>
                                        <span v-else>Creating...</span>
                                    </v-btn>
                                </div>

                                <div class="login-link">
                                    <span>Already have an account?</span>
                                    <span class="login-text" @click="$router.push('/')">Sign In</span>
                                </div>
                            </v-form>
                        </div>
                    </v-col>

                    <!-- Visual Section - Enhanced Discovery Theme -->
                    <v-col cols="12" lg="6" md="6" sm="12" class="visual-section">
                        <div class="visual-content">
                            <div class="feature-carousel">
                                <div class="feature-slide" :key="currentStep">
                                    <div class="feature-icon-wrapper">
                                        <v-icon size="48" color="white">{{ stepIcons[currentStep - 1] }}</v-icon>
                                    </div>
                                    <h3>{{ stepHeadings[currentStep - 1] }}</h3>
                                    <p>{{ stepDescriptions[currentStep - 1] }}</p>
                                </div>
                                <div class="feature-badge">
                                    <span class="badge-dot"></span>
                                    <span>Join the Local Food Movement</span>
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

export default {
    name: 'RegisterPage',
    components: { Snackbar },
    data() {
        return {
            logo: require('@/assets/Poofsa-logo.png'),
            currentStep: 1,
            totalSteps: 3,
            showPassword: false,
            showConfirmPassword: false,
            loading: false,
            isFormValid: false,

            formData: {
                owner_name: '',
                store_name: '',
                store_type: '',
                address: '',
                open_hour: '',
                close_hour: '',
                mobile_number: '',
                email: '',
                password: '',
                confirm_password: ''
            },

            steps: [
                { number: 1, label: 'Business Info' },
                { number: 2, label: 'Location & Hours' },
                { number: 3, label: 'Contact & Auth' }
            ],

            storeTypes: [
                'Restaurant', 'Coffee Shop', 'Cafe', 'Bakery', 'Fast Food',
                'Food Court', 'Street Food', 'Dessert Shop', 'Other'
            ],

            stepIcons: ['mdi-storefront-outline', 'mdi-map-marker-radius', 'mdi-account-check-outline'],
            stepHeadings: [
                'Tell us about your business',
                'Where and when can customers find you?',
                'Almost there! Create your account'
            ],
            stepDescriptions: [
                'Start by sharing your business identity. This helps customers recognize and trust your brand.',
                'Help hungry customers discover your location and know when you\'re open for business.',
                'Complete your registration by providing contact details and secure credentials.'
            ]
        };
    },
    computed: {
        isStepValid() {
            if (this.currentStep === 1) {
                return !!(this.formData.owner_name && this.formData.store_name && this.formData.store_type);
            }
            if (this.currentStep === 2) {
                return !!(this.formData.address && this.formData.open_hour && this.formData.close_hour);
            }
            if (this.currentStep === 3) {
                return !!(this.formData.mobile_number && this.formData.email &&
                    this.formData.password && this.formData.confirm_password &&
                    this.formData.password === this.formData.confirm_password);
            }
            return false;
        }
    },
    methods: {
        requiredRule(v) {
            return !!v || 'This field is required';
        },
        emailFormatRule(v) {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(v) || 'Please enter a valid email address';
        },
        mobileNumberRule(v) {
            const pattern = /^(\+63|0)[0-9]{10}$/;
            return pattern.test(v.replace(/\s/g, '')) || 'Enter a valid Philippine mobile number (e.g., 09123456789 or +639123456789)';
        },
        timeFormatRule(v) {
            const pattern = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
            return pattern.test(v) || 'Use format: 09:00 AM or 09:00 PM';
        },
        passwordRule(v) {
            return v.length >= 8 || 'Password must be at least 8 characters';
        },
        confirmPasswordRule() {
            return this.formData.password === this.formData.confirm_password || 'Passwords do not match';
        },
        nextStep() {
            if (this.isStepValid) {
                this.currentStep++;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                this.showError('Please fill in all required fields before proceeding.');
            }
        },
        prevStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        goToStep(step) {
            if (step < this.currentStep) {
                this.currentStep = step;
            } else if (step > this.currentStep && this.isStepValid) {
                this.currentStep = step;
            } else if (step > this.currentStep) {
                this.showError('Please complete current step first.');
            }
        },
        async handleRegister() {
            const isValid = await this.$refs.form.validate();
            if (!isValid.valid) return;

            this.loading = true;
            try {
                // Simulate API call - replace with actual registration logic
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Success
                this.showError('Registration successful! Please check your email to verify your account.', 'success');
                setTimeout(() => {
                    this.$router.push('/login');
                }, 2000);
            } catch (error) {
                console.error(error);
                this.showError(error?.message || 'Registration failed. Please try again.');
            } finally {
                this.loading = false;
            }
        },
        showError(message, type = 'error') {
            this.$refs.snackbarRef.showSnackbar(message, type);
        }
    }
};
</script>

<style scoped>
.register-container {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: linear-gradient(135deg, #faf8f5 0%, #fff6e3 100%);
    overflow-x: hidden;
    padding: 40px 0;
}

/* Animated Background */
.animated-bg {
    position: fixed;
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

/* Register Card */
.register-card {
    border-radius: 32px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    max-width: 1200px;
    margin: 0 auto;
}

/* Form Section */
.form-section {
    padding: 40px 32px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-content {
    max-width: 480px;
    margin: 25px;
}

.form-content h1 {
    font-size: 1.8rem;
    font-weight: 500;
    text-align: center;
    margin: 6px 0 8px;
    width: 100%;
    color: #000;
}

/* Logo Animation */
.logo-wrapper {
    position: relative;
    width: 70px;
    height: 70px;
    margin: 0 auto 16px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.logo-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(212, 120, 0, 0.762) 0%, rgba(212, 106, 0, 0.548) 70%);
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
    font-weight: 800;
}

.subtitle {
    text-align: center;
    color: #a2a2a2;
    font-size: 0.85rem;
    margin-bottom: 24px;
}

/* Step Indicator */
.step-indicator {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
    position: relative;
}

.step-indicator::before {
    content: '';
    position: absolute;
    top: 16px;
    left: 0;
    right: 0;
    height: 2px;
    background: #e0e0e0;
    z-index: 0;
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
    cursor: pointer;
    flex: 1;
}

.step-circle {
    width: 34px;
    height: 34px;
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #999;
    transition: all 0.3s ease;
    margin-bottom: 8px;
}

.step-item.active .step-circle {
    background: linear-gradient(135deg, #5c3a21 0%, #d46600 100%);
    border-color: transparent;
    color: white;
}

.step-item.completed .step-circle {
    background: #4caf50;
    border-color: #4caf50;
    color: white;
}

.step-label {
    font-size: 0.7rem;
    font-weight: 500;
    color: #999;
    transition: color 0.3s ease;
}

.step-item.active .step-label {
    color: #d46600;
    font-weight: 600;
}

.step-item.completed .step-label {
    color: #4caf50;
}

/* Step Content */
.step-content {
    animation: fadeIn 0.4s ease-out;
}

/* Form Elements */
.register-form {
    margin-top: 8px;
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
    border-radius: 12px;
    transition: all 0.2s ease;
}

.custom-input :deep(.v-field:hover) {
    border-color: #5c3a21;
}

.custom-input :deep(.v-field--focused) {
    border-color: #5c3a21;
    box-shadow: 0 0 0 2px rgba(182, 112, 0, 0.15);
}

/* Navigation Buttons */
.navigation-buttons {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 32px;
}

.nav-btn {
    flex: 1;
    text-transform: none;
    font-weight: 500;
    letter-spacing: 0.3px;
    border-radius: 40px;
    height: 48px;
}

.prev-btn {
    border-color: #d46600;
    color: #d46600;
}

.prev-btn:hover {
    background: rgba(212, 102, 0, 0.05);
    border-color: #5c3a21;
}

.next-btn,
.register-btn {
    background: linear-gradient(135deg, #5c3a21 0%, #d46600 100%);
    box-shadow: 0 4px 12px rgba(212, 102, 0, 0.3);
}

.next-btn:hover,
.register-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(212, 102, 0, 0.4);
}

.login-link {
    text-align: center;
    margin-top: 24px;
    font-size: 0.85rem;
    color: #6c7a8a;
}

.login-text {
    color: #d46600;
    font-weight: 600;
    cursor: pointer;
    margin-left: 5px;
    transition: color 0.2s ease;
}

.login-text:hover {
    color: #5c3a21;
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
    animation: fadeInUp 0.5s ease-out;
}

.feature-icon-wrapper {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    transition: transform 0.3s ease;
}

.feature-slide h3 {
    font-size: 1.6rem;
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
    background: rgba(255, 255, 255, 0.15);
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
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1.2;
}

.benefit-label {
    font-size: 0.7rem;
    opacity: 0.8;
    letter-spacing: 0.3px;
    text-align: center;
    max-width: 100px;
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.3);
}

/* Animations */
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

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(10px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
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
        font-size: 1.3rem;
    }

    .benefit-title {
        font-size: 1.3rem;
    }
}

@media (max-width: 600px) {
    .form-content h1 {
        font-size: 1.5rem;
    }

    .step-label {
        font-size: 0.6rem;
    }

    .step-circle {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
    }

    .benefits-container {
        gap: 12px;
    }

    .benefit-title {
        font-size: 1.1rem;
    }

    .benefit-label {
        font-size: 0.6rem;
        max-width: 80px;
    }

    .feature-icon-wrapper {
        width: 60px;
        height: 60px;
    }

    .navigation-buttons {
        flex-direction: column;
    }

    .nav-btn {
        width: 100%;
    }
}

.cursor-pointer {
    cursor: pointer;
}

.row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -8px;
}

.col-6 {
    flex: 0 0 50%;
    padding: 0 8px;
}
</style>