// src/services/destinations.service.js
import { supabase } from '../supabaseClient';

// Service des destinations
export const destinationsService = {
  // Récupérer toutes les destinations
  async getAll() {
    try {
      console.log('🔄 destinationsService.getAll() appelé');
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('region', { ascending: true });
      
      if (error) {
        console.error('❌ Erreur Supabase dans getAll:', error);
        throw error;
      }
      
      console.log('✅ destinationsService.getAll() réussi:', data?.length, 'destinations');
      return data || [];
    } catch (error) {
      console.error('💥 Erreur critique dans getAll:', error);
      throw error;
    }
  },

  // Créer une destination
  async create(destinationData) {
    const { data, error } = await supabase
      .from('destinations')
      .insert([destinationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mettre à jour une destination
  async update(id, destinationData) {
    const { data, error } = await supabase
      .from('destinations')
      .update(destinationData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Supprimer une destination
  async delete(id) {
    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Initialiser les destinations
  async seedDestinations(destinationsData) {
    try {
      console.log('🔄 seedDestinations appelé');
      
      // Vérifier si des destinations existent déjà
      const { data: existing } = await supabase
        .from('destinations')
        .select('id')
        .limit(1);

      if (existing && existing.length > 0) {
        console.log('📍 Les destinations existent déjà');
        return;
      }

      // Préparer les données
      const destinationsToInsert = destinationsData.destinations.map(d => ({
        region: d.region,
        ville: d.ville || d.region,
        prix_par_tonne: d.prixParTonne
      }));

      console.log('📤 Données à insérer:', destinationsToInsert);

      // Insérer les destinations
      const { error } = await supabase
        .from('destinations')
        .insert(destinationsToInsert);

      if (error) {
        console.error('❌ Erreur insertion:', error);
        throw error;
      }
      
      console.log('✅ Destinations initialisées avec succès');
    } catch (error) {
      console.error('💥 Erreur seedDestinations:', error);
      throw error;
    }
  },

  // Obtenir le prix par tonne pour une région
  async getPrixParTonne(region) {
    const { data, error } = await supabase
      .from('destinations')
      .select('prix_par_tonne')
      .eq('region', region)
      .single();
    
    if (error) {
      console.error('Erreur getPrixParTonne:', error);
      return 0;
    }
    return data?.prix_par_tonne || 0;
  }
};

// Export par défaut au cas où
export default destinationsService;