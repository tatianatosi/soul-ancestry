/**
 * Matriz consolidada dos três modelos de composição contratual e construtor
 * dos rascunhos TESTE somente-leitura (fonte única de DOCX, PDF e prévia interna).
 *
 * Os modelos são regras de composição de pessoas, escopo, assinaturas e anexos
 * sobre o contrato-base único MODELO-ESTUDO + BASE-GEN-V2. Nenhum corpo jurídico
 * concorrente é criado; nada aqui habilita assinatura, cobrança, pesquisa
 * externa, procuração, portal ou onboarding.
 */

import {
  CLAUSULAS_FIXAS,
  CONTRATO_BASE_ID,
  CONTRATO_BASE_MODELO,
  CONTRATO_BASE_STATUS,
  CONTRATO_BASE_VERSAO,
  MATRIZ_RENDERIZACAO,
  PERFIL_INSTITUCIONAL_VERSAO,
  PREAMBULO_CONTRATO_BASE,
  ROTULO_TIPO_RENDER,
  type EstadoVigenciaContratoBase,
} from "@/lib/contrato-base-consolidado";
import { perfilInstitucionalRenderizado } from "@/lib/perfil-institucional";
import { qualificacaoInstitucionalRenderizada } from "@/lib/qualificacao-institucional";
import {
  ANEXOS_MODELO_INDIVIDUAL,
  GATES_MODELO_INDIVIDUAL,
  MODELO_INDIVIDUAL_ID,
  MODELO_INDIVIDUAL_NOME,
  MODELO_INDIVIDUAL_STATUS,
  MODELO_INDIVIDUAL_VERSAO,
} from "@/lib/modelo-individual-acompanhante";
import {
  ANEXOS_MODELO_FAMILIAR_CASAL,
  GATES_MODELO_FAMILIAR_CASAL,
  MODELO_FAMILIAR_CASAL_ID,
  MODELO_FAMILIAR_CASAL_STATUS,
  MODELO_FAMILIAR_CASAL_VERSAO,
} from "@/lib/modelo-familiar-casal";
import {
  ANEXOS_MODELO_NUCLEO,
  GATES_MODELO_NUCLEO,
  MODELO_NUCLEO_ID,
  MODELO_NUCLEO_NOME,
  MODELO_NUCLEO_STATUS,
  MODELO_NUCLEO_VERSAO,
} from "@/lib/modelo-nucleo-familiar";

export const AVISO_RASCUNHO_TESTE = "RASCUNHO TESTE — SOB REVISÃO JURÍDICA — NÃO VÁLIDO PARA ASSINATURA";
export const MARCADOR_SEM_FONTE = "[PENDENTE DE FONTE FORMAL — BLOQUEIA FORMALIZAÇÃO]";

export const PLACEHOLDERS_INSTITUCIONAIS = {
  cnpj: "[CNPJ INSTITUCIONAL]",
  endereco: "[ENDEREÇO INSTITUCIONAL]",
  representante: "[REPRESENTANTE INSTITUCIONAL]",
} as const;

export type ChaveModelo = "individual" | "casal" | "nucleo_familiar";

export type AnexoNaMatriz = {
  codigo: string;
  titulo: string;
  aplicabilidade: "fixo" | "condicional" | "nao_aplicavel_por_padrao";
  fonteNecessaria: string;
  gate: string;
  estadoTeste: "TESTE — não instanciado";
  motivoBloqueio: string;
};

export type ModeloContratual = {
  chave: ChaveModelo;
  id: string;
  nome: string;
  versao: string;
  status: EstadoVigenciaContratoBase;
  base: string;
  arquivoBase: string;
  regrasComposicao: string[];
  blocoPartes: string[];
  anexos: AnexoNaMatriz[];
  gates: { codigo: string; regra: string; bloqueia: string }[];
};

