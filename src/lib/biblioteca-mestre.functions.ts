import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Biblioteca Mestre — leitura e escrita auditada das referências internas.
 * Nada aqui é projetado ao App Cliente e nenhuma consulta externa é executada.
 */

type Cliente = { from: (t: string) => any };

export interface ItemBiblioteca {
  id: string;
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
  detalhes: { rotulo: string; valor: string }[];
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
          "id,categoria,titulo,descricao_interna,versao,status,owner,referencia_interna,archived_at,archive_motivo,updated_at",
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
        detalhes: [...det("Referência interna", r.referencia_interna)],
      });
    }

    for (const r of bases.data ?? []) {
      itens.push({
        id: r.id,
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
        detalhes: [...det("Domínio", r.dominio)],
      });
    }

    for (const r of trilhas.data ?? []) {
      itens.push({
        id: r.id,
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
  .inputValidator((data: { id: string; motivo: string }) => {
    if (!data?.id) throw new Error("Item inválido.");
    if (!data?.motivo || data.motivo.trim().length < 5) {
      throw new Error("Informe o motivo do arquivamento (mínimo 5 caracteres).");
    }
    return { id: data.id, motivo: data.motivo.trim() };
  })
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Cliente;
    const { error } = await supabase
      .from("master_library_items")
      .update({ archived_at: new Date().toISOString(), archive_motivo: data.motivo, status: "arquivado" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
