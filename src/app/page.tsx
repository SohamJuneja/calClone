import { redirect } from 'next/navigation';

// Redirect root to event-types dashboard (mirrors Cal.com's URL structure)
export default function RootPage() {
  redirect('/event-types');
}
