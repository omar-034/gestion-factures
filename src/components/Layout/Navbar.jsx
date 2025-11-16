// components/Layout/Navbar.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const Navbar = ({ currentView, onViewChange, onNewLoad }) => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion Factures Transport</h1>
        <div className="flex gap-4">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-4 py-2 rounded transition ${
              currentView === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-500'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onViewChange('drivers')}
            className={`px-4 py-2 rounded transition ${
              currentView === 'drivers' ? 'bg-blue-700' : 'hover:bg-blue-500'
            }`}
          >
            Chauffeurs
          </button>
          <button
            onClick={() => onViewChange('loads')}
            className={`px-4 py-2 rounded transition ${
              currentView === 'loads' ? 'bg-blue-700' : 'hover:bg-blue-500'
            }`}
          >
            Chargements
          </button>
          <button
            onClick={onNewLoad}
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition flex items-center gap-2"
          >
            <Plus size={20} /> Nouveau Chargement
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;