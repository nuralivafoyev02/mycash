<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useTransactionStore } from '../stores/transactionStore';
import { useAccountStore } from '../stores/accountStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useSettingsStore } from '../stores/settingsStore';

const store = useTransactionStore();
const { t } = useI18n();
const accountStore = useAccountStore();
const categoryStore = useCategoryStore();
const settingsStore = useSettingsStore();
const isModalOpen = ref(false);
const editingId = ref<string | null>(null);

const amountDisplay = ref('');
const showExtraInfo = ref(false);
const activeCategoryTab = ref('Turi'); 

const getCurrentDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const newTransaction = ref({ 
  account_id: '', 
  type: 'expense', 
  amount: 0, 
  category: '', 
  date: '',
  description: '' 
});
const isSubmitting = ref(false);

const formatNumberWithSpaces = (value: number | string) => {
  if (!value) return '';
  const num = String(value).replace(/\s/g, '');
  if (isNaN(Number(num))) return String(value);
  return new Intl.NumberFormat('ru-RU').format(Number(num));
};

const onAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const rawValue = target.value.replace(/\s/g, '');
  if (!isNaN(Number(rawValue)) && rawValue !== '') {
    newTransaction.value.amount = Number(rawValue);
    amountDisplay.value = formatNumberWithSpaces(rawValue);
  } else if (rawValue === '') {
    newTransaction.value.amount = 0;
    amountDisplay.value = '';
  } else {
    // Revert to valid display
    amountDisplay.value = formatNumberWithSpaces(newTransaction.value.amount || '');
  }
};

const openTransactionModal = (type: 'income' | 'expense') => {
  editingId.value = null;
  newTransaction.value = { 
    account_id: '', 
    type, 
    amount: 0, 
    category: '', 
    date: getCurrentDateTime(),
    description: '' 
  };
  amountDisplay.value = '';
  showExtraInfo.value = false;
  activeCategoryTab.value = type === 'income' ? 'Daromat turi' : 'Xarajat turi';
  isModalOpen.value = true;
};

const openEditModal = (t: any) => {
  editingId.value = t.id;
  newTransaction.value = { 
    account_id: t.account_id, 
    type: t.type, 
    amount: t.amount, 
    category: t.category, 
    date: t.date ? t.date.slice(0, 16) : (t.created_at ? t.created_at.slice(0, 16) : getCurrentDateTime()),
    description: t.description || '' 
  };
  amountDisplay.value = formatNumberWithSpaces(t.amount);
  
  // Determine if it's a counterparty
  const isCounterparty = categoryStore.counterparties.some(c => c.name === t.category);
  activeCategoryTab.value = isCounterparty ? 'Kontragent' : (t.type === 'income' ? 'Daromat turi' : 'Xarajat turi');
  showExtraInfo.value = !!t.description || !!t.date;
  isModalOpen.value = true;
};

