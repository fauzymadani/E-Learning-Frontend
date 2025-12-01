import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  Bell,
  Search,
} from "lucide-react";
import axios from "../api/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface DashboardData {
  recent_notifications: Notification[];
  stats: {
    total_enrolled: number;
    in_progress: number;
    courses_completed: number;
    total_lessons_completed: number;
  };
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await axios.get("/dashboard/student");
      setData({
        recent_notifications: res.data.recent_notifications || [],
        stats: {
          total_enrolled: res.data.stats.total_enrolled || 0,
          in_progress: res.data.stats.in_progress || 0,
          courses_completed: res.data.stats.courses_completed || 0,
          total_lessons_completed: res.data.stats.total_lessons_completed || 0,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
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
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: "Enrolled Courses",
      value: data.stats.total_enrolled,
      description: "Total courses enrolled",
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      title: "In Progress",
      value: data.stats.in_progress,
      description: "Active learning",
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Completed",
      value: data.stats.courses_completed,
      description: "Courses finished",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Lessons Completed",
      value: data.stats.total_lessons_completed,
      description: "Total lessons done",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "enrollment":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Student Dashboard
          </h2>
          <p className="text-muted-foreground">
            Welcome back! Track your learning progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/student/my-learning")}>
            <BookOpen className="mr-2 h-4 w-4" />
            My Courses
          </Button>
          <Button variant="outline" onClick={() => navigate("/student/browse")}>
            <Search className="mr-2 h-4 w-4" />
            Browse
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Notifications */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Navigate to different sections quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/student/my-learning")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              View My Enrolled Courses
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/student/browse")}
            >
              <Search className="mr-2 h-4 w-4" />
              Browse Available Courses
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="mr-2 h-4 w-4" />
              View All Notifications
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/settings")}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Latest updates and announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recent_notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recent_notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                      notification.is_read
                        ? "bg-background"
                        : "bg-muted/50 border-primary/20"
                    }`}
                  >
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {data.recent_notifications.length > 5 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/notifications")}
                  >
                    View All Notifications
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Welcome to Your Learning Journey!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You're doing great! Keep up the momentum and continue exploring new
            courses. Remember:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Consistency is key - try to learn something every day</li>
            <li>Complete lessons at your own pace</li>
            <li>Track your progress in the "My Learning" section</li>
            <li>Don't hesitate to review completed courses</li>
          </ul>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => navigate("/student/my-learning")}>
              Continue Learning
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/browse")}
            >
              Explore Courses
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary (if enrolled) */}
      {data.stats.total_enrolled > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Progress Summary</CardTitle>
            <CardDescription>
              Overview of your learning achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Course Completion</span>
                <span className="text-sm text-muted-foreground">
                  {data.stats.courses_completed} / {data.stats.total_enrolled}{" "}
                  courses
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${
                      data.stats.total_enrolled > 0
                        ? (data.stats.courses_completed /
                            data.stats.total_enrolled) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {data.stats.total_enrolled > 0
                  ? `${Math.round(
                      (data.stats.courses_completed /
                        data.stats.total_enrolled) *
                        100
                    )}% of your enrolled courses completed`
                  : "No courses enrolled yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
