// src/components/Marches/MarcheForm.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

const MarcheForm = ({ 
  formData, 
  destinations = [],
  allDestinations = [], // Destinations disponibles dans le système
  onChange, 
  onSubmit, 
  onCancel, 
  isEditing 
}) => {
  const [localDestinations, setLocalDestinations] = useState(destinations);
  const [newDest, setNewDest] = useState({ destination: '', quantite_requise: 1 });

  // Initialiser les destinations lors de l'édition
  useEffect(() => {
    if (isEditing && destinations && destinations.length > 0) {
      console.log('📝 Chargement destinations pour édition:', destinations);
      setLocalDestinations(destinations);
    }
  }, [isEditing, destinations]);

  const handleAddDestination = () => {
    if (!newDest.destination || newDest.quantite_requise < 1) {
      alert('Veuillez sélectionner une destination et une quantité valide');
      return;
    }

    // Vérifier si la destination existe déjà
    if (localDestinations.some(d => d.destination === newDest.destination)) {
      alert('Cette destination est déjà ajoutée');
      return;
    }

    setLocalDestinations([...localDestinations, { ...newDest }]);
    setNewDest({ destination: '', quantite_requise: 1 });
  };

  const handleRemoveDestination = (index) => {
    setLocalDestinations(localDestinations.filter((_, i) => i !== index));
  };

  const handleSubmitForm = () => {
    if (localDestinations.length === 0) {
      alert('Veuillez ajouter au moins une destination');
      return;
    }
    
    console.log('📤 Envoi des destinations:', localDestinations);
    onSubmit(localDestinations);
  };

  const formatNumber = (number) => {
    return Number(number).toLocaleString('fr-FR');
  };

  // Calculer le montant total estimé
  const calculateTotalAmount = () => {
    return localDestinations.reduce((sum, dest) => {
      const destData = allDestinations.find(d => d.region === dest.destination);
      if (destData) {
        // Estimation basée sur une quantité moyenne de 10 tonnes par chargement
        return sum + (destData.prix_par_tonne * 10 * dest.quantite_requise);
      }
      return sum;
    }, 0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">
        {isEditing ? 'Modifier le Marché' : 'Nouveau Marché'}
      </h2>
      
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-2">
              Nom du Marché *
            </label>
            <input
              type="text"
              value={formData.nom || ''}
              onChange={(e) => onChange({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Marché Transport Régional 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Référence *
            </label>
            <input
              type="text"
              value={formData.reference || ''}
              onChange={(e) => onChange({ ...formData, reference: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: MRC-2024-001"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Statut
            </label>
            <select
              value={formData.statut || 'En cours'}
              onChange={(e) => onChange({ ...formData, statut: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="Suspendu">Suspendu</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Date de Début *
            </label>
            <input
              type="date"
              value={formData.date_debut || ''}
              onChange={(e) => onChange({ ...formData, date_debut: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Date de Fin (optionnelle)
            </label>
            <input
              type="date"
              value={formData.date_fin || ''}
              onChange={(e) => onChange({ ...formData, date_fin: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Laissez vide si le marché n'a pas de date de fin
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Description du marché, objectifs, contraintes..."
          />
        </div>

        {/* Destinations requises */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="text-blue-600" size={20} />
            Destinations à livrer
          </h3>

          {isEditing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Mode édition :</strong> Les destinations existantes sont chargées. 
                Vous pouvez ajouter de nouvelles destinations ou supprimer des existantes. 
                Les modifications seront enregistrées lors de la sauvegarde.
              </p>
            </div>
          )}

          {/* Formulaire d'ajout de destination */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-2">
                  Destination
                </label>
                <select
                  value={newDest.destination}
                  onChange={(e) => setNewDest({ ...newDest, destination: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez une destination</option>
                  {allDestinations.map(dest => (
                    <option key={dest.id} value={dest.region}>
                      {dest.region} - {formatNumber(dest.prix_par_tonne)} FCFA/tonne
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Nb de chargements
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newDest.quantite_requise}
                    onChange={(e) => setNewDest({ ...newDest, quantite_requise: parseInt(e.target.value) || 1 })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDestination}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des destinations ajoutées */}
          {localDestinations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune destination ajoutée. Ajoutez les destinations à livrer pour ce marché.
            </div>
          ) : (
            <div className="space-y-2">
              {localDestinations.map((dest, index) => {
                const destData = allDestinations.find(d => d.region === dest.destination);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{dest.destination}</p>
                      <p className="text-sm text-gray-600">
                        {dest.quantite_requise} chargement(s) requis
                        {destData && (
                          <span className="ml-2 text-blue-600">
                            • ~{formatNumber(destData.prix_par_tonne * 10 * dest.quantite_requise)} FCFA
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDestination(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Résumé */}
          {localDestinations.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-700 mb-2">📊 Résumé</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Destinations:</p>
                  <p className="font-bold text-lg">{localDestinations.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Chargements totaux:</p>
                  <p className="font-bold text-lg">
                    {localDestinations.reduce((sum, d) => sum + d.quantite_requise, 0)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Montant estimé:</p>
                  <p className="font-bold text-xl text-green-700">
                    {formatNumber(calculateTotalAmount())} FCFA
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Basé sur 10 tonnes/chargement)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleSubmitForm}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!formData.nom || !formData.reference || !formData.date_debut || localDestinations.length === 0}
          >
            {isEditing ? 'Mettre à jour le Marché' : 'Créer le Marché'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarcheForm;