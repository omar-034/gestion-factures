// scripts/initDestinations.js
// Script pour initialiser les destinations dans Supabase

import { supabase } from '../supabaseClient';
import destinationsData from '../data/destinations.json';

const initDestinations = async () => {
  console.log('🚀 Initialisation des destinations...');
  
  try {
    // 1. Vérifier si des destinations existent déjà
    console.log('📊 Vérification des données existantes...');
    const { data: existing, error: checkError } = await supabase
      .from('destinations')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError);
      throw checkError;
    }

    if (existing && existing.length > 0) {
      console.log('⚠️  Des destinations existent déjà dans la base de données.');
      console.log('   Voulez-vous les écraser ? (Modifiez le script pour forcer)');
      return;
    }

    // 2. Préparer les données
    console.log('📝 Préparation des données...');
    const destinationsToInsert = destinationsData.destinations.map(d => ({
      region: d.region,
      ville: d.ville,
      prix_par_tonne: d.prixParTonne
    }));

    console.log(`   ${destinationsToInsert.length} destinations à insérer`);

    // 3. Insérer les destinations
    console.log('💾 Insertion des destinations...');
    const { data, error } = await supabase
      .from('destinations')
      .insert(destinationsToInsert)
      .select();

    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      throw error;
    }

    // 4. Vérification
    console.log('✅ Destinations insérées avec succès !');
    console.log(`   ${data.length} destinations créées`);
    
    // Afficher un résumé
    console.log('\n📋 Résumé des destinations:');
    data.forEach(d => {
      console.log(`   • ${d.region.padEnd(20)} - ${d.prix_par_tonne.toLocaleString()} FCFA/tonne`);
    });

    // 5. Statistiques finales
    const { count } = await supabase
      .from('destinations')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 Total de destinations en base: ${count}`);
    console.log('✨ Initialisation terminée avec succès !');

  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  }
};

// Fonction pour forcer la réinitialisation (utiliser avec précaution)
const forceReinit = async () => {
  console.log('⚠️  ATTENTION: Suppression de toutes les destinations existantes...');
  
  try {
    const { error } = await supabase
      .from('destinations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprime tout

    if (error) throw error;
    
    console.log('🗑️  Destinations supprimées');
    await initDestinations();
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Fonction pour mettre à jour les prix
const updatePrices = async (updates) => {
  console.log('💰 Mise à jour des prix...');
  
  try {
    for (const update of updates) {
      const { error } = await supabase
        .from('destinations')
        .update({ prix_par_tonne: update.prix })
        .eq('region', update.region);

      if (error) throw error;
      console.log(`   ✅ ${update.region}: ${update.prix.toLocaleString()} FCFA/tonne`);
    }
    
    console.log('✅ Mise à jour terminée !');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Exporter les fonctions
export { initDestinations, forceReinit, updatePrices };

// Si exécuté directement (node scripts/initDestinations.js)
if (import.meta.url === `file://${process.argv[1]}`) {
  initDestinations();
}

// Exemples d'utilisation:
// 
// 1. Initialisation normale:
//    import { initDestinations } from './scripts/initDestinations';
//    initDestinations();
//
// 2. Forcer la réinitialisation:
//    import { forceReinit } from './scripts/initDestinations';
//    forceReinit();
//
// 3. Mettre à jour des prix:
//    import { updatePrices } from './scripts/initDestinations';
//    updatePrices([
//      { region: 'Thiès', prix: 20000 },
//      { region: 'Kaolack', prix: 40000 }
//    ]);