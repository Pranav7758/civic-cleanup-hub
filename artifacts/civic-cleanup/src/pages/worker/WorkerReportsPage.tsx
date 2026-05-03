import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  MapPin, Clock, CheckCircle2, Play, AlertTriangle,
  ClipboardList, RefreshCw, Loader2, Package,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import "@/styles/dashboard.css";

const WASTE_EMOJI: Record<string, string> = {
  mixed: "🗑️", organic: "🌿", plastic: "♻️", metal: "🔩",
  hazardous: "☠️", ewaste: "💻", construction: "🏗️",
};
const PR_COLOR: Record<string, string> = {
  high: "#c62828", urgent: "#6a1a1a", normal: "#e65100", low: "#2e7d32",
};
const PR_LABEL: Record<string, string> = {
  high: "Urgent", urgent: "Critical", normal: "Normal", low: "Low",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function authFetch(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("civic_token");
  return fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
}

type Tab = "available" | "my-tasks";

export default function WorkerReportsPage() {
  const [tab, setTab] = useState<Tab>("available");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["worker-tasks"],
    queryFn: async () => {
      const res = await authFetch("/api/reports/worker-tasks");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const available: any[] = data?.data?.available || [];
  const myTasks: any[]   = data?.data?.myTasks   || [];
  const stats             = data?.data?.stats     || {};

  const claimMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await authFetch(`/api/reports/${reportId}/claim`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept task");
      return res.json();
    },
    onSuccess: (_, reportId) => {
      toast({ title: "✅ Task accepted!", description: "Navigate to the location and collect waste." });
      qc.invalidateQueries({ queryKey: ["worker-tasks"] });
      setLocation(`/worker/task/${reportId}`);
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const currentList = tab === "available" ? available : myTasks;

  const S: React.CSSProperties = { fontFamily: "'Inter','Roboto',Arial,sans-serif" };

  return (
    <DashboardLayout title="Assigned Reports">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Stats + header ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "Available Tasks",  value: available.length, color: "#ea580c", icon: "📋" },
            { label: "My Assigned",      value: myTasks.length,   color: "#7c3aed", icon: "🚛" },
            { label: "Completed Total",  value: stats.completedTotal ?? 0, color: "#1e8449", icon: "✅" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ padding: "14px 16px" }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="gov-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #d5dae1" }}>
            {([
              { key: "available", label: "Available Tasks", count: available.length, color: "#ea580c" },
              { key: "my-tasks",  label: "My Tasks",        count: myTasks.length,   color: "#7c3aed" },
            ] as { key: Tab; label: string; count: number; color: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: "14px 16px", border: "none", cursor: "pointer",
                  fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13,
                  background: tab === t.key ? "#fff" : "#f8fffe",
                  color: tab === t.key ? t.color : "#5d6d7e",
                  borderBottom: tab === t.key ? `2px solid ${t.color}` : "2px solid transparent",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {t.label}
                <span style={{
                  background: tab === t.key ? t.color : "#e0e0e0",
                  color: tab === t.key ? "#fff" : "#5d6d7e",
                  fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999,
                }}>
                  {t.count}
                </span>
              </button>
            ))}
            <button
              onClick={() => refetch()}
              style={{ padding: "0 16px", background: "#f8fffe", border: "none", borderLeft: "1px solid #d5dae1", cursor: "pointer", color: "#5d6d7e" }}
              title="Refresh"
            >
              <RefreshCw style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* ── Task list ── */}
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {isLoading && (
              <div style={{ textAlign: "center", padding: 40, color: "#5d6d7e" }}>
                <Loader2 style={{ width: 24, height: 24, margin: "0 auto 8px", animation: "spin 1s linear infinite", display: "block" }} />
                Loading tasks…
              </div>
            )}

            {!isLoading && currentList.length === 0 && (
              <div style={{ textAlign: "center", padding: 48 }}>
                <Package style={{ width: 36, height: 36, color: "#c8e6c9", margin: "0 auto 12px", display: "block" }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: "#5d6d7e" }}>
                  {tab === "available" ? "No available tasks right now" : "No tasks assigned to you yet"}
                </div>
                <div style={{ fontSize: 12, color: "#909caa", marginTop: 4 }}>
                  {tab === "available" ? "Check back soon — citizens are actively reporting!" : "Accept tasks from the Available Tasks tab"}
                </div>
              </div>
            )}

            {!isLoading && currentList.map((report: any) => {
              const prColor = PR_COLOR[report.priority] || PR_COLOR.normal;
              const isMyTask = tab === "my-tasks";
              return (
                <div
                  key={report.id}
                  style={{
                    display: "grid", gridTemplateColumns: "4px 1fr auto",
                    border: "1px solid #d5dae1", borderRadius: 10, overflow: "hidden",
                    background: "#fff",
                    boxShadow: "3px 3px 8px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "4px 5px 14px rgba(0,0,0,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "3px 3px 8px rgba(0,0,0,0.04)")}
                >
                  {/* Priority stripe */}
                  <div style={{ background: prColor }} />

                  {/* Main content */}
                  <div style={{ padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {/* Photo thumbnail */}
                    <div style={{
                      width: 60, height: 60, borderRadius: 8, flexShrink: 0, overflow: "hidden",
                      background: "linear-gradient(145deg,#e8f5e9,#c8e6c9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid #d5dae1",
                    }}>
                      {report.imageUrl ? (
                        <img src={report.imageUrl} alt="waste" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 26 }}>{WASTE_EMOJI[report.wasteType] || "🗑️"}</span>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#1c2833", fontFamily: "'Inter',sans-serif", textTransform: "capitalize" }}>
                          {report.wasteType} Waste
                        </span>
                        <span style={{ background: prColor, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                          {PR_LABEL[report.priority] || "Normal"}
                        </span>
                        {isMyTask && (
                          <span style={{ background: "#e8eaf6", color: "#5e35b1", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                            MY TASK
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5, fontSize: 12, color: "#5d6d7e" }}>
                        <MapPin style={{ width: 11, height: 11, flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {report.address || "Address not specified"}
                        </span>
                      </div>
                      {report.description && (
                        <div style={{ fontSize: 11, color: "#909caa", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {report.description}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontSize: 11, color: "#909caa" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock style={{ width: 10, height: 10 }} /> {timeAgo(report.createdAt)}
                        </span>
                        {report.reporterName && (
                          <span>by <strong style={{ color: "#5d6d7e" }}>{report.reporterName}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, borderLeft: "1px solid #f0f4f0" }}>
                    {tab === "available" && (
                      <button
                        className="gov-btn gov-btn-primary gov-btn-sm"
                        style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
                        disabled={claimMutation.isPending}
                        onClick={() => claimMutation.mutate(report.id)}
                      >
                        {claimMutation.isPending
                          ? <Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} />
                          : <CheckCircle2 style={{ width: 11, height: 11 }} />
                        }
                        Accept Task
                      </button>
                    )}
                    {tab === "my-tasks" && (
                      <button
                        className="gov-btn gov-btn-green gov-btn-sm"
                        style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
                        onClick={() => setLocation(`/worker/task/${report.id}`)}
                      >
                        <Play style={{ width: 11, height: 11 }} /> Start Task
                      </button>
                    )}
                    <div style={{ fontSize: 10, color: "#c8e6c9", textAlign: "center" }}>
                      {report.rewardPoints || 50} pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info tip */}
        {tab === "available" && !isLoading && available.length > 0 && (
          <div style={{ background: "linear-gradient(145deg,#e8f5e9,#f1f8e9)", border: "1px solid #a5d6a7", borderRadius: 10, padding: "10px 16px", fontSize: 12, color: "#2e7d32", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle style={{ width: 13, height: 13, flexShrink: 0 }} />
            Accept a task to claim it exclusively. Navigate to the location, collect the waste, upload proof, and mark done to earn points.
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
