'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, BookOpen, Grid, ExternalLink, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/event-types',  label: 'Event Types',  icon: Grid     },
  { href: '/availability', label: 'Availability', icon: Clock    },
  { href: '/bookings',     label: 'Bookings',     icon: BookOpen },
];

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    username: string;
    avatar?: string | null;
  };
  /** Mobile only: whether sidebar drawer is open */
  mobileOpen?: boolean;
  /** Mobile only: callback to close sidebar */
  onClose?: () => void;
}

export default function Sidebar({ user, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <aside
      className={cn(
        // Base styles shared between mobile & desktop
        'flex flex-col h-full bg-gray-900 text-white',
        // Desktop: fixed sidebar
        'lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-[240px] lg:z-40',
        // Mobile: full-height drawer (width controlled by parent)
        'w-[240px]',
      )}
    >
      {/* Logo + close button (mobile) */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">CalBook</span>
        </div>
        {/* Close button on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/event-types' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn('sidebar-nav-item', isActive && 'active')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      {user && (
        <div className="px-3 pb-4 border-t border-gray-800 pt-4">
          {/* Public profile link */}
          <a
            href={`/${user.username}/30min`}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-nav-item mb-3 w-full text-xs"
            onClick={onClose}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Page</span>
          </a>

          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {user.name[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* ── Desktop: always-visible fixed sidebar ── */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* ── Mobile: slide-in drawer with overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="relative animate-slide-in">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
