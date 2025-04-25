'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (type === 'recovery' || type === 'invite') {
      // Handle password reset or invite
      router.push('/auth/reset-password');
      return;
    }

    if (token) {
      // Email verification successful
      setMessage('Your email has been verified successfully!');
      setIsSuccess(true);
    } else if (email) {
      // Verification link sent
      setMessage(`We've sent a verification link to ${email}. Please check your inbox and click the link to verify your account.`);
      setIsSuccess(false);
    } else {
      // Default message
      setMessage('Please check your email for the verification link.');
      setIsSuccess(false);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSuccess ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isSuccess ? 'Ready to get started?' : 'Need help?'}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={isSuccess ? '/auth/login' : '/auth/register'}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSuccess ? 'Go to Login' : 'Create New Account'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 