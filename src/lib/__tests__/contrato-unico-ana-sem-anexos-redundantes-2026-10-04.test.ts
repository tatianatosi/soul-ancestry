import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  BLOCOS_QUE_INCORPORAM_ANEXO_I,
  MOTIVO_ANEXO_I_INCORPORADO,
  PAPEIS_CONTRATUAIS,
  REGRAS_APLICABILIDADE_ANEXOS,
  anexoIIncorporadoNoCorpo,
  coberturaContratual,
  instrumentosPosteriores,
  montarBlocosIncorporados,
  montarPessoasContratuais,
  regraDoAnexo,
  type EntradaBlocos,
} from "@/lib/contrato-blocos-incorporados";
import { anexoIIDespesas, anexoIOrdemServico, anexoIVProcuracao, anexoVAlteracaoEscopo, anexosIaV } from "@/lib/anexos-i-v";
import { CONTRATO_BASE_AVISO, CONTRATO_BASE_DATA, CONTRATO_BASE_STATUS } from "@/lib/contrato-base-consolidado";
import { coberturaCompleta, fasesDoInstrumento, resumoProntidao } from "@/lib/contrato-prontidao";
import { instanciasDeCobertura, lacunasDeCobertura, pessoasSemVinculoRegistrado } from "@/lib/condicao-comercial-caso";

/**
 * Tarefa da Proprietária, 04/10/2026: "contrato único da Ana, sem anexos
 * iniciais redundantes".
 *
 * Medido antes de executar: o corpo renderizado (`contrato-corpo.server.ts`)
 * tinha cabeçalho, perfil institucional, preâmbulo, as 16 cláusulas, os anexos
 * e a matriz de blocos — e **nenhum dado do caso**. Quem são as partes, o
 * escopo de cada pessoa, o valor e a forma de pagamento viviam só dentro do
 * Anexo I. Era por isso que a ausência do anexo era lida como "sem escopo
 * contratado", e por isso que os quatro anexos condicionais apareciam como
 * pendência de contratação.
 *
 * Complemento dela no mesmo dia: "execute também em relação a todos os anexos,
 * não somente ao anexo 1".
 */

/* Composição medida do caso da Ana: 3 adultos, 1 dependente, 3 responsáveis. */
const MEMBROS = [
  { nome: "Ana Luiza Gomes Silveira Rodrigues", papelNoCaso: "titular", dependente: false },
  { nome: "Adair Pinto Silveira Júnior", papelNoCaso: "titular", dependente: false },
  { nome: "Alice Gomes Silveira", papelNoCaso: "titular", dependente: false },
];

const ITENS = [
  { parte: "Ana Luiza Gomes Silveira Rodrigues", valor: 4800, escopo: "Pesquisa histórica, dossiê-base e declaração individual" },
  { parte: "Adair Pinto Silveira Júnior", valor: 2400, escopo: "Elo documental direto e declaração própria" },
  { parte: "Alice Gomes Silveira", valor: 2400, escopo: "Certidões pessoais e declaração própria" },
  { parte: "Felipe", valor: 0, escopo: "Dependente menor representado — sem assinatura e sem cobrança própria" },
];

const BLOCOS_COMPLETOS: Omit<EntradaBlocos, "pessoas"> = {
  contratadaQualificacao: "Contratada qualificada no perfil institucional versionado",
  objeto: "Projeto familiar de cidadania",
  paisRota: "Austria",
  escopoResumo: "Escopo familiar aprovado na proposta",
  servicosIncluidos: "Diagnóstico · Pesquisa · Conferência documental",
  servicosExcluidos: "Protocolo consular · Traduções",
  fasesEntregas: "1. Diagnóstico · 2. Pesquisa · 3. Conferência",
  prazosReferencia: "Janelas conforme dependência documental",
  despesasExternas: null,
  total: 9600,
  moeda: "BRL",
  formaPagamento: "assinatura_mensal",
  parcelas: "3 assinaturas mensais de 320 por responsável, durante 10 meses",
  vencimentos: "Dia 10, primeira em 10/11/2026, por 10 meses",
  propostaReferencia: "DECK-CANVA-CA-CID-AT-FAM-2026-001-v1",
  regraDespesasInstitucional: "Despesas de terceiros não estão incluídas nos honorários.",
};

