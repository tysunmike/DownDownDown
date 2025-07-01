import React, { useState } from 'react';
import { X, Crown, Zap, Rocket, CheckCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UpgradeModal = ({ onClose, currentPlan, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      icon: <Zap className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      features: [
        '50 websites',
        'Checks every 5 minutes',
        '90-day history',
        'Email & SMS alerts',
        'API access',
        'Priority support'
      ],
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 29.99,
      icon: <Crown className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      features: [
        '200 websites',
        'Checks every 1 minute',
        '1-year history',
        'All alert types',
        'Full API access',
        'Custom integrations',
        'Priority support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      icon: <Rocket className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      features: [
        '1000+ websites',
        'Checks every 30 seconds',
        'Unlimited history',
        'White-label solution',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee'
      ]
    }
  ];

  const handleUpgrade = async () => {
    if (selectedPlan === currentPlan) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const result = await onUpgrade(selectedPlan);
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (selectedPlan === currentPlan) return 'Current Plan';
    if (loading) return 'Processing...';
    return `Upgrade to ${plans.find(p => p.id === selectedPlan)?.name}`;
  };

  const isCurrentPlan = (planId) => planId === currentPlan;
  const isDowngrade = (planId) => {
    const planOrder = ['free', 'pro', 'business', 'enterprise'];
    return planOrder.indexOf(planId) < planOrder.indexOf(currentPlan);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-4">
                <Crown className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Upgrade Your Plan
              </h2>
              <p className="text-gray-600">
                Unlock more features and monitor more websites
              </p>
            </div>

            {/* Current Plan Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-center">
              <p className="text-sm text-gray-600">
                Current Plan: <span className="font-semibold text-gray-900 capitalize">{currentPlan}</span>
              </p>
            </div>

            {/* Plans */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {isCurrentPlan(plan.id) && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Current
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-full ${plan.bgColor} ${plan.color} mb-4`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 ml-1">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isDowngrade(plan.id) && (
                    <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      This would be a downgrade from your current plan
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                Why upgrade to a premium plan?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">More frequent monitoring</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">Longer history retention</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">Multiple alert channels</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">Priority customer support</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={loading || isCurrentPlan(selectedPlan)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  getButtonText()
                )}
              </button>
            </div>

            {/* Money Back Guarantee */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>30-day money-back guarantee • Cancel anytime • No setup fees</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UpgradeModal;

