import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobCard } from './JobCard';
import { scrollToTop } from '../../lib/utils/scroll';
import { useJobs } from '../../lib/hooks/useJobs';
import { getRelatedJobs } from '../../lib/utils/jobs';

interface RelatedJobsProps {
  currentJobId: string;
  limit?: number;
}

export function RelatedJobs({ currentJobId, limit = 3 }: RelatedJobsProps) {
  const { communitySlug } = useParams();
  const navigate = useNavigate();
  const { jobs } = useJobs(communitySlug);

  const handleApply = (jobId: string) => {
    console.log('Applying to job:', jobId);
  };

  const handleSave = (jobId: string) => {
    console.log('Saving job:', jobId);
  };

  const relatedJobs = getRelatedJobs(jobs, currentJobId).slice(0, limit);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleJobClick = (jobId: string) => {
    scrollToTop();
    navigate(`/${communitySlug}/jobs/${jobId}`);
  };

  if (relatedJobs.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4 md:mb-6">Similar Roles</h2>

      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 md:hidden"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 md:grid md:grid-cols-3 md:overflow-visible"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {relatedJobs.map((job) => (
            <div
              key={job.id}
              className="flex-none w-[85vw] md:w-auto"
              onClick={() => handleJobClick(job.id)}
            >
              <JobCard
                job={job}
                onApply={handleApply}
                onSave={handleSave}
                variant="carousel"
                labels={{ scoreName: 'SisterScore' }}
              />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 md:hidden"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
