import { MCPServer, text } from "mcp-use/server";
import { z } from "zod";

const server = new MCPServer({
  name: "mcp-rag",
  version: "0.1.0",
  description: "Doküman arama / cevaplama servisleri",
});

server.tool(
  {
    name: "answer_with_sources",
    description: "Sorguya cevap ve kaynak listesi döner (placeholder).",
    schema: z.object({
      query: z.string(),
    }),
  },
  async ({ query }) =>
    text(
      JSON.stringify({
        answer: `Sorgu işlendi: ${query}`,
        sources: [
          { id: "DOC-001", title: "Pardus Kurulum Kılavuzu" },
          { id: "DOC-017", title: "Güvenlik Politikası" },
        ],
      })
    )
);

await server.listen(4103);
