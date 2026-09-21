import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Monitor, 
  Keyboard, 
  GraduationCap, 
  Award, 
  Settings as SettingsIcon, 
  Users,
  Upload,
  Link,
  Image as ImageIcon
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import { uploadImage, getImagePreview, MAX_FILE_SIZE } from '../lib/imageUpload';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

const AVAILABLE_ICONS = ['Monitor', 'Keyboard', 'BookOpen', 'GraduationCap', 'Award', 'Settings', 'Users'];
const CATEGORIES = ['Computer Courses', 'Typing Courses', 'Technical Courses'];

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'Computer Courses',
    short_description: '',
    description: '',
    duration: '2 Months',
    level: 'Beginner to Intermediate',
    icon: 'Monitor',
    image_url: '',
    display_order: 1,
    is_active: true
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const pendingFileRef = useRef(null);
  const fileInputRef = useRef(null);

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    const data = await dataService.getCourses();
    setCourses(data);
    setLoading(false);
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      if (!file.type.startsWith('image/')) throw new Error('Please select a valid image file');
      if (file.size > MAX_FILE_SIZE) throw new Error('Image is too large. Maximum size is 5 MB.');
      const preview = await getImagePreview(file);
      pendingFileRef.current = file;
      setImagePreview(preview);
      setForm((prev) => ({ ...prev, image_url: '__pending_upload__' }));
      showToast('Course image selected', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setForm({
      title: '',
      slug: '',
      category: 'Computer Courses',
      short_description: '',
      description: '',
      duration: '2 Months',
      level: 'Beginner to Intermediate',
      icon: 'Monitor',
      image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      display_order: courses.length + 1,
      is_active: true
    });
    setImagePreview('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80');
    pendingFileRef.current = null;
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    const imgUrl = course.image_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80';
    setForm({
      title: course.title,
      slug: course.slug || course.title.toLowerCase().replace(/\s+/g, '-'),
      category: course.category,
      short_description: course.short_description,
      description: course.description || '',
      duration: course.duration,
      level: course.level,
      icon: course.icon || 'Monitor',
      image_url: imgUrl,
      display_order: course.display_order || 1,
      is_active: course.is_active ?? true
    });
    setImagePreview(imgUrl);
    pendingFileRef.current = null;
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.short_description) {
      showToast('Title and short description are required', 'error');
      return;
    }

    setIsUploading(true);
    try {
      let finalForm = { ...form };
      if (pendingFileRef.current) {
        const { url } = await uploadImage(pendingFileRef.current, 'courses');
        finalForm.image_url = url;
      }

      const payload = {
        ...finalForm,
        slug: finalForm.slug || finalForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };

      if (editingCourse) {
        await dataService.updateCourse(editingCourse.id, payload);
        showToast('Course updated successfully', 'success');
      } else {
        await dataService.addCourse(payload);
        showToast('New course added successfully', 'success');
      }

      setIsModalOpen(false);
      loadCourses();
    } catch (err) {
      console.error('Course submit error:', err);
      showToast('Failed to save course. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await dataService.deleteCourse(id);
      showToast('Course removed', 'info');
      loadCourses();
    }
  };

  const toggleActive = async (course) => {
    await dataService.updateCourse(course.id, { is_active: !course.is_active });
    loadCourses();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
            Course Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Add, edit, reorder, or archive academic programs and training curriculum
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={openAddModal}>
          Add New Course
        </Button>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-bg/60 border-b border-brand-border text-brand-muted uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-bold">Program</th>
                <th className="py-3.5 px-6 font-bold">Category</th>
                <th className="py-3.5 px-6 font-bold">Duration</th>
                <th className="py-3.5 px-6 font-bold">Level</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-brand-bg/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-brand-primary text-sm">{course.title}</div>
                    <div className="text-xs text-brand-muted line-clamp-1 max-w-xs">{course.short_description}</div>
                  </td>
                  <td className="py-4 px-6 text-brand-text">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-brand-secondary border border-blue-100">
                      {course.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-brand-muted">{course.duration}</td>
                  <td className="py-4 px-6 text-brand-muted">{course.level}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleActive(course)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        course.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {course.is_active ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-gray-400" />}
                      <span>{course.is_active ? 'Active' : 'Draft'}</span>
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(course)}
                      className="p-1.5 text-brand-secondary hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id, course.title)}
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

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? `Edit: ${editingCourse.title}` : 'Add New Academic Program'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. MS Office Suite Mastery"
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Duration
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 2 Months"
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Level
              </label>
              <input
                type="text"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                placeholder="e.g. Beginner to Intermediate"
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Icon (Lucide SVG)
              </label>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {AVAILABLE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              placeholder="1-2 sentences summarizing this program..."
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Full Curriculum Overview
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed syllabus, modules, and prerequisites..."
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Course Cover Image
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-brand-bg border border-brand-border">
              {imagePreview && (
                <div className="w-24 h-16 rounded-xl overflow-hidden bg-black/5 shrink-0 border border-brand-border">
                  <img src={imagePreview} alt="Course cover" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    id="course-image-upload"
                  />
                  <label
                    htmlFor="course-image-upload"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-brand-primary border border-brand-border hover:bg-gray-50 transition-colors shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>Upload Image File</span>
                  </label>
                  {isProcessing && <span className="text-xs text-brand-muted italic">Processing...</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Link className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="url"
                    value={form.image_url === '__pending_upload__' ? '' : form.image_url}
                    onChange={(e) => {
                      setForm({ ...form, image_url: e.target.value });
                      setImagePreview(e.target.value);
                      pendingFileRef.current = null;
                    }}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full px-3 py-1 rounded-lg border border-brand-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="is_active" className="text-xs font-semibold text-brand-text">
              Active / Visible on public website
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isUploading}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
