
// components/Loads/LoadForm.jsx
import React, { useEffect } from 'react';

const LoadForm = ({ 
  formData, 
  drivers = [],
  destinations = [],
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
    
    // Ne mettre à jour que si le calcul est différent (évite les boucles infinies)
    if (Math.abs(montantTotal - currentTotal) > 0.01) {
      onChange({
        ...formData, 
        totalAmount: montantTotal.toFixed(2)
      });
    }
  }, [formData.quantite, formData.prixParTonne]); // Ne pas inclure formData complet

  // Mettre à jour le prix par tonne quand la destination change
  const handleDestinationChange = (region) => {
    const destination = destinations.find(d => d.region === region);
    const prixParTonne = destination ? destination.prix_par_tonne : 0;
    
    onChange({
      ...formData,
      destination: region,
      prixParTonne: prixParTonne
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">
        {isEditing ? 'Modifier le Chargement' : 'Nouveau Chargement'}
      </h2>
      <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
        {/* Sélection du chauffeur */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Nom du Chauffeur *
          </label>
          <select
            value={formData.driverName || ''}
            onChange={(e) => onChange({...formData, driverName: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="text-blue-600 hover:underline"
            >
              Ajouter un chauffeur
            </button>
          </p>
        </div>

        {/* Origine et Destination */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Origine *</label>
            <input
              type="text"
              value={formData.origin || 'Dakar'}
              onChange={(e) => onChange({...formData, origin: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="Dakar"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Destination *</label>
            <select
              value={formData.destination || ''}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionnez une destination</option>
              {destinations.length === 0 ? (
                <option disabled>Chargement des destinations...</option>
              ) : (
                destinations.map(dest => (
                  <option key={dest.id} value={dest.region}>
                    {dest.region} - {(dest.prix_par_tonne || 0).toLocaleString()} FCFA/tonne
                  </option>
                ))
              )}
            </select>
            {destinations.length === 0 && (
              <p className="text-xs text-orange-500 mt-1">
                ⚠️ Les destinations ne sont pas encore chargées. Vérifiez la base de données.
              </p>
            )}
          </div>
        </div>

        {/* Type de chargement et Quantité */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Type de Chargement *
            </label>
            <input
              type="text"
              value={formData.typeChargement || ''}
              onChange={(e) => onChange({...formData, typeChargement: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 10"
            />
          </div>
        </div>

        {/* Prix par tonne et Montant Total */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Prix par Tonne (FCFA)
            </label>
            <input
              type="number"
              value={formData.prixParTonne || 0}
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Calculé automatiquement selon la destination
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Montant Total (FCFA)
            </label>
            <input
              type="number"
              value={formData.totalAmount || 0}
              className="w-full px-4 py-2 border rounded-lg bg-blue-50 text-blue-700 font-bold"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.quantite && formData.prixParTonne 
                ? `${formData.quantite} × ${parseFloat(formData.prixParTonne || 0).toLocaleString()} FCFA`
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Détails sur le chargement: point de départ précis, instructions spéciales, etc..."
          />
        </div>

        {/* Récapitulatif */}
        {formData.quantite && formData.destination && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-700 mb-2">📋 Récapitulatif</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Trajet:</span> {formData.origin} → {formData.destination}</p>
              <p><span className="font-semibold">Type:</span> {formData.typeChargement || 'Non spécifié'}</p>
              <p><span className="font-semibold">Quantité:</span> {formData.quantite} tonnes</p>
              <p><span className="font-semibold">Prix/tonne:</span> {parseFloat(formData.prixParTonne || 0).toLocaleString()} FCFA</p>
              <p className="text-lg font-bold text-green-700 mt-2">
                💰 Total: {parseFloat(formData.totalAmount || 0).toLocaleString()} FCFA
              </p>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onSubmit}
            type="button"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!formData.driverName || !formData.destination || !formData.quantite || !formData.typeChargement}
          >
            {isEditing ? 'Mettre à jour' : 'Créer le Chargement'}
          </button>
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadForm;
