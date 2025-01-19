# Member Sign-Up and Onboarding Flow Implementation Plan

## Overview

This document outlines the implementation plan for the community member sign-up and onboarding flow in Terrarium. The plan integrates with our existing tech stack and follows our AI-first approach.

## File Structure and Naming Convention

```
src/
└── components/
    └── features/
        ├── auth/
        │   ├── community/
        │   │   ├── CommunityMemberSignUpForm.tsx
        │   │   ├── CommunityMemberEmailVerification.tsx
        │   │   └── CommunityMemberCustomFields.tsx
        │   └── platform/
        │       └── ... (existing platform auth)
        ├── onboarding/
        │   └── community-member/
        │       ├── CommunityMemberOnboarding.tsx
        │       ├── CommunityMemberWelcomeStep.tsx
        │       ├── CommunityMemberIdentityStep.tsx
        │       └── CommunityMemberProfileStep.tsx
        └── member-hub/
            └── ... (existing member hub components)
```

## AI Context Headers

All new components will include AI context headers following our standard format:

```typescript
/**
 * AI Context: Community Member Experience
 * User Types: MEMBER
 *
 * [Component Description]
 *
 * Location: /src/components/features/[path]
 * - [Context Point 1]
 * - [Context Point 2]
 *
 * Responsibilities:
 * - [Responsibility 1]
 * - [Responsibility 2]
 *
 * Design Constraints:
 * - [Constraint 1]
 * - [Constraint 2]
 */
```

## Database Schema Extensions

```sql
-- Extend existing profiles table with onboarding status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
    community_onboarding_status jsonb DEFAULT '{
        "welcome_completed": false,
        "identity_pact_completed": false,
        "profile_completed": false,
        "rewards_claimed": false
    }'::jsonb;

-- Create community_member_config table for customization
CREATE TABLE IF NOT EXISTS public.community_member_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
    welcome_video_url text,
    identity_pact_template text,
    custom_fields jsonb DEFAULT '[]'::jsonb,
    requires_approval boolean DEFAULT false,
    rewards_config jsonb DEFAULT '{
        "welcome_meme": null,
        "completion_animation": "confetti"
    }'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create community_member_applications table
CREATE TABLE IF NOT EXISTS public.community_member_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'pending',
    custom_fields jsonb DEFAULT '{}'::jsonb,
    identity_pact_response text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(community_id, profile_id)
);
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

1. **Database Setup**

   ```typescript
   // src/lib/types/community-member.ts
   export interface CommunityMemberConfig {
     welcomeVideoUrl?: string;
     identityPactTemplate?: string;
     customFields: CustomField[];
     requiresApproval: boolean;
     rewardsConfig: {
       welcomeMeme?: string;
       completionAnimation: 'confetti' | 'fireworks' | 'none';
     };
   }
   ```

2. **Base Components**
   ```typescript
   // src/components/features/auth/community/CommunityMemberSignUpForm.tsx
   /**
    * AI Context: Community Member Authentication
    * User Types: MEMBER
    *
    * Sign-up form specifically for community members.
    * Handles email verification and custom field collection.
    */
   export function CommunityMemberSignUpForm() {
     // Implementation
   }
   ```

### Phase 2: Sign-Up Flow (Week 2)

1. **Community Member Sign-Up**

   ```typescript
   // src/lib/hooks/useCommunityMemberSignUp.ts
   export const useCommunityMemberSignUp = (communityId: string) => {
     return useMutation({
       mutationFn: (data: CommunityMemberSignUpData) =>
         signUpCommunityMember(communityId, data),
     });
   };
   ```

2. **Form Validation**
   ```typescript
   // src/lib/schemas/community-member.ts
   export const communityMemberSignUpSchema = z.object({
     email: z.string().email(),
     name: z.string().min(2),
     // ... other fields
   });
   ```

### Phase 3: Onboarding Flow (Week 3)

1. **Onboarding Steps**

   ```typescript
   // src/components/features/onboarding/community-member/CommunityMemberOnboarding.tsx
   /**
    * AI Context: Community Member Experience
    * User Types: MEMBER
    *
    * Multi-step onboarding flow for new community members.
    */
   export function CommunityMemberOnboarding() {
     // Implementation
   }
   ```

2. **State Management**
   ```typescript
   // src/stores/community-member.ts
   export const communityMemberOnboardingAtom = atom({
     key: 'communityMemberOnboarding',
     default: {
       currentStep: 0,
       steps: ['welcome', 'identity', 'profile'],
       completed: {},
     },
   });
   ```

### Phase 4: Admin Features (Week 4)

1. **Application Management**
   ```typescript
   // src/components/features/admin/community/CommunityMemberApplications.tsx
   /**
    * AI Context: Community Administration
    * User Types: COMMUNITY_OWNER
    *
    * Manage incoming member applications with approval workflow.
    */
   export function CommunityMemberApplications() {
     // Implementation
   }
   ```

## Testing Strategy

1. **Unit Tests**
   ```typescript
   // src/components/features/auth/community/__tests__/CommunityMemberSignUpForm.test.tsx
   describe('CommunityMemberSignUpForm', () => {
     it('validates community-specific fields', () => {
       // Test implementation
     });
   });
   ```

## Security Considerations

1. **Rate Limiting**
   ```typescript
   // src/lib/api/rate-limits.ts
   export const communityMemberSignUpLimits = {
     maxAttempts: 5,
     windowMs: 60 * 60 * 1000, // 1 hour
   };
   ```

## Monitoring and Analytics

1. **Key Metrics**
   ```typescript
   // src/lib/analytics/community-member.ts
   export const trackCommunityMemberSignUp = ({
     communityId,
     source,
     customFields,
   }: TrackingData) => {
     // Implementation
   };
   ```

## Launch Checklist

- [ ] Database migrations tested
- [ ] AI context headers added to all new components
- [ ] Component naming follows conventions
- [ ] RLS policies verified
- [ ] Rate limiting configured
- [ ] Email templates created
- [ ] Analytics implemented
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Accessibility verified

## Questions and Dependencies

1. **Open Questions**

   - Maximum number of custom fields per community?
   - File size limits for welcome videos?
   - Retention policy for rejected applications?

2. **Dependencies**
   - Supabase storage for video uploads
   - Email service for notifications
   - Analytics integration
