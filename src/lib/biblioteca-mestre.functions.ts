import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { itemElegivelParaProposta, regraAplicavelACaso } from "@/lib/biblioteca-mestre";

/**
 * Biblioteca Mestre — leitura e escrita auditada das referências internas.
 * Nada aqui é projetado ao App Cliente e nenhuma consulta externa é executada.
 */

type Cliente = { from: (t: string) => any };

/** Tabelas que compõem a Biblioteca Mestre. Todas suportam arquivamento lógico. */
export const FONTES_BIBLIOTECA = {
  acervo: "master_library_items",
  bases: "genealogical_sources_catalog",
  dicionarios: "controlled_taxonomies",
  trilhas: "citizenship_tracks",
  juridico: "versioned_legal_rules",
  top30: "product_catalog",
} as const;
export type FonteBiblioteca = keyof typeof FONTES_BIBLIOTECA;

export interface ItemBiblioteca {
  id: string;
  /** Origem canônica do registro; define onde o arquivamento lógico é gravado. */
  fonte: FonteBiblioteca;
  subarea: string;
  titulo: string;
  subtitulo: string | null;
  versao: string | null;
  status: string | null;
  responsavel: string | null;
  pais: string | null;
  codigo: string | null;
  revisadoEm: string | null;
  arquivado: boolean;
  motivoArquivo: string | null;
  /** Homologação: item pode ser referenciado em proposta/relatório. */
  homologado: boolean;
  /** Texto curto da regra de homologação aplicada. */
  regraHomologacao: string;
  /** Estado de vigência canônico (só o acervo é governado por este ciclo). */
  vigencia?: EstadoVigencia | null;
  homologacaoCriterio?: string | null;
  homologadoEm?: string | null;
  /** Item que substitui este (sucessor). */
  sucessorId?: string | null;
  /** Item substituído por este (predecessor). */
  predecessorId?: string | null;
  detalhes: { rotulo: string; valor: string }[];
}

export type EstadoVigencia =
  | "rascunho"
  | "em_revisao"
  | "homologado"
  | "vigente"
  | "substituido"
  | "suspenso"
  | "arquivado";

export const ESTADOS_VIGENCIA: { valor: EstadoVigencia; rotulo: string }[] = [
  { valor: "rascunho", rotulo: "Rascunho" },
  { valor: "em_revisao", rotulo: "Em revisão" },
  { valor: "homologado", rotulo: "Homologado" },
  { valor: "vigente", rotulo: "Vigente" },
  { valor: "substituido", rotulo: "Substituído" },
  { valor: "suspenso", rotulo: "Suspenso" },
  { valor: "arquivado", rotulo: "Arquivado" },
];

/** Estados que encerram o ciclo de uso do item (mantêm leitura e vínculos históricos). */
export const ESTADOS_ENCERRADOS: EstadoVigencia[] = ["substituido", "suspenso", "arquivado"];

/**
 * Elegibilidade para NOVA utilização (proposta, contrato, OS, template, seletor).
 * Item substituído, suspenso ou arquivado continua legível e navegável no histórico,
 * mas nunca entra em seletor de nova operação.
 */
export function itemElegivelParaNovoUso(item: {
  vigencia?: EstadoVigencia | null;
  arquivado?: boolean;
}): boolean {
  if (item.arquivado) return false;
  return item.vigencia === "vigente";
}




function det(rotulo: string, valor: unknown): { rotulo: string; valor: string }[] {
  if (valor === null || valor === undefined || valor === "") return [];
  return [{ rotulo, valor: String(valor) }];
}

