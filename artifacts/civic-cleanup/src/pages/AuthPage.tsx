import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import { SwachhLogoIcon } from "@/components/SwachhLogo";
import { useToast } from "@/hooks/use-toast";
import { useSignIn, useSignUp } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import "@/styles/auth.css";

/* ── Schemas ── */
const signInSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
});
const signUpSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
  fullName: z.string().min(2, "At least 2 characters"),
  role:     z.string().min(1, "Please select a role"),
  phone:    z.string().optional(),
});
type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

const ROLES = [
  { value: "citizen",      emoji: "🏠", label: "Citizen",      desc: "Report & earn" },
  { value: "worker",       emoji: "🚛", label: "Worker",       desc: "Handle pickups" },
  { value: "ngo",          emoji: "🌱", label: "NGO",          desc: "Drive campaigns" },
  { value: "scrap_dealer", emoji: "♻️", label: "Scrap Dealer", desc: "Trade materials" },
  { value: "admin",        emoji: "🔧", label: "Admin",        desc: "Manage platform" },
];

const DEMO_ACCOUNTS = [
  { label: "Citizen", email: "citizen@civic.dev", emoji: "🏠" },
  { label: "Worker",  email: "worker@civic.dev",  emoji: "🚛" },
  { label: "Admin",   email: "admin@civic.dev",   emoji: "🔧" },
  { label: "NGO",     email: "ngo@civic.dev",     emoji: "🌱" },
  { label: "Scrap",   email: "scrap@civic.dev",   emoji: "♻️" },
];

function getRoleRedirect(roles: string[]): string {
  if (roles.includes("admin"))        return "/admin";
  if (roles.includes("worker"))       return "/worker";
  if (roles.includes("ngo"))          return "/ngo";
  if (roles.includes("scrap_dealer")) return "/scrap";
  return "/citizen";
}

