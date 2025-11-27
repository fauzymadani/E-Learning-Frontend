import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import axios from "../../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  PartyPopper,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  content: string;
  video_url: string;
  file_url: string;
  order_number: number;
  duration: number;
  is_completed: boolean;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  teacher_id: number;
  is_published: boolean;
}

interface CourseProgress {
  completed_lessons: number;
  total_lessons: number;
  progress_percent: number;
}

export default function StudentCourseLesson() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  async function fetchCourseData() {
    try {
      setLoading(true);

      // Fetch course details
      const courseRes = await axios.get(`/courses/${courseId}`);
      setCourse(courseRes.data);

      // Fetch lessons
      const lessonsRes = await axios.get(`/courses/${courseId}/lessons`);

      // Fetch progress untuk setiap lesson
      const lessonsWithProgress = await Promise.all(
        lessonsRes.data.map(async (lesson: any) => {
          let isCompleted = false;
          try {
            const lessonProgressRes = await axios.get(
              `/progress/lessons/${lesson.id}`
            );
            isCompleted = lessonProgressRes.data.is_completed || false;
          } catch (err) {
            // Lesson belum pernah diakses, default false
            isCompleted = false;
          }
          return {
            ...lesson,
            is_completed: isCompleted,
          };
        })
      );

      // Sort by order_number
      lessonsWithProgress.sort(
        (a: Lesson, b: Lesson) => a.order_number - b.order_number
      );

      // Hitung completed lessons
      const completedCount = lessonsWithProgress.filter(
        (l: Lesson) => l.is_completed
      ).length;

      setLessons(lessonsWithProgress);

      // Set lesson pertama atau lesson terakhir yang belum selesai
      const firstIncompleteLesson = lessonsWithProgress.find(
        (l: Lesson) => !l.is_completed
      );
      setCurrentLesson(firstIncompleteLesson || lessonsWithProgress[0] || null);

      // Set progress
      setProgress({
        completed_lessons: completedCount,
        total_lessons: lessonsWithProgress.length,
        progress_percent:
          lessonsWithProgress.length > 0
            ? Math.round((completedCount / lessonsWithProgress.length) * 100)
            : 0,
      });
    } catch (err: any) {
      console.error("Error fetching course:", err);
      setError(err.response?.data?.error || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }

  async function toggleLessonComplete(lessonId: number, isCompleted: boolean) {
    try {
      setMarkingComplete(true);

      if (isCompleted) {
        // Unmark
        await axios.delete(`/progress/lessons/${lessonId}/complete`);
      } else {
        // Mark as completed - send empty object as body
        await axios.post(`/progress/lessons/${lessonId}/complete`, {});
      }

      // Refresh data
      await fetchCourseData();

      // Check if all lessons completed after refresh
      const updatedLessons = lessons.map((l) =>
        l.id === lessonId ? { ...l, is_completed: !isCompleted } : l
      );
      const allCompleted = updatedLessons.every((l) => l.is_completed);

      if (allCompleted && !isCompleted) {
        // Show completion dialog only when marking last lesson as complete
        setShowCompletionDialog(true);
      }
    } catch (err: any) {
      console.error("Failed to update progress:", err);
      // Show error to user
      alert(err.response?.data?.error || "Failed to update lesson progress");
    } finally {
      setMarkingComplete(false);
    }
  }

  function handleCourseCompletion() {
    setShowCompletionDialog(false);
    navigate("/student");
  }

  function goToNextLesson() {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
    }
  }

  function goToPreviousLesson() {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
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
            Loading course...
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
            <Button className="mt-4" onClick={() => navigate("/student")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No content available</p>
            <Button className="mt-4" onClick={() => navigate("/student")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
  const isFirstLesson = currentIndex === 0;
  const isLastLesson = currentIndex === lessons.length - 1;

  // Get base URL for video - REMOVE /api/v1 prefix
  const getVideoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    // Backend returns /uploads/videos/..., we need http://localhost:8080/uploads/videos/...
    const baseUrl =
      axios.defaults.baseURL?.replace("/api/v1", "") || "http://localhost:8080";
    return `${baseUrl}${url}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-base truncate">
                  {course.title || "Untitled Course"}
                </h1>
              </div>
            </div>
            {progress && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <Progress
                    value={progress.progress_percent}
                    className="w-24 h-2"
                  />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {progress.progress_percent}%
                  </span>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {progress.completed_lessons}/{progress.total_lessons}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Video Player */}
            {currentLesson.video_url && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                <video
                  controls
                  className="w-full h-full"
                  src={getVideoUrl(currentLesson.video_url)}
                  key={currentLesson.id}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Lesson Title & Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  {currentLesson.duration > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{currentLesson.duration} min</span>
                    </div>
                  )}
                  <Badge
                    variant={currentLesson.is_completed ? "default" : "outline"}
                    className={currentLesson.is_completed ? "bg-green-600" : ""}
                  >
                    {currentLesson.is_completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
              <Button
                variant={currentLesson.is_completed ? "outline" : "default"}
                size="sm"
                onClick={() =>
                  toggleLessonComplete(
                    currentLesson.id,
                    currentLesson.is_completed
                  )
                }
                disabled={markingComplete}
              >
                {markingComplete ? (
                  "Updating..."
                ) : currentLesson.is_completed ? (
                  <>
                    <Circle className="h-4 w-4 mr-1.5" />
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Mark Complete
                  </>
                )}
              </Button>
            </div>

            {/* File Download */}
            {currentLesson.file_url && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Course Material</p>
                    <p className="text-xs text-muted-foreground">
                      Download PDF attachment
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const fileUrl = getVideoUrl(currentLesson.file_url);
                      window.open(fileUrl, "_blank");
                    }}
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lesson Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {currentLesson.content ? (
                    <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                      {currentLesson.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">
                      No content available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={goToPreviousLesson}
                disabled={isFirstLesson}
              >
                <ChevronLeft className="h-4 w-4 mr-1.5" />
                Previous
              </Button>
              <Button onClick={goToNextLesson} disabled={isLastLesson}>
                Next
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Lessons List */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Course Content</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {lessons.length}{" "}
                    {lessons.length === 1 ? "lesson" : "lessons"}
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                    {lessons.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors ${
                          currentLesson.id === lesson.id
                            ? "bg-primary/10 border-l-4 border-l-primary"
                            : "hover:bg-muted border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-0.5">
                            {lesson.is_completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm leading-snug ${
                                currentLesson.id === lesson.id
                                  ? "font-semibold"
                                  : "font-medium"
                              }`}
                            >
                              {index + 1}. {lesson.title}
                            </p>
                            {lesson.duration > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {lesson.duration} min
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Completion Dialog */}
      <Dialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Congratulations! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              You've completed all lessons in this course!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center space-y-3">
              <p className="text-sm font-medium">{course?.title}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{lessons.length} lessons completed</span>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleCourseCompletion}
              className="w-full sm:w-auto"
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
