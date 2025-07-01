import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE = '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      fetchProfile(apiKey);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (apiKey) => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        localStorage.removeItem('apiKey');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('apiKey');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('apiKey', data.api_key);
        await fetchProfile(data.api_key);
        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(data.error || 'Login failed');
        return { success: false, error: data.error };
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please log in.');
        return { success: true };
      } else {
        toast.error(data.error || 'Registration failed');
        return { success: false, error: data.error };
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('apiKey');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const upgradeSubscription = async (plan) => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch(`${API_BASE}/auth/subscription/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProfile(apiKey);
        toast.success(`Successfully upgraded to ${plan} plan!`);
        return { success: true };
      } else {
        toast.error(data.error || 'Upgrade failed');
        return { success: false, error: data.error };
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    upgradeSubscription,
    refreshProfile: () => {
      const apiKey = localStorage.getItem('apiKey');
      if (apiKey) {
        fetchProfile(apiKey);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

