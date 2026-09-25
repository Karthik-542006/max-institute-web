import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Image as ImageIcon, 
  Star, 
  Inbox, 
  HelpCircle, 
  Settings as SettingsIcon, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  GraduationCap,
  ChevronRight,
  Shield,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { useRealtimeStatus, useAdminPresence } from '../hooks/useRealtimeStatus';

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const { isConnected, isReconnecting } = useRealtimeStatus();
  const { adminCount } = useAdminPresence(user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Announcements', path: '/admin/posts', icon: Megaphone },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Faculty', path: '/admin/faculty', icon: Users },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Enquiries', path: '/admin/enquiries', icon: Inbox },
    { name: 'FAQ', path: '/admin/faq', icon: HelpCircle },
    { name: 'Site Settings', path: '/admin/settings', icon: SettingsIcon }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const currentNavItem = navItems.find(item => 
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  ) || { name: 'Dashboard' };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-primary text-slate-200 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo & Administration Header */}
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight leading-none">
                  MAX ADMIN
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                  Management Suite
                </div>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-secondary text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-accent' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-accent" />
              <span>Public Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-brand-border px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-brand-primary hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-brand-muted">
              <span>Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-brand-primary font-bold">{currentNavItem.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Realtime Live Sync Status Badge (Requirement 5) */}
            <div className="flex items-center">
              {isConnected ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Live Sync Connected</span>
                  <span className="sm:hidden">Live</span>
                </div>
              ) : isReconnecting ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Reconnecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Offline</span>
                </div>
              )}
            </div>

            {/* Online Admin Presence Badge (Requirement 34) */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>{adminCount} Admin{adminCount > 1 ? 's' : ''} Online</span>
            </div>

            {/* Admin Profile Info */}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-brand-primary leading-tight">
                {user.email}
              </p>
              <p className="text-[10px] text-brand-muted uppercase font-semibold">
                {user.role === 'system_admin' ? 'System Administrator' : 'Administrator'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs border border-brand-primary/20">
              <Shield className="w-4 h-4 text-brand-secondary" />
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
