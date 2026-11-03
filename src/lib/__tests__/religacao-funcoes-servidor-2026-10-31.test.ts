import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Religação das server functions órfãs (W4d, 31/10/2026): cada função ganhou
 * tela, sem criar segundo caminho de escrita e sem afrouxar gate.
 */
const ler = (p: string) => readFileSync(p, "utf8");
const trecho = (s: string, de: string, ate?: string) => {
  const i = s.indexOf(de);
  expect(i, de).toBeGreaterThan(-1);
  return s.slice(i, ate ? s.indexOf(ate, i + 1) : undefined);
};

const EVID_FN = ler("src/lib/evidencia-canonica.functions.ts");
const EVID_TELA = ler("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx");
const EVID_PAINEL = ler("src/components/pesquisa/evidencias-canonicas-painel.tsx");
const PERFIL_FN = ler("src/lib/perfil-institucional-persistido.functions.ts");
const PERFIL_UI = ler("src/components/contrato/perfil-institucional-acoes.tsx");
const GOVERNANCA = ler("src/routes/_authenticated/governanca.contrato-base.tsx");
const SAAS = ler("src/lib/saas.functions.ts");
const PILOTO = ler("src/lib/piloto.functions.ts");
const PILOTO_ANA = ler("src/lib/piloto-ana.functions.ts");
const CARTAO = ler("src/components/caso/conferencia-piloto-caso.tsx");
const CASO360 = ler("src/routes/_authenticated/casos.$caseId.index.tsx");
const MARCOS = ler("src/components/juridico/marcos-cartoes.tsx");
const RADAR_UI = ler("src/components/juridico/radar-marcos-casos.tsx");

describe("evidência canônica: 4 funções com tela e gate de papel", () => {
  it("as quatro têm papel exigido no servidor", () => {
    expect(EVID_FN).toContain("organizacaoComPapel");
    for (const [fn, papeis] of [
      ["listarEvidenciasDoCaso", "PAPEIS_LE_DETALHE"],
      ["salvarEvidenciaCanonica", "PAPEIS_EDITA"],
      ["mudarSituacaoEvidencia", "PAPEIS_EDITA"],
      ["arquivarEvidenciaCanonica", "PAPEIS_EDITA"],
    ] as const) {
      expect(trecho(EVID_FN, `export const ${fn}`), fn).toContain(papeis);
    }
  });
  it("a tela de Pesquisa usa o escritor canônico, não o paralelo", () => {
    expect(EVID_TELA).toContain("mudarSituacaoEvidencia");
    expect(EVID_TELA).not.toContain("mudarEstadoEvidencia");
    expect(EVID_TELA).toContain("EvidenciasCanonicasPainel");
    for (const fn of [
      "listarEvidenciasDoCaso",
      "salvarEvidenciaCanonica",
      "arquivarEvidenciaCanonica",
    ]) {
      expect(EVID_PAINEL).toContain(fn);
    }
    expect(EVID_PAINEL).toContain("AcaoOperacional");
  });
});

describe("perfil institucional: org da sessão, papel e tela", () => {
  it("registrarPerfilInstitucional não aceita organizationId do cliente", () => {
    const fn = trecho(
      PERFIL_FN,
      "export const registrarPerfilInstitucional",
      "export const registrarSnapshotInstitucional",
    );
    expect(fn).not.toContain("data.organizationId");
    expect(fn).not.toMatch(/inputValidator\(\(data: \{ organizationId/);
    expect(fn).toContain("organizacaoDeQuemGrava");
  });
  it("o snapshot é escopado pela organização da sessão", () => {
    const fn = trecho(PERFIL_FN, "export const registrarSnapshotInstitucional");
    expect(fn).toContain("organizacaoDeQuemGrava");
    expect(fn).toContain('.eq("organization_id", organizationId)');
  });
  it("a Governança monta as ações", () => {
    expect(GOVERNANCA).toContain("PerfilInstitucionalAcoes");
    expect(PERFIL_UI).toContain("registrarPerfilInstitucional");
    expect(PERFIL_UI).toContain("registrarSnapshotInstitucional");
  });
});

describe("ativarCaso delega ao caminho único", () => {
  const fn = trecho(SAAS, "export const ativarCaso");
  it("não tem mais regra própria de ativação", () => {
    expect(fn).toContain("ativarCasoComChecks");
    expect(fn).not.toContain("pagamento_confirmado");
    expect(fn).not.toContain("gravarComVerificacao");
  });
  it("o cartão do Caso 360 chama ativarCaso", () => {
    expect(CARTAO).toContain("ativarCaso");
  });
});

describe("piloto absorvido pelo Caso 360, no caso escolhido", () => {
  it("nenhuma função do piloto busca 'o' caso piloto", () => {
    expect(PILOTO).not.toContain('.eq("piloto", true)');
    expect(PILOTO).toContain("caseId");
  });
  it("liberar portal só admin/operações e só no caso escolhido", () => {
    const fn = trecho(PILOTO, "export const liberarPortalPiloto");
    expect(fn).toContain("PAPEIS_LIBERA_PORTAL");
    expect(fn).toContain('.eq("id", data.caseId)');
  });
  it("piloto-ana não localiza por código da Ana e valida o canônico no próprio caso", () => {
    const loc = trecho(PILOTO_ANA, "async function localizar", "function ehCasoDaAna");
    expect(loc).toContain('.eq("id", caseId)');
    expect(loc).not.toContain("CODIGOS_BUSCA_PILOTO");
    const def = trecho(PILOTO_ANA, "export const definirIdCanonicoPiloto");
    expect(def).not.toContain("PILOTO_ANA.ids_historicos");
    expect(def).toContain("identificadoresDoCaso");
  });
  it("família fixa só semeia o caso da Ana", () => {
    expect(PILOTO_ANA).toMatch(/casoDaAna\s*\?\s*NUCLEO_PILOTO/);
  });
  it("o Caso 360 monta o cartão e não recria resolverBloqueioPiloto", () => {
    expect(CASO360).toContain("<ConferenciaPilotoCaso caseId={id} />");
    expect(CARTAO).not.toContain("resolverBloqueioPiloto");
    for (const fn of [
      "painelPiloto",
      "salvarDadoPiloto",
      "verificarDadoPiloto",
      "criarPesquisaPiloto",
      "liberarPortalPiloto",
      "carregarPilotoAna",
      "materializarPilotoAna",
      "definirIdCanonicoPiloto",
    ]) {
      expect(CARTAO, fn).toContain(fn);
    }
    expect(CARTAO).toContain("@/lib/gates-piloto");
  });
});

describe("radar de marcos jurídicos", () => {
  it("aparece na Validação Jurídica via cartões de marcos", () => {
    expect(RADAR_UI).toContain("radarMarcosJuridicosDoPainel");
    expect(MARCOS).toContain("<RadarMarcosCasos />");
  });
});
