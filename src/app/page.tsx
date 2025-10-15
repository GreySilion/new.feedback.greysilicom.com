'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Import components
import FAQ from './components/FAQ/FAQ';
import HowItWorks from './components/HowItWorks/HowItWorks';
// Import TrustedBy component
import TrustedBy from './components/TrustedBy/TrustedBy';

// Dynamically import components with no SSR to avoid hydration mismatches
const Navbar = dynamic(() => import('./components/Navbar/Navbar'), {
  ssr: false,
  loading: () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="hidden md:flex space-x-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    </header>
  ),
});

const Hero = dynamic(() => import('./components/Hero/Hero'), {
  ssr: false,
  loading: () => (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="h-12 bg-gray-200 animate-pulse rounded-lg w-3/4 mx-auto mb-6"></div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2 mx-auto mb-8"></div>
          <div className="flex justify-center space-x-4">
            <div className="h-12 w-32 bg-blue-200 animate-pulse rounded-lg"></div>
            <div className="h-12 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    </section>
  ),
});

const Footer = dynamic(() => import('./components/Footer/Footer'), {
  ssr: false,
  loading: () => (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded mb-4"></div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Suspense
        fallback={
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <TrustedBy />
          {/* Features Section */}
          <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
              >
                Connect your business directly with your customers.
              </motion.h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Easy to Use',
                    description: 'Simple and intuitive interface for collecting feedback from your users.',
                    icon: '👋'
                  },
                  {
                    title: 'Real-time Analytics',
                    description: 'Get insights and analytics on your feedback data in real-time.',
                    icon: '📊',
                    link: '/dashboard/analytics',
                    linkText: 'Learn More →'
                  },
                  {
                    title: 'Customizable',
                    description: 'Tailor the feedback form to match your brand and requirements.',
                    icon: '🎨'
                  }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -10,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col h-full"
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 mb-4 flex-grow">{feature.description}</p>
                    {feature.link && (
                      <Link 
                        href={feature.link}
                        className="mt-auto text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center transition-colors"
                      >
                        {feature.linkText}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <HowItWorks />

          {/* About Section */}
          <section id="about" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">About Us</h2>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-lg text-gray-600 mb-6">
                  We're dedicated to helping businesses collect and analyze customer feedback to improve their products and services.
                </p>
                <p className="text-gray-600">
                  Our mission is to make it easy for companies to understand their customers and make data-driven decisions.
                </p>
              </div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <FAQ />
          
        </main>
        <Footer />
      </Suspense>
    </div>
  );
}
