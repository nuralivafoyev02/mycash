import { supabase } from '../config/db';
import { AccountRepository } from './accountRepository';

const accountRepository = new AccountRepository();

export class TransactionRepository {
  async findAll() {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, name');
    
    if (accountsError) throw accountsError;

    const accountMap = new Map();
    accounts.forEach(acc => accountMap.set(acc.id, acc));

    const enrichedTransactions = transactions.map((t: any) => ({
      ...t,
      accounts: accountMap.get(t.account_id) || null
    }));

    return enrichedTransactions;
  }

  async findByAccountId(accountId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async create(transactionData: any) {
    const { data, error } = await supabase.from('transactions').insert([transactionData]).select().single();
    if (error) throw error;

    // Update the associated account balance
    const isIncome = data.type === 'income';
    await accountRepository.updateBalance(data.account_id, data.amount, isIncome);

    return data;
  }

  async update(id: string, transactionData: any) {
    // 1. Fetch old transaction
    const { data: oldTx, error: fetchError } = await supabase.from('transactions').select('*').eq('id', id).single();
    if (fetchError) throw fetchError;

    // 2. Revert old transaction from account balance
    const oldIsIncome = oldTx.type === 'income';
    await accountRepository.updateBalance(oldTx.account_id, oldTx.amount, !oldIsIncome);

    // 3. Update transaction
    const { data: updatedTx, error: updateError } = await supabase
      .from('transactions')
      .update(transactionData)
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;

    // 4. Apply new transaction to account balance
    const newIsIncome = updatedTx.type === 'income';
    await accountRepository.updateBalance(updatedTx.account_id, updatedTx.amount, newIsIncome);

    return updatedTx;
  }

  async delete(id: string) {
    // 1. Fetch old transaction
    const { data: oldTx, error: fetchError } = await supabase.from('transactions').select('*').eq('id', id).single();
    if (fetchError) throw fetchError;

    // 2. Revert old transaction from account balance
    const oldIsIncome = oldTx.type === 'income';
    await accountRepository.updateBalance(oldTx.account_id, oldTx.amount, !oldIsIncome);

    // 3. Delete transaction
    const { error: deleteError } = await supabase.from('transactions').delete().eq('id', id);
    if (deleteError) throw deleteError;

    return true;
  }
}
