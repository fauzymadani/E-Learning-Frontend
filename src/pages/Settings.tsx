import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// API response shapes (adjust if backend differs)
interface UpdateProfileResponse {
  user?: UserProfile; // some APIs wrap updated user
  id?: number; // if backend returns raw user without wrapper
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  message?: string;
}

interface ChangePasswordResponse {
  message?: string;
}

async function fetchProfile(): Promise<UserProfile> {
  const { data } = await axios.get("/users/profile");
  return data;
}

async function updateProfile(
  formData: FormData
): Promise<UpdateProfileResponse> {
  const { data: res } = await axios.put("/users/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
  const queryClient = useQueryClient();
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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

  const profileMutation = useMutation<UpdateProfileResponse, Error, FormData>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      console.log("Profile update response:", data);

      // Support both wrapped and raw user payloads
      const updated =
        data.user ??
        (data.id
          ? ({
              id: String(data.id),
              name: data.name || profileForm.name,
              email: data.email || profileForm.email,
              role: data.role || "",
              avatar: data.avatar,
            } as any)
          : undefined);

      if (updated) {
        setUser(updated);
      }

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      setProfileSuccess(data.message || "Profile updated successfully!");
      setAvatarFile(null);
      setAvatarPreview(null);
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

    const formData = new FormData();
    formData.append("name", profileForm.name);
    formData.append("email", profileForm.email);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    profileMutation.mutate(formData);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Avatar must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

              <div className="space-y-4">
                <Label>Profile Avatar</Label>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={
                        avatarPreview ||
                        (profile?.avatar
                          ? `http://localhost:8080${profile.avatar}`
                          : undefined)
                      }
                      alt={profile?.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {profile?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="cursor-pointer"
                      />
                      {avatarFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a profile picture (max 5MB)
                    </p>
                    {avatarFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {avatarFile.name} (
                        {(avatarFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>

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
