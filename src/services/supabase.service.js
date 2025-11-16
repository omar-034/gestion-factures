import { supabase } from '../supabaseClient';

// Service des chauffeurs
export const driverService = {
  async getAll() {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async create(driverData) {
    const { data, error } = await supabase
      .from('drivers')
      .insert([driverData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, driverData) {
    const { data, error } = await supabase
      .from('drivers')
      .update(driverData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async checkExists(name) {
    const { data, error } = await supabase
      .from('drivers')
      .select('id')
      .eq('name', name)
      .single();
    return !!data;
  }
};

// Service des chargements
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
    const { data, error } = await supabase
      .from('loads')
      .insert([{
        driver_name: loadData.driverName || loadData.driver_name,
        load_number: loadData.loadNumber || loadData.load_number,
        origin: loadData.origin,
        destination: loadData.destination,
        type_chargement: loadData.typeChargement || loadData.type_chargement,
        quantite: loadData.quantite ? parseFloat(loadData.quantite) : null,
        prix_par_tonne: loadData.prixParTonne || loadData.prix_par_tonne ? parseFloat(loadData.prixParTonne || loadData.prix_par_tonne) : null,
        total_amount: loadData.totalAmount || loadData.total_amount ? parseFloat(loadData.totalAmount || loadData.total_amount) : null,
        date: loadData.date,
        description: loadData.description || ''
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, loadData) {
    const { data, error } = await supabase
      .from('loads')
      .update({
        driver_name: loadData.driverName || loadData.driver_name,
        origin: loadData.origin,
        destination: loadData.destination,
        type_chargement: loadData.typeChargement || loadData.type_chargement,
        quantite: loadData.quantite ? parseFloat(loadData.quantite) : null,
        prix_par_tonne: loadData.prixParTonne || loadData.prix_par_tonne ? parseFloat(loadData.prixParTonne || loadData.prix_par_tonne) : null,
        total_amount: loadData.totalAmount || loadData.total_amount ? parseFloat(loadData.totalAmount || loadData.total_amount) : null,
        date: loadData.date,
        description: loadData.description || ''
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Service des paiements
export const paymentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(paymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        load_id: paymentData.load_id,
        load_number: paymentData.load_number,
        driver_name: paymentData.driver_name,
        amount: parseFloat(paymentData.amount),
        date: paymentData.date,
        payment_method: paymentData.payment_method,
        note: paymentData.note || ''
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};