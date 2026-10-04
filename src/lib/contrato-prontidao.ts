/**
 * Prontidão do contrato em uma olhada.
 *
 * Diretriz da Proprietária, 04/10/2026: "verifique os cards e melhore a
 * experiência para que seja uma verificação rápida e não um excesso de
 * auditorias e verificações de itens já verificados diversas vezes."
 *
 * Medição: a preparação do contrato tem 7 cartões no modo Preparar, 4 no modo
 * Revisar e 4 cartões de auditoria recolhidos. Cada sinal existe e é real — o
 * que faltava era responder "onde este contrato está e qual é a próxima ação"
 * sem abrir cartão nenhum.
 *
 * Este módulo é puro: deriva a resposta dos sinais que a tela já carregou.
 * Não consulta nada, não grava nada e não cria estado novo — e, por isso,
 * nunca pode ficar fora de sincronia com os cartões que detalham cada passo.
 */

export type EstadoPasso = "ok" | "pendente" | "bloqueado";

export type PassoContrato = {
  chave: string;
  rotulo: string;
  estado: EstadoPasso;
  detalhe: string;
  /** Âncora do cartão que resolve este passo, na própria tela. */
  ancora: string;
};

export type EntradaProntidao = {
  propostaAprovada: boolean;
  completudePct: number;
  partesComPendencia: number;
  escopoResumoPreenchido: boolean;
  condicaoValor: number | null;
  /** Status salvo da instância do Anexo I (contract_annexes.status). */
  anexoIStatus: string | null;
  anexosPendentes: number;
  /**
   * 04/10/2026 — a cobertura passou a ser material: o conteúdo do Anexo I
   * (escopo por pessoa, serviços, entregas, condição comercial) está
   * incorporado ao corpo do contrato? Quando sim, a ausência do documento
   * separado não é pendência.
   */
  anexoIIncorporadoNoCorpo?: boolean;
  /** Pendências que de fato impedem a assinatura inicial (cobertura material). */
  pendenciasImpeditivas?: string[];
  /** Pendências reais que não impedem contratar agora (atos posteriores). */
  pendenciasPosteriores?: string[];
  rascunhoSalvo: boolean;
  versaoFinalCongelada: boolean;
  revisaoAprovadaEm: string | null;
  assinaturaRegistradaEm: string | null;
  /** Bloqueios de gate já avaliados pela tela (motivo humano, não código). */
  bloqueiosImpeditivos: string[];
  pendenciasHumanas: number;
};

function passo(
  chave: string,
  rotulo: string,
  ancora: string,
  ok: boolean,
  detalheOk: string,
  detalhePendente: string,
  bloqueado = false,
): PassoContrato {
  return {
    chave,
    rotulo,
    ancora,
    estado: ok ? "ok" : bloqueado ? "bloqueado" : "pendente",
    detalhe: ok ? detalheOk : detalhePendente,
  };
}

/**
 * Cobertura material: ou o conteúdo está incorporado ao corpo, ou existe a
 * instância do Anexo I — e, nos dois casos, sem pendência impeditiva.
 */
export function coberturaCompleta(e: EntradaProntidao): boolean {
  const impeditivas = e.pendenciasImpeditivas?.length ?? 0;
  if (impeditivas > 0) return false;
  if (e.anexosPendentes > 0) return false;
  if (e.anexoIIncorporadoNoCorpo) return true;
  return Boolean(e.anexoIStatus) && e.anexoIStatus !== "missing";
}

function detalheCobertura(e: EntradaProntidao): string {
  const impeditivas = e.pendenciasImpeditivas ?? [];
  if (impeditivas.length) {
    return `${impeditivas.length} pendência(s) impedem a assinatura inicial: ${impeditivas.slice(0, 3).join("; ")}`;
  }
  if (e.anexosPendentes > 0) return `${e.anexosPendentes} anexo(s) aplicável(is) com conteúdo pendente.`;
  if (e.anexoIIncorporadoNoCorpo) return "Cobertura incorporada ao corpo do contrato.";
  if (!e.anexoIStatus) {
    return "Escopo contratado não coberto: nem incorporado ao corpo, nem registrado como Anexo I.";
  }
  return "Anexo I salvo sem conteúdo: faltam campos da ficha do caso.";
}

/**
 * Os 8 passos da cadeia já aprovada (proposta → assinatura), na ordem em que
 * acontecem. Cada passo aponta para o cartão que o resolve — nenhum passo
 * novo, nenhuma etapa inventada.
 */
