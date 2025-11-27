import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axios";


export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await axios.get("courses");
      return data;
    },
  });
};

export const useCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: async () => {
      const { data } = await axios.get(`courses/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });
};

export const useLessons = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["courses", courseId, "lessons"],
    queryFn: async () => {
      const { data } = await axios.get(`courses/${courseId}/lessons`);
      return data.sort((a: any, b: any) => a.order_number - b.order_number);
    },
    enabled: !!courseId,
  });
};


export const useMyEnrollments = () => {
  return useQuery({
    queryKey: ["enrollments", "my-courses"],
    queryFn: async () => {
      const { data } = await axios.get("enrollments/my-courses");
      return data;
    },
  });
};

export const useEnrollmentStatus = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["enrollments", "status", courseId],
    queryFn: async () => {
      const { data } = await axios.get(`courses/${courseId}/enrollment-status`);
      return data;
    },
    enabled: !!courseId,
  });
};

export const useEnrollMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseId: number) => {
      const { data } = await axios.post(`courses/${courseId}/enroll`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};


export const useLessonProgress = (lessonId: number | undefined) => {
  return useQuery({
    queryKey: ["progress", "lessons", lessonId],
    queryFn: async () => {
      const { data } = await axios.get(`progress/lessons/${lessonId}`);
      return data;
    },
    enabled: !!lessonId,
  });
};

export const useCourseProgress = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["progress", "courses", courseId],
    queryFn: async () => {
      const { data } = await axios.get(`progress/courses/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });
};

export const useMarkLessonCompleteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId, isCompleted }: { lessonId: number; isCompleted: boolean }) => {
      if (isCompleted) {
        await axios.delete(`progress/lessons/${lessonId}/complete`);
      } else {
        await axios.post(`progress/lessons/${lessonId}/complete`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};


export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ["dashboard", "student"],
    queryFn: async () => {
      const { data } = await axios.get("dashboard/student");
      return data;
    },
  });
};

export const useTeacherDashboard = () => {
  return useQuery({
    queryKey: ["dashboard", "teacher"],
    queryFn: async () => {
      const { data } = await axios.get("dashboard/teacher");
      return data;
    },
  });
};


export const useProfile = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await axios.get("auth/me");
      return data;
    },
  });
};