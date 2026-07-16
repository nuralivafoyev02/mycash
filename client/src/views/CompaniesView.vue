<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, onMounted, onUnmounted } from 'vue';
import { useCompanyStore } from '../stores/companyStore';

const store = useCompanyStore();
const { t } = useI18n();
const isModalOpen = ref(false);
const newCompany = ref({ name: '', slug: '' });
const isSubmitting = ref(false);

const activeMenuId = ref<string | null>(null);

const closeMenu = () => {
  activeMenuId.value = null;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isModalOpen.value = false;
    closeMenu();
  }
};

const toggleMenu = (id: string, event: Event) => {
  event.stopPropagation();
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

onMounted(() => {
  store.fetchCompanies();
  document.addEventListener('click', closeMenu);
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenu);
  document.removeEventListener('keydown', handleKeydown);
});

const editingCompanyId = ref<string | null>(null);

const openEditModal = (company: any) => {
  editingCompanyId.value = company.id;
  newCompany.value = { name: company.name, slug: company.slug };
  isModalOpen.value = true;
  closeMenu();
};

const openCreateModal = () => {
  editingCompanyId.value = null;
  newCompany.value = { name: '', slug: '' };
  isModalOpen.value = true;
};

const handleDelete = async (id: string) => {
  if (confirm("Rostdan ham ushbu kompaniyani o'chirmoqchimisiz?")) {
    await store.deleteCompany(id);
    closeMenu();
  }
};

const handleCreateOrUpdate = async () => {
  if (!newCompany.value.name.trim()) return;
  isSubmitting.value = true;
  
  let success;
  if (editingCompanyId.value) {
    success = await store.updateCompany(editingCompanyId.value, {
      name: newCompany.value.name,
      slug: newCompany.value.slug || undefined
    });
  } else {
    success = await store.createCompany({
      name: newCompany.value.name,
      slug: newCompany.value.slug || undefined
    });
  }
  
  if (success) {
    isModalOpen.value = false;
    newCompany.value = { name: '', slug: '' };
    editingCompanyId.value = null;
  }
  isSubmitting.value = false;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('companies.title') }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">Manage your organizations and business entities.</p>
      </div>
      <button 
        @click="openCreateModal"
        class="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-200"
      >
        <i class="bi bi-plus-lg"></i>{{ t('companies.add_new') }}</button>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-start gap-3">
      <i class="bi bi-exclamation-triangle-fill mt-0.5"></i>
      <div>
        <h3 class="font-medium">Error loading companies</h3>
        <p class="text-sm mt-1 opacity-90">{{ store.error }}</p>
      </div>
      <button @click="store.fetchCompanies()" class="ml-auto text-sm underline hover:text-red-700">Retry</button>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading && store.companies.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-48 rounded-xl bg-card border border-border shadow-sm animate-pulse flex flex-col p-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="h-12 w-12 rounded-lg bg-muted"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-muted rounded w-3/4"></div>
            <div class="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div class="mt-auto space-y-2">
          <div class="h-3 bg-muted rounded w-full"></div>
          <div class="h-3 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.companies.length === 0 && !store.loading && !store.error" class="text-center py-20 px-6 rounded-2xl border border-dashed border-border bg-card/50 backdrop-blur-sm">
      <div class="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
        <i class="bi bi-building text-3xl"></i>
      </div>
      <h3 class="text-lg font-semibold mb-2">{{ t('companies.no_data') }}</h3>
      <p class="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
        Get started by creating your first company. You can add as many entities as you need.
      </p>
      <button 
        @click="openCreateModal"
        class="inline-flex items-center gap-2 bg-background border border-input px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <i class="bi bi-plus-lg"></i>
        Add Your First Company
      </button>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="company in store.companies" 
        :key="company.id"
        class="group relative flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
        <div class="p-6 flex-1 flex flex-col relative z-10">
          <div class="flex items-start justify-between mb-4 relative">
            <div class="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-inner">
              {{ company.name.charAt(0).toUpperCase() }}
            </div>
            <div class="relative">
              <button 
                @click="(e) => toggleMenu(company.id, e)"
                class="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent"
                :class="{ 'bg-accent text-foreground': activeMenuId === company.id }"
              >
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              
              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div 
                  v-if="activeMenuId === company.id"
                  @click.stop="closeMenu"
                  class="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-border shadow-lg py-1 z-50 overflow-hidden"
                >
                  <button @click="openEditModal(company)" class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                    <i class="bi bi-pencil"></i> Tahrirlash
                  </button>
                  <div class="h-px bg-border my-1"></div>
                  <button @click="handleDelete(company.id)" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2 font-medium">
                    <i class="bi bi-trash"></i> O'chirish
                  </button>
                </div>
              </Transition>
            </div>
          </div>
          <h3 class="text-lg font-semibold line-clamp-1 mb-1">{{ company.name }}</h3>
          <p class="text-sm text-muted-foreground mb-4 font-mono text-xs">@{{ company.slug }}</p>
          
          <div class="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span class="flex items-center gap-1.5">
              <i class="bi bi-calendar3"></i>
              {{ new Date(company.created_at || Date.now()).toLocaleDateString() }}
            </span>
            <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Modal Overlay -->
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isModalOpen" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-8 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-8 sm:scale-95"
      >
        <div v-if="isModalOpen" class="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden relative">
          <!-- Modal Header -->
          <div class="p-6 border-b border-border flex items-center justify-between">
            <h2 class="text-xl font-semibold">{{ editingCompanyId ? 'Kompaniyani Tahrirlash' : t('companies.add_new') }}</h2>
            <button @click="isModalOpen = false" class="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <!-- Modal Body -->
          <form @submit.prevent="handleCreateOrUpdate" class="p-6 space-y-4">
            <div class="space-y-2">
              <label for="name" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{{ t('companies.name') }}<span class="text-red-500">*</span>
              </label>
              <input 
                id="name" 
                v-model="newCompany.name" 
                type="text" 
                required
                placeholder="e.g. Acme Corp" 
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
              >
            </div>
            
            <div class="space-y-2">
              <label for="slug" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Slug <span class="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input 
                id="slug" 
                v-model="newCompany.slug" 
                type="text" 
                placeholder="e.g. acme-corp" 
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
              >
              <p class="text-[0.8rem] text-muted-foreground">Will be auto-generated from name if left empty.</p>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 flex items-center justify-end gap-3">
              <button 
                type="button"
                @click="isModalOpen = false"
                class="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {{ t('common.cancel') }}
              </button>
              <button 
                type="submit"
                :disabled="isSubmitting || !newCompany.name.trim()"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <i v-if="isSubmitting" class="bi bi-arrow-repeat animate-spin"></i>
                <span v-else>{{ editingCompanyId ? 'Saqlash' : t('common.save') }}</span>
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
