import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  bloqueiosDoPlano,
  jornadaMudou,
  origemJornada,
  patchJornada,
  prazoValido,
} from "@/lib/jornada-planejador";

/**
 * P4 — Jornada do Planejador no Caso 360 (25/09/2026). `case_plans` já tem
 * Produto-Pai, país/via, etapa, marco, responsável, bloqueio, próxima ação
 * e micro-entrega; a edição pontual nunca cria linha nem toca
 * plano_hash/versao/status — mesmo padrão do reconciliador D7 (P3).
 */

/* ---------------------------------------------- banco em memória */
type Linha = Record<string, any>;
const banco = vi.hoisted(() => ({ tabelas: {} as Record<string, Record<string, any>[]> }));

vi.mock("@/lib/persistencia.server", () => ({
  gravarComVerificacao: async (o: { tabela: string; id: string; payload: Linha; organizationId: string }) => {
    const linha = (banco.tabelas[o.tabela] ?? []).find((l) => l.id === o.id && l.organization_id === o.organizationId);
    if (!linha) throw new Error("NENHUMA_LINHA_AFETADA");
    Object.assign(linha, o.payload);
    return { ok: true, registro: { ...linha }, salvoEm: "agora" };
  },
}));
const timeline: Linha[] = [];
vi.mock("@/lib/timeline-operacional.server", () => ({
  registrarTimelineCaso: async (_s: unknown, e: Linha) => {
    timeline.push(e);
  },
}));

function supabaseFalso() {
  const consulta = (tabela: string) => {
    const filtros: [string, unknown][] = [];
    const linhas = () =>
      (banco.tabelas[tabela] ?? []).filter((l) => filtros.every(([c, v]) => (l[c] ?? null) === v));
    const q: any = {
      select: () => q,
      eq: (c: string, v: unknown) => (filtros.push([c, v]), q),
      is: (c: string, v: unknown) => (filtros.push([c, v]), q),
      order: () => q,
      limit: () => q,
      maybeSingle: async () => ({ data: linhas()[0] ?? null, error: null }),
      then: (ok: (r: unknown) => unknown) => Promise.resolve({ data: linhas(), error: null }).then(ok),
    };
    return q;
  };
  return { from: consulta };
}

const ORG = "org-1";
const CASO = "caso-1";
function semear(extra: Partial<Record<string, Linha[]>> = {}) {
  timeline.length = 0;
  banco.tabelas = {
    organization_members: [{ user_id: "u-1", organization_id: ORG, archived_at: null }],
    case_plans: [],
    profiles: [{ id: "resp-1", nome: "Ana Consultora" }],
    product_catalog: [{ id: "sku-1", code: "SKU-01", nome_comercial: "Diagnóstico" }],
    ...extra,
  } as Record<string, Linha[]>;
}

async function ler(caseId = CASO) {
  const { lerJornadaDoCaso } = await import("@/lib/jornada-planejador.server");
  return lerJornadaDoCaso(supabaseFalso(), ORG, caseId);
}
async function salvar(campos: Record<string, unknown>, caseId = CASO) {
  const { salvarJornadaDoCaso } = await import("@/lib/jornada-planejador.server");
  return salvarJornadaDoCaso(supabaseFalso(), { organizationId: ORG, caseId, userId: "u-1", campos: campos as never });
}

describe("regras puras", () => {
  it("bloqueios normaliza jsonb; lixo vira lista vazia", () => {
    expect(bloqueiosDoPlano(["Contrato assinado pendente."])).toEqual(["Contrato assinado pendente."]);
    expect(bloqueiosDoPlano(null)).toEqual([]);
    expect(bloqueiosDoPlano("texto solto")).toEqual([]);
  });
  it("patch só toca os campos editáveis da jornada — nunca versao/hash/status", () => {
    const patch = patchJornada({ etapa: " Discovery ", produto_pai_id: "PP-02" } as never);
    expect(patch).toEqual({ etapa: "Discovery", produto_pai_id: "PP-02" });
    expect(patch).not.toHaveProperty("versao");
    expect(patch).not.toHaveProperty("plano_hash");
    expect(patch).not.toHaveProperty("status");
  });
  it("sem mudança nenhuma é 'nada a gravar', não erro", () => {
    expect(jornadaMudou({})).toBe(false);
    expect(jornadaMudou({ etapa: "x" })).toBe(true);
  });
  it("prazo vazio é pendência legítima; prazo mal formado é inválido", () => {
    expect(prazoValido(null)).toBe(true);
    expect(prazoValido("")).toBe(true);
    expect(prazoValido("2026-09-30")).toBe(true);
    expect(prazoValido("30/09/2026")).toBe(false);
  });
  it("origem nomeia quem e quando, versão sempre explícita", () => {
    const o = origemJornada({ versao: 3, atualizadoEm: "2026-09-25T10:00:00Z", atualizadoPorNome: "Ana" });
    expect(o.texto).toContain("Ana");
    expect(o.texto).toContain("versão 3");
    expect(origemJornada({ versao: 1, atualizadoEm: null, atualizadoPorNome: null }).texto).toMatch(/data não registrada/);
  });
});

