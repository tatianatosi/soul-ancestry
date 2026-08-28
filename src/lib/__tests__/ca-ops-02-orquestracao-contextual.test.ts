import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  EVENTOS_INTERNOS,
  ROTULO_EVENTO,
  executarCadeiaJornada,
  fiarCadenciaDoCaso,
  templatesVigentesPorEtapaCanal,
  type EventoInterno,
} from "@/lib/orquestracao-jornada";

const COMPONENTE = readFileSync("src/components/desk/orquestracao-contextual.tsx", "utf8");
const ROTA = readFileSync("src/routes/_authenticated/biblioteca-mensagens.tsx", "utf8");
const HOJE = "2026-08-23";

describe("CA-OPS-02 — painel contextual da Biblioteca de Mensagens", () => {
  it("1. renderiza a partir de evento canônico válido", () => {
    expect(COMPONENTE).toContain("export function OrquestracaoContextual");
    for (const ev of EVENTOS_INTERNOS) {
      expect(ROTULO_EVENTO[ev as EventoInterno]).toBeTruthy();
      const cadeia = executarCadeiaJornada({
        hoje: HOJE,
        evento: ev,
        caso_id: "contexto-biblioteca",
      });
      expect(cadeia.contemAcaoExterna).toBe(false);
    }
  });

  it("2. template vigente vem apenas da regra existente", () => {
    const cadeia = executarCadeiaJornada({
      hoje: HOJE,
      evento: "lead_novo",
      caso_id: "contexto-biblioteca",
    });
    const vigentes = templatesVigentesPorEtapaCanal(HOJE);
    if (cadeia.template.template) {
      expect(vigentes.some((t) => t.chave === cadeia.template.template!.chave)).toBe(true);
    }
  });

  it("3. ausência de template mostra estado seguro", () => {
    expect(COMPONENTE).toContain("Nenhum modelo vigente aplicável a este evento");
    expect(COMPONENTE).toContain("Nenhum evento selecionado");
  });

  it("4. painel não possui handler ou chamada de envio", () => {
    for (const proibido of [
      "fetch(",
      "supabase",
      "sendMessage",
      "enviar",
      "whatsapp.send",
      "mailto:",
    ]) {
      expect(COMPONENTE.toLowerCase()).not.toContain(proibido.toLowerCase());
    }
  });

  it("5. painel não cria fila, touchpoint, rascunho persistido, log ou dado", () => {
    for (const proibido of [
      "useMutation",
      "registrarUsoTemplate",
      "insert(",
      "update(",
      "localStorage",
    ]) {
      expect(COMPONENTE).not.toContain(proibido);
    }
  });

  it("6. cliente não acessa o painel", () => {
    expect(ROTA).toContain("/_authenticated/biblioteca-mensagens");
    const portal = readFileSync("src/routes/portal/route.tsx", "utf8");
    expect(portal).not.toContain("OrquestracaoContextual");
  });

  it("7. a rota Biblioteca de Mensagens mantém conteúdo e guardas atuais", () => {
    expect(ROTA).toContain("Regras de uso");
    expect(ROTA).toContain("validarUsoTemplate");
    expect(ROTA).toContain("registrarUsoTemplate");
    expect(ROTA).toContain("<OrquestracaoContextual />");
  });

  it("8. integração usa exportações reais, sem duplicar motor", () => {
    expect(COMPONENTE).toContain('from "@/lib/orquestracao-jornada"');
    expect(COMPONENTE).not.toContain("TEMPLATES_GOVERNADOS = [");
    expect(COMPONENTE).not.toContain("const EVENTOS_INTERNOS");
  });

  it("9. nenhum dado de outro caso é carregado; o caso é digitado pelo operador", () => {
    expect(COMPONENTE).toContain('caso_id: "contexto-biblioteca"');
    expect(COMPONENTE).toContain("fiarCadenciaDoCaso");
    expect(COMPONENTE).not.toContain("listarCasos");
    expect(COMPONENTE).not.toContain("supabase");
  });

  it("10. cadência real por caso deriva evento e resolve template sem envio", () => {
    const critico = fiarCadenciaDoCaso({
      hoje: "2026-08-23",
      caso_id: "CA-2026-ANA-001",
      ultimoTouchpointValidoEm: "2026-08-01",
    });
    expect(critico.cadencia.status).toBe("critico");
    expect(critico.eventoDerivado).toBe("cadencia_critica");
    expect(critico.resolucoes.some((r) => r.origem === "derivado")).toBe(true);
    expect(critico.envioExecutado).toBe(false);
    expect(critico.persistido).toBe(false);
  });

  it("11. cadência regular não gera evento derivado nem alerta", () => {
    const regular = fiarCadenciaDoCaso({
      hoje: "2026-08-23",
      caso_id: "CA-2026-ANA-001",
      ultimoTouchpointValidoEm: "2026-08-21",
    });
    expect(regular.eventoDerivado).toBeNull();
    expect(regular.alertas).toHaveLength(0);
  });

  it("12. fila do Painel Hoje não duplica o mesmo caso", () => {
    const f = fiarCadenciaDoCaso({
      hoje: "2026-08-23",
      caso_id: "CA-2026-ANA-001",
      evento: "followup_vencido",
      ultimoTouchpointValidoEm: "2026-08-01",
    });
    const chaves = f.painelHoje.map((i) => i.chave);
    expect(new Set(chaves).size).toBe(chaves.length);
  });
});
