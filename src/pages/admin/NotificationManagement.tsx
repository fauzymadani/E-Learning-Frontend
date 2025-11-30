import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Filter, Clock } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

async function fetchNotifications(
  page = 1,
  limit = 20
): Promise<NotificationResponse> {
  const { data } = await axios.get(
    `/notifications?page=${page}&limit=${limit}`
  );
  return {
    notifications: data.notifications || [],
    total: data.total || 0,
    page: data.page || 1,
    limit: data.limit || 20,
  };
}

async function getUnreadCount(): Promise<number> {
  const { data } = await axios.get("/notifications/unread-count");
  return data.count || 0;
}

async function markAsRead(notificationId: number) {
  const { data } = await axios.put(`/notifications/${notificationId}/read`);
  return data;
}

async function markAllAsRead() {
  const { data } = await axios.put("/notifications/read-all");
  return data;
}

export default function NotificationManagement() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", currentPage],
    queryFn: () => fetchNotifications(currentPage, limit),
    refetchInterval: 30000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const filteredNotifications =
    data?.notifications?.filter((notif) => {
      if (filterType === "all") return true;
      return notif.type === filterType;
    }) || [];

  const notificationTypes = Array.from(
    new Set(data?.notifications?.map((n) => n.type) || [])
  );

  function getNotificationColor(type: string) {
    switch (type) {
      case "enrollment":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "course":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "lesson":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "system":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-muted-foreground font-medium">
            Loading notifications...
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
                : "Failed to load notifications"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Stay updated with platform activities
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount > 0 ? "Needs attention" : "All caught up"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {notificationTypes.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredNotifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {filterType !== "all"
                ? "No notifications found for this filter"
                : "You don't have any notifications yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Showing {filteredNotifications.length} of {data?.total || 0}{" "}
              notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                      !notification.is_read
                        ? "bg-secondary/50 hover:bg-secondary/70"
                        : "hover:bg-secondary/30"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        !notification.is_read ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <Bell
                        className={`h-4 w-4 ${
                          !notification.is_read
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {notification.title && (
                            <p className="text-sm font-semibold leading-tight">
                              {notification.title}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={() =>
                              markReadMutation.mutate(notification.id)
                            }
                            disabled={markReadMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {notification.type}
                        </Badge>

                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {index < filteredNotifications.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.total > limit && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {Math.ceil(data.total / limit)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= Math.ceil(data.total / limit)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
