import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SavedJobs from "./pages/SavedJobs";
import AdminDashboard from "./pages/AdminDashboard";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import AdminRoute from "./components/AdminRoute";
import ManageJobs from "./pages/ManageJobs";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import PageTrackingWrapper from "./components/PageTrackingWrapper";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
          <BrowserRouter>
            <PageTrackingWrapper>
              <Navbar />
              <div className="max-w-6xl mx-auto px-4 py-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/job/:id" element={<JobDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/saved" element={<SavedJobs />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/admin/manage-jobs"
                    element={
                      <AdminRoute>
                        <ManageJobs />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </div>
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
