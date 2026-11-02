import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { publicacoesParaCliente } from "@/lib/projecoes-cliente";
import { entregasLiberadasParaCliente } from "@/lib/portal-entregas";
import { ehFixtureLinha, semFixtures } from "@/lib/fixtures";
import { projetarProximaAcaoCliente, sinaisDoCasoPortal } from "@/lib/motor-caso";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 26/10/2026 (auditoria pré-lançamento) — texto para toda falha de escrita
 * que chega ao cliente. Antes várias funções jogavam `r.error.message` ou
 * `error.message` direto (texto cru do Postgres/Storage: nome de coluna,
 * policy, tabela) na tela do cliente. Nunca expõe detalhe interno.
 */
const ERRO_ESCRITA_CLIENTE = "Não foi possível concluir agora. Tente de novo em instantes.";

/**
 * Espaço do cliente: leitura e escrita mínimas, sempre com o client autenticado
 * do próprio usuário. RLS valida client_id + organization_id + caso autorizado
 * em cada consulta. Nenhuma dessas funções envia e-mail, WhatsApp ou aciona
 * automação externa: mensagens viram ticket interno.
 */

/** Resumo dos casos autorizados, em linguagem simples. */
export const meusCasos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);

    const [casos, pendencias, faturas] = await Promise.all([
      supabase
        .from("portal_casos")
        .select("id, codigo, titulo, pais, via, status, ativo, suspenso_em, updated_at")
        .order("updated_at", { ascending: false }),
      supabase.from("portal_document_requests").select("case_id, status").in("status", ["aguardando", "recusado"]),
      // Caso com múltiplos contratantes no mesmo case_id (ex.: 3 assinaturas
      // individuais de R$ 320/mês): filtro explícito por client_id garante
      // que o indicador de pendência de pagamento reflita só a própria
      // fatura, nunca a de outro contratante do mesmo núcleo.
      supabase
        .from("invoices")
        .select("case_id, status")
        .eq("client_id", acesso.client_id)
        .in("status", ["emitida", "pendente", "vencida"]),
    ]);

    const porCaso = new Map<string, number>();
    for (const p of (pendencias.data ?? []) as any[]) {
      porCaso.set(p.case_id, (porCaso.get(p.case_id) ?? 0) + 1);
    }
    const pagamentoPorCaso = new Set<string>();
    for (const f of (faturas.data ?? []) as any[]) {
      if (f.case_id) pagamentoPorCaso.add(f.case_id as string);
    }

    // P0.2: fixture/demo nunca chega ao cliente autenticado. portal_casos não
    // expõe classificacao_dado/data_origin (só crm_casos tem essa coluna) —
    // usar filtrarParaCliente aqui classificava todo caso real como
    // "não_classificado" e escondia a lista inteira; semFixtures usa o sinal
    // que a view realmente carrega (título/código).
    return semFixtures((casos.data ?? []) as any[]).map((c) => {
      const pendenciasDocumento = porCaso.get(c.id) ?? 0;
      const s = h.statusSimples(c, pendenciasDocumento);
      const proxima = projetarProximaAcaoCliente(
        sinaisDoCasoPortal({
          status: c.status,
          ativo: c.ativo,
          suspensoEm: c.suspenso_em,
          documentosPendentes: pendenciasDocumento,
          pagamentoPendente: pagamentoPorCaso.has(c.id as string),
        }),
      );
      return {
        id: c.id as string,
        titulo: c.titulo as string,
        codigo: (c.codigo as string | null) ?? null,
        pais: c.pais as string | null,
        via: c.via as string | null,
        atualizadoEm: c.updated_at as string,
        pendencias: pendenciasDocumento,
        statusRotulo: s.rotulo,
        statusTexto: s.texto,
        proximoPasso: proxima.acao,
        proximoPassoDestino: proxima.destino,
      };
    });
  });

