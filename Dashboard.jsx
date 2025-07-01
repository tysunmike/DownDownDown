import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Globe, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Settings,
  LogOut,
  Crown,
  BarChart3,
  Zap,
  RefreshCw,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import AddWebsiteModal from './AddWebsiteModal';
import UpgradeModal from './UpgradeModal';
import WebsiteCard from './WebsiteCard';
import DashboardStats from './DashboardStats';

const Dashboard = () => {
  const { user, logout, upgradeSubscription } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchWebsites();
    fetchStats();
  }, []);

  const fetchWebsites = async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch('/api/monitoring/websites', {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWebsites(data);
      } else {
        toast.error('Failed to fetch websites');
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch('/api/monitoring/dashboard/stats', {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddWebsite = async (websiteData) => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch('/api/monitoring/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(websiteData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Website added successfully!');
        fetchWebsites();
        fetchStats();
        setShowAddModal(false);
      } else {
        toast.error(data.error || 'Failed to add website');
      }
    } catch (error) {
      console.error('Error adding website:', error);
      toast.error('Network error');
    }
  };

  const handleDeleteWebsite = async (websiteId) => {
    if (!confirm('Are you sure you want to delete this website?')) return;

    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch(`/api/monitoring/websites/${websiteId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (response.ok) {
        toast.success('Website deleted successfully!');
        fetchWebsites();
        fetchStats();
      } else {
        toast.error('Failed to delete website');
      }
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Network error');
    }
  };

  const handleCheckWebsite = async (websiteId) => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch(`/api/monitoring/websites/${websiteId}/check`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (response.ok) {
        toast.success('Website checked successfully!');
        fetchWebsites();
        fetchStats();
      } else {
        toast.error('Failed to check website');
      }
    } catch (error) {
      console.error('Error checking website:', error);
      toast.error('Network error');
    }
  };

  const getSubscriptionBadge = () => {
    const plan = user?.subscription?.plan || 'free';
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      business: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[plan]}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold gradient-text">UptimePro</span>
              </div>
              {getSubscriptionBadge()}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.user?.username}</span>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="btn-primary flex items-center"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </button>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <DashboardStats stats={stats} />

        {/* Websites Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Websites</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Website
            </button>
          </div>

          {websites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No websites yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first website to start monitoring its uptime and performance.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add Your First Website
              </button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((website, index) => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  index={index}
                  onCheck={() => handleCheckWebsite(website.id)}
                  onDelete={() => handleDeleteWebsite(website.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold">Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View detailed uptime reports and performance analytics.
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              View Reports →
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center mb-4">
              <Zap className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold">API Access</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Integrate monitoring data with your existing tools and workflows.
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-semibold">
              View API Docs →
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center mb-4">
              <Settings className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold">Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure alerts, notifications, and account preferences.
            </p>
            <button className="text-green-600 hover:text-green-700 font-semibold">
              Manage Settings →
            </button>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddWebsiteModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWebsite}
          subscription={user?.subscription}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={user?.subscription?.plan || 'free'}
          onUpgrade={upgradeSubscription}
        />
      )}
    </div>
  );
};

export default Dashboard;

