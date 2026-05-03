import { useGetCommunityEvents, useRegisterForEvent, getGetCommunityEventsQueryKey, getGetMyEventRegistrationsQueryKey } from "@workspace/api-client-react";
import { Calendar, MapPin, Users, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

const EVENT_TYPE_CONFIG: Record<string, { badgeClass: string; emoji: string; label: string }> = {
  cleanup:        { badgeClass: "gov-badge gov-badge-green",  emoji: "🧹", label: "Cleanup Drive"   },
  plantation:     { badgeClass: "gov-badge gov-badge-green",  emoji: "🌱", label: "Plantation"      },
  awareness:      { badgeClass: "gov-badge gov-badge-blue",   emoji: "📢", label: "Awareness"       },
  workshop:       { badgeClass: "gov-badge gov-badge-purple", emoji: "🎓", label: "Donation Camp"   },
  government_camp:{ badgeClass: "gov-badge gov-badge-yellow", emoji: "🏛️", label: "Govt. Camp"      },
  health_camp:    { badgeClass: "gov-badge gov-badge-blue",   emoji: "🏥", label: "Health Camp"     },
};

export default function EventsPage() {
  const { toast } = useToast();
  const qc        = useQueryClient();

  const { data: eventsData, isLoading } = useGetCommunityEvents();
  const register = useRegisterForEvent();

  const events: any[] = (eventsData as any)?.data || [];

  const handleRegister = (eventId: string, eventTitle: string) => {
    register.mutate({ id: eventId }, {
      onSuccess: () => {
        toast({ title: "Registered!", description: `You're registered for "${eventTitle}"` });
        qc.invalidateQueries({ queryKey: getGetCommunityEventsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetMyEventRegistrationsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const upcoming = events.filter(e => new Date(e.startsAt) >= new Date());
  const past     = events.filter(e => new Date(e.startsAt) <  new Date());

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Community Events">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Summary stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { icon: "📅", label: "Total Events",    value: events.length                                 },
            { icon: "🗓️", label: "Upcoming",         value: upcoming.length                               },
            { icon: "🧹", label: "Cleanups",         value: events.filter(e => e.eventType === "cleanup").length },
            { icon: "🏆", label: "Best Reward",       value: "100 pts"                                     },
          ].map(s => (
            <div key={s.label} className="gov-stat-card">
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value">{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Type filter pills ── */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#5d6d7e" }}>Filter:</span>
          {[
            { emoji:"🧹", label:"Cleanup"    },
            { emoji:"🌱", label:"Plantation" },
            { emoji:"📢", label:"Awareness"  },
            { emoji:"🎓", label:"Workshop"   },
            { emoji:"🏛️", label:"Govt. Camp" },
            { emoji:"🏥", label:"Health Camp"},
          ].map(t => (
            <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f4f6f9", border: "1px solid #d5dae1", borderRadius: 3, padding: "3px 10px", fontSize: 11, color: "#1c2833" }}>
              <span>{t.emoji}</span>{t.label}
            </div>
          ))}
        </div>

        {/* ── Upcoming Events table ── */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar style={{ width: 14, height: 14, color: "#ca6f1e" }} />
              <span className="gov-section-title">Upcoming Events</span>
            </div>
            <span className="gov-badge gov-badge-blue">{upcoming.length} upcoming</span>
          </div>

          {isLoading ? (
            <div style={{ padding: 18 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 52, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
            </div>
          ) : upcoming.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Calendar style={{ width: 32, height: 32, color: "#909caa", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: "#5d6d7e" }}>No upcoming events. Check back soon!</div>
            </div>
          ) : (
            <table className="gov-table">
              <thead>
                <tr><th>Event</th><th>Type</th><th>Date & Time</th><th>Location</th><th>People Joined</th><th>Reward</th><th>Action</th></tr>
              </thead>
              <tbody>
                {upcoming.map((e: any) => {
                  const config = EVENT_TYPE_CONFIG[e.eventType] || EVENT_TYPE_CONFIG.cleanup;
                  const start  = new Date(e.startsAt);
                  return (
                    <tr key={e.id} data-testid={`event-${e.id}`}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 18 }}>{config.emoji}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2833" }}>{e.title}</div>
                            {e.description && <div style={{ fontSize: 11, color: "#5d6d7e" }}>{e.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className={config.badgeClass}>{config.emoji} {config.label}</span></td>
                      <td style={{ fontSize: 12, color: "#5d6d7e", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock style={{ width: 11, height: 11 }} />
                          {start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>
                        {e.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin style={{ width: 11, height: 11 }} />{e.location}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Users style={{ width: 11, height: 11 }} />{e.registrationCount || 0}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, fontWeight: 700, color: "#1e8449" }}>+{e.rewardPoints || 100} pts</td>
                      <td>
                        {e.isRegistered ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1e8449" }}>
                            <CheckCircle style={{ width: 13, height: 13 }} />Registered
                          </div>
                        ) : (
                          <button
                            className="gov-btn gov-btn-primary gov-btn-sm"
                            onClick={() => handleRegister(e.id, e.title)}
                            disabled={register.isPending}
                            data-testid={`button-register-${e.id}`}
                          >
                            Register
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Past events ── */}
        {past.length > 0 && (
          <div className="gov-card">
            <div className="gov-card-header">
              <span className="gov-section-title">Past Events</span>
              <span className="gov-badge gov-badge-gray">{past.length} completed</span>
            </div>
            <table className="gov-table">
              <thead><tr><th>Event</th><th>Type</th><th>Date</th><th>Participants</th><th>Status</th></tr></thead>
              <tbody>
                {past.map((e: any) => {
                  const config = EVENT_TYPE_CONFIG[e.eventType] || EVENT_TYPE_CONFIG.cleanup;
                  return (
                    <tr key={e.id} style={{ opacity: 0.7 }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 16 }}>{config.emoji}</span>
                          <span style={{ fontSize: 13, color: "#1c2833" }}>{e.title}</span>
                        </div>
                      </td>
                      <td><span className={config.badgeClass}>{config.emoji} {config.label}</span></td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>
                        {new Date(e.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>{e.registrationCount || 0}</td>
                      <td><span className="gov-badge gov-badge-gray">Ended</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
