import { useState } from "react";
import { useGetTrainingModules, useCreateTrainingModule, getGetTrainingModulesQueryKey } from "@workspace/api-client-react";
import { BookOpen, Plus, Clock, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

export default function AdminTrainingPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", durationMinutes: 15, lessonCount: 3 });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useGetTrainingModules();
  const createModule = useCreateTrainingModule();

  const modules: any[] = (data as any)?.data || [];

  const handleCreate = () => {
    if (!form.title) { toast({ title: "Title required", variant: "destructive" }); return; }
    createModule.mutate({ data: { ...form, sortOrder: modules.length } }, {
      onSuccess: () => {
        toast({ title: "Module created!" });
        setOpen(false);
        setForm({ title: "", description: "", durationMinutes: 15, lessonCount: 3 });
        qc.invalidateQueries({ queryKey: getGetTrainingModulesQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Training Modules">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Training Modules</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>{modules.length} module{modules.length !== 1 ? "s" : ""} · Citizens earn 75 pts on completion</div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="gov-btn gov-btn-primary" style={{ display: "flex", alignItems: "center", gap: 5 }} data-testid="button-new-module">
                <Plus style={{ width: 13, height: 13 }} /> New Module
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Training Module</DialogTitle></DialogHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
                <div>
                  <label className="gov-label">Title <span style={{ color: "#c0392b" }}>*</span></label>
                  <input className="gov-input" placeholder="e.g. Waste Segregation Basics" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} data-testid="input-module-title" />
                </div>
                <div>
                  <label className="gov-label">Description</label>
                  <input className="gov-input" placeholder="Brief description of this module" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} data-testid="input-module-desc" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="gov-label">Duration (minutes)</label>
                    <input className="gov-input" type="number" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) || 15 }))} data-testid="input-duration" />
                  </div>
                  <div>
                    <label className="gov-label">Lesson Count</label>
                    <input className="gov-input" type="number" value={form.lessonCount} onChange={e => setForm(f => ({ ...f, lessonCount: parseInt(e.target.value) || 3 }))} data-testid="input-lesson-count" />
                  </div>
                </div>
                <button className="gov-btn gov-btn-primary" style={{ width: "100%" }} onClick={handleCreate} disabled={createModule.isPending} data-testid="button-create-module">
                  {createModule.isPending ? "Creating…" : "Create Module"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { icon: "📚", label: "Total Modules",   value: modules.length,                                                     color: "#1a5276" },
            { icon: "⏱️", label: "Total Hours",      value: `${(modules.reduce((s: number, m: any) => s + (m.durationMinutes || 0), 0) / 60).toFixed(1)}h`, color: "#1e8449" },
            { icon: "🏆", label: "Total Pts Avail.", value: modules.length * 75,                                               color: "#b7950b" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Modules table ── */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen style={{ width: 14, height: 14, color: "#1a5276" }} />
              <span className="gov-section-title">Module Catalogue</span>
            </div>
          </div>
          {isLoading ? (
            <div style={{ padding: 18 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 52, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
            </div>
          ) : modules.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <BookOpen style={{ width: 32, height: 32, color: "#909caa", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: "#5d6d7e", marginBottom: 12 }}>No training modules yet. Create the first one!</div>
              <button className="gov-btn gov-btn-primary gov-btn-sm" onClick={() => setOpen(true)}>Create Module</button>
            </div>
          ) : (
            <table className="gov-table">
              <thead>
                <tr><th>#</th><th>Module Title</th><th>Description</th><th>Duration</th><th>Lessons</th><th>Reward</th></tr>
              </thead>
              <tbody>
                {modules.map((m: any, i: number) => (
                  <tr key={m.id} data-testid={`module-admin-${m.id}`}>
                    <td>
                      <div style={{ width: 28, height: 28, borderRadius: 3, background: "#eaf2f8", border: "1px solid #aed6f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1a5276" }}>
                        {i + 1}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2833" }}>{m.title}</div>
                    </td>
                    <td style={{ fontSize: 12, color: "#5d6d7e" }}>{m.description || "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5d6d7e" }}>
                        <Clock style={{ width: 11, height: 11 }} />{m.durationMinutes} min
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5d6d7e" }}>
                        <Layers style={{ width: 11, height: 11 }} />{m.lessonCount}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: "#1e8449", fontSize: 12 }}>+75 pts</td>
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
