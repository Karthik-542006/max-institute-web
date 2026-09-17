import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { dataService } from '../lib/dataService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

export default function ManageFAQ() {
  const [faq, setFaq] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [form, setForm] = useState({
    question: '',
    answer: '',
    category: 'General',
    display_order: 1,
    is_active: true
  });
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadFaq();
  }, []);

  async function loadFaq() {
    const data = await dataService.getFAQ();
    setFaq(data);
  }

  const openAdd = () => {
    setEditingFaq(null);
    setForm({
      question: '',
      answer: '',
      category: 'General',
      display_order: faq.length + 1,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingFaq(item);
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category || 'General',
      display_order: item.display_order || 1,
      is_active: item.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question || !form.answer) {
      showToast('Question and answer are required', 'error');
      return;
    }

    if (editingFaq) {
      await dataService.updateFAQ(editingFaq.id, form);
      showToast('FAQ updated successfully', 'success');
    } else {
      await dataService.addFAQ(form);
      showToast('FAQ added successfully', 'success');
    }

    setIsModalOpen(false);
    loadFaq();
  };

  const handleDelete = async (id, q) => {
    if (window.confirm(`Delete question "${q}"?`)) {
      await dataService.deleteFAQ(id);
      showToast('FAQ deleted', 'info');
      loadFaq();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
            FAQ Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Maintain questions, answers, and help items displayed on the public site
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>
          Add Question
        </Button>
      </div>

      <div className="space-y-3">
        {faq.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-brand-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-brand-secondary border border-blue-100">
                  {item.category}
                </span>
                <span className="text-xs text-brand-muted font-mono">
                  Order: {item.display_order}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-brand-primary">
                {item.question}
              </h4>
              <p className="text-xs sm:text-sm text-brand-muted mt-1 line-clamp-2">
                {item.answer}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => openEdit(item)}
                className="p-2 text-brand-secondary hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id, item.question)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="e.g. What are the batch timings?"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="General">General</option>
                <option value="Courses">Courses</option>
                <option value="Admissions">Admissions</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                Display Order
              </label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Clear, informative answer for prospective students..."
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save FAQ
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
