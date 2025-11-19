// components/Layout/Navbar.jsx - Mis à jour avec Marchés
import React, { useState } from 'react';
import { Plus, Menu, X, Home, Users, Package, Briefcase } from 'lucide-react';

const Navbar = ({ currentView, onViewChange, onNewLoad }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home },
    { id: 'marches', label: 'Marchés', icon: Briefcase },
    { id: 'drivers', label: 'Chauffeurs', icon: Users },
    { id: 'loads', label: 'Chargements', icon: Package }
  ];

  const handleNavigation = (view) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Desktop & Tablet Navigation */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Transport Manager</h1>
              <p className="text-xs text-blue-200">Gestion simplifiée</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentView === item.id || currentView.startsWith(item.id)
                      ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                      : 'hover:bg-blue-700 hover:shadow-md'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            
            <button
              onClick={onNewLoad}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl ml-2"
            >
              <Plus size={18} />
              <span className="font-medium">Nouveau</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-blue-700 rounded-lg transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fadeIn">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    currentView === item.id || currentView.startsWith(item.id)
                      ? 'bg-white text-blue-600 shadow-lg' 
                      : 'bg-blue-700 hover:bg-blue-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            
            <button
              onClick={() => {
                onNewLoad();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-500 rounded-lg hover:bg-green-600 transition shadow-lg"
            >
              <Plus size={20} />
              <span className="font-medium">Nouveau Chargement</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;