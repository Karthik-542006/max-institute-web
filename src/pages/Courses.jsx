import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  Clock, 
  Award, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import SectionTitle from '../components/SectionTitle';
import CourseCard from '../components/CourseCard';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await dataService.getCourses();
      if (isMounted) {
        setCourses(data.filter(c => c.is_active));
      }
    }
    load();
    const unsubscribe = dataService.subscribeToCourses(() => {
      load();
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const categories = ['All', 'Computer Courses', 'Typing Courses', 'Technical Courses'];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.short_description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEnquire = (course) => {
    navigate('/contact', { state: { selectedCourse: course.title } });
  };

  return (
    <div className="py-12 flex flex-col">
      {/* Header */}
      <section className="bg-brand-bg py-16 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-4">
            <GraduationCap className="w-3.5 h-3.5 text-brand-accent" />
            <span>Curriculum & Training</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-primary tracking-tight mb-4">
            All Academic & Practical Programs
          </h1>
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Career-oriented computer training, touch typing proficiency, and technical fundamentals tailored for students, job seekers, and working professionals.
          </p>
        </div>
      </section>

      {/* Courses List & Filters */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Controls Bar: Search & Category Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-brand-bg text-brand-muted hover:text-brand-primary hover:bg-gray-100 border border-brand-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-bg/50"
              />
            </div>
          </div>

          {/* Grid of Course Cards */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onSelect={(c) => setSelectedCourse(c)}
                  onEnquire={handleEnquire}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-bg rounded-3xl border border-dashed border-brand-border">
              <Filter className="w-10 h-10 text-brand-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-brand-primary mb-1">No matching programs found</h3>
              <p className="text-xs text-brand-muted mb-4">Try clearing your search filters or browse all categories.</p>
              <Button variant="outline" size="sm" onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}>
                Reset Filters
              </Button>
            </div>
          )}

        </div>
      </section>

      {/* Course Details Modal */}
      <Modal
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title || 'Program Overview'}
      >
        {selectedCourse && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-brand-primary border border-blue-100">
                {selectedCourse.category}
              </span>
              <span className="text-xs font-medium text-brand-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-secondary" />
                Duration: {selectedCourse.duration}
              </span>
              <span className="text-xs font-medium text-brand-accent flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Level: {selectedCourse.level}
              </span>
            </div>

            <p className="text-sm text-brand-text leading-relaxed">
              {selectedCourse.description || selectedCourse.short_description}
            </p>

            <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-2.5">
                Key Learning Outcomes
              </h4>
              <ul className="text-xs text-brand-muted space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Step-by-step practical modules conducted by certified senior faculty</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Individual workstation practice with uninterrupted screen access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Preparation for competitive exams and corporate office requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Official course completion certificate and job referral guidance</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedCourse(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => {
                  const c = selectedCourse;
                  setSelectedCourse(null);
                  handleEnquire(c);
                }}
              >
                Enquire for this Program
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
