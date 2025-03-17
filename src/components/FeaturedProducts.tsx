import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './Button';

// Sample product data
const featuredProducts = [
  {
    id: 1,
    name: 'Sovereign Elite',
    category: 'Pistol',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    description: 'Precision engineered semi-automatic pistol with custom engraving and tan accents.',
  },
  {
    id: 2,
    name: 'Phantom Tactical',
    category: 'Rifle',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    description: 'Long-range precision rifle with carbon fiber components and adjustable stock.',
  },
  {
    id: 3,
    name: 'Obsidian Collection',
    category: 'Custom Series',
    price: 7999,
    image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    description: 'Limited edition series with tactical desert tan inlays and hand-engraved detailing.',
  },
];

const FeaturedProducts: React.FC = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Preload product images
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
        // Still mark as loaded to avoid blocking the UI
        setImagesLoaded(true);
      }
    };
    
    preloadImages();
  }, []);

  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            className="font-heading text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured <span className="text-tan">Collection</span>
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover our most sought-after <span className="text-tan"><u>hand-made</u></span> pieces, each representing the pinnacle of precision engineering and artisanal craftsmanship.
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
                    to={`/shop/${product.id}`}
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
          <Button to="/shop" variant="outline" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;