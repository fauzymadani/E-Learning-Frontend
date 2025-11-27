import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-muted-foreground font-medium">Loading dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">{error}</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: "Total Courses",
      value: data.stats.total_courses,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "Published",
      value: data.stats.published_courses,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Total Students",
      value: data.stats.total_students,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Total Lessons",
      value: data.stats.total_lessons,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your courses and students</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map((stat, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className="text-muted-foreground">{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* My Courses */}
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                {data.my_courses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No courses yet</p>
                ) : (
                  <div className="space-y-4">
                    {data.my_courses.map((course) => (
                      <div key={course.id}>
                        <div className="flex items-start gap-4">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-20 h-20 rounded-md object-cover bg-muted"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e5e7eb' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold leading-none">{course.title}</h3>
                              <Badge variant={course.is_published ? "default" : "secondary"}>
                                {course.is_published ? "Published" : "Draft"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 pt-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Lessons</p>
                                <p className="text-sm font-medium">{course.total_lessons}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Students</p>
                                <p className="text-sm font-medium">{course.total_students}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Active</p>
                                <p className="text-sm font-medium">{course.active_students}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {course.id !== data.my_courses[data.my_courses.length - 1].id && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recent_enrollments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No recent enrollments</p>
                ) : (
                  <div className="space-y-4">
                    {data.recent_enrollments.map((enrollment) => (
                      <div key={enrollment.id}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="space-y-1">
                            <h3 className="font-semibold leading-none">{enrollment.student_name}</h3>
                            <p className="text-sm text-muted-foreground">{enrollment.student_email}</p>
                          </div>
                          <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                            {enrollment.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{enrollment.course_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(enrollment.enrolled_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {enrollment.id !== data.recent_enrollments[data.recent_enrollments.length - 1].id && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}