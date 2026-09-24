import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight, Bell, Calendar, Sparkles, X } from 'lucide-react';
import { dataService } from '../lib/dataService';

export default function AnnouncementsBanner() {
  const [posts, setPosts] = useState([]);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    loadPosts();
    const handleUpdate = () => loadPosts();
    window.addEventListener('max_posts_updated', handleUpdate);
    return () => window.removeEventListener('max_posts_updated', handleUpdate);
  }, []);

  async function loadPosts() {
    const data = await dataService.getPosts();
    const activePosts = data.filter(p => p.is_active);
    setPosts(activePosts);
  }

  if (closed || posts.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white py-6 border-b border-white/10 relative overflow-hidden shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-3.5 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-brand-accent/20 border border-brand-accent/40 text-brand-accent flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Megaphone className="w-5 h-5 text-brand-accent" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-brand-accent text-brand-primary">
                  <Sparkles className="w-3 h-3" />
                  {posts[0].category || 'Notice Board'}
                </span>
                <span className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(posts[0].created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                {posts[0].title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed line-clamp-2 max-w-3xl">
                {posts[0].content}
              </p>
            </div>
          </div>

          {/* Action CTA & Close Button */}
          <div className="flex items-center gap-3 shrink-0">
            {posts[0].action_label && (
              <Link to={posts[0].action_link || '/contact'}>
                <button className="px-4 py-2 rounded-xl bg-white text-brand-primary font-bold text-xs sm:text-sm hover:bg-brand-accent hover:text-brand-primary transition-all flex items-center gap-1.5 shadow-sm">
                  <span>{posts[0].action_label}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            )}

            <button
              onClick={() => setClosed(true)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
