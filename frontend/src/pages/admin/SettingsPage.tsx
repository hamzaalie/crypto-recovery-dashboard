import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Save,
  Loader2,
  Mail,
  Shield,
  Bell,
  Globe,
  Key,
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    timezone: string;
    dateFormat: string;
    maintenanceMode: boolean;
  };
  security: {
    passwordMinLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    require2FA: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpSecure: boolean;
    fromName: string;
    fromEmail: string;
  };
  notifications: {
    emailNotifications: boolean;
    newCaseNotification: boolean;
    caseStatusUpdateNotification: boolean;
    ticketResponseNotification: boolean;
    dailyDigest: boolean;
  };
  api: {
    rateLimit: number;
    rateLimitWindow: number;
    enablePublicApi: boolean;
    apiKeyExpiration: number;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: _settings, isLoading: _isLoading } = useQuery<SystemSettings>({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings');
      return response.data;
    },
  });

  const [formData, setFormData] = useState<SystemSettings>({
    general: {
      siteName: 'Crypto Recovery Platform',
      siteUrl: 'https://cryptorecovery.com',
      supportEmail: 'support@cryptorecovery.com',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      maintenanceMode: false,
    },
    security: {
      passwordMinLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      require2FA: false,
    },
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUser: '',
      smtpSecure: true,
      fromName: 'Crypto Recovery',
      fromEmail: 'noreply@cryptorecovery.com',
    },
    notifications: {
      emailNotifications: true,
      newCaseNotification: true,
      caseStatusUpdateNotification: true,
      ticketResponseNotification: true,
      dailyDigest: false,
    },
    api: {
      rateLimit: 100,
      rateLimitWindow: 60,
      enablePublicApi: false,
      apiKeyExpiration: 90,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<SystemSettings>) => {
      const response = await api.put('/admin/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({ title: 'Settings saved', description: 'System settings have been updated.' });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/admin/settings/test-email');
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Test email sent', description: 'Check your inbox for the test email.' });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to send test email',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    const sectionData = { [activeTab]: formData[activeTab as keyof SystemSettings] };
    saveMutation.mutate(sectionData);
  };

  const updateFormData = (section: keyof SystemSettings, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API', icon: Key },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure platform settings</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <Card className="lg:w-64 shrink-0">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              {tabs.find((t) => t.id === activeTab)?.label} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={formData.general.siteName}
                      onChange={(e) => updateFormData('general', 'siteName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={formData.general.siteUrl}
                      onChange={(e) => updateFormData('general', 'siteUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={formData.general.supportEmail}
                      onChange={(e) => updateFormData('general', 'supportEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                      value={formData.general.timezone}
                      onChange={(e) => updateFormData('general', 'timezone', e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={formData.general.maintenanceMode}
                    onChange={(e) => updateFormData('general', 'maintenanceMode', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      min="6"
                      max="32"
                      value={formData.security.passwordMinLength}
                      onChange={(e) =>
                        updateFormData('security', 'passwordMinLength', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="1440"
                      value={formData.security.sessionTimeout}
                      onChange={(e) =>
                        updateFormData('security', 'sessionTimeout', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="3"
                      max="10"
                      value={formData.security.maxLoginAttempts}
                      onChange={(e) =>
                        updateFormData('security', 'maxLoginAttempts', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      min="5"
                      max="60"
                      value={formData.security.lockoutDuration}
                      onChange={(e) =>
                        updateFormData('security', 'lockoutDuration', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Password Requirements</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requireUppercase"
                        checked={formData.security.requireUppercase}
                        onChange={(e) =>
                          updateFormData('security', 'requireUppercase', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="requireUppercase">Require uppercase letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requireNumbers"
                        checked={formData.security.requireNumbers}
                        onChange={(e) =>
                          updateFormData('security', 'requireNumbers', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="requireNumbers">Require numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requireSpecialChars"
                        checked={formData.security.requireSpecialChars}
                        onChange={(e) =>
                          updateFormData('security', 'requireSpecialChars', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="requireSpecialChars">Require special characters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="require2FA"
                        checked={formData.security.require2FA}
                        onChange={(e) => updateFormData('security', 'require2FA', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="require2FA">Require Two-Factor Authentication</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={formData.email.smtpHost}
                      onChange={(e) => updateFormData('email', 'smtpHost', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={formData.email.smtpPort}
                      onChange={(e) => updateFormData('email', 'smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={formData.email.smtpUser}
                      onChange={(e) => updateFormData('email', 'smtpUser', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      placeholder="••••••••"
                      onChange={(e) => updateFormData('email', 'smtpPassword', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={formData.email.fromName}
                      onChange={(e) => updateFormData('email', 'fromName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={formData.email.fromEmail}
                      onChange={(e) => updateFormData('email', 'fromEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smtpSecure"
                    checked={formData.email.smtpSecure}
                    onChange={(e) => updateFormData('email', 'smtpSecure', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="smtpSecure">Use TLS/SSL</Label>
                </div>
                <Button
                  variant="outline"
                  onClick={() => testEmailMutation.mutate()}
                  disabled={testEmailMutation.isPending}
                >
                  {testEmailMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Test Email
                </Button>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Enable email notifications globally</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.emailNotifications}
                      onChange={(e) =>
                        updateFormData('notifications', 'emailNotifications', e.target.checked)
                      }
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">New Case Notification</p>
                      <p className="text-sm text-gray-500">
                        Notify admins when a new case is submitted
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.newCaseNotification}
                      onChange={(e) =>
                        updateFormData('notifications', 'newCaseNotification', e.target.checked)
                      }
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Case Status Updates</p>
                      <p className="text-sm text-gray-500">
                        Notify users when their case status changes
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.caseStatusUpdateNotification}
                      onChange={(e) =>
                        updateFormData(
                          'notifications',
                          'caseStatusUpdateNotification',
                          e.target.checked
                        )
                      }
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Ticket Responses</p>
                      <p className="text-sm text-gray-500">
                        Notify users when their ticket receives a response
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.ticketResponseNotification}
                      onChange={(e) =>
                        updateFormData(
                          'notifications',
                          'ticketResponseNotification',
                          e.target.checked
                        )
                      }
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Daily Digest</p>
                      <p className="text-sm text-gray-500">
                        Send daily summary email to administrators
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.dailyDigest}
                      onChange={(e) =>
                        updateFormData('notifications', 'dailyDigest', e.target.checked)
                      }
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === 'api' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="enablePublicApi"
                    checked={formData.api.enablePublicApi}
                    onChange={(e) => updateFormData('api', 'enablePublicApi', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="enablePublicApi">Enable Public API Access</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rateLimit">Rate Limit (requests)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      min="10"
                      max="1000"
                      value={formData.api.rateLimit}
                      onChange={(e) =>
                        updateFormData('api', 'rateLimit', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitWindow">Rate Limit Window (seconds)</Label>
                    <Input
                      id="rateLimitWindow"
                      type="number"
                      min="1"
                      max="3600"
                      value={formData.api.rateLimitWindow}
                      onChange={(e) =>
                        updateFormData('api', 'rateLimitWindow', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKeyExpiration">API Key Expiration (days)</Label>
                  <Input
                    id="apiKeyExpiration"
                    type="number"
                    min="30"
                    max="365"
                    value={formData.api.apiKeyExpiration}
                    onChange={(e) =>
                      updateFormData('api', 'apiKeyExpiration', parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
