import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Video,
  Search,
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category_id: number | null;
  teacher_id: number;
  teacher_name?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface UpdateCourseForm {
  title: string;
  description: string;
  thumbnail: string;
}

// API Functions
async function fetchAllCourses(): Promise<Course[]> {
  const { data } = await axios.get("/courses");
  return data;
}

async function updateCourse(courseId: number, formData: UpdateCourseForm) {
  const { data } = await axios.put(`/courses/${courseId}`, formData);
  return data;
}

async function deleteCourse(courseId: number) {
  const { data } = await axios.delete(`/courses/${courseId}`);
  return data;
}

async function togglePublish(courseId: number, currentStatus: boolean) {
  const payload = { publish: !currentStatus };
  const { data } = await axios.put(`/courses/${courseId}/publish`, payload);
  return data;
}

export default function CourseManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [editForm, setEditForm] = useState<UpdateCourseForm>({
    title: "",
    description: "",
    thumbnail: "",
  });

  // Fetch courses
  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: fetchAllCourses,
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: ({
      courseId,
      formData,
    }: {
      courseId: number;
      formData: UpdateCourseForm;
    }) => updateCourse(courseId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
      setIsEditDialogOpen(false);
      setEditingCourse(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to update course");
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to delete course");
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to update publish status");
    },
  });

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.teacher_name &&
        course.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && course.is_published) ||
      (filterStatus === "draft" && !course.is_published);

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.is_published).length,
    draft: courses.filter((c) => !c.is_published).length,
  };

  function handleEditCourse(course: Course) {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
    });
    setIsEditDialogOpen(true);
  }

  function handleUpdateCourse() {
    if (!editForm.title || !editForm.description || !editingCourse) {
      alert("Please fill in all required fields");
      return;
    }
    updateMutation.mutate({
      courseId: editingCourse.id,
      formData: editForm,
    });
  }

  function handleDeleteCourse(courseId: number, courseTitle: string) {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"?`)) return;
    deleteMutation.mutate(courseId);
  }

  function handleTogglePublish(courseId: number, currentStatus: boolean) {
    publishMutation.mutate({ courseId, currentStatus });
  }

  function navigateToLessons(courseId: number) {
    window.location.href = `/courses/${courseId}/lessons`;
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
          <h2 className="text-3xl font-bold tracking-tight">
            Course Management
          </h2>
          <p className="text-muted-foreground">
            Manage all platform courses • {stats.total} total courses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <EyeOff className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "No courses available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
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
                <CardDescription className="text-xs">
                  {course.teacher_name && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      <span>{course.teacher_name}</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Created {new Date(course.created_at).toLocaleDateString()}
                  </div>
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
                      onClick={() => navigateToLessons(course.id)}
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
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter course description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
              <Input
                id="edit-thumbnail"
                placeholder="Enter image URL"
                value={editForm.thumbnail}
                onChange={(e) =>
                  setEditForm({ ...editForm, thumbnail: e.target.value })
                }
              />
              {editForm.thumbnail && (
                <div className="relative h-32 w-full rounded-md overflow-hidden bg-muted">
                  <img
                    src={editForm.thumbnail}
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
