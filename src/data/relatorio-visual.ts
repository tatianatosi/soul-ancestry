/**
 * Ancestral Canvas — Relatório Visual (Projeto Essencial).
 *
 * Camada de conteúdo do relatório de página única mostrado no App Cliente.
 * Os valores abaixo são PLACEHOLDERS estruturados ({{...}} do briefing):
 * basta substituir por dados reais das planilhas/fontes internas.
 */

import type { Caso } from "./casos";

export type RelatorioVisual = {
  casoId: string;
  sobrenomeFamilia: string; // {{SOBRENOME_FAMILIA}}
  pessoaFoco: string; // {{PESSOA_FOCO}}
  ancestralMaisAntigo: string; // {{ANCESTRAL_MAIS_ANTIGO}}
  numeroGeracoes: string; // {{NUMERO_GERACOES}}
  localidadesPrincipais: string; // {{LOCALIDADES_PRINCIPAIS}}
  linhaPrincipal: { nome: string; eventos: string }[]; // {{GERACAO_N_NOME}} / {{GERACAO_N_EVENTOS}}
  documentos: { pessoa: string; tipo: string; local: string; observacao: string }[];
  quantidadeRegistros: string; // {{QUANTIDADE_REGISTROS}}
  lacunas: string[]; // {{LACUNA_N}}
  pontosConfirmar: string[]; // {{PONTO_CONFIRMAR_N}}
};

/** Modelo base — usado quando o caso ainda não tem relatório dedicado. */
function modelo(caso: Caso): RelatorioVisual {
  const sobrenome = caso.cliente.split(" ").slice(-1)[0];
  return {
    casoId: caso.id,
    sobrenomeFamilia: sobrenome,
    pessoaFoco: caso.cliente,
    ancestralMaisAntigo: caso.linhaAncestral[0]
      ? `${caso.linhaAncestral[0].texto} (${caso.linhaAncestral[0].ano})`
      : "{{ANCESTRAL_MAIS_ANTIGO}}",
    numeroGeracoes: String(Math.max(4, caso.linhaAncestral.length)),
    localidadesPrincipais: `${caso.pais} · Brasil`,
    linhaPrincipal: [
      { nome: "{{GERACAO_1_NOME}}", eventos: "{{GERACAO_1_EVENTOS}}" },
      { nome: "{{GERACAO_2_NOME}}", eventos: "{{GERACAO_2_EVENTOS}}" },
      { nome: "{{GERACAO_3_NOME}}", eventos: "{{GERACAO_3_EVENTOS}}" },
      { nome: "{{GERACAO_4_NOME}}", eventos: "{{GERACAO_4_EVENTOS}}" },
    ],
    documentos: [
      { pessoa: "{{DOC1_PESSOA}}", tipo: "{{DOC1_TIPO}}", local: "{{DOC1_LOCAL}}", observacao: "{{DOC1_OBSERVACAO}}" },
      { pessoa: "{{DOC2_PESSOA}}", tipo: "{{DOC2_TIPO}}", local: "{{DOC2_LOCAL}}", observacao: "{{DOC2_OBSERVACAO}}" },
      { pessoa: "{{DOC3_PESSOA}}", tipo: "{{DOC3_TIPO}}", local: "{{DOC3_LOCAL}}", observacao: "{{DOC3_OBSERVACAO}}" },
    ],
    quantidadeRegistros: "{{QUANTIDADE_REGISTROS}}",
    lacunas: ["{{LACUNA_1}}", "{{LACUNA_2}}", "{{LACUNA_3}}"],
    pontosConfirmar: ["{{PONTO_CONFIRMAR_1}}", "{{PONTO_CONFIRMAR_2}}"],
  };
}

/** Relatórios já preenchidos (exemplo estruturado — substituir por dados reais). */
export const RELATORIOS: Record<string, Partial<RelatorioVisual>> = {
  "CA-CID-IT-2026-001": {
    sobrenomeFamilia: "Prade",
    pessoaFoco: "Giovanna Prade",
    ancestralMaisAntigo: "Antonio Prade (n. 1868, Vêneto)",
    numeroGeracoes: "4",
    localidadesPrincipais: "Vêneto (IT) · Caxias do Sul (RS)",
    linhaPrincipal: [
      { nome: "Antonio Prade", eventos: "n. 1868 · casamento 1892 · emigração 1895" },
      { nome: "Luigi Prade", eventos: "n. 1897 (RS) · casamento 1921 · óbito 1974" },
      { nome: "Vitorio Prade", eventos: "n. 1930 · casamento 1955" },
      { nome: "Giovanna Prade", eventos: "n. 1994 · pessoa-foco do processo" },
    ],
    documentos: [
      { pessoa: "Antonio Prade", tipo: "Certidão de nascimento", local: "Comune (IT)", observacao: "Confirma origem italiana" },
      { pessoa: "Luigi Prade", tipo: "Certidão de casamento", local: "Cartório · Caxias do Sul", observacao: "Liga geração 1 e 2" },
      { pessoa: "Vitorio Prade", tipo: "Certidão de nascimento", local: "Cartório · RS", observacao: "Confirma continuidade da linha" },
    ],
    quantidadeRegistros: "11",
    lacunas: [
      "Registro de óbito de Antonio Prade ainda não localizado",
      "Documento de desembarque no porto de entrada",
      "Certidão de casamento italiana em cópia integral",
    ],
    pontosConfirmar: [
      "Grafia do sobrenome nos registros brasileiros",
      "Data exata de emigração",
    ],
  },
};

export function relatorioByCaso(caso: Caso): RelatorioVisual {
  return { ...modelo(caso), ...(RELATORIOS[caso.id] ?? {}) };
}

export const POSSIBILIDADES_APROFUNDAMENTO = [
  "Novas gerações e documentos",
  "Ramos complementares",
  "Leitura histórica mais ampla",
  "Investigação de lacunas específicas",
];
