import React, { useState } from 'react';
import { 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const WebsiteCard = ({ website, index, onCheck, onDelete }) => {
  const [checking, setChecking] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'down':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'up':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastChecked = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const formatCheckInterval = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const handleCheck = async () => {
    setChecking(true);
    await onCheck();
    setChecking(false);
  };

  const openWebsite = () => {
    let url = website.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg p-6 card-hover"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {website.name}
          </h3>
          <p className="text-sm text-gray-600 break-all">
            {website.url}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={openWebsite}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Open website"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete website"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon(website.current_status)}
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(website.current_status)}`}>
            {website.current_status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        <button
          onClick={handleCheck}
          disabled={checking}
          className="text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
          title="Check now"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Last checked
          </span>
          <span className="font-medium text-gray-900">
            {formatLastChecked(website.last_checked)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Check interval</span>
          <span className="font-medium text-gray-900">
            {formatCheckInterval(website.check_interval)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status</span>
          <span className={`font-medium ${
            website.is_active ? 'text-green-600' : 'text-gray-500'
          }`}>
            {website.is_active ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            View History
          </button>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check Now'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WebsiteCard;

