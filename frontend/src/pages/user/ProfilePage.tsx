import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatDate, cn } from '@/lib/utils';
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  Key,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  QrCode,
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const passwordRequirements = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[A-Z]/, label: 'One uppercase letter' },
  { regex: /[a-z]/, label: 'One lowercase letter' },
  { regex: /[0-9]/, label: 'One number' },
  { regex: /[^A-Za-z0-9]/, label: 'One special character' },
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { toast } = useToast();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watchPassword('newPassword', '');

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await api.patch('/users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      refreshUser();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      resetPassword();
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/2fa/setup');
      return response.data;
    },
    onSuccess: (data) => {
      setTwoFactorSecret(data.secret);
      setShowQrCode(true);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to setup 2FA',
        variant: 'destructive',
      });
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post('/auth/2fa/enable', { code });
      return response.data;
    },
    onSuccess: () => {
      refreshUser();
      setShowQrCode(false);
      setTwoFactorSecret('');
      setVerificationCode('');
      toast({
        title: '2FA enabled',
        description: 'Two-factor authentication has been enabled.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Invalid verification code',
        variant: 'destructive',
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/2fa/disable');
      return response.data;
    },
    onSuccess: () => {
      refreshUser();
      toast({
        title: '2FA disabled',
        description: 'Two-factor authentication has been disabled.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to disable 2FA',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground mb-4">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {user?.role}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <Mail className="h-5 w-5" />
                <span className="text-sm">{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Phone className="h-5 w-5" />
                  <span className="text-sm">{user?.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Joined {formatDate(user?.createdAt || '')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className={cn('h-5 w-5', user?.twoFactorEnabled ? 'text-green-500' : 'text-gray-400')} />
                <span className={cn('text-sm', user?.twoFactorEnabled ? 'text-green-600' : 'text-gray-500')}>
                  2FA {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...registerProfile('firstName')}
                    />
                    {profileErrors.firstName && (
                      <p className="text-sm text-red-500">{profileErrors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...registerProfile('lastName')}
                    />
                    {profileErrors.lastName && (
                      <p className="text-sm text-red-500">{profileErrors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...registerProfile('phone')}
                  />
                </div>

                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit((data) => changePasswordMutation.mutate(data))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...registerPassword('currentPassword')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      {...registerPassword('newPassword')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                  )}

                  {/* Password requirements */}
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => {
                      const isValid = req.regex.test(newPassword);
                      return (
                        <div
                          key={index}
                          className={cn(
                            'flex items-center text-sm',
                            isValid ? 'text-green-600' : 'text-gray-500'
                          )}
                        >
                          {isValid ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
                          {req.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword('confirmPassword')}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              {user?.twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <Shield className="h-5 w-5" />
                    <span>Two-factor authentication is enabled</span>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => disable2FAMutation.mutate()}
                    disabled={disable2FAMutation.isPending}
                  >
                    {disable2FAMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Disable 2FA
                  </Button>
                </div>
              ) : showQrCode ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg">
                      {/* QR Code would be rendered here */}
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                        <QrCode className="h-24 w-24 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Or enter this code manually:</p>
                    <code className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                      {twoFactorSecret}
                    </code>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => enable2FAMutation.mutate(verificationCode)}
                      disabled={enable2FAMutation.isPending || verificationCode.length !== 6}
                    >
                      {enable2FAMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify & Enable
                    </Button>
                    <Button variant="outline" onClick={() => setShowQrCode(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password.
                  </p>
                  <Button
                    onClick={() => setup2FAMutation.mutate()}
                    disabled={setup2FAMutation.isPending}
                  >
                    {setup2FAMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Key className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
