import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P0-ASSINATURA-REVISAO-HUMANA (18/09/2026) — "Registrar assinatura externa"
// disparava mAssinar.mutate() direto, sem confirmação humana, e o servidor
// (registrarAssinatura) gravava contract_case_parameters e crm_casos sem
// checar erro/linha afetada, sem histórico. O botão irmão ("Criar
// solicitação de assinatura") já usa AcaoOperacional/acaoExterna — mesmo
// padrão replicado aqui. Prova por leitura do código real, mesmo estilo já
// usado em p0-1-contrato-parte-contratante-role.test.ts nesta base.

const funcoes = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");
const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

const trechoRegistrarAssinatura = funcoes.slice(
  funcoes.indexOf("export const registrarAssinatura"),
  funcoes.indexOf("export const registrarAssinatura") +
    funcoes.slice(funcoes.indexOf("export const registrarAssinatura")).indexOf("\n  });") +
    "\n  });".length,
);

describe("P0-ASSINATURA-REVISAO-HUMANA — servidor exige motivo e verifica cada escrita", () => {
  it("valida o motivo quando informado, com os mesmos validadores já usados para os demais campos", () => {
    expect(trechoRegistrarAssinatura).toContain('exigirTexto(data.motivo, "motivo da confirmação"');
  });

  it("motivo ausente vira texto explícito de dívida, nunca silenciosamente vazio", () => {
    expect(trechoRegistrarAssinatura).toContain("Motivo não informado (fluxo sem confirmação humana explícita).");
  });

  it("verifica erro e linha afetada na escrita em contracts", () => {
    expect(trechoRegistrarAssinatura).toContain('.eq("id", registro.contract_id)\n      .select("id");');
    expect(trechoRegistrarAssinatura).toContain("if (contratoRes.error) throw new Error(contratoRes.error.message);");
    expect(trechoRegistrarAssinatura).toContain("if (!contratoRes.data?.length)");
  });

  it("verifica erro e linha afetada na escrita em contract_case_parameters — antes era disparada sem checagem", () => {
    expect(trechoRegistrarAssinatura).toContain(
      '.from("contract_case_parameters")\n      .update({ status: "assinado" })',
    );
    expect(trechoRegistrarAssinatura).toContain("if (parametrosRes.error || !parametrosRes.data?.length)");
    expect(trechoRegistrarAssinatura).toContain("revisão humana necessária antes de repetir a ação");
  });

  it("verifica erro e linha afetada na escrita em crm_casos.contrato_assinado — antes era disparada sem checagem", () => {
    expect(trechoRegistrarAssinatura).toContain('.update({ contrato_assinado: true })');
    expect(trechoRegistrarAssinatura).toContain("if (casoRes.error || !casoRes.data?.length)");
  });

  it("só registra histórico depois das três escritas confirmadas, nunca antes de uma falha", () => {
    const posContratos = trechoRegistrarAssinatura.indexOf("contratoRes.data?.length");
    const posParametros = trechoRegistrarAssinatura.indexOf("parametrosRes.error");
    const posCaso = trechoRegistrarAssinatura.indexOf("casoRes.error");
    const posTimeline = trechoRegistrarAssinatura.indexOf("registrarTimelineCaso(");
    expect(posContratos).toBeGreaterThan(-1);
    expect(posParametros).toBeGreaterThan(posContratos);
    expect(posCaso).toBeGreaterThan(posParametros);
    expect(posTimeline).toBeGreaterThan(posCaso);
  });

  it("histórico aponta para o contrato (não para conteúdo integral do contrato)", () => {
    expect(trechoRegistrarAssinatura).toContain('sourceEntityType: "contracts"');
    expect(trechoRegistrarAssinatura).toContain("sourceEntityId: registro.contract_id");
    expect(trechoRegistrarAssinatura).not.toMatch(/clausula|preambulo|CLAUSULAS_FIXAS/i);
  });

  it("import de registrarTimelineCaso presente no módulo", () => {
    expect(funcoes).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });
});

describe("P0-ASSINATURA-REVISAO-HUMANA — interface exige confirmação humana explícita", () => {
  it("'Registrar assinatura externa' não é mais um botão cru — está dentro de AcaoOperacional com acaoExterna", () => {
    const idx = rota.indexOf('rotulo="Registrar assinatura externa"');
    expect(idx).toBeGreaterThan(-1);
    const trecho = rota.slice(Math.max(0, idx - 200), idx + 400);
    expect(trecho).toContain("<AcaoOperacional");
    expect(trecho).toContain('acaoExterna="registrar_assinatura_externa"');
    expect(rota).not.toMatch(/<button\s+onClick=\{\(\)\s*=>\s*mAssinar\.mutate\(\)\}/);
  });

  it("bloqueia confirmação sem os três campos preenchidos (data, origem, referência)", () => {
    const idx = rota.indexOf('rotulo="Registrar assinatura externa"');
    const trecho = rota.slice(idx, idx + 600);
    expect(trecho).toContain("validacaoFormulario={");
    expect(trecho).toContain("assinatura.dataAssinatura");
    expect(trecho).toContain("assinatura.origemExterna");
    expect(trecho).toContain("assinatura.referencia");
  });

  it("motivo digitado na confirmação é repassado ao servidor, não descartado", () => {
    expect(rota).toContain("onConfirmar={(motivo) => {");
    expect(rota).toContain("mAssinar.mutate(motivo)");
    expect(rota).toContain("mutationFn: (motivo: string) => assinar({ data: { id: registroId as string, ...assinatura, motivo } })");
  });

  it("texto da tela não afirma mais que a ação nunca libera o Portal — reconhece a condição real", () => {
    expect(rota).not.toContain("não cria cobrança, não libera portal e não inicia pesquisa externa");
    expect(rota).toContain("liberação de acesso ao Portal");
    expect(rota).toMatch(/não publica conteúdo, não envia mensagem, não gera\s*\n?\s*cobrança e não concede\s*\n?\s*acesso automaticamente/);
  });
});

/**
 * Nota de limitação (declarada, não corrigida aqui): assim como em
 * p0-1-contrato-parte-contratante-role.test.ts, não há nesta base precedente
 * de invocar diretamente o `.handler` de uma createServerFn com um client
 * Supabase falso simulando uma falha na segunda ou terceira escrita — só a
 * prova de leitura de código acima (ordem das checagens, mensagens de erro
 * específicas por etapa, ausência de rollback). Construir esse arnês agora
 * ampliaria o escopo deste corte.
 */
