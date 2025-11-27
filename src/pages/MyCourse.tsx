import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"; // ← TAMBAH INI
import { Plus, BookOpen, Trash2, Edit, Eye, EyeOff, Video } from "lucide-react"; // ← TAMBAH Video
import axios from "../api/axios";
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

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category_id: number | null;
  teacher_id: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface CoursesResponse {
  courses: Course[];
  limit: number;
  page: number;
  total: number;
}

interface CreateCourseForm {
  title: string;
  description: string;
  thumbnail: string;
}

// API Functions
async function fetchMyCourses(): Promise<CoursesResponse> {
  const { data } = await axios.get("/users/taught-courses");
  return data;
}

async function createCourse(formData: CreateCourseForm) {
  const { data } = await axios.post("/courses", formData);
  return data;
}

async function deleteCourse(courseId: number) {
  const { data } = await axios.delete(`/courses/${courseId}`);
  return data;
}

async function updateCourse(courseId: number, formData: CreateCourseForm) {
  console.log("updateCourse API call:", { courseId, formData });
  const { data } = await axios.put(`/courses/${courseId}`, formData);
  console.log("updateCourse response:", data);
  return data;
}

async function togglePublish(courseId: number, currentStatus: boolean) {
  const payload = { publish: !currentStatus };
  console.log("togglePublish API call:", {
    courseId,
    currentStatus,
    willPublish: !currentStatus,
    payload,
  });
  const { data } = await axios.put(`/courses/${courseId}/publish`, payload);
  console.log("togglePublish response:", data);
  return data;
}

export default function MyCourses() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CreateCourseForm>({
    title: "",
    description: "",
    thumbnail: "",
  });
  const [editFormData, setEditFormData] = useState<CreateCourseForm>({
    title: "",
    description: "",
    thumbnail: "",
  });

  // Fetch courses with React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["myCourses"],
    queryFn: fetchMyCourses,
    refetchOnMount: true,
  });

  const courses = data?.courses || [];
  const total = data?.total || 0;

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      queryClient.invalidateQueries({ queryKey: ["teacherDashboard"] });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        thumbnail: "",
      });
    },
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: ({
      courseId,
      formData,
    }: {
      courseId: number;
      formData: CreateCourseForm;
    }) => updateCourse(courseId, formData),
    onSuccess: async () => {
      // Force refetch to get updated data
      await queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      await queryClient.refetchQueries({ queryKey: ["myCourses"] });
      queryClient.invalidateQueries({ queryKey: ["teacherDashboard"] });
      setIsEditDialogOpen(false);
      setEditingCourse(null);
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      alert(error.response?.data?.error || "Failed to update course");
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      queryClient.invalidateQueries({ queryKey: ["teacherDashboard"] });
    },
  });

  // Toggle publish mutation
  const publishMutation = useMutation({
    mutationFn: ({
      courseId,
      currentStatus,
    }: {
      courseId: number;
      currentStatus: boolean;
    }) => togglePublish(courseId, currentStatus),
    onSuccess: async () => {
      // Force refetch to get updated data
      await queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      await queryClient.refetchQueries({ queryKey: ["myCourses"] });
      queryClient.invalidateQueries({ queryKey: ["teacherDashboard"] });
    },
    onError: (error: any) => {
      console.error("Publish error:", error);
      alert(error.response?.data?.error || "Failed to update publish status");
    },
  });

  function handleCreateCourse() {
    if (!formData.title || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }
    createMutation.mutate(formData);
  }

  function handleDeleteCourse(courseId: number, courseTitle: string) {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"?`)) return;
    deleteMutation.mutate(courseId);
  }

  function handleTogglePublish(courseId: number, currentStatus: boolean) {
    console.log("Toggle publish clicked:", { courseId, currentStatus });
    publishMutation.mutate({ courseId, currentStatus });
  }

  function handleEditCourse(course: Course) {
    console.log("Edit course clicked:", course);
    setEditingCourse(course);
    setEditFormData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
    });
    setIsEditDialogOpen(true);
  }

  function handleUpdateCourse() {
    console.log("Update course clicked:", { editingCourse, editFormData });
    if (!editFormData.title || !editFormData.description || !editingCourse) {
      alert("Please fill in all required fields");
      return;
    }
    updateMutation.mutate({
      courseId: editingCourse.id,
      formData: editFormData,
    });
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
            Loading courses...
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
          <p className="text-muted-foreground">
            Create and manage your courses • {total} total
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new course. You can add lessons
                later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  placeholder="Introduction to Web Development"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  placeholder="https://example.com/image.jpg"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      thumbnail: e.target.value,
                    })
                  }
                />
                {formData.thumbnail && (
                  <div className="relative h-32 w-full rounded-md overflow-hidden bg-muted">
                    <img
                      src={formData.thumbnail}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23e5e7eb' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='18'%3EInvalid Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                )}
              </div>
              {createMutation.error && (
                <p className="text-sm text-destructive">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Failed to create course"}
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
                onClick={handleCreateCourse}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Course"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Get started by creating your first course and sharing your
              knowledge with students.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
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
                    variant={course.is_published ? "default" : "secondary"}
                  >
                    {course.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Created {new Date(course.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {course.description}
                </p>

                <div className="flex flex-col gap-2">
                  {/* Row 1: Lessons + Publish/Unpublish */}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/courses/${course.id}/lessons`)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Lessons
                    </Button>
                    <Button
                      variant={course.is_published ? "outline" : "default"}
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        handleTogglePublish(course.id, course.is_published)
                      }
                      disabled={publishMutation.isPending}
                    >
                      {course.is_published ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Publish
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Row 2: Edit + Delete */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        handleDeleteCourse(course.id, course.title)
                      }
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Course Title *</Label>
              <Input
                id="edit-title"
                placeholder="Enter course title"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter course description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
              <Input
                id="edit-thumbnail"
                placeholder="Enter image URL"
                value={editFormData.thumbnail}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    thumbnail: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCourse}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
