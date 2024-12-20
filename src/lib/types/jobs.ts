export interface WorkingPhoto {
  url: string;
  caption: string;
  category?: 'collaboration' | 'culture' | 'office';
  size?: 'large' | 'medium' | 'small';
}

export interface CompanyInsights {
  founded: number;
  size: string;
  funding: string;
  industry: string;
  genderDiversity: {
    male: number;
    female: number;
  };
  description: string;
  teamPhoto?: {
    url: string;
    alt?: string;
  };
  locations: Array<{
    name: string;
    coordinates: [number, number];
  }>;
  employeeGrowth: {
    percentage: number;
    period: string;
  };
  awards: Array<{
    title: string;
    year: string;
  }>;
  transparency: {
    responseTime: string;
    growthRate: string;
    rating: number;
  };
}

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
  roleBenefits: string[];
  status: 'draft' | 'active' | 'closed';
  postedAt: string;
  communityId: string;
  isEarlyApplicant?: boolean;
  sisterScore?: number;
  benefits?: Array<{
    icon: string;
    label: string;
    description?: string;
  }>;
  companyInsights?: CompanyInsights;
  workingPhotos?: WorkingPhoto[];
}

export interface JobTestimonial {
  name: string;
  title: string;
  avatar: string;
  quote: string;
}

export type JobTestimonials = {
  [K in string]?: JobTestimonial[];
};