const FONTE_POR_ANEXO: Record<string, { fonte: string; gate: string; motivo: string }> = {
  "ANX-ESCOPO": {
    fonte: "Proposta/OS aprovada do mesmo caso",
    gate: "Bloqueia sem escopo formal",
    motivo: "Escopo não disponível em fonte formal neste rascunho TESTE.",
  },
  "ANX-COMERCIAL": {
    fonte: "Condição comercial homologada (SKU homologado)",
    gate: "Bloqueia sem condição formal",
    motivo: "Preço, parcela e vencimento não podem ser inferidos.",
  },
  "ANX-PRIVACIDADE": {
    fonte: "Política de privacidade institucional vigente",
    gate: "Conforme política e consentimento",
    motivo: "Consentimento e titulares não confirmados em rascunho.",
  },
  "ANX-INDIVIDUAL": {
    fonte: "Pessoa adulta requerente confirmada por revisão humana",
    gate: "Bloqueia se pessoa não confirmada",
    motivo: "Pessoas representadas apenas por placeholders neutros.",
  },
  "ANX-REPRESENTACAO": {
    fonte: "Necessidade documental comprovada (menor/incapaz ou exigência formal)",
    gate: "Bloqueia representação por inferência",
    motivo: "Representação não pode ser inferida.",
  },
  "ANEXO-I": {
    fonte: "Proposta/OS aprovada com escopo, entregas, inclusões, exclusões e condição comercial",
    gate: "Bloqueia Anexo I sem proposta aprovada",
    motivo: "Nenhuma proposta/OS aprovada vinculada a este rascunho TESTE.",
  },
  "ANEXO-II": {
    fonte: "Regra institucional de despesas externas",
    gate: "Exceção exige aprovação registrada",
    motivo: "Despesas externas dependem de aprovação caso a caso.",
  },
  "ANEXO-III": {
    fonte: "Autorização específica de pesquisa vigente",
    gate: "Gate de servidor bloqueia ação externa sem autorização",
    motivo: "Nenhuma autorização de pesquisa vigente.",
  },
  "ANEXO-IV": {
    fonte: "Procuração vigente com país/órgão confirmado e finalidade delimitada",
    gate: "Bloqueia ato em nome do cliente sem procuração",
    motivo: "País, órgão e poderes não confirmados.",
  },
  "ANEXO-V": {
    fonte: "Mudança formal aprovada, com nova versão de OS",
    gate: "Bloqueia alteração retroativa",
    motivo: "Nenhuma alteração formal registrada.",
  },
};

function mapearAnexos(
  anexos: { codigo: string; titulo: string; classe: AnexoNaMatriz["aplicabilidade"]; regra: string }[],
): AnexoNaMatriz[] {
  return anexos.map((a) => {
    const meta = FONTE_POR_ANEXO[a.codigo];
    return {
      codigo: a.codigo,
      titulo: a.titulo,
      aplicabilidade: a.classe,
      fonteNecessaria: meta?.fonte ?? MARCADOR_SEM_FONTE,
      gate: meta?.gate ?? "Bloqueia sem fonte formal",
      estadoTeste: "TESTE — não instanciado" as const,
      motivoBloqueio:
        a.classe === "nao_aplicavel_por_padrao"
          ? `Não aplicável por padrão neste modelo. ${a.regra}`
          : (meta?.motivo ?? MARCADOR_SEM_FONTE),
    };
  });
}

