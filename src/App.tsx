/**
 * App.tsx — Quill Land Lead Manager
 *
 * Routes:
 *   /today     → Today screen (default)
 *   /leads     → Lead cards / grid
 *   /calling   → Speed Dialer workspace
 *   /analytics → Market Analytics
 *   /settings  → Settings
 *
 * Error boundary uses SPA-compatible state recovery (no window.location.href).
 */

import React, { Suspense, lazy, Component, ErrorInfo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { UIProvider } from './context/UIContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';

// ─── Lazy page components ─────────────────────────────────────────────────────
const TodayView    = lazy(() => import('./components/TodayView').then((m) => ({ default: m.TodayView })));
const LeadsView    = lazy(() => import('./components/ClientsView').then((m) => ({ default: m.ClientsView })));
const CallingView  = lazy(() => import('./components/CallingView').then((m) => ({ default: m.CallingView })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const SettingsView  = lazy(() => import('./components/SettingsView').then((m) => ({ default: m.SettingsView })));

// ─── Lazy modals & drawers ────────────────────────────────────────────────────
const NewClientModal    = lazy(() => import('./components/NewClientModal').then((m) => ({ default: m.NewClientModal })));
const ImportCSVModal    = lazy(() => import('./components/ImportCSVModal').then((m) => ({ default: m.ImportCSVModal })));
const ClientDetailDrawer = lazy(() => import('./components/ClientDetailDrawer').then((m) => ({ default: m.ClientDetailDrawer })));
const CommandPalette    = lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })));

// ─── Loading fallback ─────────────────────────────────────────────────────────
const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3">
    <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-600 animate-spin" />
    <span className="text-xs font-medium text-slate-400">Loading…</span>
  </div>
);

// ─── Error boundary (SPA-safe, no window.location changes) ───────────────────
interface EBState { hasError: boolean; error: Error | null }
class ErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 gap-4 min-h-[400px] text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xl border border-rose-500/20">!</div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Something went wrong</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          {/* SPA-safe recovery — clears error state, React re-renders without page reload */}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Last Route Redirect ──────────────────────────────────────────────────────
const LastRouteRedirect: React.FC = () => {
  const lastRoute = localStorage.getItem('ql_last_route') || '/today';
  return <Navigate to={lastRoute} replace />;
};

// ─── App layout ───────────────────────────────────────────────────────────────
const AppLayout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname && location.pathname !== '/' && !['/dashboard', '/pipeline'].includes(location.pathname)) {
      localStorage.setItem('ql_last_route', location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-[#090D16] overflow-hidden text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right content pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/"          element={<LastRouteRedirect />} />
                <Route path="/today"     element={<TodayView />} />
                <Route path="/leads"     element={<LeadsView />} />
                <Route path="/calling"   element={<CallingView />} />
                <Route path="/analytics" element={<AnalyticsView />} />
                <Route path="/settings"  element={<SettingsView />} />
                {/* Legacy redirects so old bookmarks still work */}
                <Route path="/dashboard" element={<Navigate to="/today" replace />} />
                <Route path="/pipeline"  element={<Navigate to="/leads" replace />} />
                <Route path="*"          element={<LastRouteRedirect />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Global overlays */}
    <ErrorBoundary>
      <Suspense fallback={null}>
        <NewClientModal />
        <ImportCSVModal />
        <ClientDetailDrawer />
        <CommandPalette />
      </Suspense>
    </ErrorBoundary>
  </div>
);
};

export default function App() {
  return (
    <UIProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </WorkspaceProvider>
    </UIProvider>
  );
}
