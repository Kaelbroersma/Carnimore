import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'James Anderson',
    title: 'Professional Marksman',
    quote: "The attention to detail in my custom Sovereign Elite is unmatched. The balance, precision, and craftsmanship exceed anything I've experienced in 20 years of competition.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 2,
    name: 'Elizabeth Chambers',
    title: 'Collector',
    quote: "My Obsidian Collection piece isn't just a firearm, it's a work of art. The desert tan inlays and hand-engraved detailing showcase Carnimore's commitment to excellence.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    name: 'Michael Reynolds',
    title: 'Security Consultant',
    quote: "Reliability is non-negotiable in my line of work. Carnimore delivers firearms that perform flawlessly under pressure, time after time. Worth every penny.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-primary">
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
            Client <span className="text-tan">Testimonials</span>
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Hear from our clients about their experience with Carnimore's custom firearms and exceptional service.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-gunmetal p-8 rounded-sm shadow-luxury relative angular-border-reverse"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Quote className="absolute top-6 right-6 text-tan opacity-20" size={40} />
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-heading font-bold text-lg">{testimonial.name}</h3>
                  <p className="text-gray-400 text-sm">{testimonial.title}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="text-tan" size={16} fill="#BEA987" />
                ))}
              </div>
              <p className="text-gray-300 italic">{testimonial.quote}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;