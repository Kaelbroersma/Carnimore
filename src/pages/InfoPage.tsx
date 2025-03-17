import React from 'react';
import { motion } from 'framer-motion';

const InfoPage: React.FC = () => {
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
            Information <span className="text-tan">Center</span>
          </motion.h1>
          <motion.div 
            className="w-24 h-0.5 bg-tan mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">Frequently Asked <span className="text-tan">Questions</span></h2>
          
          <div className="space-y-6">
            <motion.div 
              className="bg-gunmetal p-6 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="font-heading text-xl font-bold mb-3">What is Duracoat and why do you use it?</h3>
              <p className="text-gray-300">
                Duracoat is a premium 2-part chemical coating that offers Milspec hardness, weatherproof and chemical-resistant properties. It's self-lubricating and can hold 30% of its weight in oil. We've chosen it after extensive testing because it sprays thin enough to allow 7-8 coats while remaining thinner than ceramic bake-on finishes, providing superior durability and appearance.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gunmetal p-6 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="font-heading text-xl font-bold mb-3">How long does the curing process take?</h3>
              <p className="text-gray-300">
                Duracoat is initially cured in about 3 weeks, but continues to cure and harden for up to 2 years or more. This progressive curing process ensures exceptional durability and longevity for your custom firearm.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gunmetal p-6 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="font-heading text-xl font-bold mb-3">What makes your camouflage system unique?</h3>
              <p className="text-gray-300">
                Our proprietary camouflage system was developed over 30 years of research and testing. Unlike traditional camouflage that attempts to mimic environments, our system uses specific shapes and colors to create visual breakup that causes the brain to make assumptions about an object's nonexistence. Each piece is hand-decaled and sprayed with an automotive HVLP sprayer for precision application.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gunmetal p-6 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="font-heading text-xl font-bold mb-3">Do you offer custom designs?</h3>
              <p className="text-gray-300">
                Yes, every piece we create is one-of-a-kind. We work closely with clients to understand their specific needs and environments. Whether you're looking for a particular color scheme, pattern, or have a unique concept in mind, we can create a custom solution that meets your requirements while maintaining optimal functionality.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gunmetal p-6 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="font-heading text-xl font-bold mb-3">How do I care for my Duracoated firearm?</h3>
              <p className="text-gray-300">
                Duracoat is extremely durable and requires minimal maintenance. Regular cleaning with standard gun cleaning products is sufficient. Avoid harsh chemicals or abrasive materials that could potentially damage the finish. For specific care instructions tailored to your particular piece, please contact us directly.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="bg-medium-gray p-12 rounded-sm shadow-luxury text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Have More <span className="text-tan">Questions?</span></h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We're here to help. Contact us for more information about our products, services, or to discuss your specific project needs.
          </p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <a href="mailto:info@carnimore.com" className="bg-tan text-black hover:bg-opacity-90 font-medium transition-all duration-300 angular-button px-8 py-4 text-lg">
              Email Us
            </a>
            <a href="tel:+16233887069" className="bg-transparent border-2 border-tan text-tan hover:bg-tan hover:bg-opacity-10 font-medium transition-all duration-300 angular-button px-8 py-4 text-lg">
              Call (623) 388-7069
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoPage;