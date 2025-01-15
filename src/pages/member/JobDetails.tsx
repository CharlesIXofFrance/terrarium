import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, ArrowUp } from 'lucide-react';
import { useAtom } from 'jotai';
import { jobsAtom } from '../../lib/stores/jobs';
import { JobHeader } from '@/components/features/jobs/JobHeader';
import { SisterScoreCard } from '@/components/features/jobs/SisterScoreCard';
import { RoleDetails } from '@/components/features/jobs/RoleDetails';
import { EmployeesTake } from '@/components/features/jobs/EmployeesTake';
import { CompanyInsights } from '@/components/features/jobs/CompanyInsights';
import { RelatedJobs } from '@/components/features/jobs/RelatedJobs';
import { Benefits } from '@/components/features/jobs/Benefits';
import { WorkingAtCompany } from '@/components/features/jobs/WorkingAtCompany';
import { CareerConsult } from '@/components/features/jobs/CareerConsult';
import { getRelatedJobs } from '@/lib/utils/jobs';
import { Button } from '@/components/ui/atoms/Button';
import { useJob } from '@/lib/hooks/useJob';

export function JobDetails() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Get the job ID from the subdomain path
  const params = new URLSearchParams(window.location.search);
  const subdomainParam = params.get('subdomain') || '';
  const pathParts = subdomainParam.split('/');
  const jobId = pathParts[2]; // jobs/2 -> get the "2"

  // Add console.log for debugging
  console.log('Job ID:', jobId);
  console.log('Path parts:', pathParts);

  const { job, isLoading, error } = useJob(jobId);

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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Job not found</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => navigate('/jobs')}
          >
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const relatedJobs = getRelatedJobs([], job.id);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Back button */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/jobs')}
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="space-y-6 md:space-y-8">
          <JobHeader job={job} />

          <SisterScoreCard
            score={{
              overall: job.sisterScore || 0,
              locationFlexibility: 82,
              hoursFlexibility: 81,
              benefits: 59,
              culture: 85,
              leadership: 78,
            }}
            testimonial={{
              name: 'Andrea Thompson',
              role: 'Community Lead',
              avatar:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
              quote:
                'This company has shown exceptional commitment to fostering diversity and creating opportunities for our community members.',
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
                  languages: [{ name: 'English', level: 'Fluent' }],
                }}
              />

              {job.testimonials?.length > 0 && (
                <EmployeesTake testimonials={job.testimonials} />
              )}

              {job.benefits && <Benefits benefits={job.benefits} />}

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
                    name: 'Sophie',
                    avatar:
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
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
