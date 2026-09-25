import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Video as VideoIcon,
  Plus, 
  Trash2, 
  Star, 
  Upload, 
  Link, 
  X, 
  CheckSquare, 
  Square, 
  Search, 
  Filter, 
  Layers, 
  Loader2,
  ChevronDown,
  Eye,
  EyeOff,
  Play
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import { validateMediaFile, uploadMedia, getMediaPreview } from '../lib/mediaUpload';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

const CATEGORIES = ['Institute', 'Classroom', 'Students', 'Activities', 'Events'];
const PAGE_SIZE = 18;

export default function ManageGallery() {
  const [gallery, setGallery] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'published' | 'unpublished'
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    file_url: '',
    category: 'Classroom',
    is_featured: false,
    is_published: true
  });
  
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video'
  const [mediaSource, setMediaSource] = useState('upload'); // 'upload' | 'camera' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Upload Progress & Batch Files
  const [uploadProgress, setUploadProgress] = useState(null); // { current: 0, total: 0 }
  const [pendingFiles, setPendingFiles] = useState([]);

  // File Inputs
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadGallery();
    const unsubscribe = dataService.subscribeToGallery(() => {
      loadGallery();
    });
    return () => unsubscribe();
  }, []);

  async function loadGallery() {
    const data = await dataService.getGallery('All');
    setGallery(data);
  }

  // File selection handler
  const handleFileSelect = async (e) => {
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
      const validFiles = [];
      for (const file of files) {
        const validation = validateMediaFile(file);
        if (!validation.valid) {
          showToast(`Skipped ${file.name}: ${validation.error}`, 'error');
        } else {
          validFiles.push({ file, mediaType: validation.mediaType });
        }
      }

      if (validFiles.length === 0) {
        return;
      }

      setPendingFiles(validFiles.map(v => v.file));
      const first = validFiles[0];
      setMediaType(first.mediaType);

      const preview = await getMediaPreview(first.file);
      setMediaPreview(preview);
      setForm((prev) => ({ 
        ...prev, 
        file_url: '__pending_upload__',
        title: prev.title || (validFiles.length === 1 ? first.file.name.replace(/\.[^/.]+$/, "") : '')
      }));

      if (validFiles.length > 1) {
        showToast(`${validFiles.length} files validated and ready for batch upload`, 'success');
      } else {
        showToast(`${first.mediaType === 'video' ? 'Video' : 'Image'} validated successfully`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error processing selected files', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearMedia = () => {
    setMediaPreview('');
    setForm((prev) => ({ ...prev, file_url: '' }));
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetModal = () => {
    setForm({
      title: '',
      description: '',
      file_url: '',
      category: 'Classroom',
      is_featured: false,
      is_published: true
    });
    setMediaPreview('');
    setMediaType('image');
    setMediaSource('upload');
    setIsDragging(false);
    setIsProcessing(false);
    setIsUploading(false);
    setUploadProgress(null);
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submit Handler (Single & Batch Upload)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.file_url && pendingFiles.length === 0) {
      showToast('Please select an image or video file to upload', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // 1. BATCH UPLOAD FLOW (Multiple Files)
      if (pendingFiles.length > 1) {
        const total = pendingFiles.length;
        setUploadProgress({ current: 0, total });

        const batchItems = [];
        const baseTitle = form.title.trim() || 'Campus Media';

        for (let i = 0; i < total; i++) {
          const file = pendingFiles[i];
          const uploadRes = await uploadMedia(file, 'gallery');

          const autoTitle = total > 1
            ? `${baseTitle} #${i + 1}`
            : file.name.replace(/\.[^/.]+$/, "");

          batchItems.push({
            title: autoTitle,
            description: form.description || '',
            media_type: uploadRes.mediaType,
            file_url: uploadRes.url,
            image_url: uploadRes.url,
            storage_path: uploadRes.storagePath,
            file_name: uploadRes.fileName,
            file_size: uploadRes.fileSize,
            mime_type: uploadRes.mimeType,
            category: form.category,
            is_featured: form.is_featured,
            is_published: form.is_published
          });

          setUploadProgress({ current: i + 1, total });
        }

        await dataService.addGalleryItems(batchItems);
        showToast(`Successfully uploaded ${total} media items to gallery!`, 'success');
      } 
      // 2. SINGLE FILE OR URL UPLOAD FLOW
      else {
        let finalForm = { ...form };
        if (!finalForm.title) {
          finalForm.title = pendingFiles[0]?.name?.replace(/\.[^/.]+$/, "") || 'Campus Media';
        }

        if (pendingFiles.length === 1) {
          const uploadRes = await uploadMedia(pendingFiles[0], 'gallery');
          finalForm.media_type = uploadRes.mediaType;
          finalForm.file_url = uploadRes.url;
          finalForm.image_url = uploadRes.url;
          finalForm.storage_path = uploadRes.storagePath;
          finalForm.file_name = uploadRes.fileName;
          finalForm.file_size = uploadRes.fileSize;
          finalForm.mime_type = uploadRes.mimeType;
        } else if (finalForm.file_url && !finalForm.media_type) {
          finalForm.media_type = finalForm.file_url.match(/\.(mp4|webm|mov)(\?|$)/i) ? 'video' : 'image';
          finalForm.image_url = finalForm.file_url;
        }

        await dataService.addGalleryItem(finalForm);
        showToast('Media added to gallery successfully', 'success');
      }

      setIsModalOpen(false);
      resetModal();
      await loadGallery();
    } catch (err) {
      console.error('Gallery submit error:', err);
      showToast('Failed to upload media. Please check file format and try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Toggle Publish / Unpublish Status
  const togglePublish = async (item) => {
    const newStatus = !item.is_published;
    await dataService.updateGalleryItem(item.id, { is_published: newStatus });
    showToast(newStatus ? 'Media published to public website' : 'Media unpublished from public website', 'info');
    await loadGallery();
  };

  // Delete single media item
  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}"? This will remove the record and its storage file.`)) {
      await dataService.deleteGalleryItem(id);
      showToast('Media item deleted', 'info');
      setSelectedIds(prev => prev.filter(x => x !== id));
      await loadGallery();
    }
  };

  // Bulk Delete selected media items
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected items and their storage files?`)) {
      await dataService.deleteGalleryItems(selectedIds);
      showToast(`Deleted ${selectedIds.length} items`, 'info');
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

  // Filtered gallery items
  const filteredGallery = gallery.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'published' && item.is_published !== false) || 
                      (activeTab === 'unpublished' && item.is_published === false);
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTab && matchesSearch;
  });

  const paginatedGallery = filteredGallery.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
              Campus Media Gallery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-brand-secondary border border-blue-100">
              {gallery.length} Media Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Upload, record via camera, organize, and publish photos and videos for the public website
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {selectedIds.length > 0 && (
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleBulkDelete}>
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { resetModal(); setIsModalOpen(true); }}>
            Upload Photos / Videos
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-brand-primary text-white shadow-sm' : 'bg-brand-bg text-brand-muted border border-brand-border'
              }`}
            >
              All ({gallery.length})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'published' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-brand-bg text-brand-muted border border-brand-border'
              }`}
            >
              Published ({gallery.filter(g => g.is_published !== false).length})
            </button>
            <button
              onClick={() => setActiveTab('unpublished')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'unpublished' ? 'bg-amber-600 text-white shadow-sm' : 'bg-brand-bg text-brand-muted border border-brand-border'
              }`}
            >
              Drafts ({gallery.filter(g => g.is_published === false).length})
            </button>
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

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-brand-border/60">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setVisibleCount(PAGE_SIZE); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-50 text-brand-secondary border border-blue-200 shadow-xs'
                  : 'bg-brand-bg text-brand-muted hover:text-brand-primary border border-brand-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {paginatedGallery.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGallery.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isVideo = item.media_type === 'video' || (item.file_url && item.file_url.match(/\.(mp4|webm|mov)(\?|$)/i));

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-soft flex flex-col justify-between relative group ${
                    isSelected ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-blue-50/20' : 'border-brand-border hover:shadow-md'
                  }`}
                >
                  {/* Checkbox Badge */}
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

                  {/* Media Display Aspect */}
                  <div className="relative aspect-[16/10] bg-black/90 overflow-hidden flex items-center justify-center">
                    {isVideo ? (
                      <video
                        src={item.file_url || item.image_url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={item.file_url || item.image_url}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Media Type Badge */}
                    <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-md bg-white/95 text-brand-primary shadow-sm flex items-center gap-1">
                      {isVideo ? <VideoIcon className="w-3.5 h-3.5 text-blue-600" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{item.category}</span>
                    </span>

                    {/* Featured & Published Status */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      {item.is_featured && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-sm flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-white" />
                          Featured
                        </span>
                      )}
                      {item.is_published === false && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-800 text-white shadow-sm flex items-center gap-0.5">
                          <EyeOff className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info & Controls */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-brand-primary line-clamp-1">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-brand-muted mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-brand-border flex items-center justify-between">
                      <button
                        onClick={() => togglePublish(item)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                          item.is_published !== false
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                            : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                        }`}
                        title={item.is_published !== false ? "Unpublish from public website" : "Publish to public website"}
                      >
                        {item.is_published !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{item.is_published !== false ? 'Published' : 'Unpublished'}</span>
                      </button>

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

          {/* Load More Button */}
          {visibleCount < filteredGallery.length && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="md"
                icon={ChevronDown}
                iconPosition="right"
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE * 2)}
              >
                Load More Media ({filteredGallery.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-brand-border shadow-soft">
          <ImageIcon className="w-12 h-12 text-brand-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-brand-primary mb-1">No media items match your filter</h3>
          <p className="text-xs text-brand-muted mb-4">Try clearing your search query or upload new photos and videos.</p>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { resetModal(); setIsModalOpen(true); }}>
            Upload Photos / Videos
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
        id="gallery-media-input"
      />

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { if (!isUploading) { setIsModalOpen(false); resetModal(); } }}
        title="Upload Media to Campus Gallery"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Media Title {pendingFiles.length > 1 ? '(Applied to batch)' : ''}
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={pendingFiles.length > 1 ? "e.g. Practical Lab Activity" : "e.g. Computer Practical Practice Session"}
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

          {/* Media Source Buttons */}
          <div>
            <label className="block text-xs font-bold text-brand-text mb-2 uppercase tracking-wide">
              Select Media Source <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMediaSource('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  mediaSource === 'upload'
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md'
                    : 'bg-white text-brand-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                File Picker / Drag & Drop
              </button>
              <button
                type="button"
                onClick={() => setMediaSource('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  mediaSource === 'url'
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md'
                    : 'bg-white text-brand-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                Media URL
              </button>
            </div>

            {/* Drag and Drop File Picker Zone */}
            {mediaSource === 'upload' && !mediaPreview && (
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
                    <p className="text-xs font-semibold text-brand-muted">Processing file(s)...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-brand-primary">Click to select Image or Video files</p>
                      <p className="text-xs text-brand-muted mt-0.5">or drag and drop multiple media files here</p>
                      <p className="text-[10px] text-brand-muted/70 mt-1">Supports JPG, PNG, WebP (Max 25 MB) & MP4, WebM, MOV (Max 100 MB)</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* URL Input */}
            {mediaSource === 'url' && !mediaPreview && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={form.file_url === '__pending_upload__' ? '' : form.file_url}
                  onChange={(e) => {
                    setPendingFiles([]);
                    const val = e.target.value;
                    const detectedType = val.match(/\.(mp4|webm|mov)(\?|$)/i) ? 'video' : 'image';
                    setMediaType(detectedType);
                    setForm({ ...form, file_url: val });
                    if (val) setMediaPreview(val);
                  }}
                  placeholder="https://images.unsplash.com/... or https://domain.com/video.mp4"
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <p className="text-[10px] text-brand-muted/70">Paste a direct image or video URL</p>
              </div>
            )}

            {/* Media Preview Box */}
            {mediaPreview && (
              <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-black">
                {mediaType === 'video' ? (
                  <video src={mediaPreview} controls className="w-full aspect-[16/10] object-contain" />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full aspect-[16/10] object-cover"
                    onError={() => {
                      if (mediaSource === 'url') {
                        showToast('Invalid media URL — could not load preview', 'error');
                        clearMedia();
                      }
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                  title="Remove media selection"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-white/90 flex items-center gap-1.5">
                    {mediaType === 'video' ? <VideoIcon className="w-3.5 h-3.5 text-blue-400" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{mediaType === 'video' ? 'Video selected' : pendingFiles.length > 1 ? `${pendingFiles.length} Photos Selected` : 'Image selected'}</span>
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

          <div className="flex items-center justify-between pt-1 border-t border-brand-border/60">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured_media"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="is_featured_media" className="text-xs font-semibold text-brand-text">
                Highlight on Homepage
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published_media"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="is_published_media" className="text-xs font-semibold text-brand-text">
                Publish Immediately
              </label>
            </div>
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
              disabled={(!form.file_url && pendingFiles.length === 0) || isProcessing || isUploading}
            >
              {isUploading 
                ? (uploadProgress ? `Uploading (${uploadProgress.current}/${uploadProgress.total})...` : 'Uploading...') 
                : (pendingFiles.length > 1 ? `Upload ${pendingFiles.length} Files` : 'Save Media')}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
