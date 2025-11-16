import React, { useState } from 'react';
import { Edit, Trash2, DollarSign, ChevronDown, ChevronUp, Truck, MapPin } from 'lucide-react';

const LoadCard = ({ load, loadPayments = [], onEdit, onDelete, onAddPayment, onDeletePayment }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatNumber = (number) => {
    return Number(number).toLocaleString('fr-FR');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const totalPaid = loadPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const totalAmount = Number(load.total_amount || load.totalAmount || 0);
  const remaining = totalAmount - totalPaid;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Payé': return 'bg-green-100 text-green-800';
      case 'Partiellement payé': return 'bg-yellow-100 text-yellow-800';
      case 'Non payé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* En-tête compact - Toujours visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {load.driver_name || load.driverName}
              </h3>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-600 truncate">
                {load.origin} → {load.destination}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-blue-600">
                  {formatNumber(totalAmount)} FCFA
                </p>
                <p className="text-xs text-gray-500">
                  #{load.load_number || load.loadNumber}
                </p>
              </div>
              
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(load.status)}`}>
                  {load.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(load.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Indicateur d'expansion */}
          <div className="flex flex-col items-end gap-2 ml-3">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Contenu détaillé - Seulement quand expandé */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* Informations détaillées */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Type de chargement</p>
              <p className="text-sm font-medium text-gray-900">
                {load.type_chargement || 'Non spécifié'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Quantité</p>
              <p className="text-sm font-medium text-gray-900">
                {load.quantite ? `${load.quantite} tonnes` : 'Non spécifié'}
              </p>
            </div>
          </div>

          {/* Résumé financier */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold text-gray-900">{formatNumber(totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payé</p>
                <p className="text-sm font-bold text-green-600">{formatNumber(totalPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reste</p>
                <p className="text-sm font-bold text-orange-600">{formatNumber(remaining)}</p>
              </div>
            </div>
          </div>

          {/* Liste des paiements */}
          {loadPayments.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Paiements ({loadPayments.length})</p>
              <div className="space-y-2">
                {loadPayments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatNumber(payment.amount)} FCFA
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(payment.date)} • {payment.payment_method || 'Espèces'}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeletePayment && onDeletePayment(payment.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onAddPayment && onAddPayment(load)}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center gap-1"
            >
              <DollarSign className="h-4 w-4" />
              Paiement
            </button>
            
            <button
              onClick={() => onEdit && onEdit(load)}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </button>
            
            <button
              onClick={() => onDelete && onDelete(load.id)}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center justify-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>

          {/* Description si elle existe */}
          {load.description && (
            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-800">{load.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadCard;