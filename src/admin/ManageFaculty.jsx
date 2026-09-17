import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Check, X, User } from 'lucide-react';
import { dataService } from '../lib/dataService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

export default function ManageFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [form, setForm] = useState({
    name: '',
    designation: '',
    specialization: '',
    experience: '',
    photo_url: '',
    description: '',
    display_order: 1,
    is_active: true
  });
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadFaculty();
  }, []);

  async function loadFaculty() {
    const data = await dataService.getFaculty();
    setFaculty(data);
  }

  const openAdd = () => {
    setEditingFaculty(null);
    setForm({
      name: '',
      designation: 'Senior Instructor',
      specialization: '',
      experience: '5+ Years',
      photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      description: '',
      display_order: faculty.length + 1,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEdit = (member) => {
    setEditingFaculty(member);
    setForm({
      name: member.name,
      designation: member.designation,
      specialization: member.specialization,
      experience: member.experience,
      photo_url: member.photo_url || '',
      description: member.description || '',
      display_order: member.display_order || 1,
      is_active: member.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.designation) {
      showToast('Name and designation are required', 'error');
      return;
    }

    if (editingFaculty) {
      await dataService.updateFaculty(editingFaculty.id, form);
      showToast('Faculty updated successfully', 'success');
    } else {
      await dataService.addFaculty(form);
      showToast('New faculty added successfully', 'success');
    }

    setIsModalOpen(false);
    loadFaculty();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete faculty member "${name}"?`)) {
      await dataService.deleteFaculty(id);
      showToast('Faculty removed', 'info');
      loadFaculty();
    }
  };

  const toggleActive = async (member) => {
    await dataService.updateFaculty(member.id, { is_active: !member.is_active });
    loadFaculty();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
            Faculty Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Maintain verified teacher profiles, designations, and specializations
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>
          Add Faculty Member
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-bg/60 border-b border-brand-border text-brand-muted uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-bold">Faculty</th>
                <th className="py-3.5 px-6 font-bold">Designation</th>
                <th className="py-3.5 px-6 font-bold">Specialization</th>
                <th className="py-3.5 px-6 font-bold">Experience</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {faculty.map((member) => (
                <tr key={member.id} className="hover:bg-brand-bg/40 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <img
                      src={member.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80'}
                      alt={member.name}
                      className="w-10 h-10 rounded-xl object-cover border border-brand-border shrink-0"
                    />
                    <div>
                      <div className="font-bold text-brand-primary">{member.name}</div>
                      <div className="text-[11px] text-brand-muted line-clamp-1 max-w-xs">{member.description}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-brand-text font-medium">{member.designation}</td>
                  <td className="py-4 px-6 text-brand-muted">{member.specialization}</td>
                  <td className="py-4 px-6 text-brand-muted">{member.experience}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleActive(member)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        member.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {member.is_active ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-gray-400" />}
                      <span>{member.is_active ? 'Active' : 'Hidden'}</span>
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => openEdit(member)}
                      className="p-1.5 text-brand-secondary hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? `Edit: ${editingFaculty.name}` : 'Add Faculty Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. S. Rajeswari"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. Senior Instructor"
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Experience
              </label>
              <input
                type="text"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="e.g. 8+ Years"
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Specialization Area
            </label>
            <input
              type="text"
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              placeholder="e.g. English & Tamil Typing (Jr / Sr)"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Photo Image URL
            </label>
            <input
              type="url"
              value={form.photo_url}
              onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Biography / Qualifications
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Instructor background and teaching methodology..."
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="faculty_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="faculty_active" className="text-xs font-semibold text-brand-text">
              Active / Visible on public website
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingFaculty ? 'Save Changes' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
