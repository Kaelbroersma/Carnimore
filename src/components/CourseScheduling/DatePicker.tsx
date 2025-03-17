import React from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addDays, isFriday, isSaturday, addWeeks, addMonths } from 'date-fns';
import { Calendar } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateSelect }) => {
  // Get today's date
  const today = new Date();
  
  // Calculate the start date (1 week from today)
  const fromDate = addWeeks(today, 1);
  
  // Calculate the end date (3 months from today)
  const toDate = addMonths(today, 3);

  // Custom CSS for the calendar
  const calendarClassNames = {
    root: 'bg-gunmetal p-6 rounded-sm shadow-luxury w-full',
    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center',
    month: 'space-y-4 w-full',
    caption: 'flex justify-center pt-1 relative items-center',
    caption_label: 'text-sm font-medium text-white',
    nav: 'space-x-1 flex items-center',
    nav_button: 'h-7 w-7 bg-transparent text-gray-400 hover:text-white hover:bg-gunmetal-light rounded-sm transition-colors',
    nav_button_previous: 'absolute left-1',
    nav_button_next: 'absolute right-1',
    table: 'w-full border-collapse space-y-1',
    head_row: 'flex justify-center',
    head_cell: 'text-gray-400 rounded-sm w-10 font-normal text-sm',
    row: 'flex w-full mt-2 justify-center',
    cell: 'text-center text-sm relative p-0 rounded-sm w-10 h-10 flex items-center justify-center hover:bg-tan/10 transition-colors',
    day: 'h-10 w-10 p-0 font-normal',
    day_selected: 'bg-tan text-black hover:bg-tan hover:text-black',
    day_today: 'text-tan font-bold',
    day_outside: 'text-gray-600',
    day_disabled: 'text-gray-500 opacity-50 cursor-not-allowed hover:bg-transparent',
    day_range_middle: 'aria-selected:bg-tan aria-selected:text-black',
    day_hidden: 'invisible',
  };

  // Function to determine if a date should be disabled
  const disabledDays = (date: Date) => {
    // Disable dates before one week from now
    if (date < fromDate) return true;
    
    // Disable dates after 3 months
    if (date > toDate) return true;
    
    // Only allow Fridays and Saturdays
    return !(isFriday(date) || isSaturday(date));
  };

  return (
    <div className="bg-gunmetal p-6 rounded-sm shadow-luxury">
      <div className="flex items-center mb-4">
        <Calendar className="text-tan mr-2" size={20} />
        <h3 className="font-heading text-lg font-bold">Select a Date</h3>
      </div>
      
      <style>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #BEA987;
          --rdp-background-color: #1E2529;
          margin: 0;
          width: 100%;
        }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: rgba(190, 169, 135, 0.1);
        }
        .rdp-months {
          justify-content: center;
        }
      `}</style>
      
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect(date)}
        disabled={disabledDays}
        fromDate={fromDate}
        toDate={toDate}
        classNames={calendarClassNames}
        showOutsideDays={false}
        footer={
          <p className="mt-4 text-sm text-gray-400 text-center">
            Only Fridays and Saturdays are available for booking.
            <br />
            Bookings must be made at least one week in advance.
          </p>
        }
      />
    </div>
  );
};

export default DatePicker;