import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Ordem P0 (21/09/2026, "Sistema Único Transversal"): conecta o Caso 360 aos
 * domínios já existentes (produto-pai, etapa/rota/marcos do planejador,
 * acesso ao App) sem criar tabela nova, sem duplicar query. Testa
 * composição por case_id (o bloco novo usa o mesmo id da rota, não busca
 * outro caso) e isolamento por organization_id (a leitura consolidada
 * continua rejeitando caso de outra organização).
 */

const rota = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
const componente = readFileSync("src/components/caso/estado-integrado.tsx", "utf8");
const cadeiaServer = readFileSync("src/lib/cadeia-operacional.server.ts", "utf8");

describe("EstadoIntegradoCaso — composição por case_id, sem query nova", () => {
  it("é importado e renderizado na rota do Caso 360", () => {
    expect(rota).toContain(
      'import { EstadoIntegradoCaso } from "@/components/caso/estado-integrado";',
    );
    expect(rota).toContain("<EstadoIntegradoCaso");
  });

  it("recebe o caseId da própria rota (mesmo id usado pelas outras queries)", () => {
    expect(rota).toContain("caseId={id}");
  });

  it("reaproveita as queries já existentes da rota (carregarFichaCaso, carregarCanonico, resumoVisaoClienteCaso) — nenhuma prop vem de fetch novo dentro do componente", () => {
    expect(componente).not.toContain("useQuery");
    expect(componente).not.toContain("useServerFn");
    expect(rota).toContain("cliente={(q.data?.cliente");
    expect(rota).toContain("servicos={(qc2.data?.servicos");
    expect(rota).toContain("acessoApp={");
  });

  it("a única leitura nova é lerCadeiaOperacional, já existente (não cria função de leitura duplicada)", () => {
    expect(rota).toContain(
      'import { lerCadeiaOperacional } from "@/lib/cadeia-operacional.functions";',
    );
    expect(rota).toContain("carregarCadeiaFn = useServerFn(lerCadeiaOperacional)");
    expect(rota).toContain('queryKey: ["ficha-caso-cadeia-operacional", id]');
  });

  it("cada item do bloco só lê e linka para a fonte — nenhum onChange/mutation dentro do componente", () => {
    expect(componente).not.toContain("useMutation");
    expect(componente).not.toContain("onChange");
  });
});

describe("estadoCadeiaOperacional — isolamento por organization_id preservado", () => {
  it("continua rejeitando caso de outra organização (casoDaCadeia)", () => {
    expect(cadeiaServer).toContain('if (!caso || caso.organization_id !== org) throw new Error("Caso não encontrado nesta organização.");');
  });

  it("a extensão do retorno de planejador é aditiva — campos existentes de SaidaPlanejador continuam presentes", () => {
    expect(cadeiaServer).toContain("...saidaPlano,");
    expect(cadeiaServer).toContain("etapa: entradaPlano?.etapa ?? null");
    expect(cadeiaServer).toContain("rotaConfirmada: entradaPlano?.rotaConfirmada ?? null");
    expect(cadeiaServer).toContain("produtoSkuCodigo: entradaPlano?.produtoSkuCodigo ?? null");
  });

  it("reaproveita entradaDoPlano já existente em vez de recalcular a lógica de entrada", () => {
    expect(cadeiaServer).toContain(
      "const entradaPlano = plano ? entradaDoPlano(plano, caso.id, sku?.code ?? null) : null;",
    );
    expect(cadeiaServer).toContain("const saidaPlano = entradaPlano ? avaliarPlanejador(entradaPlano) : null;");
  });
});
