<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCategoryStore } from '../stores/categoryStore';
import { useSettingsStore } from '../stores/settingsStore';

const store = useCategoryStore();
const settingsStore = useSettingsStore();

const isModalOpen = ref(false);
const isSubmitting = ref(false);
const editingId = ref<string | null>(null);
const categoryForm = ref({ name: '', type: 'income', inn: '', phone: '', description: '' });

onMounted(() => {
  store.fetchCategories();
});

const handleSubmit = async () => {
  if (!categoryForm.value.name.trim()) return;
  isSubmitting.value = true;
  
  const payload: any = {
    name: categoryForm.value.name,
    type: categoryForm.value.type,
  };
  
  if (categoryForm.value.type === 'counterparty') {
    payload.inn = categoryForm.value.inn;
    payload.phone = categoryForm.value.phone;
    payload.description = categoryForm.value.description;
  }
  
  let success;
  if (editingId.value) {
    success = await store.updateCategory(editingId.value, payload);
  } else {
    success = await store.createCategory(payload);
  }
  
  if (success) {
    isModalOpen.value = false;
    categoryForm.value = { name: '', type: 'income', inn: '', phone: '', description: '' };
    editingId.value = null;
  }
  isSubmitting.value = false;
};

const handleDelete = async (id: string) => {
  if (confirm('Ushbu kategoriyani o\'chirib tashlaysizmi?')) {
    await store.deleteCategory(id);
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ' + settingsStore.currency;
};

const activeTab = ref('income');
const currentList = computed(() => {
  if (activeTab.value === 'income') return store.incomeCategories;
  if (activeTab.value === 'expense') return store.expenseCategories;
  return store.counterparties;
});

const openCreateModal = (type: string) => {
  editingId.value = null;
  categoryForm.value = { name: '', type, inn: '', phone: '', description: '' };
  isModalOpen.value = true;
};

const openEditModal = (cat: any) => {
  editingId.value = cat.id;
  categoryForm.value = { 
    name: cat.name, 
    type: cat.type, 
    inn: cat.inn || '', 
    phone: cat.phone || '', 
    description: cat.description || '' 
  };
  isModalOpen.value = true;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Kategoriyalar</h1>
        <p class="text-muted-foreground mt-1 text-sm">Tranzaksiya toifalarini va kontragentlarni boshqarish</p>
      </div>
      <button 
        @click="openCreateModal(activeTab)"
        class="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-colors"
      >
        <i class="bi bi-plus-lg"></i>
        Yangi qo'shish
      </button>
    </div>

    <!-- Tabs -->
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-2">
      <div class="flex space-x-2">
        <button 
          v-for="(label, key) in { income: 'Daromat turi', expense: 'Xarajat turi', counterparty: 'Kontragent' }" 
          :key="key"
          @click="activeTab = key"
          :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === key ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground']"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <!-- Content List -->
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div v-if="store.loading && store.categories.length === 0" class="p-8 flex justify-center">
        <i class="bi bi-arrow-repeat animate-spin text-3xl text-muted-foreground"></i>
      </div>
      
      <div v-else-if="currentList.length === 0" class="text-center py-16 px-6">
        <div class="h-16 w-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i class="bi bi-tags text-3xl"></i>
        </div>
        <h3 class="text-lg font-semibold mb-2">Hech narsa topilmadi</h3>
        <p class="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
          Sizda ushbu ro'yxat bo'yicha hech qanday ma'lumot yo'q.
        </p>
        <button 
          @click="openCreateModal(activeTab)"
          class="inline-flex items-center gap-2 bg-background border border-input px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent"
        >
          <i class="bi bi-plus-lg"></i>
          Yaratish
        </button>
      </div>

      <div v-else class="divide-y divide-border">
        <div 
          v-for="cat in currentList" 
          :key="cat.id" 
          class="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {{ cat.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-medium text-foreground">{{ cat.name }}</p>
              <div v-if="cat.type === 'counterparty'" class="text-xs text-muted-foreground mt-0.5 space-x-2">
                <span v-if="cat.inn"><i class="bi bi-building mr-1"></i>{{ cat.inn }}</span>
                <span v-if="cat.phone"><i class="bi bi-telephone mr-1"></i>{{ cat.phone }}</span>
                <span v-if="cat.description" class="italic">{{ cat.description }}</span>
              </div>
              <p class="text-xs text-muted-foreground mt-0.5">Jami aylanma: <span class="font-semibold text-foreground">{{ formatCurrency(cat.total_amount) }}</span></p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button @click="openEditModal(cat)" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Tahrirlash">
              <i class="bi bi-pencil"></i>
            </button>
            <button @click="handleDelete(cat.id)" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="O'chirish">
              <i class="bi bi-trash3"></i>
            </button>
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
      <div class="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl relative overflow-hidden">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <h2 class="text-lg font-semibold">{{ editingId ? 'Tahrirlash' : 'Yangi yaratish' }}</h2>
          <button @click="isModalOpen = false" class="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Nomi<span class="text-red-500">*</span></label>
            <input 
              v-model="categoryForm.name" 
              type="text" 
              required
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
          </div>
          <template v-if="categoryForm.type === 'counterparty'">
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">INN (STIR)</label>
              <input 
                v-model="categoryForm.inn" 
                type="text" 
                placeholder="Misol uchun: 123456789"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Telefon raqam</label>
              <input 
                v-model="categoryForm.phone" 
                type="text" 
                placeholder="+998 90 123 45 67"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Izoh</label>
              <textarea 
                v-model="categoryForm.description" 
                rows="2"
                placeholder="Qo'shimcha ma'lumot..."
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              ></textarea>
            </div>
          </template>
          <div class="pt-4 flex justify-end gap-3">
            <button type="button" @click="isModalOpen = false" class="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted">Bekor qilish</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              <i v-if="isSubmitting" class="bi bi-arrow-repeat animate-spin mr-2"></i>Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