export const listarBibliotecaMestre = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ itens: ItemBiblioteca[] }> => {
    const supabase = context.supabase as unknown as Cliente;

    const [acervoLike, bases, taxonomias, trilhas, regras] = await Promise.all([
      supabase
        .from("master_library_items")
        .select(
          "id,categoria,titulo,descricao_interna,versao,status,owner,referencia_interna,archived_at,archive_motivo,updated_at,vigencia_estado,homologacao_criterio,homologado_em,substitui_item_id,substituido_por_item_id",
        ),
      supabase
        .from("genealogical_sources_catalog")
        .select(
          "id,nome,pais_eixo,tipo_de_acervo,acesso,restricoes:observacao_risco,cobertura_geografica,url_referencia_interna,responsavel_revisao,ultima_verificacao,archived_at,archive_motivo",
        ),
      supabase
        .from("controlled_taxonomies")
        .select(
          "id,dominio,codigo,nome,descricao,ativo,versao,responsavel,archived_at,archive_motivo,updated_at",
        ),
      supabase
        .from("citizenship_tracks")
        .select(
          "id,pais,nacionalidade,via_preliminar,marco_juridico_referencia,status_via,requisitos_entrada,documentos_prioritarios,riscos_internos,autorizacao_pesquisa_necessaria,revisao_humana_juridica,ultima_revisao_em,responsavel_revisao,texto_sanitizado_cliente,ativo,archived_at,archive_motivo",
        ),
      supabase
        .from("versioned_legal_rules")
        .select(
          "id,tema,versao,status,vigencia_inicio,vigencia_fim,fonte_referencia,escopo,excecoes,dados_necessarios,reviewed_by,reviewed_at,archived_at,archive_motivo",
        ),
    ]);

    const itens: ItemBiblioteca[] = [];

    for (const r of acervoLike.data ?? []) {
      itens.push({
        id: r.id,
        fonte: "acervo",
        subarea: r.categoria,
        titulo: r.titulo,
        subtitulo: r.descricao_interna ?? null,
        versao: r.versao ?? null,
        status: r.status ?? null,
        responsavel: r.owner ?? null,
        pais: null,
        codigo: r.referencia_interna ?? null,
        revisadoEm: r.updated_at ?? null,
        arquivado: Boolean(r.archived_at),
        motivoArquivo: r.archive_motivo ?? null,
        homologado:
          !r.archived_at && (r.vigencia_estado === "homologado" || r.vigencia_estado === "vigente"),
        vigencia: (r.vigencia_estado ?? "rascunho") as EstadoVigencia,
        homologacaoCriterio: r.homologacao_criterio ?? null,
        homologadoEm: r.homologado_em ?? null,
        sucessorId: r.substituido_por_item_id ?? null,
        predecessorId: r.substitui_item_id ?? null,
        regraHomologacao: "Circula apenas material aprovado e não arquivado.",
        detalhes: [...det("Referência interna", r.referencia_interna)],
      });
    }

    for (const r of bases.data ?? []) {
      itens.push({
        id: r.id,
        fonte: "bases",
        subarea: "bases",
        titulo: r.nome,
        subtitulo: r.tipo_de_acervo ?? null,
        versao: null,
        status: r.archived_at ? "arquivado" : "ativo",
        responsavel: r.responsavel_revisao ?? null,
        pais: r.pais_eixo ?? null,
        codigo: null,
        revisadoEm: r.ultima_verificacao ?? null,
        arquivado: Boolean(r.archived_at),
        motivoArquivo: r.archive_motivo ?? null,
        homologado: !r.archived_at,
        regraHomologacao: "Consulta externa só com autorização registrada no caso.",
        detalhes: [
          ...det("Acesso", r.acesso),
          ...det("Cobertura", r.cobertura_geografica),
          ...det("Restrições e risco", r.restricoes),
          ...det("Referência interna", r.url_referencia_interna),
        ],
      });
    }

    for (const r of taxonomias.data ?? []) {
      itens.push({
        id: r.id,
        fonte: "dicionarios",
        subarea: "dicionarios",
        titulo: r.nome,
        subtitulo: r.descricao ?? r.dominio,
        versao: r.versao ?? null,
        status: r.archived_at ? "arquivado" : r.ativo ? "ativo" : "inativo",
        responsavel: r.responsavel ?? null,
        pais: null,
        codigo: r.codigo ?? null,
        revisadoEm: r.updated_at ?? null,
        arquivado: Boolean(r.archived_at),
        motivoArquivo: r.archive_motivo ?? null,
        homologado: !r.archived_at && Boolean(r.ativo),
        regraHomologacao: "Termo fora do dicionário ativo não pode ser gravado como valor canônico.",
        detalhes: [...det("Domínio", r.dominio)],
      });
    }

    for (const r of trilhas.data ?? []) {
      itens.push({
        id: r.id,
        fonte: "trilhas",
        subarea: "trilhas",
        titulo: `${r.pais} — ${r.via_preliminar ?? "via a confirmar"}`,
        subtitulo: r.marco_juridico_referencia ?? null,
        versao: null,
        status: r.archived_at ? "arquivado" : (r.status_via ?? "em_confirmacao"),
        responsavel: r.responsavel_revisao ?? null,
        pais: r.pais ?? null,
        codigo: r.nacionalidade ?? null,
        revisadoEm: r.ultima_revisao_em ?? null,
        arquivado: Boolean(r.archived_at),
        motivoArquivo: r.archive_motivo ?? null,
        homologado: !r.archived_at && Boolean(r.ativo) && r.status_via === "homologada",
        regraHomologacao: "Trilha é preliminar: exige revisão humana e nunca vira parecer ao cliente.",
        detalhes: [
          ...det("Requisitos de entrada", r.requisitos_entrada),
          ...det("Documentos prioritários", r.documentos_prioritarios),
          ...det("Riscos internos", r.riscos_internos),
          ...det(
            "Autorização de pesquisa",
            r.autorizacao_pesquisa_necessaria ? "necessária" : "não necessária",
          ),
          ...det("Revisão humana/jurídica", r.revisao_humana_juridica ? "obrigatória" : "—"),
          ...det("Texto sanitizado interno", r.texto_sanitizado_cliente),
        ],
      });
    }

    for (const r of regras.data ?? []) {
      itens.push({
        id: r.id,
        fonte: "juridico",
        subarea: "juridico",
        titulo: r.tema,
        subtitulo: r.escopo ?? null,
        versao: r.versao ?? null,
        status: r.status ?? null,
        responsavel: r.reviewed_by ?? null,
        pais: null,
        codigo: null,
        revisadoEm: r.reviewed_at ?? null,
        arquivado: Boolean(r.archived_at),
        motivoArquivo: r.archive_motivo ?? null,
        homologado: regraAplicavelACaso(r),
        regraHomologacao: "Regra citável apenas se aprovada, vigente e não arquivada.",
        detalhes: [
          ...det("Vigência", [r.vigencia_inicio, r.vigencia_fim].filter(Boolean).join(" → ")),
          ...det("Fonte", r.fonte_referencia),
          ...det("Exceções", r.excecoes),
          ...det("Dados necessários", r.dados_necessarios),
        ],
      });
    }

    return { itens };
  });

