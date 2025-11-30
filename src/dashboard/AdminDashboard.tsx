import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  UserCheck,
  UserPlus,
  Clock,
} from "lucide-react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Activity {
  id: number;
  type: string;
  description: string;
  user_name: string;
  created_at: string;
}

interface DashboardData {
  total_users: number;
  total_courses: number;
  total_enrollments: number;
  statistics: {
    users_by_role: {
      admin: number;
      student: number;
      teacher: number;
    };
    courses_by_status: {
      published: number;
      unpublished: number;
      total: number;
    };
    enrollments_by_status: {
      completed: number;
    };
    growth_stats: {
      new_users_this_month: number;
      new_courses_this_month: number;
      new_enrollments_this_month: number;
    };
  };
  recent_activities: Activity[];
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-muted-foreground font-medium">
              Loading dashboard...
            </span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "course_created":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "enrollment":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadgeVariant = (
    type: string
  ): "default" | "secondary" | "outline" => {
    switch (type) {
      case "user_registered":
        return "default";
      case "course_created":
        return "secondary";
      case "enrollment":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const statCards = [
    {
      title: "Total Users",
      value: data.total_users,
      description: `${data.statistics.growth_stats.new_users_this_month} new this month`,
      icon: Users,
      trend: `${data.statistics.users_by_role.student} students, ${data.statistics.users_by_role.teacher} teachers`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Students",
      value: data.statistics.users_by_role.student,
      description: `${Math.round(
        (data.statistics.users_by_role.student / data.total_users) * 100
      )}% of users`,
      icon: UserCheck,
      trend: "Active learners",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Teachers",
      value: data.statistics.users_by_role.teacher,
      description: `${Math.round(
        (data.statistics.users_by_role.teacher / data.total_users) * 100
      )}% of users`,
      icon: UserPlus,
      trend: "Content creators",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Courses",
      value: data.total_courses,
      description: `${data.statistics.courses_by_status.published} published`,
      icon: BookOpen,
      trend: `${data.statistics.growth_stats.new_courses_this_month} new this month`,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Enrollments",
      value: data.total_enrollments,
      description: `${
        data.statistics.enrollments_by_status.completed || 0
      } completed`,
      icon: TrendingUp,
      trend: `${data.statistics.growth_stats.new_enrollments_this_month} new this month`,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Admins",
      value: data.statistics.users_by_role.admin,
      description: "Platform administrators",
      icon: Activity,
      trend: "System management",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h2>
            <p className="text-muted-foreground">
              Platform overview and management
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {statCards.map((stat, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                    <div className="flex items-center pt-2">
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
                  <CardTitle>Growth Statistics</CardTitle>
                  <CardDescription>Monthly growth metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New Users</p>
                          <p className="text-xs text-muted-foreground">
                            This month
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-blue-500">
                        {data.statistics.growth_stats.new_users_this_month}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <BookOpen className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New Courses</p>
                          <p className="text-xs text-muted-foreground">
                            This month
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-green-500">
                        {data.statistics.growth_stats.new_courses_this_month}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New Enrollments</p>
                          <p className="text-xs text-muted-foreground">
                            This month
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-purple-500">
                        {
                          data.statistics.growth_stats
                            .new_enrollments_this_month
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recent_activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Activity className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">
                        No recent activities
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {data.recent_activities.slice(0, 6).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                by {activity.user_name}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                •
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {formatTimeAgo(activity.created_at)}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={getActivityBadgeVariant(activity.type)}
                            className="text-xs capitalize shrink-0"
                          >
                            {activity.type.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                  <CardDescription>Distribution of user roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Students</span>
                        <span className="text-sm text-muted-foreground">
                          {data.statistics.users_by_role.student} (
                          {Math.round(
                            (data.statistics.users_by_role.student /
                              data.total_users) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (data.statistics.users_by_role.student /
                                data.total_users) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Teachers</span>
                        <span className="text-sm text-muted-foreground">
                          {data.statistics.users_by_role.teacher} (
                          {Math.round(
                            (data.statistics.users_by_role.teacher /
                              data.total_users) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (data.statistics.users_by_role.teacher /
                                data.total_users) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Admins</span>
                        <span className="text-sm text-muted-foreground">
                          {data.statistics.users_by_role.admin} (
                          {Math.round(
                            (data.statistics.users_by_role.admin /
                              data.total_users) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (data.statistics.users_by_role.admin /
                                data.total_users) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Courses Status</CardTitle>
                  <CardDescription>
                    Distribution of course status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Published</span>
                        <span className="text-sm text-muted-foreground">
                          {data.statistics.courses_by_status.published} (
                          {data.total_courses > 0
                            ? Math.round(
                                (data.statistics.courses_by_status.published /
                                  data.total_courses) *
                                  100
                              )
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width:
                              data.total_courses > 0
                                ? `${
                                    (data.statistics.courses_by_status
                                      .published /
                                      data.total_courses) *
                                    100
                                  }%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Unpublished</span>
                        <span className="text-sm text-muted-foreground">
                          {data.statistics.courses_by_status.unpublished} (
                          {data.total_courses > 0
                            ? Math.round(
                                (data.statistics.courses_by_status.unpublished /
                                  data.total_courses) *
                                  100
                              )
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{
                            width:
                              data.total_courses > 0
                                ? `${
                                    (data.statistics.courses_by_status
                                      .unpublished /
                                      data.total_courses) *
                                    100
                                  }%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Total Courses
                        </span>
                        <span className="text-2xl font-bold">
                          {data.total_courses}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Statistics</CardTitle>
                <CardDescription>Platform engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Enrollments
                    </p>
                    <p className="text-3xl font-bold">
                      {data.total_enrollments}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Completed
                    </p>
                    <p className="text-3xl font-bold text-green-500">
                      {data.statistics.enrollments_by_status.completed || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Completion Rate
                    </p>
                    <p className="text-3xl font-bold text-blue-500">
                      {data.total_enrollments > 0
                        ? Math.round(
                            ((data.statistics.enrollments_by_status.completed ||
                              0) /
                              data.total_enrollments) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Activities</CardTitle>
                <CardDescription>Complete activity log</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recent_activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No activities found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.recent_activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="p-3 rounded-lg bg-secondary">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  by {activity.user_name}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={getActivityBadgeVariant(activity.type)}
                              className="capitalize shrink-0"
                            >
                              {activity.type.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(activity.created_at).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
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
