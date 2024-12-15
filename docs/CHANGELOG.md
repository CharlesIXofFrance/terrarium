# Changelog

## [Unreleased]

### Added
- Email verification flow with improved user feedback
- Secure authentication callback handling
- Detailed logging for authentication processes
- Direct profile creation during registration
- Better error handling in authentication flows
- Mobile-optimized job board layout with responsive filters
- Back to top and load more buttons for mobile
- Comprehensive filter system with categories and benefits
- Interactive filter pills for selected filters
- Responsive job details page with optimized layout
- Related jobs carousel with dynamic data
- Career consultation section with reduced height
- Custom map marker for company locations
- Lazy loading for images in job details page

### Changed
- Updated user registration process with email confirmation
- Improved state management using Jotai atoms
- Enhanced authentication callback page with loading states
- Optimized profile creation and user onboarding flow
- Converted "Apply Now" button to "Save Job" in job cards
- Removed save icon from job card header
- Updated filter sidebar with improved layout and spacing
- Optimized benefits section layout for better readability
- Reduced map size in company insights
- Improved mobile responsiveness across all components
- Updated navigation patterns for better mobile experience
- Enhanced working at company photo gallery layout

### Fixed
- Email verification redirection issues
- User state management in authentication
- Profile creation timing issues
- Registration error handling and feedback
- Authentication callback token handling
- Filter sidebar alignment and spacing issues
- Map marker icon display in company insights
- Related jobs navigation and scroll behavior
- Mobile layout issues in job details page
- Filter pills overflow handling
- Career consultation section responsiveness
- Working at company photo gallery grid layout

### Technical
- Implemented efficient data loading patterns
- Enhanced error handling across components
- Improved type safety with TypeScript
- Added proper ARIA attributes for accessibility
- Optimized image loading with lazy loading
- Enhanced mobile performance optimizations
- Improved Jotai atom usage for global state
- Added comprehensive auth flow logging
- Enhanced Supabase integration for auth