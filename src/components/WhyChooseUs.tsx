import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Star, Shield } from 'lucide-react';
import { useMobileDetection } from './MobileDetection';

const WhyChooseUs: React.FC = () => {
  const isMobile = useMobileDetection();
  
  const reasons = [
    {
      icon: <CheckCircle className="text-tan" size={isMobile ? 24 : 32} />,
      title: "Unmatched Quality",
      description: "Every firearm undergoes rigorous quality control and testing."
    },
    {
      icon: <Clock className="text-tan" size={isMobile ? 24 : 32} />,
      title: "25+ Years Experience",
      description: "Over two decades of expertise in custom firearms."
    },
    {
      icon: <Star className="text-tan" size={isMobile ? 24 : 32} />,
      title: "Premium Materials",
      description: "Only the highest quality components and materials."
    },
    {
      icon: <Shield className="text-tan" size={isMobile ? 24 : 32} />,
      title: "Lifetime Support",
      description: "Comprehensive support for the life of your firearm."
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden gradient-why-choose">
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
        <div className="text-center mb-16">
          <motion.h2
            className="font-heading text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Choose <span className="text-tan">Carnimore</span>
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our commitment to excellence sets us apart in custom firearms and Duracoat services.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              className="bg-medium-gray rounded-sm shadow-luxury overflow-hidden group hover:bg-dark-gray transition-colors duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-dark-gray rounded-sm group-hover:bg-gunmetal transition-colors duration-300">
                    {reason.icon}
                  </div>
                  <h3 className="font-heading text-lg font-bold ml-4 group-hover:text-tan transition-colors duration-300">
                    {reason.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;