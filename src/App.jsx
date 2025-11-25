// App.jsx - Version avec authentification et gestion des rôles
import React, { useState, useEffect } from 'react';

// Auth
import Login from './components/Auth/Login';
import { authService } from './services/auth.service';

// Layout
import Navbar from './components/Layout/Navbar';

// Dashboard
import Dashboard from './components/Dashboard/Dashboard';

// Drivers
import DriversList from './components/Drivers/DriversList';
import DriverForm from './components/Drivers/DriverForm';

// Loads
import LoadsList from './components/Loads/LoadsList';
import LoadForm from './components/Loads/LoadForm';

// Payments
import PaymentModal from './components/Payments/PaymentModal';

// Marchés
import MarchesList from './components/Marches/MarchesList';
import MarcheForm from './components/Marches/MarcheForm';
import MarcheDetails from './components/Marches/MarcheDetails';

// Initialisation
import InitDestinations from './components/InitDestinations';

// Services
import { driverService, loadService, paymentService } from './services/supabase.service';
import { marchesService } from './services/marches.service';

// Hooks
import { useDestinations } from './hooks/useDestinations';

// Utils
import { calculateGlobalStats, getRemainingBalance } from './utils/calculations';

// Données de secours
import { fallbackDestinations } from './data/fallbackDestinations';

