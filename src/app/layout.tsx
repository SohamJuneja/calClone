import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CalBook – Scheduling Made Simple',
  description: 'A Cal.com-style scheduling platform. Create event types, set your availability, and let others book time with you.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