/** Painel completo de um caso autorizado. */
export const meuCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);

    const caso = await h.casoAutorizado(supabase, data.casoId);
    // P0.2: fixture/demo nunca é projetado. Mesma correção da linha acima —
    // portal_casos não tem data_origin, então o teste certo é o de fixture.
    if (caso && ehFixtureLinha(caso as any)) return null;
    if (!caso) {
      const portal = await import("./portal.server");
      await portal.registrarEvento({
        organizationId: acesso.organization_id,
        acessoId: acesso.id,
        authUserId: context.userId as string,
        tipo: "access_denied",
        metadata: { motivo: "caso_nao_autorizado", superficie: "portal_caso_detalhe" },
      });
      return null;
    }

    const [solicitacoes, documentos, faturas, tickets, projecoes] = await Promise.all([
      supabase
        .from("portal_document_requests")
        .select("id, titulo, descricao, obrigatorio, prazo, status, motivo_recusa, updated_at")
        .eq("case_id", data.casoId)
        .order("created_at", { ascending: true }),
      supabase
        .from("documents")
        .select("id, titulo, categoria, status, origem, entrega_cliente, liberado_cliente, liberado_em, nome_arquivo, revisao_motivo, created_at")
        .eq("case_id", data.casoId)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("id, numero, descricao, valor, moeda, vencimento, status, valor_pago, paga_em, dados_teste")
        .eq("case_id", data.casoId)
        // Caso com múltiplos contratantes (ex.: 3 assinaturas individuais de
        // R$ 320/mês): filtro explícito reforça a RLS invoices_sel_portal
        // para que cada contratante só leia a própria fatura, nunca a alheia.
        .eq("client_id", acesso.client_id)
        .order("vencimento", { ascending: true }),
      supabase
        .from("portal_tickets")
        .select("id, assunto, categoria, status, ultima_mensagem_em, created_at")
        .eq("case_id", data.casoId)
        .order("ultima_mensagem_em", { ascending: false }),
      supabase
        .from("portal_projecoes")
        .select("id, case_id, projection_type, content_sanitized, effective_from, updated_at")
        .eq("case_id", data.casoId),
    ]);

    const listaSolicitacoes = (solicitacoes.data ?? []) as any[];
    const listaFaturas = semFixtures((faturas.data ?? []) as any[]);
    const pendentes = listaSolicitacoes.filter((s) => ["aguardando", "recusado"].includes(s.status)).length;
    const pagamentoPendente = listaFaturas.some((f) => ["emitida", "pendente", "vencida"].includes(String(f.status)));
    const s = h.statusSimples(caso, pendentes);
    const proxima = projetarProximaAcaoCliente(
      sinaisDoCasoPortal({
        status: caso["status"],
        ativo: caso["ativo"],
        suspensoEm: caso["suspenso_em"],
        documentosPendentes: pendentes,
        pagamentoPendente,
      }),
    );
    // documents/invoices não têm classificacao_dado nem data_origin — usar o
    // sinal real de fixture (is_demo/dados_teste), não o filtro P0.2 que
    // sempre escondia tudo aqui (ver correção acima e no rodapé do arquivo).
    const docs = semFixtures((documentos.data ?? []) as any[]);

    // 26/10/2026 (auditoria, regra do AGENTS.md): fatura pertence ao
    // contratante. Familiar que não é contratante não vê faturas aqui;
    // falha da checagem esconde (fail-closed), nunca mostra.
    const contratante = await supabase.rpc("portal_sou_contratante_financeiro", { p_case_id: data.casoId });
    const podeVerFaturas = !contratante.error && contratante.data === true;
    const faturasVisiveis = podeVerFaturas ? listaFaturas : [];

    return {
      caso: {
        id: caso["id"] as string,
        titulo: caso["titulo"] as string,
        pais: caso["pais"] as string | null,
        via: caso["via"] as string | null,
        atualizadoEm: caso["updated_at"] as string,
        statusRotulo: s.rotulo,
        statusTexto: s.texto,
        proximoPasso: proxima.acao,
        proximoPassoDestino: proxima.destino,
      },
      solicitacoes: listaSolicitacoes.map((r) => ({
        ...r,
        statusRotulo: h.STATUS_SOLICITACAO[r.status] ?? r.status,
      })),
      entregas: docs
        .filter((d) => d.liberado_cliente === true)
        .map((d) => ({
          id: d.id as string,
          titulo: d.titulo as string,
          liberadoEm: d.liberado_em as string | null,
          nomeArquivo: d.nome_arquivo as string | null,
        })),
      meusEnvios: docs
        .filter((d) => d.origem === "cliente")
        .map((d) => ({
          id: d.id as string,
          titulo: d.titulo as string,
          status: d.status as string,
          statusRotulo:
            d.status === "pendente_de_revisao"
              ? "Pendente de revisão"
              : d.status === "recusado"
                ? "Precisa reenviar"
                : d.status === "em_revisao"
                  ? "Em revisão"
                  : "Aceito",
          motivo: d.revisao_motivo as string | null,
          enviadoEm: d.created_at as string,
        })),
      faturas: faturasVisiveis.map((f) => ({
        id: f.id as string,
        numero: f.numero as string | null,
        descricao: f.descricao as string | null,
        valor: Number(f.valor ?? 0),
        moeda: (f.moeda as string) ?? "BRL",
        vencimento: f.vencimento as string | null,
        statusRotulo: h.STATUS_FATURA_SIMPLES[f.status] ?? "Em aberto",
      })),
      tickets: ((tickets.data ?? []) as any[]).map((t) => ({
        ...t,
        statusRotulo: h.STATUS_TICKET[t.status] ?? t.status,
        categoriaRotulo: h.CATEGORIAS_TICKET[t.categoria] ?? t.categoria,
      })),
      publicacoes: publicacoesParaCliente(((projecoes as any).data ?? []) as any[]),
    };
  });

