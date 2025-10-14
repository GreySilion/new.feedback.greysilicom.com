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
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8 md:mb-12">
          Trusted by leading companies
        </h2>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-white to-transparent z-10" />
          
          <Marquee 
            autoFill={true}
            pauseOnHover={true}
            speed={40}
            gradient={false}
            className="py-4"
          >
            <div className="flex items-center space-x-12 px-4">
              {logos.map((logo, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-center h-12 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={48}
                    className="h-full w-auto object-contain"
                    priority={index < 2} // Only prioritize first 2 images for better LCP
                  />
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
