import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Corte MÁSCARAS (02/10/2026) — nenhum validador de nome/data/endereço
 * existia no repo; telefone/e-mail não eram mascarados no formulário
 * genérico de ação do golive (`components/golive/acoes.tsx`), usado por
 * `golive.leads.tsx` e `golive.comercial.tsx`. Em vez de duplicar a máscara
 * em cada tela, o tipo de campo genérico ganhou "telefone"/"email" — fixa
 * os dois consumidores de uma vez.
 */
const ler = (p: string) => readFileSync(p, "utf8");

describe("components/golive/acoes.tsx: campo telefone/email usa validacao-pessoa", () => {
  const corpo = ler("src/components/golive/acoes.tsx");

  it("importa os validadores e formata telefone no onChange", () => {
    expect(corpo).toContain('from "@/lib/validacao-pessoa"');
    expect(corpo).toContain("formatarTelefone(e.target.value)");
    expect(corpo).toContain("telefoneValido(valorAtual)");
    expect(corpo).toContain("emailValido(valorAtual)");
  });

  it("os dois consumidores reais declaram o tipo mascarado, não texto livre", () => {
    for (const f of [
      "src/routes/_authenticated/golive.leads.tsx",
      "src/routes/_authenticated/golive.comercial.tsx",
    ]) {
      const tela = ler(f);
      expect(tela, f).toContain('nome: "telefone", rotulo: "Telefone", tipo: "telefone"');
      expect(tela, f).toContain('nome: "email", rotulo: "E-mail", tipo: "email"');
    }
  });
});

describe("components/pessoa/contatos-pessoa.tsx: nome/e-mail/telefone mascarados e validados", () => {
  const corpo = ler("src/components/pessoa/contatos-pessoa.tsx");

  it("importa os validadores e bloqueia gravação com dado inválido", () => {
    expect(corpo).toContain('from "@/lib/validacao-pessoa"');
    expect(corpo).toContain("nomeValido(form.nome)");
    expect(corpo).toContain("formatarTelefone(e.target.value)");
    expect(corpo).toContain("disabled={mAdicionar.isPending || !formValido}");
  });
});
