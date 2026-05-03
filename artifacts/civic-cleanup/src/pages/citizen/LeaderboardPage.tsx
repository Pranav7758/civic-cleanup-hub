import { useGetLeaderboard, useGetCleanlinessScore } from "@workspace/api-client-react";
import { Trophy, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

const TIER_COLOR: Record<string, string> = {
  Bronze:   "#b7950b",
  Silver:   "#5d6d7e",
  Gold:     "#b7950b",
  Platinum: "#1a5276",
  Diamond:  "#6c3483",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: 20 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 20 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 20 }}>🥉</span>;
  return <span style={{ fontSize: 12, fontWeight: 700, color: "#5d6d7e" }}>#{rank}</span>;
}

export default function LeaderboardPage() {
  const { user  } = useAuth();
  const { data: leaderboardData, isLoading } = useGetLeaderboard();
  const { data: myScoreData    } = useGetCleanlinessScore();

  const leaders: any[] = (leaderboardData as any)?.data || [];
  const myScore = (myScoreData as any)?.data;
  const myRank  = leaders.findIndex(l => l.fullName === user?.fullName) + 1;

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Leaderboard">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── My rank card ── */}
        {myScore && (
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 14 }}>
            <div className="gov-card" style={{ padding: 18, borderLeft: "3px solid #1a6b3c" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 3, background: "#1a6b3c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trophy style={{ width: 22, height: 22, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#5d6d7e" }}>Your Ranking</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#1a6b3c", lineHeight: 1 }}>{myRank > 0 ? `#${myRank}` : "Unranked"}</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1c2833" }}>{myScore.score}</div>
                  <div style={{ fontSize: 11, color: "#5d6d7e" }}>points</div>
                </div>
              </div>
            </div>
            {[
              { label: "Tier",     value: myScore.tier || "Bronze", icon: "🏅", color: "#b7950b" },
              { label: "Reports",  value: myScore.totalReports || 0, icon: "📸", color: "#c0392b" },
              { label: "Donations",value: myScore.totalDonations || 0, icon: "❤️", color: "#6c3483" },
            ].map(s => (
              <div key={s.label} className="gov-stat-card">
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="gov-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Leaderboard table ── */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Crown style={{ width: 14, height: 14, color: "#b7950b" }} />
              <span className="gov-section-title">Top Citizens This Month</span>
            </div>
            <span style={{ fontSize: 11, color: "#5d6d7e" }}>{leaders.length} ranked citizens</span>
          </div>

          {isLoading ? (
            <div style={{ padding: 18 }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ height: 44, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
            </div>
          ) : leaders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Trophy style={{ width: 32, height: 32, color: "#909caa", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: "#5d6d7e" }}>No rankings yet. Be the first to earn points!</div>
            </div>
          ) : (
            <table className="gov-table">
              <thead>
                <tr><th style={{ width: 48 }}>Rank</th><th>Citizen</th><th>Tier</th><th>Reports</th><th>Events</th><th style={{ textAlign: "right" }}>Points</th></tr>
              </thead>
              <tbody>
                {leaders.map((l: any) => {
                  const isMe = l.fullName === user?.fullName;
                  return (
                    <tr key={l.userId} data-testid={`leader-${l.rank}`}
                      style={{ background: isMe ? "#eaf6ff" : undefined, outline: isMe ? "2px solid #aed6f1" : "none" }}>
                      <td style={{ textAlign: "center" }}>
                        <RankBadge rank={l.rank} />
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 3, background: "#1a5276", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}>{l.fullName?.[0]?.toUpperCase() || "?"}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2833" }}>
                              {l.fullName}
                              {isMe && <span style={{ fontSize: 10, fontWeight: 700, color: "#1a6b3c", marginLeft: 6, background: "#d5f5e3", padding: "1px 5px", borderRadius: 2 }}>You</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="gov-badge" style={{ color: TIER_COLOR[l.tier] || "#5d6d7e", background: "#f4f6f9", border: "1px solid #d5dae1" }}>
                          {l.tier}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>{l.totalReports ?? "—"}</td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>{l.totalEvents ?? "—"}</td>
                      <td style={{ textAlign: "right", fontWeight: 800, fontSize: 14, color: "#1e8449" }}>{l.score} pts</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