const currentCategories = computed(() => {
  if (activeCategoryTab.value === 'Kontragent') return categoryStore.counterparties.map(c => c.name);
  return newTransaction.value.type === 'income' 
    ? categoryStore.incomeCategories.map(c => c.name) 
    : categoryStore.expenseCategories.map(c => c.name);
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') isModalOpen.value = false;
};

onMounted(() => {
  store.fetchTransactions();
  accountStore.fetchAccounts();
  categoryStore.fetchCategories();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

const handleSubmit = async () => {
  if (!newTransaction.value.account_id || !newTransaction.value.category) return;
  isSubmitting.value = true;
  
  const payload: any = {
    account_id: newTransaction.value.account_id,
    type: newTransaction.value.type as 'income' | 'expense',
    amount: Number(newTransaction.value.amount),
    category: newTransaction.value.category,
    description: newTransaction.value.description,
    date: newTransaction.value.date
  };
  
  let success;
  if (editingId.value) {
    success = await store.updateTransaction(editingId.value, payload);
  } else {
    success = await store.createTransaction(payload);
  }
  
  if (success) {
    isModalOpen.value = false;
    accountStore.fetchAccounts();
    editingId.value = null;
  }
  isSubmitting.value = false;
};

const handleDelete = async (id: string) => {
  if (confirm('Ushbu tranzaksiyani o\'chirib tashlaysizmi?')) {
    const success = await store.deleteTransaction(id);
    if (success) accountStore.fetchAccounts();
  }
};

const getCategoryColor = (categoryName: string) => {
  if (!categoryName) return 'bg-secondary text-secondary-foreground';
  
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300'
  ];
  
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const formatCurrency = (value: number) => {
  // Use ru-RU to get space separated formatting, but append user selected currency
  return new Intl.NumberFormat('ru-RU').format(value) + ' ' + settingsStore.currency;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ru-RU', { 
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('transactions.title') }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">Track your income and expenses across all accounts.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="openTransactionModal('income')"
          class="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-emerald-600 hover:shadow-md transition-all duration-200"
        >
          <i class="bi bi-arrow-down-circle"></i>
          Kirim
        </button>
        <button 
          @click="openTransactionModal('expense')"
          class="inline-flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-rose-600 hover:shadow-md transition-all duration-200"
        >
          <i class="bi bi-arrow-up-circle"></i>
          Chiqim
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-start gap-3">
      <i class="bi bi-exclamation-triangle-fill mt-0.5"></i>
      <div>
        <h3 class="font-medium">Error loading transactions</h3>
        <p class="text-sm mt-1 opacity-90">{{ store.error }}</p>
      </div>
      <button @click="store.fetchTransactions()" class="ml-auto text-sm underline hover:text-red-700">Retry</button>
    </div>

    <!-- Table View -->
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div v-if="store.loading && store.transactions.length === 0" class="p-8 flex justify-center">
        <i class="bi bi-arrow-repeat animate-spin text-3xl text-muted-foreground"></i>
      </div>
      
      <div v-else-if="store.transactions.length === 0 && !store.error" class="text-center py-16 px-6">
        <div class="h-16 w-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i class="bi bi-receipt text-3xl"></i>
        </div>
        <h3 class="text-lg font-semibold mb-2">No transactions yet</h3>
        <p class="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
          Record your first transaction to start analyzing your financial activity.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th scope="col" class="px-6 py-4 font-medium">{{ t('common.date') }}</th>
              <th scope="col" class="px-6 py-4 font-medium">{{ t('transactions.account') }}</th>
              <th scope="col" class="px-6 py-4 font-medium">{{ t('transactions.category') }}</th>
              <th scope="col" class="px-6 py-4 font-medium">{{ t('common.description') }}</th>
              <th scope="col" class="px-6 py-4 font-medium text-right">{{ t('transactions.amount') }}</th>
              <th scope="col" class="px-6 py-4 font-medium text-right w-24">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="transaction in store.transactions" 
              :key="transaction.id"
              class="group border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-muted-foreground">
                {{ formatDate(transaction.date || transaction.created_at) }}
              </td>
              <td class="px-6 py-4 font-medium">
                {{ transaction.accounts?.name || 'Unknown Account' }}
              </td>
              <td class="px-6 py-4">
                <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', getCategoryColor(transaction.category)]">
                  {{ transaction.category }}
                </span>
              </td>
              <td class="px-6 py-4 text-muted-foreground max-w-xs truncate">
                {{ transaction.description || '-' }}
              </td>
              <td class="px-6 py-4 text-right font-semibold whitespace-nowrap">
                <span :class="transaction.type === 'income' ? 'text-green-600' : 'text-foreground'">
                  {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEditModal(transaction)" class="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="Tahrirlash">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button @click="handleDelete(transaction.id)" class="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="O'chirish">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
          <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h2 class="text-lg font-semibold">
              {{ editingId ? 'Tahrirlash' : (newTransaction.type === 'income' ? 'Kirim qo\'shish' : 'Chiqim qo\'shish') }}
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
              <label for="amount" class="text-sm font-medium leading-none">Summa<span class="text-red-500">*</span></label>
              <div class="relative">
                <input 
                  id="amount" 
                  v-model="amountDisplay" 
                  @input="onAmountInput"
                  type="text"
                  required
                  placeholder="0" 
                  class="flex h-10 w-full rounded-md border border-input bg-background pl-3 pr-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                >
                <span class="absolute right-3 top-2.5 text-muted-foreground text-sm font-medium">{{ settingsStore.currency }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <label for="account" class="text-sm font-medium leading-none">Hisob<span class="text-red-500">*</span></label>
              <select 
                id="account" 
                v-model="newTransaction.account_id"
                required
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
              >
                <option value="" disabled>Hisobni tanlang</option>
                <option v-for="account in accountStore.accounts" :key="account.id" :value="account.id">
                  {{ account.name }} ({{ formatCurrency(account.balance) }})
                </option>
              </select>
            </div>

            <!-- Kategoriya / Manba with Tabs -->
            <div class="space-y-3 bg-muted/20 p-3.5 rounded-lg border border-border">
              <label class="text-sm font-medium leading-none">{{ newTransaction.type === 'income' ? 'Kirim manbasi' : 'Chiqim manbasi' }}<span class="text-red-500">*</span></label>
              <div class="relative flex items-center bg-muted/40 p-1 rounded-lg border border-border">
                <div 
                  class="absolute inset-y-1 rounded-md bg-background shadow-sm transition-all duration-300 ease-out"
                  :class="activeCategoryTab === 'Kontragent' ? 'left-[50%] w-[calc(50%-4px)]' : 'left-1 w-[calc(50%-4px)]'"
                ></div>
                <button 
                  type="button" 
                  @click="activeCategoryTab = (newTransaction.type === 'income' ? 'Daromat turi' : 'Xarajat turi')"
                  :class="['relative z-10 w-1/2 py-1.5 text-xs font-medium transition-colors duration-200 rounded-md', activeCategoryTab !== 'Kontragent' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground']"
                >
                  {{ newTransaction.type === 'income' ? 'Daromat turi' : 'Xarajat turi' }}
                </button>
                <button 
                  type="button"
                  @click="activeCategoryTab = 'Kontragent'"
                  :class="['relative z-10 w-1/2 py-1.5 text-xs font-medium transition-colors duration-200 rounded-md', activeCategoryTab === 'Kontragent' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground']"
                >
                  Kontragent
                </button>
              </div>
              <select 
                id="category" 
                v-model="newTransaction.category" 
                required
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
              >
                <option value="" disabled>Tanlang</option>
                <option v-for="cat in currentCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Collapsible Extra Info -->
            <div class="border border-border rounded-lg overflow-hidden bg-background">
              <button 
                type="button" 
                @click="showExtraInfo = !showExtraInfo" 
                class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-sm font-medium text-primary focus-visible:outline-none focus-visible:bg-muted/30"
              >
                Qo'shimcha ma'lumotlar
                <i :class="['bi transition-transform duration-300', showExtraInfo ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </button>
              <div 
                v-show="showExtraInfo" 
                class="p-4 space-y-4 border-t border-border bg-muted/10 transition-all"
              >
                <div class="space-y-2">
                  <label for="date" class="text-sm font-medium leading-none">Vaqt</label>
                  <input 
                    id="date" 
                    v-model="newTransaction.date" 
                    type="datetime-local" 
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                  >
                </div>
                <div class="space-y-2">
                  <label for="description" class="text-sm font-medium leading-none">Izoh <span class="text-muted-foreground font-normal">(Ixtiyoriy)</span></label>
                  <textarea 
                    id="description" 
                    v-model="newTransaction.description" 
                    rows="2"
                    placeholder="Qisqacha izoh yozing" 
                    class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow resize-none"
                  ></textarea>
                </div>
              </div>
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
                :disabled="isSubmitting || !newTransaction.account_id || !newTransaction.category || newTransaction.amount <= 0"
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
