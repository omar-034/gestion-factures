// services/destinations.service.js
import { supabase } from '../supabaseClient';

export const destinationsService = {
  // Récupérer toutes les destinations
  async getAll() {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('region', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Créer une destination
  async create(destinationData) {
    const { error } = await supabase
      .from('destinations')
      .insert([destinationData]);
    
    if (error) throw error;
  },

  // Mettre à jour une destination
  async update(id, destinationData) {
    const { error } = await supabase
      .from('destinations')
      .update(destinationData)
      .eq('id', id);
    
    if (error) throw error;
  },

  // Supprimer une destination
  async delete(id) {
    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Initialiser les destinations depuis le JSON
  async seedDestinations(destinationsData) {
    try {
      // Vérifier si des destinations existent déjà
      const { data: existing } = await supabase
        .from('destinations')
        .select('id')
        .limit(1);

      if (existing && existing.length > 0) {
        console.log('Les destinations existent déjà');
        return;
      }

      // Insérer toutes les destinations
      const { error } = await supabase
        .from('destinations')
        .insert(destinationsData.destinations.map(d => ({
          region: d.region,
          ville: d.ville,
          prix_par_tonne: d.prixParTonne
        })));

      if (error) throw error;
      console.log('Destinations initialisées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      throw error;
    }
  },

  // Obtenir le prix par tonne pour une destination
  async getPrixParTonne(region) {
    const { data, error } = await supabase
      .from('destinations')
      .select('prix_par_tonne')
      .eq('region', region)
      .single();
    
    if (error) throw error;
    return data?.prix_par_tonne || 0;
  }
};