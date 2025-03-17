import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

const BrandStatement: React.FC = () => {
  return (
    <section className="relative py-20 overflow-hidden gradient-brand">
      {/* Carbon fiber pattern overlay */}
      <div 
        className="absolute inset-0 bg-repeat opacity-20"
        style={{
          backgroundImage: 'url("/img/real-carbon-fibre.png")',
          backgroundSize: '200px',
          mixBlendMode: 'screen'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="font-heading text-3xl md:text-4xl font-bold mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Precise Rifles <span className="text-tan">For Avid Hunters</span>
          </motion.h2>
          
          <motion.p
            className="text-xl md:text-2xl mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Custom Quality You Can Rely On.
          </motion.p>
          
          <motion.p
            className="text-gray-300 mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            As Arizona's premier custom firearms manufacturer and Duracoat specialist since 2000, we blend precision craftsmanship with advanced Duracoat finishing to create flawless, exceptional firearms. From custom rifle builds to professional Duracoat applications, we deliver unmatched quality that serious shooters and collectors trust for superior performance and durability.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button to="/about" variant="primary" size="lg">
              Discover Our Story
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandStatement;