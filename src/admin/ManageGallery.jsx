import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Tag, Star } from 'lucide-react';
import { dataService } from '../lib/dataService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

const CATEGORIES = ['Institute', 'Classroom', 'Students', 'Activities', 'Events'];

export default function ManageGallery() {
  const [gallery, setGallery] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'Classroom',
    is_featured: true
  });
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    const data = await dataService.getGallery('All');
    setGallery(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image_url) {
      showToast('Title and image URL are required', 'error');
      return;
    }

    await dataService.addGalleryItem(form);
    showToast('Photo added to gallery', 'success');
    setIsModalOpen(false);
    setForm({
      title: '',
      description: '',
      image_url: '',
      category: 'Classroom',
      is_featured: true
    });
    loadGallery();
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete photo "${title}"?`)) {
      await dataService.deleteGalleryItem(id);
      showToast('Photo deleted', 'info');
      loadGallery();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
            Gallery Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Organize institute photos, student achievements, and lab facilities
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Photo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-soft flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] bg-gray-100">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-md bg-white/95 text-brand-primary shadow-sm">
                {item.category}
              </span>
              {item.is_featured && (
                <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500 text-white shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Featured
                </span>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-brand-primary line-clamp-1">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-brand-muted mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-brand-border flex items-center justify-end">
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Image to Campus Gallery"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Photo Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Practical Computer Practice Session"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Caption / Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the activity or facility..."
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="is_featured_img"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="is_featured_img" className="text-xs font-semibold text-brand-text">
              Highlight on Homepage
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Photo
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
