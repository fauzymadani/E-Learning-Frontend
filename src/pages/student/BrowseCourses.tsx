import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCourses,
  useMyEnrollments,
  useEnrollMutation,
} from "../../api/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Search,
  CheckCircle,
  Clock,
  GraduationCap,
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  teacher_id: number;
  teacher_name?: string;
  is_published: boolean;
  total_lessons?: number;
  is_enrolled?: boolean;
  progress_percentage?: number;
  is_completed?: boolean;
}

export default function BrowseCourses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);

  // React Query hooks
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useMyEnrollments();
  const enrollMutation = useEnrollMutation();

  const isLoading = coursesLoading || enrollmentsLoading;

  // Process courses with enrollment status
  const courses: Course[] = useMemo(() => {
    if (!coursesData) return [];

    const publishedCourses = (coursesData as Course[]).filter(
      (c) => c.is_published
    );

    return publishedCourses.map((course) => {
      const enrollment = enrollmentsData?.find(
        (e: any) => e.course_id === course.id
      );
      // Use status field from enrollment (completed, active, etc.)
      const progressPercentage = enrollment?.progress_percentage || 0;
      const enrollmentStatus = enrollment?.status || "";

      return {
        ...course,
        is_enrolled: !!enrollment,
        progress_percentage: progressPercentage,
        is_completed:
          enrollmentStatus === "completed" || progressPercentage === 100,
      };
    });
  }, [coursesData, enrollmentsData]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === "enrolled") {
      filtered = filtered.filter((c) => c.is_enrolled);
    } else if (filterStatus === "not-enrolled") {
      filtered = filtered.filter((c) => !c.is_enrolled);
    }

    return filtered;
  }, [courses, searchQuery, filterStatus]);

  async function handleEnroll(course: Course) {
    try {
      await enrollMutation.mutateAsync(course.id);
      setShowEnrollDialog(false);
      setSelectedCourse(null);
    } catch (err: any) {
      console.error("Error enrolling:", err);
      alert(err.response?.data?.error || "Failed to enroll in course");
    }
  }

  function openEnrollDialog(course: Course) {
    setSelectedCourse(course);
    setShowEnrollDialog(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
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
            Loading courses...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">Explore Courses</h1>
        <p className="text-lg text-muted-foreground">
          Discover new skills and advance your learning journey
        </p>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course title or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px] h-11">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="enrolled">My Courses</SelectItem>
                <SelectItem value="not-enrolled">Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{courses.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Enrolled
            </p>
            <p className="text-2xl font-bold">
              {courses.filter((c) => c.is_enrolled).length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Available
            </p>
            <p className="text-2xl font-bold">
              {courses.filter((c) => !c.is_enrolled).length}
            </p>
          </div>
        </div>
      </div>

      {/* Results count */}
      {filteredCourses.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredCourses.length}
            </span>{" "}
            {filteredCourses.length === 1 ? "course" : "courses"}
          </p>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter to find what you're looking for"
                : "There are no courses available at the moment"}
            </p>
            {(searchQuery || filterStatus !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23e5e7eb' width='400' height='225'/%3E%3C/svg%3E";
                  }}
                />
                {course.is_enrolled && !course.is_completed && (
                  <Badge className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700">
                    In Progress
                  </Badge>
                )}
                {course.is_completed && (
                  <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-700">
                    Completed
                  </Badge>
                )}
              </div>

              <CardHeader className="space-y-2">
                <CardTitle className="line-clamp-2 text-xl">
                  {course.title || "Untitled Course"}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {course.description || "No description available"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  {course.teacher_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{course.teacher_name}</span>
                    </div>
                  )}
                  {course.total_lessons !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {course.total_lessons}{" "}
                        {course.total_lessons === 1 ? "lesson" : "lessons"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress indicator */}
                {course.is_enrolled &&
                  !course.is_completed &&
                  course.progress_percentage !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {course.progress_percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${course.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                {course.is_completed && (
                  <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950 px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Course Completed
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="gap-2 pt-4">
                {course.is_enrolled ? (
                  <Button
                    className="w-full"
                    onClick={() =>
                      navigate(`/student/courses/${course.id}/learn`)
                    }
                  >
                    {course.is_completed
                      ? "Review Course"
                      : course.progress_percentage === 0
                      ? "Start Learning"
                      : "Continue Learning"}
                  </Button>
                ) : (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() => openEnrollDialog(course)}
                    >
                      Enroll Now
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                      title="View Details"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Enroll Confirmation Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Enroll in Course</DialogTitle>
            <DialogDescription>
              You're about to start your learning journey with this course
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23e5e7eb' width='400' height='225'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg leading-tight">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {selectedCourse.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t">
                  {selectedCourse.teacher_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Instructor:</span>
                      <span className="font-medium">
                        {selectedCourse.teacher_name}
                      </span>
                    </div>
                  )}
                  {selectedCourse.total_lessons !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Lessons:</span>
                      <span className="font-medium">
                        {selectedCourse.total_lessons}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowEnrollDialog(false)}
              disabled={enrollMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedCourse && handleEnroll(selectedCourse)}
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending ? "Enrolling..." : "Confirm Enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
