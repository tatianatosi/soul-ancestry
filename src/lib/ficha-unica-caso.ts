/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Ficha Única progressiva do Caso 360 / Pesquisa (02/10/2026) —
 * substitui os dois painéis concorrentes que existiam lado a lado na aba
 * "Pesquisa" (`PainelFichaMaster`, visão de 54 campos; `PainelFichaPiloto`,
 * preparação de pesquisa) por UMA só composição, em blocos progressivos:
 * do mais macro (o caso, dono Planejador/Caso) ao mais granular (pessoas,
 * vínculos, hipóteses, lacunas, fontes, documentos, plano de ação — dono
 * Pesquisa do caso).
 *
 * Função pura: só agrupa e rotula o que os dois leitores já existentes
 * (`obterFichaMasterReal`, `carregarFichaPiloto`) devolvem. Nenhuma
 * consulta nova, nenhuma tabela nova, nenhuma rota nova — cada bloco
 * aponta, quando existe, para a rota real onde aquele dado é editado
 * ("rota de edição"), nunca para um formulário novo.
 */
import type { FichaPiloto } from "@/lib/caseAdapter";
import { vazioOuFrasePronta } from "@/lib/ficha-master-estado-campos";

export interface CampoFichaUnica {
  rotulo: string;
  valor: string | number | null | undefined;
}

export interface RotaEdicaoFichaUnica {
  to: string;
  params?: Record<string, string>;
  label: string;
}

export interface BlocoFichaUnica {
  id: string;
  titulo: string;
  dono: string;
  origem: string;
  descricao?: string;
  rotaEdicao?: RotaEdicaoFichaUnica;
  campos?: CampoFichaUnica[];
  linhas?: string[];
  vazio?: string;
}

function nomePessoa(pessoas: Record<string, any>[], id?: string | null): string {
  return pessoas.find((x) => x.id === id)?.canonical_name ?? "—";
}

/**
 * Monta os blocos da Ficha Única, na ordem progressiva da jornada de
 * pesquisa: visão do caso (Planejador) → pessoas → vínculos → hipóteses →
 * lacunas → fontes/evidências → documentos/solicitações → plano de ação.
 */
