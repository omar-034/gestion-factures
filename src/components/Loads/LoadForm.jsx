// components/Loads/LoadForm.jsx - Mis à jour avec Marchés
import React, { useEffect } from 'react';
import { destinationsService } from '../../services/destinations.service';

const LoadForm = ({ 
  formData, 
  drivers = [],
  destinations = [],
  marches = [],
  onChange, 
  onSubmit, 
  onCancel, 
  onAddDriver,
  isEditing 
}) => {
  // Calculer automatiquement le montant total
  useEffect(() => {
    const quantite = parseFloat(formData.quantite) || 0;
    const prixParTonne = parseFloat(formData.prixParTonne) || 0;
    const montantTotal = quantite * prixParTonne;
    const currentTotal = parseFloat(formData.totalAmount) || 0;
    
    if (Math.abs(montantTotal - currentTotal) > 0.01) {
      onChange({
        ...formData, 
        totalAmount: montantTotal.toFixed(2)
      });
    }
  }, [formData.quantite, formData.prixParTonne]);

  // Mettre à jour le prix par tonne quand la destination change
  const handleDestinationChange = async (region) => {
    try {
      let prixParTonne = 0;
      
      const destinationFromMemory = destinations.find(d => d.region === region);
      if (destinationFromMemory) {
        prixParTonne = destinationFromMemory.prix_par_tonne;
      } else {
        prixParTonne = await destinationsService.getPrixParTonne(region);
      }
      
      onChange({
        ...formData,
        destination: region,
        prixParTonne: prixParTonne
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du prix:', error);
      onChange({
        ...formData,
        destination: region,
        prixParTonne: 0
      });
    }
  };

  // Fonction pour formater le prix
  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('fr-FR');
  };

  // Obtenir les destinations disponibles pour le marché sélectionné
  const getAvailableDestinations = () => {
    if (!formData.marcheId) {
      return destinations;
    }
    
    const selectedMarche = marches.find(m => m.id === formData.marcheId);
    if (!selectedMarche || !selectedMarche.marche_destinations) {
      return destinations;
    }
    
    // Filtrer les destinations qui font partie du marché
    const marcheDestNames = selectedMarche.marche_destinations.map(d => d.destination);
    return destinations.filter(d => marcheDestNames.includes(d.region));
  };

  const availableDestinations = getAvailableDestinations();
  const marchesActifs = marches.filter(m => m.statut === 'En cours');

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-0">
      {/* En-tête responsive */}
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
        {isEditing ? 'Modifier le Chargement' : 'Nouveau Chargement'}
      </h2>
      
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md space-y-4 sm:space-y-6">
        {/* Sélection du marché (optionnel) */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            <span>📋 Marché associé (optionnel)</span>
          </label>
          <select
            value={formData.marcheId || ''}
            onChange={(e) => {
              const newMarcheId = e.target.value;
              onChange({
                ...formData, 
                marcheId: newMarcheId,
                // Réinitialiser la destination si elle n'est plus valide pour le nouveau marché
                destination: ''
              });
            }}
            className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            <option value="">Aucun marché (chargement indépendant)</option>
            {marchesActifs.map(marche => (
              <option key={marche.id} value={marche.id}>
                {marche.nom} ({marche.reference})
              </option>
            ))}
          </select>
          {formData.marcheId && (
            <p className="text-xs text-blue-600 mt-2">
              ✓ Ce chargement comptera pour l'exécution du marché sélectionné
            </p>
          )}
        </div>

        {/* Sélection du chauffeur */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Nom du Chauffeur *
          </label>
          <select
            value={formData.driverName || ''}
            onChange={(e) => onChange({...formData, driverName: e.target.value})}
            className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            <option value="">Sélectionnez un chauffeur</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.name}>
                {driver.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Pas de chauffeur ? {' '}
            <button 
              onClick={onAddDriver} 
              type="button"
              className="text-blue-600 hover:underline text-sm"
            >
              Ajouter un chauffeur
            </button>
          </p>
        </div>

        {/* Origine et Destination - Grille responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Origine *</label>
            <input
              type="text"
              value={formData.origin || 'Dakar'}
              onChange={(e) => onChange({...formData, origin: e.target.value})}
              className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
              placeholder="Dakar"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Destination * {formData.marcheId && '(selon marché)'}
            </label>
            <select
              value={formData.destination || ''}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              <option value="">Sélectionnez une destination</option>
              {availableDestinations.length === 0 ? (
                <option disabled>
                  {formData.marcheId 
                    ? 'Aucune destination pour ce marché' 
                    : 'Chargement des destinations...'}
                </option>
              ) : (
                availableDestinations.map(dest => (
                  <option key={dest.id} value={dest.region}>
                    {dest.region} - {formatPrice(dest.prix_par_tonne)} FCFA/tonne
                  </option>
                ))
              )}
            </select>
            {formData.marcheId && availableDestinations.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Uniquement les destinations du marché
              </p>
            )}
          </div>
        </div>

        {/* Type de chargement et Quantité - Grille responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Type de Chargement *
            </label>
            <input
              type="text"
              value={formData.typeChargement || ''}
              onChange={(e) => onChange({...formData, typeChargement: e.target.value})}
              className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Ex: Ciment, Sable, Gravier..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Quantité (Tonnes) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.quantite || ''}
              onChange={(e) => onChange({...formData, quantite: e.target.value})}
              className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Ex: 10"
            />
          </div>
        </div>

        {/* Prix par tonne et Montant Total - Grille responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Prix par Tonne (FCFA)
            </label>
            <input
              type="text"
              value={formatPrice(formData.prixParTonne)}
              className="w-full px-3 sm:px-4 py-3 border rounded-lg bg-gray-50 text-gray-600 font-semibold text-base"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Prix fixe selon la destination
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Montant Total (FCFA)
            </label>
            <input
              type="text"
              value={formatPrice(formData.totalAmount)}
              className="w-full px-3 sm:px-4 py-3 border rounded-lg bg-blue-50 text-blue-700 font-bold text-base sm:text-lg"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.quantite && formData.prixParTonne 
                ? `${formData.quantite} × ${formatPrice(formData.prixParTonne)} FCFA`
                : 'Calculé automatiquement'
              }
            </p>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold mb-2">Date *</label>
          <input
            type="date"
            value={formData.date || ''}
            onChange={(e) => onChange({...formData, date: e.target.value})}
            className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Description du Chargement
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => onChange({...formData, description: e.target.value})}
            className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            rows="3"
            placeholder="Détails sur le chargement: point de départ précis, instructions spéciales, etc..."
          />
        </div>

        {/* Récapitulatif */}
        {formData.quantite && formData.destination && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">📋 Récapitulatif</h4>
            <div className="space-y-1 text-xs sm:text-sm">
              {formData.marcheId && (
                <p className="text-blue-600 font-semibold">
                  🏢 Marché: {marches.find(m => m.id === formData.marcheId)?.nom}
                </p>
              )}
              <p><span className="font-semibold">Trajet:</span> {formData.origin} → {formData.destination}</p>
              <p><span className="font-semibold">Type:</span> {formData.typeChargement || 'Non spécifié'}</p>
              <p><span className="font-semibold">Quantité:</span> {formData.quantite} tonnes</p>
              <p><span className="font-semibold">Prix/tonne:</span> {formatPrice(formData.prixParTonne)} FCFA</p>
              <p className="font-bold text-green-700 mt-2 text-sm sm:text-base">
                💰 Total: {formatPrice(formData.totalAmount)} FCFA
              </p>
            </div>
          </div>
        )}

        {/* Boutons d'action - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={onSubmit}
            type="button"
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed text-base touch-button"
            disabled={!formData.driverName || !formData.destination || !formData.quantite || !formData.typeChargement}
          >
            {isEditing ? 'Mettre à jour' : 'Créer le Chargement'}
          </button>
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition font-semibold text-base touch-button"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadForm;