import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { useMobileDetection } from './MobileDetection';

interface FooterSection {
  title: string;
  items: {
    label: string;
    link: string;
  }[];
}

const Footer: React.FC = () => {
  const isMobile = useMobileDetection();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const footerSections: FooterSection[] = [
    {
      title: 'Quick Links',
      items: [
        { label: 'Shop', link: '/shop' },
        { label: 'Training', link: '/training' },
        { label: 'About Us', link: '/about' },
        { label: 'Gallery', link: '/gallery' },
        { label: 'Contact', link: '/contact' }
      ]
    },
    {
      title: 'Products',
      items: [
        { label: 'Carnimore Models', link: '/shop?category=carnimore-models' },
        { label: 'Matched Sets', link: '/shop?category=matched-sets' },
        { label: 'Custom Duracoat', link: '/shop?category=custom-duracoat' },
        { label: 'Tikkas Models', link: '/shop?category=tikkas-models' },
        { label: 'NFA (Suppressors)', link: '/shop?category=nfa' }
      ]
    }
  ];

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <footer className="bg-primary pt-12 pb-6 border-t border-gunmetal">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div>
            <Logo size={isMobile ? "small" : "medium"} />
            <p className="mt-4 text-gray-400 text-sm">
              Custom Quality You Can Rely On. Precision engineering and craftsmanship since 2000.
            </p>
            <div className="flex space-x-4 mt-4">
              <a 
                href="https://www.facebook.com/carnimore" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-tan transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://www.instagram.com/carnimoregun/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-tan transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-tan transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Navigation Sections - Collapsible on Mobile */}
          {isMobile ? (
            <div className="col-span-2 space-y-4">
              {footerSections.map((section) => (
                <div key={section.title} className="border-b border-gunmetal-light pb-2">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between py-2 text-left"
                  >
                    <span className="font-heading font-bold">{section.title}</span>
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${
                        expandedSection === section.title ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedSection === section.title && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <ul className="py-2 space-y-2">
                          {section.items.map((item) => (
                            <li key={item.link}>
                              <Link
                                to={item.link}
                                className="text-gray-400 hover:text-tan transition-colors text-sm block py-1"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : (
            // Desktop Navigation
            <>
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="font-heading font-bold text-lg mb-4">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.link}>
                        <Link
                          to={item.link}
                          className="text-gray-400 hover:text-tan transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="text-tan mr-2 mt-1 flex-shrink-0" size={18} />
                <span className="text-gray-400 text-sm">
                  1234 Precision Ave, Suite 500<br />Phoenix, AZ 85001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="text-tan mr-2 flex-shrink-0" size={18} />
                <a
                  href="tel:+16233887069"
                  className="text-gray-400 hover:text-tan transition-colors text-sm"
                >
                  (623) 388-7069
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="text-tan mr-2 flex-shrink-0" size={18} />
                <a
                  href="mailto:info@carnimore.com"
                  className="text-gray-400 hover:text-tan transition-colors text-sm"
                >
                  info@carnimore.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gunmetal pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} Carnimore. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link to="/info" className="text-gray-500 text-xs hover:text-tan transition-colors">
                Info
              </Link>
              <Link to="/legal" className="text-gray-500 text-xs hover:text-tan transition-colors">
                Legal
              </Link>
              <Link to="/privacy" className="text-gray-500 text-xs hover:text-tan transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 text-xs hover:text-tan transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;