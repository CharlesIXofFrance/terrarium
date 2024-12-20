import React, { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/features/events/Calendar';
import { EventList } from '@/components/features/events/EventList';
import { Search, Filter } from 'lucide-react';
import { useEvents } from '@/lib/hooks/useEvents';

export function Events() {
  const [searchTerm, setSearchTerm] = useState('');
  const { events, isLoading } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredEvents = events?.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5 text-gray-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-6">
            <CalendarComponent
              events={events}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        </div>

        {/* Events List */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="text-center py-12">Loading events...</div>
          ) : (
            <EventList
              events={filteredEvents || []}
              selectedDate={selectedDate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
