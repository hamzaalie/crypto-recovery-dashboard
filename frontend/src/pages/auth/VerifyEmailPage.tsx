import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // If the response includes auth tokens, log the user in
        if (response.data.accessToken) {
          // Store auth data
          useAuthStore.setState({
            user: response.data.user,
            token: response.data.accessToken,
            isAuthenticated: true,
          });
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [token]);

  // Countdown and redirect on success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/dashboard');
    }
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verifying Your Email</CardTitle>
              <CardDescription>Please wait while we verify your email address...</CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                Email Verified!
              </CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                Verification Failed
              </CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' && (
            <>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Redirecting to dashboard in {countdown} seconds...
              </div>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard Now
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <Link to="/verify-email-pending" className="block">
                <Button variant="outline" className="w-full">
                  Request New Verification Email
                </Button>
              </Link>
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
