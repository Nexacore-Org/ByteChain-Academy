"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, LogOut, Save, Settings, User, CheckCircle, Sparkles, Shield, Mail } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import { WalletConnectCard } from "@/components/wallet/wallet-connect-card";

export default function SettingsPage() {
  const { isAuthenticated, logout } = useAuth();
  const {
    user,
    notificationPreferences,
    updateProfile,
    updateNotificationPreferences,
    loadUserData,
  } = useUser();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [courseUpdates, setCourseUpdates] = useState(false);
  const [newLessonsAvailable, setNewLessonsAvailable] = useState(false);
  const [achievementAlerts, setAchievementAlerts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const memoizedLoadUserData = useCallback(() => {
    void loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else {
      memoizedLoadUserData();
    }
  }, [isAuthenticated, router, memoizedLoadUserData]);

  useEffect(() => {
    if (!user) return;
    setUsername(user.fullName);
    setBio(user.bio ?? "");
  }, [user]);

  useEffect(() => {
    setCourseUpdates(notificationPreferences.courseUpdates);
    setNewLessonsAvailable(notificationPreferences.newLessonsAvailable);
    setAchievementAlerts(notificationPreferences.achievementAlerts);
  }, [notificationPreferences]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      username !== user.fullName ||
      bio !== (user.bio ?? "") ||
      courseUpdates !== notificationPreferences.courseUpdates ||
      newLessonsAvailable !== notificationPreferences.newLessonsAvailable ||
      achievementAlerts !== notificationPreferences.achievementAlerts
    );
  }, [
    achievementAlerts,
    bio,
    courseUpdates,
    newLessonsAvailable,
    notificationPreferences.achievementAlerts,
    notificationPreferences.courseUpdates,
    notificationPreferences.newLessonsAvailable,
    user,
    username,
  ]);

  const onSave = async () => {
    if (!user || !hasChanges) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({ fullName: username, bio });
      await updateNotificationPreferences({
        courseUpdates,
        newLessonsAvailable,
        achievementAlerts,
      });
      toast.success("Settings updated");
      setSaveSuccess(true);
      await loadUserData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const onLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12">Loading...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-[#00ff88]" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-gray-400">Manage your profile and notifications.</p>
        </div>

        <Card className="mb-6 border-white/10 bg-[#080e22]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4 text-[#00ff88]" />
              Profile Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="flex w-full rounded-lg bg-[#0b1327] border border-white/10 px-4 py-3 text-sm text-[#8ca4bb] placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]"
                placeholder="Tell other learners something about yourself"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <WalletConnectCard />
        </div>

        <Card className="mb-6 border-white/10 bg-[#080e22]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#00ff88]" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-[#0b1327]">
              <Checkbox checked={courseUpdates} onCheckedChange={(checked) => setCourseUpdates(!!checked)} />
              <div>
                <p className="text-sm font-medium text-white">Course updates</p>
                <p className="text-xs text-gray-400">Alerts for major updates in your enrolled courses.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-[#0b1327]">
              <Checkbox
                checked={newLessonsAvailable}
                onCheckedChange={(checked) => setNewLessonsAvailable(!!checked)}
              />
              <div>
                <p className="text-sm font-medium text-white">New lessons</p>
                <p className="text-xs text-gray-400">Get notified when fresh lesson content is published.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-[#0b1327]">
              <Checkbox
                checked={achievementAlerts}
                onCheckedChange={(checked) => setAchievementAlerts(!!checked)}
              />
              <div>
                <p className="text-sm font-medium text-white">Achievement alerts</p>
                <p className="text-xs text-gray-400">Badges, XP milestones, and certificate unlocks.</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <Card className="mb-8 border-red-500/30 bg-[#130b0b]">
          <CardHeader>
            <CardTitle className="text-lg text-red-300">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-white">Signed in as {user.email}</p>
              <p className="text-xs text-gray-400">This will clear your local session.</p>
            </div>
            <Button variant="destructive" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#080e22] to-[#0a0a0a] border border-[#00ff88]/20">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <div className="flex items-center gap-2 text-[#00ff88] animate-in fade-in slide-in-from-left-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Changes saved successfully!
                </span>
              </div>
            )}
            {hasChanges && !saveSuccess && (
              <div className="flex items-center gap-2 text-yellow-500">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">You have unsaved changes</span>
              </div>
            )}
          </div>
          <Button onClick={() => void onSave()} disabled={!hasChanges || isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </main>
    </div>
  );
}

