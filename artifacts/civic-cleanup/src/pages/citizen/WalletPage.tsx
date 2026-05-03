import { useState } from "react";
import {
  useGetWalletTransactions,
  useGetCleanlinessScore,
  useGetGovernmentBenefits,
  useGetRedeemItems,
  useRedeemItem,
  getGetWalletTransactionsQueryKey,
  getGetCleanlinessScoreQueryKey,
  getGetRedeemItemsQueryKey,
} from "@workspace/api-client-react";
import {
  Wallet, ArrowUpRight, ArrowDownRight, Gift, Star, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Award, Sparkles, ShoppingBag,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

/* ────────────────────── CSS injection ────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  .rw-root {
    font-family: 'Inter', 'Poppins', Arial, sans-serif;
    background: linear-gradient(145deg, #f0f7f2 0%, #eaf3ec 50%, #f5f9f5 100%);
    min-height: 100%;
  }

  /* ── Reward Card ── */
  .rw-card {
    background: linear-gradient(145deg, #ffffff, #f0f4f1);
    border-radius: 16px;
    box-shadow: 6px 6px 14px #cdd8cf, -4px -4px 10px #ffffff;
    padding: 18px 20px;
    display: grid;
    grid-template-columns: 56px 1fr auto auto auto;
    align-items: center;
    gap: 16px;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
    cursor: default;
    border: 1px solid rgba(255,255,255,0.7);
  }
  .rw-card:hover {
    transform: translateY(-4px);
    box-shadow: 10px 10px 22px #c5d3c7, -6px -6px 14px #ffffff;
  }

  /* ── Icon bubble ── */
  .rw-icon-bubble {
    width: 56px; height: 56px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    background: linear-gradient(145deg, #e8f5e9, #c8e6c9);
    box-shadow: 3px 3px 8px #b0ccb2, -2px -2px 6px #ffffff;
    flex-shrink: 0;
  }
  .rw-icon-bubble.unaffordable {
    background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
    box-shadow: 3px 3px 8px #d0d0d0, -2px -2px 6px #ffffff;
  }

  /* ── Points pill ── */
  .rw-pts-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #fff8e1, #fff3cd);
    box-shadow: inset 2px 2px 5px #e8d87a, inset -2px -2px 5px #fffde7,
                0 0 10px rgba(255, 215, 0, 0.18);
    font-size: 14px; font-weight: 800; color: #b7950b;
  }

  /* ── Affordability badge ── */
  .rw-afford-ok {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 12px; font-weight: 600; color: #2e7d32;
    background: linear-gradient(135deg,#e8f5e9,#dcedc8);
    padding: 4px 10px; border-radius: 999px;
    box-shadow: inset 1px 1px 3px #b0ccb2;
  }
  .rw-afford-no {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; color: #c62828;
    background: linear-gradient(135deg,#ffebee,#ffcdd2);
    padding: 4px 10px; border-radius: 999px;
    box-shadow: inset 1px 1px 3px #e5a5a5;
    white-space: nowrap;
  }

  /* ── 3D Redeem Button ── */
  .rw-btn-redeem {
    padding: 9px 20px;
    border: none;
    border-radius: 10px;
    font-size: 13px; font-weight: 700;
    color: #fff;
    background: linear-gradient(145deg, #2e7d32, #1b5e20);
    box-shadow: 3px 3px 8px #1a4d1d, -2px -2px 6px #4caf50;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    font-family: 'Inter', Arial, sans-serif;
    white-space: nowrap;
    min-width: 130px;
    text-align: center;
  }
  .rw-btn-redeem:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 4px 4px 12px #1a4d1d, -2px -2px 8px #4caf50;
  }
  .rw-btn-redeem:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 1px 1px 4px #1a4d1d, inset 1px 1px 4px rgba(0,0,0,0.2);
  }
  .rw-btn-redeem:disabled {
    background: linear-gradient(145deg, #e0e0e0, #d0d0d0);
    box-shadow: 2px 2px 5px #b0b0b0, -1px -1px 4px #f5f5f5;
    color: #9e9e9e;
    cursor: not-allowed;
  }

  /* ── 3D Action buttons (generic) ── */
  .rw-btn-primary {
    padding: 11px 28px;
    border: none; border-radius: 12px;
    font-size: 14px; font-weight: 800; color: #fff;
    background: linear-gradient(145deg, #2e7d32, #1b5e20);
    box-shadow: 3px 3px 10px #1a4d1d, -2px -2px 7px #4caf50;
    cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
    font-family: 'Inter', Arial, sans-serif;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .rw-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 5px 5px 14px #1a4d1d, -3px -3px 9px #4caf50; }
  .rw-btn-primary:active:not(:disabled) { transform: translateY(1px); box-shadow: inset 2px 2px 5px rgba(0,0,0,0.25); }
  .rw-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .rw-btn-secondary {
    padding: 11px 28px;
    border: none; border-radius: 12px;
    font-size: 14px; font-weight: 700; color: #555;
    background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
    box-shadow: 3px 3px 8px #c8c8c8, -2px -2px 6px #ffffff;
    cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
    font-family: 'Inter', Arial, sans-serif;
  }
  .rw-btn-secondary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 4px 4px 10px #c0c0c0, -3px -3px 8px #ffffff; }
  .rw-btn-secondary:active { transform: translateY(1px); box-shadow: inset 2px 2px 5px #c0c0c0; }
  .rw-btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Tab bar ── */
  .rw-tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
  .rw-tab {
    padding: 9px 20px; border: none; border-radius: 10px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'Inter', Arial, sans-serif;
    transition: transform 0.15s, box-shadow 0.15s;
    background: linear-gradient(145deg, #f5f8f5, #eaf0ea);
    box-shadow: 3px 3px 8px #c8d4c8, -2px -2px 6px #ffffff;
    color: #5d6d5e;
  }
  .rw-tab:hover { transform: translateY(-1px); }
  .rw-tab.active {
    background: linear-gradient(145deg, #2e7d32, #1b5e20);
    color: #fff;
    box-shadow: 3px 3px 10px #1a4d1d, -2px -2px 6px #4caf5060;
  }

  /* ── Points banner ── */
  .rw-banner {
    border-radius: 18px;
    background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #388e3c 100%);
    box-shadow: 6px 8px 20px #1a4d1d80, -3px -3px 10px #4caf5020;
    padding: 24px 28px;
    display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
    border: 1px solid rgba(255,255,255,0.15);
    margin-bottom: 22px;
  }

  /* ── 3D icon container ── */
  .rw-3d-icon {
    width: 58px; height: 58px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.15);
    box-shadow: inset 2px 2px 6px rgba(255,255,255,0.25), inset -2px -2px 6px rgba(0,0,0,0.15), 3px 3px 10px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.2);
    flex-shrink: 0;
  }

  /* ── Big points number ── */
  .rw-pts-big {
    font-size: 40px; font-weight: 900; color: #fff; line-height: 1;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  /* ── Progress bar ── */
  .rw-prog-track {
    height: 10px; border-radius: 5px; overflow: hidden;
    background: rgba(255,255,255,0.2);
    box-shadow: inset 2px 2px 5px rgba(0,0,0,0.2);
  }
  .rw-prog-fill {
    height: 100%; border-radius: 5px;
    background: linear-gradient(90deg, #a5d6a7, #ffffff);
    box-shadow: 0 0 8px rgba(255,255,255,0.6);
    transition: width 0.6s ease;
  }

  /* ── Mini stat chip ── */
  .rw-stat-chip {
    text-align: center; padding: 10px 16px;
    background: rgba(255,255,255,0.15);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: inset 2px 2px 5px rgba(255,255,255,0.1), 2px 2px 6px rgba(0,0,0,0.15);
  }

  /* ── Section card container ── */
  .rw-section {
    background: linear-gradient(145deg, #ffffff, #f5f9f5);
    border-radius: 18px;
    box-shadow: 6px 6px 16px #cad4ca, -4px -4px 12px #ffffff;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.8);
  }
  .rw-section-header {
    padding: 16px 22px;
    border-bottom: 1px solid #e8f0e8;
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(145deg, #fafffe, #f4f9f4);
  }

  /* ── How-to banner ── */
  .rw-info-strip {
    background: linear-gradient(135deg,#e8f5e9,#f1f8e9);
    border: 1px solid #c8e6c9;
    border-radius: 12px;
    padding: 12px 18px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: inset 2px 2px 6px #c8e6c9, 2px 2px 6px #ffffff;
    font-size: 13px; color: #2e7d32; font-weight: 500;
    margin-bottom: 14px;
  }

  /* ── My-reward row ── */
  .rw-my-row {
    display: grid;
    grid-template-columns: 32px 1fr auto auto auto;
    align-items: center; gap: 14px;
    padding: 14px 22px;
    border-bottom: 1px solid #edf3ed;
    transition: background 0.18s;
  }
  .rw-my-row:last-child { border-bottom: none; }
  .rw-my-row:hover { background: linear-gradient(145deg,#f5faf5,#f0f7f0); }

  /* ── Tx row ── */
  .rw-tx-row {
    display: grid;
    grid-template-columns: 36px 1fr auto auto;
    align-items: center; gap: 14px;
    padding: 13px 22px;
    border-bottom: 1px solid #edf3ed;
    transition: background 0.18s;
  }
  .rw-tx-row:last-child { border-bottom: none; }
  .rw-tx-row:hover { background: #f5faf5; }

  /* ── Modal ── */
  .rw-modal-overlay { /* handled by Dialog */ }

  /* ── Empty state ── */
  .rw-empty {
    text-align: center; padding: 52px 24px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .rw-empty-icon {
    width: 68px; height: 68px; border-radius: 20px;
    background: linear-gradient(145deg,#f0f4f0,#e4ebe4);
    box-shadow: 5px 5px 12px #c8d0c8, -3px -3px 8px #ffffff;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Skeleton ── */
  .rw-skeleton {
    border-radius: 12px; background: linear-gradient(145deg,#f0f4f0,#e8ede8);
    box-shadow: 3px 3px 7px #c8d0c8, -2px -2px 5px #ffffff;
    animation: rw-pulse 1.5s ease-in-out infinite;
  }
  @keyframes rw-pulse { 0%,100%{opacity:1} 50%{opacity:0.55} }

  /* ── Status pills ── */
  .rw-status { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .rw-status-active  { background: linear-gradient(135deg,#e8f5e9,#dcedc8); color:#2e7d32; box-shadow:inset 1px 1px 3px #b0ccb2; }
  .rw-status-used    { background: linear-gradient(135deg,#f5f5f5,#e8e8e8); color:#757575; box-shadow:inset 1px 1px 3px #d0d0d0; }
  .rw-status-expired { background: linear-gradient(135deg,#ffebee,#ffcdd2); color:#c62828; box-shadow:inset 1px 1px 3px #e5a5a5; }

  /* ── Modal breakdown boxes ── */
  .rw-modal-box {
    border-radius: 12px; padding: 12px 8px; text-align: center;
    box-shadow: 3px 3px 8px rgba(0,0,0,0.08), -2px -2px 6px #ffffff;
  }

  /* ── Benefits row ── */
  .rw-benefit-row {
    display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 14px; padding: 14px 22px;
    border-bottom: 1px solid #edf3ed;
    font-size: 13px;
  }
  .rw-benefit-row:last-child { border-bottom: none; }
  .rw-benefit-row:hover { background: #f5faf5; }
`;

/* ────────────────────── Tier config ────────────────────── */
const NEXT_TIER: Record<string, { name: string; points: number }> = {
  Bronze:   { name: "Silver",      points: 200  },
  Silver:   { name: "Gold",        points: 400  },
  Gold:     { name: "Platinum",    points: 600  },
  Platinum: { name: "Diamond",     points: 800  },
  Diamond:  { name: "Diamond Max", points: 1000 },
};
const TIER_ICON: Record<string, string> = {
  Bronze: "🥉", Silver: "🥈", Gold: "🥇", Platinum: "💎", Diamond: "👑",
};

const TABS = [
  { key: "redeem",       label: "Reward Catalog",  badge: "catalog"       },
  { key: "my-rewards",   label: "My Rewards",      badge: "myrewards"     },
  { key: "transactions", label: "Transactions",    badge: "tx"            },
  { key: "benefits",     label: "Gov Benefits",    badge: "benefits"      },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function WalletPage() {
  const [tab,         setTab]         = useState<TabKey>("redeem");
  const [confirmItem, setConfirmItem] = useState<any | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  /* ── API ── */
  const { data: scoreData                       } = useGetCleanlinessScore();
  const { data: txData,       isLoading: txLoad } = useGetWalletTransactions();
  const { data: benefitsData                    } = useGetGovernmentBenefits();
  const { data: redeemData,   isLoading: rdLoad } = useGetRedeemItems();
  const redeemMutation = useRedeemItem();

  const score        = (scoreData    as any)?.data;
  const transactions: any[] = (txData       as any)?.data || [];
  const benefits:     any[] = (benefitsData as any)?.data || [];
  const redeemItems:  any[] = (redeemData   as any)?.data || [];

  /* ── Derived ── */
  const currentPoints = score?.score ?? 0;
  const tier          = score?.tier  || "Bronze";
  const tierIcon      = TIER_ICON[tier] || "🥉";
  const next          = NEXT_TIER[tier] ?? { name: "Silver", points: 200 };
  const pct           = currentPoints ? Math.min(Math.floor((currentPoints / next.points) * 100), 100) : 0;

  const myRewards = transactions.filter(
    (t: any) => t.type === "spent" || t.type === "redeemed" || (t.action || "").toLowerCase().includes("redeem"),
  );

  /* ── Handlers ── */
  const openConfirm  = (item: any) => setConfirmItem(item);
  const closeConfirm = ()          => setConfirmItem(null);

  const confirmRedeem = () => {
    if (!confirmItem) return;
    redeemMutation.mutate({ data: { itemId: confirmItem.id } }, {
      onSuccess: () => {
        toast({ title: "✅ Reward Redeemed!", description: `"${confirmItem.title}" has been added to your rewards.` });
        closeConfirm();
        qc.invalidateQueries({ queryKey: getGetCleanlinessScoreQueryKey() });
        qc.invalidateQueries({ queryKey: getGetRedeemItemsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetWalletTransactionsQueryKey() });
        setTab("my-rewards");
      },
      onError: (err: any) => {
        toast({ title: "❌ Redemption Failed", description: err.message || "Please try again.", variant: "destructive" });
        closeConfirm();
      },
    });
  };

  return (
    <DashboardLayout title="Wallet & Rewards">
      <style>{CSS}</style>
      <div className="rw-root" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

        {/* ══════════════════════════════
            3D POINTS BANNER
        ══════════════════════════════ */}
        <div className="rw-banner">
          {/* Wallet icon */}
          <div className="rw-3d-icon">
            <Wallet style={{ width: 28, height: 28, color: "#fff", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
          </div>

          {/* Points */}
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>
              Available Points
            </div>
            <div className="rw-pts-big">{currentPoints.toLocaleString("en-IN")}</div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 56, background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />

          {/* Tier */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 38, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))" }}>{tierIcon}</span>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Current Tier</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>{tier}</div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 6, fontWeight: 500 }}>
              <span>Progress to {next.name}</span>
              <span style={{ fontWeight: 700 }}>{currentPoints} / {next.points}</span>
            </div>
            <div className="rw-prog-track">
              <div className="rw-prog-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Mini stats */}
          <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
            {[
              { icon: "📸", label: "Reports",   value: score?.totalReports   || 0 },
              { icon: "❤️", label: "Donations", value: score?.totalDonations || 0 },
              { icon: "🎪", label: "Events",    value: score?.totalEvents    || 0 },
            ].map(s => (
              <div key={s.label} className="rw-stat-chip">
                <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════
            3D TABS
        ══════════════════════════════ */}
        <div className="rw-tabs">
          {TABS.map(t => {
            const cnt = t.key === "redeem" ? redeemItems.length
                      : t.key === "my-rewards" ? myRewards.length
                      : 0;
            return (
              <button key={t.key} className={`rw-tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
                {t.label}
                {cnt > 0 && (
                  <span style={{
                    marginLeft: 6, fontSize: 10, fontWeight: 800, padding: "1px 7px", borderRadius: 999,
                    background: tab === t.key ? "rgba(255,255,255,0.3)" : "linear-gradient(135deg,#2e7d32,#1b5e20)",
                    color: "#fff",
                    boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.2)",
                  }}>{cnt}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════
            TAB: REWARD CATALOG
        ══════════════════════════════ */}
        {tab === "redeem" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Info strip */}
            <div className="rw-info-strip">
              <Sparkles style={{ width: 16, height: 16, color: "#2e7d32", flexShrink: 0, filter: "drop-shadow(0 1px 3px #4caf50)" }} />
              <span><strong>How to redeem:</strong> Click "Redeem" next to any reward you can afford. Confirm in the popup — points are deducted instantly.</span>
            </div>

            {/* Balance header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1b5e20", fontFamily: "'Inter', sans-serif" }}>
                Reward Catalog
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#5d6d5e" }}>Your balance:</span>
                <div className="rw-pts-pill">
                  <Star style={{ width: 13, height: 13 }} />
                  {currentPoints.toLocaleString("en-IN")} pts
                </div>
              </div>
            </div>

            {/* Reward cards */}
            {rdLoad ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1,2,3,4,5].map(i => <div key={i} className="rw-skeleton" style={{ height: 84 }} />)}
              </div>
            ) : redeemItems.length === 0 ? (
              <div className="rw-section">
                <div className="rw-empty">
                  <div className="rw-empty-icon">
                    <Gift style={{ width: 32, height: 32, color: "#81c784", filter: "drop-shadow(0 2px 4px #4caf5050)" }} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#4a5a4b" }}>No rewards available yet</div>
                  <div style={{ fontSize: 13, color: "#7d8f7d" }}>The admin will add rewards soon. Keep earning!</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {redeemItems.map((item: any) => {
                  const canAfford  = currentPoints >= item.pointsCost;
                  const shortfall  = item.pointsCost - currentPoints;
                  const outOfStock = item.stock !== null && item.stock <= 0;

                  return (
                    <div key={item.id} className="rw-card" data-testid={`redeem-item-${item.id}`}
                      style={{ opacity: outOfStock ? 0.6 : 1 }}>

                      {/* Icon bubble */}
                      <div className={`rw-icon-bubble${canAfford ? "" : " unaffordable"}`}>
                        {item.imageEmoji || "🎁"}
                      </div>

                      {/* Title + desc */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a", marginBottom: 2, fontFamily: "'Inter', sans-serif" }}>
                          {item.title}
                          {outOfStock && (
                            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: "#c62828", background: "#ffebee", padding: "2px 7px", borderRadius: 999 }}>OUT OF STOCK</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#5d6d5e", lineHeight: 1.4 }}>
                          {item.description || "Redeem this reward using your points."}
                        </div>
                        <div style={{ fontSize: 11, color: "#7d8f7d", marginTop: 4 }}>
                          Stock: {item.stock !== null ? (
                            <strong style={{ color: item.stock < 5 ? "#c62828" : "#2e7d32" }}>{item.stock}</strong>
                          ) : <strong style={{ color: "#2e7d32" }}>Unlimited</strong>}
                        </div>
                      </div>

                      {/* Points cost pill */}
                      <div className="rw-pts-pill" style={{ flexShrink: 0 }}>
                        <Star style={{ width: 12, height: 12 }} />
                        {item.pointsCost.toLocaleString("en-IN")}
                      </div>

                      {/* Affordability */}
                      <div style={{ flexShrink: 0, minWidth: 110 }}>
                        {canAfford ? (
                          <span className="rw-afford-ok">
                            <CheckCircle style={{ width: 12, height: 12 }} /> Affordable
                          </span>
                        ) : (
                          <span className="rw-afford-no">
                            <AlertTriangle style={{ width: 11, height: 11 }} />
                            Need {shortfall.toLocaleString("en-IN")} more
                          </span>
                        )}
                      </div>

                      {/* Redeem button */}
                      <button
                        className="rw-btn-redeem"
                        disabled={!canAfford || outOfStock || redeemMutation.isPending}
                        onClick={() => openConfirm(item)}
                        data-testid={`button-redeem-${item.id}`}
                      >
                        {outOfStock ? "Out of Stock"
                          : !canAfford ? "Not Enough Points"
                          : "Redeem →"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB: MY REWARDS
        ══════════════════════════════ */}
        {tab === "my-rewards" && (
          <div className="rw-section">
            <div className="rw-section-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award style={{ width: 16, height: 16, color: "#6c3483", filter: "drop-shadow(0 1px 3px #9b59b680)" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#1a2e1a", fontFamily: "'Inter', sans-serif" }}>My Redeemed Rewards</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#e8daef,#d2b4de)", padding: "3px 10px", borderRadius: 999, color: "#6c3483", boxShadow: "inset 1px 1px 3px #c39bd3" }}>
                {myRewards.length} reward{myRewards.length !== 1 ? "s" : ""}
              </span>
            </div>

            {myRewards.length === 0 ? (
              <div className="rw-empty">
                <div className="rw-empty-icon">
                  <ShoppingBag style={{ width: 30, height: 30, color: "#a5c8a5" }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#4a5a4b" }}>No rewards redeemed yet</div>
                <div style={{ fontSize: 13, color: "#7d8f7d" }}>
                  You have <strong style={{ color: "#2e7d32" }}>{currentPoints}</strong> points. Head to the catalog!
                </div>
                <button className="rw-btn-primary" style={{ marginTop: 6 }} onClick={() => setTab("redeem")}>
                  <Gift style={{ width: 15, height: 15 }} /> Browse Catalog
                </button>
              </div>
            ) : (
              <div>
                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto auto", gap: 14, padding: "10px 22px 8px", background: "linear-gradient(145deg,#fafffe,#f4f9f4)", borderBottom: "1px solid #e0eae0" }}>
                  {["#", "Reward", "Points", "Date", "Status"].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#7d8f7d", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
                  ))}
                </div>
                {myRewards.map((r: any, i: number) => {
                  const daysSince = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                  const status    = daysSince < 30 ? "active" : "used";
                  return (
                    <div key={r.id} className="rw-my-row" data-testid={`my-reward-${r.id}`}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b5a5" }}>{i + 1}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(145deg,#fadbd8,#f5b7b1)", boxShadow: "2px 2px 6px #e5a5a5, -1px -1px 4px #fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <ArrowDownRight style={{ width: 16, height: 16, color: "#c62828" }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a2e1a" }}>{r.action || "Reward Redeemed"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star style={{ width: 11, height: 11, color: "#b7950b" }} />
                        <span style={{ fontWeight: 800, fontSize: 13, color: "#c62828" }}>−{r.points}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#7d8f7d" }}>
                        <Clock style={{ width: 11, height: 11 }} />
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <span className={`rw-status rw-status-${status}`}>{status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB: TRANSACTIONS
        ══════════════════════════════ */}
        {tab === "transactions" && (
          <div className="rw-section">
            <div className="rw-section-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp style={{ width: 16, height: 16, color: "#1b5e20" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#1a2e1a", fontFamily: "'Inter', sans-serif" }}>Transaction History</span>
              </div>
              <span style={{ fontSize: 12, color: "#7d8f7d" }}>{transactions.length} record{transactions.length !== 1 ? "s" : ""}</span>
            </div>

            {txLoad ? (
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3,4].map(i => <div key={i} className="rw-skeleton" style={{ height: 54 }} />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="rw-empty">
                <div className="rw-empty-icon">
                  <TrendingUp style={{ width: 28, height: 28, color: "#a5c8a5" }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#4a5a4b" }}>No transactions yet</div>
                <div style={{ fontSize: 12, color: "#7d8f7d" }}>Start earning points by submitting reports!</div>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "36px 1fr auto auto", gap: 14, padding: "10px 22px 8px", background: "linear-gradient(145deg,#fafffe,#f4f9f4)", borderBottom: "1px solid #e0eae0" }}>
                  {["", "Action", "Type", "Points"].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#7d8f7d", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
                  ))}
                </div>
                {transactions.map((t: any) => {
                  const isEarned = t.type === "earned";
                  return (
                    <div key={t.id} className="rw-tx-row" data-testid={`tx-${t.id}`}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: isEarned ? "linear-gradient(145deg,#e8f5e9,#c8e6c9)" : "linear-gradient(145deg,#fadbd8,#f5b7b1)",
                        boxShadow: isEarned ? "2px 2px 6px #b0ccb2,-1px -1px 4px #fff" : "2px 2px 6px #e5a5a5,-1px -1px 4px #fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isEarned
                          ? <ArrowUpRight   style={{ width: 16, height: 16, color: "#2e7d32" }} />
                          : <ArrowDownRight style={{ width: 16, height: 16, color: "#c62828" }} />}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2e1a" }}>{t.action}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                        background: isEarned ? "linear-gradient(135deg,#e8f5e9,#dcedc8)" : "linear-gradient(135deg,#ffebee,#ffcdd2)",
                        color: isEarned ? "#2e7d32" : "#c62828",
                        boxShadow: isEarned ? "inset 1px 1px 3px #b0ccb2" : "inset 1px 1px 3px #e5a5a5",
                      }}>{t.type}</span>
                      <div style={{ textAlign: "right", fontWeight: 900, fontSize: 15, color: isEarned ? "#2e7d32" : "#c62828", fontFamily: "'Inter', sans-serif" }}>
                        {isEarned ? "+" : "−"}{Math.abs(t.points)}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB: GOV BENEFITS
        ══════════════════════════════ */}
        {tab === "benefits" && (
          <div className="rw-section">
            <div className="rw-section-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.2))" }}>🏛️</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#1a2e1a", fontFamily: "'Inter', sans-serif" }}>Government Benefits</span>
              </div>
              <span className="rw-afford-ok">{benefits.length} active</span>
            </div>
            {benefits.length === 0 ? (
              <div className="rw-empty">
                <div className="rw-empty-icon" style={{ fontSize: 32 }}>🏛️</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#4a5a4b" }}>No government benefits yet</div>
                <div style={{ fontSize: 12, color: "#7d8f7d" }}>Earn more points to unlock exclusive government benefits!</div>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, padding: "10px 22px 8px", background: "linear-gradient(145deg,#fafffe,#f4f9f4)", borderBottom: "1px solid #e0eae0" }}>
                  {["Benefit Type", "Details", "Coupon", "Status"].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#7d8f7d", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
                  ))}
                </div>
                {benefits.map((b: any) => (
                  <div key={b.id} className="rw-benefit-row" data-testid={`benefit-${b.id}`}>
                    <div style={{ fontWeight: 700, color: "#1a2e1a", textTransform: "capitalize" }}>{b.benefitType?.replace(/_/g, " ")}</div>
                    <div style={{ color: "#2e7d32", fontWeight: 600 }}>{b.discountPercent ? `${b.discountPercent}% discount` : "—"}</div>
                    <div>
                      {b.couponCode
                        ? <code style={{ fontSize: 12, background: "linear-gradient(135deg,#eaf2f8,#d6eaf8)", padding: "3px 10px", borderRadius: 8, color: "#1a5276", fontWeight: 700, boxShadow: "inset 1px 1px 4px #a9cce3" }}>{b.couponCode}</code>
                        : <span style={{ color: "#a5b5a5" }}>—</span>}
                    </div>
                    <div>
                      <span className={`rw-status rw-status-${b.status === "approved" ? "active" : "used"}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════
          3D CONFIRMATION MODAL
      ══════════════════════════════════════════════ */}
      <Dialog open={!!confirmItem} onOpenChange={v => { if (!v) closeConfirm(); }}>
        <DialogContent style={{ fontFamily: "'Inter', 'Poppins', Arial, sans-serif", maxWidth: 440, borderRadius: 20, background: "linear-gradient(145deg,#ffffff,#f5faf5)", boxShadow: "12px 14px 30px rgba(0,0,0,0.18), -6px -6px 16px #ffffff", border: "1px solid rgba(255,255,255,0.9)" }}>
          <DialogHeader>
            <DialogTitle style={{ fontSize: 17, fontWeight: 900, color: "#1a2e1a", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(145deg,#e8f5e9,#c8e6c9)", boxShadow: "2px 2px 6px #b0ccb2,-1px -1px 4px #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Gift style={{ width: 16, height: 16, color: "#2e7d32" }} />
              </div>
              Confirm Redemption
            </DialogTitle>
            <DialogDescription style={{ color: "#7d8f7d", fontSize: 13 }}>
              Review the details before confirming your redemption.
            </DialogDescription>
          </DialogHeader>

          {confirmItem && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Item preview */}
              <div style={{
                borderRadius: 14, padding: "16px 18px",
                background: "linear-gradient(145deg,#f0f7f0,#e8f4e8)",
                boxShadow: "inset 3px 3px 8px #c8dcc8, inset -2px -2px 6px #ffffff",
                display: "flex", alignItems: "center", gap: 14,
                border: "1px solid rgba(255,255,255,0.8)",
              }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 14, flexShrink: 0,
                  background: "linear-gradient(145deg,#e8f5e9,#c8e6c9)",
                  boxShadow: "3px 3px 8px #b0ccb2,-2px -2px 6px #ffffff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                }}>{confirmItem.imageEmoji || "🎁"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1a2e1a" }}>{confirmItem.title}</div>
                  {confirmItem.description && <div style={{ fontSize: 12, color: "#5d6d5e", marginTop: 2 }}>{confirmItem.description}</div>}
                </div>
              </div>

              {/* Points breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Your Balance", value: currentPoints.toLocaleString("en-IN"), bg: "linear-gradient(145deg,#fff8e1,#fffde7)", shadow: "inset 2px 2px 5px #e8d87a,inset -1px -1px 4px #fffff0", color: "#b7950b" },
                  { label: "Cost",         value: `−${confirmItem.pointsCost.toLocaleString("en-IN")}`, bg: "linear-gradient(145deg,#ffebee,#ffcdd2)", shadow: "inset 2px 2px 5px #e5a5a5,inset -1px -1px 4px #fff5f5", color: "#c62828" },
                  { label: "Remaining",    value: (currentPoints - confirmItem.pointsCost).toLocaleString("en-IN"), bg: "linear-gradient(145deg,#e8f5e9,#dcedc8)", shadow: "inset 2px 2px 5px #b0ccb2,inset -1px -1px 4px #f5fff5", color: "#2e7d32" },
                ].map(box => (
                  <div key={box.label} className="rw-modal-box" style={{ background: box.bg, boxShadow: box.shadow }}>
                    <div style={{ fontSize: 10, color: "#909090", marginBottom: 3, fontWeight: 600, textTransform: "uppercase" }}>{box.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: box.color, lineHeight: 1 }}>{box.value}</div>
                    <div style={{ fontSize: 10, color: "#a0a0a0", marginTop: 1 }}>pts</div>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div style={{
                borderRadius: 12, padding: "10px 14px",
                background: "linear-gradient(145deg,#fef9e7,#fffde7)",
                boxShadow: "inset 2px 2px 5px #e8d87a, 2px 2px 6px #ffffff",
                display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#b7950b",
                border: "1px solid #f9e79f",
              }}>
                <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} />
                <span><strong>This action cannot be undone.</strong> Points will be deducted immediately upon confirmation.</span>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button className="rw-btn-secondary" style={{ flex: 1 }}
                  onClick={closeConfirm} disabled={redeemMutation.isPending}
                  data-testid="button-confirm-cancel">Cancel</button>
                <button className="rw-btn-primary" style={{ flex: 1, justifyContent: "center" }}
                  onClick={confirmRedeem} disabled={redeemMutation.isPending}
                  data-testid="button-confirm-redeem">
                  {redeemMutation.isPending
                    ? "Processing…"
                    : <><CheckCircle style={{ width: 15, height: 15 }} /> Confirm</>}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
