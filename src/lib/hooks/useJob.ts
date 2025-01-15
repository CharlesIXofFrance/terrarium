import { useQuery } from '@tanstack/react-query';
import type { Job } from '../types/jobs';

const MOCK_JOBS: Record<string, Job> = {
  '1': {
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
      'Join our dynamic VC team focusing on AgriFood tech investments. Perfect for those passionate about sustainable agriculture and food innovation.',
    requirements: [
      'Degree in Finance, Business, or Economics',
      'Strong analytical and financial modeling skills',
      'Previous experience in venture capital or startup environment',
      'Passion for AgriFood technology',
    ],
    roleBenefits: [
      'Opportunity to work with leading AgriFood tech startups',
      'Exposure to global investment networks',
      'Career growth in venture capital',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 81,
    benefits: [
      {
        icon: '🏥',
        label: 'Health Insurance',
        description: 'Comprehensive health, dental, and vision coverage',
      },
      {
        icon: '🌴',
        label: 'Unlimited PTO',
        description: 'Flexible vacation policy with no set limit',
      },
      {
        icon: '💻',
        label: 'Remote Work Options',
        description: 'Hybrid work environment with flexible location',
      },
      {
        icon: '📚',
        label: 'Learning Budget',
        description: '$5000 annual budget for professional development',
      },
    ],
    companyInsights: {
      founded: 2015,
      size: '11-50',
      funding: 'Series A',
      industry: 'Venture Capital',
      genderDiversity: {
        male: 60,
        female: 40,
      },
      description:
        'Anterra Capital is a global venture capital firm focused on financing the growth of technology-driven companies transforming the food and agricultural sectors.',
      locations: [
        {
          name: 'London',
          coordinates: [51.5074, -0.1278],
        },
      ],
      employeeGrowth: {
        percentage: 50,
        period: '2022-2023',
      },
      awards: [
        {
          title: 'Best AgriFood Tech VC 2023',
        },
      ],
    },
    workingPhotos: [
      {
        url: 'https://example.com/photos/office1.jpg',
        caption: 'Our modern London office',
        category: 'office',
        size: 'large',
      },
      {
        url: 'https://example.com/photos/team1.jpg',
        caption: 'Team collaboration session',
        category: 'collaboration',
        size: 'medium',
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Investment Banking Associate',
    company: 'Morgan Stanley',
    companyLogo: 'https://example.com/logos/morgan-stanley.png',
    coverImage:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
    location: 'New York',
    type: 'Full-Time',
    salary: {
      min: 120000,
      max: 150000,
      currency: 'USD',
    },
    experience: '2-4 Years of Experience',
    description:
      'Join our Investment Banking Division focusing on Technology, Media & Telecommunications.',
    requirements: [
      'MBA or equivalent advanced degree',
      'Previous investment banking experience',
      'Strong financial modeling skills',
      'Excellent communication abilities',
    ],
    roleBenefits: [
      'Work on high-profile M&A deals',
      'Fast-track career progression',
      'Global exposure',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: false,
    sisterScore: 75,
    benefits: [
      {
        icon: '🏥',
        label: 'Health Insurance',
        description: 'Premium health coverage',
      },
      {
        icon: '💰',
        label: 'Annual Bonus',
        description: 'Performance-based bonus structure',
      },
      {
        icon: '🎓',
        label: 'Education Support',
        description: 'Tuition reimbursement program',
      },
    ],
    companyInsights: {
      founded: 1935,
      size: '10000+',
      funding: 'Public',
      industry: 'Investment Banking',
      genderDiversity: {
        male: 65,
        female: 35,
      },
      description:
        'Morgan Stanley is a leading global financial services firm providing investment banking, securities, wealth management and investment management services.',
      locations: [
        {
          name: 'New York',
          coordinates: [40.7128, -74.006],
        },
      ],
      employeeGrowth: {
        percentage: 15,
        period: '2022-2023',
      },
      awards: [
        {
          title: 'Best Investment Bank for Diversity 2023',
        },
      ],
    },
    workingPhotos: [
      {
        url: 'https://example.com/photos/ms-office.jpg',
        caption: 'NYC Headquarters',
        category: 'office',
        size: 'large',
      },
    ],
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
