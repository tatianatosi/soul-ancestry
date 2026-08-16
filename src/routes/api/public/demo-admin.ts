import { createFileRoute } from "@tanstack/react-router";
import { provisionarAdminDemo } from "@/lib/demo-admin.functions";

export const Route = createFileRoute("/api/public/demo-admin")({
  server: {
    handlers: {
      POST: async () => {
        const r = await provisionarAdminDemo();
        return new Response(JSON.stringify(r), { headers: { "content-type": "application/json" } });
      },
    },
  },
});
