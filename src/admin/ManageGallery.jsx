import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, Tag, Star, Camera, Upload, Link, X } from 'lucide-react';
import { dataService } from '../lib/dataService';
import { uploadImage, getImagePreview, MAX_FILE_SIZE } from '../lib/imageUpload';
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
  const [imagePreview, setImagePreview] = useState('');
  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'camera' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Store the raw File object for upload on submit
  const pendingFileRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    const data = await dataService.getGallery('All');
    setGallery(data);
  }

  // Handle file selection — just generate a preview, store the File for later upload
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
      setForm((prev) => ({ ...prev, image_url: '__pending_upload__' }));
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
      setForm((prev) => ({ ...prev, image_url: '__pending_upload__' }));
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
      setForm((prev) => ({ ...prev, image_url: '__pending_upload__' }));
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
    setForm((prev) => ({ ...prev, image_url: '' }));
    pendingFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const resetModal = () => {
    setForm({
      title: '',
      description: '',
      image_url: '',
      category: 'Classroom',
      is_featured: true
    });
    setImagePreview('');
    setImageSource('upload');
    setIsDragging(false);
    setIsProcessing(false);
    setIsUploading(false);
    pendingFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || (!form.image_url && !pendingFileRef.current)) {
      showToast('Title and image are required', 'error');
      return;
    }

    setIsUploading(true);
    try {
      let finalForm = { ...form };

      // If we have a pending file, upload it to Supabase Storage
      if (pendingFileRef.current) {
        const { url } = await uploadImage(pendingFileRef.current, 'gallery');
        finalForm.image_url = url;
      }

      await dataService.addGalleryItem(finalForm);
      showToast('Photo added to gallery', 'success');
      setIsModalOpen(false);
      resetModal();
      loadGallery();
    } catch (err) {
      console.error('Gallery submit error:', err);
      showToast('Failed to save photo. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
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
        <Button variant="primary" size="sm" icon={Plus} onClick={() => { resetModal(); setIsModalOpen(true); }}>
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

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="gallery-file-input"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
        id="gallery-camera-input"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetModal(); }}
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

          {/* Image Source Selector */}
          <div>
            <label className="block text-xs font-bold text-brand-text mb-2 uppercase tracking-wide">
              Image Source <span className="text-red-500">*</span>
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
                Select File
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
                      <p className="text-xs text-brand-muted mt-0.5">or drag and drop an image here</p>
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
                  value={form.image_url === '__pending_upload__' ? '' : form.image_url}
                  onChange={(e) => {
                    pendingFileRef.current = null;
                    setForm({ ...form, image_url: e.target.value });
                    if (e.target.value) setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
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
                  className="w-full aspect-[16/10] object-cover"
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
                      <><Upload className="w-3 h-3" /> File selected</>
                    )}
                  </p>
                </div>
              </div>
            )}
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
            <Button type="button" variant="outline" size="sm" onClick={() => { setIsModalOpen(false); resetModal(); }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={(!form.image_url && !pendingFileRef.current) || isProcessing || isUploading}>
              {isUploading ? 'Uploading...' : 'Save Photo'}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
