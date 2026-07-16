<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useAccountStore } from '../stores/accountStore';
import { useTransactionStore } from '../stores/transactionStore';
import { checkHealth } from '../services/api';
import { useI18n } from 'vue-i18n';

import { useSettingsStore } from '../stores/settingsStore';

const { t } = useI18n();
const accountStore = useAccountStore();
const transactionStore = useTransactionStore();
const settingsStore = useSettingsStore();

const apiStatus = ref('Checking...');

onMounted(async () => {
  try {
    const data = await checkHealth();
    apiStatus.value = `Connected: ${data.message}`;
  } catch (e) {
    apiStatus.value = 'Failed to connect to API';
  }

  accountStore.fetchAccounts();
  transactionStore.fetchTransactions();
});

const totalBalance = computed(() => {
  return accountStore.accounts.reduce((sum, account) => sum + Number(account.balance), 0);
});

const currentMonthIncome = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return transactionStore.transactions
    .filter(t => t.type === 'income')
    .filter(t => {
      const date = new Date(t.date || t.created_at || Date.now());
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

const currentMonthExpense = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return transactionStore.transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const date = new Date(t.date || t.created_at || Date.now());
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ' + settingsStore.currency;
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const recentTransactions = computed(() => {
  return [...transactionStore.transactions].slice(0, 5);
});

// Chart Configuration
const chartOptions = computed(() => {
  // Aggregate both income and expenses by day for the chart
  const incomeByDate: Record<string, number> = {};
  const expensesByDate: Record<string, number> = {};
  const allDates = new Set<string>();

  transactionStore.transactions.forEach(t => {
    const dateStr = new Date(t.date || t.created_at || Date.now()).toISOString().split('T')[0];
    allDates.add(dateStr);
    if (t.type === 'income') {
      incomeByDate[dateStr] = (incomeByDate[dateStr] || 0) + Number(t.amount);
    } else if (t.type === 'expense') {
      expensesByDate[dateStr] = (expensesByDate[dateStr] || 0) + Number(t.amount);
    }
  });

  const sortedDates = Array.from(allDates).sort();
  const categories = sortedDates.length > 0 ? sortedDates : ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];

  return {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      height: 300,
      toolbar: { show: false },
      animations: { enabled: true }
    },
    colors: ['#10b981', '#ef4444'], // Emerald for income, Red for expense
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#64748b' },
        formatter: (value: number) => {
          if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M ' + settingsStore.currency;
          if (value >= 1000) return (value / 1000).toFixed(1) + 'K ' + settingsStore.currency;
          return value + ' ' + settingsStore.currency;
        }
      }
    },
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    tooltip: {
      y: {
        formatter: (value: number) => formatCurrency(value)
      }
    }
  };
});