describe("leitura — nunca finge persistência", () => {
  beforeEach(() => semear());

  it("sem plano, devolve existe:false — não cria nada", async () => {
    const r = await ler();
    expect(r.existe).toBe(false);
    expect(banco.tabelas.case_plans).toHaveLength(0);
  });

  it("com plano, lê Produto-Pai, país/via, marco, responsável, bloqueio e micro-entrega", async () => {
    semear({
      case_plans: [
        {
          id: "plano-1",
          organization_id: ORG,
          case_id: CASO,
          versao: 2,
          status: "rascunho",
          etapa: "Discovery concluído",
          rota_confirmada: "Itália — jure sanguinis",
          produto_pai_id: "PP-02",
          marco_atual: "Assinatura do contrato",
          marcos: ["Assinatura do contrato", "Envio do dossiê"],
          responsavel_user_id: "resp-1",
          proxima_acao: "Agendar call de onboarding",
          prazo_proxima_acao: "2026-10-01",
          proxima_microentrega: "Prancha 1 — até 2026-10-02",
          motivos_bloqueio: ["Contrato assinado pendente."],
          product_catalog_id: "sku-1",
          updated_at: "2026-09-25T09:00:00Z",
          updated_by: "resp-1",
          archived_at: null,
        },
      ],
    });
    const r = await ler();
    expect(r.existe).toBe(true);
    if (!r.existe) return;
    expect(r.produtoPaiId).toBe("PP-02");
    expect(r.produtoPaiNome).toMatch(/Cidadania/i);
    expect(r.rotaConfirmada).toBe("Itália — jure sanguinis");
    expect(r.marcoAtual).toBe("Assinatura do contrato");
    expect(r.marcos).toEqual(["Assinatura do contrato", "Envio do dossiê"]);
    expect(r.responsavelNome).toBe("Ana Consultora");
    expect(r.bloqueios).toEqual(["Contrato assinado pendente."]);
    expect(r.proximaMicroentrega).toBe("Prancha 1 — até 2026-10-02");
    expect(r.skuCodigo).toBe("SKU-01");
    expect(r.versao).toBe(2);
  });
});

describe("edição pontual — nunca cria versão nem toca hash/status", () => {
  beforeEach(() =>
    semear({
      case_plans: [
        {
          id: "plano-1",
          organization_id: ORG,
          case_id: CASO,
          versao: 2,
          plano_hash: "h123",
          status: "rascunho",
          etapa: "Discovery concluído",
          rota_confirmada: null,
          produto_pai_id: null,
          marco_atual: null,
          marcos: [],
          responsavel_user_id: null,
          proxima_acao: null,
          prazo_proxima_acao: null,
          motivos_bloqueio: [],
          archived_at: null,
        },
      ],
    }),
  );

  it("recusa quando não há plano — sem fingir persistência", async () => {
    semear();
    const r = await salvar({ etapa: "x" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro).toMatch(/Preencher planejador/);
  });

  it("prazo mal formado é recusado antes de gravar", async () => {
    const r = await salvar({ prazo_proxima_acao: "30/09/2026" });
    expect(r.ok).toBe(false);
  });

  it("grava só os campos enviados, na mesma linha — versao/hash/status ficam intactos", async () => {
    const r = await salvar({ etapa: "Aceite formalizado", marco_atual: "Assinatura do contrato" });
    expect(r.ok).toBe(true);
    const linha = banco.tabelas.case_plans[0];
    expect(linha.etapa).toBe("Aceite formalizado");
    expect(linha.marco_atual).toBe("Assinatura do contrato");
    expect(linha.versao).toBe(2);
    expect(linha.plano_hash).toBe("h123");
    expect(linha.status).toBe("rascunho");
    expect(timeline).toHaveLength(1);
    expect(timeline[0].title).toBe("Jornada do planejador atualizada");
  });

  it("reenviar os mesmos campos (sem diferença real) não é tratado como erro nem duplica timeline", async () => {
    await salvar({ etapa: "Aceite formalizado" });
    const r2 = await salvar({});
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.mudou).toBe(false);
    expect(timeline).toHaveLength(1);
  });
});

