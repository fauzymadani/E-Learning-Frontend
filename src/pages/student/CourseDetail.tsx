import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  BookOpen,
  Clock,
  GraduationCap,
  CheckCircle,
  PlayCircle,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  content: string;
  order_number: number;
  duration: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  teacher_id: number;
  is_published: boolean;
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  async function fetchCourseDetail() {
    try {
      setLoading(true);

      // Fetch course
      const courseRes = await axios.get(`/courses/${courseId}`);
      setCourse(courseRes.data);

      // Fetch lessons
      const lessonsRes = await axios.get(`/courses/${courseId}/lessons`);
      const sortedLessons = lessonsRes.data.sort(
        (a: Lesson, b: Lesson) => a.order_number - b.order_number
      );
      setLessons(sortedLessons);

      // Check enrollment status
      try {
        const enrollmentRes = await axios.get(
          `/courses/${courseId}/enrollment-status`
        );
        setIsEnrolled(enrollmentRes.data.is_enrolled);
      } catch (err) {
        setIsEnrolled(false);
      }
    } catch (err: any) {
      console.error("Error fetching course:", err);
      setError(err.response?.data?.error || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll() {
    try {
      setEnrolling(true);
      await axios.post(`/courses/${courseId}/enroll`);
      setIsEnrolled(true);
    } catch (err: any) {
      console.error("Error enrolling:", err);
      alert(err.response?.data?.error || "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  }

  function handleStartLearning() {
    navigate(`/student/courses/${courseId}/learn`);
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
            Loading course...
          </span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">
              {error || "Course not found"}
            </p>
            <Button className="mt-4" onClick={() => navigate("/student/browse")}>
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/student/browse")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Browse
          </Button>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    {course.title || "Untitled Course"}
                  </h1>
                  <p className="text-muted-foreground mt-2 text-lg">
                    {course.description || "No description available"}
                  </p>
                </div>
                {isEnrolled && (
                  <Badge className="bg-green-500 shrink-0">Enrolled</Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{totalDuration} minutes</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Course Thumbnail */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
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
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
                <CardDescription>
                  Course curriculum and learning objectives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No lessons available yet
                    </p>
                  ) : (
                    lessons.slice(0, 5).map((lesson, idx) => (
                      <div key={lesson.id} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{lesson.title}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {lessons.length > 5 && (
                    <p className="text-sm text-muted-foreground pt-2">
                      + {lessons.length - 5} more lessons
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Action Button */}
                {isEnrolled ? (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleStartLearning}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Learning
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </Button>
                )}

                <Separator />

                {/* Lessons List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  <h4 className="font-semibold text-sm mb-3">Lessons</h4>
                  {lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No lessons available
                    </p>
                  ) : (
                    lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">
                            {lesson.title}
                          </p>
                          {lesson.duration > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {lesson.duration} min
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}