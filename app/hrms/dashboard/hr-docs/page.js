'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HRDocsIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/hrms/dashboard/hr-docs/templates');
  }, [router]);
  return null;
}
