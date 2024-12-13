import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, getDay } from 'date-fns';
import type { Event } from '../../types/events';

interface CalendarProps {
  events: Event[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function Calendar({ events, selectedDate, onSelectDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  // Get all days including padding for complete weeks
  const startDay = getDay(startDate);
  const endDay = getDay(endDate);
  const days = eachDayOfInterval({
    start: addDays(startDate, -startDay),
    end: addDays(endDate, 6 - endDay)
  });

  const hasEvent = (date: Date) => {
    return events?.some(event => isSameDay(new Date(event.date), date));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const hasEventOnDay = hasEvent(day);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`
                h-10 rounded-lg flex items-center justify-center relative
                ${!isCurrentMonth && 'text-gray-300'}
                ${isSelected && 'bg-[#8B0000] text-white'}
                ${!isSelected && isToday(day) && 'border-2 border-[#8B0000]'}
                ${!isSelected && isCurrentMonth && 'hover:bg-gray-100'}
                ${hasEventOnDay && !isSelected && 'font-bold text-[#8B0000]'}
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasEventOnDay && !isSelected && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#8B0000]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}