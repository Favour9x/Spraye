'use client';

import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'application' | 'selected' | 'submitted' | 'approved' | 'disputed' | 'resolved';
  jobId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export function useNotifications(address?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!address) return;

    // Load notifications from localStorage
    const key = `archire-notifications-${address.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse notifications:', error);
      }
    }
  }, [address]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!address) return;

    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    };

    const updated = [newNotification, ...notifications];
    setNotifications(updated);

    // Save to localStorage
    const key = `archire-notifications-${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const markAsRead = (id: string) => {
    if (!address) return;

    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);

    const key = `archire-notifications-${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    if (!address) return;

    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);

    const key = `archire-notifications-${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  };
}
