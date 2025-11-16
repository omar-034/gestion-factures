import React from 'react';

const LoadForm = ({ 
  formData, 
  drivers,
  onChange, 
  onSubmit, 
  onCancel, 
  onAddDriver,
  isEditing 
}) => {
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
            value={formData.driverName}
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
              value={formData.origin}
              onChange={(e) => onChange({...formData, origin: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Dakar"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Destination *</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => onChange({...formData, destination: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Thiès"
            />
          </div>
        </div>

        {/* Montant et Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Montant Total (FCFA) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => onChange({...formData, totalAmount: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 150000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => onChange({...formData, date: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onChange({...formData, description: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Détails sur le chargement..."
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onSubmit}
            type="button"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
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