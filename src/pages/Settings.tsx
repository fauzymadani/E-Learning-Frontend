import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Lock, Save } from "lucide-react";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

// API response shapes (adjust if backend differs)
interface UpdateProfileResponse {
  user?: UserProfile; // some APIs wrap updated user
  id?: number; // if backend returns raw user without wrapper
  name?: string;
  email?: string;
  role?: string;
  message?: string;
}

interface ChangePasswordResponse {
  message?: string;
}

async function fetchProfile(): Promise<UserProfile> {
  const { data } = await axios.get("/users/profile");
  return data;
}

async function updateProfile(data: {
  name: string;
  email: string;
}): Promise<UpdateProfileResponse> {
  const { data: res } = await axios.put("/users/profile", data);
  return res;
}

async function changePassword(data: {
  old_password: string;
  new_password: string;
}): Promise<ChangePasswordResponse> {
  const { data: res } = await axios.put("/users/change-password", data);
  return res;
}

export default function Settings() {
  const { setUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Explicit generics so TS picks the correct overload including full options
  const { data: profile, isLoading } = useQuery<UserProfile, Error>({
    queryKey: ["userProfile"],
    queryFn: fetchProfile,
  });

  // Sync form when profile arrives (avoids onSuccess typing conflicts)
  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name, email: profile.email });
    }
  }, [profile]);

  const profileMutation = useMutation<
    UpdateProfileResponse,
    Error,
    { name: string; email: string }
  >({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Support both wrapped and raw user payloads
      const updated =
        data.user ??
        (data.id
          ? ({
              id: data.id,
              name: data.name || profileForm.name,
              email: data.email || profileForm.email,
              role: data.role || "",
            } as UserProfile)
          : undefined);
      if (updated) {
        setUser(updated as any); // context expects User shape
      }
      setProfileSuccess(data.message || "Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    },
  });

  const passwordMutation = useMutation<
    ChangePasswordResponse,
    Error,
    { old_password: string; new_password: string }
  >({
    mutationFn: changePassword,
    onSuccess: (data) => {
      setPasswordSuccess(data.message || "Password changed successfully!");
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTimeout(() => setPasswordSuccess(""), 3000);
    },
  });

  function handleProfileUpdate() {
    if (!profileForm.name || !profileForm.email) {
      alert("Please fill in all fields");
      return;
    }
    profileMutation.mutate(profileForm);
  }

  function handlePasswordChange() {
    if (!passwordForm.old_password || !passwordForm.new_password) {
      alert("Please fill in all fields");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("Passwords do not match");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    passwordMutation.mutate({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password,
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
          <span className="text-muted-foreground font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileSuccess && (
                <Alert>
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={profile?.role} disabled />
              </div>

              {profileMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {profileMutation.error instanceof Error
                      ? profileMutation.error.message
                      : "Failed to update profile"}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleProfileUpdate}
                disabled={profileMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {profileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordSuccess && (
                <Alert>
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="old_password">Current Password</Label>
                <Input
                  id="old_password"
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      old_password: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirm_password: e.target.value,
                    })
                  }
                />
              </div>

              {passwordMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {passwordMutation.error instanceof Error
                      ? passwordMutation.error.message
                      : "Failed to change password"}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePasswordChange}
                disabled={passwordMutation.isPending}
              >
                <Lock className="mr-2 h-4 w-4" />
                {passwordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
