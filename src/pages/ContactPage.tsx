import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, AlertCircle } from 'lucide-react';
import Button from '../components/Button';

type InquiryType = 
  | 'Existing Order Update' 
  | 'Duracoat Services' 
  | 'Product Request' 
  | 'Training Inquiry' 
  | 'Custom Firearm' 
  | 'NFA Items' 
  | 'Other';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '' as InquiryType | '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    success: boolean;
    message: string;
  }>({
    submitted: false,
    success: false,
    message: '',
  });

  const inquiryTypes: InquiryType[] = [
    'Existing Order Update',
    'Duracoat Services',
    'Product Request',
    'Training Inquiry',
    'Custom Firearm',
    'NFA Items',
    'Other'
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.inquiryType || !formData.message) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Please fill out all required fields.',
      });
      return;
    }
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Thank you for your message. We will get back to you shortly.',
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: '',
        message: '',
      });
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setFormStatus({
          submitted: false,
          success: false,
          message: '',
        });
      }, 5000);
    }, 1000);
  };

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
            Contact <span className="text-tan">Us</span>
          </motion.h1>
          <motion.div 
            className="w-24 h-0.5 bg-tan mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
          <motion.p
            className="text-xl max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Have questions or need assistance? We're here to help. Reach out to us using the form below or through our contact information.
          </motion.p>
        </div>

        {/* Contact Information and Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Contact Information */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="bg-medium-gray p-8 rounded-sm shadow-luxury h-full">
              <h2 className="font-heading text-2xl font-bold mb-6">Get in <span className="text-tan">Touch</span></h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="text-tan mr-4 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-bold mb-1">Our Location</h3>
                    <p className="text-gray-300">
                      1234 Precision Ave, Suite 500<br />
                      Phoenix, AZ 85001
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-tan mr-4 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-bold mb-1">Phone</h3>
                    <p className="text-gray-300">
                      <a href="tel:+16233887069" className="hover:text-tan transition-colors">
                        (623) 388-7069
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-tan mr-4 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p className="text-gray-300">
                      <a href="mailto:info@carnimore.com" className="hover:text-tan transition-colors">
                        info@carnimore.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h3 className="font-heading text-xl font-bold mb-4">Business Hours</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday:</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-medium-gray p-8 rounded-sm shadow-luxury">
              <h2 className="font-heading text-2xl font-bold mb-6">Send Us a <span className="text-tan">Message</span></h2>
              
              {formStatus.submitted && (
                <div className={`mb-6 p-4 rounded-sm ${formStatus.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
                  <div className="flex items-center">
                    <AlertCircle className={`mr-2 ${formStatus.success ? 'text-green-400' : 'text-red-400'}`} size={20} />
                    <p className={formStatus.success ? 'text-green-300' : 'text-red-300'}>
                      {formStatus.message}
                    </p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name <span className="text-tan">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address <span className="text-tan">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-300 mb-1">
                      Inquiry Type <span className="text-tan">*</span>
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                      required
                    >
                      <option value="" disabled>Select an inquiry type</option>
                      {inquiryTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message <span className="text-tan">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-tan text-black hover:bg-opacity-90 font-medium transition-all duration-300 angular-button px-8 py-3 text-base flex items-center"
                  >
                    <Send size={18} className="mr-2" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
        
        {/* Map Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">Find <span className="text-tan">Us</span></h2>
          
          <div className="bg-gunmetal p-4 rounded-sm shadow-luxury">
            <div className="aspect-w-16 aspect-h-9 w-full h-[400px] bg-dark-gray rounded-sm overflow-hidden">
              {/* Placeholder for map - in a real implementation, you would use Google Maps or another mapping service */}
              <div className="w-full h-full flex items-center justify-center bg-dark-gray">
                <div className="text-center">
                  <MapPin className="text-tan mx-auto mb-4" size={40} />
                  <p className="text-gray-300 mb-2">1234 Precision Ave, Suite 500</p>
                  <p className="text-gray-300">Phoenix, AZ 85001</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* FAQ Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked <span className="text-tan">Questions</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gunmetal p-6 rounded-sm shadow-luxury">
              <h3 className="font-heading text-xl font-bold mb-3">What is your turnaround time for custom work?</h3>
              <p className="text-gray-300">
                Turnaround time varies depending on the complexity of the project and our current workload. Typically, custom Duracoat applications take 3-4 weeks from approval to completion, as we ensure proper curing time for optimal durability.
              </p>
            </div>
            
            <div className="bg-gunmetal p-6 rounded-sm shadow-luxury">
              <h3 className="font-heading text-xl font-bold mb-3">Do you ship internationally?</h3>
              <p className="text-gray-300">
                Yes, we do ship internationally for non-firearm products such as accessories and apparel. For firearms and regulated items, international shipping is subject to export controls and the laws of the destination country. Please contact us for specific information.
              </p>
            </div>
            
            <div className="bg-gunmetal p-6 rounded-sm shadow-luxury">
              <h3 className="font-heading text-xl font-bold mb-3">How do I place an order for a custom firearm?</h3>
              <p className="text-gray-300">
                Custom firearm orders begin with a consultation. Contact us through this form, selecting "Custom Firearm" as your inquiry type, or call us directly. We'll discuss your requirements, provide a quote, and guide you through the ordering process.
              </p>
            </div>
            
            <div className="bg-gunmetal p-6 rounded-sm shadow-luxury">
              <h3 className="font-heading text-xl font-bold mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-300">
                We accept all major credit cards, wire transfers, and certified checks. For custom orders, we typically require a 50% deposit to begin work, with the balance due before shipping or pickup.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Call to Action */}
        <motion.div
          className="bg-medium-gray p-12 rounded-sm shadow-luxury text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Ready for a <span className="text-tan">Consultation?</span></h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Schedule a personalized consultation with our experts to discuss your specific requirements and explore custom solutions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="tel:+16233887069" className="bg-tan text-black hover:bg-opacity-90 font-medium transition-all duration-300 angular-button px-8 py-4 text-lg inline-flex items-center justify-center">
              <Phone size={20} className="mr-2" />
              Call Now
            </a>
            <a href="mailto:info@carnimore.com" className="bg-transparent border-2 border-tan text-tan hover:bg-tan hover:bg-opacity-10 font-medium transition-all duration-300 angular-button px-8 py-4 text-lg inline-flex items-center justify-center">
              <Mail size={20} className="mr-2" />
              Email Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;