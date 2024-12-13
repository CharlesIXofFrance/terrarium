import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CommunityLayout } from './components/community/CommunityLayout';
import { MemberLayout } from './components/member/MemberLayout';
import { Dashboard } from './pages/community/Dashboard';
import { Members } from './pages/community/Members';
import { Jobs } from './pages/community/Jobs';
import { Employers } from './pages/community/Employers';
import { JobBoardSettings } from './pages/community/JobBoardSettings';
import { BrandingSettings } from './pages/community/BrandingSettings';
import { CustomizationPortal } from './pages/community/CustomizationPortal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { MemberHub } from './pages/member/MemberHub';
import { JobBoard } from './pages/member/JobBoard';
import { JobDetails } from './pages/member/JobDetails';
import { Events } from './pages/member/Events';
import { Feed } from './pages/member/Feed';
import { MemberProfile } from './pages/member/MemberProfile';

export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />

          {/* Protected community admin routes */}
          <Route
            path="/c/:communitySlug"
            element={
              <ProtectedRoute>
                <CommunityLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="employers" element={<Employers />} />
            <Route path="settings/job-board" element={<JobBoardSettings />} />
            <Route path="settings/branding" element={<BrandingSettings />} />
            <Route path="customize" element={<CustomizationPortal />} />
          </Route>

          {/* Protected member routes */}
          <Route
            path="/m/:communitySlug"
            element={
              <ProtectedRoute>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MemberHub />} />
            <Route path="jobs" element={<JobBoard />} />
            <Route path="jobs/:jobId" element={<JobDetails />} />
            <Route path="events" element={<Events />} />
            <Route path="feed" element={<Feed />} />
            <Route path="profile" element={<MemberProfile />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;