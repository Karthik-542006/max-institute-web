import React, { useState, useEffect } from 'react';
import { Inbox, Trash2, Eye, Search, Filter, Phone, Mail, Clock } from 'lucide-react';
import { dataService } from '../lib/dataService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

const STATUS_LIST = ['New', 'Contacted', 'In Progress', 'Closed'];

export default function ManageEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function loadEnquiries() {
    const data = await dataService.getEnquiries();
    setEnquiries(data);
  }

  const handleStatusChange = async (id, newStatus) => {
    await dataService.updateEnquiryStatus(id, newStatus);
    showToast(`Status updated to ${newStatus}`, 'success');
    loadEnquiries();
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete enquiry from "${name}"?`)) {
      await dataService.deleteEnquiry(id);
      showToast('Enquiry deleted', 'info');
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      loadEnquiries();
    }
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesStatus = activeStatus === 'All' || enq.status === activeStatus;
    const matchesSearch = enq.name.toLowerCase().includes(search.toLowerCase()) ||
                          (enq.phone && enq.phone.includes(search)) ||
                          (enq.course_name && enq.course_name.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusColors = {
    'New': 'bg-red-50 text-red-700 border-red-200',
    'Contacted': 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'Closed': 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
            Student Admission Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Track inquiries, update contact status, and manage student follow-ups
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['All', ...STATUS_LIST].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeStatus === status
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-white text-brand-muted hover:text-brand-primary border border-brand-border'
              }`}
            >
              {status}
              <span className="ml-1.5 opacity-70">
                ({status === 'All' ? enquiries.length : enquiries.filter(e => e.status === status).length})
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, course..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
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
                <th className="py-3.5 px-6 font-bold">Interested Course</th>
                <th className="py-3.5 px-6 font-bold">Phone Number</th>
                <th className="py-3.5 px-6 font-bold">Received Date</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-brand-bg/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-primary">
                      {enq.name}
                    </td>
                    <td className="py-4 px-6 text-brand-text">
                      {enq.course_name || 'General Admission'}
                    </td>
                    <td className="py-4 px-6 font-mono text-brand-muted">
                      <a href={`tel:${enq.phone}`} className="hover:text-brand-primary underline">
                        {enq.phone}
                      </a>
                    </td>
                    <td className="py-4 px-6 text-brand-muted text-xs">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer ${statusColors[enq.status]}`}
                      >
                        {STATUS_LIST.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedEnquiry(enq)}
                        className="p-1.5 text-brand-secondary hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(enq.id, enq.name)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-muted text-xs">
                    No enquiries match the current filter.
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
        title="Enquiry Details"
      >
        {selectedEnquiry && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-brand-primary">{selectedEnquiry.name}</h4>
                <p className="text-xs text-brand-muted">
                  Received: {new Date(selectedEnquiry.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[selectedEnquiry.status]}`}>
                {selectedEnquiry.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-brand-bg border border-brand-border text-xs">
              <div>
                <span className="text-brand-muted block font-semibold mb-0.5">Phone:</span>
                <a href={`tel:${selectedEnquiry.phone}`} className="font-bold text-brand-secondary underline">
                  {selectedEnquiry.phone}
                </a>
              </div>
              <div>
                <span className="text-brand-muted block font-semibold mb-0.5">Email:</span>
                <span className="font-bold text-brand-primary">
                  {selectedEnquiry.email || 'None provided'}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-brand-border/60">
                <span className="text-brand-muted block font-semibold mb-0.5">Course Program:</span>
                <span className="font-bold text-brand-primary">
                  {selectedEnquiry.course_name || 'General Admission Enquiry'}
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-brand-text uppercase tracking-wide mb-1">
                Student Message:
              </h5>
              <div className="p-3.5 bg-gray-50 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-text leading-relaxed">
                {selectedEnquiry.message || 'No additional message provided.'}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-brand-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-text">Status:</span>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                  className="text-xs px-3 py-1 rounded-lg border border-brand-border bg-white"
                >
                  {STATUS_LIST.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
