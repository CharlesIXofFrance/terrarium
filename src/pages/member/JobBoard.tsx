import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Building2,
  Briefcase,
  Rss,
  X,
  ArrowUp,
} from 'lucide-react';
import { useJobs } from '@/lib/hooks/useJobs';
import { JobList } from '@/components/features/jobs/JobList';
import {
  JobFilters,
  filterLabels,
} from '@/components/features/jobs/JobFilters';
import { SelectedFilters } from '@/components/features/jobs/SelectedFilters';
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';
import { Button } from '@/components/ui/atoms/Button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/layout/molecules/Tabs';
import { useAtom } from 'jotai';
import { currentCommunityAtom } from '@/lib/stores/community';
import { useScrollEnd } from '@/lib/hooks/useScrollEnd';
import { useScrollSync } from '@/lib/hooks/useScrollSync';

export function JobBoard() {
  useScrollRestoration();
  const { communitySlug } = useParams();
  const [currentCommunity] = useAtom(currentCommunityAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const { jobs, totalJobs } = useJobs(communitySlug);

  const listEndRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);

  // Memoize refs array to prevent infinite updates
  const scrollRefs = useMemo(() => [filtersRef, jobsRef], []);

  // Use scroll sync for filters and jobs list
  useScrollSync(scrollRefs);

  // Check if both panels are scrolled to end
  const isAtEnd = useScrollEnd(scrollRefs);

  const primaryColor = currentCommunity?.primaryColor || '#E86C3A';

  // Handle scroll to show/hide buttons and check for list end
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;
      setShowScrollTop(scrollPosition > 400);

      // Check if user is near bottom of the list
      if (listEndRef.current) {
        const listEndPosition =
          listEndRef.current.getBoundingClientRect().bottom;
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
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedFilters([]);
  }, []);

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Top Navigation and Search Area */}
      <div
        className="fixed left-0 right-0 z-50"
        style={{
          backgroundColor: primaryColor,
          top: '72px',
          height: '88px',
        }}
      >
        {/* Mobile Search */}
        <div className="md:hidden">
          {/* Search Input */}
          <div
            className="bg-white w-full"
            onClick={() => setIsSearchOpen(true)}
          >
            <div className="flex items-center h-14 px-4">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              {searchTerm || location ? (
                <div className="text-gray-900">
                  {searchTerm}
                  {location && ` • ${location}`}
                </div>
              ) : (
                <div className="text-gray-500">Search jobs...</div>
              )}
            </div>
          </div>

          {/* Navigation Tabs - Mobile */}
          <div className="bg-[#E86C3A] px-4 py-2">
            <div className="bg-white/20 rounded-lg p-1">
              <div className="flex">
                <button
                  className={`flex items-center justify-center flex-1 px-4 py-2 rounded-md ${
                    activeTab === 'companies'
                      ? 'bg-white text-gray-900'
                      : 'text-white'
                  }`}
                  onClick={() => setActiveTab('companies')}
                >
                  <Building2 className="h-5 w-5 mr-2" />
                  Companies
                </button>
                <button
                  className={`flex items-center justify-center flex-1 px-4 py-2 rounded-md ${
                    activeTab === 'jobs'
                      ? 'bg-white text-gray-900'
                      : 'text-white'
                  }`}
                  onClick={() => setActiveTab('jobs')}
                >
                  <Briefcase className="h-5 w-5 mr-2" />
                  Jobs
                </button>
                <button
                  className={`flex items-center justify-center flex-1 px-4 py-2 rounded-md ${
                    activeTab === 'feed'
                      ? 'bg-white text-gray-900'
                      : 'text-white'
                  }`}
                  onClick={() => setActiveTab('feed')}
                >
                  <Rss className="h-5 w-5 mr-2" />
                  Live Feed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:block px-4 py-2">
          <div className="flex items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-1 flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1 relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/10 p-1">
                <TabsTrigger
                  value="companies"
                  className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-gray-900"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Companies
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-gray-900"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="feed"
                  className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-gray-900"
                >
                  <Rss className="h-4 w-4 mr-2" />
                  Live Feed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-gray-50 z-50 md:hidden"
          style={{ top: '72px' }}
        >
          <div className="flex flex-col h-full">
            {/* Search Inputs */}
            <div className="bg-white px-4 py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Filter Sections */}
            <div className="flex-1 overflow-y-auto pb-32">
              <JobFilters
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                isMobile={true}
                primaryColor={primaryColor}
              />
            </div>

            {/* Bottom Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    clearFilters();
                    setIsSearchOpen(false);
                  }}
                  className="flex-1 py-3 px-6 rounded-lg border border-gray-200 text-gray-900 font-medium bg-white"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="flex-1 py-3 px-6 rounded-lg text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                primaryColor={primaryColor}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <Button className="w-full" onClick={toggleMobileFilters}>
                Show {filteredJobs.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Main Content Area */}
      <div style={{ paddingTop: '72px' }}>
        <div
          className="absolute inset-x-0"
          style={{ top: '88px', bottom: isAtEnd ? '64px' : 0 }}
        >
          <div className="h-full flex">
            {/* Desktop Filters Column */}
            <div className="hidden md:block w-64 shrink-0 bg-white border-r border-gray-200">
              <div ref={filtersRef} className="h-full">
                <JobFilters
                  selectedFilters={selectedFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  filteredJobs={filteredJobs}
                  primaryColor={primaryColor}
                />
              </div>
            </div>

            {/* Jobs Grid Column */}
            <div className="flex-1 px-8 h-full flex flex-col overflow-hidden">
              {/* Selected Filters */}
              {selectedFilters.length > 0 && (
                <div className="sticky top-0 z-30 flex-shrink-0">
                  <div className="flex items-center justify-between py-4">
                    <SelectedFilters
                      filters={selectedFilters}
                      labels={filterLabels}
                      onRemove={handleFilterChange}
                      primaryColor={primaryColor}
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

              {/* Scrollable Jobs Container */}
              <div ref={jobsRef} className="flex-1 overflow-y-auto pt-4 pb-4">
                <div className="flex justify-center">
                  <JobList
                    jobs={filteredJobs}
                    onApply={handleApply}
                    onSave={handleSaveJob}
                    className="grid gap-4"
                  />
                </div>

                {/* List End Marker */}
                <div ref={listEndRef} />

                {/* Bottom Actions */}
                {filteredJobs.length > 0 && showScrollTop && (
                  <div className="sticky bottom-0 flex justify-center items-center py-4 bg-white/80 backdrop-blur-sm">
                    <Button
                      variant="outline"
                      className="w-12 h-12 !p-0 flex items-center justify-center rounded-full md:hidden"
                      onClick={scrollToTop}
                    >
                      <ArrowUp className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
