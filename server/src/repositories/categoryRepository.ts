import { supabase } from '../config/db';

export class CategoryRepository {
  async findAll() {
    // Get all categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;

    // Get all transactions to calculate totals
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('category, type, amount');
      
    if (txError) throw txError;

    // Calculate totals per category name and type
    const totals = new Map<string, number>();
    
    transactions?.forEach(tx => {
      // Create a unique key for the total: e.g. "income_Sales" or "expense_Salary" or "counterparty_Client"
      // Wait, in transactions, type is just 'income' or 'expense', and category is the string.
      // So total is just by category name.
      const key = `${tx.type}_${tx.category}`;
      totals.set(key, (totals.get(key) || 0) + Number(tx.amount));
    });

    // Attach total to categories based on their name and type
    // A category of type 'income' will look for 'income_NAME' total.
    // A category of type 'expense' will look for 'expense_NAME' total.
    // Counterparties can be in both income and expense, so we'll sum both.
    const enrichedCategories = categories.map(cat => {
      let totalAmount = 0;
      if (cat.type === 'income') {
        totalAmount = totals.get(`income_${cat.name}`) || 0;
      } else if (cat.type === 'expense') {
        totalAmount = totals.get(`expense_${cat.name}`) || 0;
      } else if (cat.type === 'counterparty') {
        totalAmount = (totals.get(`income_${cat.name}`) || 0) + (totals.get(`expense_${cat.name}`) || 0);
      }
      return {
        ...cat,
        total_amount: totalAmount
      };
    });

    return enrichedCategories;
  }

  async create(categoryData: { name: string; type: string; inn?: string; phone?: string; description?: string; company_id?: string }) {
    // If auth is enabled, company_id is handled by DB triggers/RLS, but we can pass it if we have it
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, categoryData: Partial<{ name: string; type: string; inn?: string; phone?: string; description?: string; company_id?: string }>) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}
