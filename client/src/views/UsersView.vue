<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../stores/userStore';

const store = useUserStore();
const { t } = useI18n();
const isModalOpen = ref(false);
const newUser = ref({ name: '', email: '', password: '', role: 'User' });
const editingId = ref<string | null>(null);
const isSubmitting = ref(false);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') isModalOpen.value = false;
};

onMounted(() => {
  store.fetchUsers();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

const openCreateModal = () => {
  editingId.value = null;
  newUser.value = { name: '', email: '', password: '', role: 'User' };
  isModalOpen.value = true;
};

const openEditModal = (user: any) => {
  editingId.value = user.id;
  newUser.value = { name: user.name, email: user.email, password: '', role: user.role };
  isModalOpen.value = true;
};

const handleSubmit = async () => {
  if (!newUser.value.name.trim() || !newUser.value.email.trim()) return;
  // password required on create, optional on update
  if (!editingId.value && !newUser.value.password.trim()) return;
  
  isSubmitting.value = true;
  
  const payload: any = {
    name: newUser.value.name,
    email: newUser.value.email,
    role: newUser.value.role
  };
  
  if (newUser.value.password.trim()) {
    payload.password = newUser.value.password;
  }
  
  let success;
  if (editingId.value) {
    success = await store.updateUser(editingId.value, payload);
  } else {
    success = await store.createUser(payload);
  }
  
  if (success) {
    isModalOpen.value = false;
    newUser.value = { name: '', email: '', password: '', role: 'User' };
    editingId.value = null;
  }
  isSubmitting.value = false;
};

const handleDelete = async (id: string) => {
  if (confirm('Ushbu xodimni o\'chirib tashlaysizmi?')) {
    await store.deleteUser(id);
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('users.title') }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">Manage team members and their roles.</p>
      </div>
      <button 
        @click="openCreateModal"
        class="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-200"
      >
        <i class="bi bi-person-plus-fill"></i>{{ t('users.add_new') }}</button>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-start gap-3">
      <i class="bi bi-exclamation-triangle-fill mt-0.5"></i>
      <div>
        <h3 class="font-medium">Error loading users</h3>
        <p class="text-sm mt-1 opacity-90">{{ store.error }}</p>
      </div>
      <button @click="store.fetchUsers()" class="ml-auto text-sm underline hover:text-red-700">Retry</button>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading && store.users.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" class="h-32 rounded-xl bg-card border border-border shadow-sm animate-pulse flex items-center p-6 gap-4">
        <div class="h-12 w-12 rounded-full bg-muted"></div>
        <div class="space-y-2 flex-1">
          <div class="h-4 bg-muted rounded w-3/4"></div>
          <div class="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.users.length === 0 && !store.loading && !store.error" class="text-center py-20 px-6 rounded-2xl border border-dashed border-border bg-card/50 backdrop-blur-sm">
      <div class="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
        <i class="bi bi-people text-3xl"></i>
      </div>
      <h3 class="text-lg font-semibold mb-2">{{ t('users.no_data') }}</h3>
      <p class="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
        Add team members to collaborate and manage your finances together.
      </p>
      <button 
        @click="openCreateModal"
        class="inline-flex items-center gap-2 bg-background border border-input px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <i class="bi bi-person-plus-fill"></i>
        Add First User
      </button>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="user in store.users" 
        :key="user.id"
        class="group flex items-center gap-4 bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-all duration-300"
      >
        <div class="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
          {{ user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-semibold line-clamp-1 text-foreground">{{ user.name }}</h3>
          <p class="text-sm text-muted-foreground truncate">{{ user.email }}</p>
        </div>
        <div class="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" :class="user.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-secondary text-secondary-foreground'">
          {{ user.role }}
        </div>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
          <button @click="openEditModal(user)" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Tahrirlash">
            <i class="bi bi-pencil"></i>
          </button>
          <button @click="handleDelete(user.id)" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="O'chirish">
            <i class="bi bi-trash3"></i>
          </button>
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
          <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h2 class="text-lg font-semibold">{{ editingId ? 'Tahrirlash' : t('users.add_new') }}</h2>
            <button 
              @click="isModalOpen = false" 
              class="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <!-- Modal Body -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <div class="space-y-2">
              <label for="name" class="text-sm font-medium leading-none">{{ t('users.full_name') }}<span class="text-red-500">*</span>
              </label>
              <input 
                id="name" 
                v-model="newUser.name" 
                type="text" 
                required
                placeholder="e.g. Jane Doe" 
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
              >
            </div>

            <div class="space-y-2">
              <label for="email" class="text-sm font-medium leading-none">{{ t('users.email') }}<span class="text-red-500">*</span>
              </label>
              <input 
                id="email" 
                v-model="newUser.email" 
                type="email" 
                required
                placeholder="jane@example.com" 
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
              >
            </div>

            <div class="space-y-2">
              <label for="password" class="text-sm font-medium leading-none">{{ t('users.password') }}<span v-if="!editingId" class="text-red-500">*</span>
              </label>
              <input 
                id="password" 
                v-model="newUser.password" 
                type="password" 
                :required="!editingId"
                minlength="6"
                placeholder="••••••••" 
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
              >
            </div>
            
            <div class="space-y-2">
              <label for="role" class="text-sm font-medium leading-none">{{ t('users.role') }}<span class="text-red-500">*</span>
              </label>
              <select 
                id="role" 
                v-model="newUser.role"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
              >
                <option value="User">User (Standard Access)</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 flex items-center justify-end gap-3">
              <button 
                type="button" 
                @click="isModalOpen = false"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >{{ t('common.cancel') }}</button>
              <button 
                type="submit" 
                :disabled="isSubmitting || !newUser.name.trim() || !newUser.email.trim() || (!editingId && newUser.password.length < 6)"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[100px]"
              >
                <i v-if="isSubmitting" class="bi bi-arrow-repeat animate-spin mr-2"></i>
                {{ isSubmitting ? t('common.loading') : (editingId ? 'Saqlash' : t('users.add_new')) }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
