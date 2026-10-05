'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../../../redux/features/auth/authSlice';
import { useAppDispatch } from '../../../redux/hook';
import '../../../styles/dashboard.css';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <span>CR</span>
          <strong>CRMS</strong>
        </div>
        <p className="sidebar-label">Workspace</p>
        <nav>
          <Link
            className={isActive('/dashboard') && pathname === '/dashboard' ? 'active' : ''}
            href="/dashboard"
          >
            Overview
          </Link>
          <Link className={isActive('/dashboard/rooms') ? 'active' : ''} href="/dashboard/rooms">
            Conference rooms
          </Link>
          <Link
            className={isActive('/dashboard/reservations') ? 'active' : ''}
            href="/dashboard/reservations"
          >
            Reservations
          </Link>
          <Link className={isActive('/dashboard/usage') ? 'active' : ''} href="/dashboard/usage">
            Usage tracking
          </Link>
        </nav>
        <p className="sidebar-label">Account</p>
        <nav>
          <Link
            className={isActive('/dashboard/profile') ? 'active' : ''}
            href="/dashboard/profile"
          >
            Profile
          </Link>
          <button
            className="sign-out-button"
            onClick={() => {
              dispatch(logout());
              window.location.href = '/login';
            }}
          >
            Sign out
          </button>
        </nav>
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="header-kicker">Monday, October 5, 2026</p>
            <h1>Good morning, Admin</h1>
          </div>
          <Link className="book-button" href="/dashboard/reservations/new">
            + Book a room
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}
