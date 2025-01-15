import { useQuery } from '@tanstack/react-query';
import type { Job } from '../types';

const MOCK_JOBS: Record<string, Job> = {
  '1': {
    id: '1',
    title: 'Venture Capital Analyst',
    company: 'Anterra Capital',
    companyLogo: 'https://example.com/logos/anterra.png',
    coverImage:
      'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=600&h=400&fit=crop',
    location: 'London',
    type: 'Internship',
    salary: {
      min: 70000,
      max: 85000,
      currency: 'EUR',
    },
    experience: '3-5 Years of Experience',
    description:
      'Join our dynamic VC team focusing on AgriFood tech investments. Perfect for those passionate about sustainable agriculture and food innovation.',
    requirements: [
      'Degree in Finance, Business, or Economics',
      'Strong analytical and financial modeling skills',
      'Previous experience in venture capital or startup environment',
      'Passion for AgriFood technology',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 81,
    benefits: [
      { icon: '🏥', label: 'Health Insurance' },
      { icon: '🌴', label: 'Unlimited PTO' },
      { icon: '💻', label: 'Remote Work Options' },
      { icon: '📚', label: 'Learning Budget' },
    ],
    companyInsights: {
      founded: 2015,
      size: '11-50',
      funding: 'Series A',
      industry: 'Venture Capital',
    },
    scores: {
      culture: 85,
      fairness: 78,
      leadership: 82,
      workLife: 79,
    },
  },
  '2': {
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
      'Exciting opportunity to work with one of the largest investment management firms, focusing on private equity investments in Europe.',
    requirements: [
      'Bachelors degree in Finance or related field',
      'Experience in private equity or investment banking',
      'Strong financial modeling skills',
      'Fluent in English and French',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 78,
    benefits: [
      { icon: '🏥', label: 'Health Insurance' },
      { icon: '💰', label: 'Performance Bonus' },
      { icon: '🎓', label: 'Education Support' },
      { icon: '🏋️', label: 'Gym Membership' },
    ],
    companyInsights: {
      founded: 1875,
      size: '1000+',
      funding: 'Public',
      industry: 'Financial Services',
    },
    scores: {
      culture: 80,
      fairness: 75,
      leadership: 85,
      workLife: 72,
    },
  },
  '3': {
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
      'Join our growing consulting practice specializing in digital transformation and fintech strategy.',
    requirements: [
      'Experience in management consulting',
      'Strong project management skills',
      'Knowledge of digital transformation',
      'Client-facing experience',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 81,
    benefits: [
      { icon: '🏥', label: 'Health Insurance' },
      { icon: '✈️', label: 'Travel Benefits' },
      { icon: '📱', label: 'Home Office Setup' },
      { icon: '📚', label: 'Training Budget' },
    ],
    companyInsights: {
      founded: 2018,
      size: '51-200',
      funding: 'Series B',
      industry: 'Consulting',
    },
    scores: {
      culture: 83,
      fairness: 80,
      leadership: 79,
      workLife: 82,
    },
  },
};

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      const job = MOCK_JOBS[jobId];
      if (!job) throw new Error('Job not found');
      return job;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
}