export function montarBlocosFichaUnica(params: {
  caseId: string;
  ficha: FichaPiloto | null | undefined;
  piloto: {
    pesquisa: Record<string, any> | null;
    pessoas: Record<string, any>[];
    vinculos: Record<string, any>[];
    hipoteses: Record<string, any>[];
    lacunas: Record<string, any>[];
    fontes: Record<string, any>[];
    solicitacoes: Record<string, any>[];
    bloqueios: string[];
    planoAberto: boolean;
  } | null | undefined;
  rotulos: {
    statusPesquisa: Record<string, string>;
    statusAutorizacao: Record<string, string>;
    statusGatePesquisa: Record<string, string>;
    statusPessoa: Record<string, string>;
    statusIdentidade: Record<string, string>;
    statusVinculo: Record<string, string>;
    statusFonte: Record<string, string>;
    statusSolicitacao: Record<string, string>;
  };
}): BlocoFichaUnica[] {
  const { caseId, ficha, piloto, rotulos } = params;
  const blocos: BlocoFichaUnica[] = [];

  if (ficha) {
    blocos.push({
      id: "visao",
      titulo: "Visão do caso",
      dono: "Caso / Planejador",
      origem: "crm_casos, clientes, case_plans, research_cases, app_projections",
      rotaEdicao: { to: "/casos/$caseId", params: { caseId }, label: "Editar na Jornada do Planejador" },
      campos: [
        { rotulo: "Caso", valor: `${ficha.case_id} — ${ficha.case_nome}` },
        { rotulo: "Cliente", valor: ficha.cliente_nome },
        { rotulo: "Status do caso", valor: ficha.status_caso },
        { rotulo: "Rota provável", valor: ficha.rota_provavel },
        { rotulo: "Etapa atual", valor: ficha.etapa_atual },
        { rotulo: "Hipótese principal (interno)", valor: ficha.hipotese_principal },
        { rotulo: "País 1 (heatmap)", valor: ficha.heatmap_pais_1 },
        { rotulo: "Aderência país 1 (%)", valor: ficha.heatmap_pct_1 },
      ],
    });
    blocos.push({
      id: "origem-documentos",
      titulo: "Origem, árvore e documentos",
      dono: "Pesquisa / Documentos",
      origem: "app_projections, lineage_paths, documents, portal_document_requests",
      rotaEdicao: { to: "/pessoas-linhagens/$caseId", params: { caseId }, label: "Editar na Ficha Genealógica" },
      campos: [
        { rotulo: "Pessoas conectadas (árvore)", valor: ficha.origem_pessoas_conectadas },
        { rotulo: "Gerações lidas", valor: ficha.origem_geracoes_lidas },
        { rotulo: "Documento principal liberado", valor: ficha.doc_principal },
        { rotulo: "Pendência documental", valor: ficha.doc_pendencia },
        { rotulo: "Alerta ativo", valor: ficha.alerta_titulo },
        { rotulo: "Achado 1", valor: ficha.descoberta_1 },
        { rotulo: "Marco 1 (histórico)", valor: ficha.conta_historico_1 },
      ],
    });
  }

  const p = piloto?.pesquisa ?? null;
  if (p) {
    blocos.push({
      id: "preparacao-pesquisa",
      titulo: "Preparação de pesquisa",
      dono: "Pesquisa do caso",
      origem: "research_cases",
      descricao: "Preparação apenas: nenhuma fonte consultada, nenhum documento solicitado, nenhum arquivo contatado, nenhuma árvore ou relatório publicado.",
      rotaEdicao: { to: "/pesquisa-evidencias/$caseId", params: { caseId }, label: "Abrir Pesquisa e Evidências do caso" },
      campos: [
        { rotulo: "Linhagem", valor: p.country_context },
        { rotulo: "Situação da pesquisa", valor: rotulos.statusPesquisa[String(p.status)] ?? p.status },
        { rotulo: "Autorização de pesquisa", valor: rotulos.statusAutorizacao[String(p.external_research_authorization_status)] },
        { rotulo: "Gate de pesquisa externa", valor: rotulos.statusGatePesquisa[String(p.external_research_gate_status)] },
        { rotulo: "Resumo interno", valor: p.family_line_summary_internal },
      ],
    });
  }

  const pessoas = piloto?.pessoas ?? [];
  if (p) {
    blocos.push({
      id: "pessoas",
      titulo: "Pessoas do núcleo e da pesquisa",
      dono: "Pesquisa do caso",
      origem: "research_people (+ genealogical_person_profiles quando vinculado)",
      descricao: "Nenhum antepassado inferido. Identidade só é confirmada com evidência.",
      rotaEdicao: { to: "/pessoas-linhagens/$caseId", params: { caseId }, label: "Editar na Ficha Genealógica" },
      linhas: pessoas.map((x) => {
        const partes = [
          rotulos.statusPessoa[String(x.person_status)],
          `identidade ${rotulos.statusIdentidade[String(x.identity_status)]?.toLowerCase() ?? ""}`,
        ];
        if (x.is_minor) partes.push("menor");
        if (x.nascimento_data || x.nascimento_localidade) {
          partes.push(`nasc. ${[x.nascimento_data, x.nascimento_localidade].filter(Boolean).join(" em ")}`);
        }
        if (x.morte_data || x.morte_localidade) {
          partes.push(`falec. ${[x.morte_data, x.morte_localidade].filter(Boolean).join(" em ")}`);
        }
        return `${x.canonical_name} — ${partes.filter(Boolean).join(" · ")}`;
      }),
      vazio: "Nenhuma pessoa registrada.",
    });

    blocos.push({
      id: "vinculos",
      titulo: "Vínculos familiares",
      dono: "Pesquisa do caso",
      origem: "genealogical_relationships",
      descricao: "Vínculo sem evidência permanece apenas afirmado, nunca confirmado.",
      rotaEdicao: { to: "/pessoas-linhagens/$caseId", params: { caseId }, label: "Editar na Ficha Genealógica" },
      linhas: (piloto?.vinculos ?? []).map(
        (r) =>
          `${nomePessoa(pessoas, r.person_from_id)} → ${nomePessoa(pessoas, r.person_to_id)} (${r.relation_type}) — ${
            rotulos.statusVinculo[String(r.status)]
          } · ${r.supporting_evidence_count} evidência(s)`,
      ),
      vazio: "Nenhum vínculo registrado.",
    });

    blocos.push({
      id: "hipoteses",
      titulo: "Hipóteses internas",
      dono: "Pesquisa do caso",
      origem: "research_hypotheses",
      descricao: "Hipótese não é achado nem conclusão. Uso interno.",
      rotaEdicao: p.id
        ? { to: "/pesquisa-modulo/$id", params: { id: String(p.id) }, label: "Abrir hipóteses estruturadas" }
        : undefined,
      linhas: (piloto?.hipoteses ?? []).map((h) => `${h.titulo} — ${h.status} · confiança ${h.grau_confianca}`),
      vazio: "Nenhuma hipótese registrada.",
    });

    blocos.push({
      id: "lacunas",
      titulo: "Lacunas e pendências",
      dono: "Pesquisa do caso",
      origem: "research_pending_items",
      descricao: "Lacuna registrada não dispara consulta nem pedido.",
      rotaEdicao: { to: "/pesquisa-evidencias/$caseId", params: { caseId }, label: "Abrir Pesquisa e Evidências do caso" },
      linhas: (piloto?.lacunas ?? []).map((l) => `${l.title} — ${l.category} · ${l.severity} · ${l.status}`),
      vazio: "Nenhuma lacuna registrada.",
    });

    blocos.push({
      id: "fontes",
      titulo: "Fontes e evidências existentes",
      dono: "Pesquisa do caso",
      origem: "research_sources",
      descricao: "Catalogadas apenas como referência interna; catalogar não dispara consulta.",
      rotaEdicao: { to: "/pesquisa-evidencias/$caseId", params: { caseId }, label: "Abrir Pesquisa e Evidências do caso" },
      linhas: (piloto?.fontes ?? []).map((f) => `${f.title} — ${rotulos.statusFonte[String(f.source_status)]} · ${f.source_type}`),
      vazio: "Nenhuma fonte catalogada.",
    });

    blocos.push({
      id: "documentos-solicitacoes",
      titulo: "Documentos e solicitações",
      dono: "Pesquisa do caso",
      origem: "research_document_requests",
      descricao: "Todas as solicitações permanecem não solicitadas / a preparar.",
      rotaEdicao: { to: "/pesquisa-evidencias/$caseId", params: { caseId }, label: "Abrir Pesquisa e Evidências do caso" },
      linhas: (piloto?.solicitacoes ?? []).map(
        (s) => `${s.requested_document_type} — ${rotulos.statusSolicitacao[String(s.status)]} · ${nomePessoa(pessoas, s.person_id)}`,
      ),
      vazio: "Nenhuma solicitação registrada.",
    });

    blocos.push({
      id: "plano-acao",
      titulo: "Plano de ação de pesquisa",
      dono: "Pesquisa do caso",
      origem: "research_pending_items (ações)",
      descricao: "Recebe ações somente após autorização de pesquisa registrada.",
      rotaEdicao: { to: "/plano-acao/$caseId", params: { caseId }, label: "Abrir Plano de Ação" },
      linhas: piloto?.planoAberto
        ? ["Autorização registrada: o plano pode receber ações de pesquisa."]
        : ["Plano vazio e pronto. Nenhuma ação pode ser incluída enquanto a autorização de pesquisa estiver pendente."],
    });
  }

  // Frase institucional de preenchimento ("Em atualização documental"…) não é dado:
  // vira ausência, e a tela mostra o estado real do campo.
  for (const b of blocos) {
    for (const c of b.campos ?? []) if (vazioOuFrasePronta(c.valor)) c.valor = null;
  }
  return blocos;
}
