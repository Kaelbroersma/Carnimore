import React from 'react';
import HeroSection from '../components/HeroSection';
import WhatWeDo from '../components/WhatWeDo';
import BrandStatement from '../components/BrandStatement';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import FeaturedModels from '../components/FeaturedModels';

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <BrandStatement />
      <WhatWeDo />
      <WhyChooseUs />
      <Testimonials />
      <FeaturedModels />
    </div>
  );
};

export default HomePage;