import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * "Contrato de Uma Hora", item 3 (diretriz da Proprietária): a Ordem de
 * Serviço precisa ser operável DENTRO do fluxo do contrato — rascunho com
 * responsável, datas/cadência, dependências e escopo — sem emitir nada
 * automaticamente.
 *
 * Medição de 03/10/2026: `service_orders` já tinha `responsible_user_id`,
 * `start_date`, `end_date` e `start_condition_*`, e `atualizarObservacaoOrdem`
 * já era o escritor desses campos — mas só a tela separada `/ordens-servico`
 * os expunha. A seção "5. Ordem de Serviço (Anexo I) e anexos" da preparação
 * do contrato mostrava a cadeia e derivava o Anexo I, e nada mais.
 */

const PAINEL = "src/components/contrato/ordem-servico-do-caso.tsx";
const CADEIA = "src/components/contrato/cadeia-formalizacao.tsx";
const SERVER = "src/lib/cadeia-formalizacao.server.ts";

describe("Ordem de Serviço operável no fluxo do contrato (03/10/2026)", () => {
  it("1. o leitor da cadeia traz o planejamento real da OS, não só escopo e status", () => {
    const s = readFileSync(SERVER, "utf8");
    for (const coluna of [
      "responsible_user_id",
      "start_date",
      "end_date",
      "start_condition_status",
      "start_condition_notes",
      "internal_notes",
    ]) {
      expect(s, coluna).toContain(coluna);
    }
  });

  it("2. o painel edita responsável, início, prazo, escopo e dependências", () => {
    const s = readFileSync(PAINEL, "utf8");
    expect(s).toContain("Responsável");
    expect(s).toContain("Início previsto");
    expect(s).toContain("Prazo");
    expect(s).toContain("Escopo da OS");
    expect(s).toContain("Dependências e cadência");
  });

  it("3. reusa o escritor existente — nenhum writer novo de service_orders", () => {
    const s = readFileSync(PAINEL, "utf8");
    expect(s).toContain("atualizarObservacaoOrdem");
    expect(s).not.toContain('from("service_orders")');
    expect(s).not.toContain("createServerFn");
  });

  it("4. não emite OS nem muda status, e diz onde o status mora", () => {
    const s = readFileSync(PAINEL, "utf8");
    expect(s).not.toContain("mudarStatusOrdem");
    expect(s).not.toContain("criarOrdemServico");
    expect(s).not.toContain("emitirOuRecuperarOS");
    expect(s).toContain("Não muda o status, não emite a OS, não assina, não cobra");
    expect(s).toContain("Mudança de status da OS continua em Ordens de serviço");
  });

  it("5. sem OS no caso, o estado vazio é específico e manda derivar o Anexo I", () => {
    const s = readFileSync(PAINEL, "utf8");
    expect(s).toContain('data-os-do-caso="ausente"');
    expect(s).toContain("Derive o Anexo I da proposta aprovada");
    expect(s).toContain("nunca de emissão automática");
  });

  it("6. gravação passa por AcaoOperacional com capacidade real e valida o prazo", () => {
    const s = readFileSync(PAINEL, "utf8");
    expect(s).toContain("AcaoOperacional");
    expect(s).toContain('capacidade="corrigir_os_anexos_previa"');
    expect(s).toContain("O prazo não pode ser anterior ao início previsto.");
    // Autoridade operacional: vínculo somente leitura informa, não bloqueia.
    expect(s).toContain("pendenciaGate");
  });

  it("7. o rascunho não vaza entre ordens: remonta quando a OS lida muda", () => {
    const s = readFileSync(PAINEL, "utf8");
    expect(s).toContain("useEffect");
    expect(s).toContain("ordem?.id");
  });

  it("8. o painel está montado no fluxo do contrato, não em tela separada", () => {
    const s = readFileSync(CADEIA, "utf8");
    expect(s).toContain("OrdemServicoDoCaso");
    expect(s).toContain("ordem={d.ordemServico}");
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    expect(rota).toContain("5. Ordem de Serviço (Anexo I) e anexos");
    expect(rota).toContain("<CadeiaFormalizacao");
  });
});
