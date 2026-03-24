import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NoteProvider } from './context/NoteContext';
import Loading from './components/Loading';

const MainLayout = lazy(() => import('./components/MainLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const DiscoverServers = lazy(() => import('./pages/DiscoverServers'));
const CreateServer = lazy(() => import('./pages/CreateServer'));
const ServerPage = lazy(() => import('./pages/ServerPage'));
const Archives = lazy(() => import('./pages/Archives'));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen={true} message="Establishing Secure Connection" />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
  return (
    <Suspense fallback={<Loading fullScreen={true} />}>
      <MainLayout>{children}</MainLayout>
    </Suspense>
  );
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 transition-colors duration-300">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#fff',
            border: '1px solid rgba(75, 85, 99, 0.4)',
            borderRadius: '12px',
          },
        }}
      />
      <Suspense fallback={<Loading fullScreen={true} />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/archives"
            element={
              <ProtectedRoute>
                <Archives />
              </ProtectedRoute>
            }
          />

          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <DiscoverServers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-server"
            element={
              <ProtectedRoute>
                <CreateServer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/servers/:id"
            element={
              <ProtectedRoute>
                <ServerPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NoteProvider>
          <AppContent />
        </NoteProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