function pessoasDaAna(dependenteComVinculo = true) {
  return montarPessoasContratuais({
    membros: MEMBROS,
    dependentes: [
      {
        nome: "Felipe",
        representadoPor: dependenteComVinculo ? "Ana Luiza Gomes Silveira Rodrigues" : null,
        statusRepresentacao: dependenteComVinculo ? "documentada" : null,
      },
    ],
    itensCondicao: ITENS,
    responsaveisFinanceiros: [
      "Ana Luiza Gomes Silveira Rodrigues",
      "Adair Pinto Silveira Júnior",
      "Alice Gomes Silveira",
    ],
  });
}

const ENTRADA_ANEXOS = {
  caseId: "caso-1",
  clienteNome: "Cliente",
  responsavel: "Responsável",
  dataContratacao: "2026-08-22",
  contratoBaseVersao: "v2.0",
  modelo: "MODELO-ESTUDO",
  proposta: null,
  politicaDespesas: null,
  despesas: [],
  autorizacaoPesquisa: null,
  procuracao: null,
  alteracaoEscopo: null,
};

describe("1. cobertura completa não bloqueia por falta de Anexo I", () => {
  const pessoas = pessoasDaAna();
  const blocos = montarBlocosIncorporados({ ...BLOCOS_COMPLETOS, pessoas });

  it("os cinco blocos que o Anexo I traduzia estão completos no corpo", () => {
    expect(anexoIIncorporadoNoCorpo(blocos)).toBe(true);
    for (const chave of BLOCOS_QUE_INCORPORAM_ANEXO_I) {
      expect(blocos.find((b) => b.chave === chave)!.pendencias).toEqual([]);
    }
  });

  it("o Anexo I deixa de ser documento obrigatório, com motivo e estado real", () => {
    const anexo = anexoIOrdemServico({ ...ENTRADA_ANEXOS, anexoIIncorporadoNoCorpo: true });
    expect(anexo.aplicavel).toBe(false);
    expect(anexo.obrigatorio).toBe(false);
    expect(anexo.estado).toBe("nao_aplicavel");
    expect(anexo.pendencias).toEqual([]);
    expect(anexo.gatesBloqueados).toEqual([]);
    expect(anexo.motivo).toBe(MOTIVO_ANEXO_I_INCORPORADO);
  });

  it("sem incorporação, o Anexo I volta a ser exigido — a regra não afrouxa sozinha", () => {
    const anexo = anexoIOrdemServico(ENTRADA_ANEXOS);
    expect(anexo.aplicavel).toBe(true);
    expect(anexo.obrigatorio).toBe(true);
    expect(anexo.pendencias.length).toBeGreaterThan(0);
  });

  it("a lacuna de cobertura não afirma mais que falta escopo quando ele está no corpo", () => {
    const instancias = instanciasDeCobertura(
      {
        id: "c",
        caseId: "caso-1",
        propostaId: null,
        propostaReferencia: null,
        versao: 1,
        itens: ITENS,
        total: 9600,
        despesasTerceiros: null,
        taxasOficiais: null,
        formaPagamento: null,
        responsaveisFinanceiros: [],
        parcelas: null,
        valorParcela: null,
        moeda: "BRL",
        validade: null,
        estado: "aprovada",
        origem: "proposta_canva",
      },
      [{ nome: "Felipe", representadoPor: "Ana Luiza Gomes Silveira Rodrigues" }],
    );
    expect(lacunasDeCobertura([], instancias, { anexoIIncorporado: true })).toEqual([]);
    const sem = lacunasDeCobertura([], instancias, { anexoIIncorporado: false });
    expect(sem.join(" ")).toContain("nem incorporado ao corpo");
  });

  it("o passo de prontidão fecha por cobertura material, não por documento", () => {
    expect(
      coberturaCompleta({
        propostaAprovada: true,
        completudePct: 100,
        partesComPendencia: 0,
        escopoResumoPreenchido: true,
        condicaoValor: 9600,
        anexoIStatus: null,
        anexosPendentes: 0,
        rascunhoSalvo: true,
        versaoFinalCongelada: true,
        revisaoAprovadaEm: null,
        assinaturaRegistradaEm: null,
        bloqueiosImpeditivos: [],
        pendenciasHumanas: 0,
        anexoIIncorporadoNoCorpo: true,
        pendenciasImpeditivas: [],
      }),
    ).toBe(true);
  });
});

