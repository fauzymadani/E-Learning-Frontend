import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Login from "../pages/Login";
import StudentDashboard from "../dashboard/StudentDashboard";
import TeacherDashboard from "../dashboard/TeacherDashboard";
import AdminDashboard from "../dashboard/AdminDashboard";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#495057]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[#495057] font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root based on auth status */}
        <Route 
          path="/" 
          element={
            user ? (
              user.role === "student" ? <Navigate to="/student" replace /> :
              user.role === "teacher" ? <Navigate to="/teacher" replace /> :
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Login - redirect if already logged in */}
        <Route 
          path="/login" 
          element={user ? (
            user.role === "student" ? <Navigate to="/student" replace /> :
            user.role === "teacher" ? <Navigate to="/teacher" replace /> :
            <Navigate to="/admin" replace />
          ) : <Login />} 
        />

        {/* Protected Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}