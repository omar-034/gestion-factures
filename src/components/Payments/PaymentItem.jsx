// components/Payments/PaymentItem.jsx
import React from 'react';
import { CreditCard, Trash2 } from 'lucide-react';

const PaymentItem = ({ payment, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <CreditCard size={20} className="text-green-600" />
          <div>
            <p className="font-semibold text-green-900">
              {parseFloat(payment.amount).toFixed(2)} FCFA
            </p>
            <p className="text-sm text-gray-600">
              {new Date(payment.date).toLocaleDateString('fr-FR')} • {' '}
              {payment.payment_method || payment.paymentMethod}
            </p>
            {payment.note && (
              <p className="text-xs text-gray-500 italic mt-1">{payment.note}</p>
            )}
          </div>
        </div>
      </div>
      <button 
        onClick={() => onDelete(payment.id)} 
        className="text-red-600 hover:text-red-800 p-2"
        title="Supprimer le paiement"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default PaymentItem;