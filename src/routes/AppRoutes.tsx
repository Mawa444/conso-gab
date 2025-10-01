// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProfileModeProvider } from '@/hooks/use-profile-mode';
import { RoleBasedRouter } from '@/components/auth/RoleBasedRouter';
import { PageWithSkeleton } from '@/components/layout/PageWithSkeleton';
import { AppSkeleton } from '@/components/ui/skeleton-screens';

// Lazy load des pages critiques
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const BusinessCreationPage = lazy(() => import('@/pages/business/BusinessCreationPage'));
const BusinessListPage = lazy(() => import('@/pages/business/BusinessListPage'));
const BusinessProfilePage = lazy(() => import('@/pages/business/BusinessProfilePage'));

// Routes business protégées
function BusinessRoutes() {
  return (
    <Routes>
      <Route
        path=":businessId/profile"
        element={
          <Suspense fallback={<PageWithSkeleton isLoading skeleton={<AppSkeleton />} />}>
            <BusinessProfilePage />
          </Suspense>
        }
      />
      {/* Ajoute d'autres routes business ici quand prêtes */}
      <Route path="*" element={<Navigate to="/entreprises" replace />} />
    </Routes>
  );
}

export function AppRoutes() {
  return (
    <AuthProvider>
      <ProfileModeProvider>
        <Suspense fallback={<PageWithSkeleton isLoading skeleton={<AppSkeleton />} />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <RoleBasedRouter>
                  <ProfilePage />
                </RoleBasedRouter>
              }
            />

            <Route
              path="/entreprises"
              element={
                <RoleBasedRouter>
                  <BusinessListPage />
                </RoleBasedRouter>
              }
            />

            <Route
              path="/business/create"
              element={
                <RoleBasedRouter>
                  <BusinessCreationPage />
                </RoleBasedRouter>
              }
            />

            {/* Nested business routes */}
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