'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Clock, MapPin, Globe, ChevronRight, Video, Phone, User } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Calendar from '@/components/booking/Calendar';
import TimeSlots from '@/components/booking/TimeSlots';
import BookingForm from '@/components/booking/BookingForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getDurationLabel } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  username: string;
  bio?: string | null;
  avatar?: string | null;
  timezone: string;
}

interface EventTypeData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  duration: number;
  color: string;
  location?: string | null;
}

interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

// Which panel is visible on mobile
type MobileStep = 'info' | 'calendar' | 'slots' | 'form';

function LocationIcon({ location }: { location?: string | null }) {
  if (!location) return <Globe className="w-4 h-4 text-gray-400" />;
  const l = location.toLowerCase();
  if (l.includes('zoom') || l.includes('meet') || l.includes('teams')) return <Video className="w-4 h-4 text-gray-400" />;
  if (l.includes('phone')) return <Phone className="w-4 h-4 text-gray-400" />;
  return <MapPin className="w-4 h-4 text-gray-400" />;
}

export default function PublicBookingPage() {
  const params = useParams<{ username: string; slug: string }>();

  const [user, setUser]             = useState<UserData | null>(null);
  const [eventType, setEventType]   = useState<EventTypeData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [disabledDays, setDisabledDays] = useState<number[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots]               = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Mobile step tracker: starts at calendar (info panel is shown above on mobile)
  const [mobileStep, setMobileStep] = useState<MobileStep>('calendar');

  // Fetch event type + availability
  useEffect(() => {
    if (!params.username || !params.slug) return;
    Promise.all([
      fetch(`/api/public/${params.username}/${params.slug}`).then((r) => r.json()),
      fetch('/api/availability').then((r) => r.json()),
    ])
      .then(([etRes, availRes]) => {
        if (!etRes.success) { setNotFound(true); return; }
        setUser(etRes.data.user);
        setEventType(etRes.data.eventType);
        if (availRes.success) {
          const unavailable = availRes.data.days
            .filter((d: { isAvailable: boolean }) => !d.isAvailable)
            .map((d: { dayOfWeek: number }) => d.dayOfWeek);
          setDisabledDays(unavailable);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setPageLoading(false));
  }, [params.username, params.slug]);

  // Fetch slots when date selected
  useEffect(() => {
    if (!selectedDate || !eventType) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    fetch(`/api/public/${params.username}/${params.slug}/slots?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setSlots(data.data); })
      .catch(() => null)
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, eventType, params.username, params.slug]);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notFound || !user || !eventType) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500">This booking page doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // ── Event info panel (shared across all layouts) ───────────────────────
  const EventInfoPanel = () => (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">@{user.username}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 mb-3">
          <div
            className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: eventType.color }}
          />
          <h1 className="text-lg font-bold text-gray-900">{eventType.title}</h1>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{getDurationLabel(eventType.duration)}</span>
          </div>
          {eventType.location && (
            <div className="flex items-center gap-2">
              <LocationIcon location={eventType.location} />
              <span>{eventType.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{user.timezone.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {eventType.description && (
          <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100 leading-relaxed">
            {eventType.description}
          </p>
        )}
      </div>

      {user.bio && (
        <div className="card p-4">
          <p className="text-xs text-gray-500 leading-relaxed">{user.bio}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '10px' } }} />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb top bar */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900 truncate">{user.name}</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{eventType.title}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* ── Desktop layout: side-by-side ── */}
          <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Left panel */}
            <EventInfoPanel />

            {/* Right panel */}
            <div className="card p-6">
              {mobileStep === 'form' && selectedSlot ? (
                <BookingForm
                  eventTypeId={eventType.id}
                  eventTitle={eventType.title}
                  duration={eventType.duration}
                  location={eventType.location}
                  color={eventType.color}
                  selectedSlot={selectedSlot}
                  onBack={() => { setMobileStep('calendar'); setSelectedSlot(null); }}
                />
              ) : (
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Select a Date</h2>
                    <Calendar
                      selectedDate={selectedDate}
                      onSelectDate={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
                      disabledDays={disabledDays}
                    />
                  </div>
                  <div>
                    {selectedDate ? (
                      <>
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Select a Time</h2>
                        <TimeSlots
                          date={selectedDate}
                          slots={slots}
                          loading={slotsLoading}
                          selectedSlot={selectedSlot}
                          onSelectSlot={(slot) => { setSelectedSlot(slot.time); setMobileStep('form'); }}
                        />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <Clock className="w-8 h-8 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-400">Select a date to see available times</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile/Tablet layout: stacked ── */}
          <div className="lg:hidden space-y-4">
            {/* Event info always shown on mobile */}
            <EventInfoPanel />

            {mobileStep === 'form' && selectedSlot ? (
              /* Booking form */
              <div className="card p-4 sm:p-6">
                <BookingForm
                  eventTypeId={eventType.id}
                  eventTitle={eventType.title}
                  duration={eventType.duration}
                  location={eventType.location}
                  color={eventType.color}
                  selectedSlot={selectedSlot}
                  onBack={() => { setMobileStep('slots'); setSelectedSlot(null); }}
                />
              </div>
            ) : mobileStep === 'slots' && selectedDate ? (
              /* Time slots panel */
              <div className="card p-4 sm:p-6">
                <button
                  onClick={() => setMobileStep('calendar')}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Change date
                </button>
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  Select a time for{' '}
                  <span className="text-brand-600">{format(selectedDate, 'MMM d')}</span>
                </h2>
                <TimeSlots
                  date={selectedDate}
                  slots={slots}
                  loading={slotsLoading}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(slot) => { setSelectedSlot(slot.time); setMobileStep('form'); }}
                />
              </div>
            ) : (
              /* Calendar panel */
              <div className="card p-4 sm:p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Select a Date</h2>
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                    setMobileStep('slots');
                  }}
                  disabledDays={disabledDays}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
