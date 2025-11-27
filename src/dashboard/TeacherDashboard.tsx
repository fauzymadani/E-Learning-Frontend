import { useEffect, useState } from "react";
import { BookOpen, Users, CheckCircle, FileText, TrendingUp, Clock } from "lucide-react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      description: `${data.stats.published_courses} published`,
      icon: BookOpen,
      trend: "+2 from last month",
    },
    {
      title: "Total Students",
      value: data.stats.total_students,
      description: "Across all courses",
      icon: Users,
      trend: "+12% from last month",
    },
    {
      title: "Published Courses",
      value: data.stats.published_courses,
      description: `${data.stats.total_courses - data.stats.published_courses} drafts`,
      icon: CheckCircle,
      trend: "Ready for students",
    },
    {
      title: "Total Lessons",
      value: data.stats.total_lessons,
      description: "Content created",
      icon: FileText,
      trend: `Avg ${Math.round(data.stats.total_lessons / (data.stats.total_courses || 1))} per course`,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of your teaching activity
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat, idx) => (
                <Card key={idx}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                    <div className="flex items-center pt-1">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-muted-foreground">
                        {stat.trend}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>
                    Your recent course activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.my_courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No courses yet</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {data.my_courses.slice(0, 3).map((course) => (
                        <div key={course.id} className="flex items-center">
                          <div className="relative h-16 w-24 rounded-md overflow-hidden bg-muted mr-4 flex-shrink-0">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='64'%3E%3Crect fill='%23e5e7eb' width='96' height='64'/%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium leading-none">
                                {course.title}
                              </p>
                              <Badge variant={course.is_published ? "default" : "secondary"} className="h-5">
                                {course.is_published ? "Published" : "Draft"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {course.total_lessons} lessons
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {course.total_students} students
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-medium">
                              {course.active_students}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Active
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Enrollments</CardTitle>
                  <CardDescription>
                    Latest student activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recent_enrollments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">
                        No recent enrollments
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {data.recent_enrollments.slice(0, 5).map((enrollment) => (
                        <div key={enrollment.id} className="flex items-start gap-4">
                          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium">
                              {enrollment.student_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {enrollment.student_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {enrollment.course_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(enrollment.enrolled_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                            {enrollment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Coming soon - Detailed course analytics</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Analytics dashboard under development</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>Manage your students across all courses</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recent_enrollments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No students enrolled yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recent_enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {enrollment.student_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{enrollment.student_name}</p>
                            <p className="text-xs text-muted-foreground">{enrollment.student_email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{enrollment.course_name}</p>
                          <Badge variant={enrollment.status === "active" ? "default" : "secondary"} className="mt-1">
                            {enrollment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}