import React, { useState } from 'react';
import { X, Globe, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddWebsiteModal = ({ onClose, onAdd, subscription }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    check_interval: 1800 // 30 minutes default
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onAdd(formData);
    } catch (error) {
      console.error('Error adding website:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getIntervalOptions = () => {
    const minInterval = subscription?.min_check_interval || 1800;
    const options = [
      { value: 30, label: '30 seconds', premium: true },
      { value: 60, label: '1 minute', premium: true },
      { value: 300, label: '5 minutes', premium: true },
      { value: 900, label: '15 minutes' },
      { value: 1800, label: '30 minutes' },
      { value: 3600, label: '1 hour' }
    ];

    return options.filter(option => option.value >= minInterval || !option.premium);
  };

  const formatUrl = (url) => {
    if (!url) return '';
    // Remove protocol if present
    return url.replace(/^https?:\/\//, '');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add Website
              </h2>
              <p className="text-gray-600">
                Start monitoring a new website for uptime and performance
              </p>
            </div>

            {/* Subscription Limits */}
            {subscription && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-semibold text-blue-900">
                    Current Plan: {subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• Max websites: {subscription.max_websites}</div>
                  <div>• Min check interval: {Math.floor(subscription.min_check_interval / 60)} minutes</div>
                  <div>• History retention: {subscription.history_days} days</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., My Company Website"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    https://
                  </span>
                  <input
                    type="text"
                    name="url"
                    value={formatUrl(formData.url)}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example.com"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your domain without the protocol (https://)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check Interval
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="check_interval"
                    value={formData.check_interval}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {getIntervalOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.premium && subscription?.min_check_interval > option.value ? ' (Premium)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  How often we'll check your website
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding Website...
                  </div>
                ) : (
                  'Add Website'
                )}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• We'll immediately check your website</li>
                <li>• You'll receive alerts if it goes down</li>
                <li>• View detailed uptime history and analytics</li>
                <li>• Configure custom alert preferences</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddWebsiteModal;

