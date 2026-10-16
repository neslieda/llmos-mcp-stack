import express from "express";
import { MCPClient } from "mcp-use";
import type { IntentResult, UserContext } from "../../../shared/types.js";

const app = express();
app.use(express.json());

const SERVICE_URLS: Record<string, string> = {
  system: process.env.MCP_SYSTEM_URL ?? "http://localhost:4101/mcp",
  files: process.env.MCP_FILES_URL ?? "http://localhost:4102/mcp",
  rag: process.env.MCP_RAG_URL ?? "http://localhost:4103/mcp",
  automation: process.env.MCP_AUTOMATION_URL ?? "http://localhost:4104/mcp",
  security: process.env.MCP_SECURITY_URL ?? "http://localhost:4105/mcp",
};

const mcpClient = new MCPClient({
  clientInfo: { name: "llmos-orchestrator", version: "0.1.0" },
  mcpServers: {
    system: { url: SERVICE_URLS.system },
    files: { url: SERVICE_URLS.files },
    rag: { url: SERVICE_URLS.rag },
    automation: { url: SERVICE_URLS.automation },
    security: { url: SERVICE_URLS.security },
  },
});

let clientReadyPromise: Promise<void> | null = null;

async function ensureClientReady() {
  if (!clientReadyPromise) {
    clientReadyPromise = mcpClient.createAllSessions().then(() => undefined);
  }
  await clientReadyPromise;
}

function extractText(result: any): string {
  const content = result?.content;
  if (!Array.isArray(content)) return "";
  const textPart = content.find((item: any) => item?.type === "text");
  return typeof textPart?.text === "string" ? textPart.text : "";
}

async function callServerTool(serverName: string, toolName: string, args: Record<string, unknown>) {
  await ensureClientReady();
  const session = mcpClient.getSession(serverName);
  if (!session) throw new Error(`session not found: ${serverName}`);
  const result = await session.callTool(toolName, args);
  const raw = extractText(result);
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return { raw };
  }
}

function resolveIntent(prompt: string): IntentResult {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("cpu") || normalized.includes("ram") || normalized.includes("sistem")) {
    return {
      intent: "system",
      action: "get_system_info",
      args: {},
      requiresConfirmation: false,
    };
  }

  if (normalized.includes("dosya") || normalized.includes("sil") || normalized.includes("listele")) {
    return {
      intent: "files",
      action: normalized.includes("sil") ? "delete_file_with_confirm" : "list_files",
      args: { path: "." },
      requiresConfirmation: normalized.includes("sil"),
    };
  }

  if (normalized.includes("doküman") || normalized.includes("kılavuz") || normalized.includes("rag")) {
    return {
      intent: "rag",
      action: "answer_with_sources",
      args: { query: prompt },
      requiresConfirmation: false,
    };
  }

  return {
    intent: "automation",
    action: "run_terminal_safe",
    args: { command: "echo unsupported intent" },
    requiresConfirmation: true,
  };
}

async function securityAuthorize(ctx: UserContext, action: string) {
  return callServerTool("security", "authorize_action", {
    role: ctx.role,
    action,
  });
}

async function securityAudit(ctx: UserContext, action: string, result: string) {
  await callServerTool("security", "write_audit_log", {
    requestId: ctx.requestId,
    userId: ctx.userId,
    action,
    result,
  });
}

app.post("/execute", async (req, res) => {
  const { userId, role, prompt, requestId } = req.body ?? {};
  if (!userId || !role || !prompt || !requestId) {
    return res.status(400).json({ error: "userId, role, prompt, requestId zorunlu" });
  }

  const ctx: UserContext = { userId, role, requestId };
  const plan = resolveIntent(prompt);

  const auth = await securityAuthorize(ctx, plan.action);
  if (!auth.authorized) {
    await securityAudit(ctx, plan.action, "denied");
    return res.status(403).json({ error: "yetkisiz işlem", reason: auth.reason });
  }

  if (plan.requiresConfirmation) {
    return res.status(202).json({
      requiresConfirmation: true,
      action: plan.action,
      message: "Kritik işlem için kullanıcı onayı gerekiyor.",
    });
  }

  try {
    const data = await callServerTool(plan.intent, plan.action, plan.args);
    await securityAudit(ctx, plan.action, "success");
    return res.status(200).json(data);
  } catch (error) {
    await securityAudit(ctx, plan.action, "error");
    return res.status(500).json({ error: "tool call failed", detail: String(error) });
  }
});

app.listen(4000, () => {
  console.log("LLMOS orchestrator listening on http://localhost:4000");
});
