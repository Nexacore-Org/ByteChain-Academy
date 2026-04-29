"use client";

import { useState } from "react";
import { MyCertificatesContent } from "@/components/profile/my-certificates-content";
import { 
  Award, 
  Activity, 
  FileCheck, 
  ChevronRight,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type TabKey = "certificates" | "badges" | "activity";

interface ProfileTabsProps {
  badgesCount: number;
  lastActiveAt?: string | null;
}

export function ProfileTabs({ badgesCount, lastActiveAt }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("certificates");

  const tabs = [
    { id: "certificates", label: "Certificates", icon: FileCheck },
    { id: "badges", label: "Badges", icon: Award },
    { id: "activity", label: "Activity", icon: Activity },
  ] as const;

  return (
    <Card className="border-white/10 bg-[#0d0d0d] rounded-3xl overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        <div className="flex border-b border-white/5 p-1 bg-white/[0.02]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                  isActive ? "text-green-500" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-green-500" : "text-gray-600"}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6 md:p-8">
          {activeTab === "certificates" && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <MyCertificatesContent />
             </div>
          )}

          {activeTab === "badges" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {/* Mock Badges for Visual Excellence */}
                 {[
                   { name: "First Steps", color: "text-blue-400", bg: "bg-blue-400/10" },
                   { name: "Quiz Master", color: "text-yellow-400", bg: "bg-yellow-400/10" },
                   { name: "Code Ninja", color: "text-purple-400", bg: "bg-purple-400/10" },
                   { name: "Explorer", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                 ].slice(0, Math.max(1, badgesCount)).map((badge, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                       <div className={`w-12 h-12 rounded-xl ${badge.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                          <Award className={`w-6 h-6 ${badge.color}`} />
                       </div>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter text-center">{badge.name}</span>
                    </div>
                 ))}
                 
                 {badgesCount === 0 && (
                   <div className="col-span-full py-12 text-center space-y-3">
                      <Award className="w-12 h-12 text-gray-800 mx-auto" />
                      <p className="text-gray-500 text-sm font-medium">No badges earned yet.</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
               {lastActiveAt ? (
                 <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                       <Activity className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-white uppercase tracking-tight">Last Session Active</p>
                       <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-medium">
                          <Calendar className="w-3 h-3" />
                          {new Date(lastActiveAt).toLocaleString()}
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-green-500 transition-colors" />
                 </div>
               ) : (
                 <div className="py-12 text-center space-y-3">
                    <ShieldCheck className="w-12 h-12 text-gray-800 mx-auto" />
                    <p className="text-gray-500 text-sm font-medium">No recent activity detected.</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
