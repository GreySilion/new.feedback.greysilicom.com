'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Variants } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Typed from 'typed.js';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function Hero() {
  const el = useRef<HTMLSpanElement>(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    if (!el.current) return;

    const options = {
      strings: [
        'We value your opinion.',
        'Share your experience with us.',
        'Your feedback makes us better.'
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 2000,
      loop: true,
    };

    typed.current = new Typed(el.current, options);

    return () => {
      typed.current?.destroy();
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl"
            variants={itemVariants}
          >
            Collect, Analyze, and Act on
            <span className="text-blue-600"> Customer Feedback</span>
          </motion.h1>
          
          <motion.p 
            className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Transform customer insights into actionable improvements with Grey Silicon's powerful feedback management platform. 
            Understand what your users really want and deliver exceptional experiences.
          </motion.p>
          
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={itemVariants}
          >
            <Link
              href="/feedback"
              className="px-6 py-3.5 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Give Feedback
            </Link>
            <Link
              href="#features"
              className="px-6 py-3.5 text-base font-medium text-blue-600 hover:text-blue-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Learn More
            </Link>
          </motion.div>
          
          <motion.div 
            className="mt-16 relative"
            variants={itemVariants}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl opacity-20 blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">feedback.greysilicon.com</div>
                </div>
                <div className="h-32 flex items-center justify-center px-6">
                  <span 
                    ref={el} 
                    className="text-center text-orange-500 text-2xl md:text-3xl font-bold min-h-[1.5em] block w-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
    </section>
  );
}
