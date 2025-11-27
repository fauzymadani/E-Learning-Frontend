import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  PlayCircle,
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: number;
  title: string;
  thumbnail: string;
  category: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  last_accessed: string;
  status: string;
}

interface DashboardData {
  enrolled_courses: Course[];
  stats: {
    total_enrolled: number;
    in_progress: number;
    completed: number;
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

      const enrolled = res.data.enrolled_courses;
      const progressList = res.data.learning_progress;

      const mergedCourses = enrolled.map((c: any) => {
        const progress = progressList.find((p: any) => p.course_id === c.id);

        const progressPercent = progress?.progress_percent || 0;
        // Check both enrollment status and progress percentage
        const enrollmentStatus = c.status || "";
        const isCompleted =
          enrollmentStatus === "completed" || progressPercent === 100;

        return {
          id: c.id,
          title: c.title,
          thumbnail: c.thumbnail,
          category: c.teacher_name || "General",
          progress: progressPercent,
          total_lessons: progress?.total_lessons ?? c.total_lessons,
          completed_lessons: progress?.completed_lessons ?? c.completed_lessons,
          last_accessed: progress?.last_accessed_at,
          status: isCompleted
            ? "completed"
            : progressPercent === 0
            ? "not_started"
            : "in_progress",
        };
      });

      setData({
        enrolled_courses: mergedCourses,
        stats: {
          total_enrolled: res.data.stats.total_enrolled,
          in_progress: res.data.stats.in_progress,
          completed: res.data.stats.courses_completed,
          total_lessons_completed: res.data.stats.total_lessons_completed,
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
      description: "Total courses",
      icon: BookOpen,
      trend: "Keep learning!",
    },
    {
      title: "In Progress",
      value: data.stats.in_progress,
      description: "Active learning",
      icon: Clock,
      trend: `${
        data.stats.total_enrolled -
        data.stats.in_progress -
        data.stats.completed
      } not started`,
    },
    {
      title: "Completed",
      value: data.stats.completed,
      description: "Courses finished",
      icon: CheckCircle,
      trend: `${Math.round(
        (data.stats.completed / (data.stats.total_enrolled || 1)) * 100
      )}% completion rate`,
    },
    {
      title: "Lessons Completed",
      value: data.stats.total_lessons_completed,
      description: "Total progress",
      icon: TrendingUp,
      trend: "Great work!",
    },
  ];

  const inProgressCourses = data.enrolled_courses.filter(
    (c) => c.status === "in_progress"
  );
  const completedCourses = data.enrolled_courses.filter(
    (c) => c.status === "completed"
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Learning</h2>
          <p className="text-muted-foreground">
            Track your progress and continue learning
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressCourses.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCourses.length})
          </TabsTrigger>
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
                  <p className="text-xs text-muted-foreground pt-1">
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                {inProgressCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <PlayCircle className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">
                      No courses in progress
                    </p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => navigate("/student/browse")}
                    >
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {inProgressCourses.slice(0, 3).map((course) => (
                      <div key={course.id} className="space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="relative h-16 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='64'%3E%3Crect fill='%23e5e7eb' width='96' height='64'/%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {course.title}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {course.category}
                            </Badge>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                              <span>
                                {course.completed_lessons} /{" "}
                                {course.total_lessons} lessons
                              </span>
                            </div>
                          </div>
                        </div>
                        {course.status !== "completed" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <span className="font-medium">
                                {course.progress}%
                              </span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        )}
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            navigate(`/student/courses/${course.id}/learn`)
                          }
                        >
                          {course.status === "completed"
                            ? "Review Course"
                            : course.status === "not_started"
                            ? "Start Learning"
                            : "Continue Learning"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest course interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.enrolled_courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">
                      No activity yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.enrolled_courses
                      .sort(
                        (a, b) =>
                          new Date(b.last_accessed).getTime() -
                          new Date(a.last_accessed).getTime()
                      )
                      .slice(0, 5)
                      .map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-4 pb-4 border-b last:border-0"
                        >
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {course.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last accessed{" "}
                              {new Date(
                                course.last_accessed
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge
                            variant={
                              course.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {course.status === "completed"
                              ? "Done"
                              : `${course.progress}%`}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course) => (
              <Card key={course.id}>
                <div className="aspect-video relative bg-muted">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23e5e7eb' width='400' height='225'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline">{course.category}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                    <p className="text-xs text-muted-foreground">
                      {course.completed_lessons} of {course.total_lessons}{" "}
                      lessons completed
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() =>
                      navigate(`/student/courses/${course.id}/learn`)
                    }
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <Card key={course.id}>
                <div className="aspect-video relative bg-muted">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23e5e7eb' width='400' height='225'/%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline">{course.category}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{course.total_lessons} lessons completed</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      navigate(`/student/courses/${course.id}/learn`)
                    }
                  >
                    Review Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
