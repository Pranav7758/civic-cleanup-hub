import { useGetAdminUsers, useUpdateUserRoles, getGetAdminUsersQueryKey } from "@workspace/api-client-react";
import { Users, Shield, Search } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

const ALL_ROLES = ["citizen", "worker", "ngo", "scrap_dealer", "admin"];

const ROLE_BADGE: Record<string, string> = {
  citizen:      "gov-badge gov-badge-green",
  worker:       "gov-badge gov-badge-blue",
  ngo:          "gov-badge gov-badge-orange",
  scrap_dealer: "gov-badge gov-badge-yellow",
  admin:        "gov-badge gov-badge-purple",
};

const ROLE_COLOR: Record<string, string> = {
  citizen: "#1e8449", worker: "#1a5276", ngo: "#ca6f1e", scrap_dealer: "#b7950b", admin: "#6c3483",
};

export default function AdminUsersPage() {
  const [search,    setSearch]    = useState("");
  const [editUser,  setEditUser]  = useState<any>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useGetAdminUsers();
  const updateRoles = useUpdateUserRoles();

  const users:    any[] = (data as any)?.data || [];
  const filtered        = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit   = (u: any) => { setEditUser(u); setEditRoles(u.roles || []); };
  const toggleRole = (r: string) => setEditRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const handleSaveRoles = () => {
    updateRoles.mutate({ id: editUser.id, data: { roles: editRoles } }, {
      onSuccess: () => {
        toast({ title: "Roles updated!" });
        setEditUser(null);
        qc.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const primaryRole = (roles: string[]) => {
    if (roles.includes("admin"))        return "admin";
    if (roles.includes("worker"))       return "worker";
    if (roles.includes("ngo"))          return "ngo";
    if (roles.includes("scrap_dealer")) return "scrap_dealer";
    return "citizen";
  };

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Manage Users">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>User Management</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>{users.length} registered users · Manage roles and permissions</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="gov-badge gov-badge-green">{users.filter(u => u.roles?.includes("citizen")).length} Citizens</span>
            <span className="gov-badge gov-badge-blue">{users.filter(u => u.roles?.includes("worker")).length} Workers</span>
            <span className="gov-badge gov-badge-purple">{users.filter(u => u.roles?.includes("admin")).length} Admins</span>
          </div>
        </div>

        {/* ── Search + table ── */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users style={{ width: 14, height: 14, color: "#1a5276" }} />
              <span className="gov-section-title">All Users ({filtered.length})</span>
            </div>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #d5dae1", borderRadius: 3, padding: "4px 10px", background: "#fff" }}>
              <Search style={{ width: 13, height: 13, color: "#909caa" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                style={{ border: "none", outline: "none", fontSize: 12, color: "#1c2833", width: 200, background: "transparent" }}
                data-testid="input-search"
              />
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: 18 }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ height: 48, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
              <div style={{ fontSize: 13, color: "#5d6d7e" }}>No users found.</div>
            </div>
          ) : (
            <table className="gov-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Roles</th><th>Joined</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map((u: any) => {
                  const role = primaryRole(u.roles || []);
                  return (
                    <tr key={u.id} data-testid={`user-row-${u.id}`}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 3, flexShrink: 0,
                            background: ROLE_COLOR[role] || "#1a5276",
                            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 800,
                          }}>
                            {u.fullName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2833" }}>{u.fullName}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>{u.email}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {(u.roles || []).map((r: string) => (
                            <span key={r} className={ROLE_BADGE[r] || "gov-badge gov-badge-gray"} style={{ fontSize: 10, textTransform: "capitalize" }}>
                              {r.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: 11, color: "#909caa" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td>
                        <button
                          onClick={() => openEdit(u)}
                          className="gov-btn gov-btn-outline gov-btn-xs"
                          style={{ display: "flex", alignItems: "center", gap: 4 }}
                          data-testid={`button-edit-${u.id}`}
                        >
                          <Shield style={{ width: 11, height: 11 }} /> Edit Roles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Edit roles dialog ── */}
        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Roles: {editUser?.fullName}</DialogTitle></DialogHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
              <div style={{ fontSize: 12, color: "#5d6d7e", marginBottom: 4 }}>
                Select all roles for this user:
              </div>
              {ALL_ROLES.map(r => (
                <div key={r} data-testid={`role-toggle-${r}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    border: `1px solid ${editRoles.includes(r) ? "#1a5276" : "#d5dae1"}`,
                    borderRadius: 3, background: editRoles.includes(r) ? "#eaf2f8" : "#fff",
                    cursor: "pointer", transition: "all .1s",
                  }}
                  onClick={() => toggleRole(r)}
                >
                  <Checkbox id={`role-${r}`} checked={editRoles.includes(r)} onCheckedChange={() => toggleRole(r)} />
                  <Label htmlFor={`role-${r}`} className="cursor-pointer flex-1" style={{ color: "#1c2833", fontWeight: 600, textTransform: "capitalize" }}>
                    {r.replace(/_/g, " ")}
                  </Label>
                  <span className={ROLE_BADGE[r] || "gov-badge gov-badge-gray"} style={{ fontSize: 10, textTransform: "capitalize" }}>
                    {r.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
              <button className="gov-btn gov-btn-primary" style={{ width: "100%", marginTop: 6 }} onClick={handleSaveRoles} disabled={updateRoles.isPending} data-testid="button-save-roles">
                {updateRoles.isPending ? "Saving…" : "Save Roles"}
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
