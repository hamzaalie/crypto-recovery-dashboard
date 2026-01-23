import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  // Get email from location state
  const email = location.state?.email || '';

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email address not found. Please try registering again.',
        variant: 'destructive',
      });
      return;
    }

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setResendSuccess(true);
      toast({
        title: 'Email Sent',
        description: 'A new verification email has been sent to your inbox.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to resend verification email',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {email && (
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Verification email sent to:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">{email}</p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Check your inbox for the verification email
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Click the link in the email to verify your account
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                The link expires in 24 hours
              </p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Don't forget to check your spam folder if you don't see the email in your inbox.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || resendSuccess}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : resendSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Email Sent!
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
