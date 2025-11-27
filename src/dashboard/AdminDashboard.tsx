import { useEffect, useState } from "react";
import { Users, BookOpen, TrendingUp, Activity, UserCheck, UserPlus } from "lucide-react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

interface Course {
  id: number;
  title: string;
  teacher_name: string;
  total_students: number;
  is_published: boolean;
  created_at: string;
}

interface DashboardData {
  stats: {
    total_users: number;
    total_students: number;
    total_teachers: number;
    total_courses: number;
    published_courses: number;
    total_enrollments: number;
  };
  recent_users: User[];
  recent_courses: Course[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await axios.get("/dashboard/admin");
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
      title: "Total Users",
      value: data.stats.total_users,
      description: "Platform users",
      icon: Users,
      trend: "+12% from last month",
      color: "text-blue-500",
    },
    {
      title: "Students",
      value: data.stats.total_students,
      description: `${Math.round((data.stats.total_students / data.stats.total_users) * 100)}% of users`,
      icon: UserCheck,
      trend: "Active learners",
      color: "text-green-500",
    },
    {
      title: "Teachers",
      value: data.stats.total_teachers,
      description: `${Math.round((data.stats.total_teachers / data.stats.total_users) * 100)}% of users`,
      icon: UserPlus,
      trend: "Content creators",
      color: "text-purple-500",
    },
    {
      title: "Total Courses",
      value: data.stats.total_courses,
      description: `${data.stats.published_courses} published`,
      icon: BookOpen,
      trend: "+5 this week",
      color: "text-orange-500",
    },
    {
      title: "Enrollments",
      value: data.stats.total_enrollments,
      description: "Total registrations",
      icon: TrendingUp,
      trend: "+18% from last month",
      color: "text-cyan-500",
    },
    {
      title: "Platform Activity",
      value: "98.5%",
      description: "System uptime",
      icon: Activity,
      trend: "Healthy status",
      color: "text-emerald-500",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
            <p className="text-muted-foreground">
              Platform overview and management
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {statCards.map((stat, idx) => (
                <Card key={idx}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                    <div className="flex items-center pt-1">
                      <TrendingUp className={`h-3 w-3 mr-1 ${stat.color}`} />
                      <span className="text-xs text-muted-foreground">
                        {stat.trend}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>
                    Latest user registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recent_users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">No recent users</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.recent_users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                            {user.is_active && (
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Courses</CardTitle>
                  <CardDescription>
                    Latest course additions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recent_courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">No recent courses</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.recent_courses.slice(0, 5).map((course) => (
                        <div key={course.id} className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none line-clamp-1">
                              {course.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {course.teacher_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{course.total_students} students</span>
                            </div>
                          </div>
                          <Badge variant={course.is_published ? "default" : "secondary"}>
                            {course.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recent_users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recent_users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(user.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Courses</CardTitle>
                <CardDescription>Manage platform courses</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recent_courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No courses found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recent_courses.map((course) => (
                      <div key={course.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Teacher: {course.teacher_name}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{course.total_students} students</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(course.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={course.is_published ? "default" : "secondary"}>
                          {course.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Detailed insights and reports</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Advanced analytics coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}