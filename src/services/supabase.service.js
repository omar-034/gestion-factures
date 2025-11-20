// services/supabase.service.js - Mis à jour avec marche_id
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
    console.log('🔵 loadService.create - données reçues:', loadData);
    
    const insertData = {
      driver_name: loadData.driver_name || loadData.driverName,
      load_number: loadData.load_number || loadData.loadNumber,
      origin: loadData.origin,
      destination: loadData.destination,
      type_chargement: loadData.type_chargement || loadData.typeChargement,
      quantite: loadData.quantite ? parseFloat(loadData.quantite) : null,
      prix_par_tonne: (loadData.prix_par_tonne || loadData.prixParTonne) ? 
        parseFloat(loadData.prix_par_tonne || loadData.prixParTonne) : null,
      total_amount: (loadData.total_amount || loadData.totalAmount) ? 
        parseFloat(loadData.total_amount || loadData.totalAmount) : null,
      date: loadData.date,
      description: loadData.description || ''
    };

    // Ajouter marche_id seulement s'il existe et n'est pas vide
    if (loadData.marche_id || loadData.marcheId) {
      insertData.marche_id = loadData.marche_id || loadData.marcheId;
    }

    console.log('🔵 loadService.create - données à insérer:', insertData);

    const { data, error } = await supabase
      .from('loads')
      .insert([insertData])
      .select();
    
    if (error) {
      console.error('❌ Erreur insertion:', error);
      throw error;
    }
    
    console.log('✅ loadService.create - succès:', data);
    return data[0];
  },

  async update(id, loadData) {
    const { data, error } = await supabase
      .from('loads')
      .update({
        driver_name: loadData.driverName || loadData.driver_name,
        marche_id: loadData.marcheId || loadData.marche_id || null,
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
  },

  // Obtenir les chargements d'un marché spécifique
  async getByMarche(marcheId) {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('marche_id', marcheId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
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