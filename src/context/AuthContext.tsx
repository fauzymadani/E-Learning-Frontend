import { createContext, useState, useEffect, type ReactNode } from "react";
import { getMe, logoutUser } from "../api/auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem("token");
    if (token) {
      // Try to fetch user data
      getMe()
        .then((data) => {
          setUser(data);
        })
        .catch(() => {
          // Token invalid or expired, remove it
          localStorage.removeItem("token");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore errors; proceed with client-side logout
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
