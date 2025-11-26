'use client';

// Redirect to parent login page
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OtpLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return <div>Redirecting...</div>;
}
