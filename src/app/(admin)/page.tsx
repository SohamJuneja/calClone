import { redirect } from 'next/navigation';

// Root "/" is handled by app/page.tsx.
// This file satisfies Next.js route-group conventions without re-exporting,
// which would break the production file tracer.
export default function AdminRoot() {
  redirect('/event-types');
}
