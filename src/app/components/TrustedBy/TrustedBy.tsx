'use client';

import React from 'react';
import Marquee from 'react-fast-marquee';
import Image from 'next/image';

const TrustedBy = () => {
  const logos = [
    { src: '/images/logo/carrefour.svg', alt: 'Carrefour' },
    { src: '/images/logo/flutterwave.svg', alt: 'Flutterwave' },
    { src: '/images/logo/rubis.png', alt: 'Rubis' },
    { src: '/images/logo/SAF.png', alt: 'SAF' },
    { src: '/images/logo/razorpay.svg', alt: 'Razorpay' },
    { src: '/images/logo/meta.svg', alt: 'Meta' },
  ];

  return (
    <section className="bg-gray-50 py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-10 md:mb-12">
          Trusted by leading companies
        </h2>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-white to-transparent z-10" />
          
          <Marquee 
            autoFill={true}
            pauseOnHover={true}
            speed={40}
            gradient={false}
            className="py-2 md:py-4"
          >
            <div className="flex items-center">
              {logos.map((logo, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-center h-10 md:h-14 px-4 md:px-8"
                >
                  <div className="relative w-32 md:w-40 h-16 md:h-20 p-3 bg-white/50 rounded-lg">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      sizes="(max-width: 768px) 128px, 160px"
                      className="object-contain object-center p-1.5 opacity-90 hover:opacity-100 transition-all duration-300 scale-95 hover:scale-100"
                      style={{
                        filter: 'brightness(1.1) contrast(1.1)',
                      }}
                      priority={index < 2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
