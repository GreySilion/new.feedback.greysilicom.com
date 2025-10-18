'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const pricingPlans = [
  {
    name: 'Standard',
    price: 'KES 6,500',
    description: 'Perfect for small businesses getting started',
    features: [
      'Default Sender ID: GreySilicon',
      '3,000 SMS Feedback Units / Mo',
      'Basic Analytics – 1 standard report',
      'Email support (24h response)',
      'Limited Integration – 1 third-party tool'
    ],
    cta: 'Get Started',
    popular: false,
    color: 'from-blue-400 to-blue-600',
    buttonColor: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
  },
  {
    name: 'Premium',
    price: 'KES 18,000',
    description: 'For growing teams that need more power',
    features: [
      'Custom Sender ID',
      '15,000 SMS | 10,000 Email | 5,000 WhatsApp / Mo',
      'Advanced Analytics (10 detailed reports)',
      'Priority support (email & chat, 24h)',
      'Integration with up to 5 tools',
      'Custom Branding (logos, colors)',
      'Limited API access'
    ],
    cta: 'Get Started',
    popular: true,
    color: 'from-purple-400 to-pink-600',
    buttonColor: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
  },
  {
    name: 'Custom',
    price: 'Talk to Sales',
    description: 'Enterprise-grade solution for your business',
    features: [
      'Custom Sender ID',
      'Unlimited feedback units (all channels)',
      'Comprehensive analytics & real-time dashboards',
      'Dedicated account manager',
      '24/7 premium support',
      'Full integration suite',
      'Advanced branding (custom URLs)',
      'Full API access',
      'Multi-language support'
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'from-amber-400 to-orange-500',
    buttonColor: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function PricingPlans() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Pricing Plans
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, transparent pricing that scales with your business
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={item}
              whileHover={{ 
                y: -10,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              className={`relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 ${plan.popular ? 'ring-2 ring-purple-500 ring-offset-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-semibold px-4 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r">
                    {plan.price}
                  </span>
                  {plan.name !== 'Custom' && <span className="ml-2 text-gray-500">/month</span>}
                </div>
                <p className="mt-2 text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-6 rounded-lg text-white font-medium text-lg ${plan.buttonColor} transition-all duration-300 flex items-center justify-center space-x-2`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
