"use client";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Settings,
  User,
  Bell,
  Save,
  CheckCircle,
  Sparkles,
  Mail,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const {
    user,
    notificationPreferences,
    updateProfile,
    updateNotificationPreferences,
    loadUserData,
  } = useUser();
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [courseUpdates, setCourseUpdates] = useState(false);
  const [newLessonsAvailable, setNewLessonsAvailable] = useState(false);
  const [achievementAlerts, setAchievementAlerts] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  // Initialize form state when user data loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    setCourseUpdates(notificationPreferences.courseUpdates);
    setNewLessonsAvailable(notificationPreferences.newLessonsAvailable);
    setAchievementAlerts(notificationPreferences.achievementAlerts);
  }, [notificationPreferences]);

  // Track changes
  useEffect(() => {
    if (!user) return;

    const profileChanged = fullName !== user.fullName || email !== user.email;
    const prefsChanged =
      courseUpdates !== notificationPreferences.courseUpdates ||
      newLessonsAvailable !== notificationPreferences.newLessonsAvailable ||
      achievementAlerts !== notificationPreferences.achievementAlerts;

    setHasChanges(profileChanged || prefsChanged);
    setSaveSuccess(false);
  }, [
    fullName,
    email,
    courseUpdates,
    newLessonsAvailable,
    achievementAlerts,
    user,
    notificationPreferences,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update profile
    updateProfile({ fullName, email });

    // Update notification preferences
    updateNotificationPreferences({
      courseUpdates,
      newLessonsAvailable,
      achievementAlerts,
    });

    setIsSaving(false);
    setSaveSuccess(true);
    setHasChanges(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-800 rounded mx-auto mb-4"></div>
            <div className="h-4 w-64 bg-gray-800 rounded mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
              <Settings className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
          </div>
          <p className="text-gray-400">
            Manage your account settings and notification preferences
          </p>
        </div>

        {/* Account Information */}
        <Card className="mb-8 relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-[#00ff88]/5" />
          <CardHeader className="relative">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-[#00ff88]" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="flex items-center gap-2 text-sm font-medium text-gray-300"
              >
                <User className="w-4 h-4 text-gray-400" />
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-[#0b1327] border-white/10 focus:border-[#00ff88]"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium text-gray-300"
              >
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-[#0b1327] border-white/10 focus:border-[#00ff88]"
              />
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Shield className="w-4 h-4 text-gray-400" />
                Role
              </label>
              <div className="flex items-center gap-2 h-12 px-4 rounded-lg bg-[#0b1327]/50 border border-white/5 text-gray-400">
                <span>{user.role}</span>
                <span className="text-xs bg-[#00ff88]/10 text-[#00ff88] px-2 py-0.5 rounded ml-auto">
                  Read-only
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="mb-8 relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-[#00ff88]/5" />
          <CardHeader className="relative">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00ff88]" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <p className="text-sm text-gray-400 mb-4">
              Choose which notifications you&apos;d like to receive. These are
              UI-only preferences.
            </p>

            <div className="space-y-4">
              {/* Course Updates */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5 hover:border-white/10 transition-colors">
                <Checkbox
                  id="courseUpdates"
                  checked={courseUpdates}
                  onChange={(e) => setCourseUpdates(e.target.checked)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="courseUpdates"
                    className="text-sm font-medium text-white cursor-pointer"
                  >
                    Course Updates
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Receive notifications when courses you&apos;re enrolled in
                    are updated with new content
                  </p>
                </div>
              </div>

              {/* New Lessons Available */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5 hover:border-white/10 transition-colors">
                <Checkbox
                  id="newLessons"
                  checked={newLessonsAvailable}
                  onChange={(e) => setNewLessonsAvailable(e.target.checked)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="newLessons"
                    className="text-sm font-medium text-white cursor-pointer"
                  >
                    New Lessons Available
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Get notified when new lessons are added to courses
                    you&apos;re interested in
                  </p>
                </div>
              </div>

              {/* Achievement Alerts */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5 hover:border-white/10 transition-colors">
                <Checkbox
                  id="achievements"
                  checked={achievementAlerts}
                  onChange={(e) => setAchievementAlerts(e.target.checked)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="achievements"
                    className="text-sm font-medium text-white cursor-pointer"
                  >
                    Achievement Alerts
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Get notified when you earn badges, certificates, or reach
                    milestones
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
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

          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-2 bg-gradient-to-r from-[#00ff88] to-[#00d88b] text-[#002E20] hover:from-[#00d88b] hover:to-[#00ff88] disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-[#002E20]/30 border-t-[#002E20] rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
