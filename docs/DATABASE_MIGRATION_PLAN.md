# Database Migration Plan

## Current to Future State Migration

### Phase 1: Core Tables (Immediate Implementation)

These tables maintain compatibility with current frontend while laying groundwork for multi-tenancy.

```sql
-- Core Community & Tenant Tables
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintains compatibility with current auth while adding community context
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Links users to communities (multi-tenant association)
CREATE TABLE community_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    community_id UUID REFERENCES communities(id),
    role VARCHAR(50) DEFAULT 'member',
    status VARCHAR(50) DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, community_id)
);

-- Enhanced company table compatible with current frontend
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    website VARCHAR(255),
    industry VARCHAR(100),
    size_range VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Multi-tenant company profiles
CREATE TABLE company_community_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    community_id UUID REFERENCES communities(id),
    status VARCHAR(50) DEFAULT 'active',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, community_id)
);

-- Enhanced jobs table maintaining current frontend compatibility
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(100),
    employment_type VARCHAR(50),
    experience_level VARCHAR(50),
    requirements JSONB DEFAULT '[]',
    benefits JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Multi-tenant job associations
CREATE TABLE job_community_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id),
    community_id UUID REFERENCES communities(id),
    status VARCHAR(50) DEFAULT 'active',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, community_id)
);
```

### Phase 2: Enhanced Features (Near-term Implementation)

These tables add essential features while maintaining backward compatibility.

```sql
-- User profiles with enhanced fields
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    skills JSONB DEFAULT '[]',
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Community customization settings
CREATE TABLE community_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id),
    branding JSONB DEFAULT '{
        "colors": {
            "primary": "#000000",
            "secondary": "#ffffff"
        },
        "logo_url": null
    }',
    features_enabled JSONB DEFAULT '{
        "jobs": true,
        "events": false,
        "mentorship": false
    }',
    custom_fields JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Integration settings (including RecruitCRM)
CREATE TABLE integration_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id),
    integration_type VARCHAR(50),
    credentials JSONB,
    settings JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Phase 3: Advanced Features (Future Implementation)

These tables set up advanced features without disrupting existing functionality.

```sql
-- Events system
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    location JSONB,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentorship programs
CREATE TABLE mentorship_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Migration Strategy

### 1. Data Migration Steps

1. **Initial Setup**

```sql
-- Create extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-generate-v4";

-- Create enum types for consistent status values
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'archived');
```

2. **Data Migration Functions**

```sql
-- Example migration function for existing job data
CREATE OR REPLACE FUNCTION migrate_existing_jobs()
RETURNS void AS $$
BEGIN
    -- Create default community if needed
    INSERT INTO communities (name, slug, description)
    VALUES ('Default Community', 'default', 'Default migration community')
    ON CONFLICT DO NOTHING;

    -- Associate existing jobs with default community
    INSERT INTO job_community_associations (job_id, community_id)
    SELECT j.id, c.id
    FROM jobs j
    CROSS JOIN communities c
    WHERE c.slug = 'default'
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
```

### 2. Indexes for Performance

```sql
-- Community-based indexes
CREATE INDEX idx_community_memberships_community_id ON community_memberships(community_id);
CREATE INDEX idx_community_memberships_user_id ON community_memberships(user_id);

-- Job search indexes
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_job_community_associations_community_id ON job_community_associations(community_id);

-- Full-text search for jobs
CREATE INDEX idx_jobs_fts ON jobs USING gin(
    to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(location, '')
    )
);
```

### 3. Views for Backward Compatibility

```sql
-- Compatible view for current job listing implementation
CREATE VIEW v_community_jobs AS
SELECT
    j.*,
    c.name as company_name,
    c.logo_url as company_logo,
    jca.community_id,
    jca.custom_fields as community_custom_fields
FROM jobs j
JOIN companies c ON j.company_id = c.id
JOIN job_community_associations jca ON j.id = jca.job_id
WHERE j.status = 'active' AND jca.status = 'active';

-- Compatible view for user profiles
CREATE VIEW v_community_members AS
SELECT
    u.id as user_id,
    u.email,
    up.first_name,
    up.last_name,
    cm.community_id,
    cm.role as community_role
FROM users u
JOIN community_memberships cm ON u.id = cm.user_id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.status = 'active' AND cm.status = 'active';
```

## Implementation Phases

### Phase 1 (Immediate)

1. Create core tables (communities, users, companies, jobs)
2. Migrate existing data
3. Update API endpoints to include community context
4. Maintain backward compatibility via views

### Phase 2 (1-2 Months)

1. Implement enhanced profile features
2. Add community customization
3. Integrate with RecruitCRM
4. Add basic analytics tracking

### Phase 3 (3-6 Months)

1. Roll out events system
2. Implement mentorship features
3. Add advanced analytics
4. Enable community-specific customizations

## Data Access Patterns

### Example Repository Methods

```typescript
interface JobRepository {
  // Current compatible method
  findJobs(filters: JobFilters): Promise<Job[]>;

  // New multi-tenant method
  findCommunityJobs(communityId: string, filters: JobFilters): Promise<Job[]>;
}

// Implementation maintaining both patterns
class PostgresJobRepository implements JobRepository {
  async findJobs(filters: JobFilters): Promise<Job[]> {
    return await this.findCommunityJobs('default', filters);
  }

  async findCommunityJobs(
    communityId: string,
    filters: JobFilters
  ): Promise<Job[]> {
    const query = `
            SELECT * FROM v_community_jobs
            WHERE community_id = $1
            AND ($2::text[] IS NULL OR title ILIKE ANY($2))
            AND ($3::text[] IS NULL OR location = ANY($3))
            ORDER BY created_at DESC
        `;

    return await this.db.query(query, [
      communityId,
      filters.keywords,
      filters.locations,
    ]);
  }
}
```

## Security Considerations

1. **Row-Level Security**

```sql
-- Enable RLS on job_community_associations
ALTER TABLE job_community_associations ENABLE ROW LEVEL SECURITY;

-- Create policy for community-based access
CREATE POLICY community_isolation_policy ON job_community_associations
    USING (community_id = current_setting('app.current_community_id')::uuid);
```

2. **Function-Based Access Control**

```sql
-- Function to switch community context
CREATE OR REPLACE FUNCTION set_community_context(community_id uuid)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_community_id', community_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Monitoring and Maintenance

1. **Performance Monitoring Views**

```sql
CREATE VIEW v_community_stats AS
SELECT
    community_id,
    COUNT(DISTINCT user_id) as total_members,
    COUNT(DISTINCT job_id) as total_jobs,
    MAX(created_at) as last_activity
FROM (
    SELECT community_id, user_id, NULL as job_id, created_at
    FROM community_memberships
    UNION ALL
    SELECT community_id, NULL as user_id, job_id, created_at
    FROM job_community_associations
) all_activity
GROUP BY community_id;
```

2. **Maintenance Functions**

```sql
-- Clean up inactive associations
CREATE OR REPLACE FUNCTION cleanup_inactive_associations()
RETURNS void AS $$
BEGIN
    UPDATE job_community_associations
    SET status = 'inactive'
    WHERE job_id IN (
        SELECT id FROM jobs WHERE status = 'closed'
    );
END;
$$ LANGUAGE plpgsql;
```