function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div style={{ fontSize: 11, color: "#e53935", marginTop: 4, fontWeight: 600,
      fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
      ⚠ {msg}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#5d7a5e",
      marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em",
      fontFamily: "'Inter',sans-serif" }}>
      {children}
    </label>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function AuthPage() {
  const [mode,    setMode]   = useState<"signin" | "signup">("signin");
  const [showPw,  setShowPw] = useState(false);
  const [selRole, setSelRole] = useState("");
  const [, setLocation] = useLocation();
  const { toast }  = useToast();
  const { signIn } = useAuth();

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", fullName: "", role: "", phone: "" },
  });

  const onSignIn = (data: SignInForm) => {
    signInMutation.mutate({ data }, {
      onSuccess: (res: any) => {
        signIn(res.user, res.token, res.roles);
        toast({ title: "Welcome back! 🌿", description: `Signed in as ${res.user.fullName}` });
        setLocation(getRoleRedirect(res.roles));
      },
      onError: (err: any) => {
        toast({ title: "Sign in failed", description: err.message || "Invalid credentials", variant: "destructive" });
      },
    });
  };

  const onSignUp = (data: SignUpForm) => {
    signUpMutation.mutate({ data }, {
      onSuccess: (res: any) => {
        signIn(res.user, res.token, res.roles);
        toast({ title: "Welcome to SwachhSaathi! 🎉", description: `Account created for ${res.user.fullName}` });
        setLocation(getRoleRedirect(res.roles));
      },
      onError: (err: any) => {
        toast({ title: "Sign up failed", description: err.message || "Could not create account", variant: "destructive" });
      },
    });
  };

  const fillDemo = (email: string) => {
    if (mode !== "signin") switchMode("signin");
    setTimeout(() => {
      signInForm.setValue("email", email);
      signInForm.setValue("password", "password123");
      signInForm.clearErrors();
    }, 60);
  };

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    signInForm.reset();
    signUpForm.reset();
    setSelRole("");
    setShowPw(false);
  };

  const isPending = signInMutation.isPending || signUpMutation.isPending;

  /* ── shared input style ── */
  const inputBox: React.CSSProperties = {
    width: "100%", padding: "11px 13px 11px 40px",
    border: "1.5px solid #d1dfd1", borderRadius: 11,
    fontSize: 14, color: "#1a2e1a", fontFamily: "'Inter',sans-serif",
    fontWeight: 500, outline: "none",
    background: "linear-gradient(145deg,#fff,#f9fdf9)",
    boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05),inset -1px -1px 3px rgba(255,255,255,.8)",
    boxSizing: "border-box" as const,
    transition: "border-color .2s,box-shadow .2s",
  };

  return (
    <div className="auth-page">
      {/* bg orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      {/* floating leaves */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {["🍃","🌿","♻️","🍀","🌱","🍃"].map((l, i) => (
          <div key={i} className="auth-leaf">{l}</div>
        ))}
      </div>

      {/* ══ SINGLE CARD ══ */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: 460,
        background: "linear-gradient(160deg,rgba(255,255,255,0.97),rgba(245,253,245,0.99))",
        borderRadius: 24,
        boxShadow: "0 32px 80px rgba(0,0,0,0.45),0 8px 24px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,.9)",
        overflow: "hidden",
        animation: "auth-card-in .45s cubic-bezier(.34,1.56,.64,1)",
        margin: "20px auto",
      }}>

        {/* ── Brand header strip ── */}
        <div style={{
          background: "linear-gradient(135deg,#1b5e20,#2e7d32,#1a5e2a)",
          padding: "22px 28px 20px",
          display: "flex", alignItems: "center", gap: 14,
          position: "relative", overflow: "hidden",
        }}>
          {/* decorative ring */}
          <div style={{ position: "absolute", right: -30, top: -30,
            width: 120, height: 120, borderRadius: "50%",
            border: "1px solid rgba(76,175,80,.2)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 20, bottom: -20,
            width: 80, height: 80, borderRadius: "50%",
            border: "1px solid rgba(76,175,80,.15)", pointerEvents: "none" }} />

          <div style={{ filter: "drop-shadow(0 0 10px rgba(76,175,80,.5))", flexShrink: 0 }}>
            <SwachhLogoIcon size={42} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff",
              fontFamily: "'Inter',sans-serif", lineHeight: 1.1 }}>
              Swachh<span style={{ color: "#81c784" }}>Saathi</span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(165,214,167,.75)",
              fontWeight: 600, letterSpacing: ".08em", marginTop: 2 }}>
              INDIA'S CIVIC PLATFORM
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(165,214,167,.6)",
              fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>
              {mode === "signin" ? "Welcome back 👋" : "Join us today 🌿"}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 6, justifyContent: "flex-end" }}>
              {["50K+ Citizens", "340+ NGOs"].map(s => (
                <div key={s} style={{ fontSize: 10, color: "rgba(165,214,167,.7)",
                  fontWeight: 700 }}>{s}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab switcher ── */}
        <div style={{ display: "flex", borderBottom: "1.5px solid #e8f0e8",
          background: "linear-gradient(135deg,#f8fbf8,#f1f8f1)" }}>
          {(["signin","signup"] as const).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className={`auth-tab ${mode === m ? "active" : "inactive"}`}
              style={{ fontSize: 13 }}>
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* ── Form body ── */}
        <div style={{ padding: "24px 28px 20px", overflowY: "auto", maxHeight: "65vh" }}
          className="auth-right">

          {/* ─── SIGN IN ─── */}
          {mode === "signin" && (
            <form onSubmit={signInForm.handleSubmit(onSignIn)}
              style={{ display: "flex", flexDirection: "column", gap: 14,
                animation: "auth-fade-in .3s ease" }}>

              <div>
                <FieldLabel>Email Address</FieldLabel>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" style={{ width: 15, height: 15 }} />
                  <input className="auth-input" type="email" placeholder="you@example.com"
                    data-testid="input-email" {...signInForm.register("email")} />
                </div>
                <ErrMsg msg={signInForm.formState.errors.email?.message} />
              </div>

              <div>
                <FieldLabel>Password</FieldLabel>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" style={{ width: 15, height: 15 }} />
                  <input className="auth-input" type={showPw ? "text" : "password"}
                    placeholder="••••••••" style={{ paddingRight: 40 }}
                    data-testid="input-password" {...signInForm.register("password")} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)", border: "none",
                      background: "none", cursor: "pointer", color: "#81c784", padding: 0 }}>
                    {showPw ? <EyeOff style={{ width: 15, height: 15 }} />
                            : <Eye    style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
                <ErrMsg msg={signInForm.formState.errors.password?.message} />
              </div>

              <button type="submit" disabled={isPending} className="auth-btn"
                data-testid="button-signin" style={{ marginTop: 2 }}>
                {isPending && <span className="auth-btn-shimmer" />}
                <span style={{ position: "relative", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {isPending ? "Signing in…" : <>Sign In <ArrowRight style={{ width: 16, height: 16 }} /></>}
                </span>
              </button>

              {/* Demo accounts */}
              <div style={{ borderRadius: 13, padding: "12px 14px",
                background: "linear-gradient(145deg,#f5fbf5,#edf7ed)",
                border: "1.5px solid #d1e8d1" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#5d7a5e",
                  marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em",
                  fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12 }}>⚡</span> Demo · password: password123
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DEMO_ACCOUNTS.map(d => (
                    <button key={d.label} type="button" className="auth-demo-pill"
                      onClick={() => fillDemo(d.email)}>
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: 13, color: "#8fa98f",
                fontFamily: "'Inter',sans-serif" }}>
                No account?{" "}
                <button type="button" onClick={() => switchMode("signup")}
                  style={{ border: "none", background: "none", cursor: "pointer",
                    color: "#2e7d32", fontWeight: 800, fontSize: 13,
                    fontFamily: "'Inter',sans-serif" }}>
                  Create one →
                </button>
              </div>
            </form>
          )}

          {/* ─── SIGN UP ─── */}
          {mode === "signup" && (
            <form onSubmit={signUpForm.handleSubmit(onSignUp)}
              style={{ display: "flex", flexDirection: "column", gap: 12,
                animation: "auth-fade-in .3s ease" }}>

              <div>
                <FieldLabel>Full Name</FieldLabel>
                <div className="auth-input-wrap">
                  <User className="auth-input-icon" style={{ width: 15, height: 15 }} />
                  <input className="auth-input" type="text" placeholder="Rahul Sharma"
                    data-testid="input-fullname" {...signUpForm.register("fullName")} />
                </div>
                <ErrMsg msg={signUpForm.formState.errors.fullName?.message} />
              </div>

              <div>
                <FieldLabel>Email Address</FieldLabel>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" style={{ width: 15, height: 15 }} />
                  <input className="auth-input" type="email" placeholder="you@example.com"
                    data-testid="input-signup-email" {...signUpForm.register("email")} />
                </div>
                <ErrMsg msg={signUpForm.formState.errors.email?.message} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <div className="auth-input-wrap">
                    <Lock className="auth-input-icon" style={{ width: 15, height: 15 }} />
                    <input className="auth-input" type={showPw ? "text" : "password"}
                      placeholder="Min. 6 chars" style={{ paddingRight: 36 }}
                      data-testid="input-signup-password" {...signUpForm.register("password")} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: "absolute", right: 10, top: "50%",
                        transform: "translateY(-50%)", border: "none",
                        background: "none", cursor: "pointer", color: "#81c784", padding: 0 }}>
                      {showPw ? <EyeOff style={{ width: 13, height: 13 }} />
                              : <Eye    style={{ width: 13, height: 13 }} />}
                    </button>
                  </div>
                  <ErrMsg msg={signUpForm.formState.errors.password?.message} />
                </div>

                <div>
                  <FieldLabel>Phone <span style={{ textTransform: "none", fontWeight: 500,
                    color: "#a5c5a5", letterSpacing: 0 }}>(opt.)</span></FieldLabel>
                  <div className="auth-input-wrap">
                    <Phone className="auth-input-icon" style={{ width: 15, height: 15 }} />
                    <input className="auth-input" type="tel" placeholder="+91 98765…"
                      data-testid="input-phone" {...signUpForm.register("phone")} />
                  </div>
                </div>
              </div>

              {/* Role cards */}
              <div>
                <FieldLabel>Your Role</FieldLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                  {ROLES.slice(0, 3).map(r => (
                    <div key={r.value}
                      className={`auth-role-card ${selRole === r.value ? "selected" : ""}`}
                      onClick={() => { setSelRole(r.value); signUpForm.setValue("role", r.value); signUpForm.clearErrors("role"); }}
                      data-testid={`role-card-${r.value}`}>
                      <div style={{ fontSize: 22, marginBottom: 3 }}>{r.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#1a2e1a",
                        fontFamily: "'Inter',sans-serif" }}>{r.label}</div>
                      <div style={{ fontSize: 10, color: "#6b8f6b", marginTop: 1 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 7 }}>
                  {ROLES.slice(3).map(r => (
                    <div key={r.value}
                      className={`auth-role-card ${selRole === r.value ? "selected" : ""}`}
                      onClick={() => { setSelRole(r.value); signUpForm.setValue("role", r.value); signUpForm.clearErrors("role"); }}
                      data-testid={`role-card-${r.value}`}>
                      <div style={{ fontSize: 22, marginBottom: 3 }}>{r.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#1a2e1a",
                        fontFamily: "'Inter',sans-serif" }}>{r.label}</div>
                      <div style={{ fontSize: 10, color: "#6b8f6b", marginTop: 1 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
                <ErrMsg msg={signUpForm.formState.errors.role?.message} />
              </div>

              <button type="submit" disabled={isPending} className="auth-btn"
                data-testid="button-signup" style={{ marginTop: 2 }}>
                {isPending && <span className="auth-btn-shimmer" />}
                <span style={{ position: "relative", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {isPending ? "Creating account…"
                    : <>Create Account <ArrowRight style={{ width: 16, height: 16 }} /></>}
                </span>
              </button>

              <div style={{ textAlign: "center", fontSize: 13, color: "#8fa98f",
                fontFamily: "'Inter',sans-serif" }}>
                Already have an account?{" "}
                <button type="button" onClick={() => switchMode("signin")}
                  style={{ border: "none", background: "none", cursor: "pointer",
                    color: "#2e7d32", fontWeight: 800, fontSize: 13,
                    fontFamily: "'Inter',sans-serif" }}>
                  Sign in →
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: "10px 28px 16px", borderTop: "1px solid #eaf4ea",
          textAlign: "center", fontSize: 10, color: "#a5c5a5",
          fontFamily: "'Inter',sans-serif",
          background: "linear-gradient(135deg,#f8fbf8,#f2f9f2)" }}>
          © 2025 SwachhSaathi Technologies · 🌿 Building a cleaner India
        </div>
      </div>
    </div>
  );
}
