import React from 'react';
import { Globe, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Websites',
      value: stats.total_websites || 0,
      icon: <Globe className="w-8 h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Websites Up',
      value: stats.up_websites || 0,
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Websites Down',
      value: stats.down_websites || 0,
      icon: <AlertCircle className="w-8 h-8" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Uptime (24h)',
      value: `${stats.uptime_percentage || 100}%`,
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-full`}>
              {stat.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;