export const MODELOS_CONTRATUAIS: ModeloContratual[] = [
  {
    chave: "individual",
    id: MODELO_INDIVIDUAL_ID,
    nome: `${MODELO_INDIVIDUAL_NOME} — ${MODELO_INDIVIDUAL_VERSAO}`,
    versao: MODELO_INDIVIDUAL_VERSAO,
    status: MODELO_INDIVIDUAL_STATUS,
    base: CONTRATO_BASE_MODELO,
    arquivoBase: "docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md",
    regrasComposicao: [
      "Exatamente um adulto como requerente principal.",
      "Uma pessoa contratante e um signatário, sujeitos à confirmação humana.",
      "Acompanhante é opcional e informativa.",
      "A acompanhante não é requerente, parte, signatária, pessoa atendida, responsável financeira, titular automática de dados, beneficiária do escopo, destinatária de documentos ou titular de anexo individual.",
      "Um ANX-INDIVIDUAL para o requerente quando aplicável.",
      "Inclusão posterior da acompanhante exige mudança formal de escopo, Anexo V, revisão humana e nova versão do Anexo I.",
      "Não criar ANX-REPRESENTACAO por padrão.",
    ],
    blocoPartes: ["[REQUERENTE PRINCIPAL]", "[ACOMPANHANTE OPCIONAL — FORA DO ESCOPO E SEM ACESSO]"],
    anexos: mapearAnexos(ANEXOS_MODELO_INDIVIDUAL),
    gates: GATES_MODELO_INDIVIDUAL,
  },
  {
    chave: "casal",
    id: MODELO_FAMILIAR_CASAL_ID,
    nome: `CASAL — DOIS ADULTOS — ${MODELO_FAMILIAR_CASAL_VERSAO}`,
    versao: MODELO_FAMILIAR_CASAL_VERSAO,
    status: MODELO_FAMILIAR_CASAL_STATUS,
    base: CONTRATO_BASE_MODELO,
    arquivoBase: "docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md",
    regrasComposicao: [
      "Exatamente dois adultos identificados.",
      "Vínculo declarado, sem inferir casamento, união estável, nacionalidade, residência ou relação jurídica.",
      "Cada adulto só se torna parte contratante/signatário quando confirmado.",
      "Um ANX-INDIVIDUAL por adulto aplicável.",
      "Um contrato-base, um ANX-ESCOPO e um ANX-COMERCIAL por caso.",
      "Não criar dependentes ou representação por padrão.",
      "ANX-REPRESENTACAO somente por necessidade documental confirmada.",
      "Não criar Anexo I sem proposta/OS aprovada do mesmo caso.",
    ],
    blocoPartes: ["[ADULTO 1 — PAPEL/ASSINATURA A CONFIRMAR]", "[ADULTO 2 — PAPEL/ASSINATURA A CONFIRMAR]"],
    anexos: mapearAnexos(ANEXOS_MODELO_FAMILIAR_CASAL),
    gates: GATES_MODELO_FAMILIAR_CASAL,
  },
  {
    chave: "nucleo_familiar",
    id: MODELO_NUCLEO_ID,
    nome: `${MODELO_NUCLEO_NOME} — ${MODELO_NUCLEO_VERSAO}`,
    versao: MODELO_NUCLEO_VERSAO,
    status: MODELO_NUCLEO_STATUS,
    base: CONTRATO_BASE_MODELO,
    arquivoBase: "docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md",
    regrasComposicao: [
      "Um ou mais adultos requerentes, conforme composição confirmada.",
      "Dependentes somente se identificados e relevantes ao escopo.",
      "Adultos são partes/signatários somente quando confirmados.",
      "Dependentes não se tornam signatários automaticamente.",
      "Um ANX-INDIVIDUAL para cada adulto aplicável.",
      "ANX-REPRESENTACAO somente para menor/incapaz ou necessidade formal documentada.",
      "Um escopo familiar central e escopos individuais vinculados quando necessários.",
      "Alteração de pessoas, escopo ou representação exige Anexo V e nova versão persistida da Ordem de Serviço.",
      "Nunca inferir guarda, poder de representação, responsabilidade financeira, parentesco, processos individuais ou consentimento.",
    ],
    blocoPartes: [
      "[ADULTO REQUERENTE]",
      "[ADULTO ADICIONAL, SE APLICÁVEL]",
      "[DEPENDENTE, SE APLICÁVEL — SEM ASSINATURA AUTOMÁTICA]",
    ],
    anexos: mapearAnexos(ANEXOS_MODELO_NUCLEO),
    gates: GATES_MODELO_NUCLEO,
  },
];

export function modeloPorChave(chave: ChaveModelo): ModeloContratual {
  const m = MODELOS_CONTRATUAIS.find((x) => x.chave === chave);
  if (!m) throw new Error(`Modelo contratual inexistente: ${chave}`);
  return m;
}

/* ------------------------------------------------------------------ */
/* CA14-MATRIZES-DE-COMPOSICAO — aplicação por caso real                */
/* ------------------------------------------------------------------ */

