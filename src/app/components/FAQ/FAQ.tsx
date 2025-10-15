'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Where can I contact your team?',
      answer: 'You can reach us through email at support@greysilicon.com, or call us at +254 700 123 456. Our support team is available Monday to Friday, 9:00 AM – 5:00 PM.'
    },
    {
      question: 'How do I get started with the feedback system?',
      answer: 'Simply create a merchant account, configure your feedback settings, and integrate our widget into your platform. You\'ll start receiving real-time feedback from your customers instantly.'
    },
    {
      question: 'Can I customize the feedback form to match my brand?',
      answer: 'Yes, you can fully customize the appearance — from your logo and colors to the questions asked — so it blends perfectly with your platform.'
    },
    {
      question: 'Do you provide support during setup?',
      answer: 'Absolutely. Our onboarding team works closely with new merchants to ensure a smooth setup, including technical guidance and training where needed.'
    },
    {
      question: 'What happens after I receive feedback from my customers?',
      answer: 'All feedback is instantly visible on your dashboard, where you can analyze trends, respond to customers, and export reports for deeper insights.'
    },
    {
      question: 'Is there a trial period?',
      answer: 'Yes, we offer a 14-day free trial so you can explore the platform, set up your forms, and experience the dashboard before committing.'
    },
    {
      question: 'Can I integrate the system with my existing tools?',
      answer: 'Yes, our platform supports API and plugin integrations for various systems, including CRMs, eCommerce platforms, and more.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ask Us Anything
          </h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our feedback system and how it can help your business grow.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                className="w-full px-6 py-5 text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`faq-${index}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </h3>
                  <span className="text-blue-600 transform transition-transform duration-200 ml-4">
                    {activeIndex === index ? '−' : '+'}
                  </span>
                </div>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    id={`faq-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0 text-gray-600">
                      <p>{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
