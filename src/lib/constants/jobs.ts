// Mock jobs data constants
export const JOB_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship'] as const;
export const JOB_STATUSES = ['draft', 'active', 'closed'] as const;
export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const;

// Benefits icons mapping
export const BENEFIT_ICONS = {
  health: 'Heart',
  remote: 'Globe',
  education: 'GraduationCap',
  bonus: 'DollarSign',
  parental: 'Baby',
  fitness: 'Dumbbell',
  food: 'Coffee',
  crypto: 'Bitcoin',
  travel: 'Plane',
} as const;

// Company size ranges
export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
  '5000+',
  '10000+',
] as const;

// Funding stages
export const FUNDING_STAGES = [
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'Private',
  'Public',
] as const;