'use client';

import { format } from 'date-fns';
import { Clock, Mail, User, XCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { getDurationLabel } from '@/lib/utils';

interface BookingData {
  id: string;
  uid: string;
  bookerName: string;
  bookerEmail: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string | null;
  cancelReason?: string | null;
  eventType: {
    title: string;
    duration: number;
    color: string;
    slug: string;
  };
}

interface BookingCardProps {
  booking: BookingData;
  onCancel?: (id: string) => void;
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const start    = new Date(booking.startTime);
  const end      = new Date(booking.endTime);
  const canCancel = booking.status === 'CONFIRMED' && start > new Date();

  return (
    <div
      className="card overflow-hidden"
      style={{ borderLeft: `4px solid ${booking.eventType.color}` }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5 flex-1">
            {/* Title + badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm">{booking.eventType.title}</h3>
              <Badge status={booking.status} />
            </div>

            {/* Date + time */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
              <span className="font-medium">{format(start, 'EEE, MMM d, yyyy')}</span>
              <span className="text-gray-500">
                {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{getDurationLabel(booking.eventType.duration)}</span>
            </div>

            {/* Booker info — stacks on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{booking.bookerName}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <a
                  href={`mailto:${booking.bookerEmail}`}
                  className="hover:text-brand-600 transition-colors truncate"
                >
                  {booking.bookerEmail}
                </a>
              </span>
            </div>

            {/* Notes */}
            {booking.notes && (
              <p className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2 mt-2">
                &ldquo;{booking.notes}&rdquo;
              </p>
            )}

            {/* Cancel reason */}
            {booking.cancelReason && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {booking.cancelReason}
              </p>
            )}
          </div>

          {/* Cancel action */}
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 font-medium
                         px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-400
                         hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
