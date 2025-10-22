'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Import components
const FAQ = dynamic(() => import('./components/FAQ/FAQ'), { ssr: false });
const Features = dynamic(() => import('./components/Features/Features'), { ssr: false });
const HowItWorks = dynamic(() => import('./components/HowItWorks/HowItWorks'), { ssr: false });
const PricingPlans = dynamic(() => import('@/components/PricingPlans'), { ssr: false });
const TrustedBy = dynamic(() => import('./components/TrustedBy/TrustedBy'), { ssr: false });

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

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
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="h-12 bg-gray-200 animate-pulse rounded w-3/4 mx-auto"></div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2 mx-auto"></div>
          <div className="flex justify-center space-x-4 pt-4">
            <div className="h-12 w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-12 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    </section>
  ),
});

const Footer = dynamic(() => import('./components/Footer/Footer'), {
  ssr: false,
  loading: () => (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-24 bg-gray-700 animate-pulse rounded"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 w-32 bg-gray-700 animate-pulse rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <div className="h-4 w-48 bg-gray-700 animate-pulse rounded mx-auto"></div>
        </div>
      </div>
    </footer>
  ),
});

function HomeContent() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        <Suspense fallback={null}>
          <Features />
        </Suspense>
        
        <TrustedBy />
        
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-16 md:py-24 bg-white"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Get valuable insights from your customers with our easy-to-use feedback system
              </p>
            </div>
            <Suspense fallback={<LoadingFallback />}>
              <HowItWorks />
            </Suspense>
          </div>
        </motion.section>
        
        <Suspense fallback={<LoadingFallback />}>
          <PricingPlans />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <FAQ />
        </Suspense>
        
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust us to collect and analyze their customer feedback.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:bg-opacity-10 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}
