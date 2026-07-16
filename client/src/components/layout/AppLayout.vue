<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useDark, useToggle } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const changeLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

const authStore = useAuthStore()

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark = useToggle(isDark)

const isSidebarOpen = ref(true)
const showLogoutConfirm = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const confirmLogout = () => {
  showLogoutConfirm.value = true
}

const handleLogout = () => {
  showLogoutConfirm.value = false
  authStore.logout()
}

const navigation = computed(() => [
  { name: t('nav.dashboard') || 'Asosiy', href: '/', icon: 'bi-house' },
  { name: 'Kategoriyalar', href: '/categories', icon: 'bi-tags' },
  { name: t('nav.transactions') || 'Tranzaksiyalar', href: '/transactions', icon: 'bi-arrow-left-right' },
  { name: t('nav.accounts') || 'Hisoblar', href: '/accounts', icon: 'bi-credit-card' },
  { name: t('nav.companies') || 'Kompaniyalar', href: '/companies', icon: 'bi-building' },
  { name: t('nav.users') || 'Foydalanuvchilar', href: '/users', icon: 'bi-people' },
  { name: t('nav.settings') || 'Sozlamalar', href: '/settings', icon: 'bi-gear' },
])
</script>

<template>
  <div class="flex h-screen bg-muted/20">
    <!-- Sidebar -->
    <div :class="[
      'bg-background border-r border-border transition-all duration-300 ease-in-out flex flex-col',
      isSidebarOpen ? 'w-52' : 'w-17'
    ]">
      <div class="h-16 flex items-center justify-between px-4 border-b border-border overflow-hidden shrink-0">
        <h1 v-if="isSidebarOpen" class="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden text-primary">
          <i class="bi bi-wallet-fill mr-2"></i>MyCash
        </h1>
        <button @click="toggleSidebar"
          class="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-auto">
          <i class="bi bi-list text-xl"></i>
        </button>
      </div>
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        <RouterLink v-for="item in navigation" :key="item.name" :to="item.href"
          class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
          exact-active-class="bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground"
          :title="!isSidebarOpen ? item.name : ''">
          <i :class="['bi', item.icon, 'text-lg']"></i>
          <span v-if="isSidebarOpen" class="truncate">{{ item.name }}</span>
        </RouterLink>
      </nav>
      <div class="p-4 border-t border-border shrink-0">
        <div class="flex items-center gap-3 px-2 py-2" :class="!isSidebarOpen ? 'justify-center' : ''">
          <div
            class="h-9 w-9 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner overflow-hidden border border-primary/10">
            <img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url" class="h-full w-full object-cover" alt="Profile" />
            <span v-else>{{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}</span>
          </div>
          <div v-if="isSidebarOpen" class="flex flex-col overflow-hidden">
            <span class="text-sm font-medium truncate">{{ authStore.user?.name || 'User' }}</span>
            <span class="text-xs text-muted-foreground truncate">{{ authStore.user?.role || 'Role' }}</span>
          </div>
          <button v-if="isSidebarOpen"
            @click="confirmLogout"
            title="Sign out"
            class="ml-auto text-sm text-muted-foreground hover:text-red-500 transition-colors p-1 px-2 rounded-full hover:bg-red-50">
            <i class="bi bi-box-arrow-right text-lg"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="h-16 bg-background border-b border-border flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-semibold truncate hidden sm:block">Cloud Accounting</h2>
        </div>
        <div class="flex items-center gap-1">
          
          <!-- Language Toggle -->
          <div class="relative group">
            <button
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted flex items-center gap-2">
              <i class="bi bi-translate text-lg"></i>
              <span class="uppercase text-xs hidden sm:inline-block">{{ locale }}</span>
            </button>
            <div class="absolute right-0 top-full mt-1 w-32 bg-background border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
              <button 
                @click="changeLanguage('uz')" 
                class="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                :class="locale === 'uz' ? 'text-primary font-bold bg-primary/5' : 'text-foreground'"
              >
                O'zbek
              </button>
              <button 
                @click="changeLanguage('en')" 
                class="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                :class="locale === 'en' ? 'text-primary font-bold bg-primary/5' : 'text-foreground'"
              >
                English
              </button>
              <button 
                @click="changeLanguage('ru')" 
                class="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                :class="locale === 'ru' ? 'text-primary font-bold bg-primary/5' : 'text-foreground'"
              >
                Русский
              </button>
            </div>
          </div>

          <div class="h-6 w-px bg-border mx-1"></div>

          <button
            @click="toggleDark()"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted">
            <i class="bi" :class="isDark ? 'bi-sun' : 'bi-moon'"></i>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8 relative">
        <div class="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom"></div>
        <div class="mx-auto max-w-7xl relative">
          <slot />
        </div>
      </main>
    </div>
  </div>

  <!-- Logout Confirmation Modal -->
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="showLogoutConfirm" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-8 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-8 sm:scale-95"
      >
        <div v-if="showLogoutConfirm" class="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl p-6 text-center">
          <div class="h-12 w-12 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <i class="bi bi-box-arrow-right text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold mb-2">Tizimdan chiqish</h3>
          <p class="text-muted-foreground text-sm mb-6">Rostdan ham tizimdan chiqmoqchimisiz?</p>
          <div class="flex gap-3 justify-center">
            <button @click="showLogoutConfirm = false" class="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors">
              Bekor qilish
            </button>
            <button @click="handleLogout" class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">
              Chiqish
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
