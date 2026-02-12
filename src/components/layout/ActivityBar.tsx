'use client';

import { LayoutDashboard, Code2, BarChart3, Settings, User, BookOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ActivityBar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const isBeginnerMode = profile?.mode === 'beginner' || profile?.role === 'tutor';

  const navItems = isBeginnerMode
    ? [
        { icon: LayoutDashboard, href: '/beginner', label: 'Dashboard', id: 'beginner-dashboard' },
        { icon: BookOpen, href: '#', label: 'Session', id: 'session' },
      ]
    : [
        { icon: LayoutDashboard, href: '/dashboard', label: 'Dashboard', id: 'dashboard' },
        { icon: Code2, href: '#', label: 'Quiz', id: 'quiz' },
        { icon: BarChart3, href: '#', label: 'Progress', id: 'progress' },
      ];

  const bottomItems = [
    { icon: User, href: '#', label: 'Account', id: 'account' },
    { icon: Settings, href: '#', label: 'Settings', id: 'settings' },
  ];

  const isActive = (id: string) => {
    if (id === 'dashboard') return pathname === '/dashboard';
    if (id === 'beginner-dashboard') return pathname === '/beginner';
    if (id === 'quiz') return pathname.startsWith('/quiz');
    if (id === 'session') return pathname.includes('/session/');
    return false;
  };

  return (
    <div className="flex flex-col justify-between w-[48px] bg-activitybar border-r border-border">
      <div className="flex flex-col items-center pt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              className={`
                flex items-center justify-center w-[48px] h-[48px] transition-colors relative
                ${active
                  ? 'text-text-bright'
                  : 'text-text-muted hover:text-text-primary'
                }
              `}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-accent" />
              )}
              <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            </Link>
          );
        })}
      </div>
      <div className="flex flex-col items-center pb-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              className="flex items-center justify-center w-[48px] h-[48px] text-text-muted hover:text-text-primary transition-colors"
            >
              <Icon size={22} strokeWidth={1.5} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
