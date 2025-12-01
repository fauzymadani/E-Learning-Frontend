import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  Clock,
  PlayCircle,
  GraduationCap,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  enrolled_at: string;
  status: string;
  progress: number;
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    teacher_name: string;
    total_lessons: number;
  };
}

interface MyEnrollmentsResponse {
  enrollments: Enrollment[];
  total: number;
}

async function fetchMyEnrollments(): Promise<MyEnrollmentsResponse> {
  const { data } = await axios.get("/enrollments/my-courses");
  return data;
}

export default function MyLearning() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const { data, isLoading, error } = useQuery({
    queryKey: ["myEnrollments"],
    queryFn: fetchMyEnrollments,
  });

  const enrollments = data?.enrollments || [];

  // Filter & Sort
  const filteredEnrollments = enrollments
    .filter((enrollment) => {
      const matchesSearch = enrollment.course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "completed" && enrollment.progress === 100) ||
        (filterStatus === "in-progress" &&
          enrollment.progress > 0 &&
          enrollment.progress < 100) ||
        (filterStatus === "not-started" && enrollment.progress === 0);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
        );
      } else if (sortBy === "progress") {
        return b.progress - a.progress;
      } else if (sortBy === "title") {
        return a.course.title.localeCompare(b.course.title);
      }
      return 0;
    });

  // Stats
  const stats = {
    total: enrollments.length,
    completed: enrollments.filter((e) => e.progress === 100).length,
    inProgress: enrollments.filter((e) => e.progress > 0 && e.progress < 100)
      .length,
    notStarted: enrollments.filter((e) => e.progress === 0).length,
  };

  if (isLoading) {
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
            Loading your courses...
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
            <p className="text-destructive font-medium">
              {error instanceof Error
                ? error.message
                : "Failed to load courses"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Learning</h2>
          <p className="text-muted-foreground">
            {stats.total} enrolled courses
          </p>
        </div>

        <Button onClick={() => navigate("/student/browse")}>
          <Search className="mr-2 h-4 w-4" />
          Browse More Courses
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Enrolled courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">Ready to begin</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Enrolled</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      {filteredEnrollments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || filterStatus !== "all"
                ? "No courses found"
                : "No enrolled courses yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Start your learning journey by browsing available courses"}
            </p>
            <Button onClick={() => navigate("/student/browse")}>
              <Search className="mr-2 h-4 w-4" />
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEnrollments.map((enrollment) => {
            const course = enrollment.course;
            const isCompleted = enrollment.progress === 100;
            const isInProgress =
              enrollment.progress > 0 && enrollment.progress < 100;
            const isNotStarted = enrollment.progress === 0;

            return (
              <Card
                key={enrollment.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video relative bg-muted">
                  <img
                    src={course.thumbnail || ""}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23e5e7eb' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        isCompleted
                          ? "default"
                          : isInProgress
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {isCompleted
                        ? "Completed"
                        : isInProgress
                        ? "In Progress"
                        : "Not Started"}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="text-xs">By {course.teacher_name}</span>
                    <span className="text-xs">•</span>
                    <span className="text-xs">
                      {course.total_lessons} lessons
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {enrollment.progress}%
                      </span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Enrolled on{" "}
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </div>

                  <Button
                    className="w-full"
                    variant={isCompleted ? "outline" : "default"}
                    onClick={() =>
                      navigate(`/student/courses/${course.id}/learn`)
                    }
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Review Course
                      </>
                    ) : isNotStarted ? (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Learning
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continue Learning
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
