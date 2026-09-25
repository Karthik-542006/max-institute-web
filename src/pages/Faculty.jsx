import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import SectionTitle from '../components/SectionTitle';
import FacultyCard from '../components/FacultyCard';
import Modal from '../components/Modal';
import Button from '../components/Button';

export default function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await dataService.getFaculty();
      if (isMounted) {
        setFaculty(data.filter(f => f.is_active));
      }
    }
    load();
    const unsubscribe = dataService.subscribeToFaculty(() => {
      load();
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <div className="py-12 flex flex-col">
      {/* Header */}
      <section className="bg-brand-bg py-16 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-4">
            <Users className="w-3.5 h-3.5 text-brand-accent" />
            <span>Instructional Team</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-primary tracking-tight mb-4">
            Meet Our Experienced Faculty
          </h1>
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Passionate instructors committed to individual mentoring, rigorous practical computer coaching, and certified typing precision.
          </p>
        </div>
      </section>

      {/* Faculty Cards Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {faculty.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {faculty.map((member) => (
                <FacultyCard
                  key={member.id}
                  faculty={member}
                  onSelect={(f) => setSelectedFaculty(f)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-brand-bg/50 rounded-3xl border border-brand-border">
              <Users className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-brand-primary">Our Faculty Roster is Being Updated</h3>
              <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto mt-1">
                Please check back soon or contact our administration directly for instructor details.
              </p>
            </div>
          )}

          {/* Institutional Commitment Banner */}
          <div className="mt-16 bg-brand-bg rounded-3xl p-8 sm:p-10 border border-brand-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-xl font-bold text-brand-primary mb-2">
                Dedicated Mentorship for Every Student
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                At MAX, faculty members do not just lecture—they sit alongside students in the computer labs, monitoring typing rhythm, error rates, and software assignments.
              </p>
            </div>
            <Link to="/contact">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Connect With Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Faculty Detail Modal */}
      <Modal
        isOpen={Boolean(selectedFaculty)}
        onClose={() => setSelectedFaculty(null)}
        title={selectedFaculty?.name || 'Faculty Profile'}
      >
        {selectedFaculty && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={selectedFaculty.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80'}
                alt={selectedFaculty.name}
                className="w-16 h-16 rounded-2xl object-cover border border-brand-border"
              />
              <div>
                <h4 className="text-base font-bold text-brand-primary">{selectedFaculty.name}</h4>
                <p className="text-xs text-brand-secondary font-medium">{selectedFaculty.designation}</p>
                <p className="text-xs text-brand-muted mt-0.5">Experience: {selectedFaculty.experience}</p>
              </div>
            </div>

            <div className="p-3 bg-brand-bg rounded-xl border border-brand-border text-xs">
              <p className="font-bold text-brand-primary mb-0.5">Specialization Area:</p>
              <p className="text-brand-muted">{selectedFaculty.specialization}</p>
            </div>

            <p className="text-sm text-brand-text leading-relaxed">
              {selectedFaculty.description}
            </p>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedFaculty(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
