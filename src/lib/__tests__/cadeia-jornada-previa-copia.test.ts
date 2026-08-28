import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  htmlImpressaoPainelContextual,
  resumoTextoPainelContextual,
} from "@/lib/cadeia-jornada-pdf";
import { descreverCadeia, proximaAcaoDoPainel } from "@/lib/cadeia-jornada-visao";
import { executarCadeiaJornada } from "@/lib/orquestracao-jornada";

const COMPONENTE = readFileSync("src/components/desk/cadeia-jornada.tsx", "utf8");
const HOJE = "2026-08-25";

const resultado = executarCadeiaJornada({
  hoje: HOJE,
  evento: "proposta_enviada",
  caso_id: "CA-TESTE-001",
  responsavel_id: "tati",
  prazo: "2026-08-30",
});
const elos = descreverCadeia(resultado, { evento: "proposta_enviada" });
const proxima = proximaAcaoDoPainel(resultado, elos);
const dados = { evento: "Proposta enviada", data: HOJE, proxima, elos };

describe("prévia do PDF somente leitura", () => {
  it("usa exatamente o mesmo documento da impressão", () => {
    expect(COMPONENTE).toContain('data-cadeia="previa-pdf"');
    expect(COMPONENTE).toContain('data-cadeia="previa-iframe"');
    expect(COMPONENTE).toContain("srcDoc={htmlImpressaoPainelContextual(dadosImpressao)}");
    expect(COMPONENTE).toContain('data-cadeia="previa-imprimir"');
    expect(COMPONENTE).toContain('aria-labelledby="cadeia-previa-titulo"');
  });

  it("abre pela ação de exportar e mantém aria-expanded", () => {
    expect(COMPONENTE).toContain('data-cadeia="exportar-pdf"');
    expect(COMPONENTE).toContain("aria-expanded={previa}");
    expect(COMPONENTE).toContain('aria-haspopup="dialog"');
  });

  it("o documento da prévia é somente leitura, sem envio", () => {
    const html = htmlImpressaoPainelContextual(dados);
    expect(html).toContain("somente leitura");
    expect(html).not.toMatch(/enviar|publicar agora|fetch\(/i);
  });
});

describe("cópia do resumo padronizado", () => {
  it("gera resumo com motivo, evidências e próxima ação", () => {
    const texto = resumoTextoPainelContextual(dados);
    expect(texto).toContain("PRÓXIMA AÇÃO NO PAINEL HOJE");
    expect(texto).toContain("MOTIVO");
    expect(texto).toContain("EVIDÊNCIAS");
    expect(texto).toContain("CADEIA DA JORNADA (11 ELOS)");
    for (const elo of elos) expect(texto).toContain(elo.rotulo);
    expect(texto).toContain("Nenhum envio, publicação ou gravação foi executado.");
  });

  it("tem botão com rótulo e status acessível com fallback", () => {
    expect(COMPONENTE).toContain('data-cadeia="copiar-resumo"');
    expect(COMPONENTE).toContain('data-cadeia="copiar-status"');
    expect(COMPONENTE).toContain('aria-live="polite"');
    expect(COMPONENTE).toContain("Resumo copiado para a área de transferência.");
    expect(COMPONENTE).toContain("Não foi possível copiar automaticamente.");
  });

  it("copiar não envia, não persiste e não chama backend", () => {
    expect(COMPONENTE).not.toMatch(/fetch\(|supabase|insert\(|update\(|localStorage/);
  });
});

describe("ciclo de foco por teclado", () => {
  it("prende Tab/Shift+Tab no drawer e na prévia", () => {
    expect(COMPONENTE).toContain("const prenderFoco");
    expect(COMPONENTE).toContain('e.key !== "Tab"');
    expect(COMPONENTE).toContain("e.shiftKey");
    expect(COMPONENTE).toContain("prenderFoco(painelDrawerRef.current, e)");
    expect(COMPONENTE).toContain("prenderFoco(previaRef.current, e)");
  });

  it("define foco inicial e devolve o foco ao gatilho no Escape", () => {
    expect(COMPONENTE).toContain("fecharRef.current?.focus()");
    expect(COMPONENTE).toContain("gatilhoRef.current?.focus()");
    expect(COMPONENTE).toContain("gatilhoPreviaRef.current?.focus()");
    expect(COMPONENTE).toContain('e.key === "Escape"');
  });
});
