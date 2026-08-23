import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  EVENTOS_INTERNOS,
  ROTULO_EVENTO,
  executarCadeiaJornada,
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
      const cadeia = executarCadeiaJornada({ hoje: HOJE, evento: ev, caso_id: "contexto-biblioteca" });
      expect(cadeia.contemAcaoExterna).toBe(false);
    }
  });

  it("2. template vigente vem apenas da regra existente", () => {
    const cadeia = executarCadeiaJornada({ hoje: HOJE, evento: "lead_novo", caso_id: "contexto-biblioteca" });
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
    for (const proibido of ["fetch(", "supabase", "sendMessage", "enviar", "whatsapp.send", "mailto:"]) {
      expect(COMPONENTE.toLowerCase()).not.toContain(proibido.toLowerCase());
    }
  });

  it("5. painel não cria fila, touchpoint, rascunho persistido, log ou dado", () => {
    for (const proibido of ["useMutation", "registrarUsoTemplate", "insert(", "update(", "localStorage"]) {
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

  it("9. nenhum dado de outro caso aparece no preview", () => {
    expect(COMPONENTE).toContain('caso_id: "contexto-biblioteca"');
    expect(COMPONENTE).not.toContain("casoId");
    expect(COMPONENTE).not.toContain("listarCasos");
  });
});
