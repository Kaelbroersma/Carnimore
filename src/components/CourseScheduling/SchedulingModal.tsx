import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useCourseStore } from '../../store/courseStore';
import DatePicker from './DatePicker';
import TimeSlotPicker from './TimeSlotPicker';
import UserInfoForm from './UserInfoForm';
import CheckoutPage from './CheckoutPage';
import Button from '../Button';

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

type Step = 'date' | 'time' | 'info' | 'checkout';

const SchedulingModal: React.FC<SchedulingModalProps> = ({ isOpen, onClose, courseId }) => {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { setSelectedCourse, selectedTimeSlot, clearReservation } = useCourseStore();

  const handleClose = () => {
    clearReservation();
    setSelectedDate(null);
    setStep('date');
    onClose();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('time');
  };

  const handleExpire = () => {
    clearReservation();
    handleClose();
  };

  const handleComplete = () => {
    // Here you would typically handle the actual reservation
    clearReservation();
    handleClose();
  };

  const handleBack = () => {
    switch (step) {
      case 'time':
        setStep('date');
        break;
      case 'info':
        setStep('time');
        break;
      case 'checkout':
        setStep('info');
        break;
    }
  };

  const handleNext = () => {
    switch (step) {
      case 'time':
        if (selectedTimeSlot) {
          setStep('info');
        }
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-primary rounded-sm shadow-luxury max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sticky top-0 bg-primary z-10 px-6 py-4 border-b border-gunmetal flex justify-between items-center">
              <div className="flex items-center">
                {step !== 'date' && (
                  <button
                    onClick={handleBack}
                    className="mr-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={24} />
                  </button>
                )}
                <h2 className="font-heading text-2xl font-bold">
                  Schedule Training Session
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {selectedDate && step !== 'date' && (
              <div className="bg-gunmetal-dark px-6 py-3 border-b border-gunmetal">
                <p className="text-gray-300">
                  Selected Date: <span className="text-white font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                </p>
              </div>
            )}

            <div className="p-6">
              {step === 'date' && (
                <DatePicker
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              )}

              {step === 'time' && selectedDate && (
                <>
                  <TimeSlotPicker
                    selectedDate={selectedDate}
                  />
                  {selectedTimeSlot && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="primary"
                        onClick={handleNext}
                      >
                        Continue to Details
                      </Button>
                    </div>
                  )}
                </>
              )}

              {step === 'info' && (
                <UserInfoForm
                  onSubmit={() => setStep('checkout')}
                />
              )}

              {step === 'checkout' && (
                <CheckoutPage
                  onExpire={handleExpire}
                  onComplete={handleComplete}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SchedulingModal;