import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
            const lessonProgressRes = await axios.get(`/progress/lessons/${lesson.id}`);
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
      lessonsWithProgress.sort((a: Lesson, b: Lesson) => a.order_number - b.order_number);

      // Hitung completed lessons
      const completedCount = lessonsWithProgress.filter((l: Lesson) => l.is_completed).length;

      setLessons(lessonsWithProgress);
      
      // Set lesson pertama atau lesson terakhir yang belum selesai
      const firstIncompleteLesson = lessonsWithProgress.find((l: Lesson) => !l.is_completed);
      setCurrentLesson(firstIncompleteLesson || lessonsWithProgress[0] || null);

      // Set progress
      setProgress({
        completed_lessons: completedCount,
        total_lessons: lessonsWithProgress.length,
        progress_percent: lessonsWithProgress.length > 0 
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
            <Button 
              className="mt-4" 
              onClick={() => navigate("/student")}
            >
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
            <Button 
              className="mt-4" 
              onClick={() => navigate("/student")}
            >
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
    const baseUrl = axios.defaults.baseURL?.replace('/api/v1', '') || 'http://localhost:8080';
    return `${baseUrl}${url}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student")}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="font-semibold text-lg">
                  {course.title || "Untitled Course"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {course.description || "No description"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {progress && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Progress:
                  </span>
                  <Badge variant="secondary">
                    {progress.completed_lessons} / {progress.total_lessons}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          {progress && (
            <Progress value={progress.progress_percent} className="mt-4 h-2" />
          )}
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      {currentLesson.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {currentLesson.duration > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{currentLesson.duration} min</span>
                        </div>
                      )}
                      <Badge
                        variant={
                          currentLesson.is_completed ? "default" : "secondary"
                        }
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
                        <Circle className="h-4 w-4 mr-1" />
                        Mark Incomplete
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Player */}
                {currentLesson.video_url && (
                  <div className="mb-6 aspect-video bg-muted rounded-lg overflow-hidden">
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

                {/* File Download */}
                {currentLesson.file_url && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <FileText className="h-5 w-5 text-muted-foreground" />
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
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {currentLesson.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                    />
                  ) : (
                    <p className="text-muted-foreground">No content available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousLesson}
                disabled={isFirstLesson}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Lesson
              </Button>
              <Button
                onClick={goToNextLesson}
                disabled={isLastLesson}
              >
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Lessons List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentLesson.id === lesson.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-1">
                          {lesson.is_completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight">
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

      {/* Course Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
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
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{course?.title}</strong>
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  {lessons.length} lessons completed
                </span>
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