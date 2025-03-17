import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './Button';

const featuredProducts = [
  {
    id: 'el-carbone',
    name: 'El Carbone',
    category: 'Premium Rifle',
    price: 4495,
    image: '/img/gallery/DSC_0331.jpg',
    description: 'Carbon fiber precision rifle with custom Duracoat finish and premium components.',
  },
  {
    id: 'el-carbone-alpine',
    name: 'El Carbone Alpine',
    category: 'Lightweight Rifle',
    price: 3949,
    image: '/img/gallery/DSC_0340.jpg',
    description: 'Lightweight carbon fiber precision rifle with MDT carbon stock and custom finish.',
  },
  {
    id: 'el-metale',
    name: 'El Metale',
    category: 'Precision Rifle',
    price: 2495,
    image: '/img/gallery/DSC_0319.jpg',
    description: 'Professional-grade precision rifle with MDT LSS chassis system and custom Duracoat.',
  },
];

const FeaturedModels: React.FC = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = featuredProducts.map((product) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = product.image;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      
      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Failed to preload some product images', error);
        setImagesLoaded(true);
      }
    };
    
    preloadImages();
  }, []);

  return (
    <section className="py-20 bg-medium-gray">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            className="font-heading text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured <span className="text-tan">Models</span>
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore our flagship custom rifles, each representing the pinnacle of precision engineering and artisanal craftsmanship. Every model is meticulously designed and built to deliver unmatched performance.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="bg-dark-gray rounded-sm overflow-hidden shadow-luxury angular-border"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${imagesLoaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out' }}
                />
                <div className="absolute top-4 left-4 bg-tan text-black px-3 py-1 text-sm font-medium">
                  {product.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-tan font-heading text-xl">${product.price.toLocaleString()}</span>
                  <Link
                    to={`/shop/carnimore-models/${product.id}`}
                    className="text-white hover:text-tan transition-colors font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button to="/shop/carnimore-models" variant="outline" size="lg">
            View All Models
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedModels;