import { supabase } from '../config/db';

export class AccountRepository {
  async findAll() {
    const { data, error } = await supabase.from('accounts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await supabase.from('accounts').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(accountData: any) {
    const { data, error } = await supabase.from('accounts').insert([accountData]).select().single();
    if (error) throw error;
    return data;
  }

  async updateBalance(id: string, amount: number, isIncome: boolean) {
    // We need to fetch the current balance first, since Supabase JS doesn't have an increment/decrement function directly accessible without RPC yet in v2 simple select.
    const { data: currentAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newBalance = isIncome 
      ? Number(currentAccount.balance) + Number(amount)
      : Number(currentAccount.balance) - Number(amount);

    const { data, error } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, accountData: any) {
    const { data, error } = await supabase
      .from('accounts')
      .update(accountData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}
