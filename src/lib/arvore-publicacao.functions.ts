/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Corte 2a (28/09/2026) — "Publicar pessoa na árvore": o Desk publica e
 * despublica nomes da família na aba Árvore do App (autor, data, caso,
 * estado), sem SQL manual. Regras em `arvore-publicacao.ts`.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { conteudoArvore, ehMenor, nomeParaArvore, validarPublicacaoArvore } from "@/lib/arvore-publicacao";

/** Pessoas da ficha genealógica do caso com o que já está publicado na árvore do App. */
export const listarArvoreDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const [perfis, publicadas] = await Promise.all([
      supabase
        .from("genealogical_person_profiles")
        .select("id,nome_completo,client_visibility,research_person_id,nascimento_data")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .order("nome_completo"),
      supabase
        .from("app_projections")
        .select("id,pessoa_id,content_sanitized,geracao_cliente,effective_from,approved_at")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .eq("projection_type", "arvore")
        .eq("approval_status", "published")
        .is("archived_at", null),
    ]);
    if (perfis.error) throw new Error(perfis.error.message);
    if (publicadas.error) throw new Error(publicadas.error.message);
    const porPessoa = new Map(((publicadas.data ?? []) as any[]).filter((p) => p.pessoa_id).map((p) => [p.pessoa_id as string, p]));
    /*
     * 04/10/2026 — a sensibilidade mora em `research_people`, não no perfil. A
     * tela precisa dela para dizer POR QUE a pessoa não pode ser publicada (o
     * painel antes só dizia "não aprovada", sem caminho). `restricted` NÃO
     * bloqueia: só `highly_restricted`. Ver `visibilidade-arvore.ts`.
     */
    const idsPesquisa = ((perfis.data ?? []) as any[]).map((p) => p.research_person_id).filter(Boolean);
    const pessoas = idsPesquisa.length
      ? await supabase
          .from("research_people")
          .select("id,sensitivity_level")
          .is("archived_at", null)
          .eq("organization_id", organizationId)
          .in("id", idsPesquisa)
      : { data: [] as any[], error: null };
    if (pessoas.error) throw new Error(pessoas.error.message);
    const sensibilidadePor = new Map(((pessoas.data ?? []) as any[]).map((r) => [r.id as string, (r.sensitivity_level as string) ?? null]));
    return ((perfis.data ?? []) as any[]).map((p) => {
      const pub = porPessoa.get(p.research_person_id);
      return {
        perfilId: p.id as string,
        nome: (p.nome_completo as string) ?? "",
        clientVisibility: (p.client_visibility as string) ?? "interna",
        sensitivityLevel: p.research_person_id ? (sensibilidadePor.get(p.research_person_id) ?? null) : null,
        temPessoaPesquisa: Boolean(p.research_person_id),
        publicacao: pub
          ? {
              id: pub.id as string,
              conteudo: (pub.content_sanitized as string) ?? "",
              geracao: (pub.geracao_cliente as number | null) ?? null,
              publicadoEm: (pub.effective_from as string | null) ?? (pub.approved_at as string | null) ?? null,
            }
          : null,
      };
    });
  });

export const publicarPessoaNaArvore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; perfilId: string; nome: string; vinculo?: string | null; geracao: number }) => {
    if (!data?.caseId || !data?.perfilId) throw new Error("Caso e pessoa são obrigatórios.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const { data: perfil } = await supabase
      .from("genealogical_person_profiles")
      .select("id,case_id,client_visibility,research_person_id,nascimento_data")
      .eq("id", data.perfilId)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();
    if (!perfil) throw new Error("Pessoa não encontrada na ficha genealógica deste caso.");
    const { data: pessoa } = await supabase
      .from("research_people")
      .select("id,sensitivity_level,is_minor,birth_date")
      .eq("id", perfil.research_person_id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!pessoa) throw new Error("Pessoa de pesquisa vinculada ao perfil não encontrada.");

    const menor = ehMenor({ is_minor: pessoa.is_minor, nascimento: perfil.nascimento_data ?? pessoa.birth_date });
    const nome = nomeParaArvore(data.nome, menor);
    const erros = validarPublicacaoArvore({
      clientVisibility: perfil.client_visibility,
      sensitivityLevel: pessoa.sensitivity_level,
      geracao: Number(data.geracao),
      nome,
      vinculo: data.vinculo,
    });
    if (erros.length) throw new Error(erros.join(" "));

    const agora = new Date().toISOString();
    const payload = {
      content_sanitized: conteudoArvore(nome, data.vinculo),
      geracao_cliente: Number(data.geracao),
      approval_status: "published",
      approved_by: userId,
      approved_at: agora,
    };

    const { data: existente } = await supabase
      .from("app_projections")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .eq("projection_type", "arvore")
      .eq("pessoa_id", pessoa.id)
      .eq("approval_status", "published")
      .is("archived_at", null)
      .limit(1);
    const idExistente = ((existente ?? []) as { id: string }[])[0]?.id ?? null;

    const r = idExistente
      ? await gravarComVerificacao({ supabase, tabela: "app_projections", id: idExistente, organizationId, userId, payload })
      : await inserirComVerificacao({
          supabase,
          tabela: "app_projections",
          organizationId,
          userId,
          payload: {
            ...payload,
            case_id: data.caseId,
            pessoa_id: pessoa.id,
            projection_type: "arvore",
            destination: "app",
            source_entity_type: "case",
            source_entity_id: data.caseId,
            visibility_scope: "nucleo",
            effective_from: agora,
          },
        });

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "app_projections",
      entidade_id: (idExistente ?? (r as { id?: string }).id) ?? null,
      acao: idExistente ? "arvore_pessoa_atualizada" : "arvore_pessoa_publicada",
      user_id: userId,
      metadados: { case_id: data.caseId, perfil_id: data.perfilId, geracao: Number(data.geracao), menor },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: idExistente ? "Pessoa atualizada na árvore do App" : "Pessoa publicada na árvore do App",
      summaryInternal: `${nome} (geração ${Number(data.geracao)})${menor ? " — menor: só o primeiro nome" : ""}.`,
      sourceEntityType: "app_projections",
      sourceEntityId: idExistente ?? (r as { id?: string }).id ?? data.caseId,
      userId,
    });
    return { ok: true, nomePublicado: nome, menor, salvoEm: r.salvoEm };
  });

export const despublicarPessoaDaArvore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; projecaoId: string; motivo: string }) => {
    if ((data?.motivo ?? "").trim().length < 5) throw new Error("Informe o motivo (mínimo 5 letras) para tirar a pessoa da árvore.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;
    const { data: proj } = await supabase
      .from("app_projections")
      .select("id,case_id,projection_type")
      .eq("id", data.projecaoId)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .maybeSingle();
    if (!proj || proj.projection_type !== "arvore") throw new Error("Publicação da árvore não encontrada neste caso.");
    const r = await gravarComVerificacao({
      supabase,
      tabela: "app_projections",
      id: proj.id,
      organizationId,
      userId,
      payload: { approval_status: "archived", archived_at: new Date().toISOString(), archived_reason: data.motivo.trim() },
    });
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "app_projections",
      entidade_id: proj.id,
      acao: "arvore_pessoa_despublicada",
      user_id: userId,
      metadados: { case_id: data.caseId, motivo: data.motivo.trim() },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Pessoa retirada da árvore do App",
      summaryInternal: data.motivo.trim(),
      sourceEntityType: "app_projections",
      sourceEntityId: proj.id,
      userId,
    });
    return { ok: true, salvoEm: r.salvoEm };
  });
