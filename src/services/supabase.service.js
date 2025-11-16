import { supabase } from '../supabaseClient';

// Service pour les Chauffeurs
export const driverService = {
  async getAll() {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(driverData) {
    const { error } = await supabase
      .from('drivers')
      .insert([driverData]);
    
    if (error) throw error;
  },

  async update(id, driverData) {
    const { error } = await supabase
      .from('drivers')
      .update(driverData)
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async checkExists(name) {
    const { data } = await supabase
      .from('drivers')
      .select('id')
      .ilike('name', name)
      .single();
    
    return !!data;
  }
};

// Service pour les Chargements
export const loadService = {
  async getAll() {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(loadData) {
    const { error } = await supabase
      .from('loads')
      .insert([loadData]);
    
    if (error) throw error;
  },

  async update(id, loadData) {
    const { error } = await supabase
      .from('loads')
      .update(loadData)
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Service pour les Paiements
export const paymentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(paymentData) {
    const { error } = await supabase
      .from('payments')
      .insert([paymentData]);
    
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};