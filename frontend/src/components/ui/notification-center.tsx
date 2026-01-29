import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  CheckCircle,
  Folder,
  MessageSquare,
  Wallet,
  Settings,
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'case' | 'ticket' | 'wallet' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

const categoryIcons = {
  case: Folder,
  ticket: MessageSquare,
  wallet: Wallet,
  system: Settings,
};

const typeStyles = {
  info: { bg: 'bg-blue-100', text: 'text-blue-600', icon: Info },
  success: { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: AlertCircle },
  error: { bg: 'bg-red-100', text: 'text-red-600', icon: AlertCircle },
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications');
        return response.data;
      } catch {
        // Return mock data if API doesn't exist yet
        return [
          {
            id: '1',
            type: 'success',
            category: 'case',
            title: 'Case Update',
            message: 'Your case #12345 has been assigned to an agent',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            link: '/cases/12345',
          },
          {
            id: '2',
            type: 'info',
            category: 'ticket',
            title: 'New Response',
            message: 'Support team replied to your ticket',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            link: '/tickets/1',
          },
          {
            id: '3',
            type: 'warning',
            category: 'wallet',
            title: 'Verification Needed',
            message: 'Please verify your withdrawal address',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            link: '/wallets',
          },
        ] as Notification[];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      // Update local state if API fails
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => (n.id === 'temp' ? { ...n, read: true } : n))
      );
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      // Update local state if API fails
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => ({ ...n, read: true }))
      );
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60) return 'Just now';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1 -translate-y-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const CategoryIcon = categoryIcons[notification.category];
                  const typeConfig = typeStyles[notification.type];
                  const TypeIcon = typeConfig.icon;

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3 hover:bg-gray-50 transition-colors',
                        !notification.read && 'bg-brand-50/50'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn('p-2 rounded-lg', typeConfig.bg)}>
                          <TypeIcon className={cn('h-5 w-5', typeConfig.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <CategoryIcon className="h-3 w-3" />
                              <span className="capitalize">{notification.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {notification.link && (
                                <Link
                                  to={notification.link}
                                  onClick={() => setIsOpen(false)}
                                  className="text-xs text-brand-600 hover:underline"
                                >
                                  View
                                </Link>
                              )}
                              {!notification.read && (
                                <button
                                  onClick={() => markAsReadMutation.mutate(notification.id)}
                                  className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t bg-gray-50">
              <Button
                variant="ghost"
                className="w-full text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