describe("SKU nunca é gate; ligações e superfícies", () => {
  const componente = readFileSync("src/components/caso/jornada-planejador.tsx", "utf8");
  const servidor = readFileSync("src/lib/jornada-planejador.server.ts", "utf8");
  const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("o cartão renderiza os campos editáveis mesmo sem SKU/Produto-Pai definidos", () => {
    expect(componente).toContain("SKU informativo do plano");
    expect(componente).toContain('não selecionado');
    expect(componente).not.toMatch(/disabled=.*sku/i);
  });
  it("o leitor busca o SKU só para exibir — nunca condiciona a leitura dos demais campos a ele", () => {
    const leitor = servidor.slice(servidor.indexOf("export async function lerJornadaDoCaso"), servidor.indexOf("export async function salvarJornadaDoCaso"));
    expect(leitor).toContain("// P4 item 4: SKU só informativo");
  });
  it("Caso 360 monta o painel antes do formulário grande, sem substituí-lo", () => {
    const i = caso360.indexOf("PainelJornadaPlanejador");
    const j = caso360.indexOf("PlanejadorOperacional caseId={id}");
    expect(i).toBeGreaterThan(0);
    expect(i).toBeLessThan(j);
  });
  it("o escritor pontual nunca toca plano_hash/versao/status, e nunca insere linha", () => {
    expect(servidor).not.toMatch(/patch\.versao|patch\.plano_hash|patch\.status/);
    expect(servidor).not.toMatch(/\.from\("case_plans"\)\s*\.insert\(/);
  });
});

describe("App — fronteira e pendência sanitizada", () => {
  it("case_plans continua fora do caminho do App", () => {
    const fronteira = readFileSync("src/lib/__tests__/app-fronteira-pessoa-unificada-2026-09-24.test.ts", "utf8");
    expect(fronteira).toContain('"case_plans"');
    const vivo = readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8");
    expect(vivo).not.toContain('from("case_plans")');
  });
  it("a migration expõe só um booleano — nenhum texto de dependência atravessa", () => {
    const mig = readFileSync("supabase/migrations/20260925130000_portal_casos_pendencia_cliente.sql", "utf8");
    expect(mig).toContain("security_barrier = true, security_invoker = false");
    expect(mig).toContain("portal_caso_permitido(c.id)");
    expect(mig).toMatch(/cardinality\(p2\.dependencias_cliente\)\s*>\s*0/);
    expect(mig).not.toMatch(/dependencias_cliente\[|select\s+dependencias_cliente\b/);
    expect(mig).not.toMatch(/select\s+.*\bmarco_atual\b/);
  });
  it("frase de pendência é fixa e computada só do booleano — nunca texto do staff", async () => {
    const { projetarProximaAcaoCliente, sinaisDoCasoPortal } = await import("@/lib/motor-caso");
    const sinal = sinaisDoCasoPortal({
      status: "ativo",
      ativo: true,
      documentosPendentes: 0,
      pagamentoPendente: false,
      pendenciaClientePendente: true,
    });
    const p = projetarProximaAcaoCliente(sinal);
    expect(p.acao).toBe("Há uma pendência que depende de você — a equipe vai detalhar no próximo contato.");
    expect(p.destino).toBe("/portal/jornada");
    // Documento e pagamento continuam prioritários sobre a pendência do plano.
    const comDocumento = projetarProximaAcaoCliente(
      sinaisDoCasoPortal({ status: "ativo", ativo: true, documentosPendentes: 1, pagamentoPendente: false, pendenciaClientePendente: true }),
    );
    expect(comDocumento.acao).toMatch(/documento/);
  });
});