export function passosDoContrato(e: EntradaProntidao): PassoContrato[] {
  return [
    passo(
      "proposta",
      "Proposta aprovada",
      "#proposta",
      e.propostaAprovada,
      "Proposta aprovada vinculada ao caso.",
      "Sem proposta aprovada: o escopo e o preço não têm origem homologada.",
    ),
    passo(
      "partes",
      "Partes e representação",
      "#ficha",
      e.partesComPendencia === 0 && e.completudePct >= 100,
      "Partes completas e reconciliadas com a Pessoa 360.",
      e.partesComPendencia > 0
        ? `${e.partesComPendencia} campo(s) de partes por reconciliar.`
        : `Ficha ${e.completudePct}% completa — faltam parâmetros obrigatórios.`,
    ),
    passo(
      "escopo",
      "Escopo e entregas",
      "#escopo",
      e.escopoResumoPreenchido,
      "Escopo da proposta registrado nos parâmetros do caso.",
      "Escopo ainda não registrado a partir da proposta aprovada.",
    ),
    passo(
      "comercial",
      "Condição comercial",
      "#comercial",
      e.condicaoValor != null,
      "Condição particular do caso registrada.",
      "Condição comercial do caso não registrada.",
    ),
    /*
     * Antes este passo era "Anexo I (OS) e anexos" e exigia a instância
     * documental do Anexo I. Instrução da Proprietária em 04/10/2026: "não
     * substituir essa duplicidade por uma obrigação artificial de gerar Anexos
     * I e II separados" — o que importa é a cobertura material do contrato,
     * esteja ela no corpo ou em anexo.
     */
    passo(
      "cobertura",
      "Cobertura contratual completa",
      "#anexos",
      coberturaCompleta(e),
      e.anexoIIncorporadoNoCorpo
        ? "Escopo, serviços, entregas e condição comercial incorporados ao corpo do contrato; anexos aplicáveis sem pendência."
        : "Anexo I materializado e anexos aplicáveis sem pendência.",
      detalheCobertura(e),
    ),
    passo(
      "rascunho",
      "Rascunho e versão final",
      "#previas",
      e.versaoFinalCongelada,
      "Versão final congelada no histórico.",
      e.rascunhoSalvo
        ? "Rascunho de trabalho salvo — falta congelar a versão final."
        : "Nenhum rascunho salvo ainda.",
    ),
    passo(
      "revisao",
      "Revisão humana aprovada",
      "#decisao-humana",
      Boolean(e.revisaoAprovadaEm),
      "Revisão humana aprovada.",
      e.bloqueiosImpeditivos.length
        ? `Revisão travada: ${e.bloqueiosImpeditivos.join("; ")}`
        : "Revisão humana ainda não aprovada.",
      e.bloqueiosImpeditivos.length > 0,
    ),
    passo(
      "assinatura",
      "Assinatura registrada",
      "#decisao-humana",
      Boolean(e.assinaturaRegistradaEm),
      "Assinatura externa registrada com referência.",
      "Assinatura é ato externo posterior — registre depois de assinada.",
    ),
  ];
}

export type ResumoProntidao = {
  passos: PassoContrato[];
  fases: FaseAvaliada[];
  concluidos: number;
  total: number;
  /** Primeiro passo não concluído: a única ação que interessa agora. */
  proximo: PassoContrato | null;
  pronto: boolean;
  frase: string;
};

/**
 * Fases do instrumento, separadas como ela pediu: pronto para assinar não é
 * assinado; assinado não é em execução; e ato posterior (autorização,
 * procuração, alteração de escopo) não é pendência de contratação inicial.
 */
export const FASES_INSTRUMENTO = [
  "pronto_para_assinatura",
  "assinado",
  "execucao",
  "atos_posteriores",
] as const;
export type FaseInstrumento = (typeof FASES_INSTRUMENTO)[number];

export const ROTULO_FASE_INSTRUMENTO: Record<FaseInstrumento, string> = {
  pronto_para_assinatura: "Pronto para assinatura",
  assinado: "Assinado",
  execucao: "Em execução",
  atos_posteriores: "Atos posteriores (condicionais)",
};

export type FaseAvaliada = {
  fase: FaseInstrumento;
  alcancada: boolean;
  motivo: string;
};

export function fasesDoInstrumento(e: EntradaProntidao): FaseAvaliada[] {
  const pronto =
    e.propostaAprovada &&
    e.escopoResumoPreenchido &&
    e.condicaoValor != null &&
    coberturaCompleta(e) &&
    (e.pendenciasImpeditivas?.length ?? 0) === 0;
  const assinado = Boolean(e.assinaturaRegistradaEm);
  return [
    {
      fase: "pronto_para_assinatura",
      alcancada: pronto,
      motivo: pronto
        ? "Conteúdo completo e sem pendência impeditiva. Pronto para assinatura não é assinado."
        : detalheCobertura(e),
    },
    {
      fase: "assinado",
      alcancada: assinado,
      motivo: assinado
        ? "Assinatura externa registrada com referência."
        : "Assinatura é ato externo posterior: um contrato não assinado nunca aparece como assinado.",
    },
    {
      fase: "execucao",
      alcancada: assinado && Boolean(e.revisaoAprovadaEm),
      motivo: assinado
        ? "Execução começa depois da assinatura e da condição de pagamento cumprida."
        : "Execução depende de assinatura registrada.",
    },
    {
      fase: "atos_posteriores",
      alcancada: false,
      motivo:
        (e.pendenciasPosteriores?.length ?? 0) > 0
          ? `${e.pendenciasPosteriores!.length} instrumento(s) condicional(is) previstos: ${e.pendenciasPosteriores!.slice(0, 3).join("; ")}`
          : "Nenhum instrumento condicional pendente. Autorização, procuração e alteração de escopo só existem quando o ato concreto aparecer.",
    },
  ];
}

export function resumoProntidao(e: EntradaProntidao): ResumoProntidao {
  const passos = passosDoContrato(e);
  const concluidos = passos.filter((p) => p.estado === "ok").length;
  const proximo = passos.find((p) => p.estado !== "ok") ?? null;
  const pronto = proximo === null;
  const frase = pronto
    ? "Contrato completo: proposta, partes, escopo, comercial, anexos, versão final, revisão aprovada e assinatura registrada."
    : `Próximo passo — ${proximo!.rotulo}: ${proximo!.detalhe}`;
  return { passos, fases: fasesDoInstrumento(e), concluidos, total: passos.length, proximo, pronto, frase };
}
