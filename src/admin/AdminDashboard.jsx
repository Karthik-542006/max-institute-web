import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Inbox, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  Settings as SettingsIcon,
  ShieldCheck,
  Activity,
  Radio,
  Eye,
  EyeOff,
  Flame
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../lib/authContext';
import { useRealtimeStatus, useAdminPresence } from '../hooks/useRealtimeStatus';
import Button from '../components/Button';

function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

function formatActivityMessage(activity) {
  const admin = activity.admin_email ? activity.admin_email.split('@')[0] : 'Admin';
  switch (activity.action) {
    case 'UPDATE_SITE_SETTINGS':
      return `${admin} updated institution settings and contact details.`;
    case 'UPLOAD_GALLERY':
      return `${admin} uploaded new media to campus gallery.`;
    case 'UPDATE_GALLERY':
      return `${admin} updated gallery media metadata.`;
    case 'PUBLISH_GALLERY':
      return `${admin} published a gallery item to the public website.`;
    case 'UNPUBLISH_GALLERY':
      return `${admin} unpublished a gallery item.`;
    case 'DELETE_GALLERY':
      return `${admin} deleted media from the gallery.`;
    case 'LOGIN':
      return `${admin} signed in to administrative panel.`;
    case 'LOGOUT':
      return `${admin} signed out.`;
    default:
      return `${admin} performed administrative action: ${activity.action}`;
  }
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isConnected, isReconnecting, status } = useRealtimeStatus();
  const { adminCount } = useAdminPresence(user);

  const [stats, setStats] = useState({
    courses: 0,
    faculty: 0,
    galleryTotal: 0,
    galleryPublished: 0,
    galleryUnpublished: 0,
    galleryImages: 0,
    galleryVideos: 0,
    newEnquiries: 0
  });

  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const [courses, faculty, gallery, enquiries, activityLogs] = await Promise.all([
        dataService.getCourses(),
        dataService.getFaculty(),
        dataService.getGallery('All'),
        dataService.getEnquiries(),
        dataService.getActivityLog(15)
      ]);

      const allEnqs = Array.isArray(enquiries) ? enquiries : [];
      const newEnqsCount = allEnqs.filter(e => String(e.status || '').toLowerCase() === 'new').length;
      const totalEnqsCount = allEnqs.length;
      const resolvedEnqsCount = allEnqs.filter(e => ['resolved', 'closed'].includes(String(e.status || '').toLowerCase())).length;
      const galleryList = Array.isArray(gallery) ? gallery : [];

      const published = galleryList.filter(g => g.is_published !== false);
      const unpublished = galleryList.filter(g => g.is_published === false);
      const images = galleryList.filter(g => g.media_type === 'image' || (!g.media_type && !g.file_url?.match(/\.(mp4|webm|mov)(\?|$)/i)));
      const videos = galleryList.filter(g => g.media_type === 'video' || (g.file_url && g.file_url.match(/\.(mp4|webm|mov)(\?|$)/i)));

      setStats({
        courses: courses.length,
        faculty: faculty.length,
        galleryTotal: galleryList.length,
        galleryPublished: published.length,
        galleryUnpublished: unpublished.length,
        galleryImages: images.length,
        galleryVideos: videos.length,
        totalEnquiries: totalEnqsCount,
        newEnquiries: newEnqsCount,
        resolvedEnquiries: resolvedEnqsCount
      });

      setRecentEnquiries(allEnqs.slice(0, 5));
      setActivities(Array.isArray(activityLogs) ? activityLogs : []);
    } catch (e) {
      console.warn('Dashboard load warning:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const unsubs = [
      dataService.subscribeToEnquiries(() => loadDashboard()),
      dataService.subscribeToCourses(() => loadDashboard()),
      dataService.subscribeToFaculty(() => loadDashboard()),
      dataService.subscribeToGallery(() => loadDashboard()),
      dataService.subscribeToActivityLog((logEvent) => {
        // Immediate update from realtime event
        if (logEvent?.record) {
          setActivities(prev => [logEvent.record, ...prev.filter(a => a.id !== logEvent.record.id)].slice(0, 15));
        } else {
          loadDashboard();
        }
      })
    ];

    return () => {
      unsubs.forEach(fn => fn && fn());
    };
  }, []);

  const statCards = [
    {
      title: 'Active Courses',
      value: stats.courses,
      path: '/admin/courses',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Faculty Members',
      value: stats.faculty,
      path: '/admin/faculty',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100'
    },
    {
      title: 'Total Gallery Items',
      value: stats.galleryTotal,
      path: '/admin/gallery',
      icon: ImageIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Pending Enquiries',
      value: stats.newEnquiries,
      path: '/admin/enquiries',
      icon: Inbox,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100'
    }
  ];

  const statusStyles = {
    'New': 'bg-red-50 text-red-700 border-red-200',
    'new': 'bg-red-50 text-red-700 border-red-200',
    'Read': 'bg-purple-50 text-purple-700 border-purple-200',
    'read': 'bg-purple-50 text-purple-700 border-purple-200',
    'Contacted': 'bg-blue-50 text-blue-700 border-blue-200',
    'contacted': 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'in progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
    'closed': 'bg-gray-100 text-gray-700 border-gray-200',
    'Archived': 'bg-slate-100 text-slate-700 border-slate-200',
    'archived': 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Multi-Admin & Realtime Status (Requirements 5, 6, 33, 34) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand-secondary border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
              <span>Multi-Admin Realtime Suite</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
              <span>{isConnected ? 'PostgreSQL Realtime Active' : 'Connecting to Live Sync...'}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>{adminCount} Administrator{adminCount > 1 ? 's' : ''} Online</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight">
            MAX Educational Institution Admin Overview
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1 max-w-2xl leading-relaxed">
            All updates synchronize instantly across all connected administrator devices and the public website via Supabase Postgres Realtime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/gallery">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Manage Gallery
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="outline" size="sm" icon={SettingsIcon}>
              Site Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.path}
              className="bg-white rounded-2xl p-6 border border-brand-border shadow-soft hover:shadow-premium transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-xl ${card.bg} border flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-brand-primary">
                  {loading ? '—' : card.value}
                </span>
                <span className="text-xs font-semibold text-brand-secondary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Gallery Breakdown Dashboard (Requirement 33: Total, Published, Unpublished, Images, Videos) */}
      <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-brand-primary flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <span>Media & Gallery Breakdown</span>
            </h3>
            <p className="text-xs text-brand-muted">Comprehensive inventory of campus photos and video media</p>
          </div>
          <Link to="/admin/gallery" className="text-xs font-bold text-brand-secondary hover:underline">
            Open Media Library →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border">
            <span className="text-[11px] font-bold text-brand-muted uppercase block">Total Items</span>
            <span className="text-2xl font-extrabold text-brand-primary">{stats.galleryTotal}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1 mb-0.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Published</span>
            </span>
            <span className="text-2xl font-extrabold text-emerald-900">{stats.galleryPublished}</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1 mb-0.5">
              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Unpublished</span>
            </span>
            <span className="text-2xl font-extrabold text-amber-900">{stats.galleryUnpublished}</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
            <span className="text-[11px] font-bold text-blue-800 uppercase flex items-center gap-1 mb-0.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Photos</span>
            </span>
            <span className="text-2xl font-extrabold text-blue-900">{stats.galleryImages}</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
            <span className="text-[11px] font-bold text-purple-800 uppercase flex items-center gap-1 mb-0.5">
              <VideoIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>Videos</span>
            </span>
            <span className="text-2xl font-extrabold text-purple-900">{stats.galleryVideos}</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Activity Feed + Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Recent Activity Feed (Requirements 19 & 20) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-brand-border shadow-soft">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-secondary flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-brand-primary">Live Admin Activity Feed</h2>
                <p className="text-xs text-brand-muted">Real-time audit log of multi-admin modifications</p>
              </div>
            </div>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>Realtime</span>
            </span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id || act.created_at} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-brand-bg transition-colors border border-transparent hover:border-brand-border/60">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-secondary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-brand-primary leading-snug">
                      {formatActivityMessage(act)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-brand-muted">
                      <span>{timeAgo(act.created_at)}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] uppercase bg-gray-100 px-1.5 py-0.5 rounded text-slate-600">
                        {act.table_name || 'system'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-brand-muted">
                No administrative activity logged recently. Changes by any admin will appear here in real-time.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Student Enquiries */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-brand-border shadow-soft">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-brand-primary">Recent Student Enquiries</h2>
                <p className="text-xs text-brand-muted">Latest submissions from website enquiry forms</p>
              </div>
            </div>
            <Link to="/admin/enquiries" className="text-xs font-bold text-brand-secondary hover:text-brand-primary">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted uppercase text-[10px] font-bold tracking-wider">
                  <th className="pb-2.5 font-bold">Student</th>
                  <th className="pb-2.5 font-bold">Course</th>
                  <th className="pb-2.5 font-bold">Phone</th>
                  <th className="pb-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {recentEnquiries.length > 0 ? (
                  recentEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-brand-bg/50 transition-colors">
                      <td className="py-3 font-bold text-brand-primary">
                        {enq.name}
                      </td>
                      <td className="py-3 text-brand-text truncate max-w-[140px]" title={enq.subject || enq.course_name}>
                        {enq.subject || enq.course_name || 'General Admission'}
                      </td>
                      <td className="py-3 text-brand-muted font-mono text-[11px]">
                        {enq.phone}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[enq.status] || 'bg-gray-100 text-gray-700'}`}>
                          {enq.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-brand-muted text-xs">
                      No student enquiries registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
