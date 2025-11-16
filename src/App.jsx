// App.jsx - Version Propre Sans Destinations
import React, { useState, useEffect } from 'react';

// Layout
import Navbar from './Components/Layout/Navbar';

// Dashboard
import Dashboard from './Components/Dashboard/Dashboard';

// Drivers
import DriversList from './Components/Drivers/DriversList';
import DriverForm from './Components/Drivers/DriverForm';

// Loads
import LoadsList from './Components/Loads/LoadsList';
import LoadForm from './Components/Loads/LoadForm';

// Payments
import PaymentModal from './Components/Payments/PaymentModal';

// Services
import { driverService, loadService, paymentService } from './services/supabase.service';

// Utils
import { calculateGlobalStats, getRemainingBalance } from './utils/calculations';

const App = () => {
  // États principaux
  const [loads, setLoads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [view, setView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // États pour la sélection
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Formulaire Chargement - SANS destinations
  const [loadFormData, setLoadFormData] = useState({
    driverName: '',
    origin: '',
    destination: '',
    totalAmount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Formulaire Paiement
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Espèces',
    note: ''
  });

  // Formulaire Chauffeur
  const [driverFormData, setDriverFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    vehicleType: '',
    vehiclePlate: '',
    status: 'Actif',
    address: ''
  });

  // Charger toutes les données au démarrage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [driversData, loadsData, paymentsData] = await Promise.all([
        driverService.getAll(),
        loadService.getAll(),
        paymentService.getAll()
      ]);
      
      setDrivers(driversData || []);
      setLoads(loadsData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      alert('Erreur lors du chargement des données');
    }
  };

  // ========== GESTION DES CHAUFFEURS ==========
  
  const handleDriverSubmit = async () => {
    if (!driverFormData.name || !driverFormData.phone) {
      alert('Veuillez remplir tous les champs obligatoires (Nom, Téléphone)');
      return;
    }

    try {
      if (selectedDriver) {
        await driverService.update(selectedDriver.id, {
          name: driverFormData.name,
          phone: driverFormData.phone,
          license_number: driverFormData.licenseNumber,
          vehicle_type: driverFormData.vehicleType,
          vehicle_plate: driverFormData.vehiclePlate,
          status: driverFormData.status,
          address: driverFormData.address
        });
      } else {
        const exists = await driverService.checkExists(driverFormData.name);
        if (exists) {
          alert('Un chauffeur avec ce nom existe déjà');
          return;
        }

        await driverService.create({
          name: driverFormData.name,
          phone: driverFormData.phone,
          license_number: driverFormData.licenseNumber,
          vehicle_type: driverFormData.vehicleType,
          vehicle_plate: driverFormData.vehiclePlate,
          status: driverFormData.status,
          address: driverFormData.address
        });
      }
      
      await loadAllData();
      resetDriverForm();
      setView('drivers');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement du chauffeur');
    }
  };

  const handleDeleteDriver = async (id, driverName) => {
    const hasLoads = loads.some(load => 
      (load.driver_name || load.driverName) === driverName
    );
    
    if (hasLoads) {
      alert('Impossible de supprimer ce chauffeur car il a des chargements associés.');
      return;
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      return;
    }

    try {
      await driverService.delete(id);
      await loadAllData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du chauffeur');
    }
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setDriverFormData({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.license_number || '',
      vehicleType: driver.vehicle_type || '',
      vehiclePlate: driver.vehicle_plate || '',
      status: driver.status || 'Actif',
      address: driver.address || ''
    });
    setView('driver-form');
  };

  const resetDriverForm = () => {
    setDriverFormData({
      name: '',
      phone: '',
      licenseNumber: '',
      vehicleType: '',
      vehiclePlate: '',
      status: 'Actif',
      address: ''
    });
    setSelectedDriver(null);
  };

  // ========== GESTION DES CHARGEMENTS ==========
  
  const handleLoadSubmit = async () => {
    if (!loadFormData.driverName || !loadFormData.origin || 
        !loadFormData.destination || !loadFormData.totalAmount) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (selectedLoad) {
        // Mise à jour
        await loadService.update(selectedLoad.id, {
          driver_name: loadFormData.driverName,
          origin: loadFormData.origin,
          destination: loadFormData.destination,
          total_amount: parseFloat(loadFormData.totalAmount),
          date: loadFormData.date,
          description: loadFormData.description || ''
        });
      } else {
        // Création
        const nextNumber = loads.length + 1;
        const loadNumber = `CHG${String(nextNumber).padStart(4, '0')}`;
        
        await loadService.create({
          driver_name: loadFormData.driverName,
          load_number: loadNumber,
          origin: loadFormData.origin,
          destination: loadFormData.destination,
          total_amount: parseFloat(loadFormData.totalAmount),
          date: loadFormData.date,
          description: loadFormData.description || ''
        });
      }
      
      await loadAllData();
      resetLoadForm();
      setView('loads');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement du chargement');
    }
  };

  const handleDeleteLoad = async (id) => {
    const hasPayments = payments.some(p => (p.load_id || p.loadId) === id);
    
    if (hasPayments) {
      if (!window.confirm('Ce chargement a des paiements associés. Voulez-vous vraiment le supprimer avec tous ses paiements ?')) {
        return;
      }
    }

    try {
      await loadService.delete(id);
      await loadAllData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du chargement');
    }
  };

  const handleEditLoad = (load) => {
    setSelectedLoad(load);
    setLoadFormData({
      driverName: load.driver_name || load.driverName || '',
      origin: load.origin || '',
      destination: load.destination || '',
      totalAmount: load.total_amount || load.totalAmount || '',
      date: load.date || '',
      description: load.description || ''
    });
    setView('load-form');
  };

  const resetLoadForm = () => {
    setLoadFormData({
      driverName: '',
      origin: '',
      destination: '',
      totalAmount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setSelectedLoad(null);
  };

  // ========== GESTION DES PAIEMENTS ==========
  
  const openPaymentModal = (load) => {
    setSelectedLoad(load);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentFormData.amount || parseFloat(paymentFormData.amount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    const remaining = getRemainingBalance(selectedLoad, payments);
    if (parseFloat(paymentFormData.amount) > remaining) {
      alert(`Le montant ne peut pas dépasser le solde restant de ${remaining.toFixed(2)} FCFA`);
      return;
    }

    try {
      await paymentService.create({
        load_id: selectedLoad.id,
        load_number: selectedLoad.load_number || selectedLoad.loadNumber,
        driver_name: selectedLoad.driver_name || selectedLoad.driverName,
        amount: parseFloat(paymentFormData.amount),
        date: paymentFormData.date,
        payment_method: paymentFormData.paymentMethod,
        note: paymentFormData.note || ''
      });

      await loadAllData();
      setShowPaymentModal(false);
      resetPaymentForm();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement du paiement');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      return;
    }

    try {
      await paymentService.delete(paymentId);
      await loadAllData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du paiement');
    }
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Espèces',
      note: ''
    });
  };

  // ========== CALCUL DES STATISTIQUES ==========
  
  const stats = calculateGlobalStats(loads, drivers, payments);

  // ========== RENDU ==========
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentView={view}
        onViewChange={setView}
        onNewLoad={() => {
          resetLoadForm();
          setView('load-form');
        }}
      />

      <div className="container mx-auto p-4 sm:p-6">
        {/* Dashboard */}
        {view === 'dashboard' && (
          <Dashboard
            loads={loads}
            drivers={drivers}
            payments={payments}
            stats={stats}
          />
        )}

        {/* Liste des Chauffeurs */}
        {view === 'drivers' && (
          <DriversList
            drivers={drivers}
            loads={loads}
            payments={payments}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEdit={handleEditDriver}
            onDelete={handleDeleteDriver}
            onAddNew={() => {
              resetDriverForm();
              setView('driver-form');
            }}
          />
        )}

        {/* Formulaire Chauffeur */}
        {view === 'driver-form' && (
          <DriverForm
            formData={driverFormData}
            onChange={setDriverFormData}
            onSubmit={handleDriverSubmit}
            onCancel={() => {
              resetDriverForm();
              setView('drivers');
            }}
            isEditing={!!selectedDriver}
          />
        )}

        {/* Liste des Chargements */}
        {view === 'loads' && (
          <LoadsList
            loads={loads}
            payments={payments}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEdit={handleEditLoad}
            onDelete={handleDeleteLoad}
            onAddPayment={openPaymentModal}
            onDeletePayment={handleDeletePayment}
          />
        )}

        {/* Formulaire Chargement - SANS destinations */}
        {view === 'load-form' && (
          <LoadForm
            formData={loadFormData}
            drivers={drivers}
            onChange={setLoadFormData}
            onSubmit={handleLoadSubmit}
            onCancel={() => {
              resetLoadForm();
              setView('loads');
            }}
            onAddDriver={() => {
              setView('driver-form');
            }}
            isEditing={!!selectedLoad}
          />
        )}
      </div>

      {/* Modal de Paiement */}
      {showPaymentModal && selectedLoad && (
        <PaymentModal
          selectedLoad={selectedLoad}
          payments={payments}
          formData={paymentFormData}
          onChange={setPaymentFormData}
          onSubmit={handlePaymentSubmit}
          onCancel={() => {
            setShowPaymentModal(false);
            resetPaymentForm();
          }}
        />
      )}
    </div>
  );
};

export default App;