export type PessoaComposicao = { titular: boolean; dependente: boolean };

export type ComposicaoCaso =
  | { estado: "classificado"; chave: ChaveModelo; motivo: string }
  | { estado: "sem_dados"; motivo: string };

/**
 * Classifica a composição real do caso — a partir dos papéis já resolvidos
 * por `pessoasDoCasoComFallbackNucleo` (titular/dependente), nunca fundindo
 * pessoas de fontes diferentes nem inferindo papel que a fonte não deu.
 * Sem titular confirmado, devolve "sem_dados": nenhuma matriz é escolhida
 * por suposição.
 */
export function classificarComposicaoCaso(pessoas: readonly PessoaComposicao[]): ComposicaoCaso {
  if (!pessoas.length) return { estado: "sem_dados", motivo: "Nenhuma pessoa registrada no caso ainda." };
  const titulares = pessoas.filter((p) => p.titular).length;
  const dependentes = pessoas.filter((p) => p.dependente).length;
  if (!titulares) return { estado: "sem_dados", motivo: "Nenhum titular confirmado entre as pessoas do caso." };
  if (dependentes > 0 || titulares > 2) {
    return {
      estado: "classificado",
      chave: "nucleo_familiar",
      motivo: `${titulares} titular(es) e ${dependentes} dependente(s) confirmados.`,
    };
  }
  if (titulares === 2) return { estado: "classificado", chave: "casal", motivo: "Dois titulares confirmados, sem dependente." };
  return { estado: "classificado", chave: "individual", motivo: "Um titular confirmado, sem dependente." };
}

/** Matriz (regras de composição + anexos aplicáveis) do caso real, ou pendência honesta. */
export function modeloAplicavelAoCaso(
  pessoas: readonly PessoaComposicao[],
): { estado: "classificado"; modelo: ModeloContratual; motivo: string } | { estado: "sem_dados"; motivo: string } {
  const c = classificarComposicaoCaso(pessoas);
  if (c.estado === "sem_dados") return c;
  return { estado: "classificado", modelo: modeloPorChave(c.chave), motivo: c.motivo };
}

/* ------------------------------------------------------------------ */
/* Quadro de pendências para formalização                               */
/* ------------------------------------------------------------------ */

export type PendenciaFormalizacao = { tema: string; situacao: string; gateBloqueado: string };

export const PENDENCIAS_FORMALIZACAO: PendenciaFormalizacao[] = [
  {
    tema: "Escopo, inclusões, exclusões e entregas",
    situacao: MARCADOR_SEM_FONTE,
    gateBloqueado: "ANEXO-I — bloqueia Anexo I sem proposta/OS aprovada",
  },
  {
    tema: "Condição comercial e vencimentos",
    situacao: MARCADOR_SEM_FONTE,
    gateBloqueado: "ANX-COMERCIAL — bloqueia sem condição formal homologada",
  },
  {
    tema: "Pessoas, papéis e signatários",
    situacao: "Somente placeholders neutros; nenhuma pessoa confirmada.",
    gateBloqueado: "Partes e signatários — bloqueia se incompleto",
  },
  {
    tema: "Autorização de pesquisa externa",
    situacao: "Nenhuma autorização vigente.",
    gateBloqueado: "ANEXO-III — gate de servidor bloqueia ação externa",
  },
  {
    tema: "Procuração aplicável",
    situacao: "País/órgão/poderes não confirmados.",
    gateBloqueado: "ANEXO-IV — bloqueia ato em nome do cliente",
  },
  {
    tema: "Revisão humana/jurídica",
    situacao: "Contrato-base, qualificação institucional e modelos em under_legal_review.",
    gateBloqueado: "Assinatura — bloqueia se método ou revisão ausentes",
  },
  {
    tema: "Aceites e evidências",
    situacao: "Nenhum aceite ou evidência registrada para este rascunho TESTE.",
    gateBloqueado: "Formalização — bloqueia sem evidência rastreável",
  },
];

/* ------------------------------------------------------------------ */
/* Rascunho somente-leitura                                             */
/* ------------------------------------------------------------------ */

