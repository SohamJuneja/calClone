'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import EventTypeCard from '@/components/event-types/EventTypeCard';
import EventTypeModal from '@/components/event-types/EventTypeModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface EventType {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  duration: number;
  color: string;
  location?: string | null;
  isActive: boolean;
  _count?: { bookings: number };
}

const DEFAULT_USERNAME = 'john';

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingET, setEditingET]   = useState<EventType | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchEventTypes = useCallback(async () => {
    try {
      const res  = await fetch('/api/event-types');
      const data = await res.json();
      if (data.success) setEventTypes(data.data);
    } catch {
      toast.error('Failed to load event types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEventTypes(); }, [fetchEventTypes]);

  const handleSave = async (formData: {
    title: string; slug: string; description: string;
    duration: number; color: string; location: string;
  }) => {
    try {
      const url    = editingET ? `/api/event-types/${editingET.id}` : '/api/event-types';
      const method = editingET ? 'PATCH' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.error ?? 'Failed to save'); return; }
      toast.success(editingET ? 'Event type updated!' : 'Event type created!');
      setModalOpen(false);
      setEditingET(null);
      await fetchEventTypes();
    } catch { toast.error('Something went wrong'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/event-types/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.error ?? 'Failed to delete'); return; }
      toast.success('Event type deleted');
      setDeleteId(null);
      await fetchEventTypes();
    } catch { toast.error('Something went wrong'); }
    finally { setDeleting(false); }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/${DEFAULT_USERNAME}/${slug}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create event types that let people book time with you.
          </p>
        </div>
        <button
          onClick={() => { setEditingET(null); setModalOpen(true); }}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          New Event Type
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
            <Calendar className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No event types yet</h2>
          <p className="text-sm text-gray-500 max-w-xs mb-6">
            Create your first event type so people can start booking time with you.
          </p>
          <button
            onClick={() => { setEditingET(null); setModalOpen(true); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Create Event Type
          </button>
        </div>
      ) : (
        /* Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {eventTypes.map((et) => (
            <EventTypeCard
              key={et.id}
              eventType={et}
              username={DEFAULT_USERNAME}
              onEdit={(et) => { setEditingET(et); setModalOpen(true); }}
              onDelete={(id) => setDeleteId(id)}
              onCopyLink={handleCopyLink}
            />
          ))}
        </div>
      )}

      <EventTypeModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingET(null); }}
        onSave={handleSave}
        editingEventType={editingET}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event Type"
        description="Are you sure you want to delete this event type? All associated bookings will also be deleted. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
