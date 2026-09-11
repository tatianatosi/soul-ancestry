import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// CA02-CRM-VIVO-PAINEL-CALLS (09/09/2026): transformar o Painel de Calls numa
// mesa de Discovery — cada pergunta SPIN com pergunta, por que importa,
// contexto/origem, resposta, estado, destino e consequência no mesmo card.
const painel = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
const varredura = readFileSync("src/components/crm/varredura-whatsapp.tsx", "utf8");

describe("Painel de Calls — mesa de Discovery (CA02-CRM-VIVO-PAINEL-CALLS)", () => {
  it("não existe mais formulário duplicado 'Qualificação preliminar' ao lado do roteiro", () => {
    expect(painel).not.toContain('titulo="Qualificação preliminar"');
  });

  it("o roteiro deduplica campos repetidos entre blocos — cada campo aparece um único card", () => {
    expect(painel).toContain("jaRenderizado");
    expect(painel).toMatch(/jaRenderizado\.has\(c\)/);
  });

  it("gravar rascunho da call não exige o roteiro inteiro (mesma trava de sempre)", () => {
    expect(painel).toContain("disabled={mutar.isPending || !Object.keys(rascunho).length}");
  });

  it("achado de WhatsApp chega ao card da pergunta certa, não fica solto", () => {
    expect(varredura).toContain("onAchadosMudaram");
    expect(painel).toContain("onAchadosMudaram={setAchados}");
    expect(painel).toContain("achadosDoCampo");
  });

  it("achado permite confirmar, virar hipótese ou ignorar — nunca vira fato automático", () => {
    expect(painel).toContain("aplicarAchado(campoId, a.valor, multi)");
    expect(painel).toContain("virarHipoteseAchado(campoId, a.valor, multi)");
    expect(painel).toContain("ignorarAchado(campoId, a.valor)");
    expect(painel).toContain("Informado via WhatsApp — a confirmar");
  });

  it("achado nunca grava a conversa em observação — só o valor estruturado no campo certo", () => {
    expect(painel).not.toMatch(/aplicarAchado[\s\S]{0,120}observacoes/);
    expect(painel).not.toContain("a.trecho}`");
  });

  it("criar tarefa da próxima ação reusa salvarTarefa (já deduplicado) — nenhum escritor novo", () => {
    expect(painel).toContain('import { salvarTarefa } from "@/lib/ops.functions"');
    expect(painel).toContain("criarTarefaFn({");
  });

  it("tarefa só é oferecida quando já há caso e a próxima ação tem prazo real (consequência real)", () => {
    expect(painel).toContain("!lead.case_id || !lead.proxima_acao || !lead.proxima_acao_em");
  });

  it("trilha/marco mostram contexto interno resumido com o mesmo aviso de não exposição ao App", () => {
    expect(painel).toContain("Uso interno de triagem. Não apresentar como parecer, garantia de direito, prazo ou instrução ao cliente.");
  });

  it("cards do roteiro usam grid responsivo (uma coluna no celular, duas a partir de md)", () => {
    expect(painel).toContain('className="mt-3 grid gap-2 md:grid-cols-2"');
  });

  it("SPIN no mesmo fluxo: checkbox ligado aos spin_* já existentes, com pergunta no card", () => {
    expect(painel).toContain('meta.tipo === "checkbox"');
    expect(painel).toContain("campoBool");
    expect(painel).toContain("meta.pergunta");
  });
});
