import { describe, expect, it } from "vitest";

import { ENTRADA_TESTE_ANEXOS, anexosIaVTeste } from "@/lib/contrato-base-previa";
import { documentoDoAnexo, documentosDosAnexos, efeitosExternosDoDocumento } from "@/lib/anexos-documento";
import { CLAUSULA_DESPESAS_TERCEIROS } from "@/lib/despesas-terceiros";
import { MARCA_RASCUNHO, REGRAS_MOTOR_ANEXO_I, anexosIaV } from "@/lib/anexos-i-v";

const anexos = anexosIaVTeste();
const docs = documentosDosAnexos(anexos, ENTRADA_TESTE_ANEXOS);
const doc = (codigo: string) => docs.find((d) => d.codigo === codigo)!;

function textoDe(codigo: string): string {
  return JSON.stringify(doc(codigo));
}

describe("instâncias documentais dos anexos I–V", () => {
  it("renderiza os cinco anexos marcados como rascunho interno", () => {
    expect(docs).toHaveLength(5);
    for (const d of docs) expect(d.marca).toBe(MARCA_RASCUNHO);
  });

  it("Anexo I não inventa exclusões nem vencimento", () => {
    const d = doc("ANEXO_I_ORDEM_SERVICO");
    const t = JSON.stringify(d);
    expect(t).toContain("Vencimento não é inferido pelo número de parcelas.");
    const secaoEscopo = d.secoes.find((s) => "titulo" in s && s.titulo === "1. Escopo contratado")!;
    expect(JSON.stringify(secaoEscopo)).toMatch(/Exclusões não especificadas|não derivado/);
  });

  it("Anexo I nunca renderiza CPF por inferência e não registra assinatura", () => {
    const t = textoDe("ANEXO_I_ORDEM_SERVICO");
    expect(t).toContain("Renderizado somente quando exigido e autorizado.");
    expect(t).toContain("Nenhuma assinatura registrada");
  });

  it("Anexo II traz a política institucional sem criar despesa, pagamento ou cobrança", () => {
    const t = textoDe("ANEXO_II_DESPESAS_EXTERNAS");
    expect(t).toContain(CLAUSULA_DESPESAS_TERCEIROS);
    expect(t).toContain("não é receita, custo próprio, desembolso, reembolso, caixa nem cobrança padrão");
    expect(t).not.toMatch(/asaas|pix|checkout|cobrança criada/i);
  });

  it("Anexo II lista as cinco políticas como opções controladas", () => {
    const secao = doc("ANEXO_II_DESPESAS_EXTERNAS").secoes.find((s) => s.tipo === "opcoes")!;
    expect(secao.tipo === "opcoes" && secao.opcoes).toHaveLength(5);
  });

  it("Anexo III bloqueia pesquisa externa enquanto não houver aceite específico", () => {
    const t = textoDe("ANEXO_III_AUTORIZACAO_PESQUISA");
    expect(t).toContain("Sem aceite específico rastreável — pesquisa externa bloqueada.");
    expect(t).toContain("não substitui procuração");
  });

  it("Anexo IV não infere poderes e não cria procuração", () => {
    const t = textoDe("ANEXO_IV_PROCURACAO");
    expect(t).toContain("Poderes nunca são inferidos.");
    expect(t).toContain("Nenhuma procuração real foi criada, enviada ou assinada");
  });

  it("Anexo V usa impactos controlados e exige aceite", () => {
    const t = textoDe("ANEXO_V_ALTERACAO_ESCOPO");
    expect(t).toContain("Valor controlado — não é texto livre.");
    expect(t).toContain("Sem aceite, a alteração não entra no escopo vigente.");
  });

  it("proposta de outro caso não alimenta o documento do Anexo I", () => {
    const entrada = {
      ...ENTRADA_TESTE_ANEXOS,
      proposta: ENTRADA_TESTE_ANEXOS.proposta ? { ...ENTRADA_TESTE_ANEXOS.proposta, caseId: "CA-OUTRO-CASO" } : null,
    };
    const d = documentoDoAnexo(anexosIaV(entrada)[0]!, entrada)!;
    expect(JSON.stringify(d)).not.toContain("CA-OUTRO-CASO");
  });

  it("renderização documental não produz efeito externo", () => {
    expect(efeitosExternosDoDocumento()).toEqual([]);
  });
});

describe("regras do motor do Anexo I", () => {
  it("mantém as oito regras normativas", () => {
    expect(REGRAS_MOTOR_ANEXO_I).toHaveLength(8);
  });

  it("bloqueia SKU não homologado e não verificado", () => {
    const base = ENTRADA_TESTE_ANEXOS.proposta!;
    const naoVerificado = anexosIaV({ ...ENTRADA_TESTE_ANEXOS, proposta: { ...base, skuAtivoHomologado: null } })[0]!;
    expect(naoVerificado.pendencias.join(" ")).toContain("Situação do SKU não verificada");
    const inativo = anexosIaV({ ...ENTRADA_TESTE_ANEXOS, proposta: { ...base, skuAtivoHomologado: false } })[0]!;
    expect(inativo.pendencias.join(" ")).toContain("não está ativo e homologado");
    const ok = anexosIaV({ ...ENTRADA_TESTE_ANEXOS, proposta: { ...base, skuAtivoHomologado: true } })[0]!;
    expect(ok.pendencias.join(" ")).not.toContain("SKU");
  });
});