describe("2. sem despesa concreta, o Anexo II não bloqueia", () => {
  it("política não selecionada e nenhuma despesa: não aplicável, sem pendência", () => {
    const a = anexoIIDespesas(ENTRADA_ANEXOS);
    expect(a.aplicavel).toBe(false);
    expect(a.obrigatorio).toBe(false);
    expect(a.pendencias).toEqual([]);
    expect(a.gatesBloqueados).toEqual([]);
    expect(a.motivo).toContain("cláusula 9");
  });

  it("com despesa concreta, volta a ser aplicável e cobra o que falta", () => {
    const a = anexoIIDespesas({
      ...ENTRADA_ANEXOS,
      despesas: [
        {
          item: "Certidão austríaca",
          finalidade: null as any,
          pagador: null as any,
          estado: "prevista",
          estimativa: "100",
          valorReal: null,
          fonte: null,
          aprovacaoRegistrada: false,
          comprovante: null,
        } as any,
      ],
    });
    expect(a.aplicavel).toBe(true);
    expect(a.pendencias.length).toBeGreaterThan(0);
  });
});

describe("3 e 4. atos posteriores não bloqueiam a contratação inicial", () => {
  it("sem ato que exija procuração, o Anexo IV é não aplicável e não bloqueia assinatura", () => {
    const a = anexoIVProcuracao(ENTRADA_ANEXOS);
    expect(a.aplicavel).toBe(false);
    expect(a.gatesBloqueados).toEqual([]);
    expect(a.motivo).toContain("instrumento posterior");
  });

  it("sem alteração formalizada, o Anexo V é não aplicável e diz que exigi-lo antes seria artificial", () => {
    const a = anexoVAlteracaoEscopo(ENTRADA_ANEXOS);
    expect(a.aplicavel).toBe(false);
    expect(a.gatesBloqueados).toEqual([]);
    expect(a.motivo).toContain("artificial");
  });

  it("nenhum dos cinco anexos bloqueia a assinatura inicial por ausência", () => {
    expect(REGRAS_APLICABILIDADE_ANEXOS).toHaveLength(5);
    for (const r of REGRAS_APLICABILIDADE_ANEXOS) {
      expect(r.bloqueiaAssinaturaInicial).toBe(false);
      expect(r.condicao.length).toBeGreaterThan(20);
      expect(r.motivoNaoAplicavel.length).toBeGreaterThan(40);
    }
    const anexos = anexosIaV({ ...ENTRADA_ANEXOS, anexoIIncorporadoNoCorpo: true });
    for (const a of anexos) {
      expect(a.gatesBloqueados).not.toContain("assinatura");
    }
  });

  it("os condicionais aparecem como instrumentos posteriores, com a condição de cada um", () => {
    const anexos = anexosIaV({ ...ENTRADA_ANEXOS, anexoIIncorporadoNoCorpo: true });
    const posteriores = instrumentosPosteriores(anexos);
    expect(posteriores.map((p) => p.codigo)).toEqual([
      "ANEXO_II_DESPESAS_EXTERNAS",
      "ANEXO_III_AUTORIZACAO_PESQUISA",
      "ANEXO_IV_PROCURACAO",
      "ANEXO_V_ALTERACAO_ESCOPO",
    ]);
    expect(regraDoAnexo("ANEXO_III_AUTORIZACAO_PESQUISA")!.clausulaQueCobre).toBe(5);
  });
});

describe("5. todas as pessoas aparecem com papel e escopo corretos", () => {
  const pessoas = pessoasDaAna();

  it("as quatro pessoas do caso estão no contrato, sem duplicar ninguém", () => {
    expect(pessoas.map((p) => p.nome)).toEqual([
      "Ana Luiza Gomes Silveira Rodrigues",
      "Adair Pinto Silveira Júnior",
      "Alice Gomes Silveira",
      "Felipe",
    ]);
  });

  it("cada papel vem do registro, e os quatro papéis distintos existem", () => {
    const ana = pessoas.find((p) => p.nome.startsWith("Ana Luiza"))!;
    expect(ana.papeis).toContain("signatario");
    expect(ana.papeis).toContain("beneficiario");
    expect(ana.papeis).toContain("responsavel_financeiro");
    const felipe = pessoas.find((p) => p.nome === "Felipe")!;
    expect(felipe.papeis).toEqual(["dependente_representado"]);
    expect(PAPEIS_CONTRATUAIS).toContain("contratante");
  });

  it("o escopo e o valor individual de cada pessoa vêm da condição aprovada", () => {
    const adair = pessoas.find((p) => p.nome.startsWith("Adair"))!;
    expect(adair.valorIndividual).toBe(2400);
    expect(adair.escopoIndividual).toContain("Elo documental");
    const felipe = pessoas.find((p) => p.nome === "Felipe")!;
    expect(felipe.valorIndividual).toBe(0);
  });

  it("o bloco de escopo individual renderiza pessoa por pessoa", () => {
    const blocos = montarBlocosIncorporados({ ...BLOCOS_COMPLETOS, pessoas });
    const escopo = blocos.find((b) => b.chave === "escopo_individual")!;
    expect(escopo.linhas.map((l) => l.rotulo)).toContain("Alice Gomes Silveira");
    expect(escopo.clausula).toBe(3);
  });
});

