import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Corte R1 (21/09/2026, auditoria contacts/leads/CPF/núcleo): conecta
 * `sincronizarPessoaDoCaso` (contratos.functions.ts, já implementada e
 * autorizada em 06/09/2026 — "Fase 3 da unificação de pessoa") a uma tela.
 * A função já existia com detecção de conflito de CPF pronta e testada em
 * lógica, mas nenhuma rota/componente a chamava. Este corte só faz o
 * wiring: nenhuma mudança na função em si, nenhum writer novo, nenhuma
 * fusão automática — o botão "Preencher CPFs pendentes" só grava itens
 * `preencher`. Fase E (27/09/2026) acrescentou decisão humana explícita
 * (com motivo) para itens `conflito`/`conflito_aceito` — ver
 * fasee-contrato-snapshot-3-decisoes-2026-09-27.test.ts.
 */

const funcoes = readFileSync("src/lib/contratos.functions.ts", "utf8");
const componente = readFileSync("src/components/contrato/reconciliar-cpf-partes.tsx", "utf8");
const pagina = readFileSync(
  "src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx",
  "utf8",
);

describe("sincronizarPessoaDoCaso (contratos.functions.ts) — não alterada por este corte", () => {
  it("continua só preenchendo, nunca sobrescrevendo conflito", () => {
    expect(funcoes).toContain('if (item.acao !== "preencher") continue;');
  });

  it("continua recusando alterar partes de contrato já assinado", () => {
    expect(funcoes).toContain('if (contrato.signed_at) throw new Error("Contrato já assinado');
  });
});

describe("ReconciliarCpfPartes (novo componente) — mostra os 6 estados (Fase E acrescenta conflito_aceito)", () => {
  it("define os 6 estados possíveis do plano", () => {
    for (const acao of [
      "preencher",
      "conflito",
      "conflito_aceito",
      "ja_sincronizado",
      "sem_dado_canonico",
      "dependente_nao_sincronizado",
    ]) {
      expect(componente).toContain(`${acao}:`);
    }
  });

  it("o botão de gravar é desabilitado quando não há nada a preencher ou o contrato já foi assinado", () => {
    expect(componente).toContain("disabled={ocupado || Boolean(contratoAssinado) || preencher === 0}");
  });

  it("Fase E (27/09/2026): conflito mostra valor atual x canônico e agora oferece ação de decisão humana (nunca sobrescrita silenciosa)", () => {
    expect(componente).toContain('p.acao === "conflito" || p.acao === "conflito_aceito"');
    expect(componente).toContain("Na parte do contrato:");
    expect(componente).toContain("Resolver conflito");
  });
});

describe("casos.$caseId.contrato.preparar.tsx — wiring do painel", () => {
  it("importa sincronizarPessoaDoCaso e o novo componente", () => {
    expect(pagina).toContain(
      'import { sincronizarPessoaDoCaso, type DecisaoConflitoContrato } from "@/lib/contratos.functions";',
    );
    expect(pagina).toContain(
      'import { ReconciliarCpfPartes } from "@/components/contrato/reconciliar-cpf-partes";',
    );
  });

  it("chama a função com o caseId da rota, não um id de contrato solto", () => {
    expect(pagina).toContain("reconciliarCpf({ data: { caseId, confirmar } })");
  });

  it("renderiza o painel ao lado do painel já existente de ressincronizar anexos", () => {
    expect(pagina).toContain("<RessincronizarAnexos");
    expect(pagina).toContain("<ReconciliarCpfPartes");
  });
});
