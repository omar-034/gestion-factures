// src/services/auth.service.js
import { supabase } from '../supabaseClient';

export const authService = {
  // Se connecter
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Récupérer le profil utilisateur avec le rôle
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.warn('Profil non trouvé, utilisation des métadonnées');
        return {
          user: data.user,
          role: data.user.user_metadata?.role || 'viewer'
        };
      }
      
      return {
        user: data.user,
        role: profile.role
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  // Se déconnecter
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtenir la session courante
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (!session) return null;
      
      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        return {
          user: session.user,
          role: session.user.user_metadata?.role || 'viewer'
        };
      }
      
      return {
        user: session.user,
        role: profile.role
      };
    } catch (error) {
      console.error('Erreur récupération session:', error);
      return null;
    }
  },

  // Créer un utilisateur (admin uniquement)
  async createUser(email, password, role = 'viewer', name = '') {
    try {
      // 1. Créer l'utilisateur dans Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role, name }
      });
      
      if (authError) throw authError;
      
      // 2. Créer le profil dans la table users
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email,
          name,
          role
        }]);
      
      if (profileError) throw profileError;
      
      return authData.user;
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw error;
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        callback({
          user: session.user,
          role: profile?.role || session.user.user_metadata?.role || 'viewer'
        });
      } else {
        callback(null);
      }
    });
  }
};