import { MCPServer, text } from "mcp-use/server";
import { z } from "zod";

const server = new MCPServer({
  name: "mcp-security",
  version: "0.1.0",
  description: "Yetki, onay, policy ve audit servisleri",
});

server.tool(
  {
    name: "authorize_action",
    description: "Kullanıcı rolüne göre aksiyon yetkisini doğrular.",
    schema: z.object({
      role: z.enum(["user", "admin"]),
      action: z.string(),
    }),
  },
  async ({ role, action }) => {
    if (action === "delete_file_with_confirm" && role !== "admin") {
      return text(
        JSON.stringify({
          authorized: false,
          reason: "admin required",
        })
      );
    }

    return text(
      JSON.stringify({
        authorized: true,
        reason: "ok",
      })
    );
  }
);

server.tool(
  {
    name: "write_audit_log",
    description: "Aksiyon sonucunu audit log'a yazar.",
    schema: z.object({
      requestId: z.string(),
      userId: z.string(),
      action: z.string(),
      result: z.string(),
    }),
  },
  async ({ requestId, userId, action, result }) => {
    console.log("AUDIT", { requestId, userId, action, result, at: new Date().toISOString() });
    return text(JSON.stringify({ ok: true }));
  }
);

await server.listen(4105);