/** Passo 1 do envio: URL temporária de upload, só para caso autorizado. */
export const prepararEnvioDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; nome: string; tamanho: number }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);
    const caso = await h.casoAutorizado(supabase, data.casoId);
    if (!caso) throw new Error("Caso não disponível para o seu acesso.");
    h.validarArquivoCliente(data.nome, data.tamanho);

    const caminho = h.caminhoEnvioCliente(acesso.organization_id, data.casoId, data.nome);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assinado = await (supabaseAdmin as any).storage
      .from(h.BUCKET_DOCUMENTOS)
      .createSignedUploadUrl(caminho);
    if (assinado.error) throw new Error(ERRO_ESCRITA_CLIENTE);
    return { caminho, token: assinado.data.token as string, url: assinado.data.signedUrl as string };
  });

/** Passo 2: registra o documento. O banco força "pendente de revisão". */
export const confirmarEnvioDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      casoId: string;
      solicitacaoId?: string | null;
      titulo: string;
      caminho: string;
      nomeArquivo: string;
      tamanho: number;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);
    const caso = await h.casoAutorizado(supabase, data.casoId);
    if (!caso) throw new Error("Caso não disponível para o seu acesso.");
    // 25/10/2026: o caminho vem do navegador; só aceita a pasta de envio do
    // próprio caso que o passo 1 gerou (sem "..", sem outro caso ou organização).
    const prefixo = `${acesso.organization_id}/${data.casoId}/cliente/`;
    if (typeof data.caminho !== "string" || !data.caminho.startsWith(prefixo) || data.caminho.includes("..")) {
      throw new Error("Envio inválido: arquivo fora da pasta do seu caso. Envie de novo.");
    }
    // 26/10/2026: tamanho e tipo conferidos no arquivo que de fato subiu,
    // não no número que o navegador informou.
    const pasta = data.caminho.slice(0, data.caminho.lastIndexOf("/"));
    const nomeNoArmazenamento = data.caminho.slice(pasta.length + 1);
    const { supabaseAdmin: adminArmazenamento } = await import("@/integrations/supabase/client.server");
    const listagem = await (adminArmazenamento as any).storage
      .from(h.BUCKET_DOCUMENTOS)
      .list(pasta, { search: nomeNoArmazenamento, limit: 5 });
    const objeto = ((listagem.data ?? []) as any[]).find((o) => o?.name === nomeNoArmazenamento);
    if (!objeto) throw new Error("Não encontramos o arquivo enviado. Envie de novo.");
    const tamanhoReal = Number(objeto.metadata?.size ?? data.tamanho);
    h.validarArquivoCliente(nomeNoArmazenamento, tamanhoReal);

    const inserido = await supabase
      .from("documents")
      .insert({
        organization_id: acesso.organization_id,
        case_id: data.casoId,
        client_id: acesso.client_id,
        titulo: h.texto(data.titulo, 160) ?? data.nomeArquivo,
        tipo: "envio_cliente",
        categoria: "interno",
        sensibilidade: "normal",
        visibilidade: "interno_restrito",
        origem: "cliente",
        solicitacao_id: data.solicitacaoId ?? null,
        storage_path: data.caminho,
        nome_arquivo: data.nomeArquivo,
        tamanho_bytes: tamanhoReal,
        status: "pendente_de_revisao",
      })
      .select("id")
      .maybeSingle();
    if (inserido.error) throw new Error(ERRO_ESCRITA_CLIENTE);

    const portal = await import("./portal.server");
    if (data.solicitacaoId) {
      const atualizado = await portal.adminClient
        .from("portal_document_requests")
        .update({ status: "recebido", document_id: inserido.data.id, motivo_recusa: null })
        .eq("id", data.solicitacaoId)
        .eq("case_id", data.casoId)
        .eq("organization_id", acesso.organization_id)
        .select("id")
        .maybeSingle();
      if (atualizado.error) throw new Error(ERRO_ESCRITA_CLIENTE);
      if (!atualizado.data?.id) {
        throw new Error("NENHUMA_LINHA_AFETADA: solicitação de documento não encontrada neste caso.");
      }
    }
    await portal.adminClient.from("audit_logs").insert({
      organization_id: acesso.organization_id,
      user_id: context.userId,
      acao: "documento_enviado_pelo_cliente",
      entidade: "documents",
      entidade_id: inserido.data.id,
      metadados: { case_id: data.casoId, solicitacao_id: data.solicitacaoId ?? null },
    });

    return { id: inserido.data.id as string };
  });

