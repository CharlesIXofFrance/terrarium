# API Documentation

## Job Endpoints

### Get Job Details

```typescript
GET /api/jobs/:id

Response:
{
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
```

### List Jobs

```typescript
GET /api/jobs

Query Parameters:
- page: number
- limit: number
- search: string
- type: string[]
- location: string[]
- salary_min: number
- salary_max: number

Response:
{
  data: Job[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
```

### Apply to Job

```typescript
POST /api/jobs/:id/apply

Request Body:
{
  resume: File;
  coverLetter?: string;
  additionalInfo?: Record<string, any>;
}

Response:
{
  success: boolean;
  applicationId: string;
  status: 'pending' | 'submitted' | 'error';
}
```

### Save Job

```typescript
POST /api/jobs/:id/save

Response:
{
  success: boolean;
  saved: boolean;
}
```

## Error Responses

```typescript
{
  error: string;
  code: string;
  details?: Record<string, any>;
}
```

## Rate Limits

- 100 requests per minute for job listings
- 50 requests per minute for job applications
- 200 requests per minute for job searches
