<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, onMounted, onUnmounted } from 'vue';
import { useAccountStore } from '../stores/accountStore';
import { useSettingsStore } from '../stores/settingsStore';
import api from '../services/api';

const store = useAccountStore();
const { t } = useI18n();
const settingsStore = useSettingsStore();
const isModalOpen = ref(false);
const isTypeDropdownOpen = ref(false);
const newAccount = ref({ name: '', type: 'Bank Account', balance: 0 });
const editingId = ref<string | null>(null);
const isSubmitting = ref(false);
const canEditBalance = ref(true);

const balanceDisplay = ref('');

const formatNumberWithSpaces = (value: number | string) => {
  if (!value) return '';
  const num = String(value).replace(/\s/g, '');
  if (isNaN(Number(num))) return String(value);
  return new Intl.NumberFormat('ru-RU').format(Number(num));
};

const onBalanceInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const rawValue = target.value.replace(/\s/g, '');
  if (!isNaN(Number(rawValue)) && rawValue !== '') {
    newAccount.value.balance = Number(rawValue);
    balanceDisplay.value = formatNumberWithSpaces(rawValue);
  } else if (rawValue === '') {
    newAccount.value.balance = 0;
    balanceDisplay.value = '';
  } else {
    balanceDisplay.value = formatNumberWithSpaces(newAccount.value.balance || '');
  }
};

const openCreateModal = () => {
  editingId.value = null;
  newAccount.value = { name: '', type: 'Bank Account', balance: 0 };
  balanceDisplay.value = '';
  canEditBalance.value = true;
  isModalOpen.value = true;
};

const openEditModal = async (account: any) => {
  editingId.value = account.id;
  newAccount.value = { name: account.name, type: account.type, balance: account.balance };
  balanceDisplay.value = formatNumberWithSpaces(account.balance);
  
  try {
    const res = await api.get(`/transactions/account/${account.id}`);
    canEditBalance.value = res.data.length === 0;
  } catch (err) {
    console.error('Failed to fetch transactions for account', err);
    canEditBalance.value = false;
  }
  
  isModalOpen.value = true;
};

