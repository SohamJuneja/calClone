'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DAYS_OF_WEEK, TIMEZONES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface DayAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

function generateTimeOptions() {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const period = h < 12 ? 'AM' : 'PM';
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayH}:${String(m).padStart(2, '0')} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

const defaultDays: DayAvailability[] = DAYS_OF_WEEK.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: '17:00',
  isAvailable: i >= 1 && i <= 5,
}));

export default function AvailabilityPage() {
  const [days, setDays]       = useState<DayAvailability[]>(defaultDays);
  const [timezone, setTimezone] = useState('America/New_York');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const fetchAvailability = useCallback(async () => {
    try {
      const res  = await fetch('/api/availability');
      const data = await res.json();
      if (data.success && data.data.days.length > 0) {
        setTimezone(data.data.timezone);
        const merged = defaultDays.map((def) => {
          const found = data.data.days.find((d: DayAvailability) => d.dayOfWeek === def.dayOfWeek);
          return found ?? def;
        });
        setDays(merged);
      }
    } catch {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  const toggleDay = (index: number) =>
    setDays((prev) => prev.map((d) => d.dayOfWeek === index ? { ...d, isAvailable: !d.isAvailable } : d));

  const updateDay = (index: number, field: 'startTime' | 'endTime', value: string) =>
    setDays((prev) => prev.map((d) => d.dayOfWeek === index ? { ...d, [field]: value } : d));

  const handleSave = async () => {
    for (const day of days) {
      if (day.isAvailable && day.startTime >= day.endTime) {
        toast.error(`End time must be after start time for ${DAYS_OF_WEEK[day.dayOfWeek]}`);
        return;
      }
    }
    setSaving(true);
    try {
      const res  = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone, days }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.error ?? 'Failed to save'); return; }
      toast.success('Availability saved!');
    } catch { toast.error('Something went wrong'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Availability</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set the times you're available for bookings each week.
        </p>
      </div>

      <div className="card p-4 sm:p-6 space-y-6">
        {/* Timezone */}
        <div>
          <label className="form-label">Timezone</label>
          <select
            className="form-input"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Working Hours</h3>

          <div className="space-y-2">
            {days.map((day) => (
              <div
                key={day.dayOfWeek}
                className={cn(
                  'flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl transition-colors',
                  day.isAvailable ? 'bg-gray-50' : 'bg-white opacity-60',
                )}
              >
                {/* Toggle + day name */}
                <div className="flex items-center gap-3 sm:w-36 flex-shrink-0">
                  <div
                    role="switch"
                    aria-checked={day.isAvailable}
                    onClick={() => toggleDay(day.dayOfWeek)}
                    className={cn(
                      'w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer relative flex-shrink-0',
                      day.isAvailable ? 'bg-brand-600' : 'bg-gray-300',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                        day.isAvailable && 'translate-x-4',
                      )}
                    />
                  </div>
                  <span className={cn(
                    'text-sm font-medium w-24',
                    day.isAvailable ? 'text-gray-900' : 'text-gray-400',
                  )}>
                    {DAYS_OF_WEEK[day.dayOfWeek]}
                  </span>
                </div>

                {/* Time range */}
                {day.isAvailable ? (
                  <div className="flex items-center gap-2 flex-1 ml-12 sm:ml-0">
                    <select
                      className="form-input text-xs py-1.5"
                      value={day.startTime}
                      onChange={(e) => updateDay(day.dayOfWeek, 'startTime', e.target.value)}
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <span className="text-gray-400 text-sm flex-shrink-0">–</span>
                    <select
                      className="form-input text-xs py-1.5"
                      value={day.endTime}
                      onChange={(e) => updateDay(day.dayOfWeek, 'endTime', e.target.value)}
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 ml-12 sm:ml-0">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2.5 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            These hours apply to all your event types. Time slots are generated based on your event
            duration and blocked when already booked.
          </p>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary w-full sm:w-auto justify-center" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
