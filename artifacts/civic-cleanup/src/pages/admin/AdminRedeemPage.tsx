import { useState } from "react";
import { useGetRedeemItems, useCreateRedeemItem, getGetRedeemItemsQueryKey } from "@workspace/api-client-react";
import { Gift, Plus, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

export default function AdminRedeemPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", pointsCost: 100, stock: "", imageEmoji: "🎁" });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useGetRedeemItems();
  const createItem = useCreateRedeemItem();

  const items: any[] = (data as any)?.data || [];

  const handleCreate = () => {
    if (!form.title || !form.pointsCost) { toast({ title: "Title and cost required", variant: "destructive" }); return; }
    createItem.mutate({ data: { ...form, stock: form.stock ? parseInt(form.stock) : undefined } }, {
      onSuccess: () => {
        toast({ title: "Item created!" });
        setOpen(false);
        setForm({ title: "", description: "", pointsCost: 100, stock: "", imageEmoji: "🎁" });
        qc.invalidateQueries({ queryKey: getGetRedeemItemsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Redeem Items">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Redeem Catalog</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>{items.length} item{items.length !== 1 ? "s" : ""} available · Citizens spend points to redeem</div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="gov-btn gov-btn-primary" style={{ display: "flex", alignItems: "center", gap: 5 }} data-testid="button-new-item">
                <Plus style={{ width: 13, height: 13 }} /> New Item
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Redeem Item</DialogTitle></DialogHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
                  <div>
                    <label className="gov-label">Emoji</label>
                    <input className="gov-input" style={{ textAlign: "center", fontSize: 20 }} value={form.imageEmoji} onChange={e => setForm(f => ({ ...f, imageEmoji: e.target.value }))} data-testid="input-emoji" />
                  </div>
                  <div>
                    <label className="gov-label">Title <span style={{ color: "#c0392b" }}>*</span></label>
                    <input className="gov-input" placeholder="e.g. Reusable Bag" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} data-testid="input-item-title" />
                  </div>
                </div>
                <div>
                  <label className="gov-label">Description</label>
                  <input className="gov-input" placeholder="Brief description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} data-testid="input-item-desc" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="gov-label">Points Cost <span style={{ color: "#c0392b" }}>*</span></label>
                    <input className="gov-input" type="number" value={form.pointsCost} onChange={e => setForm(f => ({ ...f, pointsCost: parseInt(e.target.value) || 100 }))} data-testid="input-points-cost" />
                  </div>
                  <div>
                    <label className="gov-label">Stock (optional)</label>
                    <input className="gov-input" type="number" placeholder="Unlimited" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} data-testid="input-stock" />
                  </div>
                </div>
                <button className="gov-btn gov-btn-primary" style={{ width: "100%" }} onClick={handleCreate} disabled={createItem.isPending} data-testid="button-create-item">
                  {createItem.isPending ? "Creating…" : "Create Item"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { icon: "🎁", label: "Total Items",    value: items.length,                            color: "#6c3483" },
            { icon: "📦", label: "In Stock",       value: items.filter(i => i.stock === null || i.stock > 0).length, color: "#1e8449" },
            { icon: "⭐", label: "Min Cost",       value: items.length ? `${Math.min(...items.map(i => i.pointsCost))} pts` : "—", color: "#b7950b" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Items table ── */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Gift style={{ width: 14, height: 14, color: "#b7950b" }} />
              <span className="gov-section-title">Reward Items</span>
            </div>
          </div>
          {isLoading ? (
            <div style={{ padding: 18 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 52, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Gift style={{ width: 32, height: 32, color: "#909caa", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: "#5d6d7e", marginBottom: 12 }}>No redeem items yet. Create the first one!</div>
              <button className="gov-btn gov-btn-primary gov-btn-sm" onClick={() => setOpen(true)}>Create Item</button>
            </div>
          ) : (
            <table className="gov-table">
              <thead>
                <tr><th>Item</th><th>Description</th><th>Cost</th><th>Stock</th><th>Status</th></tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} data-testid={`redeem-admin-${item.id}`}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 3, background: "#fef9e7", border: "1px solid #f9e79f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                          {item.imageEmoji || "🎁"}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1c2833" }}>{item.title}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "#5d6d7e" }}>{item.description || "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 800, color: "#b7950b" }}>
                        <Star style={{ width: 12, height: 12 }} />{item.pointsCost} pts
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "#1c2833" }}>
                      {item.stock !== null ? item.stock : <span style={{ color: "#5d6d7e" }}>Unlimited</span>}
                    </td>
                    <td>
                      {item.stock === null || item.stock > 0
                        ? <span className="gov-badge gov-badge-green">Available</span>
                        : <span className="gov-badge gov-badge-red">Out of Stock</span>}
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