const App = () => {
  // États d'authentification
  const [authState, setAuthState] = useState({
    user: null,
    role: null,
    loading: true
  });

  // États principaux
  const [loads, setLoads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [marches, setMarches] = useState([]);
  const [view, setView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // États pour la sélection
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedMarche, setSelectedMarche] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Hook pour les destinations
  const { 
    destinations, 
    loading: destinationsLoading, 
    error: destinationsError, 
    isEmpty: destinationsEmpty,
    refetch: refetchDestinations 
  } = useDestinations();

  // État pour l'initialisation
  const [showInitModal, setShowInitModal] = useState(false);

  // Utiliser les données de secours si la table est vide
  const actualDestinations = destinations.length > 0 ? destinations : fallbackDestinations;

  // Formulaire Chargement
  const [loadFormData, setLoadFormData] = useState({
    driverName: '',
    marcheId: '',
    origin: 'Dakar',
    destination: '',
    typeChargement: '',
    quantite: '',
    prixParTonne: 0,
    totalAmount: 0,
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

  // Formulaire Marché
  const [marcheFormData, setMarcheFormData] = useState({
    nom: '',
    reference: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: null,
    statut: 'En cours',
    description: '',
    montant_total: 0
  });

  // Vérifier la session au démarrage
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      if (session) {
        setAuthState({
          user: session.user,
          role: session.role,
          loading: false
        });
      } else {
        setAuthState({
          user: null,
          role: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Erreur vérification session:', error);
      setAuthState({
        user: null,
        role: null,
        loading: false
      });
    }
  };

  // Charger toutes les données quand l'utilisateur est connecté
  useEffect(() => {
    if (authState.user) {
      loadAllData();
    }
  }, [authState.user]);

  // Afficher la modal d'initialisation si la table destinations est vide
  useEffect(() => {
    if (authState.user && !destinationsLoading && destinationsEmpty && destinations.length === 0) {
      setShowInitModal(true);
    }
  }, [authState.user, destinationsLoading, destinationsEmpty, destinations.length]);

  const loadAllData = async () => {
    try {
      const [driversData, loadsData, paymentsData, marchesData] = await Promise.all([
        driverService.getAll(),
        loadService.getAll(),
        paymentService.getAll(),
        marchesService.getAll()
      ]);
      
      setDrivers(driversData || []);
      setLoads(loadsData || []);
      setPayments(paymentsData || []);
      setMarches(marchesData || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      alert('Erreur lors du chargement des données');
    }
  };

  const handleInitialized = async () => {
    setShowInitModal(false);
    await refetchDestinations();
    await loadAllData();
  };

  // Fonction de connexion
  const handleLogin = async (email, password) => {
    try {
      const { user, role } = await authService.login(email, password);
      setAuthState({
        user,
        role,
        loading: false
      });
    } catch (error) {
      throw error;
    }
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await authService.logout();
      setAuthState({
        user: null,
        role: null,
        loading: false
      });
      // Réinitialiser les données
      setLoads([]);
      setPayments([]);
      setDrivers([]);
      setMarches([]);
      setView('dashboard');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // Vérifier si l'utilisateur peut modifier
  const canEdit = () => {
    return authState.role === 'admin';
  };

  // ========== GESTION DES MARCHÉS ==========
  
  const handleMarcheSubmit = async (destinations) => {
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

    if (!marcheFormData.nom || !marcheFormData.reference || !marcheFormData.date_debut) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (selectedMarche) {
        await marchesService.update(selectedMarche.id, marcheFormData, destinations);
      } else {
        await marchesService.create(marcheFormData, destinations);
      }
      
      await loadAllData();
      resetMarcheForm();
      setView('marches');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement du marché: ' + error.message);
    }
  };

  const handleDeleteMarche = async (id) => {
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

    const hasLoads = loads.some(load => load.marche_id === id);
    
    if (hasLoads) {
      if (!window.confirm('Ce marché a des chargements associés. Voulez-vous vraiment le supprimer ?')) {
        return;
      }
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce marché ?')) {
      return;
    }

    try {
      await marchesService.delete(id);
      await loadAllData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du marché');
    }
  };

  const handleEditMarche = (marche) => {
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

    setSelectedMarche(marche);
    setMarcheFormData({
      nom: marche.nom,
      reference: marche.reference,
      date_debut: marche.date_debut,
      date_fin: marche.date_fin || null,
      statut: marche.statut,
      description: marche.description || '',
      montant_total: marche.montant_total || 0
    });
    setView('marche-form');
  };

  const handleViewMarcheDetails = (marche) => {
    setSelectedMarche(marche);
    setView('marche-details');
  };

  const resetMarcheForm = () => {
    setMarcheFormData({
      nom: '',
      reference: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: null,
      statut: 'En cours',
      description: '',
      montant_total: 0
    });
    setSelectedMarche(null);
  };

  // ========== GESTION DES CHARGEMENTS ==========
  
  const handleLoadSubmit = async () => {
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

    if (!loadFormData.driverName || !loadFormData.destination || 
        !loadFormData.typeChargement || !loadFormData.quantite) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (selectedLoad) {
        const updateData = {
          driver_name: loadFormData.driverName,
          marche_id: loadFormData.marcheId || null,
          origin: loadFormData.origin,
          destination: loadFormData.destination,
          type_chargement: loadFormData.typeChargement,
          quantite: parseFloat(loadFormData.quantite),
          prix_par_tonne: parseFloat(loadFormData.prixParTonne),
          total_amount: parseFloat(loadFormData.totalAmount),
          date: loadFormData.date,
          description: loadFormData.description || ''
        };
        await loadService.update(selectedLoad.id, updateData);
      } else {
        // Trouve le plus grand numéro existant
        const existingNumbers = loads
          .map(l => {
            const num = (l.load_number || l.loadNumber || '').replace('CHG', '');
            return parseInt(num) || 0;
          })
          .filter(n => !isNaN(n));

        const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        const nextNumber = maxNumber + 1;
        const loadNumber = `CHG${String(nextNumber).padStart(4, '0')}`;
        
        const createData = {
          driver_name: loadFormData.driverName,
          marche_id: loadFormData.marcheId || null,
          load_number: loadNumber,
          origin: loadFormData.origin,
          destination: loadFormData.destination,
          type_chargement: loadFormData.typeChargement,
          quantite: parseFloat(loadFormData.quantite),
          prix_par_tonne: parseFloat(loadFormData.prixParTonne),
          total_amount: parseFloat(loadFormData.totalAmount),
          date: loadFormData.date,
          description: loadFormData.description || ''
        };
        await loadService.create(createData);
      }
      
      await loadAllData();
      resetLoadForm();
      setView('loads');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement du chargement: ' + error.message);
    }
  };

  const handleDeleteLoad = async (id) => {
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

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
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

    setSelectedLoad(load);
    setLoadFormData({
      driverName: load.driver_name || load.driverName || '',
      marcheId: load.marche_id || '',
      origin: load.origin || 'Dakar',
      destination: load.destination || '',
      typeChargement: load.type_chargement || '',
      quantite: load.quantite || '',
      prixParTonne: load.prix_par_tonne || 0,
      totalAmount: load.total_amount || load.totalAmount || 0,
      date: load.date || new Date().toISOString().split('T')[0],
      description: load.description || ''
    });
    setView('load-form');
  };

  const resetLoadForm = () => {
    setLoadFormData({
      driverName: '',
      marcheId: '',
      origin: 'Dakar',
      destination: '',
      typeChargement: '',
      quantite: '',
      prixParTonne: 0,
      totalAmount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setSelectedLoad(null);
  };

  // ========== GESTION DES CHAUFFEURS ==========
  
  const handleDriverSubmit = async () => {
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

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
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

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
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

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

  // ========== GESTION DES PAIEMENTS ==========
  
  const openPaymentModal = (load) => {
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

    setSelectedLoad(load);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

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
    if (!canEdit()) {
      alert('Vous n\'avez pas les permissions pour effectuer cette action');
      return;
    }

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

  // ========== AFFICHAGE PENDANT LE CHARGEMENT ==========
  
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // ========== AFFICHAGE CONNEXION ==========
  
  if (!authState.user) {
    return <Login onLogin={handleLogin} />;
  }

  // ========== RENDU PRINCIPAL ==========
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentView={view}
        onViewChange={setView}
        onNewLoad={() => {
          if (!canEdit()) {
            alert('Vous n\'avez pas les permissions pour effectuer cette action');
            return;
          }
          resetLoadForm();
          setView('load-form');
        }}
        onLogout={handleLogout}
        userName={authState.user.email}
        userRole={authState.role}
      />

      <div className="container mx-auto p-4 sm:p-6">
        {/* Dashboard */}
        {view === 'dashboard' && (
          <Dashboard
            loads={loads}
            drivers={drivers}
            payments={payments}
            stats={stats}
            onViewMarcheDetails={handleViewMarcheDetails}
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
            onEdit={canEdit() ? handleEditDriver : null}
            onDelete={canEdit() ? handleDeleteDriver : null}
            onAddNew={canEdit() ? () => {
              resetDriverForm();
              setView('driver-form');
            } : null}
            canEdit={canEdit()}
          />
        )}

        {/* Formulaire Chauffeur */}
        {view === 'driver-form' && canEdit() && (
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
            drivers={drivers}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEdit={canEdit() ? handleEditLoad : null}
            onDelete={canEdit() ? handleDeleteLoad : null}
            onAddPayment={canEdit() ? openPaymentModal : null}
            onDeletePayment={canEdit() ? handleDeletePayment : null}
            canEdit={canEdit()}
          />
        )}

        {/* Formulaire Chargement */}
        {view === 'load-form' && canEdit() && (
          <LoadForm
            formData={loadFormData}
            drivers={drivers}
            destinations={actualDestinations}
            marches={marches}
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

        {/* Liste des Marchés */}
        {view === 'marches' && (
          <MarchesList
            onEdit={canEdit() ? handleEditMarche : null}
            onDelete={canEdit() ? handleDeleteMarche : null}
            onAddNew={canEdit() ? () => {
              resetMarcheForm();
              setView('marche-form');
            } : null}
            onViewDetails={handleViewMarcheDetails}
            canEdit={canEdit()}
          />
        )}

        {/* Formulaire Marché */}
        {view === 'marche-form' && canEdit() && (
          <MarcheForm
            formData={marcheFormData}
            destinations={selectedMarche?.marche_destinations || []}
            allDestinations={actualDestinations}
            onChange={setMarcheFormData}
            onSubmit={handleMarcheSubmit}
            onCancel={() => {
              resetMarcheForm();
              setView('marches');
            }}
            isEditing={!!selectedMarche}
          />
        )}

        {/* Détails du Marché */}
        {view === 'marche-details' && selectedMarche && (
          <MarcheDetails
            marcheId={selectedMarche.id}
            onBack={() => setView('marches')}
          />
        )}
      </div>

      {/* Modal de Paiement */}
      {showPaymentModal && selectedLoad && canEdit() && (
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

      {/* Modal d'initialisation des destinations */}
      {showInitModal && canEdit() && (
        <InitDestinations onInitialized={handleInitialized} />
      )}
    </div>
  );
};

export default App;