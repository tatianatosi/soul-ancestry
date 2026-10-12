import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * CA-JURIDICO-MESA-DISCOVERY (24/09/2026) — pedido explícito da
 * Proprietária: "contexto de países jurídicos... é complemento do painel
 * de calls CRM vivo e mesa discovery". O motor jurídico (citizenship_tracks)
 * já era carregado e exibido na Mesa Discovery (listarTrilhasJuridicas,
 * campo "Trilha jurídica de referência") — mas a varredura de WhatsApp já
 * identifica o país (nacionalidades_interesse) sem nunca ligar
 * automaticamente à trilha correspondente, obrigando reescolher o mesmo
 * país num segundo dropdown manualmente.
 *
 * Fecha o elo dentro de aplicarAchado — mesma função que já grava o
 * achado aceito — sem nova consulta ao servidor (reaproveita `trilhas`,
 * já carregada) e sem sobrescrever escolha humana anterior.
 */

const painel = readFileSync("src/components/crm/painel-calls.tsx", "utf8");

const trechoAplicarAchado = painel.slice(
  painel.indexOf("const aplicarAchado = "),
  painel.indexOf("const virarHipoteseAchado ="),
);

describe("Mesa Discovery liga a trilha jurídica quando o país é aceito da varredura", () => {
  it("busca a trilha pelo mesmo país do achado, reaproveitando a lista já carregada", () => {
    expect(trechoAplicarAchado).toContain('campo === "nacionalidades_interesse"');
    expect(trechoAplicarAchado).toContain("trilhas.find((t) => t.pais === valor)");
  });

  it("nunca sobrescreve uma trilha já escolhida manualmente", () => {
    expect(trechoAplicarAchado).toContain('!atualizado["trilha_referencia_id"]');
    expect(trechoAplicarAchado).toContain("!lead?.trilha_referencia_id");
  });

  it("não introduz nenhuma consulta nova ao servidor — só usa `trilhas`, já carregada para o card de trilha", () => {
    expect(painel).toContain('queryKey: ["trilhas-juridicas"]');
    // A mesma lista já usada em opcoesTrilhas/trilhaSelecionada.
    expect(painel).toContain("const trilhas = qTrilhas.data?.trilhas ?? []");
  });

  it("continua não confirmando nada sozinho: aplicar é sempre a ação humana de aceitar o achado", () => {
    expect(painel).toContain("aplicarAchado(campoId, a.valor, multi)");
    expect(painel).toContain("Informado via WhatsApp — a confirmar");
  });
});
