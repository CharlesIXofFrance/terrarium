import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { JobList } from '../components/jobs/JobList';

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Venture Capital Analyst',
    company: 'Anterra Capital',
    companyLogo: 'https://example.com/logos/anterra.png',
    coverImage:
      'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=600&h=400&fit=crop',
    location: 'London',
    type: 'Full-Time',
    salary: {
      min: 70000,
      max: 85000,
      currency: 'EUR',
    },
    experience: '3-5 Years of Experience',
    description:
      'Join our dynamic VC team focusing on AgriFood tech investments.',
    requirements: ['Financial Analysis', 'Due Diligence', 'Market Research'],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 81,
  },
  {
    id: '2',
    title: 'Private Equity Analyst',
    company: 'PGIM',
    companyLogo: 'https://example.com/logos/pgim.png',
    coverImage:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop',
    location: 'Paris',
    type: 'Full-Time',
    salary: {
      min: 75000,
      max: 90000,
      currency: 'EUR',
    },
    experience: '2-4 Years of Experience',
    description:
      'Exciting opportunity to work with one of the largest investment management firms.',
    requirements: ['Private Equity', 'Financial Modeling', 'Deal Execution'],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 78,
  },
  {
    id: '3',
    title: 'Consultant',
    company: 'Mount Consulting',
    companyLogo: 'https://example.com/logos/mount.png',
    coverImage:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop',
    location: 'Amsterdam',
    type: 'Full-Time',
    salary: {
      min: 70000,
      max: 85000,
      currency: 'EUR',
    },
    experience: '3-5 Years of Experience',
    description:
      'Join our growing consulting practice specializing in digital transformation.',
    requirements: ['Strategy', 'Digital Transformation', 'Project Management'],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 81,
  },
];

export function JobBoard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs] = useState(MOCK_JOBS);

  const handleApply = (jobId: string) => {
    console.log('Applying to job:', jobId);
  };

  const handleSave = (jobId: string) => {
    console.log('Saving job:', jobId);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5 text-gray-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <JobList
        jobs={filteredJobs}
        onApply={handleApply}
        onSave={handleSave}
        className="mt-6"
      />
    </div>
  );
}
