'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: '👋',
    title: 'Easy to Use',
    description: 'Simple and intuitive interface for collecting feedback from your users.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    description: 'Get insights and analytics on your feedback data in real-time.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: '🎨',
    title: 'Customizable',
    description: 'Tailor the feedback form to match your brand and requirements.',
    color: 'from-green-500 to-green-600',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Connect your business directly with your customers.
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Powerful features to help you understand and engage with your audience
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative overflow-hidden p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`}></div>
              <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
              <Link 
                href="/signup" 
                className={`inline-flex items-center font-semibold text-${feature.color.split(' ')[0].replace('from-', '')} hover:opacity-80 transition-opacity`}
              >
                Learn more
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
