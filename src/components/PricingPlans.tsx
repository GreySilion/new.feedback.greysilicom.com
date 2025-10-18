'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  custom?: boolean;
  icon: React.ReactNode;
};

const PricingPlans = () => {
  const plans: Plan[] = [
    {
      name: 'STANDARD',
      price: 'KES. 6,500',
      description: 'Perfect for small teams getting started',
      features: [
        'Default Sender ID: GreySilicon',
        '3,000 SMS Feedback Units / Mo',
        'Basic Analytics – 1 standard report',
        'Email support (24h response)',
        'Limited Integration – 1 third-party tool'
      ],
      cta: 'Get Started',
      icon: <Zap className="w-6 h-6 text-blue-500" />
    },
    {
      name: 'PREMIUM',
      price: 'KES. 18,000',
      description: 'For growing teams with advanced needs',
      features: [
        'Custom Sender ID',
        '15,000 SMS | 10,000 Email | 5,000 WhatsApp Units / Mo',
        'Advanced Analytics (10 detailed reports)',
        'Priority support (email & chat, 24h)',
        'Integration with up to 5 tools',
        'Custom Branding (logos, colors)',
        'Limited API access'
      ],
      cta: 'Get Started',
      popular: true,
      icon: <Crown className="w-6 h-6 text-yellow-500" />
    },
    {
      name: 'CUSTOM',
      price: 'Talk to Sales',
      description: 'Enterprise-grade solution',
      features: [
        'Custom Sender ID',
        'Unlimited feedback units (all channels)',
        'Comprehensive analytics & real-time dashboards',
        'Dedicated account manager',
        '24/7 premium support',
        'Full integration suite',
        'Advanced branding & custom URLs',
        'Full API access',
        'Multi-language support'
      ],
      cta: 'Contact Us',
      custom: true,
      icon: <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Pricing Plans
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your feedback collection needs
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={item}
              whileHover={{ 
                y: -10,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 ${
                plan.popular 
                  ? 'bg-white border-2 border-yellow-400 shadow-xl' 
                  : plan.custom 
                    ? 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100' 
                    : 'bg-white border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                {plan.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="mb-8">
                <span className={`text-3xl font-bold ${
                  plan.popular 
                    ? 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500' 
                    : 'text-gray-900'
                }`}>
                  {plan.price}
                </span>
                {!plan.custom && <span className="text-gray-500">/month</span>}
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href={plan.custom ? "/contact" : "/signup"}
                className={`group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition-all rounded-xl ${
                  plan.popular
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-200'
                    : plan.custom
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-200'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-200'
                }`}
              >
                <span className="relative">
                  {plan.cta}
                </span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingPlans;
