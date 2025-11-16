// components/Loads/LoadCard.jsx
import React from 'react';
import { Edit2, Trash2, CreditCard } from 'lucide-react';
import PaymentItem from '../Payments/PaymentItem';

const LoadCard = ({ load, loadPayments, onEdit, onDelete, onAddPayment, onDeletePayment }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* En-tête du chargement */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-blue-900">
                Chargement #{load.loadNumber}
              </h3>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                load.status === 'Payé' ? 'bg-green-500 text-white' : 
                load.status === 'Non payé' ? 'bg-red-500 text-white' :
                'bg-yellow-500 text-white'
              }`}>
                {load.status}
              </span>
            </div>
            <p className="text-gray-700 font-semibold">{load.driverName}</p>
            <p className="text-gray-600 text-sm">
              {load.origin} → {load.destination}
              {load.type_chargement && ` • ${load.type_chargement}`}
            </p>
            {load.quantite && (
              <p className="text-blue-600 text-sm font-semibold">
                📦 {load.quantite} tonnes × {parseFloat(load.prix_par_tonne || 0).toLocaleString()} FCFA/tonne
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Date: {new Date(load.date).toLocaleDateString('fr-FR')}
            </p>
            {load.description && (
              <p className="text-gray-600 text-sm mt-2 italic">{load.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onAddPayment(load)} 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
              disabled={load.remaining === 0}
            >
              <CreditCard size={18} />
              Ajouter Paiement
            </button>
            <button 
              onClick={() => onEdit(load)} 
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit2 size={20} />
            </button>
            <button 
              onClick={() => onDelete(load.id)} 
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques du chargement */}
      <div className="px-6 py-4 bg-gray-50 border-y grid grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Montant Total</p>
          <p className="text-lg font-bold text-blue-600">
            {parseFloat(load.totalAmount).toFixed(2)} FCFA
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Total Payé</p>
          <p className="text-lg font-bold text-green-600">
            {load.totalPaid.toFixed(2)} FCFA
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Solde Restant</p>
          <p className="text-lg font-bold text-orange-600">
            {load.remaining.toFixed(2)} FCFA
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Paiements</p>
          <p className="text-lg font-bold text-gray-700">{load.paymentsCount}</p>
        </div>
      </div>

      {/* Historique des paiements */}
      {loadPayments.length > 0 && (
        <div className="p-6">
          <h4 className="font-bold mb-3 text-gray-700">Historique des Paiements</h4>
          <div className="space-y-2">
            {loadPayments.map(payment => (
              <PaymentItem
                key={payment.id}
                payment={payment}
                onDelete={onDeletePayment}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadCard;