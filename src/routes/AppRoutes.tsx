// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProfileModeProvider } from '@/hooks/use-profile-mode';
import { RoleBasedRouter } from '@/components/auth/RoleBasedRouter';
import { ProfilePageSkeleton } from '@/components/ui/skeleton-screens';

// Lazy load des pages critiques  
const HomePage = lazy(() => import('@/pages/HomePage'));
const AuthFlowPage = lazy(() => import('@/pages/AuthFlowPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const BusinessCreationPage = lazy(() => import('@/pages/BusinessCreationPage'));
const EntreprisesPage = lazy(() => import('@/pages/EntreprisesPage'));
const BusinessProfilePage = lazy(() => import('@/pages/BusinessProfilePage'));
const BusinessDashboardPage = lazy(() => import('@/pages/BusinessDashboardPage'));
const BusinessSettingsPage = lazy(() => import('@/pages/BusinessSettingsPage'));

// Routes business protégées
function BusinessRoutes() {
  return (
    <Routes>
      <Route
        path=":businessId/profile"
        element={
          <Suspense fallback={<ProfilePageSkeleton />}>
            <BusinessProfilePage />
          </Suspense>
        }
      />
      <Route
        path=":businessId/dashboard"
        element={
          <Suspense fallback={<ProfilePageSkeleton />}>
            <BusinessDashboardPage />
          </Suspense>
        }
      />
      <Route
        path=":businessId/settings"
        element={
          <Suspense fallback={<ProfilePageSkeleton />}>
            <BusinessSettingsPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/entreprises" replace />} />
    </Routes>
  );
}

function ConsumerRoutes() {
  return (
    <Routes>
      <Route path="home" element={<HomePage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/consumer/home" replace />} />
    </Routes>
  );
}

function EntreprisesRoutes() {
  return (
    <Routes>
      <Route index element={<EntreprisesPage />} />
      <Route path="create" element={<BusinessCreationPage />} />
      <Route path="*" element={<Navigate to="/entreprises" replace />} />
    </Routes>
  );
}

export function AppRoutes() {
  return (
    <AuthProvider>
      <ProfileModeProvider>
        <Suspense fallback={<ProfilePageSkeleton />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthFlowPage />} />
            
            {/* Protected consumer routes */}
            <Route 
              path="/consumer/*" 
              element={
                <RoleBasedRouter>
                  <ConsumerRoutes />
                </RoleBasedRouter>
              } 
            />
            
            {/* Protected business routes */}
            <Route 
              path="/entreprises/*" 
              element={
                <RoleBasedRouter>
                  <EntreprisesRoutes />
                </RoleBasedRouter>
              } 
            />
            <Route 
              path="/business/*" 
              element={
                <RoleBasedRouter>
                  <BusinessRoutes />
                </RoleBasedRouter>
              } 
            />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ProfileModeProvider>
    </AuthProvider>
  );
}
