const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/views');

const filesToTranslate = {
  'TransactionsView.vue': {
    "<h1>Transactions</h1>": "<h1 class=\"text-3xl font-bold tracking-tight text-foreground\">{{ t('transactions.title') }}</h1>",
    "Add Transaction": "{{ t('transactions.add_new') }}",
    "Type": "{{ t('transactions.type') }}",
    "Income": "{{ t('transactions.income') }}",
    "Expense": "{{ t('transactions.expense') }}",
    "Amount": "{{ t('transactions.amount') }}",
    "Category": "{{ t('transactions.category') }}",
    "Account": "{{ t('transactions.account') }}",
    "Select Account": "{{ t('transactions.select_account') }}",
    "No transactions found": "{{ t('transactions.no_data') }}",
    "Description": "{{ t('common.description') }}",
    "Date": "{{ t('common.date') }}",
    "Actions": "{{ t('common.actions') }}",
    "Save": "{{ t('common.save') }}",
    "Cancel": "{{ t('common.cancel') }}"
  },
  'AccountsView.vue': {
    "Accounts": "{{ t('accounts.title') }}",
    "Add Account": "{{ t('accounts.add_new') }}",
    "Account Name": "{{ t('accounts.name') }}",
    "Initial Balance": "{{ t('accounts.balance') }}",
    "Currency": "{{ t('accounts.currency') }}",
    "No accounts found": "{{ t('accounts.no_data') }}",
    "Save": "{{ t('common.save') }}",
    "Cancel": "{{ t('common.cancel') }}"
  },
  'CompaniesView.vue': {
    "Companies": "{{ t('companies.title') }}",
    "Add Company": "{{ t('companies.add_new') }}",
    "Company Name": "{{ t('companies.name') }}",
    "Industry": "{{ t('companies.industry') }}",
    "Phone": "{{ t('companies.phone') }}",
    "Status": "{{ t('common.status') }}",
    "No companies found": "{{ t('companies.no_data') }}",
    "Save": "{{ t('common.save') }}",
    "Cancel": "{{ t('common.cancel') }}"
  },
  'UsersView.vue': {
    "Users": "{{ t('users.title') }}",
    "Add User": "{{ t('users.add_new') }}",
    "Add New User": "{{ t('users.add_new') }}",
    "Full Name": "{{ t('users.full_name') }}",
    "Email Address": "{{ t('users.email') }}",
    "Temporary Password": "{{ t('users.password') }}",
    "Role": "{{ t('users.role') }}",
    "No users found": "{{ t('users.no_data') }}",
    "Cancel": "{{ t('common.cancel') }}"
  }
};

for (const [filename, replacements] of Object.entries(filesToTranslate)) {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add i18n import if missing
  if (!content.includes("import { useI18n }")) {
    content = content.replace(/import { ref/g, "import { useI18n } from 'vue-i18n';\nimport { ref");
    content = content.replace(/(const store = [^;]+;)/, "$1\nconst { t } = useI18n();");
  }

  // Handle specific text replacements
  for (const [key, value] of Object.entries(replacements)) {
    // Replace text nodes inside elements (simple regex)
    const regex = new RegExp(`>\\s*${key}\\s*<`, 'g');
    content = content.replace(regex, `>${value}<`);
    
    // Some strings might not have closing tags right after (like span wrapping asterisk)
    // We can also just do global replacement for exact text but it's risky
  }
  
  // Custom manual replacements for headers which might not match exact />\s*text\s*</
  content = content.replace(/<h1[^>]*>Transactions<\/h1>/, `<h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('transactions.title') }}</h1>`);
  content = content.replace(/<h1[^>]*>Accounts<\/h1>/, `<h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('accounts.title') }}</h1>`);
  content = content.replace(/<h1[^>]*>Companies<\/h1>/, `<h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('companies.title') }}</h1>`);
  content = content.replace(/<h1[^>]*>Users<\/h1>/, `<h1 class="text-3xl font-bold tracking-tight text-foreground">{{ t('users.title') }}</h1>`);

  // Fix buttons
  content = content.replace(/Add Transaction/g, `{{ t('transactions.add_new') }}`);
  content = content.replace(/Add Account/g, `{{ t('accounts.add_new') }}`);
  content = content.replace(/Add Company/g, `{{ t('companies.add_new') }}`);
  content = content.replace(/Add User/g, `{{ t('users.add_new') }}`);
  content = content.replace(/Add New User/g, `{{ t('users.add_new') }}`);
  content = content.replace(/>\s*Cancel\s*</g, `>{{ t('common.cancel') }}<`);
  content = content.replace(/>\s*Save\s*</g, `>{{ t('common.save') }}<`);

  // Form labels and inputs
  content = content.replace(/Type\s*</g, `{{ t('transactions.type') }} <`);
  content = content.replace(/Amount\s*</g, `{{ t('transactions.amount') }} <`);
  content = content.replace(/Category\s*</g, `{{ t('transactions.category') }} <`);
  content = content.replace(/Account Name\s*</g, `{{ t('accounts.name') }} <`);
  content = content.replace(/Initial Balance\s*</g, `{{ t('accounts.balance') }} <`);
  content = content.replace(/Currency\s*</g, `{{ t('accounts.currency') }} <`);
  content = content.replace(/Company Name\s*</g, `{{ t('companies.name') }} <`);
  content = content.replace(/Industry\s*</g, `{{ t('companies.industry') }} <`);
  content = content.replace(/Phone\s*</g, `{{ t('companies.phone') }} <`);
  content = content.replace(/Full Name\s*</g, `{{ t('users.full_name') }} <`);
  content = content.replace(/Email Address\s*</g, `{{ t('users.email') }} <`);
  content = content.replace(/Temporary Password\s*</g, `{{ t('users.password') }} <`);
  content = content.replace(/Role\s*</g, `{{ t('users.role') }} <`);

  fs.writeFileSync(filePath, content);
}
console.log("Done");
