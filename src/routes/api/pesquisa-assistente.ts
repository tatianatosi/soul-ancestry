import { createFileRoute } from "@tanstack/react-router";

/**
 * Assistente de pesquisa genealógica (interno).
 * Exige sessão da equipe; lê o dossiê com RLS do próprio usuário e devolve o
 * relatório em streaming. Nenhuma escrita no banco.
 */
export const Route = createFileRoute("/api/pesquisa-assistente")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Não autenticado.", { status: 401 });

        const body = (await request.json().catch(() => ({}))) as {
          casoId?: string;
          complemento?: string;
          /** Só verifica o caso e a suficiência dos dados; não chama a IA. */
          verificar?: boolean;
          /** Deve repetir exatamente o case_id exibido na tela. */
          casoIdConfirmado?: string;
          /** Único caminho para analisar o caso de demonstração. */
          executarDemonstracao?: boolean;
        };
        if (!body.casoId) return new Response("Informe o caso.", { status: 400 });

        const json = (corpo: unknown, status: number) =>
          new Response(JSON.stringify(corpo), {
            status,
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
          });

        const ACOES = ["salvar_rascunho", "preencher_dados", "encerrar"] as const;

        const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
        const anon =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!url || !anon) return new Response("Backend indisponível.", { status: 500 });
        if (!apiKey) return new Response("Assistente de IA não configurado.", { status: 500 });

        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(url, anon, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { apikey: anon, Authorization: `Bearer ${token}` } },
        });

        const { data: userData } = await supabase.auth.getUser(token);
        if (!userData?.user) return new Response("Sessão inválida.", { status: 401 });

        const lista = (tabela: string, coluna: string) =>
          supabase
            .from(tabela)
            .select("*")
            .eq(coluna, body.casoId!)
            .is("archived_at", null)
            .order("created_at", { ascending: true });

        const [caso, pessoas, hipoteses, evidencias, eventos, pendencias] = await Promise.all([
          supabase.from("crm_casos").select("*").eq("id", body.casoId).maybeSingle(),
          lista("case_members", "case_id"),
          lista("research_hypotheses", "case_id"),
          lista("evidencias", "caso_id"),
          lista("research_events", "case_id"),
          lista("tarefas", "caso_id"),
        ]);
        if (!caso.data) return new Response("Caso não encontrado ou sem permissão.", { status: 403 });

        const { MODELO_PESQUISA, PROMPT_MESTRE, montarDossie } = await import("@/lib/pesquisa-ia.server");
        const dossie = montarDossie(
          {
            caso: caso.data,
            pessoas: pessoas.data ?? [],
            hipoteses: hipoteses.data ?? [],
            evidencias: evidencias.data ?? [],
            eventos: eventos.data ?? [],
            pendencias: pendencias.data ?? [],
          },
          body.complemento,
        );

        const ia = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: MODELO_PESQUISA,
            stream: true,
            messages: [
              { role: "system", content: PROMPT_MESTRE },
              { role: "user", content: dossie },
            ],
          }),
        });

        if (!ia.ok || !ia.body) {
          const detalhe = await ia.text().catch(() => "");
          const status = ia.status === 429 || ia.status === 402 ? ia.status : 502;
          return new Response(detalhe || "Falha ao consultar o assistente.", { status });
        }

        // Converte o SSE do gateway em texto puro para a interface.
        const decoder = new TextDecoder();
        let resto = "";
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = ia.body!.getReader();
            const encoder = new TextEncoder();
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                resto += decoder.decode(value, { stream: true });
                const partes = resto.split("\n");
                resto = partes.pop() ?? "";
                for (const parte of partes) {
                  if (!parte.startsWith("data: ")) continue;
                  const carga = parte.slice(6).trim();
                  if (!carga || carga === "[DONE]") continue;
                  try {
                    const json = JSON.parse(carga);
                    const texto = json?.choices?.[0]?.delta?.content;
                    if (texto) controller.enqueue(encoder.encode(texto));
                  } catch {
                    /* fragmento incompleto: ignorado */
                  }
                }
              }
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
