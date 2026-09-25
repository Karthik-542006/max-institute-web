import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Clock, 
  RefreshCw, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Save
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

// Recommended status values: New, Read, Contacted, Resolved, Archived
const STATUS_FILTER_LIST = ['All', 'New', 'Read', 'Contacted', 'Resolved', 'Archived'];
const STATUS_OPTIONS = ['New', 'Read', 'Contacted', 'In Progress', 'Resolved', 'Archived', 'Closed'];

const statusColors = {
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

function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
}

export default function ManageEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  const loadEnquiries = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const data = await dataService.getEnquiries();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load enquiries from database:', err);
      setError(err.message || 'Failed to load enquiries from database.');
      showToast('Error loading enquiries from central database.', 'error');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries(true);

    // Subscribe to cross-device real-time enquiry updates
    const unsubscribe = dataService.subscribeToEnquiries((detail) => {
      loadEnquiries(false);
      const studentName = detail?.record?.name || detail?.name || detail?.new?.name || detail?.detail?.name;
      if (studentName) {
        showToast(`🔔 New Enquiry Received from "${studentName}"!`, 'info');
      }
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  const handleOpenDetail = (enq) => {
    setSelectedEnquiry(enq);
    setAdminNotes(enq.admin_notes || enq.notes || '');
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const updated = await dataService.updateEnquiryStatus(id, newStatus, adminNotes);
      showToast(`Status updated to "${newStatus}"`, 'success');
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Status update failed:', err);
      showToast(err.message || 'Failed to update status in database.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setSavingNotes(true);
    try {
      await dataService.updateEnquiryStatus(selectedEnquiry.id, selectedEnquiry.status, adminNotes);
      showToast('Admin notes saved successfully.', 'success');
      setSelectedEnquiry(prev => ({ ...prev, admin_notes: adminNotes, notes: adminNotes }));
      setEnquiries(prev => prev.map(e => e.id === selectedEnquiry.id ? { ...e, admin_notes: adminNotes, notes: adminNotes } : e));
    } catch (err) {
      console.error('Save notes error:', err);
      showToast(err.message || 'Failed to save admin notes.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the enquiry from "${name}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    try {
      await dataService.deleteEnquiry(id);
      showToast(`Enquiry from "${name}" has been deleted.`, 'info');
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null);
      }
      setEnquiries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Delete enquiry error:', err);
      showToast(err.message || 'Failed to delete enquiry from database.', 'error');
    }
  };

  // Status badge count helper
  const getStatusCount = (statusFilter) => {
    if (statusFilter === 'All') return enquiries.length;
    const lower = statusFilter.toLowerCase();
    return enquiries.filter(e => {
      const s = String(e.status || '').toLowerCase();
      if (lower === 'resolved') return s === 'resolved' || s === 'closed';
      return s === lower;
    }).length;
  };

  // Search & Filter
  const filteredEnquiries = enquiries.filter(enq => {
    const s = String(enq.status || '').toLowerCase();
    const filterLower = activeStatus.toLowerCase();

    let matchesStatus = false;
    if (activeStatus === 'All') {
      matchesStatus = true;
    } else if (filterLower === 'resolved') {
      matchesStatus = s === 'resolved' || s === 'closed';
    } else {
      matchesStatus = s === filterLower;
    }

    if (!matchesStatus) return false;

    const q = search.trim().toLowerCase();
    if (!q) return true;

    const nameMatch = String(enq.name || '').toLowerCase().includes(q);
    const emailMatch = String(enq.email || '').toLowerCase().includes(q);
    const phoneMatch = String(enq.phone || '').includes(q);
    const subjectMatch = String(enq.subject || enq.course_name || '').toLowerCase().includes(q);
    const messageMatch = String(enq.message || '').toLowerCase().includes(q);

    return nameMatch || emailMatch || phoneMatch || subjectMatch || messageMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
              Student Admission Enquiries
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Live Database
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Authoritative, persistent enquiry records directly synchronized from the central PostgreSQL database.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadEnquiries(true)}
          loading={loading}
          icon={RefreshCw}
          className="self-start sm:self-auto"
        >
          Refresh Data
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-red-800 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadEnquiries(true)} className="shrink-0 bg-white">
            Retry
          </Button>
        </div>
      )}

      {/* Controls Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {STATUS_FILTER_LIST.map((status) => {
            const count = getStatusCount(status);
            const isActive = activeStatus === status;
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-white text-brand-muted hover:text-brand-primary border border-brand-border'
                }`}
              >
                <span>{status}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[11px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-brand-bg text-brand-text'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, course, message..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white shadow-xs"
          />
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-bg/60 border-b border-brand-border text-brand-muted uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-bold">Student Name</th>
                <th className="py-3.5 px-6 font-bold">Subject / Course</th>
                <th className="py-3.5 px-6 font-bold">Phone Number</th>
                <th className="py-3.5 px-6 font-bold">Date & Time</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-brand-muted">
                    <div className="inline-flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Loading enquiries from central database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enq) => {
                  const displayStatus = enq.status ? (enq.status.charAt(0).toUpperCase() + enq.status.slice(1)) : 'New';
                  const colorClass = statusColors[displayStatus] || statusColors[enq.status] || 'bg-gray-100 text-gray-700 border-gray-200';
                  
                  return (
                    <tr key={enq.id} className="hover:bg-brand-bg/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-brand-primary">
                        <button
                          onClick={() => handleOpenDetail(enq)}
                          className="hover:underline text-left"
                        >
                          {enq.name}
                        </button>
                        {enq.email && (
                          <span className="block text-[11px] font-normal text-brand-muted">
                            {enq.email}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-brand-text">
                        <span className="font-medium">
                          {enq.subject || enq.course_name || 'General Admission Enquiry'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-brand-muted">
                        <a href={`tel:${enq.phone}`} className="hover:text-brand-primary underline">
                          {enq.phone}
                        </a>
                      </td>
                      <td className="py-4 px-6 text-brand-muted text-xs whitespace-nowrap">
                        {formatDateTime(enq.created_at)}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          disabled={updatingId === enq.id}
                          value={displayStatus}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer ${colorClass}`}
                        >
                          {STATUS_OPTIONS.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(enq)}
                          className="p-1.5 text-brand-secondary hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(enq.id, enq.name)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-brand-muted">
                    <div className="inline-flex flex-col items-center gap-2">
                      <Inbox className="w-8 h-8 text-brand-muted/50" />
                      <span className="text-sm font-bold text-brand-primary">No enquiries found</span>
                      <span className="text-xs text-brand-muted">
                        {search ? 'Try adjusting your search criteria.' : 'No enquiries submitted for the selected filter.'}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Detail Modal */}
      <Modal
        isOpen={Boolean(selectedEnquiry)}
        onClose={() => setSelectedEnquiry(null)}
        title="Student Admission Enquiry Details"
      >
        {selectedEnquiry && (
          <div className="space-y-5">
            {/* Top header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-extrabold text-brand-primary">{selectedEnquiry.name}</h4>
                <p className="text-xs text-brand-muted mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-muted" />
                  <span>Submitted: {formatDateTime(selectedEnquiry.created_at)}</span>
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[selectedEnquiry.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {selectedEnquiry.status}
              </span>
            </div>

            {/* Contact details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-brand-bg border border-brand-border text-xs">
              <div>
                <span className="text-brand-muted block font-semibold mb-0.5">Phone Number:</span>
                <a href={`tel:${selectedEnquiry.phone}`} className="font-bold text-brand-secondary underline text-sm">
                  {selectedEnquiry.phone}
                </a>
              </div>
              <div>
                <span className="text-brand-muted block font-semibold mb-0.5">Email Address:</span>
                {selectedEnquiry.email ? (
                  <a href={`mailto:${selectedEnquiry.email}`} className="font-bold text-brand-primary underline text-sm">
                    {selectedEnquiry.email}
                  </a>
                ) : (
                  <span className="text-brand-muted italic">Not provided</span>
                )}
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-brand-border/60">
                <span className="text-brand-muted block font-semibold mb-0.5">Interested Course / Program:</span>
                <span className="font-bold text-brand-primary text-sm">
                  {selectedEnquiry.subject || selectedEnquiry.course_name || 'General Admission Enquiry'}
                </span>
              </div>
            </div>

            {/* Student Message */}
            <div>
              <h5 className="text-xs font-bold text-brand-text uppercase tracking-wide mb-1.5">
                Student Enquiry Message:
              </h5>
              <div className="p-4 bg-gray-50 rounded-2xl border border-brand-border text-xs sm:text-sm text-brand-text leading-relaxed">
                {selectedEnquiry.message ? (
                  <p className="whitespace-pre-wrap">{selectedEnquiry.message}</p>
                ) : (
                  <p className="text-brand-muted italic">No custom message provided.</p>
                )}
              </div>
            </div>

            {/* Admin Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-brand-text uppercase tracking-wide">
                  Internal Administrative Notes:
                </label>
                <span className="text-[11px] text-brand-muted">Private admin notes</span>
              </div>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add follow-up notes (e.g., Called student on 25th, interested in evening 5pm batch, promised to visit campus this Saturday)..."
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotes}
                  loading={savingNotes}
                  icon={Save}
                >
                  Save Notes
                </Button>
              </div>
            </div>

            {/* Footer Status & Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-brand-border">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-brand-text whitespace-nowrap">Update Status:</span>
                <select
                  value={selectedEnquiry.status ? (selectedEnquiry.status.charAt(0).toUpperCase() + selectedEnquiry.status.slice(1)) : 'New'}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
                >
                  {STATUS_OPTIONS.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedEnquiry.id, selectedEnquiry.name)}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Delete Enquiry
                </button>
                <Button variant="primary" size="sm" onClick={() => setSelectedEnquiry(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
