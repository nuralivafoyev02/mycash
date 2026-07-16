import { supabase } from '../config/db';

export class CompanyRepository {
  async findAll() {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(companyData: any) {
    const { data, error } = await supabase.from('companies').insert([companyData]).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, companyData: any) {
    const { data, error } = await supabase.from('companies').update(companyData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { data, error } = await supabase.from('companies').delete().eq('id', id).select();
    if (error) throw error;
    return data;
  }
}
