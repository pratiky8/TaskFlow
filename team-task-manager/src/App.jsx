import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';

// Lazy load components for better performance
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const Tasks = lazy(() => import('./pages/Tasks'));
const TaskDetails = lazy(() => import('./pages/TaskDetails'));
const Users = lazy(() => import('./pages/Users'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
    <div className="text-center">
      <Loader size="large" />
      <p className="mt-4 text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

// Modern SaaS Layout Component
const AppLayout = ({ children, adminOnly = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  return (
    <ProtectedRoute adminOnly={adminOnly}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            currentPath={location.pathname}
          />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="lg:hidden fixed inset-y-0 left-0 z-50">
              <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                currentPath={location.pathname}
              />
            </div>
          </>
        )}
        
        {/* Main Section */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar 
            onMenuClick={() => setSidebarOpen(true)} 
          />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Signup />
              </Suspense>
            } 
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/projects"
            element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <Projects />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/projects/new"
            element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <Projects />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <ProjectDetails />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/tasks"
            element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <Tasks />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <TaskDetails />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/users"
            element={
              <AppLayout adminOnly={true}>
                <Suspense fallback={<PageLoader />}>
                  <Users />
                </Suspense>
              </AppLayout>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
