'use client';

import { useAccount } from 'wagmi';
import { useNotifications } from '@/lib/hooks/useNotifications';
import Link from 'next/link';

export default function NotificationsPage() {
  const { address, isConnected } = useAccount();
  const { notifications, markAsRead, markAllAsRead } = useNotifications(address);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Please connect your wallet to view notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-gray-400">Stay updated on your jobs and applications</p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-[#0052FF] hover:text-[#0046DD] text-sm font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 bg-black border border-gray-800 rounded-lg">
              <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-400">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsRead(notification.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ notification, onMarkAsRead }: { notification: any; onMarkAsRead: () => void }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'application':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'selected':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'submitted':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'approved':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'application':
        return 'text-blue-400 bg-blue-900/20';
      case 'selected':
        return 'text-green-400 bg-green-900/20';
      case 'submitted':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'approved':
        return 'text-green-400 bg-green-900/20';
      case 'disputed':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <Link
      href={`/jobs/${notification.jobId}`}
      onClick={onMarkAsRead}
      className={`block bg-black border rounded-lg p-4 hover:border-[#0052FF]/30 transition-colors ${
        notification.read ? 'border-gray-800' : 'border-[#0052FF]/50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${getColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className={`text-sm mb-1 ${notification.read ? 'text-gray-400' : 'text-white font-medium'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(notification.timestamp).toLocaleString()}
          </p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-[#0052FF] rounded-full"></div>
        )}
      </div>
    </Link>
  );
}