export const listarCatalogoTop30 = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ itens: ItemBiblioteca[] }> => {
    const supabase = context.supabase as unknown as Cliente;
    const { data } = await supabase
      .from("product_catalog")
      .select(
        "id,code,nome_comercial,tipo_oferta,prioridade_catalogo,status_homologacao,elegivel_para_proposta,requer_fechamento_humano,preco_comercial_vigente,preco_historico_legado,condicao_comercial_padrao,escopo_aprovado,vigencia_inicio,vigencia_fim,homologado_por,archived_at,archive_motivo",
      );

    const itens = (data ?? []).map((r: any) => ({
      id: r.id,
      fonte: "top30" as const,
      subarea: r.archived_at ? "arquivo" : "top30",
      titulo: r.nome_comercial,
      subtitulo: r.escopo_aprovado ?? null,
      versao: r.vigencia_inicio ?? null,
      status: r.status_homologacao ?? null,
      responsavel: r.homologado_por ?? null,
      pais: null,
      codigo: r.code ?? null,
      revisadoEm: r.vigencia_inicio ?? null,
      arquivado: Boolean(r.archived_at),
      motivoArquivo: r.archive_motivo ?? null,
      homologado: itemElegivelParaProposta(r),
      regraHomologacao:
        "Só entra em proposta se homologado, elegível, vigente e não arquivado; preço vem do catálogo.",
      detalhes: [
        ...det("Tipo", r.tipo_oferta),
        ...det("Prioridade", r.prioridade_catalogo),
        ...det("Preço vigente", r.preco_comercial_vigente),
        ...det("Preço histórico", r.preco_historico_legado),
        ...det("Condição padrão", r.condicao_comercial_padrao),
        ...det("Elegível para proposta", r.elegivel_para_proposta ? "sim" : "não"),
        ...det("Requer fechamento humano", r.requer_fechamento_humano ? "sim" : "não"),
      ],
    }));

    return { itens };
  });