describe("6. representação nunca é inferida por valor zero nem por posição", () => {
  it("dependente com vínculo registrado e confirmado entra como representado", () => {
    const felipe = pessoasDaAna(true).find((p) => p.nome === "Felipe")!;
    expect(felipe.representadoPor).toBe("Ana Luiza Gomes Silveira Rodrigues");
    expect(felipe.representacaoConfirmada).toBe(true);
    expect(felipe.pendencias).toEqual([]);
  });

  it("sem vínculo registrado, fica pendência identificada — e ninguém é atribuído ao primeiro titular", () => {
    const pessoas = pessoasDaAna(false);
    const felipe = pessoas.find((p) => p.nome === "Felipe")!;
    expect(felipe.representadoPor).toBeNull();
    expect(felipe.pendencias.join(" ")).toContain("não é inferida");
    const ana = pessoas.find((p) => p.nome.startsWith("Ana Luiza"))!;
    expect(ana.pendencias).toEqual([]);
  });

  it("a instância de cobertura não leva mais o item sem valor para o primeiro titular", () => {
    const condicao = {
      id: "c",
      caseId: "caso-1",
      propostaId: null,
      propostaReferencia: null,
      versao: 1,
      itens: ITENS,
      total: 9600,
      despesasTerceiros: null,
      taxasOficiais: null,
      formaPagamento: null,
      responsaveisFinanceiros: [],
      parcelas: null,
      valorParcela: null,
      moeda: "BRL",
      validade: null,
      estado: "aprovada",
      origem: "proposta_canva",
    };
    const semVinculo = instanciasDeCobertura(condicao, []);
    expect(semVinculo).toHaveLength(3);
    for (const i of semVinculo) expect(i.dependentesRepresentados).toEqual([]);
    expect(pessoasSemVinculoRegistrado(condicao, [])).toEqual(["Felipe"]);

    const comVinculo = instanciasDeCobertura(condicao, [
      { nome: "Felipe", representadoPor: "Ana Luiza Gomes Silveira Rodrigues" },
    ]);
    expect(comVinculo[0]!.dependentesRepresentados).toEqual(["Felipe"]);
    expect(pessoasSemVinculoRegistrado(condicao, [{ nome: "Felipe", representadoPor: "Ana Luiza Gomes Silveira Rodrigues" }])).toEqual(
      [],
    );
  });

  it("o código não contém mais a atribuição ao primeiro titular", () => {
    const fonte = readFileSync("src/lib/condicao-comercial-caso.ts", "utf8");
    expect(fonte).not.toContain("i === 0 ? semValor");
    expect(fonte).toContain("Valor zero não comprova");
  });

  it("pendência de representação é impeditiva; a de prazo não é", () => {
    const pessoas = pessoasDaAna(false);
    const blocos = montarBlocosIncorporados({ ...BLOCOS_COMPLETOS, pessoas, prazosReferencia: null });
    const c = coberturaContratual(pessoas, blocos);
    expect(c.completa).toBe(false);
    expect(c.impeditivas.some((x) => x.pessoa === "Felipe")).toBe(true);
    expect(c.posteriores.some((x) => x.campo.includes("Prazo"))).toBe(true);
  });
});

