import { Router } from "express";
import OpenAI from "openai";

const router = Router();

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "dummy",
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

router.post("/classify-waste", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body as {
      imageBase64: string;
      mimeType?: string;
    };

    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "low",
              },
            },
            {
              type: "text",
              text: `You are a waste classification AI for SwachhSaathi, India's civic waste platform.

Analyze this image and classify the waste shown. Respond ONLY with a valid JSON object — no markdown, no explanation, no code fences:

{
  "wasteType": "<one of: mixed, organic, plastic, metal, hazardous, ewaste, construction>",
  "confidence": <integer 0-100>,
  "label": "<short human-readable label like 'Plastic bottles & wrappers'>",
  "description": "<1-2 sentences describing the waste visible in the image>",
  "priority": "<one of: low, normal, high, urgent>"
}

Rules:
- If image is not waste or unclear, return wasteType "mixed", confidence 0, description "Could not identify waste type."
- hazardous = chemicals, batteries, medical waste
- ewaste = electronics, phones, cables
- urgent = biohazard, open burning, flooding drain
- high = large pile, road blockage
- normal = typical street/bin waste
- low = small amount, already collected area`,
            },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "{}";

    let parsed: Record<string, unknown>;
    try {
      const clean = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        wasteType: "mixed",
        confidence: 0,
        label: "Unknown",
        description: "Could not classify waste from this image.",
        priority: "normal",
      };
    }

    res.json({ success: true, data: parsed });
  } catch (err: any) {
    req.log?.error?.({ err }, "classify-waste error");
    res.status(500).json({ error: err?.message ?? "Classification failed. Please try again." });
  }
});

/* ── Donation Analyzer ── */
router.post("/analyze-donation", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body as {
      imageBase64: string;
      mimeType?: string;
    };
    if (!imageBase64) { res.status(400).json({ error: "imageBase64 is required" }); return; }

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 512,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "low" } },
          { type: "text", text: `You are a donation assistant for SwachhSaathi, India's civic platform. Analyze the image and identify what items are being donated.

Respond ONLY with valid JSON — no markdown, no explanation:

{
  "category": "<one of: clothes, food, electronics, furniture, books, other>",
  "condition": "<one of: new, good, fair, poor>",
  "label": "<short label like '3 cotton shirts'>",
  "description": "<1-2 sentences describing items, count if visible, and condition>",
  "suggestedNgo": "<type of NGO that would want this, e.g. orphanage, old age home, food bank>",
  "confidence": <integer 0-100>
}

Rules:
- clothes = any garments, shoes, accessories
- food = packaged food, groceries (only if clearly visible)
- electronics = phones, laptops, gadgets, cables
- furniture = chairs, tables, shelves, beds
- books = books, notebooks, educational material
- other = toys, utensils, sports equipment, misc
- If unclear, set category "other", confidence low` },
        ],
      }],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim());
    } catch {
      parsed = { category: "other", condition: "good", label: "Unknown items", description: "Could not identify items from this image.", suggestedNgo: "general charity", confidence: 0 };
    }
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    req.log?.error?.({ err }, "analyze-donation error");
    res.status(500).json({ error: err?.message ?? "Analysis failed. Please try again." });
  }
});

/* ── Scrap Analyzer ── */
router.post("/analyze-scrap", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body as {
      imageBase64: string;
      mimeType?: string;
    };
    if (!imageBase64) { res.status(400).json({ error: "imageBase64 is required" }); return; }

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 512,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "low" } },
          { type: "text", text: `You are a scrap valuation assistant for SwachhSaathi, India's civic platform. Analyze the image and identify the scrap material.

Respond ONLY with valid JSON — no markdown, no explanation:

{
  "category": "<one of: metal, paper, plastic, ewaste>",
  "itemName": "<specific name like 'Aluminum cans', 'Old newspaper bundles', 'PET bottles'>",
  "estimatedWeightKg": <number, your best guess for weight in kg visible>,
  "estimatedPricePerKg": <number in INR, typical Indian market rate>,
  "description": "<1-2 sentences describing the scrap, quantity estimate, and condition>",
  "tips": "<short tip for better pricing or preparation>",
  "confidence": <integer 0-100>
}

Rules:
- metal = iron, steel, copper, aluminum, brass pipes/rods/sheets/cans
- paper = newspapers, cardboard, books, office paper
- plastic = PET bottles, HDPE containers, mixed plastic
- ewaste = phones, PCBs, cables, batteries, laptops, appliances
- Use realistic Indian market rates: metal ₹25-60/kg, paper ₹8-15/kg, plastic ₹6-20/kg, ewaste ₹20-80/kg
- If unclear, set category "metal", confidence 0` },
        ],
      }],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim());
    } catch {
      parsed = { category: "metal", itemName: "Unknown scrap", estimatedWeightKg: 0, estimatedPricePerKg: 0, description: "Could not identify scrap from this image.", tips: "", confidence: 0 };
    }
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    req.log?.error?.({ err }, "analyze-scrap error");
    res.status(500).json({ error: err?.message ?? "Analysis failed. Please try again." });
  }
});

export default router;
