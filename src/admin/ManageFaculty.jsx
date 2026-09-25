import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Edit2, Trash2, Check, X, User, Upload, Camera, Link } from 'lucide-react';
import { dataService } from '../lib/dataService';
import { uploadImage, getImagePreview, MAX_FILE_SIZE } from '../lib/imageUpload';
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
  const [imagePreview, setImagePreview] = useState('');
  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'camera' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const pendingFileRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadFaculty();
    const unsubscribe = dataService.subscribeToFaculty(() => {
      loadFaculty();
    });
    return () => unsubscribe();
  }, []);

  async function loadFaculty() {
    const data = await dataService.getFaculty();
    setFaculty(data);
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      if (!file.type.startsWith('image/')) throw new Error('Please select a valid image file (JPG, PNG, WebP, etc.)');
      if (file.size > MAX_FILE_SIZE) throw new Error('Image is too large. Maximum size is 5 MB.');
      const preview = await getImagePreview(file);
      pendingFileRef.current = file;
      setImagePreview(preview);
      setForm((prev) => ({ ...prev, photo_url: '__pending_upload__' }));
      showToast('Image loaded successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      if (!file.type.startsWith('image/')) throw new Error('Please select a valid image file.');
      if (file.size > MAX_FILE_SIZE) throw new Error('Image is too large. Maximum size is 5 MB.');
      const preview = await getImagePreview(file);
      pendingFileRef.current = file;
      setImagePreview(preview);
      setForm((prev) => ({ ...prev, photo_url: '__pending_upload__' }));
      showToast('Photo captured successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      if (!file.type.startsWith('image/')) throw new Error('Please select a valid image file.');
      if (file.size > MAX_FILE_SIZE) throw new Error('Image is too large. Maximum size is 5 MB.');
      const preview = await getImagePreview(file);
      pendingFileRef.current = file;
      setImagePreview(preview);
      setForm((prev) => ({ ...prev, photo_url: '__pending_upload__' }));
      setImageSource('upload');
      showToast('Image loaded successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setForm((prev) => ({ ...prev, photo_url: '' }));
    pendingFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const resetImageState = () => {
    setImagePreview('');
    setImageSource('upload');
    setIsDragging(false);
    setIsProcessing(false);
    setIsUploading(false);
    pendingFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const openAdd = () => {
    setEditingFaculty(null);
    setForm({
      name: '',
      designation: 'Senior Instructor',
      specialization: '',
      experience: '5+ Years',
      photo_url: '',
      description: '',
      display_order: faculty.length + 1,
      is_active: true
    });
    resetImageState();
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
    if (member.photo_url) {
      setImagePreview(member.photo_url);
      if (member.photo_url.startsWith('data:')) {
        setImageSource('upload');
      } else {
        setImageSource('url');
      }
    } else {
      resetImageState();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.designation) {
      showToast('Name and designation are required', 'error');
      return;
    }

    setIsUploading(true);
    try {
      let finalForm = { ...form };

      if (pendingFileRef.current) {
        const { url } = await uploadImage(pendingFileRef.current, 'faculty');
        finalForm.photo_url = url;
      }

      if (editingFaculty) {
        await dataService.updateFaculty(editingFaculty.id, finalForm);
        showToast('Faculty updated successfully', 'success');
      } else {
        await dataService.addFaculty(finalForm);
        showToast('New faculty added successfully', 'success');
      }

      setIsModalOpen(false);
      resetImageState();
      loadFaculty();
    } catch (err) {
      console.error('Faculty submit error:', err);
      showToast('Failed to save faculty details. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
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
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

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
              {faculty.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-brand-muted">
                    <Users className="w-10 h-10 mx-auto mb-2 text-brand-muted/40" />
                    <p className="text-sm font-semibold text-brand-primary">No faculty members found</p>
                    <p className="text-xs mt-0.5">Click "Add Faculty Member" above to create one.</p>
                  </td>
                </tr>
              ) : (
                faculty.map((member) => (
                  <tr key={member.id} className="hover:bg-brand-bg/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-brand-border flex items-center justify-center shrink-0 overflow-hidden relative">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name || 'Faculty Member'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.parentElement.querySelector('.fallback-icon');
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="fallback-icon w-full h-full items-center justify-center text-brand-secondary bg-blue-50"
                            style={{ display: member.photo_url ? 'none' : 'flex' }}
                          >
                            <User className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-brand-primary">{member.name || 'Unnamed Member'}</div>
                          <div className="text-[11px] text-brand-muted line-clamp-1 max-w-xs">{member.description || member.specialization || 'Faculty Member'}</div>
                        </div>
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
                ))
              )}
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

          {/* Photo Source Selector */}
          <div>
            <label className="block text-xs font-bold text-brand-text mb-2 uppercase tracking-wide">
              Faculty Photo
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  imageSource === 'upload'
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md'
                    : 'bg-white text-brand-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setImageSource('camera')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  imageSource === 'camera'
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md'
                    : 'bg-white text-brand-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Camera
              </button>
              <button
                type="button"
                onClick={() => setImageSource('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  imageSource === 'url'
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md'
                    : 'bg-white text-brand-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                URL
              </button>
            </div>

            {/* Upload / Drag-and-Drop Zone */}
            {imageSource === 'upload' && !imagePreview && (
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? 'border-brand-primary bg-brand-primary/5 scale-[1.01]'
                    : 'border-brand-border hover:border-brand-primary hover:bg-gray-50'
                } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-brand-muted">Processing image...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-brand-primary">Click to browse files</p>
                      <p className="text-xs text-brand-muted mt-0.5">or drag and drop a photo here</p>
                      <p className="text-[10px] text-brand-muted/70 mt-1">JPG, PNG, WebP • Max 5 MB</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Camera Capture Zone */}
            {imageSource === 'camera' && !imagePreview && (
              <div
                onClick={() => cameraInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-brand-border hover:border-brand-primary hover:bg-gray-50 cursor-pointer transition-all ${
                  isProcessing ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-brand-muted">Processing photo...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-600">Tap to open camera</p>
                      <p className="text-xs text-brand-muted mt-0.5">Take a photo using your device camera</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* URL Input */}
            {imageSource === 'url' && !imagePreview && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={form.photo_url}
                  onChange={(e) => {
                    setForm({ ...form, photo_url: e.target.value });
                    if (e.target.value) setImagePreview(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <p className="text-[10px] text-brand-muted/70">Paste a direct image URL from the web</p>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-gray-50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full aspect-square object-cover max-h-48 mx-auto"
                  onError={() => {
                    if (imageSource === 'url') {
                      showToast('Invalid image URL — could not load preview', 'error');
                      clearImage();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-[11px] font-semibold text-white/90 flex items-center gap-1">
                    {imageSource === 'camera' ? (
                      <><Camera className="w-3 h-3" /> Photo captured</>
                    ) : imageSource === 'url' ? (
                      <><Link className="w-3 h-3" /> From URL</>
                    ) : (
                      <><Upload className="w-3 h-3" /> File uploaded</>
                    )}
                  </p>
                </div>
              </div>
            )}
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
            <Button type="submit" variant="primary" size="sm" loading={isUploading} disabled={isProcessing || isUploading}>
              {editingFaculty ? 'Save Changes' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
