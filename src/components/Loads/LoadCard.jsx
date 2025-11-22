import React, { useState } from 'react';
import { Edit, Trash2, DollarSign, ChevronDown, ChevronUp, Truck, MapPin, Phone } from 'lucide-react';
import { getStatusColor } from '../../utils/calculations';

const LoadCard = ({ load, loadPayments = [], driverPhone, onEdit, onDelete, onAddPayment, onDeletePayment }) => {
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
            
            {/* Numéro de téléphone */}
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-600 truncate">
                {driverPhone || 'Non renseigné'}
              </p>
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

          {/* Numéro de téléphone détaillé */}
          <div className="mb-4">
            <p className="text-xs text-gray-500">Téléphone du chauffeur</p>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">
                {driverPhone || 'Non renseigné'}
              </p>
            </div>
          </div>

          {/* Résumé financier avec badge de statut */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
            <div className="grid grid-cols-3 gap-2 text-center mb-2">
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
            
            {/* Indicateur de statut avec explication */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Statut :</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(load.status)}`}>
                  {load.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {load.status === 'Complété' && '✓ Reste ≤ 100 000 FCFA'}
                {load.status === 'En attente' && '⏳ Aucun paiement effectué'}
                {load.status === 'En cours' && '🔄 Paiements en cours'}
              </p>
            </div>
          </div>

          {/* Liste des paiements avec message si vide */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Paiements pour ce chargement ({loadPayments.length})
            </p>
            {loadPayments.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-xs text-yellow-800">Aucun paiement pour ce chargement</p>
                {onAddPayment && (
                  <p className="text-xs text-yellow-600 mt-1">Cliquez sur "Paiement" pour ajouter</p>
                )}
              </div>
            ) : (
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
                      {payment.note && (
                        <p className="text-xs text-gray-400 italic mt-1">{payment.note}</p>
                      )}
                    </div>
                    {onDeletePayment && (
                      <button
                        onClick={() => onDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Supprimer ce paiement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions - Affichés seulement si les fonctions existent */}
          {(onAddPayment || onEdit || onDelete) && (
            <div className="flex gap-2 pt-2">
              {onAddPayment && (
                <button
                  onClick={() => onAddPayment(load)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center gap-1"
                >
                  <DollarSign className="h-4 w-4" />
                  Paiement
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(load)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(load.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              )}
            </div>
          )}

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