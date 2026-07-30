import { useEffect, useState } from "react";
import { toast } from "sonner";
import API_BASE from "../../api";
import { authFetch } from "../../utils/csrfUtils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    avatar: "",
    bio: "",
  });
  const [originalUser, setOriginalUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stagedAvatar, setStagedAvatar] = useState(null);

  const saveProfile = async (nextUser) => {
    setIsUpdating(true);
    try {
      const res = await authFetch(`${API_BASE}/api/users/me`, {
        method: "PUT",
        body: JSON.stringify(nextUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update profile");

      setUser(data);
      window.dispatchEvent(new Event("profileUpdated"));
      return data;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/users/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setOriginalUser(data);
        setStagedAvatar(null);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleUpdate = async () => {
    try {
      if (!originalUser) {
        const data = await saveProfile(user);
        setOriginalUser(data);
        toast.success("Profile updated!");
        return;
      }

      const payload = {};
      if (user.name !== originalUser.name) payload.name = user.name;
      if (user.bio !== originalUser.bio) payload.bio = user.bio;
      if (user.username !== originalUser.username) payload.username = user.username;
      if (stagedAvatar !== null) payload.avatar = stagedAvatar;

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const updated = await saveProfile(payload);
      setOriginalUser(updated);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Profile update failed");
    }
  };

  const displayAvatar = stagedAvatar !== null ? stagedAvatar : user.avatar;
  const initials = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your display name, bio, and avatar</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Avatar Section */}
          <div className="flex items-center gap-5">
            <Avatar className="w-20 h-20">
              <AvatarImage src={displayAvatar || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <Label>Profile Picture</Label>
              <Input
                type="file"
                accept="image/*"
                disabled={isUpdating}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("Image must be smaller than 2 MB.");
                    return;
                  }
                  try {
                    const dataUrl = await new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(reader.result);
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                    setStagedAvatar(dataUrl);
                    toast.success("Avatar staged — click Update to save");
                  // eslint-disable-next-line no-unused-vars
                  } catch (_err) {
                    toast.error("Failed to process image.");
                  }
                }}
                className="cursor-pointer"
              />
              {(stagedAvatar !== null ? stagedAvatar !== "" : !!user.avatar) && (
                <button
                  type="button"
                  onClick={() => setStagedAvatar("")}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove Avatar
                </button>
              )}
            </div>
          </div>

          <Separator />

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={user.username || ""}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              disabled={isUpdating}
              placeholder="your-username"
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              type="text"
              value={user.name || ""}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              disabled={isUpdating}
              placeholder="Your Name"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="email">Email</Label>
              <Badge variant="secondary" className="text-xs">Read-only</Badge>
            </div>
            <Input
              id="email"
              type="text"
              value={user.email || ""}
              disabled
              className="opacity-60"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={user.bio || ""}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              disabled={isUpdating}
              placeholder="Tell readers a bit about yourself…"
              rows={4}
            />
          </div>

          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isUpdating ? "Updating…" : "Update Profile"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
