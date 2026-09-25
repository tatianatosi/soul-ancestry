import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  ATOS_PREDOMINANTES_POR_FASE,
  FOCO_JURIDICO_POR_FASE,
  raciocinarJuridicoPorFase,
} from "@/lib/raciocinio-juridico-jornada";
import type { PendenciaJuridicaCaso, ResultadoValidacaoJuridicaCaso } from "@/lib/validacao-juridica-caso";
import { FASES_JORNADA } from "@/lib/onboarding-jornada";

function pendencia(overrides: Partial<PendenciaJuridicaCaso>): PendenciaJuridicaCaso {
  return {
    origem: "marco",
    rotulo: "Marco X",
    estado: "a_revisar",
    decisaoHumanaNecessaria: "Revisar",
    documentoOuEvidencia: null,
    atoAfetado: "publicacao_juridica",
    ...overrides,
  };
}

function validacao(pendencias: PendenciaJuridicaCaso[], semRota = false): ResultadoValidacaoJuridicaCaso {
  return {
    semRotaAplicavel: semRota,
    rota: semRota ? null : { trackId: "t1", pais: "Áustria", nacionalidade: null, viaPreliminar: "descendencia", statusVia: "em_revisao", trackName: null, lifecycleStatus: "em_revisao", revisaoHumanaJuridica: "obrigatoria" },
    pendencias,
    atosAfetados: [...new Set(pendencias.map((p) => p.atoAfetado))],
  };
}

describe("P12 — motor jurídico: raciocínio explicável por fase da jornada", () => {
  it("nunca calcula placar/score/veredito — nenhum campo numérico no tipo/retorno do raciocínio", () => {
    const conteudo = readFileSync("src/lib/raciocinio-juridico-jornada.ts", "utf8");
    const corpo = conteudo.slice(conteudo.indexOf("export const ATOS_PREDOMINANTES_POR_FASE"));
    expect(corpo).not.toMatch(/:\s*number/);
  });

  it("cobre exatamente as 8 fases canônicas de FASES_JORNADA, nenhuma a mais/a menos", () => {
    const idsFases = FASES_JORNADA.map((f) => f.id);
    expect(Object.keys(ATOS_PREDOMINANTES_POR_FASE).sort()).toEqual([...idsFases].sort());
    expect(Object.keys(FOCO_JURIDICO_POR_FASE).sort()).toEqual([...idsFases].sort());
  });

  it("toda entrada de FOCO_JURIDICO_POR_FASE cita a fonte do documento real", () => {
    for (const foco of Object.values(FOCO_JURIDICO_POR_FASE)) {
      expect(foco.fonte).toContain("contexto-motor-cidadania-v1.0.md");
    }
  });

  it("fase reconhecida: separa pendências do ato predominante da fase das demais", () => {
    const pAssinatura = pendencia({ atoAfetado: "assinatura", rotulo: "Tema contratual" });
    const pProtocolo = pendencia({ atoAfetado: "protocolo", rotulo: "Marco de prazo" });
    const r = raciocinarJuridicoPorFase({
      faseJornada: "aceite_e_formalizacao",
      validacao: validacao([pAssinatura, pProtocolo]),
      alertaInternoPais: null,
    });
    expect(r.faseId).toBe("aceite_e_formalizacao");
    expect(r.pendenciasDaFase).toEqual([pAssinatura]);
    expect(r.pendenciasDeOutrasFases).toEqual([pProtocolo]);
    expect(r.focoJuridico).not.toBeNull();
  });

  it("fase nula/desconhecida: nenhuma pendência é classificada como 'da fase', foco nulo, rótulo explícito", () => {
    const p = pendencia({ atoAfetado: "publicacao_juridica" });
    const r = raciocinarJuridicoPorFase({ faseJornada: null, validacao: validacao([p]), alertaInternoPais: null });
    expect(r.faseId).toBeNull();
    expect(r.faseRotulo).toBe("Sem fase da jornada registrada");
    expect(r.focoJuridico).toBeNull();
    expect(r.pendenciasDaFase).toEqual([]);
    expect(r.pendenciasDeOutrasFases).toEqual([p]);
  });

  it("fase com valor fora do CHECK real (drift) cai no mesmo tratamento de 'sem fase' — nunca inventa foco", () => {
    const r = raciocinarJuridicoPorFase({
      faseJornada: "fase_2_pesquisa",
      validacao: validacao([]),
      alertaInternoPais: null,
    });
    expect(r.faseId).toBeNull();
    expect(r.focoJuridico).toBeNull();
  });

  it("alerta interno do país é repassado como está, nunca combinado num indicador único", () => {
    const r = raciocinarJuridicoPorFase({
      faseJornada: "pesquisa_e_validacao",
      validacao: validacao([]),
      alertaInternoPais: "Risco: presumir transmissão por avô sem testar interrupção geracional.",
    });
    expect(r.alertaInternoPais).toBe("Risco: presumir transmissão por avô sem testar interrupção geracional.");
  });

  it("semRotaAplicavel é repassado do resultado da validação, sem recomputar", () => {
    const r = raciocinarJuridicoPorFase({
      faseJornada: "onboarding",
      validacao: validacao([], true),
      alertaInternoPais: null,
    });
    expect(r.semRotaAplicavel).toBe(true);
  });
});

describe("P12 — validacaoJuridicaCaso passa a incluir o raciocínio por fase", () => {
  const crmDeskFn = readFileSync("src/lib/crm-desk.functions.ts", "utf8");

  it("lê case_plans.fase_jornada do caso (mesma fonte canônica da jornada)", () => {
    const trecho = crmDeskFn.slice(crmDeskFn.indexOf("export const validacaoJuridicaCaso"));
    expect(trecho).toContain('.from("case_plans")');
    expect(trecho).toContain('"fase_jornada"');
  });

  it("chama raciocinarJuridicoPorFase e devolve raciocinioFase junto ao resultado", () => {
    const trecho = crmDeskFn.slice(crmDeskFn.indexOf("export const validacaoJuridicaCaso"));
    expect(trecho).toContain("raciocinarJuridicoPorFase(");
    expect(trecho).toContain("raciocinioFase");
  });
});

describe("P12 — trilhas de país novas (NL/EE/LV/LT) e Bélgica fora do escopo", () => {
  const migracao = readFileSync(
    "supabase/migrations/20260925180000_citizenship_tracks_paises_baixos_balticos.sql",
    "utf8",
  );

  it("cria exatamente as 4 trilhas do tier legal_research_pilot do documento fonte", () => {
    for (const code of ["TRK-NL-FILIACAO", "TRK-EE-DESC", "TRK-LV-DESC", "TRK-LT-RESTAURACAO"]) {
      expect(migracao).toContain(code);
    }
  });

  it("não cria trilha para Bélgica — detection_only no documento fonte, mesmo tratamento do backlog oriental", () => {
    expect(migracao).not.toMatch(/'Bélgica'|TRK-BE-/);
  });

  it("todas as inserções são idempotentes (where not exists) e sem fonte legal afirmada como homologada", () => {
    expect(migracao).toContain("where not exists");
    expect(migracao).toContain("a homologar");
    expect(migracao).toContain("Não ofertar como rota concluída sem revisão jurídica.");
  });
});
