import { Router } from "express";
import { requireAuth } from "./auth";

interface UrgentNeed {
  id: string;
  title: string;
  description: string;
  location: string;
  required: string;
  deadline: string;
  status: "open" | "in_progress" | "completed";
  responses: { userId: string; name: string; type: "volunteer" | "donate" }[];
  ngoId: string;
  ngoName: string;
  createdAt: string;
}

/* In-memory store — persists for the lifetime of the server process */
const store: UrgentNeed[] = [
  {
    id: "u1",
    title: "Need 30 Volunteers for Yamuna Flood Cleanup",
    description: "Urgent cleanup needed along Yamuna Ghat after heavy flooding. Rubber boots required — we provide safety gear.",
    location: "Yamuna Ghat, Delhi",
    required: "30 volunteers",
    deadline: "2026-05-08",
    status: "open",
    responses: [],
    ngoId: "demo",
    ngoName: "Swachh Bharat NGO Network",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "u2",
    title: "Food & Water Support for Cleanup Workers",
    description: "Our cleanup drive workers need food and water for a 6-hour session starting at 8 AM.",
    location: "Lajpat Nagar, Delhi",
    required: "100 food packets, 50 water bottles",
    deadline: "2026-05-06",
    status: "in_progress",
    responses: [
      { userId: "c1", name: "Priya S.", type: "donate" },
      { userId: "c2", name: "Rahul G.", type: "donate" },
    ],
    ngoId: "demo",
    ngoName: "Swachh Bharat NGO Network",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "u3",
    title: "First-Aid Certified Volunteers Needed",
    description: "Need first-aid certified volunteers for our large-scale cleanup event. Basic training provided. Half-day commitment.",
    location: "Rohini Sec 11, Delhi",
    required: "5 certified volunteers",
    deadline: "2026-05-12",
    status: "open",
    responses: [{ userId: "c3", name: "Dr. Ananya K.", type: "volunteer" }],
    ngoId: "demo",
    ngoName: "Swachh Bharat NGO Network",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

let counter = 100;

const router = Router();

/* GET /urgent-needs — list all (any authenticated user) */
router.get("/urgent-needs", async (req, res, next) => {
  try {
    await requireAuth(req);
    res.json({ data: [...store].sort((a, b) => {
      if (a.status === "open" && b.status !== "open") return -1;
      if (b.status === "open" && a.status !== "open") return 1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }) });
  } catch (err) { next(err); }
});

/* POST /urgent-needs — NGO creates */
router.post("/urgent-needs", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { title, description, location, required, deadline } = req.body || {};
    if (!title || !deadline) { const e: any = new Error("Title and deadline required"); e.status = 400; throw e; }
    const need: UrgentNeed = {
      id: `u${++counter}`,
      title, description: description || "", location: location || "",
      required: required || "", deadline,
      status: "open", responses: [],
      ngoId: user.id, ngoName: "Swachh Bharat NGO Network",
      createdAt: new Date().toISOString(),
    };
    store.unshift(need);
    res.json({ data: need });
  } catch (err) { next(err); }
});

/* PATCH /urgent-needs/:id/status — NGO updates status */
router.patch("/urgent-needs/:id/status", async (req, res, next) => {
  try {
    await requireAuth(req);
    const need = store.find(n => n.id === req.params.id);
    if (!need) { const e: any = new Error("Not found"); e.status = 404; throw e; }
    const { status } = req.body || {};
    if (status) need.status = status;
    res.json({ data: need });
  } catch (err) { next(err); }
});

/* PATCH /urgent-needs/:id/respond — Citizen responds */
router.patch("/urgent-needs/:id/respond", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const need = store.find(n => n.id === req.params.id);
    if (!need) { const e: any = new Error("Not found"); e.status = 404; throw e; }
    const { type, name } = req.body || {};
    const already = need.responses.some(r => r.userId === user.id);
    if (already) { const e: any = new Error("Already responded"); e.status = 400; throw e; }
    need.responses.push({ userId: user.id, name: name || "Anonymous", type: type || "volunteer" });
    res.json({ data: need });
  } catch (err) { next(err); }
});

/* DELETE /urgent-needs/:id — NGO removes */
router.delete("/urgent-needs/:id", async (req, res, next) => {
  try {
    await requireAuth(req);
    const idx = store.findIndex(n => n.id === req.params.id);
    if (idx !== -1) store.splice(idx, 1);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
