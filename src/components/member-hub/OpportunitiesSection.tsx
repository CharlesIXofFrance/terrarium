import React, { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JobCard } from '../jobs/JobCard';
import { useJobs } from '../../lib/hooks/useJobs';

interface OpportunitiesProps {
  styles: any;
}

export function OpportunitiesSection({ styles }: OpportunitiesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { jobs } = useJobs('women-in-fintech');

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    const scrollContainer = containerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Latest Opportunities</h2>
        <Link 
          to="/m/women-in-fintech/jobs"
          className="text-[#8B0000] hover:underline font-medium text-sm md:text-base"
        >
          See all
        </Link>
      </div>

      <div className="relative">
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 md:hidden"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
          onScroll={handleScroll}
        >
          {jobs.slice(0, 4).map((opportunity) => (
            <div 
              key={opportunity.id} 
              className="flex-none w-[85vw] sm:w-[calc(100%-2rem)] md:w-[calc(50%-0.5rem)]"
            >
              <JobCard
                job={opportunity}
                onApply={() => {}}
                variant="carousel"
                className="h-full bg-white shadow-sm hover:shadow-md transition-all duration-200"
              />
            </div>
          ))}
        </div>

        {(showRightArrow || window.innerWidth >= 768) && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>
    </section>
  );
}