describe("7. texto aprovado não volta a aparecer como pendente de revisão jurídica", () => {
  it("o contrato-base v2 está vigente, com a data original preservada", () => {
    expect(CONTRATO_BASE_STATUS).toBe("vigente");
    expect(CONTRATO_BASE_DATA).toBe("2026-08-22");
  });

  it("o aviso não diz mais que falta revisão jurídica, e mantém o limite de ato externo", () => {
    expect(CONTRATO_BASE_AVISO).toContain("concluída e aprovada");
    expect(CONTRATO_BASE_AVISO).not.toContain("Não substitui revisão jurídica");
    expect(CONTRATO_BASE_AVISO).toContain("não reabre");
    expect(CONTRATO_BASE_AVISO).toContain("não autoriza");
  });

  it("a substituição foi pontual: os adendos e modelos não aprovados seguem em revisão", () => {
    const base = readFileSync("src/lib/contrato-base-consolidado.ts", "utf8");
    expect(base).toContain('status: "under_legal_review"');
    const doc = readFileSync("docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md", "utf8");
    expect(doc).toContain("2026-08-22");
    expect(doc).toContain("under_legal_review");
  });
});

describe("8. não assinado pode aparecer pronto para assinatura, nunca como assinado", () => {
  const base = {
    propostaAprovada: true,
    completudePct: 100,
    partesComPendencia: 0,
    escopoResumoPreenchido: true,
    condicaoValor: 9600,
    anexoIStatus: null,
    anexosPendentes: 0,
    rascunhoSalvo: true,
    versaoFinalCongelada: true,
    revisaoAprovadaEm: "2026-10-03T12:00:00Z",
    assinaturaRegistradaEm: null,
    bloqueiosImpeditivos: [],
    pendenciasHumanas: 0,
    anexoIIncorporadoNoCorpo: true,
    pendenciasImpeditivas: [],
    pendenciasPosteriores: [],
  };

  it("pronto para assinatura é alcançado; assinado e execução não", () => {
    const fases = fasesDoInstrumento(base);
    const por = (f: string) => fases.find((x) => x.fase === f)!;
    expect(por("pronto_para_assinatura").alcancada).toBe(true);
    expect(por("assinado").alcancada).toBe(false);
    expect(por("execucao").alcancada).toBe(false);
    expect(por("assinado").motivo).toContain("nunca aparece como assinado");
  });

  it("com assinatura registrada, assinado e execução passam a ser alcançados", () => {
    const fases = fasesDoInstrumento({ ...base, assinaturaRegistradaEm: "2026-10-04T10:00:00Z" });
    expect(fases.find((f) => f.fase === "assinado")!.alcancada).toBe(true);
    expect(fases.find((f) => f.fase === "execucao")!.alcancada).toBe(true);
  });

  it("as quatro fases aparecem no resumo e no trilho da tela", () => {
    expect(resumoProntidao(base).fases.map((f) => f.fase)).toEqual([
      "pronto_para_assinatura",
      "assinado",
      "execucao",
      "atos_posteriores",
    ]);
    const trilho = readFileSync("src/components/contrato/trilho-prontidao.tsx", "utf8");
    expect(trilho).toContain("data-fases-instrumento");
  });
});

describe("9. nada aqui altera snapshot existente nem apaga documento", () => {
  const modulos = [
    "src/lib/contrato-blocos-incorporados.ts",
    "src/lib/contrato-prontidao.ts",
    "src/lib/contrato-corpo.server.ts",
  ];

  it("os módulos novos e alterados são puros ou só leitura: nenhuma escrita", () => {
    for (const m of modulos) {
      const fonte = readFileSync(m, "utf8");
      expect(fonte).not.toContain(".update(");
      expect(fonte).not.toContain(".delete(");
      expect(fonte).not.toContain(".insert(");
    }
  });

  it("nenhum deles usa approved/completed para esconder ausência de documento", () => {
    const fonte = readFileSync("src/lib/contrato-blocos-incorporados.ts", "utf8");
    // Procura ATRIBUIÇÃO real, não a palavra: o cabeçalho do módulo cita os dois
    // termos exatamente para proibi-los.
    expect(fonte).not.toMatch(/(estado|status)\s*[:=]\s*"(approved|completed)"/);
    expect(fonte).toContain("Nunca inferido");
  });
});

