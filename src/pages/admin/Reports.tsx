import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Download,
  Calendar,
} from "lucide-react";
import axios from "../../api/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OverviewStats {
  total_users: number;
  total_courses: number;
  total_enrollments: number;
  total_lessons: number;
  active_students: number;
  active_teachers: number;
  published_courses: number;
  enrollments_this_month: number;
  new_users_this_month: number;
}

interface EnrollmentTrend {
  date: string;
  count: number;
}

interface TopCourse {
  course_id: number;
  course_title: string;
  enrollments: number;
}

interface EnrollmentReport {
  enrollment_trends: EnrollmentTrend[];
  top_courses: TopCourse[];
}

interface UserGrowth {
  date: string;
  count: number;
}

interface RoleDistribution {
  role: string;
  count: number;
}

interface ActiveUser {
  user_id: number;
  username: string;
  email: string;
  enrollments: number;
}

interface UserReport {
  user_growth: UserGrowth[];
  role_distribution: RoleDistribution[];
  most_active_users: ActiveUser[];
}

interface CourseCompletion {
  course_id: number;
  course_title: string;
  total_students: number;
  completed_count: number;
  completion_rate: number;
}

interface CategoryStat {
  category_id: number | null;
  category_name: string;
  course_count: number;
}

interface CourseReport {
  course_completions: CourseCompletion[];
  category_stats: CategoryStat[];
}

// API Functions
async function fetchOverview(): Promise<OverviewStats> {
  const { data } = await axios.get("/admin/reports/overview");
  return data;
}

async function fetchEnrollmentReport(days: number): Promise<EnrollmentReport> {
  const { data } = await axios.get(`/admin/reports/enrollments?days=${days}`);
  return data;
}

async function fetchUserReport(days: number): Promise<UserReport> {
  const { data } = await axios.get(`/admin/reports/users?days=${days}`);
  return data;
}

async function fetchCourseReport(limit: number): Promise<CourseReport> {
  const { data } = await axios.get(`/admin/reports/courses?limit=${limit}`);
  return data;
}

export default function Reports() {
  const [enrollmentDays, setEnrollmentDays] = useState(7);
  const [userDays, setUserDays] = useState(30);
  const [courseLimit, setCourseLimit] = useState(10);

  // Fetch all reports
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin", "reports", "overview"],
    queryFn: fetchOverview,
  });

  const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["admin", "reports", "enrollments", enrollmentDays],
    queryFn: () => fetchEnrollmentReport(enrollmentDays),
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["admin", "reports", "users", userDays],
    queryFn: () => fetchUserReport(userDays),
  });

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ["admin", "reports", "courses", courseLimit],
    queryFn: () => fetchCourseReport(courseLimit),
  });

  function handleExportReport() {
    // Create CSV export
    const csvData = [
      ["Metric", "Value"],
      ["Total Users", overview?.total_users || 0],
      ["Total Courses", overview?.total_courses || 0],
      ["Total Enrollments", overview?.total_enrollments || 0],
      ["Active Students", overview?.active_students || 0],
      ["Active Teachers", overview?.active_teachers || 0],
      ["Published Courses", overview?.published_courses || 0],
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  if (overviewLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-muted-foreground font-medium">
            Loading reports...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            Platform insights and performance metrics
          </p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{overview?.new_users_this_month || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_courses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview?.published_courses || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_enrollments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{overview?.enrollments_this_month || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_lessons || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active content library
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Select
              value={enrollmentDays.toString()}
              onValueChange={(v: string) => setEnrollmentDays(parseInt(v))}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Enrollment Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>
                  Daily enrollments (Last {enrollmentDays} days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrollmentLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enrollmentData?.enrollment_trends?.map(
                      (trend: EnrollmentTrend) => (
                        <div
                          key={trend.date}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-muted-foreground">
                            {new Date(trend.date).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 bg-primary rounded-full"
                              style={{
                                width: `${Math.max(trend.count * 10, 4)}px`,
                              }}
                            />
                            <span className="text-sm font-medium">
                              {trend.count}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Top Enrolled Courses</CardTitle>
                <CardDescription>Most popular courses</CardDescription>
              </CardHeader>
              <CardContent>
                {enrollmentLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollmentData?.top_courses
                      ?.slice(0, 5)
                      .map((course: TopCourse, idx: number) => (
                        <div
                          key={course.course_id}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {course.course_title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {course.enrollments} students
                            </p>
                          </div>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Select
              value={userDays.toString()}
              onValueChange={(v: string) => setUserDays(parseInt(v))}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>By role</CardDescription>
              </CardHeader>
              <CardContent>
                {userLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userData?.role_distribution?.map(
                      (role: RoleDistribution) => (
                        <div key={role.role} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">
                              {role.role}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {role.count}
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${
                                  (role.count / (overview?.total_users || 1)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Most Active Users */}
            <Card>
              <CardHeader>
                <CardTitle>Most Active Students</CardTitle>
                <CardDescription>By enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                {userLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userData?.most_active_users
                      ?.slice(0, 5)
                      .map((user: ActiveUser, idx: number) => (
                        <div
                          key={user.user_id}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.username}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                          <span className="text-sm font-medium">
                            {user.enrollments}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Select
              value={courseLimit.toString()}
              onValueChange={(v: string) => setCourseLimit(parseInt(v))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Completion Rates</CardTitle>
              <CardDescription>Top courses by completion</CardDescription>
            </CardHeader>
            <CardContent>
              {courseLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {courseData?.course_completions?.map(
                    (course: CourseCompletion) => (
                      <div key={course.course_id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate flex-1">
                            {course.course_title}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {course.completed_count}/{course.total_students} (
                            {course.completion_rate.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              course.completion_rate >= 70
                                ? "bg-green-500"
                                : course.completion_rate >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${course.completion_rate}%` }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
