'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function WaitingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [status, setStatus] = useState('Verifying your membership...');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const { user } = await res.json();
          if (user) {
            // User is logged in, now check for membership
            const memberRes = await fetch('/api/check-membership');
            if (memberRes.ok) {
              const { isMember } = await memberRes.json();
              if (isMember) {
                clearInterval(interval);
                setStatus('Membership confirmed! Redirecting...');
                router.push(redirect || '/planner');
              } else {
                setStatus('Waiting for membership confirmation...');
              }
            } else {
              setStatus('Could not verify membership. Please wait...');
            }
          } else {
            // User is not logged in, redirect to login
            clearInterval(interval);
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setStatus('An error occurred. Please try again.');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router, redirect]);

  const handleManualRefresh = async () => {
    setStatus('Manually checking...');
    try {
      const memberRes = await fetch('/api/check-membership');
      if (memberRes.ok) {
        const { isMember } = await memberRes.json();
        if (isMember) {
          setStatus('Membership confirmed! Redirecting...');
          router.push(redirect || '/planner');
        } else {
          setStatus('Membership not yet active. Please wait a few moments.');
        }
      } else {
        setStatus('Could not verify membership. Please wait...');
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      setStatus('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{status}</h1>
        <p className="mt-2 text-sm text-gray-600">
          This should only take a few moments. Please don't close this page.
        </p>
        <div className="mt-6">
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}
