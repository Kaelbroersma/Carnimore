import { create } from 'zustand';
import { addMinutes, format, isWithinInterval, parse } from 'date-fns';

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isReserved: boolean;
  reservationExpiry?: Date;
}

interface CourseStore {
  selectedCourse: string | null;
  selectedTimeSlot: TimeSlot | null;
  reservationTimer: number | null;
  userInfo: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    comments: string;
  } | null;
  setSelectedCourse: (courseId: string | null) => void;
  setSelectedTimeSlot: (timeSlot: TimeSlot | null) => void;
  setReservationTimer: (timer: number | null) => void;
  setUserInfo: (info: CourseStore['userInfo']) => void;
  clearReservation: () => void;
  isTimeSlotAvailable: (timeSlot: TimeSlot) => boolean;
  generateTimeSlots: (date: Date) => TimeSlot[];
}

const RESERVATION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export const useCourseStore = create<CourseStore>((set, get) => ({
  selectedCourse: null,
  selectedTimeSlot: null,
  reservationTimer: null,
  userInfo: null,

  setSelectedCourse: (courseId) => set({ selectedCourse: courseId }),
  
  setSelectedTimeSlot: (timeSlot) => {
    if (timeSlot) {
      const expiryTime = new Date(Date.now() + RESERVATION_DURATION);
      set({ 
        selectedTimeSlot: { ...timeSlot, reservationExpiry: expiryTime },
        reservationTimer: RESERVATION_DURATION // Set initial timer value
      });
    } else {
      set({ selectedTimeSlot: null, reservationTimer: null });
    }
  },
  
  setReservationTimer: (timer) => set({ reservationTimer: timer }),
  
  setUserInfo: (info) => set({ userInfo: info }),
  
  clearReservation: () => set({
    selectedTimeSlot: null,
    reservationTimer: null,
    userInfo: null
  }),
  
  isTimeSlotAvailable: (timeSlot) => {
    const { selectedTimeSlot } = get();
    if (!selectedTimeSlot) return true;
    
    // Check if the time slot is already reserved and the reservation hasn't expired
    if (timeSlot.isReserved && timeSlot.reservationExpiry) {
      return new Date() > timeSlot.reservationExpiry;
    }
    
    return true;
  },
  
  generateTimeSlots: (date: Date) => {
    const slots: TimeSlot[] = [];
    const startHour = 7;
    const endHour = 14;
    
    for (let hour = startHour; hour < endHour; hour += 2) {
      const startTime = format(
        parse(`${hour}:00`, 'HH:mm', date),
        'HH:mm'
      );
      const endTime = format(
        parse(`${hour + 2}:00`, 'HH:mm', date),
        'HH:mm'
      );
      
      slots.push({
        id: `${format(date, 'yyyy-MM-dd')}-${startTime}`,
        date,
        startTime,
        endTime,
        isReserved: false
      });
    }
    
    return slots;
  }
}));