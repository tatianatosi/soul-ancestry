/**
 * Cálculos do Jurídico & Contratos — funções puras, sem banco.
 *
 * Só usa instrumento já gravado: proposta, itens de escopo, contrato, anexos
 * e ordem de serviço. Nada é estimado, nenhum preço entra aqui e nenhum
 * catálogo/SKU é lido. Funções temporais aceitam `agora` injetável.
 */

import { paraData } from "./golive-operacao";

export type PropostaJur = { id: string; status: string | null; aprovadaEm: string | null };
export type EscopoJur = { id: string; status: string | null; exigeRevisaoHumana: boolean };
export type ContratoJur = {
  id: string;
  status: string | null;
  assinadoEm: string | null;
  liberadoParaEnvioEm: string | null;
  vigenciaInicio: string | null;
  vigenciaFim: string | null;
};
export type AnexoJur = { id: string; status: string | null; obrigatorio: boolean; revisadoEm: string | null };
export type OrdemJur = { id: string; status: string | null; inicio: string | null; fim: string | null };

export type InstrumentosJur = {
  propostas: readonly PropostaJur[];
  escopo: readonly EscopoJur[];
  contratos: readonly ContratoJur[];
  anexos: readonly AnexoJur[];
  ordens: readonly OrdemJur[];
};

export type Fatia = { rotulo: string; valor: number };

const COMPLETO = /(aprovad|assinad|concluid|concluíd|vigente|ativo|registrad|final|pronto|aceito)/i;

function completos<T extends { status: string | null }>(itens: readonly T[], extra?: (i: T) => boolean) {
  return itens.filter((i) => COMPLETO.test(i.status ?? "") || (extra?.(i) ?? false)).length;
}

function percentual(feitos: number, total: number) {
  return total === 0 ? 0 : Math.round((feitos / total) * 100);
}

/**
 * Completude formal por instrumento, em percentual do que já está registrado
 * com situação concluída. Instrumento sem nenhum registro fica em 0%.
 */
export function completudeFormal(d: InstrumentosJur): Fatia[] {
  return [
    { rotulo: "Proposta", valor: percentual(completos(d.propostas, (p) => Boolean(p.aprovadaEm)), d.propostas.length) },
    { rotulo: "Escopo", valor: percentual(completos(d.escopo), d.escopo.length) },
    {
      rotulo: "Contrato",
      valor: percentual(completos(d.contratos, (c) => Boolean(c.assinadoEm)), d.contratos.length),
    },
    { rotulo: "Anexos", valor: percentual(completos(d.anexos, (a) => Boolean(a.revisadoEm)), d.anexos.length) },
    { rotulo: "OS", valor: percentual(completos(d.ordens), d.ordens.length) },
  ];
}

/** Há pelo menos um instrumento registrado? Serve para escolher entre gráfico e estado vazio. */
export function temInstrumento(d: InstrumentosJur) {
  return (
    d.propostas.length + d.escopo.length + d.contratos.length + d.anexos.length + d.ordens.length > 0
  );
}

/** Dias inteiros até a data gravada, pelo calendário local. */
function diasAte(valor: string | null, agora: Date) {
  const d = paraData(valor);
  if (!d) return null;
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
  return Math.round((a - b) / 86_400_000);
}

/**
 * Riscos e prazos: revisão pendente, assinatura pendente, anexo pendente e
 * prazo próximo (vigência de contrato ou janela de OS dentro de `janelaDias`).
 */
export function riscosEPrazos(d: InstrumentosJur, agora: Date = new Date(), janelaDias = 15): Fatia[] {
  const revisaoPendente =
    d.escopo.filter((i) => i.exigeRevisaoHumana && !COMPLETO.test(i.status ?? "")).length +
    d.anexos.filter((a) => a.obrigatorio && !a.revisadoEm).length;

  const assinaturaPendente = d.contratos.filter((c) => !c.assinadoEm).length;

  const anexoPendente = d.anexos.filter((a) => !COMPLETO.test(a.status ?? "") && !a.revisadoEm).length;

  const datas = [
    ...d.contratos.flatMap((c) => [c.vigenciaInicio, c.vigenciaFim]),
    ...d.ordens.flatMap((o) => [o.inicio, o.fim]),
  ];
  const prazoProximo = datas.filter((v) => {
    const dias = diasAte(v ?? null, agora);
    return dias !== null && dias >= 0 && dias <= janelaDias;
  }).length;

  return [
    { rotulo: "Revisão pendente", valor: revisaoPendente },
    { rotulo: "Assinatura pendente", valor: assinaturaPendente },
    { rotulo: "Anexo pendente", valor: anexoPendente },
    { rotulo: "Prazo próximo", valor: prazoProximo },
  ];
}

export type DegrauPipeline = { rotulo: string; feito: boolean };

/**
 * Pipeline jurídico: proposta → escopo → rascunho → revisão humana →
 * pronto para assinatura → registrado. Cada degrau só é concluído com
 * registro gravado; nenhum estado é deduzido do degrau seguinte.
 */
export function pipelineJuridico(d: InstrumentosJur): DegrauPipeline[] {
  const rascunho = d.contratos.length > 0;
  const revisao = d.contratos.some((c) => Boolean(c.liberadoParaEnvioEm)) || d.anexos.some((a) => Boolean(a.revisadoEm));
  const prontoAssinatura = d.contratos.some((c) => Boolean(c.liberadoParaEnvioEm) || /assinatura/i.test(c.status ?? ""));
  const registrado = d.contratos.some((c) => Boolean(c.assinadoEm)) || d.ordens.length > 0;

  return [
    { rotulo: "Proposta", feito: d.propostas.length > 0 },
    { rotulo: "Escopo", feito: d.escopo.length > 0 },
    { rotulo: "Rascunho", feito: rascunho },
    { rotulo: "Revisão humana", feito: revisao },
    { rotulo: "Pronto para assinatura", feito: prontoAssinatura },
    { rotulo: "Registrado", feito: registrado },
  ];
}

/** Primeiro degrau ainda não concluído — o que a equipe precisa fazer agora. */
export function etapaAtual(pipeline: readonly DegrauPipeline[]): string | null {
  return pipeline.find((p) => !p.feito)?.rotulo ?? null;
}
