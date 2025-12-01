import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Search,
  FileText,
  GraduationCap,
  Bell,
  Settings,
} from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

async function fetchProfile(): Promise<UserProfile> {
  const { data } = await axios.get("/users/profile");
  return data;
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch fresh profile data including avatar
  const { data: profile } = useQuery<UserProfile, Error>({
    queryKey: ["userProfile"],
    queryFn: fetchProfile,
    enabled: !!user, // Only fetch when user is logged in
  });

  // Use profile data from React Query if available, fallback to auth user
  const displayUser = profile || user;

  if (!user) return null;

  const getNavItems = () => {
    if (user.role === "teacher") {
      return [
        { name: "Dashboard", path: "/teacher", icon: LayoutDashboard },
        { name: "My Courses", path: "/my-courses", icon: BookOpen },
        { name: "Students", path: "/teacher/students", icon: Users },
        { name: "Notifications", path: "/notifications", icon: Bell },
        { name: "Settings", path: "/settings", icon: Settings },
      ];
    }
    if (user.role === "student") {
      return [
        { name: "Dashboard", path: "/student", icon: LayoutDashboard },
        { name: "My Courses", path: "/student/my-learning", icon: BookOpen },
        { name: "Browse", path: "/student/browse", icon: Search },
      ];
    }
    if (user.role === "admin") {
      return [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Courses", path: "/admin/courses", icon: BookOpen },
        { name: "Reports", path: "/admin/reports", icon: FileText },
        { name: "Notifications", path: "/admin/notifications", icon: Bell },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="p-2 rounded-lg bg-primary">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">E-Learning</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        displayUser?.avatar
                          ? `http://localhost:8080${displayUser.avatar}`
                          : undefined
                      }
                      alt={displayUser?.name}
                    />
                    <AvatarFallback>
                      {displayUser?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {displayUser?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {displayUser?.role}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="w-56">
                <DropdownMenuLabel>{displayUser?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => logout()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
