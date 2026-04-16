'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, addMinutes, parseISO } from 'date-fns';
import { CheckCircle, Calendar, Clock, MapPin, Mail, User, ArrowLeft, Printer } from 'lucide-react';
import { getDurationLabel } from '@/lib/utils';

function ConfirmationContent() {
  const params = useSearchParams();

  const uid      = params.get('uid') ?? '';
  const name     = params.get('name') ?? '';
  const email    = params.get('email') ?? '';
  const event    = params.get('event') ?? '';
  const startStr = params.get('start') ?? '';
  const duration = parseInt(params.get('duration') ?? '30', 10);
  const location = params.get('location') ?? '';

  const start = startStr ? parseISO(startStr) : new Date();
  const end   = addMinutes(start, duration);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success card */}
        <div className="card p-6 sm:p-8 text-center mb-4">
          {/* Checkmark */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 text-sm mb-6">
            A calendar invitation will be sent to{' '}
            <strong className="text-gray-700 break-all">{email}</strong>
          </p>

          {/* Details */}
          <div className="text-left space-y-3.5 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{event}</p>
                <p className="text-gray-500">{format(start, 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span className="text-gray-700">
                {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
                {' '}
                <span className="text-gray-400">({getDurationLabel(duration)})</span>
              </span>
            </div>

            {location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span className="text-gray-700">{location}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 break-all">{email}</span>
              </div>
            </div>
          </div>

          {uid && (
            <p className="text-xs text-gray-400 mt-4">
              Booking ID:{' '}
              <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                {uid.slice(0, 8)}…
              </code>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 flex-1 btn-secondary py-2.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 flex-1 btn-secondary py-2.5"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
