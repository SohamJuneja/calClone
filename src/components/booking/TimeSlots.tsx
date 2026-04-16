'use client';

import { format } from 'date-fns';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface TimeSlot {
  time: string;     // ISO string
  label: string;    // "9:00 AM"
  available: boolean;
}

interface TimeSlotsProps {
  date: Date;
  slots: TimeSlot[];
  loading: boolean;
  selectedSlot: string | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export default function TimeSlots({
  date,
  slots,
  loading,
  selectedSlot,
  onSelectSlot,
}: TimeSlotsProps) {
  const available = slots.filter((s) => s.available);

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {format(date, 'EEEE, MMMM d')}
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : available.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-gray-500">No available slots on this day.</p>
          <p className="text-xs text-gray-400 mt-1">Try selecting another date.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {available.map((slot) => {
            const isSelected = selectedSlot === slot.time;
            return (
              <button
                key={slot.time}
                onClick={() => onSelectSlot(slot)}
                className={cn(
                  'w-full px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-150',
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400 hover:text-brand-700',
                )}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