/** Download de entrega: só documento explicitamente liberado, sempre auditado. */
export const baixarEntrega = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { documentoId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const portal = await import("./portal.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);

    const doc = await supabase
      .from("documents")
      .select("id, case_id, storage_path, liberado_cliente, titulo")
      .eq("id", data.documentoId)
      .maybeSingle();

    if (!doc.data || doc.data.liberado_cliente !== true || !doc.data.storage_path) {
      await portal.registrarEvento({
        organizationId: acesso.organization_id,
        acessoId: acesso.id,
        authUserId: context.userId as string,
        tipo: "access_denied",
        metadata: { motivo: "documento_nao_liberado", superficie: "portal_download" },
      });
      throw new Error("Este documento não está liberado para download.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assinado = await (supabaseAdmin as any).storage
      .from(h.BUCKET_DOCUMENTOS)
      .createSignedUrl(doc.data.storage_path, 120);
    if (assinado.error) throw new Error(ERRO_ESCRITA_CLIENTE);

    await portal.adminClient.from("audit_logs").insert({
      organization_id: acesso.organization_id,
      user_id: context.userId,
      acao: "download_entrega_cliente",
      entidade: "documents",
      entidade_id: doc.data.id,
      metadados: { case_id: doc.data.case_id, titulo: doc.data.titulo },
    });

    return { url: assinado.data.signedUrl as string };
  });

/** Mensagem do cliente vira ticket interno. Nenhuma automação externa é disparada. */
export const abrirTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; assunto: string; categoria: string; mensagem: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);
    const caso = await h.casoAutorizado(supabase, data.casoId);
    if (!caso) throw new Error("Caso não disponível para o seu acesso.");

    const assunto = h.texto(data.assunto, 160) ?? "Mensagem sem assunto";
    const mensagem = h.texto(data.mensagem, 4000);
    const categoria = Object.keys(h.CATEGORIAS_TICKET).includes(data.categoria) ? data.categoria : "duvida";

    const ticket = await supabase
      .from("portal_tickets")
      .insert({
        organization_id: acesso.organization_id,
        case_id: data.casoId,
        client_id: acesso.client_id,
        assunto,
        categoria,
        origem: "cliente",
        status: "aberto",
        aberto_por: context.userId,
      })
      .select("id")
      .maybeSingle();
    if (ticket.error) throw new Error(ERRO_ESCRITA_CLIENTE);

    const msg = await supabase.from("portal_ticket_messages").insert({
      organization_id: acesso.organization_id,
      ticket_id: ticket.data.id,
      autor_tipo: "cliente",
      corpo: mensagem,
    });
    if (msg.error) throw new Error(ERRO_ESCRITA_CLIENTE);

    await h.alertaInternoTicket({
      organizationId: acesso.organization_id,
      casoId: data.casoId,
      ticketId: ticket.data.id as string,
      assunto,
      novo: true,
    });

    return { id: ticket.data.id as string };
  });

