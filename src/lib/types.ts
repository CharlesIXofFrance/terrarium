export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  coverImage?: string;
  location: string;
  type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  experience?: string;
  description: string;
  requirements: string[];
  status: 'draft' | 'active' | 'closed';
  postedAt: string;
  communityId: string;
  isEarlyApplicant?: boolean;
  sisterScore?: number;
  source?: 'recruitcrm' | 'local';
  benefits?: Array<{
    icon: string;
    label: string;
  }>;
  companyInsights?: {
    founded: number;
    size: string;
    funding: string;
    industry: string;
  };
  scores?: {
    culture: number;
    fairness: number;
    leadership: number;
    workLife: number;
  };
}