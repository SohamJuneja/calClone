'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isBefore,
  startOfDay,
  isSameMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  disabledDays?: number[]; // 0=Sun, 1=Mon, …, 6=Sat
  minDate?: Date;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function Calendar({
  selectedDate,
  onSelectDate,
  disabledDays = [],
  minDate,
}: CalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = startOfDay(new Date());
  const min = minDate ? startOfDay(minDate) : today;

  // Build the 6-week grid
  const monthStart = startOfMonth(viewDate);
  const monthEnd   = endOfMonth(viewDate);
  const gridStart  = startOfWeek(monthStart);
  const gridEnd    = endOfWeek(monthEnd);

  const weeks: Date[][] = [];
  let day = gridStart;
  while (day <= gridEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const isDisabled = (d: Date) =>
    isBefore(startOfDay(d), min) || disabledDays.includes(d.getDay());

  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-semibold text-gray-900">
          {format(viewDate, 'MMMM yyyy')}
        </h3>

        <button
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-gray-400 py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {weeks.flat().map((d, i) => {
          const disabled  = isDisabled(d);
          const isToday   = isSameDay(d, today);
          const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
          const isCurrentMonth = isSameMonth(d, viewDate);

          return (
            <button
              key={i}
              onClick={() => !disabled && onSelectDate(d)}
              disabled={disabled}
              aria-label={format(d, 'MMMM d, yyyy')}
              aria-pressed={isSelected}
              className={cn(
                'h-9 w-9 mx-auto flex items-center justify-center text-sm rounded-full transition-colors',
                !isCurrentMonth && 'opacity-20',
                disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-brand-50 hover:text-brand-700',
                isToday && !isSelected && 'font-bold text-brand-600',
                isSelected && 'bg-brand-600 text-white font-semibold hover:bg-brand-700',
              )}
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