const series = computed(() => {
  const incomeByDate: Record<string, number> = {};
  const expensesByDate: Record<string, number> = {};
  const allDates = new Set<string>();

  transactionStore.transactions.forEach(t => {
    const dateStr = new Date(t.date || t.created_at || Date.now()).toISOString().split('T')[0];
    allDates.add(dateStr);
    if (t.type === 'income') {
      incomeByDate[dateStr] = (incomeByDate[dateStr] || 0) + Number(t.amount);
    } else if (t.type === 'expense') {
      expensesByDate[dateStr] = (expensesByDate[dateStr] || 0) + Number(t.amount);
    }
  });

  const sortedDates = Array.from(allDates).sort();
  const incomeData = sortedDates.map(date => incomeByDate[date] || 0);
  const expenseData = sortedDates.map(date => expensesByDate[date] || 0);

  return [
    {
      name: t('transactions.income'),
      data: incomeData.length > 0 ? incomeData : [0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: t('transactions.expense'),
      data: expenseData.length > 0 ? expenseData : [0, 0, 0, 0, 0, 0, 0]
    }
  ];
});

</script>

<template>
  <div class="space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('dashboard.title') }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">Welcome back! Here's your financial overview.</p>
      </div>
      <div
        class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium shadow-sm">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            :class="apiStatus.startsWith('Connected') ? 'bg-green-400' : 'bg-red-400'"></span>
          <span class="relative inline-flex rounded-full h-2 w-2"
            :class="apiStatus.startsWith('Connected') ? 'bg-green-500' : 'bg-red-500'"></span>
        </span>
        <span class="text-muted-foreground">{{ apiStatus }}</span>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Balance -->
      <div class="bg-card rounded-xl border border-border shadow-sm p-6 relative overflow-hidden group">
        <div
          class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 transition-transform group-hover:scale-150 duration-500">
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <h3 class="text-sm font-medium text-muted-foreground">{{ t('dashboard.total_balance') }}</h3>
          <div class="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <i class="bi bi-wallet2"></i>
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-3xl font-bold tracking-tight">{{ formatCurrency(totalBalance) }}</div>
          <p class="text-xs text-muted-foreground mt-1">Across all accounts</p>
        </div>
      </div>

      <!-- Income -->
      <div class="bg-card rounded-xl border border-border shadow-sm p-6 relative overflow-hidden group">
        <div
          class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10 transition-transform group-hover:scale-150 duration-500">
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <h3 class="text-sm font-medium text-muted-foreground">{{ t('dashboard.monthly_income') }}</h3>
          <div class="h-8 w-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
            <i class="bi bi-arrow-down-left"></i>
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-3xl font-bold tracking-tight text-foreground">{{ formatCurrency(currentMonthIncome) }}</div>
          <p class="text-xs text-green-600 mt-1 font-medium">+{{ formatCurrency(currentMonthIncome) }} incoming</p>
        </div>
      </div>

      <!-- Expense -->
      <div class="bg-card rounded-xl border border-border shadow-sm p-6 relative overflow-hidden group">
        <div
          class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-500/10 transition-transform group-hover:scale-150 duration-500">
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <h3 class="text-sm font-medium text-muted-foreground">{{ t('dashboard.monthly_expense') }}</h3>
          <div class="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
            <i class="bi bi-arrow-up-right"></i>
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-3xl font-bold tracking-tight text-foreground">{{ formatCurrency(currentMonthExpense) }}</div>
          <p class="text-xs text-red-600 mt-1 font-medium">-{{ formatCurrency(currentMonthExpense) }} outgoing</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Chart Area -->
      <div class="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold">{{ t('dashboard.income_vs_expense') }}</h3>
          <select
            class="bg-muted text-xs rounded-md border-0 py-1.5 pl-3 pr-8 text-muted-foreground focus:ring-1 focus:ring-ring">
            <option>Last 7 days</option>
            <option>This month</option>
            <option>This year</option>
          </select>
        </div>
        <div class="h-[300px] w-full">
          <!-- Client-only component wrapper for ApexCharts to prevent SSR issues -->
          <ClientOnly>
            <VueApexCharts width="100%" height="100%" type="area" ::options="chartOptions" :series="series">
            </VueApexCharts>
          </ClientOnly>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="bg-card rounded-xl border border-border shadow-sm flex flex-col h-[400px]">
        <div class="p-6 border-b border-border flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ t('dashboard.recent_transactions') }}</h3>
          <router-link to="/transactions" class="text-xs text-primary hover:underline font-medium">View
            All</router-link>
        </div>

        <div class="p-0 overflow-y-auto flex-1">
          <div v-if="transactionStore.loading" class="p-8 flex justify-center">
            <i class="bi bi-arrow-repeat animate-spin text-2xl text-muted-foreground"></i>
          </div>

          <div v-else-if="recentTransactions.length === 0"
            class="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
            <i class="bi bi-inbox text-3xl mb-2 opacity-50"></i>
            {{ t('dashboard.no_transactions') }}
          </div>

          <div v-else class="divide-y divide-border">
            <div v-for="transaction in recentTransactions" :key="transaction.id"
              class="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                  :class="transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
                  <i :class="transaction.type === 'income' ? 'bi bi-arrow-down-left' : 'bi bi-arrow-up-right'"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-foreground truncate">{{ transaction.category }}</p>
                  <p class="text-xs text-muted-foreground truncate">
                    {{ formatDate(transaction.date || transaction.created_at) }}
                  </p>
                </div>
              </div>
              <div class="text-right whitespace-nowrap">
                <p class="text-sm font-semibold"
                  :class="transaction.type === 'income' ? 'text-green-600' : 'text-foreground'">
                  {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                </p>
                <p class="text-xs text-muted-foreground truncate">{{ transaction.accounts?.name || 'Account' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
// We need a simple ClientOnly wrapper for VueApexCharts if this is an SSR setup,
// but since it's standard Vite Vue, we might not strictly need it. 
// Adding a simple functional component just in case to match the template.
import { defineComponent, h } from 'vue';

export const ClientOnly = defineComponent({
  name: 'ClientOnly',
  setup(_, { slots }) {
    const isMounted = ref(false);
    onMounted(() => {
      isMounted.value = true;
    });
    return () => (isMounted.value && slots.default ? slots.default() : null);
  }
});
</script>