export const meuTicket = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    await h.acessoDoCliente(supabase, context.userId as string);

    const [ticket, mensagens] = await Promise.all([
      supabase
        .from("portal_tickets")
        .select("id, assunto, categoria, status, case_id, ultima_mensagem_em")
        .eq("id", data.ticketId)
        .maybeSingle(),
      supabase
        .from("portal_ticket_messages")
        .select("id, autor_tipo, corpo, created_at")
        .eq("ticket_id", data.ticketId)
        .order("created_at", { ascending: true }),
    ]);
    if (!ticket.data) return null;
    return {
      ticket: {
        ...ticket.data,
        statusRotulo: h.STATUS_TICKET[ticket.data.status] ?? ticket.data.status,
        categoriaRotulo: h.CATEGORIAS_TICKET[ticket.data.categoria] ?? ticket.data.categoria,
      },
      mensagens: (mensagens.data ?? []) as any[],
    };
  });

export const responderTicketCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string; mensagem: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);
    const mensagem = h.texto(data.mensagem, 4000);
    if (!mensagem) throw new Error("Escreva uma mensagem.");

    const r = await supabase.from("portal_ticket_messages").insert({
      organization_id: acesso.organization_id,
      ticket_id: data.ticketId,
      autor_tipo: "cliente",
      corpo: mensagem,
    });
    if (r.error) throw new Error(ERRO_ESCRITA_CLIENTE);

    // Fila interna da equipe (sem envio externo e sem conteúdo da mensagem).
    const t = await supabase
      .from("portal_tickets")
      .select("id, case_id, assunto")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (t.data) {
      await h.alertaInternoTicket({
        organizationId: acesso.organization_id,
        casoId: t.data.case_id ?? null,
        ticketId: data.ticketId,
        assunto: t.data.assunto ?? "Atendimento",
        novo: false,
      });
    }
    return { ok: true };
  });

/** Entregas liberadas em todos os casos autorizados. */
export const minhasEntregas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    await h.acessoDoCliente(supabase, context.userId as string);
    const [docs, casos] = await Promise.all([
      supabase
        .from("documents")
        .select("id, case_id, titulo, status, origem, liberado_cliente, liberado_em, created_at, revisao_motivo, nome_arquivo")
        .order("created_at", { ascending: false }),
      supabase.from("portal_casos").select("id, titulo"),
    ]);
    const nome = new Map(((casos.data ?? []) as any[]).map((c) => [c.id, c.titulo]));
    const lista = semFixtures((docs.data ?? []) as any[]);
    return {
      entregas: entregasLiberadasParaCliente(lista, nome),
      envios: lista
        .filter((d) => d.origem === "cliente")
        .map((d) => ({
          id: d.id,
          caseId: d.case_id as string | null,
          titulo: d.titulo,
          caso: nome.get(d.case_id) ?? "",
          enviadoEm: d.created_at,
          statusRotulo:
            d.status === "pendente_de_revisao"
              ? "Pendente de revisão"
              : d.status === "recusado"
                ? "Precisa reenviar"
                : d.status === "em_revisao"
                  ? "Em revisão"
                  : "Aceito",
          motivo: d.revisao_motivo as string | null,
        })),
    };
  });

/**
 * Faturas liberadas para visualização, só nos casos em que o titular
 * autenticado tem papel financeiro (contratante).
 *
 * 10/10/2026 — em casos com múltiplos usuários do portal vinculados ao
 * mesmo caso via `nucleo_membros` (ex.: titular financeira + familiares na
 * jornada), fatura e condição comercial são dados financeiros do
 * contratante, não de todo o núcleo. `portal_sou_contratante_financeiro`
 * confirma o papel por caso antes de incluir qualquer fatura dele.
 */
