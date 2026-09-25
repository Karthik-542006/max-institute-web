import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Image as ImageIcon, 
  Inbox, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import Button from '../components/Button';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    faculty: 0,
    gallery: 0,
    newEnquiries: 0
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const [courses, faculty, gallery, enquiries] = await Promise.all([
        dataService.getCourses(),
        dataService.getFaculty(),
        dataService.getGallery(),
        dataService.getEnquiries()
      ]);

      const newEnqs = enquiries.filter(e => e.status === 'New');

      setStats({
        courses: courses.length,
        faculty: faculty.length,
        gallery: gallery.length,
        newEnquiries: newEnqs.length
      });

      setRecentEnquiries(enquiries.slice(0, 5));
      setLoading(false);
    }
    loadDashboard();
    const unsubs = [
      dataService.subscribeToEnquiries(() => loadDashboard()),
      dataService.subscribeToCourses(() => loadDashboard()),
      dataService.subscribeToFaculty(() => loadDashboard()),
      dataService.subscribeToGallery(() => loadDashboard())
    ];
    return () => {
      unsubs.forEach(fn => fn && fn());
    };
  }, []);

  const statCards = [
    {
      title: 'Total Courses',
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
      title: 'Gallery Images',
      value: stats.gallery,
      path: '/admin/gallery',
      icon: ImageIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100'
    },
    {
      title: 'New Enquiries',
      value: stats.newEnquiries,
      path: '/admin/enquiries',
      icon: Inbox,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100'
    }
  ];

  const statusStyles = {
    'New': 'bg-red-50 text-red-700 border-red-200',
    'Contacted': 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'Closed': 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand-secondary border border-blue-100 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
            <span>Active Management Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-primary">
            MAX Institutional Overview
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Real-time management for courses, faculty, reviews, galleries, and incoming student enquiries.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/courses">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Manage Courses
            </Button>
          </Link>
          <Link to="/admin/enquiries">
            <Button variant="outline" size="sm" icon={Inbox}>
              View Enquiries
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

      {/* Recent Enquiries & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Enquiries Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-brand-border shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-brand-primary">Recent Student Enquiries</h2>
              <p className="text-xs text-brand-muted">Latest submissions from the website enquiry forms</p>
            </div>
            <Link to="/admin/enquiries" className="text-xs font-bold text-brand-secondary hover:text-brand-primary">
              View All Enquiries →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted uppercase text-[11px] font-bold tracking-wider">
                  <th className="pb-3 font-bold">Student Name</th>
                  <th className="pb-3 font-bold">Course</th>
                  <th className="pb-3 font-bold">Phone</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {recentEnquiries.length > 0 ? (
                  recentEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-brand-bg/50 transition-colors">
                      <td className="py-3.5 font-bold text-brand-primary">
                        {enq.name}
                      </td>
                      <td className="py-3.5 text-brand-text">
                        {enq.course_name || 'General Enquiry'}
                      </td>
                      <td className="py-3.5 text-brand-muted font-mono">
                        {enq.phone}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[enq.status] || 'bg-gray-100 text-gray-700'}`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to="/admin/enquiries"
                          className="font-bold text-brand-secondary hover:text-brand-primary text-xs"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-brand-muted text-xs">
                      No enquiries registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Admin Navigation Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-brand-border shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-primary mb-1">Administrative Shortcuts</h3>
            <p className="text-xs text-brand-muted mb-6">Quick access to frequently updated institutional sections</p>

            <div className="space-y-3">
              <Link
                to="/admin/courses"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-bg hover:bg-blue-50 text-xs font-bold text-brand-primary transition-colors border border-brand-border"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-brand-secondary" />
                  <span>Add or Edit Course</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/admin/faculty"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-bg hover:bg-blue-50 text-xs font-bold text-brand-primary transition-colors border border-brand-border"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-brand-secondary" />
                  <span>Update Faculty Team</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/admin/gallery"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-bg hover:bg-blue-50 text-xs font-bold text-brand-primary transition-colors border border-brand-border"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-brand-secondary" />
                  <span>Upload Campus Photos</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-bg hover:bg-blue-50 text-xs font-bold text-brand-primary transition-colors border border-brand-border"
              >
                <div className="flex items-center gap-2.5">
                  <SettingsIcon className="w-4 h-4 text-brand-secondary" />
                  <span>Institution Details & Phone</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold block mb-1">Live Database Status</span>
            Site changes saved in this panel update live on the public website and persist safely.
          </div>
        </div>
      </div>
    </div>
  );
}
