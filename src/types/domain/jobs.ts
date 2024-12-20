export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  posted_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'draft';
  company_logo?: string;
  company_description?: string;
  apply_url?: string;
  skills?: string[];
  benefits?: string[];
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
