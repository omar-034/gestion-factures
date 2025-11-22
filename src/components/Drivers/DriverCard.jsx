// components/Drivers/DriverCard.jsx - Avec gestion du mode viewer
import React from 'react';
import { User, Phone, IdCard, Edit2, Trash2 } from 'lucide-react';

const DriverCard = ({ driver, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{driver.name}</h3>
            <span className={`text-xs px-2 py-1 rounded ${
              driver.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {driver.status}
            </span>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button 
                onClick={() => onEdit(driver)} 
                className="text-blue-600 hover:text-blue-800"
                title="Modifier"
              >
                <Edit2 size={18} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(driver.id, driver.name)} 
                className="text-red-600 hover:text-red-800"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Phone size={16} />
          <span>{driver.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <IdCard size={16} />
          <span>Permis: {driver.licenseNumber || driver.license_number}</span>
        </div>
        {(driver.vehicleType || driver.vehicle_type) && (
          <div className="text-gray-600">
            <span className="font-semibold">Véhicule:</span> {driver.vehicleType || driver.vehicle_type}
            {(driver.vehiclePlate || driver.vehicle_plate) && ` (${driver.vehiclePlate || driver.vehicle_plate})`}
          </div>
        )}
        {driver.address && (
          <div className="text-gray-600">
            <span className="font-semibold">Adresse:</span> {driver.address}
          </div>
        )}
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Chargements:</span>
          <span className="font-bold">{driver.totalLoads}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total:</span>
          <span className="font-bold text-blue-600">{driver.totalAmount.toFixed(0)} FCFA</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Payé:</span>
          <span className="font-bold text-green-600">{driver.totalPaid.toFixed(0)} FCFA</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Restant:</span>
          <span className="font-bold text-orange-600">{driver.remaining.toFixed(0)} FCFA</span>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;