import React from 'react';
import { motion } from 'framer-motion';

const LegalPage: React.FC = () => {
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
            Legal <span className="text-tan">Information</span>
          </motion.h1>
          <motion.div 
            className="w-24 h-0.5 bg-tan mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
        </div>

        {/* Legal Content */}
        <div className="mb-16 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-6">Compliance Statement</h2>
            <div className="bg-gunmetal p-8 rounded-sm">
              <p className="text-gray-300 mb-4">
                Carnimore operates in full compliance with all federal, state, and local laws regarding the manufacture, customization, and sale of firearms. We hold all necessary licenses and permits required by the Bureau of Alcohol, Tobacco, Firearms and Explosives (ATF) and other regulatory agencies.
              </p>
              <p className="text-gray-300">
                All firearms transactions are conducted in accordance with applicable laws, including background checks and proper transfer procedures through licensed firearms dealers (FFL holders).
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-6">NFA Items & Suppressor Sales</h2>
            <div className="bg-gunmetal p-8 rounded-sm">
              <p className="text-gray-300 mb-4">
                For items regulated under the National Firearms Act (NFA), such as suppressors, additional paperwork and tax stamps are required. We guide our customers through this process to ensure full compliance with all NFA regulations.
              </p>
              <div className="border-l-4 border-tan pl-4 my-6">
                <h3 className="text-xl font-bold mb-3">Important Suppressor Purchase Information:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• After purchase of a suppressor, you will be responsible for a $200 tax stamp payment at the time of e-filing with the ATF.</li>
                  <li>• You will need a digital EFT file for the e-filing process. This is a one-time requirement, and if you don't have one, we can provide services to help you obtain it.</li>
                  <li>• <span className="text-tan font-semibold">IMPORTANT:</span> If your application is not approved by the ATF, we do not offer refunds on ordered suppressors. The suppressor becomes the property of Carnimore, LLC.</li>
                </ul>
              </div>
              <p className="text-gray-300">
                Customers must comply with all applicable laws in their jurisdiction regarding the possession of NFA items. Some states have additional restrictions beyond federal requirements.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-6">Shipping & Transfer Policies</h2>
            <div className="bg-gunmetal p-8 rounded-sm">
              <p className="text-gray-300 mb-4">
                All firearms must be shipped to and transferred through a Federal Firearms License (FFL) holder. Customers are responsible for identifying a local FFL dealer to receive their firearm and complete the transfer in accordance with all applicable laws.
              </p>
              <p className="text-gray-300 mb-4">
                Non-firearm accessories and parts that are not regulated may be shipped directly to the customer, subject to any state or local restrictions.
              </p>
              <p className="text-gray-300">
                International shipping is subject to export controls and the laws of the destination country. Additional documentation and permits may be required.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-6">Warranty & Liability</h2>
            <div className="bg-gunmetal p-8 rounded-sm">
              <p className="text-gray-300 mb-4">
                Carnimore provides a limited warranty on workmanship and materials for our custom firearms and modifications. This warranty does not cover damage resulting from misuse, neglect, or unauthorized modifications.
              </p>
              <p className="text-gray-300 mb-4">
                Customers assume all responsibility for the safe and legal use of firearms purchased or modified by Carnimore. We are not liable for any damages, injuries, or legal issues arising from improper use, negligence, or illegal activities.
              </p>
              <p className="text-gray-300">
                For complete warranty details and limitations, please contact our customer service department.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <motion.div
          className="bg-medium-gray p-8 rounded-sm text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="font-heading text-xl font-bold mb-4">Legal Disclaimer</h3>
          <p className="text-gray-300 text-sm">
            The information provided on this page is for general informational purposes only and does not constitute legal advice. Laws regarding firearms vary by location and are subject to change. Customers are responsible for understanding and complying with all applicable laws in their jurisdiction.
          </p>
        </motion.div>

        {/* Contact for Legal Questions */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="font-heading text-2xl font-bold mb-6">Questions About <span className="text-tan">Legal Compliance?</span></h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            If you have specific questions about legal requirements or compliance issues, please contact our legal department for assistance.
          </p>
          <a href="mailto:legal@carnimore.com" className="bg-tan text-black hover:bg-opacity-90 font-medium transition-all duration-300 angular-button px-8 py-4 text-lg inline-block">
            Contact Legal Department
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalPage;