import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sun as Gun, SprayCan, Crosshair, ShoppingBag, Package } from 'lucide-react';
import { useMobileDetection } from '../components/MobileDetection';

interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  path: string;
}

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useMobileDetection();

  const collections: Collection[] = [
    {
      id: 'carnimore-models',
      name: 'Carnimore Models',
      description: 'Premium custom rifles crafted with precision and excellence',
      image: '/img/gallery/DSC_0331.jpg',
      icon: <Gun className="text-tan" size={24} />,
      path: '/shop/carnimore-models'
    },
    {
      id: 'duracoat',
      name: 'Duracoat Services',
      description: 'Professional firearm coating with unmatched durability',
      image: '/img/gallery/DSC_0340.jpg',
      icon: <SprayCan className="text-tan" size={24} />,
      path: '/shop/duracoat'
    },
    {
      id: 'optics',
      name: 'Optics',
      description: 'High-quality scopes and sighting solutions',
      image: '/img/gallery/DSC_0382.jpg',
      icon: <Crosshair className="text-tan" size={24} />,
      path: '/shop/optics'
    },
    {
      id: 'merch',
      name: 'Merchandise',
      description: 'Premium apparel and accessories',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      icon: <ShoppingBag className="text-tan" size={24} />,
      path: '/shop/merch'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      description: 'Essential firearm accessories and components',
      image: '/img/gallery/DSC_0319.jpg',
      icon: <Package className="text-tan" size={24} />,
      path: '/shop/accessories'
    }
  ];

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-16">
          <motion.h1 
            className="font-heading text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our <span className="text-tan">Collections</span>
          </motion.h1>
          <motion.div 
            className="w-24 h-0.5 bg-tan mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
          <motion.p
            className="text-xl max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Explore our range of premium firearms, services, and accessories
          </motion.p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              className="bg-gunmetal rounded-sm shadow-luxury overflow-hidden cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => navigate(collection.path)}
            >
              {/* Collection Image */}
              <div className="relative aspect-w-16 aspect-h-9 overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300" />
              </div>

              {/* Collection Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-bold group-hover:text-tan transition-colors">
                    {collection.name}
                  </h2>
                  {collection.icon}
                </div>
                <p className="text-gray-400">
                  {collection.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;