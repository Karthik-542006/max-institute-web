import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquarePlus, 
  CheckCircle, 
  Send,
  Sparkles
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import SectionTitle from '../components/SectionTitle';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

export default function Reviews({ settings }) {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    student_name: '',
    rating: 5,
    review: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const data = await dataService.getReviews();
    setReviews(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_name || !form.review) {
      showToast('Please provide your name and feedback.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await dataService.addReview({
        student_name: form.student_name,
        rating: form.rating,
        review: form.review,
        source: 'Student Review'
      });
      showToast('Thank you! Your review has been submitted.', 'success');
      setIsModalOpen(false);
      setForm({ student_name: '', rating: 5, review: '' });
      loadReviews();
    } catch (err) {
      showToast('Could not save review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const rating = settings?.google_rating || 4.9;
  const reviewCount = settings?.total_google_reviews || 110;

  return (
    <div className="py-12 flex flex-col">
      {/* Header */}
      <section className="bg-brand-bg py-16 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-4">
            <Star className="w-3.5 h-3.5 text-brand-accent fill-brand-accent" />
            <span>Student Feedback</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-primary tracking-tight mb-4">
            Student Reviews & Testimonials
          </h1>
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed mb-8">
            Genuine feedback from students and professionals who trained at MAX Educational Institution in Azhagiyamandapam.
          </p>

          {/* Rating Summary Card */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 rounded-3xl bg-white border border-brand-border shadow-soft max-w-xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-brand-primary">{rating}</span>
              <div className="text-left">
                <StarRating rating={5} size={18} />
                <p className="text-xs text-brand-muted mt-0.5">out of 5.0 Stars</p>
              </div>
            </div>
            <div className="hidden sm:block h-10 w-px bg-brand-border" />
            <div className="text-xs text-brand-muted text-center sm:text-left">
              <p className="font-bold text-brand-text">Google Profile Verified</p>
              <p>{reviewCount}+ verified student evaluations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-primary">
                All Verified Reviews
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                Reflecting real learning experiences at our institution
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={MessageSquarePlus}
              onClick={() => setIsModalOpen(true)}
            >
              Write a Review
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* Write a Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Share Your Experience at MAX"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.student_name}
              onChange={(e) => setForm({ ...form, student_name: e.target.value })}
              placeholder="e.g. Keerthana K."
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Your Rating
            </label>
            <div className="py-1">
              <StarRating
                rating={form.rating}
                size={24}
                onChange={(newRating) => setForm({ ...form, rating: newRating })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
              Review / Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.review}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
              placeholder="Tell us about the faculty, computer practicals, typing coaching, or overall learning atmosphere..."
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              icon={Send}
              iconPosition="right"
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
