import { useEffect, useState } from "react";
import axios from "../api/axios";

interface Course {
  id: number;
  title: string;
  thumbnail: string;
  is_published: boolean;
  total_lessons: number;
  total_students: number;
  active_students: number;
  completed_students: number;
  created_at: string;
}

interface Enrollment {
  id: number;
  student_name: string;
  student_email: string;
  course_name: string;
  enrolled_at: string;
  status: string;
}

interface Stats {
  total_courses: number;
  published_courses: number;
  total_students: number;
  total_lessons: number;
}

interface DashboardData {
  my_courses: Course[];
  total_students: number;
  recent_enrollments: Enrollment[];
  stats: Stats;
}

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await axios.get("/dashboard/teacher");
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#495057]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[#495057] font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-[#343a40] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-[#dee2e6] text-sm mt-1">Manage your courses and students</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow border border-[#dee2e6] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6c757d] text-sm font-medium">Total Courses</p>
                <p className="text-3xl font-bold text-[#212529] mt-2">{data.stats.total_courses}</p>
              </div>
              <div className="bg-[#e9ecef] p-3 rounded-lg">
                <svg className="w-8 h-8 text-[#495057]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-[#dee2e6] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6c757d] text-sm font-medium">Published</p>
                <p className="text-3xl font-bold text-[#212529] mt-2">{data.stats.published_courses}</p>
              </div>
              <div className="bg-[#e9ecef] p-3 rounded-lg">
                <svg className="w-8 h-8 text-[#495057]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-[#dee2e6] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6c757d] text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-[#212529] mt-2">{data.stats.total_students}</p>
              </div>
              <div className="bg-[#e9ecef] p-3 rounded-lg">
                <svg className="w-8 h-8 text-[#495057]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-[#dee2e6] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6c757d] text-sm font-medium">Total Lessons</p>
                <p className="text-3xl font-bold text-[#212529] mt-2">{data.stats.total_lessons}</p>
              </div>
              <div className="bg-[#e9ecef] p-3 rounded-lg">
                <svg className="w-8 h-8 text-[#495057]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Courses */}
          <div className="bg-white rounded-lg shadow border border-[#dee2e6]">
            <div className="px-6 py-4 border-b border-[#dee2e6]">
              <h2 className="text-lg font-bold text-[#212529]">My Courses</h2>
            </div>
            <div className="p-6 space-y-4">
              {data.my_courses.length === 0 ? (
                <p className="text-[#6c757d] text-center py-8">No courses yet</p>
              ) : (
                data.my_courses.map((course) => (
                  <div key={course.id} className="border border-[#dee2e6] rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-20 h-20 rounded-lg object-cover bg-[#e9ecef]"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e9ecef' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236c757d' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-[#212529]">{course.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded ${course.is_published ? 'bg-green-100 text-green-800' : 'bg-[#e9ecef] text-[#6c757d]'}`}>
                            {course.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                          <div>
                            <p className="text-[#6c757d]">Lessons</p>
                            <p className="font-medium text-[#212529]">{course.total_lessons}</p>
                          </div>
                          <div>
                            <p className="text-[#6c757d]">Students</p>
                            <p className="font-medium text-[#212529]">{course.total_students}</p>
                          </div>
                          <div>
                            <p className="text-[#6c757d]">Active</p>
                            <p className="font-medium text-[#212529]">{course.active_students}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Enrollments */}
          <div className="bg-white rounded-lg shadow border border-[#dee2e6]">
            <div className="px-6 py-4 border-b border-[#dee2e6]">
              <h2 className="text-lg font-bold text-[#212529]">Recent Enrollments</h2>
            </div>
            <div className="p-6">
              {data.recent_enrollments.length === 0 ? (
                <p className="text-[#6c757d] text-center py-8">No recent enrollments</p>
              ) : (
                <div className="space-y-4">
                  {data.recent_enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border border-[#dee2e6] rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[#212529]">{enrollment.student_name}</h3>
                          <p className="text-sm text-[#6c757d]">{enrollment.student_email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${enrollment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-[#e9ecef] text-[#6c757d]'}`}>
                          {enrollment.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#495057] font-medium">{enrollment.course_name}</p>
                      <p className="text-xs text-[#6c757d] mt-2">
                        Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}