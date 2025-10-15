'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle, Code, Settings, BarChart, Zap } from 'lucide-react';

const steps = [
  {
    title: 'Sign Up & Get API Keys',
    description: 'Create your account and receive instant access to your API credentials. No waiting, no approval process.',
    icon: <CheckCircle className="h-8 w-8" />,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    delay: 0.1
  },
  {
    title: 'Configure Your Channels',
    description: 'Set up your business personalized channels with our intuitive dashboard. Customize settings in minutes.',
    icon: <Settings className="h-8 w-8" />,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    delay: 0.2
  },
  {
    title: 'Start Getting Feedback',
    description: 'Use our APIs or dashboard to get analytics and watch real feedback confirmations roll in.',
    icon: <Code className="h-8 w-8" />,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    delay: 0.3
  },
  {
    title: 'Scale & Monitor',
    description: 'Leverage our analytics dashboard to optimize your business and scale to millions of customers seamlessly.',
    icon: <BarChart className="h-8 w-8" />,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    delay: 0.4
  }
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Started in 5 Minutes</h2>
            <p className="text-xl text-gray-600">
              From signup to getting your first feedback — our streamlined process gets you up and running faster than any other platform.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Desktop horizontal scrollable cards */}
          <div className="hidden md:flex space-x-6 pb-8 -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: step.delay }}
                className="flex-shrink-0 w-80 snap-center"
              >
                <div className={`h-full p-8 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${step.bgColor}`}>
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${step.color} text-white`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  <div className="mt-6 flex items-center text-sm font-medium text-blue-600">
                    Step {index + 1}
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`p-6 rounded-2xl bg-white shadow-lg border border-gray-100 ${step.bgColor}`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${step.color} text-white`}>
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
                    Step {index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-blue-100 via-blue-400 to-blue-100 rounded-full opacity-50"></div>
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a
            href="/signup"
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            <Zap className="w-5 h-5 mr-2" />
            Get Started Now
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
