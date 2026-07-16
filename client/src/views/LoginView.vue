<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  if (!email.value.trim() || !password.value.trim()) {
    errorMsg.value = 'Please enter your email and password.';
    return;
  }
  
  errorMsg.value = '';
  isSubmitting.value = true;
  
  const success = await authStore.login(email.value, password.value);
  
  if (success) {
    router.push('/');
  } else {
    errorMsg.value = authStore.error || 'Login failed. Please check your credentials.';
  }
  
  isSubmitting.value = false;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
    <div class="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl border border-border bg-card h-[600px]">
      
      <!-- Left Side (Visual/Branding) -->
      <div class="hidden md:flex md:w-1/2 relative bg-primary/5 flex-col justify-between p-12 overflow-hidden">
        <!-- Abstract background elements -->
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-60"></div>
        <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-60"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 text-primary mb-6">
            <i class="bi bi-wallet-fill text-3xl"></i>
            <span class="text-2xl font-bold tracking-tight text-foreground">MyCash ERP</span>
          </div>
          <p class="text-lg text-muted-foreground font-medium max-w-sm">
            Streamline your financial operations with intelligent accounting and real-time analytics.
          </p>
        </div>
        
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur-md border border-border/50 text-sm font-medium shadow-sm">
            <i class="bi bi-shield-lock text-emerald-500"></i>
            Secure Access
          </div>
        </div>
      </div>

      <!-- Right Side (Login Form) -->
      <div class="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
        <div class="max-w-md w-full mx-auto space-y-8">
          
          <!-- Mobile Branding (hidden on md+) -->
          <div class="flex md:hidden items-center gap-3 text-primary mb-8 justify-center">
            <i class="bi bi-wallet-fill text-3xl"></i>
            <span class="text-2xl font-bold tracking-tight text-foreground">MyCash ERP</span>
          </div>

          <div class="text-center md:text-left">
            <h2 class="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p class="text-muted-foreground mt-2">Enter your credentials to sign in</p>
          </div>

          <div v-if="errorMsg" class="p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-start gap-3 text-sm">
            <i class="bi bi-exclamation-triangle-fill mt-0.5"></i>
            <p>{{ errorMsg }}</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="space-y-4">
              <div class="space-y-2">
                <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email address
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <i class="bi bi-envelope"></i>
                  </div>
                  <input 
                    id="email" 
                    v-model="email" 
                    type="email" 
                    required
                    placeholder="admin@mycash.com" 
                    class="flex h-12 w-full rounded-xl border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  >
                </div>
              </div>

              <div class="space-y-2">
                <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <i class="bi bi-lock"></i>
                  </div>
                  <input 
                    id="password" 
                    v-model="password" 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    class="flex h-12 w-full rounded-xl border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  >
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="isSubmitting || !email.trim() || !password.trim()"
              class="w-full inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg h-12 px-4 py-2 gap-2"
            >
              <i v-if="isSubmitting" class="bi bi-arrow-repeat animate-spin"></i>
              <span v-else>Sign In</span>
              <i v-if="!isSubmitting" class="bi bi-arrow-right ml-1"></i>
            </button>
          </form>

        </div>
      </div>
      
    </div>
  </div>
</template>
