import express from "express";

const app = express();
app.use(express.json());

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL ?? "http://localhost:4000/execute";

app.post("/chat", async (req, res) => {
  const { userId, role, prompt } = req.body ?? {};

  if (!userId || !role || !prompt) {
    return res.status(400).json({ error: "userId, role, prompt zorunlu" });
  }

  try {
    const result = await fetch(ORCHESTRATOR_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId,
        role,
        prompt,
        requestId: crypto.randomUUID(),
      }),
    });

    const body = await result.json();
    return res.status(result.status).json(body);
  } catch (error) {
    return res.status(500).json({ error: "orchestrator erişim hatası", detail: String(error) });
  }
});

app.listen(3000, () => {
  console.log("IPA UI listening on http://localhost:3000");
});
