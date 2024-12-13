import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, ArrowUp } from 'lucide-react';
import { useAtom } from 'jotai';
import { jobsAtom } from '../../stores/jobs';
import { JobHeader } from '../../components/jobs/JobHeader';
import { SisterScoreCard } from '../../components/jobs/SisterScoreCard';
import { RoleDetails } from '../../components/jobs/RoleDetails';
import { EmployeesTake } from '../../components/jobs/EmployeesTake';
import { CompanyInsights } from '../../components/jobs/CompanyInsights';
import { RelatedJobs } from '../../components/jobs/RelatedJobs';
import { Benefits } from '../../components/jobs/Benefits';
import { WorkingAtCompany } from '../../components/jobs/WorkingAtCompany';
import { CareerConsult } from '../../components/jobs/CareerConsult';
import { getRelatedJobs } from '../../lib/utils/jobs';
import { Button } from '../../components/ui/Button';

export function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobs] = useAtom(jobsAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simulate loading state
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/m/women-in-fintech/jobs')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const relatedJobs = getRelatedJobs(job, jobs);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/m/women-in-fintech/jobs')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back</span>
        </button>

        <div className="space-y-6 md:space-y-8">
          <JobHeader job={job} />

          <SisterScoreCard 
            score={{
              overall: job.sisterScore || 0,
              locationFlexibility: 82,
              hoursFlexibility: 81,
              benefits: 59,
              culture: 85,
              leadership: 78
            }}
            testimonial={{
              name: "Andrea Thompson",
              role: "Community Lead",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
              quote: "This company has shown exceptional commitment to fostering diversity and creating opportunities for our community members."
            }}
            companyName={job.company}
          />

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <RoleDetails 
                details={{
                  responsibilities: job.description.split('. ').filter(Boolean),
                  niceToHave: job.requirements,
                  roleBenefits: job.roleBenefits,
                  languages: [
                    { name: "English", level: "Fluent" }
                  ]
                }}
              />

              {job.testimonials?.length > 0 && (
                <EmployeesTake testimonials={job.testimonials} />
              )}

              {job.benefits && (
                <Benefits benefits={job.benefits} />
              )}

              {job.workingPhotos && (
                <WorkingAtCompany 
                  companyName={job.company}
                  photos={job.workingPhotos}
                  jobTitle={job.title}
                />
              )}
            </div>

            <div className="space-y-6 md:space-y-8">
              {job.companyInsights && (
                <CompanyInsights 
                  insights={job.companyInsights}
                  companyName={job.company}
                  jobTitle={job.title}
                />
              )}

              <div className="sticky top-4">
                <CareerConsult 
                  consultant={{
                    name: "Sophie",
                    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop"
                  }}
                  className="h-auto md:h-[70%]"
                />
              </div>
            </div>
          </div>

          <RelatedJobs currentJobId={jobId} />
        </div>
      </div>

      {/* Back to Top Button - Mobile Only */}
      {showScrollTop && (
        <Button
          variant="outline"
          className="fixed bottom-4 right-4 w-12 h-12 !p-0 rounded-full shadow-lg md:hidden z-50 bg-white"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}