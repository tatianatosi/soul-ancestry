import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  CAMPOS_CONTATO_PARTE_RECONCILIAVEIS,
  ROTULO_CAMPO_CONTATO_PARTE,
} from "@/lib/contratos.functions";

/**
 * Fase 0 (27/09/2026) — "Prompt Canônicos": identidade e snapshot
 * contratual. Cobre 0.2 (reconciliação contact_parties × clientes) e 0.3
 * (migration de imutabilidade proposta, não aplicada).
 */

describe("Fase 0.2 — sincronizarContatoPartesDoCaso: nome/e-mail/telefone/endereço, mesma filosofia sem dedup do CPF", () => {
  const arquivo = readFileSync("src/lib/contratos.functions.ts", "utf8");

  it("cobre nome, email, telefone e endereço (endereço estendido no Corte 4, 27/09/2026)", () => {
    expect(CAMPOS_CONTATO_PARTE_RECONCILIAVEIS).toEqual(["nome", "email", "telefone", "endereco"]);
    expect(ROTULO_CAMPO_CONTATO_PARTE.nome).toBe("Nome");
    expect(ROTULO_CAMPO_CONTATO_PARTE.email).toBe("E-mail");
    expect(ROTULO_CAMPO_CONTATO_PARTE.telefone).toBe("Telefone");
    expect(ROTULO_CAMPO_CONTATO_PARTE.endereco).toBe("Endereço");
  });

  it("existe como server fn, valida o campo contra a lista controlada", () => {
    expect(arquivo).toContain("export const sincronizarContatoPartesDoCaso");
    const inicio = arquivo.indexOf("export const sincronizarContatoPartesDoCaso");
    const trecho = arquivo.slice(inicio, inicio + 1500);
    expect(trecho).toContain("Campo fora da lista controlada");
  });

  it("nunca sobrescreve conflito (só preenche vazio), mesma regra do CPF", () => {
    const inicio = arquivo.indexOf("export const sincronizarContatoPartesDoCaso");
    const trecho = arquivo.slice(inicio, arquivo.indexOf("export const arquivarItemContrato"));
    expect(trecho).toContain('if (item.acao !== "preencher") continue;');
    expect(trecho).not.toContain("resolverParteId");
  });

  it("nunca mexe em contrato já assinado", () => {
    const inicio = arquivo.indexOf("export const sincronizarContatoPartesDoCaso");
    const trecho = arquivo.slice(inicio, arquivo.indexOf("export const arquivarItemContrato"));
    expect(trecho).toContain('if (contrato.signed_at) throw new Error("Contrato já assinado');
  });

  it("dependente nunca herda dado do responsável (mesma regra do CPF)", () => {
    const inicio = arquivo.indexOf("export const sincronizarContatoPartesDoCaso");
    const trecho = arquivo.slice(inicio, arquivo.indexOf("export const arquivarItemContrato"));
    expect(trecho).toContain('p.role === "dependent"');
    expect(trecho).toContain("dependente_nao_sincronizado");
  });
});

describe("Fase 0.2 — componente ReconciliarContatoPartesContrato: sem botão de resolver conflito", () => {
  const componente = readFileSync("src/components/contrato/reconciliar-contato-partes.tsx", "utf8");

  it("mostra os 3 blocos (nome/e-mail/telefone) num único painel", () => {
    expect(componente).toContain("CAMPOS_CONTATO_PARTE_RECONCILIAVEIS.map((campo) =>");
  });

  it("conflito é só informativo — nunca um botão de sobrescrever", () => {
    expect(componente).toContain("nada é sobrescrito automaticamente");
    expect(componente).not.toContain("Usar o");
    expect(componente).not.toContain("resolverParteId");
  });

  it("desabilita preencher quando o contrato já foi assinado", () => {
    expect(componente).toContain("preencher > 0 && !contratoAssinado");
  });
});

describe("Fase 0.2 — wiring em casos.$caseId.contrato.preparar.tsx", () => {
  const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

  it("importa e renderiza o novo painel ao lado do painel de CPF já existente", () => {
    expect(pagina).toContain(
      'import { ReconciliarContatoPartesContrato } from "@/components/contrato/reconciliar-contato-partes";',
    );
    expect(pagina).toContain("<ReconciliarCpfPartes");
    expect(pagina).toContain("<ReconciliarContatoPartesContrato");
  });
});

describe("Fase 0.3 — migration de imutabilidade pós-assinatura: proposta, não aplicada", () => {
  const migration = readFileSync(
    "supabase/migrations/20260927100000_contract_parties_imutabilidade_pos_assinatura.sql",
    "utf8",
  );

  it("estende a mesma função de guarda já existente (CREATE OR REPLACE, não uma segunda trigger)", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.fn_contract_parties_guard()");
  });

  it("preserva a checagem original de representação de menor", () => {
    expect(migration).toContain("legal_representative_required");
  });

  it("recusa UPDATE em contract_parties quando o contrato já está assinado", () => {
    expect(migration).toContain("TG_OP = 'UPDATE'");
    expect(migration).toContain("v_signed_at IS NOT NULL");
    expect(migration).toContain("RAISE EXCEPTION");
  });

  it("é aditiva — não recria a trigger nem remove nada", () => {
    expect(migration).not.toContain("DROP TRIGGER");
    expect(migration).not.toContain("DROP FUNCTION");
  });
});
