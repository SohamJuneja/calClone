'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Clock, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDurationLabel } from '@/lib/utils';

interface BookingFormProps {
  eventTypeId: string;
  eventTitle: string;
  duration: number;
  location?: string | null;
  color: string;
  selectedSlot: string; // ISO
  onBack: () => void;
}

export default function BookingForm({
  eventTypeId,
  eventTitle,
  duration,
  location,
  color,
  selectedSlot,
  onBack,
}: BookingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', notes: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);

  const slotDate = new Date(selectedSlot);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTypeId,
          bookerName: form.name.trim(),
          bookerEmail: form.email.trim().toLowerCase(),
          startTime: selectedSlot,
          notes: form.notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Booking failed. Please try again.');
        return;
      }

      // Navigate to confirmation page with booking details
      const params = new URLSearchParams({
        uid: data.data.uid,
        name: form.name,
        email: form.email,
        event: eventTitle,
        start: selectedSlot,
        duration: String(duration),
        location: location ?? '',
      });

      router.push(`/booking/confirmed?${params.toString()}`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Booking summary */}
      <div className="card p-5 mb-6">
        <div className="flex items-start gap-3">
          <div
            className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-gray-900">{eventTitle}</p>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{getDurationLabel(duration)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(slotDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{format(slotDate, 'h:mm a')}</span>
            </div>
            {location && (
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your details</h2>

        <div>
          <label className="form-label">Your name *</label>
          <input
            className="form-input"
            placeholder="Jane Smith"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            disabled={loading}
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        <div>
          <label className="form-label">Email address *</label>
          <input
            type="email"
            className="form-input"
            placeholder="jane@example.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            disabled={loading}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div>
          <label className="form-label">Additional notes</label>
          <textarea
            className="form-input resize-none"
            rows={3}
            placeholder="Anything you'd like to share before the meeting…"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full justify-center py-3 text-base"
          disabled={loading}
        >
          {loading ? 'Confirming…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}
