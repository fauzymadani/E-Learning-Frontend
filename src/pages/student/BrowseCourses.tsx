import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses, useMyEnrollments, useEnrollMutation } from "../../api/queries";
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
}

export default function BrowseCourses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);

  // React Query hooks
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useMyEnrollments();
  const enrollMutation = useEnrollMutation();

  const isLoading = coursesLoading || enrollmentsLoading;

  // Process courses with enrollment status
  const courses: Course[] = useMemo(() => {
    if (!coursesData) return [];
    
    const publishedCourses = (coursesData as Course[]).filter((c) => c.is_published);
    const enrolledIds = enrollmentsData?.map((e: any) => e.course_id) || [];
    
    return publishedCourses.map((course) => ({
      ...course,
      is_enrolled: enrolledIds.includes(course.id),
    }));
  }, [coursesData, enrollmentsData]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Browse Courses</h2>
        <p className="text-muted-foreground">
          Discover and enroll in courses to start learning
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="not-enrolled">Not Enrolled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter((c) => c.is_enrolled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter((c) => !c.is_enrolled).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCourses.length} of {courses.length} courses
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchQuery || filterStatus !== "all"
                ? "No courses found matching your filters"
                : "No courses available"}
            </p>
            {(searchQuery || filterStatus !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              {/* Thumbnail */}
              <div className="aspect-video relative bg-muted overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23e5e7eb' width='400' height='225'/%3E%3C/svg%3E";
                  }}
                />
                {course.is_enrolled && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500">Enrolled</Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-2">
                  {course.title || "Untitled Course"}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description || "No description available"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-2">
                  {course.teacher_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>{course.teacher_name}</span>
                    </div>
                  )}
                  {course.total_lessons !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {course.total_lessons}{" "}
                        {course.total_lessons === 1 ? "lesson" : "lessons"}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                {course.is_enrolled ? (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() =>
                        navigate(`/student/courses/${course.id}/learn`)
                      }
                    >
                      Continue Learning
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                    >
                      View Details
                    </Button>
                  </>
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
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                    >
                      Details
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to enroll in this course?
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 py-4">
              <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23e5e7eb' width='400' height='225'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedCourse.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedCourse.description}
                </p>
              </div>
              {selectedCourse.teacher_name && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>Instructor: {selectedCourse.teacher_name}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
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