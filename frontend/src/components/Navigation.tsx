'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from './ConnectButton';
import { ThemeToggle } from './ThemeToggle';
import { useAccount } from 'wagmi';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { ARBITRATOR_ADDRESS } from '@/constants';

export function Navigation() {
  const pathname = usePathname();
  const { address } = useAccount();
  const { unreadCount } = useNotifications(address);
  const isArbitrator = address?.toLowerCase() === ARBITRATOR_ADDRESS.toLowerCase();

  const navLinks = [
    { href: '/jobs', label: 'Browse Jobs' },
    { href: '/my-jobs', label: 'My Jobs' },
    { href: '/profile', label: 'Profile' },
    { href: '/how-it-works', label: 'How It Works' },
  ];

  if (isArbitrator) {
    navLinks.push({ href: '/arbitrator', label: 'Arbitrator' });
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-white">ArcHire</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-[#0052FF] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            {address && (
              <Link
                href="/notifications"
                className="relative p-2 rounded-lg border border-gray-800 hover:bg-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0052FF] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-[#0052FF] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
