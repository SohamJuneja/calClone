'use client';

import { useEffect, useState } from 'react';
import { Menu, Zap } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

interface UserData {
  name: string;
  email: string;
  username: string;
  avatar?: string | null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/user')
      .then((r) => r.json())
      .then((res) => { if (res.success) setUser(res.data); })
      .catch(() => null);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (handles its own desktop/mobile visibility) */}
      <Sidebar
        user={user ?? undefined}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area — shifted right on desktop to clear the fixed sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px]">
        {/* ── Mobile top bar ── */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base">CalBook</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm',
          duration: 4000,
          style: { borderRadius: '10px', border: '1px solid #e2e8f0' },
        }}
      />
    </div>
  );
}
