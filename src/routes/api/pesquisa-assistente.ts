import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

/**
 * Assistente de pesquisa genealógica (interno).
 * Exige sessão da equipe; lê o dossiê com RLS do próprio usuário e devolve o
 * relatório em streaming. Nenhuma escrita no banco.
 */
export const Route = createFileRoute("/api/pesquisa-assistente")({
  staticData: { sitemap: false },
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

        const ACOES = ["salvar_rascunho", "preencher_dados"] as const;

        // 30/09/2026 — mesma correção do link mágico: a chave do ambiente só
        // vale se servir ao projeto que o repositório declara.
        const { chavePublicavelDoServidor, urlDoServidor } = await import("@/lib/config-servidor");
        const url = urlDoServidor();
        const anon = chavePublicavelDoServidor();
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

        const [caso, pessoas, researchCase, eventos, pendencias] = await Promise.all([
          supabase.from("crm_casos").select("*").eq("id", body.casoId).maybeSingle(),
          lista("case_members", "case_id"),
          supabase.from("research_cases").select("id").eq("case_id", body.casoId).maybeSingle(),
          lista("research_events", "case_id"),
          lista("tarefas", "caso_id"),
        ]);
        if (!caso.data) return new Response("Caso não encontrado ou sem permissão.", { status: 403 });

        const {
          MODELO_PESQUISA,
          PROMPT_MESTRE,
          AVISO_DEMO,
          MENSAGEM_DADOS_INSUFICIENTES,
          ORIENTACAO_DADOS_INSUFICIENTES,
          avaliarSuficiencia,
          montarDossie,
          mapearHipoteseEstruturada,
          mapearEvidenciaEstruturada,
        } = await import("@/lib/pesquisa-ia.server");

        /*
         * Achado da auditoria (27/09/2026): esta rota lia `research_hypotheses`/
         * `evidencias` — tabelas legadas/vazias, nunca escritas pelo fluxo real
         * de pesquisa. O CRUD real (`/pesquisa-modulo/$id`) grava em
         * `research_case_hypotheses`/`research_evidence_items`, chaveadas por
         * `research_case_id` (não `case_id` direto) — resolvido via
         * `research_cases.case_id`. Corrige a fiação, sem mudar schema nem
         * criar segunda fonte.
         */
        const researchCaseId = (researchCase.data?.["id"] as string | undefined) ?? null;
        const listaPorResearchCase = (tabela: string) =>
          researchCaseId
            ? supabase
                .from(tabela)
                .select("*")
                .eq("research_case_id", researchCaseId)
                .is("archived_at", null)
                .order("created_at", { ascending: true })
            : Promise.resolve({ data: [] as Record<string, unknown>[] });

        const [hipotesesEstruturadas, evidenciasEstruturadas] = await Promise.all([
          listaPorResearchCase("research_case_hypotheses"),
          listaPorResearchCase("research_evidence_items"),
        ]);
        const hipoteses = { data: (hipotesesEstruturadas.data ?? []).map(mapearHipoteseEstruturada) };
        const evidencias = { data: (evidenciasEstruturadas.data ?? []).map(mapearEvidenciaEstruturada) };

        // Nome do cliente do PRÓPRIO caso; nenhuma outra origem é consultada.
        let nomeCliente = "Cliente não vinculado";
        if (caso.data["cliente_id"]) {
          const { data: cli } = await supabase
            .from("clientes")
            .select("nome")
            .eq("id", caso.data["cliente_id"])
            .maybeSingle();
          if (cli?.["nome"]) nomeCliente = cli["nome"] as string;
        }

        const entrada = {
          caso: caso.data,
          pessoas: pessoas.data ?? [],
          hipoteses: hipoteses.data ?? [],
          evidencias: evidencias.data ?? [],
          eventos: eventos.data ?? [],
          pendencias: pendencias.data ?? [],
        };
        const ehDemo = Boolean(caso.data["demo"]);
        const lacunas = avaliarSuficiencia(entrada, body.complemento);
        const identificacao = {
          case_id: caso.data["id"] as string,
          codigo: caso.data["codigo"] as string,
          titulo: caso.data["titulo"] as string,
          cliente: nomeCliente,
          demo: ehDemo,
        };

        // Trava dura: sem autorização de pesquisa registrada no caso, o assistente permanece inerte.
        const autorizacao = String(caso.data["estado_de_autorizacao_pesquisa"] ?? "nao_autorizada");
        if (autorizacao !== "autorizada") {
          return json(
            {
              ...identificacao,
              estado_de_autorizacao_pesquisa: autorizacao,
              erro: "pesquisa_nao_autorizada",
              mensagem:
                "Pesquisa não autorizada para este caso. O assistente permanece inerte até a autorização ser registrada na ficha do caso.",
              orientacao:
                "Próximo passo: upload humano controlado dos documentos, catalogação e revisão. Nenhuma extração automática é executada agora.",
            },
            409,
          );
        }

        // Etapa 1: a interface confere qual case_id será analisado antes de executar.

        if (body.verificar) {
          return json(
            {
              ...identificacao,
              lacunas,
              suficiente: lacunas.length === 0,
              acoes: ACOES,
              ...(lacunas.length > 0
                ? { mensagem: MENSAGEM_DADOS_INSUFICIENTES, orientacao: ORIENTACAO_DADOS_INSUFICIENTES }
                : {}),
            },
            200,
          );
        }

        // O case_id exibido precisa ser confirmado; nunca há troca ou fallback de caso.
        if (body.casoIdConfirmado !== body.casoId) {
          return json(
            {
              ...identificacao,
              erro: "confirmacao_case_id_ausente",
              mensagem: "Confirme que o caso exibido é o caso correto antes de executar a análise.",
            },
            409,
          );
        }

        if (ehDemo && !body.executarDemonstracao) {
          return json(
            {
              ...identificacao,
              erro: "demo_requer_selecao_explicita",
              mensagem:
                "Este é o caso de demonstração. Ele só é analisado com a opção “Executar demonstração” selecionada.",
            },
            409,
          );
        }

        if (lacunas.length > 0) {
          await registrarAuditoria(supabase, {
              organization_id: caso.data["organization_id"],
              user_id: userData.user.id,
              acao: "analysis_blocked_insufficient_case_data",
              entidade: "crm_casos",
              entidade_id: caso.data["id"],
              metadados: { case_id: caso.data["id"], codigo: caso.data["codigo"], lacunas },
            })
            .then(
              () => undefined,
              () => undefined,
            );

          return json(
            {
              ...identificacao,
              erro: "analysis_blocked_insufficient_case_data",
              mensagem: MENSAGEM_DADOS_INSUFICIENTES,
              orientacao: ORIENTACAO_DADOS_INSUFICIENTES,
              lacunas,
              acoes: ACOES,
            },
            422,
          );
        }

        const dossie = montarDossie(entrada, body.complemento);
        const sistema = ehDemo ? `${PROMPT_MESTRE}\n\n${AVISO_DEMO}` : PROMPT_MESTRE;


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
              { role: "system", content: sistema },
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