const accountCategories = [
  {
    category: 'Assets (Aktivlar)',
    types: [
      { id: 'Cash on Hand', label: 'Cash on Hand', icon: 'bi-cash', desc: "Naqd pul va kassadagi mablag'lar", color: 'text-green-500', bg: 'bg-green-500/10' },
      { id: 'Bank Account', label: 'Bank Account', icon: 'bi-bank', desc: 'Bankdagi hisob raqamlar', color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { id: 'Accounts Receivable', label: 'Accounts Receivable', icon: 'bi-box-arrow-in-right', desc: 'Xaridorlardan olinadigan qarzlar', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
      { id: 'Inventory', label: 'Inventory', icon: 'bi-box-seam', desc: 'Ombordagi tovarlar', color: 'text-teal-500', bg: 'bg-teal-500/10' },
      { id: 'Fixed Asset', label: 'Fixed Asset', icon: 'bi-building', desc: 'Asosiy vositalar (bino, uskuna)', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    ]
  },
  {
    category: 'Liabilities (Majburiyatlar)',
    types: [
      { id: 'Credit Card', label: 'Credit Card', icon: 'bi-credit-card', desc: 'Kredit kartalar', color: 'text-red-500', bg: 'bg-red-500/10' },
      { id: 'Accounts Payable', label: 'Accounts Payable', icon: 'bi-box-arrow-right', desc: 'Yetkazib beruvchilarga qarzlar', color: 'text-rose-500', bg: 'bg-rose-500/10' },
      { id: 'Loan', label: 'Loan / Mortgage', icon: 'bi-bank2', desc: 'Kredit va qarz majburiyatlari', color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { id: 'Taxes Payable', label: 'Taxes Payable', icon: 'bi-file-earmark-ruled', desc: "To'lanadigan soliqlar", color: 'text-pink-500', bg: 'bg-pink-500/10' },
    ]
  },
  {
    category: 'Equity (Kapital)',
    types: [
      { id: 'Owner Equity', label: 'Owner\'s Equity', icon: 'bi-pie-chart', desc: 'Ustav kapitali', color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { id: 'Retained Earnings', label: 'Retained Earnings', icon: 'bi-graph-up-arrow', desc: 'Taqsimlanmagan foyda', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    ]
  },
  {
    category: 'Revenue (Daromad)',
    types: [
      { id: 'Sales Revenue', label: 'Sales Revenue', icon: 'bi-cart-check', desc: 'Sotuvdan tushumlar', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { id: 'Interest Income', label: 'Interest Income', icon: 'bi-percent', desc: 'Foiz ko\'rinishidagi daromad', color: 'text-lime-500', bg: 'bg-lime-500/10' },
    ]
  },
  {
    category: 'Expenses (Xarajatlar)',
    types: [
      { id: 'Cost of Goods Sold', label: 'Cost of Goods Sold', icon: 'bi-tags', desc: 'Sotilgan tovarlar tannarxi', color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { id: 'Operating Expense', label: 'Operating Expense', icon: 'bi-receipt', desc: 'Operatsion va boshqa xarajatlar', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ]
  }
];

const getTypeInfo = (typeId: string) => {
  for (const cat of accountCategories) {
    const found = cat.types.find(t => t.id === typeId);
    if (found) return found;
  }
  return { label: typeId, icon: 'bi-wallet2', color: 'text-primary', bg: 'bg-primary/10', desc: '' };
};

const closeDropdown = () => {
  isTypeDropdownOpen.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') isModalOpen.value = false;
};

onMounted(() => {
  store.fetchAccounts();
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', closeDropdown);
});

const handleSubmit = async () => {
  if (!newAccount.value.name.trim()) return;
  isSubmitting.value = true;
  
  const payload = {
    name: newAccount.value.name,
    type: newAccount.value.type,
    balance: Number(newAccount.value.balance)
  };
  
  let success;
  if (editingId.value) {
    success = await store.updateAccount(editingId.value, payload);
  } else {
    success = await store.createAccount(payload);
  }
  
  if (success) {
    isModalOpen.value = false;
    newAccount.value = { name: '', type: 'Bank Account', balance: 0 };
    editingId.value = null;
  }
  isSubmitting.value = false;
};

const handleDelete = async (id: string) => {
  if (confirm('Ushbu hisobni o\'chirib tashlaysizmi?')) {
    await store.deleteAccount(id);
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ' + settingsStore.currency;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('accounts.title') }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">Manage your bank accounts, cash registers, and wallets.</p>
      </div>
      <button 
        @click="isModalOpen = true"
        class="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-200"
      >
        <i class="bi bi-plus-lg"></i>{{ t('accounts.add_new') }}</button>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-start gap-3">
      <i class="bi bi-exclamation-triangle-fill mt-0.5"></i>
      <div>
        <h3 class="font-medium">Error loading accounts</h3>
        <p class="text-sm mt-1 opacity-90">{{ store.error }}</p>
      </div>
      <button @click="store.fetchAccounts()" class="ml-auto text-sm underline hover:text-red-700">Retry</button>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading && store.accounts.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-48 rounded-xl bg-background border border-border shadow-sm animate-pulse flex flex-col p-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="h-12 w-12 rounded-full bg-muted"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-muted rounded w-3/4"></div>
            <div class="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div class="mt-auto space-y-2 pt-4 border-t border-border">
          <div class="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.accounts.length === 0 && !store.loading && !store.error" class="text-center py-20 px-6 rounded-2xl border border-dashed border-border bg-background/50 backdrop-blur-sm">
      <div class="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
        <i class="bi bi-wallet2 text-3xl"></i>
      </div>
      <h3 class="text-lg font-semibold mb-2">{{ t('accounts.no_data') }}</h3>
      <p class="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
        Create your first account to start tracking your balances and transactions.
      </p>
      <button 
        @click="openCreateModal"
        class="inline-flex items-center gap-2 bg-background border border-input px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <i class="bi bi-plus-lg"></i>
        Add Your First Account
      </button>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="account in store.accounts" 
        :key="account.id"
        class="group relative flex flex-col bg-background rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div class="p-6 flex-1 flex flex-col relative z-10">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center gap-3">
              <div 
                class="h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-inner"
                :class="[getTypeInfo(account.type).bg, getTypeInfo(account.type).color]"
              >
                <i :class="['bi', getTypeInfo(account.type).icon]"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold line-clamp-1">{{ account.name }}</h3>
                <p class="text-xs text-muted-foreground">{{ getTypeInfo(account.type).label }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="openEditModal(account)" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Tahrirlash">
                <i class="bi bi-pencil"></i>
              </button>
              <button @click="handleDelete(account.id)" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="O'chirish">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
          
          <div class="mt-auto pt-4 border-t border-border">
            <p class="text-sm text-muted-foreground mb-1">Current Balance</p>
            <div class="text-2xl font-bold tracking-tight text-foreground">
              {{ formatCurrency(account.balance) }}
            </div>
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
        <div v-if="isModalOpen" class="bg-background w-full max-w-md rounded-2xl border border-border shadow-2xl relative">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 rounded-t-2xl">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              {{ editingId ? 'Tahrirlash' : 'Yangi hisob' }}
              <span v-if="editingId && !canEditBalance" class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {{ formatCurrency(newAccount.balance) }}
              </span>
            </h2>
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
              <label for="name" class="text-sm font-medium leading-none">{{ t('accounts.name') }}<span class="text-red-500">*</span>
              </label>
              <input 
                id="name" 
                v-model="newAccount.name" 
                type="text" 
                required
                placeholder="e.g. Main Chase Checking" 
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
              >
            </div>
            
            <div class="space-y-2 relative z-50" style="z-index: 9999;">
              <label class="text-sm font-medium leading-none">
                Account {{ t('transactions.type') }} <span class="text-red-500">*</span>
              </label>
              
              <button 
                type="button"
                @click.stop="isTypeDropdownOpen = !isTypeDropdownOpen"
                class="flex h-auto min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <div class="flex items-center gap-3">
                  <div :class="['w-8 h-8 rounded-md flex items-center justify-center text-lg', getTypeInfo(newAccount.type).bg, getTypeInfo(newAccount.type).color]">
                    <i :class="['bi', getTypeInfo(newAccount.type).icon]"></i>
                  </div>
                  <div class="flex flex-col items-start">
                    <span class="font-medium">{{ getTypeInfo(newAccount.type).label }}</span>
                  </div>
                </div>
                <i class="bi bi-chevron-down text-muted-foreground transition-transform duration-200" :class="{ 'rotate-180': isTypeDropdownOpen }"></i>
              </button>

              <!-- Custom Dropdown Menu -->
              <div v-if="isTypeDropdownOpen" class="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border border-border bg-background shadow-xl p-1 custom-scrollbar">
                <div v-for="cat in accountCategories" :key="cat.category" class="mb-2 last:mb-0">
                  <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/90 sticky top-0 z-10 rounded-sm">
                    {{ cat.category }}
                  </div>
                  <button 
                    v-for="type in cat.types" 
                    :key="type.id"
                    type="button"
                    @click="newAccount.type = type.id; isTypeDropdownOpen = false"
                    class="w-full text-left px-2 py-2 flex items-center gap-3 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    :class="{ 'bg-primary/5': newAccount.type === type.id }"
                  >
                    <div :class="['w-8 h-8 rounded-md flex items-center justify-center text-lg shrink-0', type.bg, type.color]">
                      <i :class="['bi', type.icon]"></i>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-medium text-sm leading-tight">{{ type.label }}</span>
                      <span class="text-xs text-muted-foreground leading-tight">{{ type.desc }}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-2 relative" style="z-index: 1;">
              <div v-if="canEditBalance">
                <label for="balance" class="text-sm font-medium leading-none">{{ t('accounts.balance') }}<span class="text-red-500">*</span>
                </label>
                <div class="relative mt-2">
                  <input 
                    id="balance" 
                    v-model="balanceDisplay"
                    @input="onBalanceInput"
                    type="text"
                    required
                    placeholder="0" 
                    class="flex h-10 w-full rounded-md border border-input bg-background pl-3 pr-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                  >
                  <span class="absolute right-3 top-2.5 text-muted-foreground text-sm font-medium">{{ settingsStore.currency }}</span>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 flex items-center justify-end gap-3 relative" style="z-index: 1;">
              <button 
                type="button" 
                @click="isModalOpen = false"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >{{ t('common.cancel') }}</button>
              <button 
                type="submit" 
                :disabled="isSubmitting || !newAccount.name.trim()"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[100px]"
              >
                <i v-if="isSubmitting" class="bi bi-arrow-repeat animate-spin mr-2"></i>
                {{ isSubmitting ? 'Saqlanmoqda...' : 'Saqlash' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>