import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "./lib/auth";
import AppLayout from "./components/layout/AppLayout";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Lazy-loaded pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const WorkoutSchedulePage = lazy(() => import("./pages/WorkoutSchedulePage"));
const EnterDungeonPage = lazy(() => import("./pages/EnterDungeonPage"));
const DailyQuestPage = lazy(() => import("./pages/DailyQuestPage"));
const ExitDungeonPage = lazy(() => import("./pages/ExitDungeonPage"));
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

import "./styles.css";
import { queryClient } from "./lib/queryClient";

// 1. Synchronously hydrate cache from localStorage ONLY for the active authenticated user
try {
  const userRaw = localStorage.getItem("sl-user");
  const activeUser = userRaw ? JSON.parse(userRaw) : null;
  const activeUserId = activeUser?.id;

  if (activeUserId) {
    const prefix = `sl-cache-${activeUserId}-`;
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith(prefix)) {
        const queryKey = JSON.parse(storageKey.slice(prefix.length));
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          queryClient.setQueryData(queryKey, JSON.parse(raw));
        }
      }
    }
  }
} catch (e) {}

// 2. Automatically persist any successful query scoped to the active user ID
queryClient.getQueryCache().subscribe((event) => {
  if (event?.type === "updated" && event.action?.type === "success") {
    try {
      const userRaw = localStorage.getItem("sl-user");
      const activeUser = userRaw ? JSON.parse(userRaw) : null;
      if (activeUser?.id) {
        const keyStr = JSON.stringify(event.query.queryKey);
        localStorage.setItem(`sl-cache-${activeUser.id}-${keyStr}`, JSON.stringify(event.query.state.data));
      }
    } catch (e) {}
  }
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AnonymousOnlyRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return !token ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Guest Routes */}
          <Route
            path="/login"
            element={
              <AnonymousOnlyRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <LoginPage />
                </Suspense>
              </AnonymousOnlyRoute>
            }
          />

          {/* Authenticated Application Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense>} />
            <Route path="schedule" element={<Suspense fallback={<LoadingSpinner />}><WorkoutSchedulePage /></Suspense>} />
            <Route path="daily-quest" element={<Suspense fallback={<LoadingSpinner />}><DailyQuestPage /></Suspense>} />
            <Route path="enter-dungeon" element={<Suspense fallback={<LoadingSpinner />}><EnterDungeonPage /></Suspense>} />
            <Route path="exit-dungeon" element={<Suspense fallback={<LoadingSpinner />}><ExitDungeonPage /></Suspense>} />
            <Route path="statistics" element={<Suspense fallback={<LoadingSpinner />}><StatisticsPage /></Suspense>} />
            <Route path="achievements" element={<Suspense fallback={<LoadingSpinner />}><AchievementsPage /></Suspense>} />
            <Route path="history" element={<Suspense fallback={<LoadingSpinner />}><HistoryPage /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<LoadingSpinner />}><SettingsPage /></Suspense>} />
            {/* Fallbacks for removed non-gym routes */}
            <Route path="focus-session" element={<Navigate to="/schedule" replace />} />
            <Route path="adventure-journal" element={<Navigate to="/daily-quest" replace />} />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Register PWA Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
