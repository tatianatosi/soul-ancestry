import { describe, expect, it } from "vitest";
import {
  bloqueioCadastro,
  camposDoTipo,
  itemResolvido,
  pendenciasCadastro,
  rascunhoSolicitacaoCadastro,
  resumoPorPessoa,
  type ItemChecklist,
} from "@/lib/cadastro-checklist";

const base = (p: Partial<ItemChecklist>): ItemChecklist => ({
  case_id: "c",
  pessoa_tipo: "titular",
  pessoa_nome: "Ana",
  campo: "cpf",
  campo_rotulo: "CPF",
  obrigatorio: true,
  status: "pendente",
  acesso_restrito: true,
  ordem: 0,
  ...p,
});

describe("checklist cadastral", () => {
  it("dicionário por tipo de pessoa", () => {
    expect(camposDoTipo("titular").map((c) => c.campo)).toContain("estado_civil");
    expect(camposDoTipo("dependente").map((c) => c.campo)).toContain("status_representacao");
    expect(camposDoTipo("contratada").map((c) => c.campo)).toContain("cnpj");
  });
  it("verificado sem fonte ou data não resolve", () => {
    expect(itemResolvido(base({ status: "verificado" }))).toBe(false);
    expect(
      itemResolvido(
        base({ status: "verificado", fonte: "nao_declarada", data_verificacao: "2026-08-20" }),
      ),
    ).toBe(false);
    expect(
      itemResolvido(
        base({ status: "verificado", fonte: "documento_recebido", data_verificacao: "2026-08-20" }),
      ),
    ).toBe(true);
    expect(itemResolvido(base({ status: "nao_aplicavel" }))).toBe(true);
  });
  it("contratada pendente de fonte societária vira pendência", () => {
    const p = pendenciasCadastro([
      base({
        pessoa_tipo: "contratada",
        pessoa_nome: "Clube",
        campo: "cnpj",
        status: "aguarda_fonte_societaria",
      }),
    ]);
    expect(p[0]!.motivo).toMatch(/societária/);
  });
  it("resumo e bloqueio por pessoa", () => {
    const itens = [
      base({}),
      base({
        campo: "rg",
        status: "verificado",
        fonte: "documento_recebido",
        data_verificacao: "2026-08-20",
      }),
    ];
    const r = resumoPorPessoa(itens)[0]!;
    expect(r.resolvidos).toBe(1);
    expect(r.completo).toBe(false);
    expect(bloqueioCadastro(itens)?.codigo).toBe("CADASTRO_PESSOA_INCOMPLETO");
  });
  it("rascunho não envia nem cria link", () => {
    const r = rascunhoSolicitacaoCadastro({
      pessoa: "Ana",
      pendencias: pendenciasCadastro([base({})]),
      prazo: "2026-08-25",
    });
    expect(r.corpo).toContain("CPF");
    expect(r.corpo).not.toMatch(/https?:\/\//);
  });
});
