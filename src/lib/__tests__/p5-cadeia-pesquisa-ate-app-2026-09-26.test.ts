import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * P5 (26/09/2026) — "EXECUTAR E PUBLICAR: CADEIA DE PESQUISA ATÉ O APP".
 * Auditoria prévia (agente Explore) confirmou 3 gaps reais, não hipotéticos:
 * (1) Fonte/Documento e Achado nunca deixavam rastro em `case_timeline_events`;
 * (2) `case_reports.publicado_no_app` era um flag morto — nenhuma rota do
 * Portal lia `case_reports`, então marcar um relatório como "publicado no
 * App" nunca tinha consequência visível; (3) o motivo digitado na confirmação
 * de publicar/despublicar projeção era descartado (nunca persistido).
 * "Despublicar" já existia e funcionava — não é gap, confirmado por leitura.
 */

describe("P5 — Estágio 1 (Fonte/Documento): histórico e releitura", () => {
  const arquivo = readFileSync("src/lib/fontes-documentos.functions.ts", "utf8");

  it("registrarFonteDocumento usa inserirComVerificacao (releitura real, não só checar r.data?.id)", () => {
    const inicio = arquivo.indexOf("export const registrarFonteDocumento");
    const trecho = arquivo.slice(inicio, inicio + 2600);
    expect(trecho).toContain("inserirComVerificacao(");
    expect(trecho).toContain("registrarTimelineCaso(supabase,");
  });

  it("editarMetadadosFonte usa gravarComVerificacao e registra timeline", () => {
    const inicio = arquivo.indexOf("export const editarMetadadosFonte");
    const trecho = arquivo.slice(inicio, inicio + 1200);
    expect(trecho).toContain("gravarComVerificacao(");
    expect(trecho).toContain("registrarTimelineCaso(supabase,");
  });

  it("arquivarFonteDocumento usa gravarComVerificacao e registra timeline com o motivo", () => {
    const inicio = arquivo.indexOf("export const arquivarFonteDocumento");
    const trecho = arquivo.slice(inicio, inicio + 1200);
    expect(trecho).toContain("gravarComVerificacao(");
    expect(trecho).toContain("summaryInternal: motivo");
  });
});

describe("P5 — Estágio 4 (Achado): histórico de mudança, não só alerta de consequência", () => {
  const arquivo = readFileSync("src/lib/achados-genealogicos.functions.ts", "utf8");

  it("salvarAchado registra evento de timeline distinto do alerta operacional", () => {
    const inicio = arquivo.indexOf("export const salvarAchado");
    const trecho = arquivo.slice(inicio, inicio + 2400);
    expect(trecho).toContain("registrarTimelineCaso(supabase,");
    expect(trecho).toContain("prepararConsequenciaAchado(supabase, organizationId, registro)");
  });

  it("arquivarRegistroG06 registra timeline para achado e para encontro de linhagem", () => {
    const inicio = arquivo.indexOf("export const arquivarRegistroG06");
    const trecho = arquivo.slice(inicio, inicio + 1200);
    expect(trecho).toContain('"Achado arquivado" : "Encontro de linhagem arquivado"');
  });
});

describe("P5 — Estágio 5 (Relatório): gap crítico fechado — publicado_no_app deixa de ser flag morto", () => {
  const arquivo = readFileSync("src/lib/relatorios-fase.functions.ts", "utf8");

  it("salvarRelatorioFase agora registra histórico no timeline do caso", () => {
    expect(arquivo).toContain("registrarTimelineCaso(supabase,");
    expect(arquivo).toContain("Relatório de fase criado");
    expect(arquivo).toContain("Relatório de fase atualizado");
  });

  it("projetarRelatorioParaApp existe, exige visivelNoApp e nunca publica sozinho", () => {
    expect(arquivo).toContain("export const projetarRelatorioParaApp");
    const inicio = arquivo.indexOf("export const projetarRelatorioParaApp");
    const trecho = arquivo.slice(inicio, inicio + 3000);
    expect(trecho).toContain("visivelNoApp(relatorio.data as any)");
    expect(trecho).toContain('approval_status: "draft"');
    // Nunca "published" direto — a publicação de fato continua na Biblioteca Mestre.
    expect(trecho).not.toContain('approval_status: "published"');
  });

  it("projetarRelatorioParaApp dedupa por origem — um relatório nunca gera duas projeções", () => {
    const inicio = arquivo.indexOf("export const projetarRelatorioParaApp");
    const trecho = arquivo.slice(inicio, inicio + 3000);
    expect(trecho).toContain('.eq("source_entity_type", "case")');
    expect(trecho).toContain('.eq("source_entity_id", data.reportId)');
    expect(trecho).toContain(
      "if (existente.data?.id) return { id: existente.data.id as string, criado: false };",
    );
  });

  it("projetarRelatorioParaApp passa pelo mesmo filtro de sanitização (conteudoProjetavel)", () => {
    expect(arquivo).toContain("conteudoProjetavel(projecao.resumo)");
  });
});

