import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Decisão da Proprietária, 26/10/2026 (opção "b" do impasse do contrato da
 * Ana): "pode regenerar desde que o PDF renderize na hora a partir dos dados
 * atuais, desde que eu tenha acesso à versão criada de alguma forma, e
 * parametrizar automaticamente para evitar problemas futuros."
 *
 * As três partes, verificadas no código-fonte (não executamos o servidor
 * aqui — os testes de integração do motor de prévia já cobrem
 * `montarDoRegistro`/`gerarPrevia`; este teste trava o contrato ESPECÍFICO
 * desta decisão, para não regredir silenciosamente numa refatoração futura):
 *
 * 1. "Renderiza na hora, a partir dos dados atuais": `gerarDocumentoAtual`
 *    sempre regera a prévia (`gerarPreviaNucleo`) antes de devolver o id —
 *    nunca devolve um id antigo sem primeiro atualizar o conteúdo.
 * 2. "Acesso à versão criada": a versão é PERSISTIDA em
 *    `contract_parameter_previews` (mesma tabela/mecanismo de sempre, com
 *    hash de conteúdo) — não é um PDF que nasce e se perde na resposta HTTP.
 * 3. "Parametrizar automaticamente": toda chamada de `gerarDocumentoAtual`
 *    roda `parametrizarAutomaticamente` primeiro, no modo que SÓ PREENCHE
 *    VAZIO — nunca sobrescreve valor existente nem reescreve a origem de um
 *    valor já confirmado. É a mesma restrição que a Proprietária decidiu na
 *    P32b ("só deixar o cadastro mais completo, somente adicionando dado"),
 *    agora aplicada automaticamente em vez de depender do botão manual.
 */
const motor = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");

describe("gerarDocumentoAtual — opção 'b' da Proprietária (26/10/2026)", () => {
  it("sempre regera a prévia a partir dos parâmetros atuais antes de devolver o id", () => {
    const inicio = motor.indexOf("export const gerarDocumentoAtual");
    const bloco = motor.slice(inicio, inicio + 1600);
    expect(bloco).toContain("parametrizarAutomaticamente(supabase, registro.id");
    expect(bloco).toContain("gerarPreviaNucleo(supabase, context.userId as string");
    // a ordem importa: parametriza, DEPOIS regera — nunca o contrário.
    expect(bloco.indexOf("parametrizarAutomaticamente")).toBeLessThan(bloco.indexOf("gerarPreviaNucleo"));
  });

  it("a versão fica persistida (mesma tabela/mecanismo do rascunho de trabalho de sempre)", () => {
    const inicio = motor.indexOf("async function gerarPreviaNucleo");
    const fim = motor.indexOf("\n/**\n * Parametrização automática", inicio);
    const bloco = motor.slice(inicio, fim);
    expect(bloco).toContain('.from("contract_parameter_previews")');
    expect(bloco).toContain(".insert(");
    expect(bloco).toContain("conteudo_hash");
  });

  it("a parametrização automática só preenche vazio — nunca sobrescreve nem reescreve origem", () => {
    const inicio = motor.indexOf("async function preencherDeOrigensNucleo");
    const fim = motor.indexOf("\n/** Grava um parâmetro com origem obrigatória", inicio);
    const bloco = motor.slice(inicio, fim);
    // higiene (limpar valor divergente) é exclusiva do botão manual
    expect(bloco).toContain("modo.somentePreencherVazios ? [] : valores");
    // correção de origem (proposta sobrescrevendo a origem gravada) também é exclusiva do manual
    expect(bloco).toContain("!modo.somentePreencherVazios && c.origem ===");
    // valor existente nunca é substituído no modo automático — só gera sinal de conflito
    expect(bloco).toContain("automaticoSobreValorExistente");
    expect(bloco).toContain("Boolean(modo.somentePreencherVazios) && Boolean(atual.valor?.trim())");
  });

  it("o botão manual 'importar das origens' preserva o comportamento de sempre (sem o modo automático)", () => {
    const inicio = motor.indexOf("export const preencherDeOrigens = createServerFn");
    const bloco = motor.slice(inicio, inicio + 400);
    expect(bloco).toContain("preencherDeOrigensNucleo(context.supabase as Sb, data.id)");
    // chamado sem segundo argumento: usa o modo padrão (comportamento histórico, não só-vazio)
    expect(bloco).not.toMatch(/preencherDeOrigensNucleo\([^)]*somentePreencherVazios/);
  });

  it("falha de origem não impede gerar o documento — volta como aviso, nunca em silêncio", () => {
    const inicio = motor.indexOf("async function parametrizarAutomaticamente");
    const bloco = motor.slice(inicio, inicio + 700);
    expect(bloco).toContain("try {");
    expect(bloco).toContain("catch (e)");
    expect(bloco).toMatch(/aviso:\s*e instanceof Error/);
  });

  it("resolve o registro de parâmetros sempre pela organização da sessão, nunca do cliente", () => {
    const inicio = motor.indexOf("export const gerarDocumentoAtual");
    const bloco = motor.slice(inicio, inicio + 1200);
    expect(bloco).toContain("orgDoUsuario(supabase, context.userId as string)");
    expect(bloco).toContain('.eq("organization_id", organizationId)');
  });
});

describe("tela do instrumento oferece 'Gerar documento com o dado atual'", () => {
  const tela = readFileSync("src/components/contrato/documento-do-instrumento.tsx", "utf8");

  it("chama gerarDocumentoAtual e invalida a consulta da prévia ao concluir", () => {
    expect(tela).toContain("gerarDocumentoAtual");
    expect(tela).toContain("qc.invalidateQueries({ queryKey: chave })");
  });

  it("os botões de download continuam recebendo previaId — nunca um caminho paralelo", () => {
    expect(tela).toMatch(/<BaixarPdfContrato\s+previaId=\{previaId\}/);
    expect(tela).toMatch(/<BaixarDocxContrato\s+previaId=\{previaId\}/);
  });
});
