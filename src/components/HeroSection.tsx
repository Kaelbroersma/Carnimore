import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from './Button';
import { useMobileDetection } from './MobileDetection';

const HeroSection: React.FC = () => {
  const isMobile = useMobileDetection();
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => setWindowHeight(window.innerHeight);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Reduce parallax effect strength on mobile
  const parallaxStrength = isMobile ? 0.15 : 0.5;
  const backgroundY = useTransform(scrollY, [0, windowHeight], [0, windowHeight * parallaxStrength], {
    clamp: true // Clamp values to prevent overscroll
  });
  const contentY = useTransform(scrollY, [0, windowHeight], [0, windowHeight * (parallaxStrength / 2)], {
    clamp: true
  });
  const overlayOpacity = useTransform(scrollY, [0, windowHeight * 0.8], [0.3, 0.9]);

  // Simpler animation variants for mobile
  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: isMobile ? 0.4 : 0.6,
        ease: "easeOut"
      }
    })
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-primary" />

      {/* Carbon fiber pattern overlay */}
      <div 
        className="absolute inset-0 bg-repeat opacity-20"
        style={{
          backgroundImage: 'url("/img/real-carbon-fibre.png")',
          backgroundSize: '200px',
          mixBlendMode: 'screen'
        }}
      />

      {/* Hero Image Container with Parallax */}
      <motion.div 
        className="absolute inset-0 z-5 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/img/Hero-Main.jpg")',
          filter: 'contrast(1.1) brightness(0.7)',
          y: backgroundY,
          willChange: 'transform' // Optimize for animations
        }}
      />
      
      {/* Overlay gradient for better text readability */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-primary z-5"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content Container with Parallax */}
      <motion.div 
        className="container relative z-10 px-4 md:px-6 flex items-center justify-center"
        style={{ 
          y: contentY,
          willChange: 'transform'
        }}
      >
        {/* Content Box with subtle backdrop */}
        <motion.div
          className="max-w-4xl w-full text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          transition={{ duration: isMobile ? 0.4 : 0.6 }}
        >
          {/* Decorative elements - hide on mobile */}
          {!isMobile && (
            <>
              <motion.div 
                className="absolute -top-10 -left-10 w-20 h-20 border-l-2 border-t-2 border-tan opacity-60"
                variants={headingVariants}
                custom={2}
              />
              
              <motion.div 
                className="absolute -bottom-10 -right-10 w-20 h-20 border-r-2 border-b-2 border-tan opacity-60"
                variants={headingVariants}
                custom={2}
              />
            </>
          )}

          {/* Main heading with staggered animation */}
          <motion.h1 
            className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight"
            variants={headingVariants}
            custom={0}
          >
            <motion.span 
              className="block"
              variants={headingVariants}
              custom={1}
            >
              Custom Quality
            </motion.span>
            <motion.span 
              className="text-tan block"
              variants={headingVariants}
              custom={2}
            >
              You Can Rely On
            </motion.span>
          </motion.h1>
          
          {/* Divider line */}
          <motion.div 
            className="w-16 md:w-24 h-0.5 bg-tan mx-auto mb-6 md:mb-8"
            initial={{ width: 0 }}
            animate={{ width: isMobile ? 64 : 96 }}
            transition={{ duration: isMobile ? 0.4 : 0.8, delay: 0.6 }}
          />
          
          <motion.p
            className="text-gray-200 text-base md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
            variants={headingVariants}
            custom={3}
          >
            We hold ourselves to the highest of standards, innovating the industry since the year 2000. 
            We supply many local and global companies with a variety of innovative products, created with 
            the greatest degree of precision and care.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            variants={headingVariants}
            custom={4}
          >
            <Button to="/shop" variant="primary" size={isMobile ? "md" : "lg"}>
              Explore Collection
            </Button>
            <Button to="/about" variant="outline" size={isMobile ? "md" : "lg"}>
              Our Craftsmanship
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator - simplified animation on mobile */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: isMobile ? 0.4 : 1, delay: 1.2 }}
      >
        <p className="text-tan text-xs md:text-sm mb-2 font-medium tracking-wider">Scroll to discover</p>
        <motion.div 
          className="w-0.5 h-6 md:h-10 bg-tan/50"
          animate={{ 
            height: isMobile ? [8, 24, 8] : [10, 40, 10],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: isMobile ? 1.5 : 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;