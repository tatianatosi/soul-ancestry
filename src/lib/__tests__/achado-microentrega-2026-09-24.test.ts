import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const rota = readFileSync("src/routes/_authenticated/achados.$caseId.tsx", "utf8");

/**
 * CA-ACHADO-MICROENTREGA (24/09/2026) — achado real: um achado marcado
 * `eligible_for_client_deliverable=true` abria um alerta interno
 * (`case_alerts`, via `prepararConsequenciaAchado`, já testado em
 * `ca11-centro-inteligencia.test.ts`) e parava aí — nenhuma UI criava a
 * microentrega nem gravava `client_deliverable_id` de volta, então o
 * alerta nunca se resolvia sozinho. Fecha o elo: reaproveita
 * `criarMicroentregaCliente` (já existente) + `salvarAchado` (já existente,
 * já chama `prepararConsequenciaAchado`) — nenhuma tabela, rota ou
 * escritor novo.
 */
describe("Achados → microentrega vinculada (2026-09-24)", () => {
  it("reaproveita os escritores já existentes, não cria um novo", () => {
    expect(rota).toContain('import { criarMicroentregaCliente } from "@/lib/jornada-cliente.functions"');
    expect(rota).toContain("useServerFn(criarMicroentregaCliente)");
    expect(rota).toContain("useServerFn(salvarAchado)");
  });

  it("cria a microentrega em rascunho e depois grava client_deliverable_id no achado", () => {
    const inicio = rota.indexOf("function PainelMicroentregaAchado");
    const trecho = rota.slice(inicio, inicio + 2500);
    expect(trecho).toContain('tipo: "documento_localizado"');
    expect(trecho).toContain("criarEntrega(");
    expect(trecho).toContain("vincularAchado(");
    expect(trecho).toContain("client_deliverable_id: entrega.id");
    // A ordem importa: só vincula depois que a entrega foi criada de fato.
    expect(trecho.indexOf("criarEntrega(")).toBeLessThan(trecho.indexOf("vincularAchado("));
  });

  it("nunca oferece o botão para achado já vinculado, arquivado ou não elegível", () => {
    const inicio = rota.indexOf("function PainelMicroentregaAchado");
    const trecho = rota.slice(inicio, inicio + 2500);
    expect(trecho).toContain('achado["archived_at"] || !achado["eligible_for_client_deliverable"]');
    expect(trecho).toContain('if (achado["client_deliverable_id"])');
    expect(trecho).toContain("Micro-entrega vinculada.");
  });

  it("exige revisão humana do resumo antes de habilitar o botão de criar", () => {
    const inicio = rota.indexOf("function PainelMicroentregaAchado");
    const trecho = rota.slice(inicio, inicio + 3000);
    expect(trecho).toContain("!titulo.trim() || !resumo.trim()");
    expect(trecho).toContain("revise antes de salvar");
  });

  it("nunca publica sozinho — a microentrega nasce em rascunho, publicação continua manual", () => {
    const inicio = rota.indexOf("function PainelMicroentregaAchado");
    const trecho = rota.slice(inicio, inicio + 3000);
    expect(trecho).toContain("nunca publica sozinho");
    expect(trecho).toContain("Publicação continua manual");
  });

  it("respeita o mesmo gate de permissão das demais ações da tela (podeEditar)", () => {
    expect(rota).toContain("podeEditar={podeEditar}");
    const inicio = rota.indexOf("function PainelMicroentregaAchado");
    const trecho = rota.slice(inicio, inicio + 2500);
    expect(trecho).toContain("if (!podeEditar) return null;");
  });
});
