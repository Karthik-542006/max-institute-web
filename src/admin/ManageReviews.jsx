import React, { useState, useEffect } from 'react';
import { Star, Plus, Edit2, Trash2, Check, Quote } from 'lucide-react';
import { dataService } from '../lib/dataService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import Toast, { useToast } from '../components/Toast';

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [form, setForm] = useState({
    student_name: '',
    review: '',
    rating: 5,
    source: 'Google Review',
    is_featured: true
  });
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const data = await dataService.getReviews();
    setReviews(data);
  }

  const openAdd = () => {
    setEditingReview(null);
    setForm({
      student_name: '',
      review: '',
      rating: 5,
      source: 'Google Review',
      is_featured: true
    });
    setIsModalOpen(true);
  };

  const openEdit = (rev) => {
    setEditingReview(rev);
    setForm({
      student_name: rev.student_name,
      review: rev.review,
      rating: rev.rating || 5,
      source: rev.source || 'Google Review',
      is_featured: rev.is_featured ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_name || !form.review) {
      showToast('Student name and review text are required', 'error');
      return;
    }

    if (editingReview) {
      await dataService.updateReview(editingReview.id, form);
      showToast('Review updated', 'success');
    } else {
      await dataService.addReview(form);
      showToast('Review created', 'success');
    }

    setIsModalOpen(false);
    loadReviews();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete review from "${name}"?`)) {
      await dataService.deleteReview(id);
      showToast('Review deleted', 'info');
      loadReviews();
    }
  };

  const toggleFeatured = async (rev) => {
    await dataService.updateReview(rev.id, { is_featured: !rev.is_featured });
    loadReviews();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
            Student Reviews & Testimonials Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Manage authentic student experiences and featured homepage testimonials
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>
          Add Review
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-bg/60 border-b border-brand-border text-brand-muted uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-bold">Student</th>
                <th className="py-3.5 px-6 font-bold">Rating</th>
                <th className="py-3.5 px-6 font-bold">Review Text</th>
                <th className="py-3.5 px-6 font-bold">Source</th>
                <th className="py-3.5 px-6 font-bold">Featured</th>
                <th className="py-3.5 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-brand-bg/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-brand-primary whitespace-nowrap">
                    {rev.student_name}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <StarRating rating={rev.rating || 5} size={14} />
                  </td>
                  <td className="py-4 px-6 text-brand-text max-w-sm">
                    <p className="line-clamp-2">{rev.review}</p>
                  </td>
                  <td className="py-4 px-6 text-brand-muted whitespace-nowrap">
                    {rev.source || 'Google Review'}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <button
                      onClick={() => toggleFeatured(rev)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        rev.is_featured
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {rev.is_featured ? 'Featured' : 'Standard'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => openEdit(rev)}
                      className="p-1.5 text-brand-secondary hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rev.id, rev.student_name)}
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
        title={editingReview ? 'Edit Review' : 'Add New Student Review'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Student Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.student_name}
              onChange={(e) => setForm({ ...form, student_name: e.target.value })}
              placeholder="e.g. Keerthana Keerthi"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Rating
              </label>
              <div className="py-1">
                <StarRating
                  rating={form.rating}
                  size={22}
                  onChange={(r) => setForm({ ...form, rating: r })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Source
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Google Review"
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Review Content <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.review}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
              placeholder="Enter verified student testimonial..."
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="is_featured_rev"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="is_featured_rev" className="text-xs font-semibold text-brand-text">
              Highlight on Homepage
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Review
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
