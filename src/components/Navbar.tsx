import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ModeToggle } from "./mode-toggle";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const navItems =
    user.role === "teacher"
      ? [
          { name: "Dashboard", path: "/teacher" },
          { name: "My Courses", path: "/my-courses" }, // ← UBAH INI
          { name: "Students", path: "/teacher/students" },
        ]
      : user.role === "student"
      ? [
          { name: "Dashboard", path: "/student" },
          { name: "My Courses", path: "/student/courses" },
          { name: "Browse", path: "/student/browse" },
        ]
      : user.role === "admin"
      ? [
          { name: "Dashboard", path: "/admin" },
          { name: "Users", path: "/admin/users" },
          { name: "Courses", path: "/admin/courses" },
          { name: "Reports", path: "/admin/reports" },
        ]
      : [];

  const isActive = (p: string) => location.pathname === p;

  return (
    <nav className="w-full border-b bg-card/80 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate(navItems[0]?.path || "/")}
        >
          <div className="p-2 rounded-lg bg-primary">
            <svg
              className="w-5 h-5 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="text-foreground font-semibold text-lg hidden sm:block">
            E-Learning
          </span>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.path}>
                <NavigationMenuLink
                  className={`px-4 py-2 rounded-md text-sm transition cursor-pointer ${
                    isActive(item.path)
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {item.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side: Mode Toggle + User Menu */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary text-muted-foreground transition">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-sm text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
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
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden px-3 pb-3 flex gap-1 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              isActive(item.path)
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
}