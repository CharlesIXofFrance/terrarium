import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Filter, Building2, Briefcase, Rss, X, ArrowUp } from 'lucide-react';
import { useJobs } from '../../lib/hooks/useJobs';
import { JobList } from '../../components/jobs/JobList';
import { JobFilters, filterLabels } from '../../components/jobs/JobFilters';
import { SelectedFilters } from '../../components/jobs/SelectedFilters';
import { useScrollRestoration } from '../../lib/hooks/useScrollRestoration';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';

export function JobBoard() {
  useScrollRestoration();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const { jobs, totalJobs } = useJobs('women-in-fintech');
  const listEndRef = useRef<HTMLDivElement>(null);

  // Handle scroll to show/hide buttons and check for list end
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;
      setShowScrollTop(scrollPosition > 400);

      // Check if user is near bottom of the list
      if (listEndRef.current) {
        const listEndPosition = listEndRef.current.getBoundingClientRect().bottom;
        const viewportHeight = window.innerHeight;
        setShowLoadMore(listEndPosition <= viewportHeight + 100); // 100px threshold
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApply = useCallback((jobId: string) => {
    console.log('Applying to job:', jobId);
  }, []);

  const handleSaveJob = useCallback((jobId: string) => {
    console.log('Saving job:', jobId);
  }, []);

  const handleFilterChange = useCallback((filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedFilters([]);
  }, []);

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters(prev => !prev);
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-[#9b1c1b] border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-6">
            {/* Search Bar */}
            <div className="flex-1 relative flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9b1c1b] focus:border-transparent shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={toggleMobileFilters}
                className="md:hidden p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
              <TabsList>
                <TabsTrigger value="companies" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Companies</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Jobs</span>
                </TabsTrigger>
                <TabsTrigger value="feed" className="flex items-center space-x-2">
                  <Rss className="h-4 w-4" />
                  <span>Live Feed</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 fixed left-0 top-[88px] bottom-0 z-40 bg-white border-r border-gray-200">
          <JobFilters
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={toggleMobileFilters}
            />
            
            {/* Filters Panel */}
            <div className="absolute inset-y-0 right-0 w-[320px] bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={toggleMobileFilters}>
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              
              <div className="h-[calc(100%-137px)] overflow-y-auto">
                <JobFilters
                  selectedFilters={selectedFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <Button
                  className="w-full"
                  onClick={toggleMobileFilters}
                >
                  Show {filteredJobs.length} Results
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 md:ml-64 pt-4">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Selected Filters */}
            {selectedFilters.length > 0 && (
              <div className="md:sticky md:top-[88px] z-30 bg-white shadow-sm -mx-4 px-4">
                <div className="flex items-center justify-between py-4">
                  <SelectedFilters 
                    filters={selectedFilters}
                    labels={filterLabels}
                    onRemove={handleFilterChange}
                  />
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 ml-4"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            <JobList 
              jobs={filteredJobs} 
              onApply={handleApply} 
              onSave={handleSaveJob}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6"
            />

            {/* List End Marker */}
            <div ref={listEndRef} />

            {/* Bottom Actions */}
            {filteredJobs.length > 0 && (
              <div className="fixed bottom-4 left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto md:mt-8 flex justify-center items-center space-x-4">
                {showLoadMore && (
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none md:px-8 hover:bg-[#9b1c1b] hover:text-white transition-colors"
                    onClick={() => console.log('Loading more jobs...')}
                  >
                    Load More Jobs
                  </Button>
                )}
                {showScrollTop && (
                  <Button
                    variant="outline"
                    className="w-12 h-12 !p-0 flex items-center justify-center rounded-full md:hidden"
                    onClick={scrollToTop}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-[#9b1c1b] text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            We increase female presence in the fintech sector
          </h2>
          <p className="text-lg mb-6">Come join us too</p>
          <img
            src="/logo-white.svg"
            alt="Women in Fintech"
            className="h-8 mx-auto"
          />
        </div>
      </div>
    </div>
  );
}