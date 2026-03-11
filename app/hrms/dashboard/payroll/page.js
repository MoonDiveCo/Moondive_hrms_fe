'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PayrollIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/hrms/dashboard/payroll/salary-structures');
  }, [router]);
  return null;
}
