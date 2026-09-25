import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Check, X, Eye, EyeOff, Upload, Camera, Link, Image as ImageIcon, Clock, Calendar, Zap, Sparkles } from 'lucide-react';
import { dataService } from '../lib/dataService';
import { uploadImage, getImagePreview, MAX_FILE_SIZE } from '../lib/imageUpload';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

const CATEGORY_OPTIONS = [
  'Admission Notice',
  'Urgent Notice',
  'New Course Batch',
  'Exam Schedule',
  'Holiday Announcement',
  'General News'
];

function toDatetimeLocal(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Admission Notice',
    content: '',
    image_url: '',
    action_label: 'Enquire Now',
    action_link: '/contact',
    is_active: true,
    start_time: '',
    end_time: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'url'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const pendingFileRef = useRef(null);
  const fileInputRef = useRef(null);

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadPosts();
    const unsubscribe = dataService.subscribeToPosts(() => {
      loadPosts();
    });
    return () => unsubscribe();
  }, []);

  async function loadPosts() {
    const data = await dataService.getPosts();
    setPosts(data);
  }

  const getTimingStatus = (post) => {
    if (!post.is_active) {
      return { status: 'disabled', label: 'Hidden (Draft)', bg: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
    const now = new Date();
    if (post.start_time) {
      const start = new Date(post.start_time);
      if (now < start) {
        return {
          status: 'scheduled',
          label: `Scheduled for ${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          bg: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      }
    }
    if (post.end_time) {
      const end = new Date(post.end_time);
      if (now > end) {
        return { status: 'expired', label: 'Expired', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      }
    }
    return { status: 'live', label: 'Live Now ✨', bg: 'bg-emerald-500 text-white border-emerald-600 font-bold' };
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      if (!file.type.startsWith('image/')) throw new Error('Please select a valid image file (JPG, PNG, WebP).');
      if (file.size > MAX_FILE_SIZE) throw new Error('Image is too large. Maximum size is 5 MB.');
      const preview = await getImagePreview(file);
      pendingFileRef.current = file;
      setImagePreview(preview);
      setForm((prev) => ({ ...prev, image_url: '__pending_upload__' }));
      showToast('Image selected successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title || '',
        category: post.category || 'Admission Notice',
        content: post.content || '',
        image_url: post.image_url || '',
        action_label: post.action_label || 'Enquire Now',
        action_link: post.action_link || '/contact',
        is_active: post.is_active ?? true,
        start_time: toDatetimeLocal(post.start_time),
        end_time: toDatetimeLocal(post.end_time)
      });
      setImagePreview(post.image_url || '');
      setImageSource(post.image_url ? 'url' : 'upload');
    } else {
      setEditingPost(null);
      setForm({
        title: '',
        category: 'Admission Notice',
        content: '',
        image_url: '',
        action_label: 'Enquire Now',
        action_link: '/contact',
        is_active: true,
        start_time: '',
        end_time: ''
      });
      setImagePreview('');
      setImageSource('upload');
    }
    pendingFileRef.current = null;
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    pendingFileRef.current = null;
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      showToast('Please enter both announcement title and description content.', 'error');
      return;
    }

    setIsUploading(true);
    let finalImageUrl = form.image_url;

    if (pendingFileRef.current) {
      try {
        finalImageUrl = await uploadImage(pendingFileRef.current, 'posts');
      } catch (uploadErr) {
        showToast(`Image upload failed: ${uploadErr.message}.`, 'error');
        setIsUploading(false);
        return;
      }
    }

    const payload = {
      ...form,
      image_url: finalImageUrl === '__pending_upload__' ? '' : finalImageUrl,
      start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
      end_time: form.end_time ? new Date(form.end_time).toISOString() : null
    };

    try {
      if (editingPost) {
        await dataService.updatePost(editingPost.id, payload);
        showToast('Announcement & scheduled timings updated!', 'success');
      } else {
        await dataService.addPost(payload);
        showToast('New announcement published & scheduled!', 'success');
      }
      handleCloseModal();
      loadPosts();
    } catch (err) {
      showToast('Failed to save announcement post.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMakeLiveNow = async (post) => {
    const nowIso = new Date().toISOString();
    await dataService.updatePost(post.id, {
      is_active: true,
      start_time: nowIso,
      end_time: null
    });
    showToast(`⚡ Announcement "${post.title}" is now LIVE on the website!`, 'success');
    loadPosts();
  };

  const handleToggleActive = async (post) => {
    const updatedStatus = !post.is_active;
    await dataService.updatePost(post.id, { is_active: updatedStatus });
    showToast(`Post ${updatedStatus ? 'activated & published' : 'hidden from public'}`, 'info');
    loadPosts();
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete announcement "${title}"? It will be removed from all public visitor pages.`)) {
      await dataService.deletePost(id);
      showToast('Announcement deleted', 'info');
      loadPosts();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-brand-accent" />
            Visitor Announcements & Time Scheduling
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Publish notices, set exact display start & end times, and broadcast alerts to website visitors
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={() => handleOpenModal()}>
          New Scheduled Announcement
        </Button>
      </div>

      {/* Posts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => {
            const timing = getTimingStatus(post);
            return (
              <div
                key={post.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                  post.is_active
                    ? 'border-brand-border shadow-soft hover:shadow-premium'
                    : 'border-amber-200 bg-amber-50/20 opacity-80'
                }`}
              >
                <div>
                  {/* Header Image or Placeholder */}
                  <div className="h-44 bg-brand-bg relative overflow-hidden border-b border-brand-border">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50/70 text-brand-secondary p-4 text-center">
                        <Megaphone className="w-10 h-10 text-brand-secondary/60 mb-1" />
                        <span className="text-xs font-bold text-brand-primary">Official Announcement</span>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-brand-primary text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                      {post.category || 'Announcement'}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs shadow-md border ${timing.bg}`}>
                        {timing.label}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-extrabold text-brand-primary leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed line-clamp-3">
                      {post.content}
                    </p>

                    {/* Time Schedule Details */}
                    {(post.start_time || post.end_time) && (
                      <div className="p-3 bg-brand-bg/80 rounded-2xl border border-brand-border/60 text-xs space-y-1">
                        {post.start_time && (
                          <div className="flex items-center gap-1.5 text-brand-primary font-semibold">
                            <Clock className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
                            <span>Starts: {new Date(post.start_time).toLocaleString()}</span>
                          </div>
                        )}
                        {post.end_time && (
                          <div className="flex items-center gap-1.5 text-brand-muted">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Expires: {new Date(post.end_time).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {post.action_label && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                        <span>Action: {post.action_label}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-brand-bg/60 border-t border-brand-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {timing.status !== 'live' && (
                      <button
                        onClick={() => handleMakeLiveNow(post)}
                        className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-primary transition-colors flex items-center gap-1 shadow-xs"
                        title="Make immediately active & live right now"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Make Live Now</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleActive(post)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                        post.is_active
                          ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      {post.is_active ? 'Hide' : 'Enable'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(post)}
                      className="p-2 text-gray-600 hover:text-brand-primary hover:bg-white rounded-xl transition-colors"
                      title="Edit Schedule & Content"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 bg-white rounded-3xl border border-brand-border text-center">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-brand-primary">No Scheduled Announcements Yet</p>
            <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
              Click "New Scheduled Announcement" to set up timed notices, batch dates, or live alerts for website visitors.
            </p>
          </div>
        )}
      </div>

      {/* Edit / Create Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPost ? 'Edit Scheduled Announcement' : 'Publish & Schedule Visitor Announcement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-primary mb-1.5">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Admissions Open for New Morning DCA & Typing Batches"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-primary mb-1.5">
                Notice Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-brand-primary outline-none bg-white"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-primary mb-1.5">
                Visibility Status
              </label>
              <select
                value={form.is_active ? 'active' : 'hidden'}
                onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })}
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-brand-primary outline-none bg-white"
              >
                <option value="active">Active (Visible when scheduled)</option>
                <option value="hidden">Hidden (Draft)</option>
              </select>
            </div>
          </div>

          {/* Time Scheduling Section */}
          <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-brand-primary flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-secondary" />
                <span>Display Date & Time Scheduling (Optional)</span>
              </span>
              <button
                type="button"
                onClick={() => setForm({ ...form, start_time: toDatetimeLocal(new Date().toISOString()), end_time: '' })}
                className="text-[11px] font-bold text-brand-secondary hover:underline flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Set Start to Now</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-brand-muted font-bold mb-1">
                  Start Display Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-brand-border text-xs focus:ring-2 focus:ring-brand-primary outline-none bg-white"
                />
                <span className="text-[10px] text-brand-muted block mt-0.5">Leave blank to show immediately</span>
              </div>

              <div>
                <label className="block text-brand-muted font-bold mb-1">
                  End / Expiry Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-brand-border text-xs focus:ring-2 focus:ring-brand-primary outline-none bg-white"
                />
                <span className="text-[10px] text-brand-muted block mt-0.5">Leave blank for no expiration</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-primary mb-1.5">
              Announcement Message Content *
            </label>
            <textarea
              required
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write the details for visitors (e.g. batch start dates, course fees, exam timing updates)..."
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>

          {/* Image Option */}
          <div>
            <label className="block text-xs font-bold text-brand-primary mb-1.5">
              Announcement Poster / Image (Optional)
            </label>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  imageSource === 'upload' ? 'bg-brand-primary text-white' : 'bg-brand-bg text-brand-muted border border-brand-border'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageSource('url')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  imageSource === 'url' ? 'bg-brand-primary text-white' : 'bg-brand-bg text-brand-muted border border-brand-border'
                }`}
              >
                Image URL
              </button>
            </div>

            {imageSource === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-brand-border hover:border-brand-primary rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-brand-secondary bg-brand-bg/50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Select Image File (JPG, PNG, WebP)
                </button>
              </div>
            ) : (
              <input
                type="url"
                value={form.image_url === '__pending_upload__' ? '' : form.image_url}
                onChange={(e) => {
                  setForm({ ...form, image_url: e.target.value });
                  setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-brand-primary outline-none"
              />
            )}

            {imagePreview && (
              <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-brand-border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-primary mb-1.5">
                Button Label (Optional)
              </label>
              <input
                type="text"
                value={form.action_label}
                onChange={(e) => setForm({ ...form, action_label: e.target.value })}
                placeholder="e.g. Enquire Now / View Courses"
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-primary mb-1.5">
                Target Link Page
              </label>
              <input
                type="text"
                value={form.action_link}
                onChange={(e) => setForm({ ...form, action_link: e.target.value })}
                placeholder="e.g. /contact or /courses"
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isUploading || isProcessing}>
              {isUploading ? 'Publishing...' : editingPost ? 'Save Schedule & Changes' : 'Publish & Schedule Announcement'}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
