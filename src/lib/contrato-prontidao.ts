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
    passo(
      "os",
      "Anexo I (OS) e anexos",
      "#anexos",
      Boolean(e.anexoIStatus) && e.anexoIStatus !== "missing" && e.anexosPendentes === 0,
      "Anexo I materializado e anexos aplicáveis sem pendência.",
      !e.anexoIStatus
        ? "Anexo I ainda não materializado: derive-o da proposta aprovada."
        : e.anexoIStatus === "missing"
          ? "Anexo I salvo sem conteúdo: faltam campos da ficha do caso."
          : `${e.anexosPendentes} anexo(s) com conteúdo pendente.`,
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
  concluidos: number;
  total: number;
  /** Primeiro passo não concluído: a única ação que interessa agora. */
  proximo: PassoContrato | null;
  pronto: boolean;
  frase: string;
};

export function resumoProntidao(e: EntradaProntidao): ResumoProntidao {
  const passos = passosDoContrato(e);
  const concluidos = passos.filter((p) => p.estado === "ok").length;
  const proximo = passos.find((p) => p.estado !== "ok") ?? null;
  const pronto = proximo === null;
  const frase = pronto
    ? "Contrato completo: proposta, partes, escopo, comercial, anexos, versão final, revisão aprovada e assinatura registrada."
    : `Próximo passo — ${proximo!.rotulo}: ${proximo!.detalhe}`;
  return { passos, concluidos, total: passos.length, proximo, pronto, frase };
}
