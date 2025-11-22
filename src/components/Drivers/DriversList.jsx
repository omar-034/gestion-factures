// src/components/Drivers/DriversList.jsx - Avec gestion du mode viewer
import React from 'react';
import { Search, Plus, Users } from 'lucide-react';
import DriverCard from './DriverCard';
import { getDriverStats } from '../../utils/calculations';

const DriversList = ({ 
  drivers, 
  loads, 
  payments, 
  searchTerm, 
  onSearchChange, 
  onEdit, 
  onDelete, 
  onAddNew,
  canEdit = true
}) => {
  const driverStats = getDriverStats(drivers, loads, payments);
  const filteredDrivers = driverStats.filter(drv =>
    drv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drv.phone.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Liste des Chauffeurs</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="outline-none"
            />
          </div>
          {canEdit && onAddNew && (
            <button
              onClick={onAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={20} /> Ajouter Chauffeur
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun chauffeur trouvé</p>
          </div>
        ) : (
          filteredDrivers.map(driver => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onEdit={canEdit && onEdit ? onEdit : null}
              onDelete={canEdit && onDelete ? onDelete : null}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DriversList;