import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  alertasDoCaso,
  checklistDoCaso,
  type CasoGoLiveEncontrado,
} from "@/components/desk-go-live";
import { descreverResolucaoPessoa, faturasAbertas } from "@/components/golive/acoes-registro";

/**
 * Religação do GoLive (31/10/2026, decisão da Proprietária): o GoLive é a vida
 * completa do cliente, dentro do Caso 360. Cinco escritores de
 * `golive-escritores.functions.ts` e o registro do caso não tinham tela; agora
 * têm, sempre gravando no caso escolhido por `?casoId=`.
 */
const fonte = (p: string) => readFileSync(p, "utf8");
const R = "src/routes/_authenticated/";

describe("GoLive: cada escritor órfão tem tela, com o caso escolhido", () => {
  it("Discovery e call têm registro próprio em leads e no comercial", () => {
    for (const rota of ["golive.leads.tsx", "golive.comercial.tsx"]) {
      const f = fonte(R + rota);
      expect(f, rota).toContain("registrarDiscoveryGoLive");
      expect(f, rota).toContain("registrarCallGoLive");
      expect(f, rota).toContain("useEscritorGoLive(registrarDiscoveryGoLive)");
      expect(f, rota).toContain("<AcaoDiscovery");
      expect(f, rota).toContain("<AcaoCall");
    }
  });

  it("a conferência de pessoa está em Pessoas, o pagamento no Financeiro e a publicação nas Microentregas", () => {
    expect(fonte(R + "golive.pessoas.tsx")).toContain("useEscritorGoLive(resolverPessoaGoLive)");
    expect(fonte(R + "golive.pessoas.tsx")).toContain("<AcaoConferirPessoa");
    expect(fonte(R + "golive.financeiro.tsx")).toContain(
      "useEscritorGoLive(registrarPagamentoGoLive)",
    );
    expect(fonte(R + "golive.financeiro.tsx")).toContain("<AcaoPagamento");
    expect(fonte(R + "golive.microentregas.tsx")).toContain(
      "useEscritorGoLive(publicarNoAppGoLive)",
    );
    expect(fonte(R + "golive.microentregas.tsx")).toContain("<AcaoPublicarNoApp");
  });

  it("publicar direto só aparece para microentrega concluída", () => {
    const f = fonte(R + "golive.microentregas.tsx");
    const i = f.indexOf("<AcaoPublicarNoApp");
    expect(f.slice(Math.max(0, i - 80), i)).toContain("concluida(m)");
  });

  it("nenhuma ação nova grava fora do caso: todas passam por useEscritorGoLive", () => {
    for (const rota of [
      "golive.leads.tsx",
      "golive.comercial.tsx",
      "golive.pessoas.tsx",
      "golive.financeiro.tsx",
      "golive.microentregas.tsx",
    ]) {
      const f = fonte(R + rota);
      for (const fn of [
        "registrarDiscoveryGoLive",
        "registrarCallGoLive",
        "resolverPessoaGoLive",
        "registrarPagamentoGoLive",
        "publicarNoAppGoLive",
      ]) {
        if (f.includes(fn)) expect(f, `${rota} usa ${fn}`).toContain(`useEscritorGoLive(${fn})`);
      }
    }
  });

  it("o Caso 360 aponta para o GoLive levando o casoId", () => {
    const f = fonte(R + "casos.$caseId.index.tsx");
    expect(f).toContain('to="/golive"');
    expect(f).toContain("search={{ casoId: id }}");
  });
});

describe("registro do caso (desk-go-live) lê o caso real, não fixture", () => {
  it("não importa o registro fixo de clientes", () => {
    const f = fonte("src/components/desk-go-live.tsx");
    expect(f).not.toContain("case-registry");
    expect(f).not.toContain("CASE_REGISTRY");
    for (const nome of ["Sophia", "Giovanna", "Ana Luiza", "Piccoli", "Friedmann"]) {
      expect(f, nome).not.toContain(nome);
    }
  });

  it("está montado na ficha do Caso 360 do GoLive", () => {
    const f = fonte(R + "golive.caso.tsx");
    expect(f).toContain("<GoLiveDesk caso={caso} />");
  });

  const base = {
    caso: {
      id: "c1",
      codigo: "X-1",
      titulo: "t",
      cliente: null,
      status: "ativo",
      fase: null,
      pais: null,
      proximaAcao: null,
      responsavel: null,
      prazo: null,
      contratoAssinado: false,
      pagamentoConfirmado: true,
      documentosMinimosOk: false,
    },
    plano: null,
  } as unknown as Pick<CasoGoLiveEncontrado, "caso" | "plano">;

  it("checklist só marca o que o caso registra, nada inferido", () => {
    const itens = checklistDoCaso(base);
    const por = Object.fromEntries(itens.map((i) => [i.item, i.feito]));
    expect(por["Pagamento confirmado"]).toBe(true);
    expect(por["Contrato assinado"]).toBe(false);
    expect(por["Documentos mínimos recebidos"]).toBe(false);
    expect(por["Responsável definido"]).toBe(false);
    expect(por["Próxima ação definida"]).toBe(false);
    expect(por["Marco da jornada registrado"]).toBe(false);
  });

  it("cada item sem registro vira alerta, e quem está completo não gera alerta", () => {
    const alertas = alertasDoCaso(checklistDoCaso(base));
    expect(alertas).toHaveLength(5);
    expect(alertas).toContain("Pendente: contrato assinado.");
    const completo = {
      caso: {
        ...base.caso,
        contratoAssinado: true,
        documentosMinimosOk: true,
        responsavel: "Equipe",
        proximaAcao: "Enviar",
      },
      plano: { marco: "D30" },
    } as unknown as Pick<CasoGoLiveEncontrado, "caso" | "plano">;
    expect(alertasDoCaso(checklistDoCaso(completo))).toEqual([]);
  });
});

describe("conferência de pessoa e faturas abertas", () => {
  it("descreve cada resposta de resolverPessoaGoLive sem criar nem fundir", () => {
    expect(
      descreverResolucaoPessoa({ acao: "reutilizar", pessoa: { id: "1", nome: "Maria" } }),
    ).toContain("Maria");
    expect(
      descreverResolucaoPessoa({
        acao: "confirmar",
        pessoa: { id: "1", nome: "Maria" },
        motivo: "Telefone igual.",
      }),
    ).toContain("Telefone igual.");
    expect(descreverResolucaoPessoa({ acao: "nova", pessoa: null })).toContain(
      "Nenhuma pessoa igual",
    );
  });

  it("só oferece pagamento para fatura que ainda não está paga nem cancelada", () => {
    const abertas = faturasAbertas([
      { id: "a", status: "paga" },
      { id: "b", status: "pendente" },
      { id: "c", status: "Cancelada" },
      { id: "d", status: null },
    ]);
    expect(abertas.map((f) => f.id)).toEqual(["b", "d"]);
  });
});
