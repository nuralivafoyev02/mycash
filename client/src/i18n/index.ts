import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      accounts: 'Accounts',
      companies: 'Companies',
      users: 'Users',
      settings: 'Settings'
    },
    common: {
      search: 'Search...',
      logout: 'Sign out',
      add: 'Add',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      description: 'Description',
      loading: 'Loading...'
    },
    dashboard: {
      title: 'Dashboard',
      total_balance: 'Total Balance',
      monthly_income: 'Monthly Income',
      monthly_expense: 'Monthly Expense',
      recent_transactions: 'Recent Transactions',
      no_transactions: 'No recent transactions found.',
      system_health: 'System Health',
      income_vs_expense: 'Income vs Expense'
    },
    transactions: {
      title: 'Transactions',
      add_new: 'Add Transaction',
      type: 'Type',
      income: 'Income',
      expense: 'Expense',
      amount: 'Amount',
      category: 'Category',
      account: 'Account',
      select_account: 'Select Account',
      no_data: 'No transactions found.'
    },
    accounts: {
      title: 'Accounts',
      add_new: 'Add Account',
      name: 'Account Name',
      balance: 'Balance',
      currency: 'Currency',
      no_data: 'No accounts found.'
    },
    companies: {
      title: 'Companies',
      add_new: 'Add Company',
      name: 'Company Name',
      industry: 'Industry',
      phone: 'Phone',
      no_data: 'No companies found.'
    },
    users: {
      title: 'Users',
      add_new: 'Add User',
      full_name: 'Full Name',
      email: 'Email',
      role: 'Role',
      password: 'Temporary Password',
      no_data: 'No users found.'
    },
    settings: {
      title: 'Settings',
      desc: 'Manage your profile and application preferences.',
      profile_title: 'Profile Information',
      profile_desc: 'Your personal account details and role.',
      full_name: 'Full Name',
      email: 'Email Address',
      role: 'Role',
      preferences_title: 'Preferences',
      preferences_desc: 'Customize your experience within the application.',
      appearance: 'Appearance',
      appearance_desc: 'Toggle between light and dark mode for the application.',
      lang: 'Language',
      lang_desc: 'Select your preferred language.',
      currency: 'Currency',
      currency_desc: 'Select your preferred currency.',
    }
  },
  uz: {
    nav: {
      dashboard: 'Bosh sahifa',
      transactions: 'Tranzaksiyalar',
      accounts: 'Hisoblar',
      companies: 'Kompaniyalar',
      users: 'Xodimlar',
      settings: 'Sozlamalar'
    },
    common: {
      search: 'Qidirish...',
      logout: 'Chiqish',
      add: 'Qo\'shish',
      save: 'Saqlash',
      cancel: 'Bekor qilish',
      delete: 'O\'chirish',
      edit: 'Tahrirlash',
      actions: 'Harakatlar',
      status: 'Holat',
      date: 'Sana',
      description: 'Izoh',
      loading: 'Yuklanmoqda...'
    },
    dashboard: {
      title: 'Bosh sahifa',
      total_balance: 'Umumiy Balans',
      monthly_income: 'Oylik Daromad',
      monthly_expense: 'Oylik Xarajat',
      recent_transactions: 'So\'nggi Tranzaksiyalar',
      no_transactions: 'Tranzaksiyalar topilmadi.',
      system_health: 'Tizim Holati',
      income_vs_expense: 'Daromad va Xarajat'
    },
    transactions: {
      title: 'Tranzaksiyalar',
      add_new: 'Tranzaksiya Qo\'shish',
      type: 'Turi',
      income: 'Daromad',
      expense: 'Xarajat',
      amount: 'Miqdor',
      category: 'Toifa',
      account: 'Hisob',
      select_account: 'Hisobni tanlang',
      no_data: 'Tranzaksiyalar topilmadi.'
    },
    accounts: {
      title: 'Hisoblar',
      add_new: 'Hisob Qo\'shish',
      name: 'Hisob Nomi',
      balance: 'Balans',
      currency: 'Valyuta',
      no_data: 'Hisoblar topilmadi.'
    },
    companies: {
      title: 'Kompaniyalar',
      add_new: 'Kompaniya Qo\'shish',
      name: 'Kompaniya Nomi',
      industry: 'Soha',
      phone: 'Telefon',
      no_data: 'Kompaniyalar topilmadi.'
    },
    users: {
      title: 'Xodimlar',
      add_new: 'Xodim Qo\'shish',
      full_name: 'To\'liq Ism',
      email: 'Elektron Pochta',
      role: 'Vazifa (Rol)',
      password: 'Vaqtinchalik Parol',
      no_data: 'Xodimlar topilmadi.'
    },
    settings: {
      title: 'Sozlamalar',
      desc: 'Profilingizni va dastur sozlamalarini boshqaring.',
      profile_title: 'Profil Ma\'lumotlari',
      profile_desc: 'Shaxsiy hisob ma\'lumotlaringiz va vazifangiz.',
      full_name: 'To\'liq Ism',
      email: 'Elektron pochta',
      role: 'Vazifa (Rol)',
      preferences_title: 'Afzalliklar',
      preferences_desc: 'Dastur ichidagi tajribangizni moslashtiring.',
      appearance: 'Tungi rejim',
      appearance_desc: 'Dastur uchun yorug\' yoki qorong\'i mavzuni tanlang.',
      lang: 'Til',
      lang_desc: 'O\'zingizga qulay tilni tanlang.',
      currency: 'Asosiy valyuta',
      currency_desc: 'Barcha hisob-kitoblar uchun standart valyuta',
    }
  },
  ru: {
    nav: {
      dashboard: 'Главная',
      transactions: 'Транзакции',
      accounts: 'Счета',
      companies: 'Компании',
      users: 'Сотрудники',
      settings: 'Настройки'
    },
    common: {
      search: 'Поиск...',
      logout: 'Выйти',
      add: 'Добавить',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Изменить',
      actions: 'Действия',
      status: 'Статус',
      date: 'Дата',
      description: 'Описание',
      loading: 'Загрузка...'
    },
    dashboard: {
      title: 'Главная',
      total_balance: 'Общий Баланс',
      monthly_income: 'Доход за месяц',
      monthly_expense: 'Расход за месяц',
      recent_transactions: 'Последние Транзакции',
      no_transactions: 'Транзакции не найдены.',
      system_health: 'Состояние Системы',
      income_vs_expense: 'Доход и Расход'
    },
    transactions: {
      title: 'Транзакции',
      add_new: 'Добавить Транзакцию',
      type: 'Тип',
      income: 'Доход',
      expense: 'Расход',
      amount: 'Сумма',
      category: 'Категория',
      account: 'Счет',
      select_account: 'Выберите Счет',
      no_data: 'Транзакции не найдены.'
    },
    accounts: {
      title: 'Счета',
      add_new: 'Добавить Счет',
      name: 'Название Счета',
      balance: 'Баланс',
      currency: 'Валюта',
      no_data: 'Счета не найдены.'
    },
    companies: {
      title: 'Компании',
      add_new: 'Добавить Компанию',
      name: 'Название Компании',
      industry: 'Отрасль',
      phone: 'Телефон',
      no_data: 'Компании не найдены.'
    },
    users: {
      title: 'Сотрудники',
      add_new: 'Добавить Сотрудника',
      full_name: 'Полное Имя',
      email: 'Электронная Почта',
      role: 'Роль',
      password: 'Временный Пароль',
      no_data: 'Сотрудники не найдены.'
    },
    settings: {
      title: 'Настройки',
      desc: 'Управляйте своим профилем и настройками приложения.',
      profile_title: 'Информация профиля',
      profile_desc: 'Ваши личные данные учетной записи и роль.',
      full_name: 'Полное имя',
      email: 'Электронная почта',
      role: 'Роль',
      preferences_title: 'Предпочтения',
      preferences_desc: 'Настройте работу в приложении.',
      appearance: 'Внешний вид',
      appearance_desc: 'Выбор светлой или темной темы для приложения.',
      lang: 'Язык',
      lang_desc: 'Выберите предпочтительный язык.',
      currency: 'Основная валюта',
      currency_desc: 'Основная валюта для всех расчетов.',
    }
  }
};

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'uz',
  fallbackLocale: 'uz',
  messages,
});
