import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { passosDoContrato, resumoProntidao, type EntradaProntidao } from "@/lib/contrato-prontidao";

/**
 * Proprietária, 04/10/2026: "verifique os cards e melhore a experiência para
 * que seja uma verificação rápida e não um excesso de auditorias e
 * verificações de itens já verificados diversas vezes."
 *
 * Nenhum cartão foi removido: o trilho responde "onde está e o que falta" sem
 * abrir nenhum deles, e cada passo aponta para o cartão que o resolve.
 */

const VAZIO: EntradaProntidao = {
  propostaAprovada: false,
  completudePct: 0,
  partesComPendencia: 3,
  escopoResumoPreenchido: false,
  condicaoValor: null,
  anexoIStatus: null,
  anexosPendentes: 2,
  rascunhoSalvo: false,
  versaoFinalCongelada: false,
  revisaoAprovadaEm: null,
  assinaturaRegistradaEm: null,
  bloqueiosImpeditivos: [],
  pendenciasHumanas: 4,
};

const PRONTO: EntradaProntidao = {
  propostaAprovada: true,
  completudePct: 100,
  partesComPendencia: 0,
  escopoResumoPreenchido: true,
  condicaoValor: 9600,
  anexoIStatus: "approved",
  anexosPendentes: 0,
  rascunhoSalvo: true,
  versaoFinalCongelada: true,
  revisaoAprovadaEm: "2026-10-03T12:00:00Z",
  assinaturaRegistradaEm: "2026-10-04T09:00:00Z",
  bloqueiosImpeditivos: [],
  pendenciasHumanas: 0,
};

describe("Prontidão do contrato — verificação em uma olhada (04/10/2026)", () => {
  it("1. são os 8 passos da cadeia já aprovada, na ordem, cada um com âncora real", () => {
    const passos = passosDoContrato(VAZIO);
    expect(passos.map((p) => p.chave)).toEqual([
      "proposta",
      "partes",
      "escopo",
      "comercial",
      "os",
      "rascunho",
      "revisao",
      "assinatura",
    ]);
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    for (const p of passos) {
      expect(p.ancora.startsWith("#"), p.chave).toBe(true);
      expect(rota, `âncora ${p.ancora}`).toContain(`id="${p.ancora.slice(1)}"`);
    }
  });

  it("2. caso vazio: nada é declarado concluído e a próxima ação é a primeira da cadeia", () => {
    const r = resumoProntidao(VAZIO);
    expect(r.concluidos).toBe(0);
    expect(r.pronto).toBe(false);
    expect(r.proximo?.chave).toBe("proposta");
    expect(r.frase).toContain("Próximo passo — Proposta aprovada");
  });

  it("3. caso completo: uma frase fecha a verificação, sem mandar abrir cartão", () => {
    const r = resumoProntidao(PRONTO);
    expect(r.pronto).toBe(true);
    expect(r.concluidos).toBe(r.total);
    expect(r.proximo).toBeNull();
    expect(r.frase).toContain("Contrato completo");
  });

  it("4. a próxima ação é sempre o primeiro passo em aberto, não uma lista para auditar", () => {
    const r = resumoProntidao({ ...PRONTO, revisaoAprovadaEm: null, assinaturaRegistradaEm: null });
    expect(r.proximo?.chave).toBe("revisao");
    expect(r.frase).toContain("Revisão humana aprovada");
  });

  it("5. bloqueio impeditivo aparece como bloqueado, com o motivo humano", () => {
    const r = resumoProntidao({
      ...PRONTO,
      revisaoAprovadaEm: null,
      assinaturaRegistradaEm: null,
      bloqueiosImpeditivos: ["Forma de assinatura não configurada"],
    });
    const revisao = r.passos.find((p) => p.chave === "revisao")!;
    expect(revisao.estado).toBe("bloqueado");
    expect(revisao.detalhe).toContain("Forma de assinatura não configurada");
  });

  it("6. Anexo I salvo sem conteúdo não conta como feito, e o detalhe diz por quê", () => {
    const r = resumoProntidao({ ...PRONTO, anexoIStatus: "missing" });
    const os = r.passos.find((p) => p.chave === "os")!;
    expect(os.estado).toBe("pendente");
    expect(os.detalhe).toContain("sem conteúdo");
  });

  it("7. partes incompletas distinguem reconciliação pendente de ficha incompleta", () => {
    const comPartes = resumoProntidao({ ...PRONTO, partesComPendencia: 2 });
    expect(comPartes.passos.find((p) => p.chave === "partes")!.detalhe).toContain("reconciliar");
    const comFicha = resumoProntidao({ ...PRONTO, completudePct: 70 });
    expect(comFicha.passos.find((p) => p.chave === "partes")!.detalhe).toContain("70%");
  });

  it("8. o trilho é derivado, nunca um motor paralelo: sem consulta e sem escrita", () => {
    const mod = readFileSync("src/lib/contrato-prontidao.ts", "utf8");
    expect(mod).not.toContain("createServerFn");
    expect(mod).not.toContain("supabase");
    expect(mod).not.toContain(".from(");
    const comp = readFileSync("src/components/contrato/trilho-prontidao.tsx", "utf8");
    expect(comp).not.toContain("useMutation");
    expect(comp).not.toContain("useQuery");
  });

  it("9. está montado no topo da tela, antes do seletor de modo, e os cartões ficam", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    const trilho = rota.indexOf("<TrilhoProntidaoContrato");
    const modo = rota.indexOf('role="tablist"');
    expect(trilho).toBeGreaterThan(-1);
    expect(trilho).toBeLessThan(modo);
    // Nenhum cartão da sequência de uma hora foi removido.
    for (const titulo of [
      "1. Proposta aprovada",
      "2. Partes e representação",
      "3. Escopo e entregas",
      "4. Condição particular do caso",
      "5. Ordem de Serviço (Anexo I) e anexos",
      "6. Pendências humanas",
      "7. Salvar rascunho",
    ]) {
      expect(rota, titulo).toContain(titulo);
    }
  });
});
