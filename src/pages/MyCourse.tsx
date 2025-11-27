import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  BookOpen,
  Users,
  Eye,
  Trash2,
  Edit,
  FileText,
} from "lucide-react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
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
  category: string;
  is_published: boolean;
  total_lessons: number;
  total_students: number;
  active_students: number;
  created_at: string;
}

interface CreateCourseForm {
  title: string;
  description: string;
  category: string;
  thumbnail: string;
}

// API Functions
async function fetchMyCourses(): Promise<Course[]> {
  const { data } = await axios.get("/users/taught-courses");
  return data.courses || [];
}

async function createCourse(formData: CreateCourseForm) {
  const { data } = await axios.post("/courses", formData);
  return data;
}

async function deleteCourse(courseId: number) {
  const { data } = await axios.delete(`/courses/${courseId}`);
  return data;
}

async function togglePublish(courseId: number, currentStatus: boolean) {
  const { data } = await axios.put(`/courses/${courseId}/publish`, {
    is_published: !currentStatus,
  });
  return data;
}

export default function MyCourses() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCourseForm>({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
  });

  // Fetch courses with React Query
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ["myCourses"],
    queryFn: fetchMyCourses,
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        thumbnail: "",
      });
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
    },
  });

  // Toggle publish mutation
  const publishMutation = useMutation({
    mutationFn: ({ courseId, currentStatus }: { courseId: number; currentStatus: boolean }) =>
      togglePublish(courseId, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
    },
  });

  function handleCreateCourse() {
    createMutation.mutate(formData);
  }

  function handleDeleteCourse(courseId: number) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    deleteMutation.mutate(courseId);
  }

  function handleTogglePublish(courseId: number, currentStatus: boolean) {
    publishMutation.mutate({ courseId, currentStatus });
  }

  if (isLoading) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  My Courses
                </h1>
                <p className="text-muted-foreground mt-2">
                  Create and manage your courses
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
                      Fill in the details to create a new course. You can add
                      lessons later.
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
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">
                            Programming
                          </SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="data-science">
                            Data Science
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Card className="mb-6 border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive font-medium">
                  {error instanceof Error ? error.message : "Failed to load courses"}
                </p>
              </CardContent>
            </Card>
          )}

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
                      src={course.thumbnail}
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">
                          {course.total_lessons || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Lessons</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">
                          {course.total_students || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Students
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">
                          {course.active_students || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleTogglePublish(course.id, course.is_published)
                        }
                        disabled={publishMutation.isPending}
                      >
                        {course.is_published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}