'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { slugify } from '@/lib/utils';
import { EVENT_COLORS, LOCATIONS } from '@/lib/constants';

interface EventTypeFormData {
  title: string;
  slug: string;
  description: string;
  duration: number;
  color: string;
  location: string;
}

interface EventType {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  duration: number;
  color: string;
  location?: string | null;
}

interface EventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventTypeFormData) => Promise<void>;
  editingEventType?: EventType | null;
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

export default function EventTypeModal({
  isOpen,
  onClose,
  onSave,
  editingEventType,
}: EventTypeModalProps) {
  const isEditing = !!editingEventType;

  const [form, setForm] = useState<EventTypeFormData>({
    title: '',
    slug: '',
    description: '',
    duration: 30,
    color: '#6366f1',
    location: 'Google Meet',
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<EventTypeFormData>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingEventType) {
        setForm({
          title: editingEventType.title,
          slug: editingEventType.slug,
          description: editingEventType.description ?? '',
          duration: editingEventType.duration,
          color: editingEventType.color,
          location: editingEventType.location ?? 'Google Meet',
        });
        setSlugEdited(true);
      } else {
        setForm({ title: '', slug: '', description: '', duration: 30, color: '#6366f1', location: 'Google Meet' });
        setSlugEdited(false);
      }
      setErrors({});
    }
  }, [isOpen, editingEventType]);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugEdited ? prev.slug : slugify(title),
    }));
  };

  const validate = (): boolean => {
    const errs: Partial<EventTypeFormData> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.slug.trim()) errs.slug = 'URL slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = 'Only lowercase letters, numbers, hyphens';
    if (form.duration < 5 || form.duration > 480) errs.duration = '5–480 minutes' as never;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Event Type' : 'New Event Type'}
      description={isEditing ? 'Update this event type.' : 'Create a new bookable event type.'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="form-label">Title *</label>
          <input
            className="form-input"
            placeholder="30 Minute Meeting"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>

        {/* URL Slug */}
        <div>
          <label className="form-label">URL Slug *</label>
          <div className="flex items-center">
            <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
              /john/
            </span>
            <input
              className="form-input rounded-l-none"
              placeholder="30min"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
              }}
            />
          </div>
          {errors.slug && <p className="form-error">{errors.slug}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="form-label">Description</label>
          <textarea
            className="form-input resize-none"
            rows={3}
            placeholder="Brief description of this event…"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="form-label">Duration *</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setForm((p) => ({ ...p, duration: d }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  form.duration === d
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
          <input
            type="number"
            className="form-input w-32"
            min={5}
            max={480}
            value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: parseInt(e.target.value) || 30 }))}
          />
          <p className="text-xs text-gray-400 mt-1">Or enter a custom value (5–480 min)</p>
          {errors.duration && <p className="form-error">{String(errors.duration)}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="form-label">Location</label>
          <select
            className="form-input"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="form-label">Color</label>
          <div className="flex gap-2 flex-wrap">
            {EVENT_COLORS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                title={label}
                onClick={() => setForm((p) => ({ ...p, color: value }))}
                className={`w-7 h-7 rounded-full transition-transform ${
                  form.color === value ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: value }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Event Type'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
