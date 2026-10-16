import { MCPServer, text } from "mcp-use/server";

const server = new MCPServer({
  name: "mcp-system",
  version: "0.1.0",
  description: "Salt-okunur sistem bilgisi servisleri",
});

server.tool(
  {
    name: "get_system_info",
    description: "CPU, memory ve disk özetini döner (placeholder).",
  },
  async () =>
    text(
      JSON.stringify({
        cpu: "placeholder",
        memory: "placeholder",
        disk: "placeholder",
      })
    )
);

await server.listen(4101);
