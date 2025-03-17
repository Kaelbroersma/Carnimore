import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  disableAnimation?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', disableAnimation = false }) => {
  const logoSizes = {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 80, height: 80 }
  };

  const textSizes = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  return (
    <motion.div 
      className="flex items-center group cursor-pointer"
      whileHover={{ scale: disableAnimation ? 1 : 1.05 }}
      transition={{ 
        type: "tween", 
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      <div className="relative">
        <img 
          src="/img/Logo-Main.webp" 
          alt="Carnimore Logo" 
          width={logoSizes[size].width}
          height={logoSizes[size].height}
          className={`mr-2 transition-all duration-300 z-10 relative`}
          loading="eager"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-tan opacity-0 blur-xl group-hover:opacity-30 transition-all duration-500 z-0"></div>
      </div>
      <div className="relative overflow-hidden">
        <span className={`font-heading font-bold ${textSizes[size]} tracking-wider ${disableAnimation ? '' : 'group-hover:opacity-0 transition-opacity duration-300'}`}>
          CARNIMORE
        </span>
        
        {!disableAnimation && (
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div 
              className="w-full h-full transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"
              style={{ willChange: 'transform' }}
            >
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-white"></div>
                <div className="absolute inset-0">
                  <div className="absolute top-0 h-[14.3%] w-full bg-[#bf0a30]"></div>
                  <div className="absolute top-[28.6%] h-[14.3%] w-full bg-[#bf0a30]"></div>
                  <div className="absolute top-[57.2%] h-[14.3%] w-full bg-[#bf0a30]"></div>
                  <div className="absolute top-[85.8%] h-[14.3%] w-full bg-[#bf0a30]"></div>
                </div>
                <div className="absolute top-0 left-0 bottom-50 w-[40%] bg-[#002868] flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="grid grid-cols-5 grid-rows-9 gap-x-1 gap-y-0.5 w-[90%] h-[80%]">
                      {[...Array(50)].map((_, i) => (
                        <div key={i} className="flex items-center justify-center">
                          <span className="text-white text-[5px] leading-none">★</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Logo;