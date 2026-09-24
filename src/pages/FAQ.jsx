import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Search, ArrowRight, Phone } from 'lucide-react';
import { dataService } from '../lib/dataService';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';

export default function FAQ({ settings }) {
  const [faqList, setFaqList] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await dataService.getFAQ();
      setFaqList(data.filter(f => f.is_active));
    }
    load();
  }, []);

  const categories = ['All', 'Courses', 'Admissions', 'General'];

  const filteredFaq = faqList.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 flex flex-col">
      {/* Header */}
      <section className="bg-brand-bg py-16 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-brand-accent" />
            <span>Help & Answers</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-primary tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Quick information about course durations, admission procedures, batch timings, and institutional facilities at MAX.
          </p>
        </div>
      </section>

      {/* Accordion & Search */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-brand-primary text-white'
                      : 'bg-brand-bg text-brand-muted hover:text-brand-primary border border-brand-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-bg/50"
              />
            </div>
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5">
            {filteredFaq.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-brand-border bg-brand-bg/40 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-brand-primary hover:text-brand-secondary transition-colors focus:outline-none"
                  >
                    <span className="text-base sm:text-lg">{item.question}</span>
                    <span className="w-7 h-7 rounded-full bg-white border border-brand-border flex items-center justify-center shrink-0 text-brand-primary font-bold">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-brand-muted leading-relaxed border-t border-brand-border/40 animate-fade-in">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Still Have Questions Box */}
          <div className="mt-16 p-8 rounded-3xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-brand-primary mb-1">
                Still have unanswered questions?
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted">
                Our counselors are ready to help you choose the best program for your goals.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a href={`tel:${(settings?.phone || '+91 99654 68185').replace(/\s+/g, '')}`}>
                <Button variant="outline" size="sm" icon={Phone}>
                  Call Us
                </Button>
              </a>
              <Link to="/contact">
                <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                  Send Enquiry
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
