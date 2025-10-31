import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import PageTrackingWrapper from "./components/PageTrackingWrapper";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";

// Lazy-loaded components
const Navbar = lazy(() => import("./components/Navbar"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const SavedJobs = lazy(() => import("./pages/SavedJobs"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ManageJobs = lazy(() => import("./pages/ManageJobs"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
          <BrowserRouter>
            <PageTrackingWrapper>
              {/* Navbar */}
              <Suspense
                fallback={
                  <div className="text-center py-6">Loading Navbar...</div>
                }
              >
                <Navbar />
              </Suspense>

              {/* Main content */}
              <div className="max-w-6xl mx-auto px-4 py-6">
                <Suspense
                  fallback={
                    <div className="text-center py-20 text-lg">
                      Loading page...
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/job/:id" element={<JobDetails />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/saved" element={<SavedJobs />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/manage-jobs"
                      element={
                        <AdminRoute>
                          <ManageJobs />
                        </AdminRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>

              {/* Toast Notifications */}
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </PageTrackingWrapper>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
