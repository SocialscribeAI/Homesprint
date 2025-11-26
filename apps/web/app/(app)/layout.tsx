'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  MessageSquare,
  Calendar,
  Heart,
  Building2,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/me', icon: Home, label: 'Dashboard' },
  { href: '/listings', icon: Search, label: 'Find Homes' },
  { href: '/messages', icon: MessageSquare, label: 'Messages', badge: true },
  { href: '/schedule', icon: Calendar, label: 'Viewings' },
  { href: '/me/saved', icon: Heart, label: 'Saved' },
];

const listerNavItems = [
  { href: '/me/listings', icon: Building2, label: 'My Listings' },
  { href: '/me/applications', icon: FileText, label: 'Applications' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cloud flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-mint/20 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-mint" />
          </div>
          <p className="text-midnight/50 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isLister = user?.role === 'LISTER' || user?.role === 'ADMIN';
  const allNavItems = isLister ? [...navItems, ...listerNavItems] : navItems;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cloud">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-sandstone">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-sandstone transition-colors"
          >
            <Menu className="w-5 h-5 text-midnight" />
          </button>

          <Link href="/me" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-midnight flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <span className="font-sans text-lg font-bold text-midnight">HomeSprint</span>
          </Link>

          <button className="p-2 rounded-xl hover:bg-sandstone transition-colors relative">
            <Bell className="w-5 h-5 text-midnight" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-mint rounded-full" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-midnight/20 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-float"
            >
              <SidebarContent
                user={user}
                navItems={allNavItems}
                pathname={pathname}
                onLogout={handleLogout}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-sandstone flex-col">
        <SidebarContent
          user={user}
          navItems={allNavItems}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  user,
  navItems,
  pathname,
  onLogout,
  onClose,
}: {
  user: any;
  navItems: typeof navItems;
  pathname: string;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/me" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-midnight flex items-center justify-center text-white font-bold text-lg">
            H
          </div>
          <span className="font-sans text-xl font-bold text-midnight tracking-tight">
            HomeSprint
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-sandstone transition-colors"
          >
            <X className="w-5 h-5 text-midnight" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/me' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all',
                isActive
                  ? 'bg-mint/10 text-mint'
                  : 'text-midnight/60 hover:bg-sandstone hover:text-midnight'
              )}
            >
              <item.icon className={clsx('w-5 h-5', isActive && 'text-mint')} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-mint text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-sandstone">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sandstone/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint to-apricot flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-midnight truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-midnight/50 truncate">
              {user?.email || user?.phone}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <Link
            href="/me/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-midnight/60 hover:bg-sandstone hover:text-midnight transition-all font-medium"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

