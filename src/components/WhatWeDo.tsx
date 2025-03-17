import React from 'react';
import { motion } from 'framer-motion';
import { Sun as Gun, SprayCan, Target, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileDetection } from './MobileDetection';

const WhatWeDo: React.FC = () => {
  const isMobile = useMobileDetection();
  const navigate = useNavigate();
  
  const services = [
    {
      icon: <Gun className="text-tan" size={isMobile ? 24 : 32} />,
      title: "Custom Firearms Manufacturing",
      description: "Precision-engineered custom rifles and firearms, meticulously crafted to your exact specifications.",
      path: "/shop/carnimore-models"
    },
    {
      icon: <SprayCan className="text-tan" size={isMobile ? 24 : 32} />,
      title: "Professional Duracoat Services",
      description: "Industry-leading Duracoat application with our proprietary techniques for superior durability.",
      path: "/shop/duracoat"
    },
    {
      icon: <Target className="text-tan" size={isMobile ? 24 : 32} />,
      title: "Long Range Solutions",
      description: "Specialized in creating high-precision long-range rifles for exceptional accuracy.",
      path: "/shop/carnimore-models"
    },
    {
      icon: <Award className="text-tan" size={isMobile ? 24 : 32} />,
      title: "Training Programs",
      description: "Comprehensive firearms training programs for all skill levels.",
      path: "/training"
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden gradient-what-we-do">
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
            What We <span className="text-tan">Do</span>
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Since 2000, we've been crafting custom firearms and providing professional Duracoat services, setting the standard for quality and innovation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.button
              key={service.title}
              onClick={() => navigate(service.path)}
              className="bg-primary rounded-sm shadow-luxury overflow-hidden group hover:bg-dark-gray transition-colors duration-300 text-left w-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-dark-gray rounded-sm group-hover:bg-gunmetal transition-colors duration-300">
                    {service.icon}
                  </div>
                  <h3 className="font-heading text-lg font-bold ml-4 group-hover:text-tan transition-colors duration-300 flex-grow">
                    {service.title}
                  </h3>
                  <ArrowRight 
                    className={`text-gray-500 group-hover:text-tan transition-all duration-300 ${
                      isMobile ? 'opacity-100' : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100'
                    }`} 
                    size={20} 
                  />
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;