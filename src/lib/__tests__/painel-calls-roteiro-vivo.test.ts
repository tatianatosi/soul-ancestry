import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// CA02-CRM-VIVO-PAINEL-CALLS (09/09/2026): transformar o Painel de Calls numa
// mesa de Discovery — cada pergunta SPIN com pergunta, por que importa,
// contexto/origem, resposta, estado, destino e consequência no mesmo card.
const painel = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
const varredura = readFileSync("src/components/crm/varredura-whatsapp.tsx", "utf8");
const leads = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");

describe("Painel de Calls — mesa de Discovery (CA02-CRM-VIVO-PAINEL-CALLS)", () => {
  it("não existe mais formulário duplicado 'Qualificação preliminar' ao lado do roteiro", () => {
    expect(painel).not.toContain('titulo="Qualificação preliminar"');
  });

  it("a Mesa mostra uma pergunta SPIN por vez, com resposta e destino no mesmo card", () => {
    expect(painel).toContain("Mesa de Discovery");
    expect(painel).toContain("data-mesa-discovery");
    expect(painel).toContain("data-spin-etapa");
    expect(painel).toContain("data-pergunta-mesa");
    expect(painel).toContain("atual.pergunta");
    expect(painel).toContain("atual.campos.map");
    expect(painel).toContain("Pergunta anterior");
    expect(painel).toContain("Próxima pergunta");
    expect(painel).not.toContain("jaRenderizado");
    expect(painel).not.toContain('className="mt-3 grid gap-2 md:grid-cols-2"');
    expect(painel).not.toContain("ROTEIRO_DISCOVERY.map");
    expect(painel).not.toContain('["spin_situacao"');
  });

  it("gravar rascunho da call não exige o roteiro inteiro (mesma trava de sempre)", () => {
    // P2 (24/09/2026): a trava ganhou só o motivo de no-show/cancelamento;
    // continua sem exigir o roteiro inteiro.
    expect(painel).toContain("disabled={mutar.isPending || !Object.keys(rascunho).length || faltaMotivo}");
  });

  it("achado de WhatsApp chega ao card da pergunta certa, não fica solto", () => {
    expect(varredura).toContain("onAchadosMudaram");
    // Mesa Discovery viva (27/09/2026): os achados seguem para os cards junto com a fonte da conversa.
    expect(painel).toMatch(/onAchadosMudaram=\{\(lista, fonte\) => \{\s*setAchados\(lista\);/);
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

  // Roteiro mestre (documentos da Proprietária de 10–11/08, executados em
  // 27–28/09/2026): antes do case_id nenhuma tarefa vai ao Desk; depois dele,
  // a próxima ação é a do caso. O botão "Criar/atualizar tarefa" saiu da Mesa.
  it("a Mesa não cria tarefa do Desk a partir da próxima ação do lead", () => {
    expect(painel).not.toContain("salvarTarefa");
    expect(painel).not.toContain("criarTarefaFn({");
  });

  it("a próxima ação do lead continua sendo gravada só no lead canônico", () => {
    expect(painel).toContain("salvarLeadDesk");
  });

  it("trilha/marco mostram contexto interno resumido com o mesmo aviso de não exposição ao App", () => {
    expect(painel).toContain("Uso interno de triagem. Não apresentar como parecer, garantia de direito, prazo ou instrução ao cliente.");
  });

  it("SPIN no cadastro de leads não é mais checkbox — aponta para a Mesa", () => {
    expect(leads).toContain("Abrir a Mesa de Discovery no Painel de Calls");
    expect(leads).not.toContain('["spin_situacao", "Situação mapeada"]');
    expect(leads).not.toContain('type="checkbox" checked={bool(k)}');
  });

  it("cards do roteiro não voltam ao grid de formulário de duas colunas", () => {
    expect(painel).toContain('className="mt-3 space-y-2"');
    expect(painel).not.toContain('className="mt-3 grid gap-2 md:grid-cols-2"');
  });
});
