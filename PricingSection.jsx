import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, Zap, Crown, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingSection = ({ onShowAuth }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [pricing, setPricing] = useState([]);

  useEffect(() => {
    // Fetch pricing from API
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/auth/pricing');
      if (response.ok) {
        const data = await response.json();
        setPricing(data.plans);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      // Fallback pricing
      setPricing([
        {
          name: 'Free',
          price: 0,
          features: [
            '5 websites',
            'Checks every 30 minutes',
            '7-day history',
            'Email alerts',
            'Basic support'
          ],
          max_websites: 5,
          check_interval: '30 minutes',
          history: '7 days'
        },
        {
          name: 'Pro',
          price: 9.99,
          features: [
            '50 websites',
            'Checks every 5 minutes',
            '90-day history',
            'Email & SMS alerts',
            'API access',
            'Priority support'
          ],
          max_websites: 50,
          check_interval: '5 minutes',
          history: '90 days',
          popular: true
        },
        {
          name: 'Business',
          price: 29.99,
          features: [
            '200 websites',
            'Checks every 1 minute',
            '1-year history',
            'All alert types',
            'Full API access',
            'Custom integrations',
            'Priority support'
          ],
          max_websites: 200,
          check_interval: '1 minute',
          history: '1 year'
        },
        {
          name: 'Enterprise',
          price: 99.99,
          features: [
            '1000+ websites',
            'Checks every 30 seconds',
            'Unlimited history',
            'White-label solution',
            'Custom integrations',
            'Dedicated support',
            'SLA guarantee'
          ],
          max_websites: '1000+',
          check_interval: '30 seconds',
          history: 'Unlimited'
        }
      ]);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Star className="w-6 h-6" />;
      case 'pro':
        return <Zap className="w-6 h-6" />;
      case 'business':
        return <Crown className="w-6 h-6" />;
      case 'enterprise':
        return <Rocket className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'text-gray-600';
      case 'pro':
        return 'text-blue-600';
      case 'business':
        return 'text-purple-600';
      case 'enterprise':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getButtonStyle = (planName) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'pro':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'business':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'enterprise':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getPrice = (plan) => {
    if (plan.price === 0) return 'Free';
    const price = isAnnual ? plan.price * 10 : plan.price; // 2 months free on annual
    return `$${price.toFixed(2)}`;
  };

  const getSavings = (plan) => {
    if (plan.price === 0 || !isAnnual) return null;
    const savings = plan.price * 2; // 2 months free
    return `Save $${savings.toFixed(2)}`;
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${!isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                2 months free
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricing.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              } card-hover`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-full bg-gray-100 ${getPlanColor(plan.name)} mb-4`}>
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{getPrice(plan)}</span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-1">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                {getSavings(plan) && (
                  <div className="text-green-600 text-sm font-semibold">
                    {getSavings(plan)}
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onShowAuth}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${getButtonStyle(plan.name)}`}
              >
                {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600">
                Yes, all paid plans come with a 14-day free trial. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h4>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee for all paid plans.
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
          <p className="text-gray-300 mb-6">
            Contact our sales team for enterprise pricing and custom features.
          </p>
          <button className="bg-white text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

