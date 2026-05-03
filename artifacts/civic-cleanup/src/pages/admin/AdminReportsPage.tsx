import { useState } from "react";
import { useGetReports, useUpdateReport, getGetReportsQueryKey } from "@workspace/api-client-react";
import { Camera, MapPin, Filter, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

const STATUS_BADGE: Record<string, string> = {
  completed: "gov-badge gov-badge-green",
  pending:   "gov-badge gov-badge-yellow",
  assigned:  "gov-badge gov-badge-blue",
  rejected:  "gov-badge gov-badge-red",
};

const PRIORITY_BADGE: Record<string, string> = {
  urgent: "gov-badge gov-badge-red",
  high:   "gov-badge gov-badge-orange",
  normal: "gov-badge gov-badge-gray",
  low:    "gov-badge gov-badge-gray",
};

export default function AdminReportsPage() {
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const qc = useQueryClient();

  const params = filter !== "all" ? { status: filter } : {};
  const { data, isLoading } = useGetReports(params as any);
  const updateReport = useUpdateReport();

  const reports: any[] = (data as any)?.data || [];

  const handleStatus = (id: string, status: string) => {
    updateReport.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: `Report ${status}` });
        qc.invalidateQueries({ queryKey: getGetReportsQueryKey(params as any) });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const pending   = reports.filter(r => r.status === "pending").length;
  const assigned  = reports.filter(r => r.status === "assigned").length;
  const completed = reports.filter(r => r.status === "completed").length;

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Manage Reports">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Waste Report Management</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>Review, assign and resolve all citizen waste reports</div>
          </div>
          {pending > 0 && (
            <div className="gov-alert gov-alert-red" style={{ padding: "6px 12px", margin: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{pending} reports awaiting assignment</span>
            </div>
          )}
        </div>

        {/* ── Summary stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "Total Reports", value: reports.length, icon: "📋", color: "#1a5276" },
            { label: "Pending",       value: pending,        icon: "⏳", color: "#b7950b" },
            { label: "Assigned",      value: assigned,       icon: "🔧", color: "#1a5276" },
            { label: "Completed",     value: completed,      icon: "✅", color: "#1e8449" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filter + Table ── */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Camera style={{ width: 14, height: 14, color: "#c0392b" }} />
              <span className="gov-section-title">All Reports</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Filter style={{ width: 13, height: 13, color: "#5d6d7e" }} />
              <select
                className="gov-select"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                data-testid="select-status-filter"
                style={{ minWidth: 150 }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <span style={{ fontSize: 11, color: "#5d6d7e" }}>{reports.length} report{reports.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: 18 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ height: 56, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
            </div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Camera style={{ width: 32, height: 32, color: "#909caa", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: "#5d6d7e" }}>No reports found.</div>
            </div>
          ) : (
            <table className="gov-table">
              <thead>
                <tr><th>Waste Type</th><th>Location</th><th>Reporter</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reports.map((r: any) => (
                  <tr key={r.id} data-testid={`admin-report-${r.id}`}>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 700, textTransform: "capitalize", color: "#1c2833" }}>{r.wasteType} waste</div>
                      {r.description && <div style={{ fontSize: 11, color: "#5d6d7e" }}>{r.description}</div>}
                    </td>
                    <td style={{ fontSize: 12, color: "#5d6d7e" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin style={{ width: 10, height: 10 }} />{r.address || "No address"}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "#5d6d7e" }}>{r.reporterName || "Unknown"}</td>
                    <td>
                      {r.priority && r.priority !== "normal"
                        ? <span className={PRIORITY_BADGE[r.priority] || "gov-badge gov-badge-gray"} style={{ textTransform: "capitalize" }}>{r.priority}</span>
                        : <span style={{ fontSize: 11, color: "#909caa" }}>Normal</span>}
                    </td>
                    <td><span className={STATUS_BADGE[r.status] || STATUS_BADGE.pending}>{r.status}</span></td>
                    <td style={{ fontSize: 11, color: "#909caa", whiteSpace: "nowrap" }}>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {r.status === "pending" && (
                          <button className="gov-btn gov-btn-primary gov-btn-xs" onClick={() => handleStatus(r.id, "assigned")} disabled={updateReport.isPending}>
                            Assign
                          </button>
                        )}
                        {(r.status === "pending" || r.status === "assigned") && (
                          <button className="gov-btn gov-btn-green gov-btn-xs" style={{ display: "flex", alignItems: "center", gap: 3 }} onClick={() => handleStatus(r.id, "completed")} disabled={updateReport.isPending}>
                            <CheckCircle style={{ width: 10, height: 10 }} />Done
                          </button>
                        )}
                        {r.status === "pending" && (
                          <button className="gov-btn gov-btn-red gov-btn-xs" style={{ display: "flex", alignItems: "center", gap: 3 }} onClick={() => handleStatus(r.id, "rejected")} disabled={updateReport.isPending}>
                            <XCircle style={{ width: 10, height: 10 }} />Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