describe("10. a tela mostra a cobertura, os blocos e as duas listas", () => {
  it("o painel está montado na preparação do contrato", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    expect(rota).toContain("<CoberturaContratual cobertura={d.coberturaContratual as any} />");
  });

  it("o painel separa pendência impeditiva de instrumento posterior", () => {
    const painel = readFileSync("src/components/contrato/cobertura-contratual.tsx", "utf8");
    expect(painel).toContain("data-pendencias-impeditivas");
    expect(painel).toContain("data-pendencias-posteriores");
    expect(painel).toContain("data-anexos-aplicabilidade");
  });

  it("o corpo renderizado passa a conter os blocos do caso", () => {
    const corpo = readFileSync("src/lib/contrato-corpo.server.ts", "utf8");
    expect(corpo).toContain("secaoBlocosIncorporados");
    expect(corpo).toContain("Condições específicas deste caso");
    expect(corpo).toContain("anexoIIncorporadoNoCorpo");
  });

  it("a prévia e o PDF saem do mesmo HTML: um só renderizador", () => {
    const corpo = readFileSync("src/lib/contrato-corpo.server.ts", "utf8");
    const ocorrencias = corpo.match(/secaoBlocosIncorporados\(/g) ?? [];
    // uma definição e uma chamada: nenhum segundo caminho de renderização
    expect(ocorrencias.length).toBe(2);
  });
});

/**
 * Corte B (04/10/2026) — correção contra o que eu mesmo entreguei: lendo só a
 * condição comercial, `montarPessoasContratuais` criava uma 5ª pessoa fantasma,
 * porque o deck diz "Adair Gomes Silveira" e o cadastro diz "Adair Pinto
 * Silveira Júnior". A lista registrada em `contract_parties` passa a ser a
 * fonte primária, e o nome que não casa vira divergência declarada.
 */
describe("11. partes registradas são a fonte primária; nome divergente não cria parte", () => {
  const PARTES_REGISTRADAS = [
    { nome: "Clube Ancestral", papel: "provider", assinaturaExigida: true },
    { nome: "Ana Luiza Gomes Silveira Rodrigues", papel: "contracting_client", assinaturaExigida: true },
    { nome: "Adair Pinto Silveira Júnior", papel: "co_contractor", assinaturaExigida: true },
    { nome: "Alice Gomes Silveira", papel: "co_contractor", assinaturaExigida: true },
    { nome: "Felipe", papel: "dependent", assinaturaExigida: false },
  ];

  const pessoas = montarPessoasContratuais({
    partesRegistradas: PARTES_REGISTRADAS,
    membros: MEMBROS,
    dependentes: [
      { nome: "Felipe", representadoPor: "Ana Luiza Gomes Silveira Rodrigues", statusRepresentacao: "documentada" },
    ],
    itensCondicao: ITENS,
    // O deck e a condição usam outro nome para o pai.
    responsaveisFinanceiros: [
      "Ana Luiza Gomes Silveira Rodrigues",
      "Adair Gomes Silveira",
      "Alice Gomes Silveira",
    ],
  });

  it("a contratada não entra como parte do lado do cliente", () => {
    expect(pessoas.find((p) => p.nome === "Clube Ancestral")).toBeUndefined();
  });

  it("são as 4 pessoas do caso — nenhuma 5ª criada pelo nome divergente", () => {
    expect(pessoas.map((p) => p.nome)).toEqual([
      "Ana Luiza Gomes Silveira Rodrigues",
      "Adair Pinto Silveira Júnior",
      "Alice Gomes Silveira",
      "Felipe",
    ]);
    expect(pessoas.find((p) => p.nome === "Adair Gomes Silveira")).toBeUndefined();
  });

  it("o papel vem do registro do contrato", () => {
    const ana = pessoas.find((p) => p.nome.startsWith("Ana Luiza"))!;
    expect(ana.papeis).toContain("contratante");
    expect(ana.papeis).toContain("signatario");
    expect(ana.papeis).toContain("responsavel_financeiro");
  });

  it("o nome que não casa com nenhuma parte vira divergência nomeada, sem fundir", () => {
    const texto = pessoas.flatMap((p) => p.pendencias).join(" ");
    expect(texto).toContain("Adair Gomes Silveira");
    expect(texto).toContain("Divergência de fonte");
    expect(texto).toContain("nenhum nome foi fundido por semelhança");
  });

  it("o leitor da preparação passa as partes registradas", () => {
    const fn = readFileSync("src/lib/contrato-preparar.functions.ts", "utf8");
    expect(fn).toContain("partesRegistradas:");
    expect(fn).toContain("p.person_name");
  });
});