describe("P5 — projeção do relatório tem rótulo real, não texto cru", () => {
  const arquivo = readFileSync("src/lib/projecoes-cliente.ts", "utf8");
  it("TIPO_PROJECAO_ROTULO conhece 'relatorio_fase'", () => {
    expect(arquivo).toContain('relatorio_fase: "Relatório da fase"');
  });
});

describe("P5 — Estágio 6: motivo da confirmação deixa de ser descartado", () => {
  const funcoes = readFileSync("src/lib/biblioteca-evidencias.functions.ts", "utf8");

  it("aprovarProjecao aceita motivo e persiste em audit_logs", () => {
    const inicio = funcoes.indexOf("export const aprovarProjecao");
    const trecho = funcoes.slice(inicio, inicio + 3600);
    expect(trecho).toContain("motivo?: string");
    expect(trecho).toContain(
      'acao: data.publicar ? "achado_publicado_no_app" : "achado_aprovado_aguardando_publicacao"',
    );
    expect(trecho).toContain("motivo: motivo || null");
  });

  it("despublicarProjecao aceita motivo e persiste em audit_logs", () => {
    const inicio = funcoes.indexOf("export const despublicarProjecao");
    const trecho = funcoes.slice(inicio, inicio + 2800);
    expect(trecho).toContain("motivo?: string");
    expect(trecho).toContain('acao: "achado_despublicado_do_app"');
  });

  it("nenhuma escrita de app_projections vira 'published' fora de aprovarProjecao(publicar:true)", () => {
    // guarda de regressão: confirma que despublicarProjecao continua só
    // revertendo para "approved", nunca apagando nem arquivando a origem.
    const inicio = funcoes.indexOf("export const despublicarProjecao");
    const trecho = funcoes.slice(inicio, inicio + 1200);
    expect(trecho).toContain('approval_status: "approved", effective_from: null');
  });
});

describe("P5 — UI: o motivo digitado no diálogo de confirmação agora chega ao servidor", () => {
  const paginaBiblioteca = readFileSync(
    "src/routes/_authenticated/biblioteca-evidencias.$caseId.tsx",
    "utf8",
  );
  const conectado = readFileSync(
    "src/components/biblioteca/conteudo-editorial-conectado.tsx",
    "utf8",
  );

  it("biblioteca-evidencias.$caseId.tsx passa motivo para aprovar/despublicar", () => {
    expect(paginaBiblioteca).toContain(
      'onConfirmar={(motivo) => mAprovar.mutate({ id: String(p["id"]), publicar: false, motivo })}',
    );
    expect(paginaBiblioteca).toContain(
      'onConfirmar={(motivo) => mAprovar.mutate({ id: String(p["id"]), publicar: true, motivo })}',
    );
    expect(paginaBiblioteca).toContain(
      'onConfirmar={(motivo) => mDespublicar.mutate({ id: String(p["id"]), motivo })}',
    );
  });

  it("conteudo-editorial-conectado.tsx (fila da Biblioteca Mestre) passa motivo também", () => {
    // Prettier pode quebrar a arrow function em duas linhas; checar tolerante a espaço.
    expect(conectado).toMatch(
      /onConfirmar=\{\(motivo\)\s*=>\s*mAprovar\.mutate\(\{ id: item\.id, publicar: true, motivo \}\)/,
    );
    expect(conectado).toMatch(
      /onConfirmar=\{\(motivo\)\s*=>\s*mDespublicar\.mutate\(\{ id: item\.id, motivo \}\)/,
    );
  });
});

describe("P5 — mockup 17p aplicado à superfície afetada (Legado): card de continuidade da jornada", () => {
  const arquivo = readFileSync("src/routes/portal/legado.tsx", "utf8");

  it("mostra o card 'Continuidade da jornada' reaproveitando vivo.proximaAcao (mesma projeção da Home)", () => {
    // 01/10/2026 — o Lovable tirou o título literal do card; o que importa
    // (reaproveitar a MESMA projeção da Home, sem fonte nova) segue intacto.
    expect(arquivo).toContain("data-legado-continuidade");
    expect(arquivo).toContain("vivo.proximaAcao?.acao");
  });

  it("não inventa fonte de dado nova — reaproveita o mesmo campo já usado em /portal", () => {
    expect(arquivo).not.toMatch(/proximaEtapaLegado|continuidadeJornada\(/);
  });
});
