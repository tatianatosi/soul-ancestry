import type { CaseData } from "@/types/case";
import { EVIDENCE_LABEL, FALLBACK, lista, preenchido, rotaLabel, texto } from "./evidence";

/**
 * Adaptador: converte o modelo de dados do caso nos campos planos da ficha
 * piloto já existente. Campos ausentes recebem fallback institucional ou
 * string vazia (a interface oculta blocos vazios).
 */
export type FichaPiloto = ReturnType<typeof toFichaPiloto>;

const primeiro = (arr: string[], i: number) => arr[i] ?? "";

export function toFichaPiloto(caso: CaseData) {
  const historico = lista(caso.conta.historico);
  const descobertas = caso.descobertas ?? [];
  const interno = !caso.governanca.dados_sensiveis_ocultos;

  return {
    case_id: caso.geral.case_id,
    case_nome: caso.geral.case_nome,
    cliente_nome: caso.geral.cliente_nome,
    status_caso: caso.geral.status_caso,

    rota_provavel: rotaLabel(caso),
    documento_foco: texto(caso.documentos.documento_principal, FALLBACK.aguardando),
    etapa_atual: texto(caso.jornada.etapa_atual, FALLBACK.atualizacao),
    contexto_resumo: texto(caso.jornada.contexto_resumo, FALLBACK.atualizacao),
    hipotese_principal: texto(caso.rota.hipotese_principal, FALLBACK.validacao),

    trilha_origem: caso.jornada.trilha_origem,
    trilha_cidadania: caso.jornada.trilha_cidadania,
    trilha_memoria: caso.jornada.trilha_memoria,

    heatmap_pais_1: caso.rota.pais_principal,
    heatmap_pct_1: preenchido(caso.rota.pais_principal) ? caso.rota.aderencia_principal : null,
    heatmap_pais_2: caso.rota.pais_secundario,
    heatmap_pct_2: preenchido(caso.rota.pais_secundario) ? caso.rota.aderencia_secundaria : null,
    heatmap_pais_3: caso.rota.pais_terciario,
    heatmap_pct_3: preenchido(caso.rota.pais_terciario) ? caso.rota.aderencia_terciaria : null,

    genograma_pessoa_1: caso.familia_direta.bisavo_paterno.nome,
    genograma_pessoa_2: caso.familia_direta.avo_paterno.nome,
    genograma_pessoa_3: caso.familia_direta.pai.nome,

    arvore_conexao_chave: caso.arvore.conexao_chave,
    arvore_territorio: caso.arvore.conexao_territorial,
    arvore_lacuna: caso.arvore.lacuna_critica,

    alerta_titulo: caso.alerta.ativo ? caso.alerta.titulo : "",
    alerta_texto: caso.alerta.ativo ? caso.alerta.texto : "",

    doc_principal: caso.documentos.documento_principal,
    doc_pendencia: caso.documentos.pendencia_principal,
    doc_status: texto(caso.documentos.status_documental, FALLBACK.atualizacao),

    origem_pessoas_conectadas: caso.arvore.pessoas_conectadas,
    origem_geracoes_lidas: caso.arvore.geracoes_lidas,
    origem_base_1: interno ? caso.fontes.base_1_url : "",
    origem_base_2: interno ? caso.fontes.base_2_url : "",
    origem_base_3: interno ? caso.fontes.base_3_url : "",
    origem_radar_resumo: texto(caso.rota.resumo_radar, FALLBACK.atualizacao),
    origem_arvore_ampliada: lista(caso.arvore.pessoas_colaterais).join(" · "),

    jornada_ancestral_1: caso.jornada.jornada_ancestral_1,
    jornada_cliente_1: caso.jornada.jornada_cliente_1,
    jornada_intersecao_1: caso.jornada.jornada_intersecao_1,
    jornada_intersecao_2: caso.jornada.jornada_intersecao_2,

    descoberta_1: descobertas[0]
      ? `${descobertas[0].titulo} — ${EVIDENCE_LABEL[descobertas[0].tipo_evidencia]}`
      : FALLBACK.semDescoberta,
    descoberta_2: descobertas[1]
      ? `${descobertas[1].titulo} — ${EVIDENCE_LABEL[descobertas[1].tipo_evidencia]}`
      : "",
    entregavel_1: texto(caso.documentos.documento_principal, FALLBACK.semArquivo),

    conta_produto_atual: texto(caso.conta.produto_atual || caso.geral.produto_atual, FALLBACK.atualizacao),
    conta_status_jornada: texto(caso.conta.status_jornada, FALLBACK.atualizacao),
    conta_ultima_atualizacao: texto(
      caso.conta.ultima_atualizacao || caso.geral.ultima_atualizacao,
      FALLBACK.atualizacao,
    ),
    conta_historico_1: primeiro(historico, 0),
    conta_historico_2: primeiro(historico, 1),
    conta_historico_3: primeiro(historico, 2),
    conta_upgrade: caso.conta.texto_upgrade,

    link_pasta_docs: interno ? caso.fontes.pasta_documentos_url : "",
    link_imagens: interno ? caso.fontes.pasta_imagens_url : "",
    link_fontes_extra: interno ? lista(caso.fontes.links_extras) : [],
    obs_input_output: interno ? caso.governanca.regra_input_output : "",
  };
}
