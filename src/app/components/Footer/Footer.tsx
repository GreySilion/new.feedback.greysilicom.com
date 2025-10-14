// This is a Server Component by default
import Link from 'next/link';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

const navigation = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#' },
    { name: 'Testimonials', href: '#' },
  ],
  company: [
    { name: 'About', href: '#about' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
  ],
  legal: [
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Cookies', href: '#' },
  ],
  contact: [
    {
      icon: <EnvelopeIcon className="h-5 w-5 text-slate-400" />,
      text: 'hello@greysilicon.com',
      href: 'mailto:hello@greysilicon.com',
    },
    {
      icon: <PhoneIcon className="h-5 w-5 text-slate-400" />,
      text: '+254 712 244 243 / +254 702 193 125',
      href: '+254 712 244 243 / +254 702 193 125',
    },
    {
      icon: <MapPinIcon className="h-5 w-5 text-slate-400" />,
      text: 'Nairobi, Kenya',
      href: '#',
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400" aria-labelledby="footer-heading">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="flex flex-col items-center justify-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Connect With Us</h2>
          <div className="h-1 w-16 bg-blue-600 rounded-full mb-8"></div>
        </div>
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center">
              <img 
                src="/images/logo/greysiliconlogo.png" 
                alt="Grey Silicon Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-slate-400 text-sm leading-6">
              Empowering businesses with actionable insights through powerful feedback management solutions.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a 
                href="https://www.instagram.com/greysiliconlimited/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-pink-600 transition-colors duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://x.com/greysilicon47" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-200 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="https://www.linkedin.com/company/grey-silicon-limited/posts/?feedView=all" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors duration-200 hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a 
                href="https://www.facebook.com/greysilicon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-slate-400 hover:text-white">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-slate-400 hover:text-white">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-slate-400 hover:text-white">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:pl-12">
              <h3 className="text-sm font-semibold leading-6 text-white">Contact us</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.contact.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <a href={item.href} className="ml-3 text-sm leading-6 text-slate-400 hover:text-white">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-slate-800 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-slate-500">
            &copy; {new Date().getFullYear()} Grey Silicon, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
