'use client';

import { useEffect, useState, useCallback } from 'react';
import { BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import BookingCard from '@/components/bookings/BookingCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

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
  eventType: { title: string; duration: number; color: string; slug: string };
}

type TabKey = 'upcoming' | 'past' | 'cancelled';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'upcoming',  label: 'Upcoming',  icon: Clock       },
  { key: 'past',      label: 'Past',      icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle     },
];

export default function BookingsPage() {
  const [activeTab, setActiveTab]     = useState<TabKey>('upcoming');
  const [bookings, setBookings]       = useState<BookingData[]>([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [cancelId, setCancelId]       = useState<string | null>(null);
  const [cancelling, setCancelling]   = useState(false);

  const fetchBookings = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/bookings?status=${tab}&limit=50`);
      const data = await res.json();
      if (data.success) { setBookings(data.data.bookings); setTotal(data.data.total); }
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(activeTab); }, [activeTab, fetchBookings]);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      const res  = await fetch(`/api/bookings/${cancelId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by host' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.error ?? 'Failed to cancel'); return; }
      toast.success('Booking cancelled');
      setCancelId(null);
      await fetchBookings(activeTab);
    } catch { toast.error('Something went wrong'); }
    finally { setCancelling(false); }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all your scheduled appointments.</p>
      </div>

      {/* Tabs — scrollable on small screens */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit min-w-full sm:min-w-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-1 justify-center sm:flex-none sm:justify-start',
                activeTab === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} bookings</h2>
          <p className="text-sm text-gray-500">
            {activeTab === 'upcoming'
              ? 'When someone books time with you, it will appear here.'
              : `Your ${activeTab} bookings will appear here.`}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} booking{total !== 1 ? 's' : ''}</p>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={activeTab === 'upcoming' ? (id) => setCancelId(id) : undefined}
              />
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? The attendee will not be notified automatically."
        confirmLabel="Cancel Booking"
        loading={cancelling}
      />
    </div>
  );
}
