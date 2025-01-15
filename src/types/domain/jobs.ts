export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  postedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'draft';
  companyLogo?: string;
  coverImage?: string;
  companyDescription?: string;
  applyUrl?: string;
  skills?: string[];
  benefits?: string[];
  isEarlyApplicant?: boolean;
  sisterScore?: number;
  experience?: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  submitted_at: string;
  resume_url?: string;
  cover_letter?: string;
}

export interface JobFilters {
  type?: string[];
  location?: string[];
  skills?: string[];
  salary_range?: {
    min: number;
    max: number;
  };
}
