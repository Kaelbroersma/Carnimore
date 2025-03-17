import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';

const AboutPage: React.FC = () => {
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
            About <span className="text-tan">Carnimore</span>
          </motion.h1>
          <motion.div 
            className="w-24 h-0.5 bg-tan mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
        </div>

        {/* Founder's Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              <img 
                src="/.netlify/images?url=/img/AboutUs-Joel.png"
                alt="Joel Broersma - CEO/Founder" 
                className="w-full h-[400px] object-cover rounded-sm angular-border shadow-luxury"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-tan opacity-60"></div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Our Founder's <span className="text-tan">Story</span></h2>
            <div className="space-y-4 text-gray-300">
              <p>
                "I've been studying and developing camouflage for about 30 years now. It's my passion. I developed a "system" that allows me to use any shape or colors for breakup. Not so much to mimic the given environment but to make the brain make assumptions about its nonexistence."
              </p>
              <p>
                "After much testing I settled on Duracoat as the medium, it's a great product, Milspec hardness, 2 part chemical coating that is weatherproof, chemical proof, self lubricating and holds 30% of its weight in oil. Amazing stuff. Sprays so thin that I can do 7-8 coats and still be thinner than all the ceramic bake on."
              </p>
              <p>
                "I hand decal and spray each one with an automotive HVLP sprayer. Duracoat is cured in about 3 weeks but continues to cure for 2 years or more."
              </p>
              <p>
                "Every one is one of a kind. I'm an artist and take your appreciation very seriously. And I'm a geek about it. 🤣"
              </p>
            </div>
          </motion.div>
        </div>

        {/* About the Team */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">About the <span className="text-tan">Team</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Joel Broersma - CEO/Founder */}
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury angular-border">
              <div className="relative mb-6">
                <img 
                  src="/img/Team-Joel.jpg"
                  alt="Joel Broersma"
                  className="w-full h-64 object-cover rounded-sm"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gunmetal to-transparent h-1/3"></div>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2 text-center">Joel Broersma</h3>
              <p className="text-tan text-center mb-4">CEO/Founder</p>
              <p className="text-gray-300 text-center">
                Visionary leader with over 30 years of experience in camouflage development and firearms customization.
              </p>
            </div>
            
            {/* Jeff Fraser - Pro Staff */}
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury angular-border">
              <div className="relative mb-6">
                <img 
                  src="/img/Team-Jeff.jpg"
                  alt="Jeff Fraser"
                  className="w-full h-64 object-cover rounded-sm"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gunmetal to-transparent h-1/3"></div>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2 text-center">Jeff Fraser</h3>
              <p className="text-tan text-center mb-4">Pro Staff</p>
              <p className="text-gray-300 text-center">
                Field testing specialist with extensive experience in evaluating and validating our custom solutions.
              </p>
            </div>
            
            {/* Daniel Dupuis - Pro Staff */}
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury angular-border">
              <div className="relative mb-6">
                <img 
                  src="/img/Team-Dan.jpg"
                  alt="Daniel Dupuis"
                  className="w-full h-64 object-cover rounded-sm"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gunmetal to-transparent h-1/3"></div>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2 text-center">Daniel Dupuis</h3>
              <p className="text-tan text-center mb-4">Pro Staff</p>
              <p className="text-gray-300 text-center">
                Expert field tester ensuring our products meet the highest standards of performance and reliability.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rest of the component remains unchanged */}
        {/* ... */}
      </div>
    </div>
  );
};

export default AboutPage;