export const minhasFaturas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);
    const [faturas, casos] = await Promise.all([
      supabase
        .from("invoices")
        .select("id, case_id, numero, descricao, valor, moeda, vencimento, status, dados_teste")
        // Mesmo caso com múltiplos contratantes (ex.: 3 assinaturas individuais
        // de R$ 320/mês): RLS (invoices_sel_portal) já restringe a leitura ao
        // client_id do titular autenticado, mas o filtro explícito evita que
        // cada contratante dependa só da policy para não ver a fatura alheia.
        .eq("client_id", acesso.client_id)
        .order("vencimento", { ascending: true }),
      supabase.from("portal_casos").select("id, titulo"),
    ]);
    // 12/10/2026 — fail-closed: falha de leitura é erro, nunca "nenhuma fatura".
    if (faturas.error) throw new Error(ERRO_ESCRITA_CLIENTE);
    const nome = new Map(((casos.data ?? []) as any[]).map((c) => [c.id, c.titulo]));
    const semFixturesFaturas = semFixtures((faturas.data ?? []) as any[]);
    const casosDasFaturas = [...new Set(semFixturesFaturas.map((f) => f.case_id).filter(Boolean))] as string[];
    const souContratantePorCaso = new Map(
      await Promise.all(
        casosDasFaturas.map(async (caseId) => {
          const { data, error } = await supabase.rpc("portal_sou_contratante_financeiro", { p_case_id: caseId });
          if (error) throw new Error(ERRO_ESCRITA_CLIENTE);
          return [caseId, Boolean(data)] as const;
        }),
      ),
    );
    const visiveis = semFixturesFaturas.filter((f) => souContratantePorCaso.get(f.case_id) === true);
    return {
      faturas: visiveis.map((f) => ({
        id: f.id as string,
        numero: f.numero as string | null,
        descricao: f.descricao as string | null,
        caso: nome.get(f.case_id) ?? "",
        valor: Number(f.valor ?? 0),
        moeda: (f.moeda as string) ?? "BRL",
        vencimento: f.vencimento as string | null,
        statusRotulo: h.STATUS_FATURA_SIMPLES[f.status] ?? "Em aberto",
      })),
      // Vazio por papel (existe fatura, mas não para este acesso) é um estado
      // diferente de vazio legítimo (nenhuma fatura no caso todo).
      restritoAoContratante: visiveis.length === 0 && semFixturesFaturas.length > 0,
    };
  });

/* ===================== COMPARTILHAMENTO DE ACHADO (LGPD) ===================== */

/**
 * Decisão da Proprietária (09/09/2026) — "cliente decide se deseja
 * compartilhar o achado": o próprio titular, autenticado no seu portal,
 * autoriza um achado sanitizado específico para outro membro da família.
 * A RLS de app_projection_shares só aceita este insert quando o achado
 * pertence a este titular (app_projections.titular_client_id = quem está
 * logado) — nunca compartilha o documento original, só o achado aprovado.
 */
export const autorizarCompartilhamentoAchado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projecaoId: string; compartilharComClienteId: string }) => {
    if (!d?.projecaoId || !d?.compartilharComClienteId) {
      throw new Error("Informe o achado e a pessoa com quem compartilhar.");
    }
    return d;
  })
  .handler(async ({ data, context }) => {
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);

    /*
     * 26/10/2026 (auditoria pré-lançamento): a policy de INSERT de
     * app_projection_shares só confere organização e que quem compartilha é
     * o titular — não que o destinatário é da MESMA família/caso. Sem esta
     * checagem, o titular podia compartilhar um achado com qualquer client_id
     * da organização, inclusive de outra família, e a policy de SELECT
     * (`compartilhado_com_client_id = portal_meu_cliente()`) deixava essa
     * pessoa ler o achado. Defesa em profundidade na aplicação: o
     * destinatário precisa ter acesso ATIVO ao mesmo caso do achado.
     */
    const projecao = await supabase.from("portal_projecoes").select("case_id").eq("id", data.projecaoId).maybeSingle();
    const caseIdDoAchado = (projecao.data as { case_id?: string } | null)?.case_id ?? null;
    if (!caseIdDoAchado) throw new Error("Não foi possível autorizar: achado não encontrado ou não é seu.");
    // A policy de leitura de client_portal_case_access só deixa a pessoa ver a
    // PRÓPRIA linha — para conferir o vínculo de OUTRO cliente é preciso a
    // ponte admin (mesmo padrão já usado neste arquivo), sempre com filtro
    // explícito de organização.
    const { supabaseAdmin: pontePortal } = await import("@/integrations/supabase/client.server");
    const vinculoDestino = await (pontePortal as any)
      .from("client_portal_case_access")
      .select("id, client_portal_access:client_portal_access_id!inner(client_id, organization_id)")
      .eq("case_id", caseIdDoAchado)
      .eq("access_status", "active")
      .eq("client_portal_access.client_id", data.compartilharComClienteId)
      .eq("client_portal_access.organization_id", acesso.organization_id)
      .maybeSingle();
    if (!vinculoDestino.data) {
      throw new Error("Não foi possível autorizar: a pessoa escolhida não tem acesso a este caso.");
    }

    const r = await supabase
      .from("app_projection_shares")
      .insert({
        organization_id: acesso.organization_id,
        projection_id: data.projecaoId,
        compartilhado_com_client_id: data.compartilharComClienteId,
        autorizado_por: "titular",
      })
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(ERRO_ESCRITA_CLIENTE);
    if (!r.data?.id) {
      throw new Error("Não foi possível autorizar: confirme que este achado é seu e que já foi aprovado.");
    }
    return { id: r.data.id as string };
  });

