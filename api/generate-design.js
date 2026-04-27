const typePrompts = {
  floorplan: "architectural floor plan blueprint, top-down view, clean technical drawing, white background: ",
  elevation: "architectural front elevation rendering, photorealistic exterior facade: ",
  interior: "photorealistic interior design, modern furnishing, natural light: ",
  exterior: "photorealistic house exterior with landscaping, daytime: ",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
  if (!HF_API_TOKEN) {
    return res.status(500).json({ error: "HUGGINGFACE_API_TOKEN not set in Vercel environment variables." });
  }

  const { prompt, type } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const fullPrompt = (typePrompts[type] || typePrompts.floorplan) + prompt + ", high quality, detailed";

  try {
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: { num_inference_steps: 4, width: 768, height: 512 },
        }),
      }
    );

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      console.error("HF error:", hfResponse.status, errText.slice(0, 200));
      if (hfResponse.status === 401) return res.status(401).json({ error: "Invalid Hugging Face token." });
      if (hfResponse.status === 429) return res.status(429).json({ error: "Rate limited. Wait 30 seconds and retry." });
      if (hfResponse.status === 503) return res.status(503).json({ error: "Model loading. Wait 20 seconds and retry." });
      return res.status(hfResponse.status).json({ error: `HF error ${hfResponse.status}: ${errText.slice(0, 100)}` });
    }

    const imageBuffer = await hfResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    return res.status(200).json({ imageUrl: `data:image/png;base64,${base64Image}` });

  } catch (e) {
    console.error("Crash:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
