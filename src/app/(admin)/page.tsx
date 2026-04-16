'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This file must be a CLIENT component.
 *
 * Both app/page.tsx and app/(admin)/page.tsx resolve to "/".
 * Next.js uses app/page.tsx as the canonical route, but it still compiles
 * this file. When this is a server component with no client references,
 * Next.js skips generating (admin)/page_client-reference-manifest.js —
 * then the production file tracer throws ENOENT looking for it.
 *
 * Marking it 'use client' forces the manifest to be generated, and the
 * useRouter redirect ensures any edge case that lands here still works.
 */
export default function AdminRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/event-types');
  }, [router]);
  return null;
}
