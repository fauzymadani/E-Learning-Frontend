import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Video,
  FileText,
  Trash2,
  Edit,
  GripVertical,
  Upload,
  X,
  ArrowLeft,
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  video_url: string;
  file_url: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface CreateLessonForm {
  title: string;
  content: string;
  video: File | null;
  file: File | null;
}

// API Functions
async function fetchLessons(courseId: string): Promise<Lesson[]> {
  const { data } = await axios.get(`/courses/${courseId}/lessons`);
  return data;
}

async function createLesson(courseId: string, formData: FormData) {
  const { data } = await axios.post(`/courses/${courseId}/lessons`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

async function deleteLesson(courseId: string, lessonId: number) {
  const { data } = await axios.delete(`/courses/${courseId}/lessons/${lessonId}`);
  return data;
}

export default function CourseLessons() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateLessonForm>({
    title: "",
    content: "",
    video: null,
    file: null,
  });

  // Fetch lessons
  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => fetchLessons(courseId!),
    enabled: !!courseId,
  });

  // Create lesson mutation
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => createLesson(courseId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        content: "",
        video: null,
        file: null,
      });
    },
  });

  // Delete lesson mutation
  const deleteMutation = useMutation({
    mutationFn: (lessonId: number) => deleteLesson(courseId!, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
    },
  });

  function handleCreateLesson() {
    if (!formData.title) {
      alert("Title is required");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    if (formData.video) {
      data.append("video", formData.video);
    }
    if (formData.file) {
      data.append("file", formData.file);
    }

    createMutation.mutate(data);
  }

  function handleDeleteLesson(lessonId: number, lessonTitle: string) {
    if (!confirm(`Delete lesson "${lessonTitle}"?`)) return;
    deleteMutation.mutate(lessonId);
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate video file type
      const validTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
      if (!validTypes.includes(file.type)) {
        alert("Only MP4, MOV, AVI, and WebM videos are allowed");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, video: file });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate PDF file type
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, file: file });
    }
  }

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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-muted-foreground font-medium">
            Loading lessons...
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
              {error instanceof Error ? error.message : "Failed to load lessons"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my-courses")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Course Lessons</h2>
            <p className="text-muted-foreground">
              Manage lessons for this course • {lessons.length} lessons
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Lesson</DialogTitle>
              <DialogDescription>
                Add a new lesson with video and PDF materials
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Lesson Title *</Label>
                <Input
                  id="title"
                  placeholder="Introduction to the Course"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content/Description</Label>
                <Textarea
                  id="content"
                  placeholder="Describe what students will learn..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="video">Video (MP4, MOV, AVI, WebM)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="video"
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                    onChange={handleVideoChange}
                    className="cursor-pointer"
                  />
                  {formData.video && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFormData({ ...formData, video: null })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {formData.video && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.video.name} (
                    {(formData.video.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file">PDF Material (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {formData.file && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFormData({ ...formData, file: null })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {formData.file && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.file.name} (
                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {createMutation.error && (
                <p className="text-sm text-destructive">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Failed to create lesson"}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateLesson}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  "Create Lesson"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No lessons yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Start building your course by adding lessons with videos and materials.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Lesson
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                      <Badge variant="outline">{index + 1}</Badge>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      {lesson.content && (
                        <CardDescription className="mt-1">
                          {lesson.content}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {lesson.video_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Video available</span>
                    </div>
                  )}
                  {lesson.file_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">PDF material</span>
                    </div>
                  )}
                  {!lesson.video_url && !lesson.file_url && (
                    <span className="text-sm text-muted-foreground">
                      No materials uploaded
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}