export const arquivarItemBiblioteca = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; fonte: FonteBiblioteca; motivo: string }) => {
    if (!data?.id) throw new Error("Item inválido.");
    if (!data?.fonte || !(data.fonte in FONTES_BIBLIOTECA)) throw new Error("Origem do item inválida.");
    return { id: data.id, fonte: data.fonte, motivo: data.motivo?.trim() || "Motivo não informado." };
  })
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Cliente;
    const tabela = FONTES_BIBLIOTECA[data.fonte];

    // Leitura prévia sob RLS: item de outra organização não é arquivável e o
    // acesso negado é auditado sem expor conteúdo do registro.
    const { data: atual } = await supabase
      .from(tabela)
      .select("id,organization_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!atual) {
      await registrarAuditoriaBiblioteca(supabase, {
        organizationId: null,
        userId: context.userId,
        acao: "biblioteca_acesso_negado",
        entidadeId: data.id,
        metadados: { fonte: data.fonte, tentativa: "arquivar" },
      });
      throw new Error("Item não encontrado nesta organização.");
    }

    // Arquivamento lógico: nunca há exclusão física de item da Biblioteca Mestre.
    const patch: Record<string, unknown> = {
      archived_at: new Date().toISOString(),
      archive_motivo: data.motivo,
    };
    if (data.fonte === "acervo") patch["archived_by"] = context.userId;
    if (data.fonte === "acervo" || data.fonte === "juridico") patch["status"] = "arquivado";
    if (data.fonte === "dicionarios" || data.fonte === "trilhas") patch["ativo"] = false;
    if (data.fonte === "top30") patch["elegivel_para_proposta"] = false;

    const { error } = await supabase.from(tabela).update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);

    await registrarAuditoriaBiblioteca(supabase, {
      organizationId: atual.organization_id ?? null,
      userId: context.userId,
      acao: "biblioteca_arquivamento",
      entidadeId: data.id,
      metadados: { fonte: data.fonte, motivo: data.motivo },
    });
    return { ok: true };
  });

/**
 * Ciclo de vigência do acervo interno. A recusa efetiva (papel, versão,
 * responsável, critério de homologação e sucessor obrigatório na substituição)
 * é aplicada no banco pelo guard fn_biblioteca_mestre_guard.
 */
export const definirVigenciaItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      estado: EstadoVigencia;
      criterio?: string;
      sucessorId?: string | null;
      justificativa?: string;
      motivoSuspensao?: string;
    }) => {
      if (!data?.id) throw new Error("Item inválido.");
      const estados = ESTADOS_VIGENCIA.map((e) => e.valor);
      if (!estados.includes(data.estado)) throw new Error("Estado de vigência inválido.");
      if (data.estado === "arquivado") {
        throw new Error("Arquivamento é feito pelo fluxo próprio, com motivo obrigatório.");
      }
      if ((data.estado === "homologado" || data.estado === "vigente") && !data.criterio?.trim()) {
        throw new Error("Homologação exige critério ou evidência registrada.");
      }
      if (data.estado === "substituido") {
        if (!data.sucessorId) throw new Error("Item substituído deve apontar para o item sucessor.");
        if (data.sucessorId === data.id) throw new Error("Um item não pode substituir a si mesmo.");
      }
      return {
        id: data.id,
        estado: data.estado,
        criterio: data.criterio?.trim() || null,
        sucessorId: data.sucessorId || null,
        justificativa: data.justificativa?.trim() || null,
        motivoSuspensao: data.motivoSuspensao?.trim() || null,
      };
    },
  )
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Cliente;

    const { data: atual } = await supabase
      .from("master_library_items")
      .select(
        "id,organization_id,vigencia_estado,versao,owner,substituido_por_item_id,substitui_item_id",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (!atual) {
      await registrarAuditoriaBiblioteca(supabase, {
        organizationId: null,
        userId: context.userId,
        acao: "biblioteca_acesso_negado",
        entidadeId: data.id,
        metadados: { tentativa: "vigencia", estado: data.estado },
      });
      throw new Error("Item não encontrado nesta organização.");
    }
    if ((data.estado === "homologado" || data.estado === "vigente") && (!atual.versao || !atual.owner)) {
      throw new Error("Item sem versão e responsável não pode ser homologado ou tornado vigente.");
    }

    // Sucessor só entra em vigência com o predecessor já encerrado.
    if (data.estado === "vigente" && atual.substitui_item_id) {
      const { data: pred } = await supabase
        .from("master_library_items")
        .select("id,vigencia_estado")
        .eq("id", atual.substitui_item_id)
        .maybeSingle();
      if (!ESTADOS_ENCERRADOS.includes(String(pred?.vigencia_estado ?? "") as EstadoVigencia)) {
        throw new Error(
          "Sucessor só pode ficar vigente após o predecessor ser substituído, suspenso ou arquivado.",
        );
      }
    }

    const patch: Record<string, unknown> = {
      vigencia_estado: data.estado,
      vigencia_justificativa: data.justificativa,
    };
    if (data.criterio) patch["homologacao_criterio"] = data.criterio;
    if (data.estado === "homologado" || data.estado === "vigente") {
      patch["homologado_por"] = context.userId;
      patch["homologado_em"] = new Date().toISOString();
    }
    if (data.estado === "suspenso") {
      patch["suspensao_motivo"] = data.motivoSuspensao;
      patch["suspenso_por"] = context.userId;
      patch["suspenso_em"] = new Date().toISOString();
    }



    if (data.estado === "substituido") {
      // Sucessor precisa existir na mesma organização e não pode ser um item
      // que já é substituído por este (evita ciclo de substituição).
      const { data: sucessor } = await supabase
        .from("master_library_items")
        .select("id,organization_id,substituido_por_item_id,substitui_item_id")
        .eq("id", data.sucessorId)
        .maybeSingle();
      if (!sucessor || sucessor.organization_id !== atual.organization_id) {
        throw new Error("Item sucessor não encontrado nesta organização.");
      }
      if (sucessor.substituido_por_item_id === data.id) {
        throw new Error("Substituição circular não é permitida.");
      }
      patch["substituido_por_item_id"] = data.sucessorId;

      // Reciprocidade: o sucessor referencia explicitamente seu predecessor.
      if (sucessor.substitui_item_id !== data.id) {
        const { error: erroSucessor } = await supabase
          .from("master_library_items")
          .update({ substitui_item_id: data.id })
          .eq("id", data.sucessorId);
        if (erroSucessor) throw new Error(erroSucessor.message);
      }
    }

    const { error } = await supabase.from("master_library_items").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);

    await registrarAuditoriaBiblioteca(supabase, {
      organizationId: atual.organization_id ?? null,
      userId: context.userId,
      acao: "biblioteca_vigencia",
      entidadeId: data.id,
      metadados: {
        de: atual.vigencia_estado ?? null,
        para: data.estado,
        criterio: data.criterio ? "registrado" : "nao_informado",
        sucessorId: data.estado === "substituido" ? data.sucessorId : null,
      },
    });
    // Revalidação de dependências: itens que citam o item alterado precisam de
    // confirmação humana de compatibilidade. Nada é ajustado automaticamente.
    const { data: dependentes } = await supabase
      .from("master_library_items")
      .select("id,titulo,versao,vigencia_estado,substitui_item_id,substituido_por_item_id")
      .or(`substitui_item_id.eq.${data.id},substituido_por_item_id.eq.${data.id}`);

    return {
      ok: true,
      dependencias: (dependentes ?? []).map((d: any) => ({
        id: String(d.id),
        titulo: String(d.titulo),
        versao: d.versao ?? null,
        estado: (d.vigencia_estado ?? null) as EstadoVigencia | null,
        vinculo: d.substitui_item_id === data.id ? ("sucessor" as const) : ("predecessor" as const),
        pendencia: "Confirmar se permanece compatível após a troca de vigência.",
      })),
    };
  });

