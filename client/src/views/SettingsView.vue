<script setup lang="ts">
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useDark, useToggle } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const { t, locale } = useI18n();

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const user = authStore.user;

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
});
const toggleDark = useToggle(isDark);

const changeLanguage = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  locale.value = target.value;
  localStorage.setItem('locale', target.value);
}

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64String = e.target?.result as string;
    await authStore.updateProfile({ avatar_url: base64String });
  };
  reader.readAsDataURL(file);
};

const removeAvatar = async () => {
  if (confirm('Profil rasmini o\'chirib tashlaysizmi?')) {
    await authStore.updateProfile({ avatar_url: null });
  }
};
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header Area -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('settings.title') }}</h1>
      <p class="text-muted-foreground mt-1 text-sm">{{ t('settings.desc') }}</p>
    </div>

    <!-- Profile Settings Card -->
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-border bg-muted/20">
        <h3 class="text-lg font-semibold text-foreground">{{ t('settings.profile_title') }}</h3>
        <p class="text-sm text-muted-foreground">{{ t('settings.profile_desc') }}</p>
      </div>

      <div class="p-6">
        <div class="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <!-- Avatar -->
          <div class="relative shrink-0 group">
            <div
              class="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shadow-inner ring-4 ring-background overflow-hidden">
              <img v-if="user?.avatar_url" :src="user.avatar_url" class="h-full w-full object-cover" alt="Profile" />
              <template v-else>
                {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
              </template>
            </div>
            
            <div class="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
              <button
                @click="triggerFileInput"
                class="p-2 bg-white/20 hover:bg-white/40 border border-white/30 rounded-full text-white transition-colors"
                title="Rasmni o'zgartirish">
                <i class="bi bi-camera-fill text-lg"></i>
              </button>
              <button
                v-if="user?.avatar_url"
                @click="removeAvatar"
                class="p-2 bg-white/20 hover:bg-red-500/80 border border-white/30 rounded-full text-white transition-colors"
                title="Rasmni o'chirish">
                <i class="bi bi-trash3-fill text-lg"></i>
              </button>
            </div>
            <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleImageUpload" />
          </div>

          <!-- Details Form -->
          <div class="flex-1 space-y-4 w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-muted-foreground">{{ t('settings.full_name') }}</label>
                <input type="text" disabled :value="user?.name"
                  class="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground cursor-not-allowed opacity-80" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-muted-foreground">{{ t('settings.email') }}</label>
                <input type="email" disabled :value="user?.email"
                  class="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground cursor-not-allowed opacity-80" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-muted-foreground">{{ t('settings.role') }}</label>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="user?.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-secondary text-secondary-foreground'">
                  {{ user?.role || 'User' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preferences Card -->
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-border bg-muted/20">
        <h3 class="text-lg font-semibold text-foreground">{{ t('settings.preferences_title') }}</h3>
        <p class="text-sm text-muted-foreground">{{ t('settings.preferences_desc') }}</p>
      </div>

      <div class="p-0">
        <ul class="divide-y divide-border">
          <li class="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
            <div class="flex items-start gap-4">
              <div class="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <i class="bi" :class="isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill'"></i>
              </div>
              <div>
                <h4 class="text-sm font-medium text-foreground">{{ t('settings.appearance') }}</h4>
                <p class="text-sm text-muted-foreground mt-0.5">{{ t('settings.appearance_desc') }}</p>
              </div>
            </div>
            <button @click="toggleDark()"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              :class="isDark ? 'bg-primary' : 'bg-muted-foreground/30'">
              <span class="sr-only">Toggle dark mode</span>
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="isDark ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </li>

          <li
            class="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors border-b border-border">
            <div class="flex items-start gap-4">
              <div
                class="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <i class="bi bi-translate"></i>
              </div>
              <div>
                <h4 class="text-sm font-medium text-foreground">{{ t('settings.lang') }}</h4>
                <p class="text-sm text-muted-foreground mt-0.5">{{ t('settings.lang_desc') }}</p>
              </div>
            </div>
            <select :value="locale" @change="changeLanguage"
              class="mt-4 sm:mt-0 w-full sm:w-48 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="en">English</option>
              <option value="uz">O'zbekcha</option>
              <option value="ru">Русский</option>
            </select>
          </li>

          <li class="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors">
            <div class="flex items-start gap-4">
              <div
                class="h-10 w-10 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                <i class="bi bi-currency-exchange"></i>
              </div>
              <div>
                <h4 class="text-sm font-medium text-foreground">{{ t('settings.currency') }}</h4>
                <p class="text-sm text-muted-foreground mt-0.5">{{ t('settings.lang_desc') }}</p>
              </div>
            </div>
            <select :value="settingsStore.currency"
              @change="(e) => settingsStore.setCurrency((e.target as HTMLSelectElement).value)"
              class="mt-4 sm:mt-0 w-full sm:w-48 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="UZS">UZS - So'm</option>
              <option value="USD">USD - Dollar</option>
              <option value="EUR">EUR - Yevro</option>
              <option value="RUB">RUB - Rubl</option>
            </select>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>
