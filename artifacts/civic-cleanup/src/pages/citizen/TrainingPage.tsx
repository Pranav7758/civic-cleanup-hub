import { useState, useRef } from "react";
import {
  useGetTrainingModules, useGetTrainingProgress, useUpdateTrainingProgress,
  getGetTrainingProgressQueryKey, getGetWalletTransactionsQueryKey, getGetCleanlinessScoreQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, BookOpen, CheckCircle, Lock, Play, Award, X, RefreshCw, Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/training.css";

/* ══════════════════════════════════════════════════════════
   RICH MODULE CONTENT  (matched to DB by sortOrder 0-4)
══════════════════════════════════════════════════════════ */
interface QuizQuestion { question: string; options: string[]; correct: number; }
interface RichLesson  { title: string; duration: string; }
interface RichModule  {
  emoji: string; color: string; gradient: string;
  videoId: string;           // YouTube video ID
  thumbnailId?: string;      // override thumbnail if different
  lessons: RichLesson[];
  intro: string;
  quiz: QuizQuestion[];
}

const RICH: RichModule[] = [
  /* ─── 0: Waste Segregation Basics ─── */
  {
    emoji: "🗑️",
    color: "#2e7d32",
    gradient: "linear-gradient(135deg,#1b5e20,#388e3c)",
    videoId: "gUPRWCz4bkU",
    lessons: [
      { title: "Why segregation matters",          duration: "4 min" },
      { title: "Wet vs Dry vs Hazardous waste",    duration: "5 min" },
      { title: "Color-coded bin system in India",  duration: "4 min" },
      { title: "Practical tips for your home",     duration: "7 min" },
    ],
    intro: "Learn how India's three-bin system works and why separating waste at the source is the single most important step in managing solid waste sustainably.",
    quiz: [
      {
        question: "Which bin should kitchen vegetable peels and food scraps go into?",
        options: ["Dry/Blue bin", "Wet/Green bin", "Hazardous/Red bin", "Any bin — it doesn't matter"],
        correct: 1,
      },
      {
        question: "What color bin is used for DRY recyclable waste (paper, plastic, metal) in India?",
        options: ["Green", "Red", "Blue", "Black"],
        correct: 2,
      },
      {
        question: "Which of the following is considered DRY waste?",
        options: ["Vegetable peels", "Leftover cooked food", "Old newspaper", "Tea leaves"],
        correct: 2,
      },
      {
        question: "What is the PRIMARY benefit of segregating waste at source?",
        options: [
          "Makes bins look colorful",
          "Reduces landfill burden and enables efficient recycling",
          "Increases waste collection fees",
          "None of the above",
        ],
        correct: 1,
      },
    ],
  },

  /* ─── 1: Composting at Home ─── */
  {
    emoji: "🌱",
    color: "#388e3c",
    gradient: "linear-gradient(135deg,#2e7d32,#558b2f)",
    videoId: "ySIaGAJmJrU",
    lessons: [
      { title: "What is composting?",                   duration: "3 min" },
      { title: "Brown vs Green materials",               duration: "4 min" },
      { title: "Setting up your compost bin",            duration: "5 min" },
      { title: "Maintaining moisture and aeration",      duration: "5 min" },
      { title: "Using finished compost in your garden",  duration: "8 min" },
    ],
    intro: "Composting turns your kitchen and garden waste into nutrient-rich 'black gold'. Learn how to build and maintain a compost pile right at home.",
    quiz: [
      {
        question: "What is the ideal carbon-to-nitrogen (C:N) ratio for a healthy compost pile?",
        options: ["1:1", "5:1", "25–30:1", "100:1"],
        correct: 2,
      },
      {
        question: "Which of the following is a 'GREEN' (nitrogen-rich) compost material?",
        options: ["Dry cardboard", "Dried autumn leaves", "Fresh vegetable kitchen scraps", "Wood chips"],
        correct: 2,
      },
      {
        question: "How often should a backyard compost pile be turned for optimal decomposition?",
        options: ["Every day", "Every 1–2 weeks", "Once a month", "Never — just leave it"],
        correct: 1,
      },
      {
        question: "Which sign tells you compost is fully ready to use?",
        options: [
          "It smells like fresh, earthy soil and looks dark and crumbly",
          "It still has large visible food chunks",
          "It is very wet and slimy",
          "It has a strong sulfur (rotten egg) smell",
        ],
        correct: 0,
      },
    ],
  },

  /* ─── 2: Hazardous Waste Disposal ─── */
  {
    emoji: "⚠️",
    color: "#e65100",
    gradient: "linear-gradient(135deg,#bf360c,#e64a19)",
    videoId: "RS7IzU2VJIQ",
    lessons: [
      { title: "What counts as hazardous waste?",              duration: "4 min" },
      { title: "Household chemicals — safe storage",           duration: "5 min" },
      { title: "Batteries, paints & medicines",                duration: "5 min" },
      { title: "Finding authorised disposal points near you",  duration: "6 min" },
      { title: "Emergency spill response",                     duration: "10 min" },
    ],
    intro: "Batteries, pesticides, paints, and medicines are hazardous. Disposing them incorrectly poisons soil and groundwater. This module shows you the safe way.",
    quiz: [
      {
        question: "Which of the following is classified as HAZARDOUS waste?",
        options: ["Cardboard boxes", "Vegetable peels", "Used batteries", "Old newspapers"],
        correct: 2,
      },
      {
        question: "Where should expired or unused medicines be disposed of?",
        options: [
          "Regular household trash bin",
          "Flushed down the toilet",
          "At authorised pharmacy or hospital take-back programs",
          "Burned at home",
        ],
        correct: 2,
      },
      {
        question: "What symbol is internationally used to label hazardous waste containers?",
        options: [
          "Green recycling arrows",
          "Blue water droplet",
          "Orange/red hazard diamond or skull-and-crossbones",
          "Yellow sun",
        ],
        correct: 2,
      },
      {
        question: "If a household chemical spills, what should you do FIRST?",
        options: [
          "Wash it down the nearest drain immediately",
          "Leave it to evaporate on its own",
          "Wear protective gloves, ventilate the area, and clean up per label instructions",
          "Pour another chemical on it to neutralise",
        ],
        correct: 2,
      },
    ],
  },

  /* ─── 3: Recycling Best Practices ─── */
  {
    emoji: "♻️",
    color: "#1565c0",
    gradient: "linear-gradient(135deg,#0d47a1,#1976d2)",
    videoId: "kzqhCnGhFAk",
    lessons: [
      { title: "The recycling loop explained",          duration: "3 min" },
      { title: "How to prepare plastic for recycling",  duration: "5 min" },
      { title: "Paper and cardboard guidelines",        duration: "4 min" },
    ],
    intro: "Recycling only works when materials are clean and correctly sorted. This module teaches you exactly how to prepare common household recyclables.",
    quiz: [
      {
        question: "Before placing a plastic bottle in the recycle bin, you should:",
        options: [
          "Crush it and leave the cap on",
          "Rinse it clean and remove the cap",
          "Leave any food residue inside — it's fine",
          "Cut it into small pieces",
        ],
        correct: 1,
      },
      {
        question: "Which plastic resin type (by recycling number) is most widely recycled in India?",
        options: ["PVC — Type 3", "PET — Type 1", "Polystyrene — Type 6", "Mixed plastics — Type 7"],
        correct: 1,
      },
      {
        question: "Approximately how many times can paper be recycled before fibres become too short?",
        options: ["1–2 times", "3–4 times", "5–7 times", "20+ times"],
        correct: 2,
      },
      {
        question: "What is 'contamination' in the context of recycling?",
        options: [
          "Placing too many items in one bin",
          "Mixing non-recyclables (food waste, liquids) in with recyclables",
          "Using the wrong colour recycling bin",
          "Separating items by material type",
        ],
        correct: 1,
      },
    ],
  },

  /* ─── 4: E-Waste Management ─── */
  {
    emoji: "📱",
    color: "#6a1b9a",
    gradient: "linear-gradient(135deg,#4a148c,#7b1fa2)",
    videoId: "ITEuRVPkPbw",
    lessons: [
      { title: "What qualifies as e-waste?",                    duration: "3 min" },
      { title: "Toxic materials inside electronics",            duration: "4 min" },
      { title: "Extended Producer Responsibility (EPR) in India", duration: "5 min" },
      { title: "Finding authorised e-waste collection centres", duration: "8 min" },
    ],
    intro: "India is the world's third-largest e-waste generator. Phones, laptops and TVs contain lead, mercury and cadmium. Learn how to dispose of them responsibly.",
    quiz: [
      {
        question: "Which of the following is an example of e-waste?",
        options: ["A glass bottle", "An old mobile phone", "A cardboard box", "A plastic carry bag"],
        correct: 1,
      },
      {
        question: "Why should e-waste NEVER go into regular household trash bins?",
        options: [
          "It is too heavy for bin trucks",
          "Electronics contain toxic metals like lead, mercury and cadmium that leach into soil and water",
          "It takes up too much space in landfills",
          "It is too financially valuable to throw away",
        ],
        correct: 1,
      },
      {
        question: "What is the CORRECT way to dispose of an old smartphone in India?",
        options: [
          "Throw it in the general wet-waste bin",
          "Burn it to recover metals",
          "Drop it off at an authorised e-waste collection or take-back centre",
          "Bury it in the ground away from water sources",
        ],
        correct: 2,
      },
      {
        question: "Which Indian legislation specifically governs the management of e-waste?",
        options: [
          "Swachh Bharat Mission 2014",
          "E-Waste (Management) Rules, 2016 (amended 2022)",
          "Plastic Waste Management Rules 2016",
          "Solid Waste Management Rules 2016",
        ],
        correct: 1,
      },
    ],
  },
];

const PASS_THRESHOLD = 3; // out of 4 correct to pass
const POINTS_PER_MODULE = 75;

/* ══════════════════════════════════════════════════════════
   CERTIFICATE (printable new window)
══════════════════════════════════════════════════════════ */
function openCertificate(userName: string, modules: any[], progressList: any[]) {
  const completedModules = modules.filter((_: any, i: number) => {
    const prog = progressList.find((p: any) => p.moduleId === modules[i]?.id);
    return prog?.completed;
  });
  const certId = `SS-${Date.now().toString(36).toUpperCase()}`;
  const date = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
  const totalPoints = completedModules.length * POINTS_PER_MODULE;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>SwachhSaathi — Certificate of Completion</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#f5f0e8;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Inter',sans-serif;padding:20px}
  .cert{background:linear-gradient(160deg,#fffde7,#fafae0);border:4px solid #f9a825;border-radius:16px;max-width:740px;width:100%;padding:44px 50px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.18)}
  .cert::after{content:'';position:absolute;inset:12px;border:1.5px solid rgba(249,168,37,0.4);border-radius:8px;pointer-events:none}
  .corner{position:absolute;font-size:30px;opacity:.7}
  .tl{top:16px;left:20px}.tr{top:16px;right:20px}.bl{bottom:16px;left:20px}.br{bottom:16px;right:20px}
  .top-bar{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:28px}
  .logo-circle{width:54px;height:54px;background:linear-gradient(135deg,#1b5e20,#4caf50);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 4px 14px rgba(27,94,32,0.35)}
  .brand{font-size:26px;font-weight:800;color:#1b5e20;letter-spacing:-.01em}
  .brand span{color:#4caf50}
  .sub{font-size:11px;color:#81c784;font-weight:700;letter-spacing:.12em;text-align:center}
  .divider{height:2px;background:linear-gradient(90deg,transparent,#f9a825,transparent);margin:22px 0}
  .cert-of{font-size:13px;font-weight:700;color:#8d6e63;text-transform:uppercase;letter-spacing:.12em;text-align:center;margin-bottom:6px}
  .cert-title{font-family:'Playfair Display',serif;font-size:34px;color:#1a2e1a;text-align:center;line-height:1.2;margin-bottom:20px}
  .cert-body{font-size:15px;color:#4a5a4a;text-align:center;line-height:1.7;margin-bottom:10px}
  .name{font-family:'Playfair Display',serif;font-size:32px;font-style:italic;color:#1b5e20;border-bottom:2px solid #a5d6a7;display:inline-block;padding-bottom:4px;margin:8px 0}
  .modules-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px 0}
  .mod-chip{background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:#2e7d32;display:flex;align-items:center;gap:7px}
  .stats-row{display:flex;justify-content:center;gap:40px;margin:16px 0}
  .stat-item{text-align:center}
  .stat-val{font-size:24px;font-weight:900;color:#2e7d32}
  .stat-lbl{font-size:11px;color:#81c784;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
  .sig-row{display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px}
  .sig-block{text-align:center;min-width:160px}
  .sig-line{border-top:1.5px solid #bdbdbd;padding-top:6px;margin-top:24px;font-size:12px;color:#6d7a6d;font-weight:700}
  .cert-id{text-align:center;margin-top:14px;font-size:11px;color:#a5b5a5}
  .seal{width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,#1b5e20,#4caf50);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(27,94,32,0.4);margin:0 auto}
  .seal-text{font-size:8px;font-weight:900;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:.06em;line-height:1.4}
  @media print{
    body{background:#fff;padding:0}
    .cert{box-shadow:none;border:3px solid #f9a825}
    .print-btn{display:none!important}
  }
  .print-btn{display:block;margin:20px auto 0;padding:12px 32px;background:linear-gradient(145deg,#4caf50,#2e7d32);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 4px 14px rgba(27,94,32,0.4)}
</style>
</head>
<body>
<div>
  <div class="cert">
    <span class="corner tl">🌿</span>
    <span class="corner tr">🌿</span>
    <span class="corner bl">♻️</span>
    <span class="corner br">♻️</span>

    <div class="top-bar">
      <div class="logo-circle">🌍</div>
      <div>
        <div class="brand">Swachh<span>Saathi</span></div>
        <div class="sub">INDIA'S CIVIC PLATFORM</div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="cert-of">Certificate of Completion</div>
    <div class="cert-title">Eco-Citizen Training Programme</div>

    <div class="cert-body">
      This is to certify that
    </div>
    <div style="text-align:center">
      <span class="name">${userName}</span>
    </div>
    <div class="cert-body" style="margin-top:10px">
      has successfully completed all required modules of the<br/>
      <strong>SwachhSaathi Eco-Citizen Certification Programme</strong><br/>
      demonstrating knowledge and commitment to civic cleanliness and environmental sustainability.
    </div>

    <div class="modules-grid">
      ${completedModules.map((m: any, i: number) => {
        const rich = RICH[m.sortOrder] || RICH[i];
        return `<div class="mod-chip"><span>${rich?.emoji || "📘"}</span>${m.title}</div>`;
      }).join("")}
    </div>

    <div class="stats-row">
      <div class="stat-item"><div class="stat-val">${completedModules.length}</div><div class="stat-lbl">Modules</div></div>
      <div class="stat-item"><div class="stat-val">${totalPoints}</div><div class="stat-lbl">Points Earned</div></div>
      <div class="stat-item"><div class="stat-val">${date}</div><div class="stat-lbl">Completion Date</div></div>
    </div>

    <div class="divider"></div>

    <div class="sig-row">
      <div class="sig-block">
        <div style="font-size:20px;font-family:'Playfair Display',serif;font-style:italic;color:#1b5e20">SwachhSaathi</div>
        <div class="sig-line">Platform Authority</div>
      </div>
      <div>
        <div class="seal">
          <div class="seal-text">✓<br/>VERIFIED<br/>ECO<br/>CITIZEN</div>
        </div>
      </div>
      <div class="sig-block">
        <div style="font-size:20px;font-family:'Playfair Display',serif;font-style:italic;color:#1b5e20">Civic India</div>
        <div class="sig-line">Programme Director</div>
      </div>
    </div>

    <div class="cert-id">Certificate ID: ${certId} · Issued by SwachhSaathi Technologies · Digitally Verified</div>
  </div>
  <button class="print-btn" onclick="window.print()">🖨 Print Certificate</button>
</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

/* ══════════════════════════════════════════════════════════
   MODULE VIEWER  (video + quiz modal)
══════════════════════════════════════════════════════════ */
interface ViewerProps {
  mod: any;
  rich: RichModule;
  idx: number;
  onClose: () => void;
  onComplete: (moduleId: string) => void;
  alreadyCompleted: boolean;
}

function ModuleViewer({ mod, rich, idx, onClose, onComplete, alreadyCompleted }: ViewerProps) {
  const [activeLesson, setActiveLesson]   = useState(0);
  const [quizAnswers,  setQuizAnswers]    = useState<Record<number, number>>({});
  const [submitted,    setSubmitted]      = useState(false);
  const [score,        setScore]          = useState(0);
  const [phase,        setPhase]          = useState<"video"|"quiz">("video");
  const [watched,      setWatched]        = useState(alreadyCompleted);
  const [playing,      setPlaying]        = useState(false);

  const allAnswered = rich.quiz.every((_, i) => quizAnswers[i] !== undefined);
  const correctCount = Object.entries(quizAnswers).filter(
    ([qi, ans]) => rich.quiz[Number(qi)]?.correct === ans
  ).length;

  const handleSubmit = () => {
    const sc = correctCount;
    setScore(sc);
    setSubmitted(true);
    if (sc >= PASS_THRESHOLD && !alreadyCompleted) onComplete(mod.id);
  };

  const handleRetry = () => {
    setQuizAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className="tr-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tr-modal">

        {/* Header */}
        <div className="tr-modal-header">
          <div style={{ fontSize:28 }}>{rich.emoji}</div>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(165,214,167,.7)",
              textTransform:"uppercase", letterSpacing:".09em" }}>Module {idx+1}</div>
            <div style={{ fontSize:17, fontWeight:800, color:"#fff",
              fontFamily:"'Inter',sans-serif", lineHeight:1.2 }}>{mod.title}</div>
          </div>
          <button className="tr-modal-close" onClick={onClose}><X size={15}/></button>
        </div>

        {/* Phase nav */}
        <div style={{ display:"flex", borderBottom:"1px solid #e0ece0",
          background:"linear-gradient(135deg,#f8fbf8,#f0f7f0)" }}>
          {[
            { key:"video", label:"📹 Video Lesson" },
            { key:"quiz",  label:"📝 Knowledge Quiz" },
          ].map(p => (
            <button key={p.key}
              onClick={() => setPhase(p.key as any)}
              style={{
                flex:1, padding:"11px 0", border:"none", cursor:"pointer",
                fontSize:13, fontWeight:700, fontFamily:"'Inter',sans-serif",
                background:"none",
                color: phase === p.key ? "#2e7d32" : "#8fa98f",
                borderBottom: phase === p.key ? "2.5px solid #4caf50" : "2.5px solid transparent",
                transition:"color .15s, border-color .15s",
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* ── VIDEO PHASE ── */}
        {phase === "video" && (
          <>
            {/* ── Inline YouTube player ── */}
            <div style={{ position:"relative", margin:"0 0 4px",
              borderRadius:16, overflow:"hidden",
              background:"#000", aspectRatio:"16/9",
              boxShadow:"0 8px 24px rgba(0,0,0,.35)" }}>

              {playing ? (
                /* ── Real YouTube iframe — plays inline ── */
                <iframe
                  src={`https://www.youtube.com/embed/${rich.videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                  style={{ width:"100%", height:"100%", border:"none", display:"block" }}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={mod.title}
                />
              ) : (
                <>
                  {/* Thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${rich.videoId}/maxresdefault.jpg`}
                    alt={mod.title}
                    style={{ width:"100%", height:"100%", objectFit:"cover",
                      display:"block", filter:"brightness(.6)" }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        `https://img.youtube.com/vi/${rich.videoId}/mqdefault.jpg`;
                    }}
                  />
                  {/* Dark gradient */}
                  <div style={{ position:"absolute", inset:0,
                    background:"linear-gradient(to top,rgba(0,0,0,.7) 0%,rgba(0,0,0,.1) 60%,transparent 100%)",
                    pointerEvents:"none" }} />

                  {/* Centre play button — click to embed & play */}
                  <button
                    style={{ position:"absolute", inset:0,
                      display:"flex", flexDirection:"column",
                      alignItems:"center", justifyContent:"center",
                      background:"none", border:"none", cursor:"pointer" }}
                    onClick={() => { setPlaying(true); setWatched(true); }}>
                    <div style={{ width:70, height:70, borderRadius:"50%",
                      background:"rgba(255,0,0,.92)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:"0 4px 24px rgba(255,0,0,.55)",
                      fontSize:28, color:"#fff",
                      transition:"transform .2s, box-shadow .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform="scale(1.12)"; e.currentTarget.style.boxShadow="0 6px 32px rgba(255,0,0,.7)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 24px rgba(255,0,0,.55)"; }}>
                      ▶
                    </div>
                    <div style={{ color:"#fff", fontSize:13, fontWeight:700,
                      marginTop:12, fontFamily:"'Inter',sans-serif",
                      textShadow:"0 1px 4px rgba(0,0,0,.7)",
                      background:"rgba(0,0,0,.45)", borderRadius:999,
                      padding:"4px 14px" }}>
                      ▶ Play Video
                    </div>
                  </button>

                  {/* Bottom info */}
                  <div style={{ position:"absolute", bottom:12, left:16, right:16,
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    pointerEvents:"none" }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.85)",
                      fontWeight:700, fontFamily:"'Inter',sans-serif",
                      background:"rgba(0,0,0,.55)", borderRadius:999,
                      padding:"3px 10px" }}>
                      ⏱ {mod.durationMinutes} min
                    </div>
                    {watched && (
                      <div style={{ fontSize:11, color:"#69f0ae", fontWeight:800,
                        background:"rgba(0,0,0,.6)", borderRadius:999,
                        padding:"3px 10px" }}>
                        ✓ Watched
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Watched status bar */}
            <div style={{ margin:"6px 0 2px", padding:"11px 16px", borderRadius:14,
              background: watched
                ? "linear-gradient(145deg,#e8f5e9,#dcedc8)"
                : "linear-gradient(145deg,#fff8f0,#fff3e0)",
              border: watched ? "1.5px solid #a5d6a7" : "1.5px dashed #ffcc80",
              display:"flex", alignItems:"center", gap:12,
              transition:"all .25s",
              boxShadow: watched ? "2px 2px 8px rgba(76,175,80,.15)" : "none" }}>
              <div style={{ width:28, height:28, borderRadius:"50%",
                background: watched ? "#4caf50" : "#ffb300",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:15, flexShrink:0,
                boxShadow: watched ? "2px 2px 6px rgba(76,175,80,.4)" : "2px 2px 6px rgba(255,179,0,.4)" }}>
                {watched ? "✓" : "▶"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:800,
                  color: watched ? "#1b5e20" : "#e65100", fontFamily:"'Inter',sans-serif" }}>
                  {watched ? "Video watched — quiz is unlocked!" : "Press ▶ Play Video above to watch, then take the quiz"}
                </div>
                <div style={{ fontSize:10, color: watched ? "#2e7d32" : "#bf360c",
                  marginTop:2, fontFamily:"'Inter',sans-serif" }}>
                  {watched ? "You can now take the quiz to earn points" : "Video plays right here in the app — no need to leave"}
                </div>
              </div>
              {!watched && (
                <button
                  onClick={() => { setPlaying(true); setWatched(true); }}
                  style={{ fontSize:11, fontWeight:800, color:"#e65100",
                    background:"#fff3e0", border:"1.5px solid #ffcc80",
                    borderRadius:999, padding:"4px 12px",
                    cursor:"pointer", whiteSpace:"nowrap" }}>
                  ▶ Watch Now
                </button>
              )}
            </div>

            <div className="tr-content-row">
              {/* Main desc */}
              <div className="tr-main-col">
                <div style={{ fontSize:11, fontWeight:800, color:"#81c784",
                  textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>
                  About this module
                </div>
                <p style={{ fontSize:13, color:"#4a5a4a", lineHeight:1.7,
                  fontFamily:"'Inter',sans-serif", marginBottom:18 }}>
                  {rich.intro}
                </p>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:18 }}>
                  {[
                    { icon:"⏱", label:`${mod.durationMinutes} minutes` },
                    { icon:"📚", label:`${rich.lessons.length} lessons` },
                    { icon:"🏆", label:`${POINTS_PER_MODULE} pts on pass` },
                  ].map(m => (
                    <div key={m.label} style={{ display:"flex", alignItems:"center", gap:6,
                      padding:"5px 12px", background:"#e8f5e9", borderRadius:999,
                      fontSize:12, fontWeight:700, color:"#2e7d32",
                      fontFamily:"'Inter',sans-serif", border:"1px solid #a5d6a7" }}>
                      <span>{m.icon}</span>{m.label}
                    </div>
                  ))}
                </div>
                <button
                  disabled={!watched}
                  onClick={() => setPhase("quiz")}
                  style={{
                    padding:"10px 24px", border:"none", borderRadius:12,
                    background:"linear-gradient(145deg,#4caf50,#2e7d32)",
                    color:"#fff", fontWeight:800, fontSize:13,
                    fontFamily:"'Inter',sans-serif", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:8,
                    boxShadow:"3px 4px 10px rgba(27,94,32,0.35)",
                  }}>
                  Take the Quiz →
                </button>
              </div>

              {/* Lessons sidebar */}
              <div className="tr-sidebar">
                <div style={{ fontSize:11, fontWeight:800, color:"#5d7a5e",
                  textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>
                  Lesson Chapters
                </div>
                {rich.lessons.map((l, i) => (
                  <div key={i}
                    className={`tr-lesson-item ${i === activeLesson ? "active" : ""}`}
                    onClick={() => setActiveLesson(i)}>
                    <div className={`tr-lesson-dot ${i < activeLesson ? "done" : i === activeLesson ? "active-dot" : ""}`}>
                      {i < activeLesson ? "✓" : i+1}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#1a2e1a",
                        fontFamily:"'Inter',sans-serif" }}>{l.title}</div>
                      <div style={{ fontSize:10, color:"#81c784", marginTop:1 }}>{l.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── QUIZ PHASE ── */}
        {phase === "quiz" && (
          <div className="tr-quiz">
            <div className="tr-quiz-header">
              <div style={{ fontSize:20, fontWeight:900, color:"#1a2e1a",
                fontFamily:"'Inter',sans-serif" }}>Knowledge Check</div>
              <div className="tr-quiz-badge">Score ≥ {PASS_THRESHOLD}/4 to pass</div>
              {alreadyCompleted && (
                <div className="tr-quiz-badge" style={{ background:"#e8f5e9",
                  color:"#2e7d32", border:"1px solid #a5d6a7" }}>✓ Already Completed</div>
              )}
            </div>

            {/* Questions */}
            {!submitted && rich.quiz.map((q, qi) => (
              <div key={qi} className="tr-question">
                <div className="tr-q-text">
                  <span className="tr-q-num">{qi+1}</span>
                  {q.question}
                </div>
                {q.options.map((opt, oi) => (
                  <div key={oi}
                    className={`tr-option ${quizAnswers[qi] === oi ? "selected" : ""}`}
                    onClick={() => !submitted && setQuizAnswers(prev => ({...prev, [qi]: oi}))}>
                    <div className="tr-option-radio">
                      {quizAnswers[qi] === oi && (
                        <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }}/>
                      )}
                    </div>
                    <span>{String.fromCharCode(65+oi)}. {opt}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Show correct/wrong after submit */}
            {submitted && rich.quiz.map((q, qi) => (
              <div key={qi} className="tr-question">
                <div className="tr-q-text">
                  <span className="tr-q-num">{qi+1}</span>
                  {q.question}
                </div>
                {q.options.map((opt, oi) => (
                  <div key={oi}
                    className={`tr-option ${oi === q.correct ? "correct" : quizAnswers[qi] === oi ? "wrong" : ""}`}>
                    <div className="tr-option-radio">
                      {oi === q.correct && (
                        <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }}/>
                      )}
                    </div>
                    <span>
                      {String.fromCharCode(65+oi)}. {opt}
                      {oi === q.correct && " ✓"}
                      {oi !== q.correct && quizAnswers[qi] === oi && " ✗"}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {/* Result banner */}
            {submitted && (
              <div className={score >= PASS_THRESHOLD ? "tr-result-pass" : "tr-result-fail"}>
                {score >= PASS_THRESHOLD ? (
                  <>
                    <div style={{ fontSize:48, marginBottom:8 }}>🎉</div>
                    <div style={{ fontSize:20, fontWeight:900, color:"#1b5e20",
                      fontFamily:"'Inter',sans-serif", marginBottom:4 }}>
                      Excellent! You Passed!
                    </div>
                    <div style={{ fontSize:13, color:"#2e7d32", marginBottom:14,
                      fontFamily:"'Inter',sans-serif" }}>
                      You scored <strong>{score}/4</strong> ({Math.round(score/4*100)}%).
                      {!alreadyCompleted && ` +${POINTS_PER_MODULE} points have been added to your wallet!`}
                      {alreadyCompleted && " Module was already completed — no duplicate points."}
                    </div>
                    <button onClick={onClose}
                      style={{ padding:"10px 24px", background:"linear-gradient(145deg,#4caf50,#2e7d32)",
                        color:"#fff", border:"none", borderRadius:12,
                        fontSize:13, fontWeight:800, fontFamily:"'Inter',sans-serif",
                        cursor:"pointer", boxShadow:"3px 3px 10px rgba(27,94,32,0.4)" }}>
                      Back to Modules
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize:48, marginBottom:8 }}>😕</div>
                    <div style={{ fontSize:20, fontWeight:900, color:"#b45309",
                      fontFamily:"'Inter',sans-serif", marginBottom:4 }}>
                      Almost there!
                    </div>
                    <div style={{ fontSize:13, color:"#92400e", marginBottom:14,
                      fontFamily:"'Inter',sans-serif" }}>
                      You scored <strong>{score}/4</strong>. You need at least {PASS_THRESHOLD}/4 to pass.
                      Review the video and try again!
                    </div>
                    <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                      <button onClick={handleRetry}
                        style={{ padding:"10px 20px", background:"linear-gradient(145deg,#ff8f00,#f57f17)",
                          color:"#fff", border:"none", borderRadius:12,
                          fontSize:13, fontWeight:800, fontFamily:"'Inter',sans-serif",
                          cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
                        <RefreshCw size={14}/> Retry Quiz
                      </button>
                      <button onClick={() => setPhase("video")}
                        style={{ padding:"10px 20px", background:"#e8f5e9",
                          color:"#2e7d32", border:"1.5px solid #a5d6a7", borderRadius:12,
                          fontSize:13, fontWeight:800, fontFamily:"'Inter',sans-serif",
                          cursor:"pointer" }}>
                        Re-watch Video
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Submit button */}
            {!submitted && (
              <div style={{ marginTop:20, display:"flex", alignItems:"center", gap:14 }}>
                <button
                  className="tr-quiz-submit"
                  disabled={!allAnswered}
                  onClick={handleSubmit}>
                  <CheckCircle size={16}/>
                  Submit Answers
                </button>
                {!allAnswered && (
                  <span style={{ fontSize:12, color:"#8fa98f", fontFamily:"'Inter',sans-serif" }}>
                    Answer all {rich.quiz.length} questions to submit
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function TrainingPage() {
  const { toast } = useToast();
  const { user }  = useAuth();
  const qc        = useQueryClient();

  const { data: modulesData,  isLoading } = useGetTrainingModules();
  const { data: progressData            } = useGetTrainingProgress();
  const updateProgress = useUpdateTrainingProgress();

  const modules:      any[] = (modulesData  as any)?.data || [];
  const progressList: any[] = (progressData as any)?.data || [];

  const [openModule, setOpenModule] = useState<any>(null);
  const [showCert,   setShowCert]   = useState(false);

  const getProgress    = (moduleId: string) => progressList.find(p => p.moduleId === moduleId);
  const completedCount = progressList.filter(p => p.completed).length;
  const totalPct       = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;
  const totalPointsEarned = completedCount * POINTS_PER_MODULE;
  const allDone        = modules.length > 0 && completedCount >= modules.length;

  const handleComplete = (moduleId: string) => {
    updateProgress.mutate({ data: { moduleId, progress: 100, completed: true } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTrainingProgressQueryKey() });
        qc.invalidateQueries({ queryKey: getGetWalletTransactionsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetCleanlinessScoreQueryKey() });
        const mod = modules.find(m => m.id === moduleId);
        toast({
          title: "🎉 Module Completed!",
          description: `"${mod?.title}" — +${POINTS_PER_MODULE} pts added to your wallet!`,
        });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const openMod = (mod: any) => {
    const idx    = modules.findIndex(m => m.id === mod.id);
    const locked = mod.requiresPrevious && idx > 0 && !getProgress(modules[idx-1]?.id)?.completed;
    if (locked) { toast({ title: "Module Locked 🔒", description: "Complete the previous module first." }); return; }
    setOpenModule(mod);
  };

  const S: React.CSSProperties = { fontFamily:"'Inter',Arial,sans-serif" };

  return (
    <DashboardLayout title="Training Modules">
      <div style={{ ...S, display:"flex", flexDirection:"column", gap:18 }}>

        {/* ── Stats bar ── */}
        <div className="tr-stat-bar">
          <div className="tr-stat-chip">
            <div className="tr-stat-val">{completedCount}<span style={{ fontSize:16 }}>/{modules.length}</span></div>
            <div className="tr-stat-lbl">Modules Done</div>
          </div>
          <div className="tr-stat-chip">
            <div className="tr-stat-val">{totalPct}%</div>
            <div className="tr-stat-lbl">Overall Progress</div>
          </div>
          <div className="tr-stat-chip">
            <div className="tr-stat-val">{totalPointsEarned}</div>
            <div className="tr-stat-lbl">Points Earned</div>
          </div>
        </div>

        {/* ── Overall progress bar ── */}
        <div style={{ background:"linear-gradient(145deg,#fff,#f5fbf5)",
          borderRadius:16, padding:"16px 20px",
          border:"1.5px solid #e0ece0",
          boxShadow:"3px 3px 8px rgba(200,230,201,0.6),-1px -1px 5px rgba(255,255,255,.9)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#1a2e1a" }}>
              📚 Eco-Citizen Training Programme
            </div>
            <div style={{ fontSize:13, fontWeight:800, color:"#2e7d32" }}>{totalPct}% complete</div>
          </div>
          <div className="tr-progress-track" style={{ height:10 }}>
            <div className="tr-progress-fill" style={{ width:`${totalPct}%` }} />
          </div>
          <div style={{ fontSize:11, color:"#81c784", marginTop:6, fontWeight:600 }}>
            {allDone
              ? "🏆 Congratulations! You have completed all modules and earned your certificate!"
              : `Complete all ${modules.length} modules to earn your Eco-Citizen Certificate + 200 bonus points`}
          </div>
        </div>

        {/* ── Module cards ── */}
        {isLoading ? (
          <div className="tr-grid">
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ background:"#f0f7f0", borderRadius:18, height:320,
                animation:"pulse 1.5s infinite", border:"1.5px solid #e0ece0" }}/>
            ))}
          </div>
        ) : (
          <div className="tr-grid">
            {modules.map((mod: any, idx: number) => {
              const prog        = getProgress(mod.id);
              const isCompleted = prog?.completed;
              const pct         = prog?.progress || 0;
              const rich        = RICH[mod.sortOrder] ?? RICH[idx % RICH.length];
              const prevDone    = idx === 0 || !mod.requiresPrevious || getProgress(modules[idx-1]?.id)?.completed;
              const locked      = mod.requiresPrevious && !prevDone && idx > 0;
              const thumbUrl    = `https://img.youtube.com/vi/${rich.videoId}/mqdefault.jpg`;

              return (
                <div key={mod.id}
                  className={`tr-card ${locked ? "locked" : ""} ${isCompleted ? "completed" : ""}`}
                  data-testid={`module-card-${mod.id}`}>

                  {/* Thumbnail */}
                  <div className="tr-thumb">
                    <img
                      className="tr-thumb-img"
                      src={thumbUrl}
                      alt={mod.title}
                      onError={e => { (e.target as HTMLImageElement).style.display="none"; }}
                    />
                    {/* Gradient fallback */}
                    <div style={{ position:"absolute", inset:0, background:rich.gradient, opacity:.55 }}/>

                    {locked ? (
                      <div className="tr-lock-overlay">
                        <Lock style={{ width:28, height:28, color:"rgba(255,255,255,.9)" }}/>
                        <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.8)",
                          fontFamily:"'Inter',sans-serif" }}>Complete Module {idx}</div>
                      </div>
                    ) : (
                      <div className="tr-thumb-overlay">
                        <div className="tr-play-btn">
                          <Play style={{ width:22, height:22, color:rich.color, fill:rich.color, marginLeft:2 }}/>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="tr-completed-badge">
                        <CheckCircle style={{ width:10, height:10 }}/> Completed
                      </div>
                    )}
                    <div className="tr-points">+{POINTS_PER_MODULE} pts</div>
                  </div>

                  {/* Body */}
                  <div className="tr-card-body">
                    <div className="tr-module-num">Module {idx+1}</div>
                    <div style={{ fontSize:18, marginBottom:4 }}>{rich.emoji}</div>
                    <div className="tr-card-title">{mod.title}</div>
                    <div className="tr-card-desc">{mod.description}</div>

                    <div className="tr-meta">
                      <div className="tr-meta-item">
                        <Clock style={{ width:12, height:12 }}/> {mod.durationMinutes} min
                      </div>
                      <div className="tr-meta-item">
                        <BookOpen style={{ width:12, height:12 }}/> {rich.lessons.length} lessons
                      </div>
                    </div>

                    {pct > 0 && (
                      <div style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          fontSize:10, color:"#81c784", fontWeight:700, marginBottom:4 }}>
                          <span>Progress</span><span>{pct}%</span>
                        </div>
                        <div className="tr-progress-track">
                          <div className="tr-progress-fill" style={{ width:`${pct}%` }}/>
                        </div>
                      </div>
                    )}

                    <button
                      className={`tr-card-btn ${isCompleted ? "review" : ""}`}
                      disabled={locked}
                      onClick={() => openMod(mod)}>
                      {locked ? "🔒 Locked" : isCompleted ? "📹 Review & Re-Quiz" : pct > 0 ? "▶ Continue" : "▶ Start Module"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Certificate banner ── */}
        {allDone ? (
          <div className="tr-cert-banner">
            <div style={{ fontSize:44 }}>🏆</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:16, fontWeight:900, color:"#fff",
                fontFamily:"'Inter',sans-serif", marginBottom:3 }}>
                You've earned your Eco-Citizen Certificate!
              </div>
              <div style={{ fontSize:13, color:"rgba(165,214,167,.85)",
                fontFamily:"'Inter',sans-serif" }}>
                All {modules.length} modules completed · {totalPointsEarned} pts earned
              </div>
            </div>
            <button
              onClick={() => openCertificate(user?.fullName || "Eco Citizen", modules, progressList)}
              style={{ padding:"11px 22px", background:"#fff", border:"none",
                borderRadius:13, fontSize:13, fontWeight:800,
                fontFamily:"'Inter',sans-serif", cursor:"pointer",
                color:"#1b5e20", display:"flex", alignItems:"center", gap:8,
                boxShadow:"3px 3px 10px rgba(0,0,0,0.2)" }}>
              <Award size={16}/> View Certificate
            </button>
          </div>
        ) : (
          <div style={{ background:"linear-gradient(145deg,#e8f5e9,#dcedc8)",
            border:"1.5px solid #a5d6a7", borderRadius:16,
            padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:22 }}>💡</span>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:"#1b5e20",
                fontFamily:"'Inter',sans-serif" }}>
                How it works: Watch each video → take the quiz → score 3/4 to pass → earn points
              </div>
              <div style={{ fontSize:11, color:"#2e7d32", marginTop:3 }}>
                Complete all {modules.length} modules to unlock your downloadable Eco-Citizen Certificate and 200 bonus points!
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Module viewer modal ── */}
      {openModule && (
        <ModuleViewer
          mod={openModule}
          rich={RICH[openModule.sortOrder] ?? RICH[modules.findIndex((m: any) => m.id === openModule.id) % RICH.length]}
          idx={modules.findIndex((m: any) => m.id === openModule.id)}
          onClose={() => setOpenModule(null)}
          onComplete={handleComplete}
          alreadyCompleted={!!getProgress(openModule.id)?.completed}
        />
      )}

    </DashboardLayout>
  );
}