/** Histórico append-only de estados de um item da Biblioteca Mestre. */
export const historicoVigenciaItem = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => {
    if (!data?.id) throw new Error("Item inválido.");
    return { id: data.id };
  })
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const { data: eventos } = await supabase
      .from("master_library_state_events")
      .select(
        "id,estado_anterior,estado_novo,justificativa,versao,responsavel,criterio_registrado,sucessor_id,predecessor_id,ator_user_id,created_at",
      )
      .eq("item_id", data.id)
      .order("created_at", { ascending: false });
    return {
      eventos: ((eventos ?? []) as any[]).map((e) => ({
        id: String(e.id),
        estadoAnterior: (e.estado_anterior ?? null) as string | null,
        estadoNovo: String(e.estado_novo ?? ""),
        justificativa: (e.justificativa ?? null) as string | null,
        versao: (e.versao ?? null) as string | null,
        responsavel: (e.responsavel ?? null) as string | null,
        criterioRegistrado: Boolean(e.criterio_registrado),
        sucessorId: (e.sucessor_id ?? null) as string | null,
        predecessorId: (e.predecessor_id ?? null) as string | null,
        atorUserId: (e.ator_user_id ?? null) as string | null,
        registradoEm: (e.created_at ?? null) as string | null,
      })),
    };
  });



/** Auditoria append-only da Biblioteca Mestre, sem conteúdo sensível do item. */
async function registrarAuditoriaBiblioteca(
  supabase: Cliente,
  evento: {
    organizationId: string | null;
    userId: string | null;
    acao: string;
    entidadeId: string;
    metadados: Record<string, unknown>;
  },
) {
  if (!evento.organizationId) return;
  await supabase.from("audit_logs").insert({
    organization_id: evento.organizationId,
    user_id: evento.userId,
    entidade: "biblioteca_mestre",
    entidade_id: evento.entidadeId,
    acao: evento.acao,
    metadados: evento.metadados,
  });
}

