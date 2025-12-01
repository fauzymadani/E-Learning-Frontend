import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import ReactMarkdown from "react-markdown";
import "react-markdown-editor-lite/lib/index.css";
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
  Eye,
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
import { useAuth } from "@/hooks/useAuth";

// Initialize markdown parser
const mdParser = new MarkdownIt();

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
  const { data } = await axios.delete(
    `/courses/${courseId}/lessons/${lessonId}`
  );
  return data;
}

async function updateLesson(
  courseId: string,
  lessonId: number,
  formData: FormData
) {
  const { data } = await axios.put(
    `/courses/${courseId}/lessons/${lessonId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

export default function CourseLessons() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<CreateLessonForm>({
    title: "",
    content: "",
    video: null,
    file: null,
  });

  // Fetch lessons
  const {
    data: lessons = [],
    isLoading,
    error,
  } = useQuery({
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
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.role] });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        content: "",
        video: null,
        file: null,
      });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to create lesson");
    },
  });

  // Delete lesson mutation
  const deleteMutation = useMutation({
    mutationFn: (lessonId: number) => deleteLesson(courseId!, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.role] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to delete lesson");
    },
  });

  // Update lesson mutation
  const updateMutation = useMutation({
    mutationFn: ({
      lessonId,
      formData,
    }: {
      lessonId: number;
      formData: FormData;
    }) => updateLesson(courseId!, lessonId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.role] });
      setIsDialogOpen(false);
      setEditingLesson(null);
      setFormData({
        title: "",
        content: "",
        video: null,
        file: null,
      });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to update lesson");
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

    if (editingLesson) {
      updateMutation.mutate({ lessonId: editingLesson.id, formData: data });
    } else {
      createMutation.mutate(data);
    }
  }

  function handleEditLesson(lesson: Lesson) {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content,
      video: null,
      file: null,
    });
    setIsDialogOpen(true);
  }

  function handlePreviewLesson(lesson: Lesson) {
    setPreviewLesson(lesson);
    setIsPreviewOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setEditingLesson(null);
    setFormData({
      title: "",
      content: "",
      video: null,
      file: null,
    });
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open) {
      handleCloseDialog();
    } else {
      setIsDialogOpen(true);
    }
  }

  function handleDeleteLesson(lessonId: number, lessonTitle: string) {
    if (!confirm(`Delete lesson "${lessonTitle}"?`)) return;
    deleteMutation.mutate(lessonId);
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate video file type
      const validTypes = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
      ];
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

  function handleBackNavigation() {
    if (user?.role === "admin") {
      navigate("/admin/courses");
    } else {
      navigate("/my-courses");
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
              {error instanceof Error
                ? error.message
                : "Failed to load lessons"}
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
          <Button variant="ghost" size="icon" onClick={handleBackNavigation}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Course Lessons
            </h2>
            <p className="text-muted-foreground">
              Manage lessons for this course • {lessons.length} lessons
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLesson ? "Edit Lesson" : "Create New Lesson"}
              </DialogTitle>
              <DialogDescription>
                {editingLesson
                  ? "Update the lesson details. Leave video/file fields empty to keep existing files."
                  : "Add a new lesson with video and PDF materials"}
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
                <Label htmlFor="content">Lesson Content (Markdown)</Label>
                <div className="border rounded-md overflow-hidden">
                  <MdEditor
                    value={formData.content}
                    style={{ height: "400px" }}
                    renderHTML={(text) => mdParser.render(text)}
                    onChange={({ text }) =>
                      setFormData({ ...formData, content: text })
                    }
                    placeholder="Write your lesson content in markdown..."
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use markdown to format your content. Supports headings, lists,
                  code blocks, etc.
                </p>
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
                {editingLesson &&
                  editingLesson.video_url &&
                  !formData.video && (
                    <p className="text-xs text-green-600">
                      Current video: {editingLesson.video_url.split("/").pop()}
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
                {editingLesson && editingLesson.file_url && !formData.file && (
                  <p className="text-xs text-green-600">
                    Current PDF: {editingLesson.file_url.split("/").pop()}
                  </p>
                )}
              </div>

              {(createMutation.error || updateMutation.error) && (
                <p className="text-sm text-destructive">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : updateMutation.error instanceof Error
                    ? updateMutation.error.message
                    : "Failed to save lesson"}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateLesson}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    {editingLesson ? "Updating..." : "Uploading..."}
                  </>
                ) : editingLesson ? (
                  "Update Lesson"
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
              Start building your course by adding lessons with videos and
              materials.
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
                        <CardDescription className="mt-2 prose prose-sm max-w-none">
                          <div className="line-clamp-3">
                            <ReactMarkdown>
                              {lesson.content.length > 200
                                ? lesson.content.substring(0, 200) + "..."
                                : lesson.content}
                            </ReactMarkdown>
                          </div>
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {lesson.content && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewLesson(lesson)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditLesson(lesson)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeleteLesson(lesson.id, lesson.title)
                      }
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
                      <span className="text-muted-foreground">
                        Video available
                      </span>
                    </div>
                  )}
                  {lesson.file_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        PDF material
                      </span>
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

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewLesson?.title}</DialogTitle>
            <DialogDescription>Lesson content preview</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {previewLesson?.content ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{previewLesson.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground">No content available</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
