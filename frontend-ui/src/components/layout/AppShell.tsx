import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { Background3D } from '@/components/effects/Background3D';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function FallbackBackground() {
  return null; // Silently fail if 3D doesn't work
}

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* 3D Background Layer with Error Handling */}
      <ErrorBoundary FallbackComponent={FallbackBackground}>
        <Suspense fallback={null}>
          <Background3D />
        </Suspense>
      </ErrorBoundary>
      
      {/* Additional Visual Effects */}
      <ParticleBackground />
      
      {/* Main Content - Higher z-index */}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