export type RascunhoModelo = {
  aviso: string;
  capa: {
    modelo: string;
    versao: string;
    status: EstadoVigenciaContratoBase;
    aviso: string;
    dataGeracao: string;
    identificadorTecnico: string;
    contratoBase: string;
  };
  perfil: {
    versao: string;
    status: EstadoVigenciaContratoBase;
    campos: { rotulo: string; valor: string }[];
    placeholders: { rotulo: string; valor: string }[];
    qualificacao: { titulo: string; versao: string; status: string; paragrafos: string[]; pendencias: string[] };
  };
  preambulo: string;
  clausulas: { numero: number; titulo: string; itens: string[] }[];
  partes: string[];
  matriz: {
    bloco: string;
    fonteExigida: string;
    tipo: string;
    renderiza: string;
    gate: string;
    clausulas: number[];
  }[];
  anexos: AnexoNaMatriz[];
  pendencias: PendenciaFormalizacao[];
  regrasComposicao: string[];
  gates: { codigo: string; regra: string; bloqueia: string }[];
};

export function montarRascunhoModelo(chave: ChaveModelo, dataGeracao = new Date().toISOString().slice(0, 10)): RascunhoModelo {
  const modelo = modeloPorChave(chave);
  const perfil = perfilInstitucionalRenderizado();
  const qualificacao = qualificacaoInstitucionalRenderizada();

  return {
    aviso: AVISO_RASCUNHO_TESTE,
    capa: {
      modelo: modelo.nome,
      versao: modelo.versao,
      status: modelo.status,
      aviso: AVISO_RASCUNHO_TESTE,
      dataGeracao,
      identificadorTecnico: `${modelo.id}@${modelo.versao} · base ${CONTRATO_BASE_ID} ${CONTRATO_BASE_VERSAO} (${CONTRATO_BASE_STATUS})`,
      contratoBase: `${CONTRATO_BASE_MODELO} · ${CONTRATO_BASE_VERSAO}`,
    },
    perfil: {
      versao: PERFIL_INSTITUCIONAL_VERSAO,
      status: perfil.status,
      // representante_legal fica de fora do rascunho: é nome de pessoa física
      // (a Proprietária), e a prévia não aprovada só pode mostrar o placeholder
      // neutro abaixo — mesma regra que já valia para CNPJ e endereço.
      campos: perfil.campos
        .filter((c) => c.campo !== "representante_legal")
        .map((c) => ({ rotulo: c.rotulo, valor: c.valor })),
      placeholders: [
        { rotulo: "CNPJ (prévia não aprovada)", valor: PLACEHOLDERS_INSTITUCIONAIS.cnpj },
        { rotulo: "Endereço (prévia não aprovada)", valor: PLACEHOLDERS_INSTITUCIONAIS.endereco },
        { rotulo: "Representante", valor: PLACEHOLDERS_INSTITUCIONAIS.representante },
      ],
      qualificacao: {
        titulo: qualificacao.titulo,
        versao: qualificacao.versao,
        status: qualificacao.status,
        paragrafos: qualificacao.paragrafos,
        pendencias: qualificacao.pendencias,
      },
    },
    preambulo: PREAMBULO_CONTRATO_BASE,
    clausulas: CLAUSULAS_FIXAS.map((c) => ({ numero: c.numero, titulo: c.titulo, itens: [...c.itens] })),
    partes: modelo.blocoPartes,
    matriz: MATRIZ_RENDERIZACAO.map((l) => ({
      bloco: l.bloco,
      fonteExigida: l.fonteExigida,
      tipo: ROTULO_TIPO_RENDER[l.tipo],
      renderiza: l.renderiza === "sempre" ? "Sempre" : "Quando aplicável",
      gate: l.gate,
      clausulas: l.clausulas,
    })),
    anexos: modelo.anexos,
    pendencias: PENDENCIAS_FORMALIZACAO,
    regrasComposicao: modelo.regrasComposicao,
    gates: modelo.gates,
  };
}

/** Nenhum rascunho é apto a aprovação, assinatura, cobrança ou onboarding. */
export function rascunhoHabilitaAcao(): false {
  return false;
}
