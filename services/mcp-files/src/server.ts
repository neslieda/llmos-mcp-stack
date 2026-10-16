import { MCPServer, text } from "mcp-use/server";
import { z } from "zod";

const server = new MCPServer({
  name: "mcp-files",
  version: "0.1.0",
  description: "Policy kontrollü dosya işlemleri",
});

server.tool(
  {
    name: "list_files",
    description: "Verilen dizin için dosya listesini döner (placeholder).",
    schema: z.object({
      path: z.string().default("."),
    }),
  },
  async ({ path }) =>
    text(
      JSON.stringify({
        message: "files listed",
        path,
        files: ["a.txt", "b.txt"],
      })
    )
);

server.tool(
  {
    name: "delete_file_with_confirm",
    description: "Silme adımı için doğrulama döner (gerçek silme yok).",
    schema: z.object({
      path: z.string(),
    }),
  },
  async () =>
    text(
      JSON.stringify({
        error: "confirmation required",
        message: "Silme işlemi onay gerektirir.",
      })
    )
);

await server.listen(4102);
