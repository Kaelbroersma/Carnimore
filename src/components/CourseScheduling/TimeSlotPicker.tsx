import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';

interface TimeSlotPickerProps {
  selectedDate: Date;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ selectedDate }) => {
  const { generateTimeSlots, setSelectedTimeSlot, selectedTimeSlot, isTimeSlotAvailable } = useCourseStore();
  
  const timeSlots = generateTimeSlots(selectedDate);

  return (
    <div className="bg-gunmetal p-6 rounded-sm shadow-luxury">
      <div className="flex items-center mb-4">
        <Clock className="text-tan mr-2" size={20} />
        <h3 className="font-heading text-lg font-bold">Select a Time</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {timeSlots.map((slot) => {
          const isSelected = selectedTimeSlot?.id === slot.id;
          const isAvailable = isTimeSlotAvailable(slot);
          
          return (
            <button
              key={slot.id}
              onClick={() => isAvailable && setSelectedTimeSlot(slot)}
              disabled={!isAvailable}
              className={`p-4 rounded-sm transition-colors ${
                isSelected
                  ? 'bg-tan text-black'
                  : isAvailable
                  ? 'bg-dark-gray hover:bg-tan/10'
                  : 'bg-gray-800 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-lg font-bold">
                {slot.startTime} - {slot.endTime}
              </div>
              <div className="text-sm mt-1">
                {isAvailable ? '2 Hour Session' : 'Unavailable'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotPicker;