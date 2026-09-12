import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { publicacoesParaCliente } from "@/lib/projecoes-cliente";
import { ehFixtureLinha, semFixtures } from "@/lib/fixtures";
import { projetarProximaAcaoCliente, sinaisDoCasoPortal } from "@/lib/motor-caso";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    await h.acessoDoCliente(supabase, context.userId as string);

    const [casos, pendencias, faturas] = await Promise.all([
      supabase
        .from("portal_casos")
        .select("id, codigo, titulo, pais, via, status, ativo, suspenso_em, updated_at")
        .order("updated_at", { ascending: false }),
      supabase.from("portal_document_requests").select("case_id, status").in("status", ["aguardando", "recusado"]),
      supabase.from("invoices").select("case_id, status").in("status", ["pendente", "vencida"]),
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
        .select("id, titulo, categoria, status, origem, entrega_cliente, liberado_cliente, liberado_em, nome_arquivo, revisao_motivo, created_at, is_demo")
        .eq("case_id", data.casoId)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("id, numero, descricao, valor, moeda, vencimento, status, valor_pago, paga_em, dados_teste")
        .eq("case_id", data.casoId)
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
    const pagamentoPendente = listaFaturas.some((f) => ["pendente", "vencida"].includes(String(f.status)));
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
      faturas: listaFaturas.map((f) => ({
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
    if (assinado.error) throw new Error(assinado.error.message);
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
        tamanho_bytes: data.tamanho,
        status: "pendente_de_revisao",
      })
      .select("id")
      .maybeSingle();
    if (inserido.error) throw new Error(inserido.error.message);

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
      if (atualizado.error) throw new Error(atualizado.error.message);
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
    if (assinado.error) throw new Error(assinado.error.message);

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
    if (ticket.error) throw new Error(ticket.error.message);

    const msg = await supabase.from("portal_ticket_messages").insert({
      organization_id: acesso.organization_id,
      ticket_id: ticket.data.id,
      autor_tipo: "cliente",
      corpo: mensagem,
    });
    if (msg.error) throw new Error(msg.error.message);

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
    if (r.error) throw new Error(r.error.message);

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
        .select("id, case_id, titulo, status, origem, liberado_cliente, liberado_em, created_at, revisao_motivo, nome_arquivo, is_demo")
        .order("created_at", { ascending: false }),
      supabase.from("portal_casos").select("id, titulo"),
    ]);
    const nome = new Map(((casos.data ?? []) as any[]).map((c) => [c.id, c.titulo]));
    const lista = semFixtures((docs.data ?? []) as any[]);
    return {
      entregas: lista
        .filter((d) => d.liberado_cliente === true)
        .map((d) => ({ id: d.id, titulo: d.titulo, caso: nome.get(d.case_id) ?? "", liberadoEm: d.liberado_em })),
      envios: lista
        .filter((d) => d.origem === "cliente")
        .map((d) => ({
          id: d.id,
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

/** Faturas liberadas para visualização, em todos os casos autorizados. */
export const minhasFaturas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const h = await import("./portal-cliente.server");
    const supabase = context.supabase as any;
    await h.acessoDoCliente(supabase, context.userId as string);
    const [faturas, casos] = await Promise.all([
      supabase
        .from("invoices")
        .select("id, case_id, numero, descricao, valor, moeda, vencimento, status, dados_teste")
        .order("vencimento", { ascending: true }),
      supabase.from("portal_casos").select("id, titulo"),
    ]);
    const nome = new Map(((casos.data ?? []) as any[]).map((c) => [c.id, c.titulo]));
    return semFixtures((faturas.data ?? []) as any[]).map((f) => ({
      id: f.id as string,
      numero: f.numero as string | null,
      descricao: f.descricao as string | null,
      caso: nome.get(f.case_id) ?? "",
      valor: Number(f.valor ?? 0),
      moeda: (f.moeda as string) ?? "BRL",
      vencimento: f.vencimento as string | null,
      statusRotulo: h.STATUS_FATURA_SIMPLES[f.status] ?? "Em aberto",
    }));
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
    if (r.error) throw new Error(r.error.message);
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
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) {
      throw new Error("Não foi possível revogar: confirme que a autorização existe e é sua.");
    }
    return { ok: true };
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
    if (error) throw new Error(error.message);
    return {
      meuClienteId: acesso.client_id as string,
      compartilhamentos: (data ?? []) as Record<string, any>[],
    };
  });
