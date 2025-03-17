import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';

interface ReservationTimerProps {
  onExpire: () => void;
}

const ReservationTimer: React.FC<ReservationTimerProps> = ({ onExpire }) => {
  const { reservationTimer, setReservationTimer } = useCourseStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // Initialize timeLeft when reservationTimer changes
    if (reservationTimer !== null) {
      setTimeLeft(reservationTimer);
    }
  }, [reservationTimer]);

  useEffect(() => {
    if (timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1000) {
          clearInterval(interval);
          onExpire();
          return null;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  if (timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 bg-gunmetal z-50 p-4 shadow-luxury"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
    >
      <div className="container mx-auto flex items-center justify-center">
        <Timer className="text-tan mr-2" size={20} />
        <span className="font-medium">
          Your reservation is held for: <span className="text-tan">{formattedTime}</span>
        </span>
      </div>
    </motion.div>
  );
};

export default ReservationTimer;