import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Star, 
  Camera, 
  Upload, 
  Link, 
  X, 
  CheckSquare, 
  Square, 
  Search, 
  Filter, 
  Layers, 
  Loader2,
  ChevronDown
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import { uploadImage, getImagePreview, MAX_FILE_SIZE } from '../lib/imageUpload';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

const CATEGORIES = ['Institute', 'Classroom', 'Students', 'Activities', 'Events'];
const PAGE_SIZE = 18;

export default function ManageGallery() {
  const [gallery, setGallery] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Form State
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

  // Batch Progress State for 1000+ files
  const [uploadProgress, setUploadProgress] = useState(null); // { current: 0, total: 0 }
  const [pendingFiles, setPendingFiles] = useState([]);

  // File Inputs
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

  // Handle Multi-file or single file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await processSelectedFiles(files);
    if (e.target) e.target.value = '';
  };

  const handleCameraCapture = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await processSelectedFiles(files);
    if (e.target) e.target.value = '';
  };

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
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    await processSelectedFiles(files);
  };

  const processSelectedFiles = async (files) => {
    setIsProcessing(true);
    try {
      const validFiles = files.filter(f => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
        throw new Error('Please select valid image files (JPG, PNG, WebP, etc.)');
      }

      const overSized = validFiles.filter(f => f.size > MAX_FILE_SIZE);
      if (overSized.length > 0) {
        throw new Error(`${overSized.length} image(s) exceed the 25 MB limit.`);
      }

      setPendingFiles(validFiles);

      // Generate preview for the first image
      const preview = await getImagePreview(validFiles[0]);
      setImagePreview(preview);
      setForm((prev) => ({ 
        ...prev, 
        image_url: '__pending_upload__',
        title: prev.title || (validFiles.length === 1 ? validFiles[0].name.replace(/\.[^/.]+$/, "") : '')
      }));

      if (validFiles.length > 1) {
        showToast(`${validFiles.length} images ready for bulk upload`, 'success');
      } else {
        showToast('Image loaded successfully', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setForm((prev) => ({ ...prev, image_url: '' }));
    setPendingFiles([]);
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
    setUploadProgress(null);
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // High performance submit handler supporting single or batch 1000+ uploads
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image_url && pendingFiles.length === 0) {
      showToast('Please select or paste an image', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // 1. BULK UPLOAD FLOW (Multiple Files)
      if (pendingFiles.length > 1) {
        const total = pendingFiles.length;
        setUploadProgress({ current: 0, total });

        const batchItems = [];
        const baseTitle = form.title.trim() || 'Campus Activity';

        for (let i = 0; i < total; i++) {
          const file = pendingFiles[i];
          const { url } = await uploadImage(file, 'gallery');

          const autoTitle = total > 1
            ? `${baseTitle} #${i + 1}`
            : file.name.replace(/\.[^/.]+$/, "");

          batchItems.push({
            title: autoTitle,
            description: form.description || '',
            image_url: url,
            category: form.category,
            is_featured: form.is_featured
          });

          setUploadProgress({ current: i + 1, total });
        }

        await dataService.addGalleryItems(batchItems);
        showToast(`Successfully uploaded ${total} images to gallery!`, 'success');
      } 
      // 2. SINGLE FILE OR URL UPLOAD FLOW
      else {
        let finalForm = { ...form };
        if (!finalForm.title) {
          finalForm.title = pendingFiles[0]?.name?.replace(/\.[^/.]+$/, "") || 'Campus Image';
        }

        if (pendingFiles.length === 1) {
          const { url } = await uploadImage(pendingFiles[0], 'gallery');
          finalForm.image_url = url;
        }

        await dataService.addGalleryItem(finalForm);
        showToast('Photo added to gallery', 'success');
      }

      setIsModalOpen(false);
      resetModal();
      await loadGallery();
    } catch (err) {
      console.error('Gallery submit error:', err);
      showToast('Failed to save photos. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Delete single photo
  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete photo "${title}"?`)) {
      await dataService.deleteGalleryItem(id);
      showToast('Photo deleted', 'info');
      setSelectedIds(prev => prev.filter(x => x !== id));
      await loadGallery();
    }
  };

  // Bulk Delete selected photos
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected photos?`)) {
      await dataService.deleteGalleryItems(selectedIds);
      showToast(`Deleted ${selectedIds.length} photos`, 'info');
      setSelectedIds([]);
      await loadGallery();
    }
  };

  // Select / Deselect All
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredGallery.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGallery.map(g => g.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filtered & Paginated gallery list
  const filteredGallery = gallery.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const paginatedGallery = filteredGallery.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
              Gallery Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-brand-secondary border border-blue-100">
              {gallery.length} Photos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Upload, organize, and bulk-manage campus photos and student activities
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {selectedIds.length > 0 && (
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleBulkDelete}>
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { resetModal(); setIsModalOpen(true); }}>
            Upload Photos
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setVisibleCount(PAGE_SIZE); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-brand-bg text-brand-muted hover:text-brand-primary hover:bg-gray-100 border border-brand-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Select All Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder="Search by title..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {filteredGallery.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-primary shrink-0"
            >
              {selectedIds.length === filteredGallery.length && filteredGallery.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-brand-primary" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>Select All</span>
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {paginatedGallery.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGallery.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-soft flex flex-col justify-between relative group ${
                    isSelected ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-blue-50/20' : 'border-brand-border hover:shadow-md'
                  }`}
                >
                  {/* Selection Checkbox Badge */}
                  <button
                    onClick={() => toggleSelectOne(item.id)}
                    className="absolute top-3 left-3 z-10 w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm border border-brand-border flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-brand-primary fill-brand-primary/10" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  <div className="relative aspect-[16/10] bg-gray-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-md bg-white/95 text-brand-primary shadow-sm">
                      {item.category}
                    </span>
                    {item.is_featured && (
                      <span className="absolute bottom-3 left-3 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-sm flex items-center gap-1">
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

                    <div className="pt-3 mt-3 border-t border-brand-border flex items-center justify-between">
                      <span className="text-[10px] text-brand-muted font-mono">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}
                      </span>
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
              );
            })}
          </div>

          {/* Load More Button for 1000+ Items */}
          {visibleCount < filteredGallery.length && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="md"
                icon={ChevronDown}
                iconPosition="right"
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE * 2)}
              >
                Load More Photos ({filteredGallery.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-brand-border shadow-soft">
          <ImageIcon className="w-12 h-12 text-brand-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-brand-primary mb-1">No images match your filter</h3>
          <p className="text-xs text-brand-muted mb-4">Try clearing your search query or upload new photos.</p>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { resetModal(); setIsModalOpen(true); }}>
            Upload Photos
          </Button>
        </div>
      )}

      {/* Hidden Multi-file & Camera inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
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
        onClose={() => { if (!isUploading) { setIsModalOpen(false); resetModal(); } }}
        title="Upload Images to Campus Gallery"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Photo Title / Prefix {pendingFiles.length > 1 ? '(Applied to batch)' : ''}
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={pendingFiles.length > 1 ? "e.g. Computer Lab Practice Session" : "e.g. Practical Computer Practice Session"}
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
                Select File(s)
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

            {/* Upload / Multi-file Drag-and-Drop Zone */}
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
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                    <p className="text-xs font-semibold text-brand-muted">Processing image(s)...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-brand-primary">Click to select files (Supports Multi-Selection)</p>
                      <p className="text-xs text-brand-muted mt-0.5">or drag and drop multiple images here</p>
                      <p className="text-[10px] text-brand-muted/70 mt-1">Select dozens or 100s of JPG, PNG, WebP files • Max 25 MB/file</p>
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
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
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
                    setPendingFiles([]);
                    setForm({ ...form, image_url: e.target.value });
                    if (e.target.value) setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <p className="text-[10px] text-brand-muted/70">Paste a direct image URL from the web</p>
              </div>
            )}

            {/* Image Preview / Multi-file Batch Badge */}
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
                  title="Remove image selection"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-white/90 flex items-center gap-1">
                    {imageSource === 'camera' ? (
                      <><Camera className="w-3 h-3" /> Photo captured</>
                    ) : imageSource === 'url' ? (
                      <><Link className="w-3 h-3" /> From URL</>
                    ) : pendingFiles.length > 1 ? (
                      <><Layers className="w-3.5 h-3.5 text-brand-accent" /> <span className="font-bold text-white">{pendingFiles.length} Photos Selected</span></>
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

          {/* Upload Progress Bar for Batch Uploads */}
          {uploadProgress && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-brand-primary">
                <span>Uploading batch...</span>
                <span>{uploadProgress.current} / {uploadProgress.total} ({Math.round((uploadProgress.current / uploadProgress.total) * 100)}%)</span>
              </div>
              <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-primary transition-all duration-300"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => { setIsModalOpen(false); resetModal(); }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              size="sm" 
              loading={isUploading} 
              disabled={(!form.image_url && pendingFiles.length === 0) || isProcessing || isUploading}
            >
              {isUploading 
                ? (uploadProgress ? `Uploading (${uploadProgress.current}/${uploadProgress.total})...` : 'Uploading...') 
                : (pendingFiles.length > 1 ? `Upload ${pendingFiles.length} Photos` : 'Save Photo')}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
