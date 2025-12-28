'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useToast } from '@/components/ui/use-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const email = searchParams?.get('email');
  const token = searchParams?.get('token');
  
  useEffect(() => {
    if (email && token) {
      verifyEmail();
    } else {
      setError('Invalid verification link');
    }
  }, [email, token]);
  
  const verifyEmail = async () => {
    if (!email || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify email');
      }
      
      setIsVerified(true);
      toast({
        title: 'Email verified!',
        description: 'Your email has been successfully verified. You can now log in.',
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendVerification = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend verification email');
      }
      
      toast({
        title: 'Verification email sent!',
        description: 'Please check your email for the verification link.',
      });
      
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isVerified ? 'Email Verified!' : 'Verifying Email...'}
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Icons.spinner className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-destructive">
              <p className="mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={resendVerification}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Resend Verification Email
              </Button>
            </div>
          ) : isVerified ? (
            <p className="text-sm text-muted-foreground">
              Your email has been verified. Redirecting to login...
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
