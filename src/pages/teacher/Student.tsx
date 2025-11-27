import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, Mail, Calendar } from "lucide-react";
import axios from "../../api/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  category_id?: number | null;
  teacher_id?: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  status?: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  course?: {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    category_id: number | null;
    teacher_id: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface EnrollmentsResponse {
  enrollments: Enrollment[];
  course_title: string;
}

interface CoursesResponse {
  courses: Course[];
  limit: number;
  page: number;
  total: number;
}

async function fetchMyCourses(): Promise<CoursesResponse> {
  const { data } = await axios.get("/users/taught-courses");
  return data;
}

async function fetchCourseEnrollments(
  courseId: string
): Promise<EnrollmentsResponse> {
  const { data } = await axios.get(`/courses/${courseId}/enrollments`);
  // API currently returns a raw array of enrollments (not wrapped)
  if (Array.isArray(data)) {
    return {
      enrollments: data,
      course_title: data[0]?.course?.title || "",
    };
  }
  // Fallback to assumed wrapped shape
  return data;
}

export default function Students() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Fetch teacher's courses - unified shape with MyCourse page
  const { data: coursesData, isLoading: coursesLoading } = useQuery<
    CoursesResponse,
    Error
  >({
    queryKey: ["myCourses"],
    queryFn: fetchMyCourses,
    refetchOnMount: true, // ensure fresh fetch if cache shape was array previously
  });

  const courses: Course[] = coursesData?.courses || [];

  // Fetch enrollments for selected course
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["courseEnrollments", selectedCourseId],
    queryFn: () => fetchCourseEnrollments(selectedCourseId),
    enabled: !!selectedCourseId,
  });

  const enrollments = enrollmentsData?.enrollments || [];

  if (coursesLoading) {
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-muted-foreground font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            View and manage students enrolled in your courses
          </p>
        </div>
      </div>

      {/* Course Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <CardDescription>
            Choose a course to view enrolled students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="Select a course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.length === 0 ? (
                <SelectItem disabled value="__no_courses">
                  No courses available
                </SelectItem>
              ) : (
                courses.map((course: Course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Students List */}
      {selectedCourseId && (
        <>
          {enrollmentsLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
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
                </div>
              </CardContent>
            </Card>
          ) : enrollments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No students yet</h3>
                <p className="text-muted-foreground text-center">
                  No students have enrolled in this course yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students ({enrollments.length})</CardTitle>
                <CardDescription>
                  {enrollmentsData?.course_title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {enrollment.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{enrollment.user.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Mail className="h-3 w-3" />
                            <span>{enrollment.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Enrolled{" "}
                              {new Date(
                                enrollment.enrolled_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              enrollment.progress_percentage === 100
                                ? "default"
                                : "secondary"
                            }
                          >
                            {enrollment.progress_percentage}% Complete
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.completed_lessons} /{" "}
                          {enrollment.total_lessons} lessons
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
