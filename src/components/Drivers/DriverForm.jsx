// components/Drivers/DriverForm.jsx
import React from 'react';

const DriverForm = ({ 
  formData, 
  onChange, 
  onSubmit, 
  onCancel, 
  isEditing 
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">
        {isEditing ? 'Modifier le Chauffeur' : 'Nouveau Chauffeur'}
      </h2>
      <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Nom Complet *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Mamadou Diallo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Téléphone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: +221 77 123 45 67"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">N° Permis *</label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => onChange({ ...formData, licenseNumber: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: P123456"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Type de Véhicule</label>
            <input
              type="text"
              value={formData.vehicleType}
              onChange={(e) => onChange({ ...formData, vehicleType: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Camion 10 tonnes"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Plaque d'Immatriculation</label>
            <input
              type="text"
              value={formData.vehiclePlate}
              onChange={(e) => onChange({ ...formData, vehiclePlate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: DK-1234-AB"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Adresse</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onChange({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Parcelles Assainies, Dakar"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Statut</label>
          <select
            value={formData.status}
            onChange={(e) => onChange({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onSubmit}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {isEditing ? 'Mettre à jour' : 'Créer le Chauffeur'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverForm;