'use client';

import { useState } from 'react';
import { Clock, Link2, MoreVertical, Edit2, Trash2, Copy, Video, Phone, MapPin } from 'lucide-react';
import { cn, getDurationLabel } from '@/lib/utils';

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

interface EventTypeCardProps {
  eventType: EventType;
  username: string;
  onEdit: (et: EventType) => void;
  onDelete: (id: string) => void;
  onCopyLink: (slug: string) => void;
}

function LocationIcon({ location }: { location?: string | null }) {
  if (!location) return null;
  if (location.toLowerCase().includes('zoom') || location.toLowerCase().includes('meet')) {
    return <Video className="w-3.5 h-3.5" />;
  }
  if (location.toLowerCase().includes('phone')) {
    return <Phone className="w-3.5 h-3.5" />;
  }
  return <MapPin className="w-3.5 h-3.5" />;
}

export default function EventTypeCard({
  eventType,
  username,
  onEdit,
  onDelete,
  onCopyLink,
}: EventTypeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const publicUrl = `/${username}/${eventType.slug}`;

  return (
    // No overflow-hidden here — it clips the dropdown. Color bar uses border-l instead.
    <div
      className="card group relative flex rounded-xl"
      style={{ borderLeft: `4px solid ${eventType.color}` }}
    >
      <div className="flex-1 pl-4 pr-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-sm truncate mb-0.5">
              {eventType.title}
            </h3>

            {/* URL slug */}
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors mb-3 group/link"
            >
              <Link2 className="w-3 h-3 group-hover/link:text-brand-600" />
              <span className="truncate">/{username}/{eventType.slug}</span>
            </a>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {getDurationLabel(eventType.duration)}
              </span>
              {eventType.location && (
                <span className="flex items-center gap-1">
                  <LocationIcon location={eventType.location} />
                  {eventType.location}
                </span>
              )}
            </div>
          </div>

          {/* Actions dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop – closes menu on outside click */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                {/* Dropdown menu – z-20 so it floats above cards */}
                <div className="absolute right-0 top-9 z-20 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-fade-in">
                  <button
                    onClick={() => { onCopyLink(eventType.slug); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    Copy link
                  </button>
                  <button
                    onClick={() => { onEdit(eventType); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                    Edit
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => { onDelete(eventType.id); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer – booking count + view button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {eventType._count?.bookings ?? 0} booking{(eventType._count?.bookings ?? 0) !== 1 ? 's' : ''}
          </span>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            View booking page →
          </a>
        </div>
      </div>
    </div>
  );
}
