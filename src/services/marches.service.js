// src/services/marches.service.js
import { supabase } from '../supabaseClient';

export const marchesService = {
  // Récupérer tous les marchés
  async getAll() {
    const { data, error } = await supabase
      .from('marches')
      .select(`
        *,
        marche_destinations (
          id,
          destination,
          quantite_requise
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Récupérer un marché par ID avec ses statistiques
  async getById(id) {
    const { data, error } = await supabase
      .from('marches')
      .select(`
        *,
        marche_destinations (
          id,
          destination,
          quantite_requise
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Créer un nouveau marché
  async create(marcheData, destinations) {
    try {
      // 1. Créer le marché (gérer les champs optionnels)
      const marchePayload = {
        nom: marcheData.nom,
        reference: marcheData.reference,
        date_debut: marcheData.date_debut,
        statut: marcheData.statut || 'En cours',
        description: marcheData.description || '',
        montant_total: marcheData.montant_total || 0
      };

      // Ajouter date_fin seulement si elle est définie et non vide
      if (marcheData.date_fin && marcheData.date_fin.trim() !== '') {
        marchePayload.date_fin = marcheData.date_fin;
      }

      const { data: marche, error: marcheError } = await supabase
        .from('marches')
        .insert([marchePayload])
        .select()
        .single();

      if (marcheError) throw marcheError;

      // 2. Ajouter les destinations
      if (destinations && destinations.length > 0) {
        const destinationsData = destinations.map(dest => ({
          marche_id: marche.id,
          destination: dest.destination,
          quantite_requise: dest.quantite_requise
        }));

        const { error: destError } = await supabase
          .from('marche_destinations')
          .insert(destinationsData);

        if (destError) throw destError;
      }

      return marche;
    } catch (error) {
      console.error('Erreur création marché:', error);
      throw error;
    }
  },

  // Mettre à jour un marché
  async update(id, marcheData, destinations) {
    try {
      // 1. Préparer les données du marché
      const updatePayload = {
        nom: marcheData.nom,
        reference: marcheData.reference,
        date_debut: marcheData.date_debut,
        statut: marcheData.statut,
        description: marcheData.description || '',
        montant_total: marcheData.montant_total || 0
      };

      // Ajouter date_fin seulement si elle est définie et non vide
      if (marcheData.date_fin && marcheData.date_fin.trim() !== '') {
        updatePayload.date_fin = marcheData.date_fin;
      } else {
        updatePayload.date_fin = null;
      }

      // 2. Mettre à jour le marché
      const { data, error } = await supabase
        .from('marches')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // 3. Si des destinations sont fournies, mettre à jour les destinations
      if (destinations && destinations.length > 0) {
        // Supprimer les anciennes destinations
        const { error: deleteError } = await supabase
          .from('marche_destinations')
          .delete()
          .eq('marche_id', id);
        
        if (deleteError) throw deleteError;

        // Ajouter les nouvelles destinations
        const destinationsData = destinations.map(dest => ({
          marche_id: id,
          destination: dest.destination,
          quantite_requise: dest.quantite_requise
        }));

        const { error: insertError } = await supabase
          .from('marche_destinations')
          .insert(destinationsData);

        if (insertError) throw insertError;
      }

      return data;
    } catch (error) {
      console.error('Erreur update marché:', error);
      throw error;
    }
  },

  // Supprimer un marché
  async delete(id) {
    const { error } = await supabase
      .from('marches')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Ajouter une destination à un marché
  async addDestination(marcheId, destination, quantiteRequise) {
    const { data, error } = await supabase
      .from('marche_destinations')
      .insert([{
        marche_id: marcheId,
        destination: destination,
        quantite_requise: quantiteRequise
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Supprimer une destination d'un marché
  async removeDestination(destinationId) {
    const { error } = await supabase
      .from('marche_destinations')
      .delete()
      .eq('id', destinationId);
    
    if (error) throw error;
  },

  // Obtenir les statistiques d'un marché
  async getStats(marcheId) {
    try {
      // Récupérer le marché et ses destinations
      const marche = await this.getById(marcheId);
      
      // Récupérer les chargements du marché
      const { data: loads, error: loadsError } = await supabase
        .from('loads')
        .select('*')
        .eq('marche_id', marcheId);
      
      if (loadsError) throw loadsError;

      // Calculer les statistiques par destination
      const destinationsStats = marche.marche_destinations.map(dest => {
        const loadsForDest = loads.filter(load => load.destination === dest.destination);
        const quantiteLivree = loadsForDest.length;
        const tauxExecution = dest.quantite_requise > 0 
          ? (quantiteLivree / dest.quantite_requise) * 100 
          : 0;

        return {
          ...dest,
          quantite_livree: quantiteLivree,
          taux_execution: tauxExecution,
          loads: loadsForDest
        };
      });

      // Calculer le taux d'exécution global
      const totalRequis = marche.marche_destinations.reduce((sum, d) => sum + d.quantite_requise, 0);
      const totalLivre = destinationsStats.reduce((sum, d) => sum + d.quantite_livree, 0);
      const tauxExecutionGlobal = totalRequis > 0 ? (totalLivre / totalRequis) * 100 : 0;

      return {
        marche,
        destinations: destinationsStats,
        total_requis: totalRequis,
        total_livre: totalLivre,
        taux_execution_global: tauxExecutionGlobal,
        total_chargements: loads.length
      };
    } catch (error) {
      console.error('Erreur getStats:', error);
      throw error;
    }
  },

  // Obtenir les marchés actifs (En cours)
  async getActive() {
    const { data, error } = await supabase
      .from('marches')
      .select(`
        *,
        marche_destinations (
          id,
          destination,
          quantite_requise
        )
      `)
      .eq('statut', 'En cours')
      .order('date_debut', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};