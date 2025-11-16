// components/Payments/PaymentModal.jsx
import React from 'react';
import { getTotalPaid, getRemainingBalance } from '../../utils/calculations';

const PaymentModal = ({ 
  selectedLoad, 
  payments,
  formData, 
  onChange, 
  onSubmit, 
  onCancel 
}) => {
  if (!selectedLoad) return null;

  const totalPaid = getTotalPaid(selectedLoad.id, payments);
  const remaining = getRemainingBalance(selectedLoad, payments);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* En-tête */}
        <div className="p-6 border-b">
          <h3 className="text-2xl font-bold">Ajouter un Paiement</h3>
          <p className="text-gray-600 mt-2">
            Chargement #{selectedLoad.loadNumber || selectedLoad.load_number} - {' '}
            {selectedLoad.driverName || selectedLoad.driver_name}
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Montant total:</span>
              <span className="font-bold">
                {parseFloat(selectedLoad.totalAmount || selectedLoad.total_amount).toFixed(2)} FCFA
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Déjà payé:</span>
              <span className="font-bold text-green-600">
                {totalPaid.toFixed(2)} FCFA
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-gray-600 font-semibold">Solde restant:</span>
              <span className="font-bold text-orange-600">
                {remaining.toFixed(2)} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Montant du Paiement (FCFA) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => onChange({...formData, amount: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 50000"
              max={remaining}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => onChange({...formData, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Méthode</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => onChange({...formData, paymentMethod: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Espèces">Espèces</option>
                <option value="Virement">Virement</option>
                <option value="Chèque">Chèque</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Note (optionnel)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => onChange({...formData, note: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Remarques sur le paiement..."
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-6 border-t flex gap-4">
          <button
            onClick={onSubmit}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Enregistrer le Paiement
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

export default PaymentModal;