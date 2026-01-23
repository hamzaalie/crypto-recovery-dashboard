import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function TwoFactorPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verify2FA, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value.replace(/\D/g, '');
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const twoFactorCode = code.join('');
    
    if (twoFactorCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter all 6 digits.',
        variant: 'destructive',
      });
      return;
    }

    clearError();
    setIsLoading(true);
    
    try {
      await verify2FA(twoFactorCode);
      
      toast({
        title: 'Verification successful',
        description: 'You have been logged in.',
      });

      // Redirect based on role
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'support_agent') {
        navigate('/agent');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast({
        title: 'Verification failed',
        description: err.message || 'Invalid code',
        variant: 'destructive',
      });
      // Clear code and focus first input
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold"
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Open your authenticator app (Google Authenticator, Authy, etc.) 
              and enter the code for your account.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || code.some(d => !d)}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
