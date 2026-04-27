"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MyCertificatesContent } from "@/components/profile/my-certificates-content";

type TabKey = "certificates" | "badges" | "activity";

interface ProfileTabsProps {
  badgesCount: number;
  lastActiveAt?: string | null;
}

export function ProfileTabs({ badgesCount, lastActiveAt }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("certificates");

  return (
    <Card className="border-white/10 bg-[#080e22]">
      <CardContent className="p-0">
        <div className="border-b border-white/10 p-2 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeTab === "certificates" ? "default" : "ghost"}
            onClick={() => setActiveTab("certificates")}
          >
            My Certificates
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeTab === "badges" ? "default" : "ghost"}
            onClick={() => setActiveTab("badges")}
          >
            My Badges
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeTab === "activity" ? "default" : "ghost"}
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </Button>
        </div>

        <div className="p-6">
          {activeTab === "certificates" && <MyCertificatesContent />}

          {activeTab === "badges" && (
            <div className="rounded-lg border border-white/10 bg-[#0b1327] p-5">
              <p className="text-white font-medium mb-1">Badges earned</p>
              <p className="text-gray-400 text-sm">You currently have {badgesCount} badges.</p>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="rounded-lg border border-white/10 bg-[#0b1327] p-5">
              <p className="text-white font-medium mb-1">Recent activity</p>
              <p className="text-gray-400 text-sm">
                {lastActiveAt
                  ? `Last active on ${new Date(lastActiveAt).toLocaleString()}`
                  : "No recent activity available yet."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
