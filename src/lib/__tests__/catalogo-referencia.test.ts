import { describe, expect, it } from "vitest";

import {
  bloqueiosDeSelecao,
  filasDeReferencia,
  referenciaDeProduto,
  statusEfetivo,
  visivelNoSeletorDeOfertaNova,
} from "@/lib/catalogo-referencia";

const linha = (over: Record<string, unknown> = {}) =>
  referenciaDeProduto({
    code: "CA-CID-006",
    nome_comercial: "Certidão avulsa",
    status_produto: "ativo",
    status_homologacao: "homologado",
    preco_comercial_vigente: 280,
    preco_sugerido_fonte: 280,
    status_link_asaas: "validado",
    link_asaas_validado: "https://x",
    link_asaas_fonte: "https://x",
    ...over,
  });

describe("camada de referência de catálogo", () => {
  it("só permite proposta com produto ativo e homologado", () => {
    expect(bloqueiosDeSelecao(linha())).toEqual([]);
    expect(bloqueiosDeSelecao(linha({ status_homologacao: "em_revisao" })).length).toBeGreaterThan(0);
    expect(bloqueiosDeSelecao(linha({ status_homologacao: "bloqueado" })).length).toBeGreaterThan(0);
  });

  it("mantém SKU não comercializável fora do seletor de oferta nova", () => {
    for (const s of ["inativo", "arquivado", "historico", "descontinuado"]) {
      expect(visivelNoSeletorDeOfertaNova(linha({ status_produto: s }))).toBe(false);
    }
    expect(visivelNoSeletorDeOfertaNova(linha({ status_homologacao: "em_revisao" }))).toBe(true);
  });

  it("divergência comercial bloqueia por validação, mesmo homologado", () => {
    const r = linha({ preco_sugerido_fonte: 300 });
    expect(statusEfetivo(r).status).toBe("bloqueado");
    expect(bloqueiosDeSelecao(r).length).toBeGreaterThan(0);
  });

  it("filas separam sem homologação, link pendente e bloqueados, e excluem demo por padrão", () => {
    const refs = [
      linha({ code: "A", status_homologacao: "em_revisao" }),
      linha({ code: "B", status_link_asaas: "pendente" }),
      linha({ code: "C", status_homologacao: "bloqueado" }),
      linha({ code: "D", status_homologacao: "bloqueado", dados_teste: true }),
    ];
    const f = filasDeReferencia(refs);
    expect(f.ativos_sem_homologacao.map((i) => i.sku)).toContain("A");
    expect(f.link_pendente_ou_desatualizado.map((i) => i.sku)).toContain("B");
    expect(f.bloqueados.map((i) => i.sku)).toContain("C");
    expect(f.bloqueados.map((i) => i.sku)).not.toContain("D");
    expect(filasDeReferencia(refs, { incluirTeste: true }).bloqueados.map((i) => i.sku)).toContain("D");
  });
});
