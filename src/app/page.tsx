'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

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
          {/* Features Section */}
          <section id="features" className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Connect your business directly with your customers.</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Easy to Use',
                    description: 'Simple and intuitive interface for collecting feedback from your users.'
                  },
                  {
                    title: 'Real-time Analytics',
                    description: 'Get insights and analytics on your feedback data in real-time.'
                  },
                  {
                    title: 'Customizable',
                    description: 'Tailor the feedback form to match your brand and requirements.'
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

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
        </main>
        <Footer />
      </Suspense>
    </div>
  );
}