/** O titular revoga uma autorização de compartilhamento que ele mesmo deu. */
export const revogarCompartilhamentoAchadoPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => {
    if (!d?.id) throw new Error("Informe a autorização de compartilhamento.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    await h.acessoDoCliente(supabase, context.userId as string);
    const r = await supabase
      .from("app_projection_shares")
      .update({ revogado_em: new Date().toISOString() })
      .eq("id", data.id)
      .is("revogado_em", null)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(ERRO_ESCRITA_CLIENTE);
    if (!r.data?.id) {
      throw new Error("Não foi possível revogar: confirme que a autorização existe e é sua.");
    }
    return { ok: true };
  });

/**
 * Membros do MESMO processo e família, para o titular escolher com quem
 * compartilhar um achado.
 *
 * Decisão da Proprietária (03/10/2026), que desbloqueou esta ponta: "o
 * compartilhamento de achado será compartilhado somente com cada membro que
 * faz parte do mesmo processo e família... já temos um anexo no contrato
 * referente a privacidade de dados". Antes disso o App não tinha como listar
 * ninguém: `nucleo_membros` é só da equipe e `client_portal_case_access`
 * devolve apenas a própria linha do titular.
 *
 * Privilégio mínimo: a função `portal_membros_do_meu_caso` devolve só id,
 * nome e papel — nunca CPF, RG, e-mail, telefone, endereço ou nascimento.
 */
export const membrosDoMeuCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    await h.acessoDoCliente(supabase, context.userId as string);
    const { data, error } = await supabase.rpc("portal_membros_do_meu_caso");
    if (error) throw new Error(ERRO_ESCRITA_CLIENTE);
    return ((data ?? []) as any[]).map((m) => ({
      casoId: String(m.case_id),
      clienteId: String(m.cliente_id),
      nome: String(m.nome ?? "(sem nome)"),
      papel: (m.papel as string | null) ?? null,
    }));
  });

/** Achados e compartilhamentos deste titular — o que ele autorizou e o que recebeu. */
export const meusCompartilhamentosDeAchado = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);
    const { data, error } = await supabase
      .from("app_projection_shares")
      .select("id, projection_id, compartilhado_com_client_id, autorizado_em, revogado_em")
      .order("autorizado_em", { ascending: false });
    if (error) throw new Error(ERRO_ESCRITA_CLIENTE);
    return {
      meuClienteId: acesso.client_id as string,
      compartilhamentos: (data ?? []) as Record<string, any>[],
    };
  });

/**
 * Telemetria de permanência nas abas do App Cliente (11/10/2026).
 *
 * As 7 abas reais do portal (`src/components/portal/portal-shell.tsx`); não
 * existe aba "descobertas" — o pedido original cobre onde achados/memórias
 * aparecem hoje: Home, Radar e Legado, além da Árvore. Grava direto pelo
 * cliente autenticado via RLS (`ctde_insert_self`), nunca por admin/service
 * role — mesmo padrão de client_access_events.
 */
export const ABAS_COM_TELEMETRIA = ["home", "jornada", "radar", "arvore", "documentos", "legado", "conta"] as const;
export type AbaComTelemetria = (typeof ABAS_COM_TELEMETRIA)[number];

export const registrarTempoNaAba = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tab: AbaComTelemetria; duracaoMs: number; casoId?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    const acesso = await h.acessoDoCliente(supabase, context.userId as string);

    if (!ABAS_COM_TELEMETRIA.includes(data.tab)) return { ok: false as const };
    const duracaoMs = Math.round(Number(data.duracaoMs));
    if (!Number.isFinite(duracaoMs) || duracaoMs <= 0 || duracaoMs > 86400000) return { ok: false as const };

    const { error } = await supabase.from("client_tab_dwell_events").insert({
      organization_id: acesso.organization_id,
      client_portal_access_id: acesso.id,
      case_id: data.casoId ?? null,
      tab: data.tab,
      duracao_ms: duracaoMs,
    });
    if (error) throw new Error(ERRO_ESCRITA_CLIENTE);
    return { ok: true as const };
  });
