import { MCPServer, text } from "mcp-use/server";
import { z } from "zod";

const server = new MCPServer({
  name: "mcp-automation",
  version: "0.1.0",
  description: "Sandbox zorunlu terminal / GUI otomasyon servisleri",
});

server.tool(
  {
    name: "run_terminal_safe",
    description: "Terminal komutunu sandbox policy ile kontrol eder.",
    schema: z.object({
      command: z.string(),
    }),
  },
  async ({ command }) => {
    if (command.includes("rm -rf") || command.includes("format")) {
      return text(
        JSON.stringify({
          error: "blocked by sandbox policy",
        })
      );
    }

    return text(
      JSON.stringify({
        message: "sandbox execution ok",
        command,
      })
    );
  }
);

await server.listen(4104);
