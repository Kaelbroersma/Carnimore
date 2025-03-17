import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, ChevronDown } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { productService } from '../services/productService';
import Logo from './Logo';
import AuthButton from './Auth/AuthButton';
import { useMobileDetection } from './MobileDetection';

interface Category {
  name: string;
  slug: string;
  description: string | null;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { items, toggleCart } = useCartStore();
  const isMobile = useMobileDetection();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await productService.getCategories();
        if (result.data) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled ? 'bg-primary bg-opacity-95 shadow-luxury' : 'bg-transparent'
  }`;

  const navLinks = [
    { name: 'Shop', path: '/shop', hasDropdown: true },
    { name: 'Training', path: '/training', hasDropdown: false },
    { name: 'About Us', path: '/about', hasDropdown: false },
    { name: 'Gallery', path: '/gallery', hasDropdown: false },
    { name: 'FAQ', path: '/info', hasDropdown: false },
    { name: 'Contact', path: '/contact', hasDropdown: false },
  ];

  const handleCategoryClick = (slug: string) => {
    navigate(`/shop/${slug}`);
    setIsShopDropdownOpen(false);
    setIsOpen(false); // Close mobile menu if open
  };

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="z-50">
            <Logo size="medium" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.hasDropdown ? (
                  <button
                    className="flex items-center text-white hover:text-tan transition-colors"
                    onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                    onMouseEnter={() => setIsShopDropdownOpen(true)}
                    onMouseLeave={() => setIsShopDropdownOpen(false)}
                  >
                    {link.name}
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                ) : (
                  <Link
                    to={link.path}
                    className={`text-white hover:text-tan transition-colors ${
                      location.pathname === link.path ? 'text-tan' : ''
                    }`}
                  >
                    {link.name}
                  </Link>
                )}

                {link.hasDropdown && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-48 bg-primary shadow-luxury rounded-sm overflow-hidden transition-all duration-200 ${
                      isShopDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                    onMouseEnter={() => setIsShopDropdownOpen(true)}
                    onMouseLeave={() => setIsShopDropdownOpen(false)}
                  >
                    {loading ? (
                      <div className="p-4 text-gray-400">Loading categories...</div>
                    ) : (
                      categories.map((category) => (
                        <button
                          key={category.slug}
                          onClick={() => handleCategoryClick(category.slug)}
                          className="block w-full text-left px-4 py-2 text-white hover:bg-gunmetal hover:text-tan transition-colors"
                        >
                          {category.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User and Cart Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            <AuthButton />
            <button
              onClick={toggleCart}
              className="text-white hover:text-tan transition-colors relative"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-tan text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white z-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-primary bg-opacity-95 z-40 lg:hidden flex flex-col justify-center items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center space-y-6 text-xl">
              {navLinks.map((link) => (
                <div key={link.name} className="relative">
                  {link.hasDropdown ? (
                    <>
                      <button
                        className="flex items-center text-white hover:text-tan transition-colors"
                        onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                      >
                        {link.name}
                        <ChevronDown size={16} className="ml-1" />
                      </button>
                      <AnimatePresence>
                        {isShopDropdownOpen && (
                          <motion.div 
                            className="mt-2 space-y-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {loading ? (
                              <div className="text-gray-400">Loading categories...</div>
                            ) : (
                              categories.map((category) => (
                                <button
                                  key={category.slug}
                                  onClick={() => handleCategoryClick(category.slug)}
                                  className="block w-full text-center text-white hover:text-tan transition-colors py-2"
                                >
                                  {category.name}
                                </button>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={link.path}
                      className={`text-white hover:text-tan transition-colors ${
                        location.pathname === link.path ? 'text-tan' : ''
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="flex items-center space-x-8 mt-8">
                <AuthButton />
                <button
                  onClick={toggleCart}
                  className="text-white hover:text-tan transition-colors relative"
                >
                  <ShoppingCart size={24} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-tan text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;