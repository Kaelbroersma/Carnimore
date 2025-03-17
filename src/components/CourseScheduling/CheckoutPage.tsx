import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import ReservationTimer from './ReservationTimer';
import PaymentForm from './PaymentForm';

interface CheckoutPageProps {
  onExpire: () => void;
  onComplete: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onExpire, onComplete }) => {
  const { selectedCourse, selectedTimeSlot, userInfo } = useCourseStore();

  if (!selectedTimeSlot || !userInfo) return null;

  const mockPricing = {
    coursePrice: 299.99,
    tax: 29.99,
    total: 329.98
  };

  return (
    <>
      <ReservationTimer onExpire={onExpire} />
      
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-gunmetal p-8 rounded-sm shadow-luxury mb-6">
          <h2 className="font-heading text-2xl font-bold mb-6">Order Summary</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-4 bg-dark-gray rounded-sm">
              <Calendar className="text-tan flex-shrink-0" size={24} />
              <div>
                <h3 className="font-medium mb-1">Selected Date</h3>
                <p className="text-gray-300">
                  {format(selectedTimeSlot.date, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-dark-gray rounded-sm">
              <Clock className="text-tan flex-shrink-0" size={24} />
              <div>
                <h3 className="font-medium mb-1">Time Slot</h3>
                <p className="text-gray-300">
                  {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-dark-gray rounded-sm">
              <DollarSign className="text-tan flex-shrink-0" size={24} />
              <div className="flex-grow">
                <h3 className="font-medium mb-3">Pricing Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Course Fee</span>
                    <span>${mockPricing.coursePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tax</span>
                    <span>${mockPricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gunmetal-light pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-tan">${mockPricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gunmetal p-8 rounded-sm shadow-luxury mb-6">
          <h2 className="font-heading text-2xl font-bold mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <span className="text-gray-300">Name:</span>
              <p className="font-medium">{userInfo.name}</p>
            </div>
            <div>
              <span className="text-gray-300">Email:</span>
              <p className="font-medium">{userInfo.email}</p>
            </div>
            {userInfo.phone && (
              <div>
                <span className="text-gray-300">Phone:</span>
                <p className="font-medium">{userInfo.phone}</p>
              </div>
            )}
            <div>
              <span className="text-gray-300">Selected Skills:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {userInfo.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-tan/10 text-tan px-3 py-1 rounded-sm text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {userInfo.comments && (
              <div>
                <span className="text-gray-300">Additional Comments:</span>
                <p className="mt-1 text-gray-300">{userInfo.comments}</p>
              </div>
            )}
          </div>
        </div>

        <PaymentForm onSubmit={onComplete} />
      </motion.div>
    </>
  );
};

export default CheckoutPage;