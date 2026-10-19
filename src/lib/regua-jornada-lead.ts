/**
 * Régua da jornada do lead (rodada 4, 18/10/2026) — leitura pura dos campos já
 * gravados no lead. Não grava, não infere: campo vazio = "Não registrado".
 *
 * Origem › Varredura › Discovery › Validação jurídica › Proposta › Contrato › Caso 360
 */
import { CAMPOS_VARRIDOS, CAMPO_LEAD_POR_VARREDURA, ROTULO_CAMPO, type CampoVarrido } from "@/lib/varredura-whatsapp";

export type EstadoEtapa = "concluido" | "andamento" | "aguardando" | "nao_registrado";

export const ROTULO_ESTADO_ETAPA: Record<EstadoEtapa, string> = {
  concluido: "Concluído",
  andamento: "Em andamento",
  aguardando: "Aguardando",
  nao_registrado: "Não registrado",
};

export type EtapaRegua = { id: string; rotulo: string; estado: EstadoEtapa; detalhe: string };

export type LeadRegua = {
  origem?: string | null;
  discovery_resultado?: string | null;
  status_call?: string | null;
  call_realizada_em?: string | null;
  trilha_referencia_id?: string | null;
  proposta_link_interno?: string | null;
  proposta_referencia_interna?: string | null;
  contrato_link_interno?: string | null;
  case_id?: string | null;
};

export function reguaJornadaLead(
  lead: LeadRegua | null,
  sugestoes: readonly { decisao: string }[] = [],
): EtapaRegua[] {
  const l = lead ?? {};
  const aceitas = sugestoes.filter((s) => s.decisao === "aceita").length;
  const e = (id: string, rotulo: string, estado: EstadoEtapa, detalhe: string): EtapaRegua => ({ id, rotulo, estado, detalhe });
  return [
    l.origem ? e("origem", "Origem", "concluido", "Origem registrada") : e("origem", "Origem", "nao_registrado", "Não registrado"),
    aceitas > 0
      ? e("varredura", "Varredura", "concluido", `${aceitas} sugestão(ões) aceita(s) com trecho de origem`)
      : sugestoes.length > 0
        ? e("varredura", "Varredura", "andamento", "Sugestões decididas, nenhuma aceita")
        : e("varredura", "Varredura", "nao_registrado", "Não registrado"),
    l.discovery_resultado
      ? e("discovery", "Discovery", "concluido", "Resultado do Discovery gravado")
      : l.call_realizada_em || l.status_call
        ? e("discovery", "Discovery", "andamento", "Call registrada, resultado pendente")
        : e("discovery", "Discovery", "nao_registrado", "Não registrado"),
    l.trilha_referencia_id
      ? e("juridico", "Validação jurídica", "concluido", "Trilha de referência escolhida — triagem interna")
      : e("juridico", "Validação jurídica", "nao_registrado", "Não registrado"),
    l.proposta_referencia_interna || l.proposta_link_interno
      ? e("proposta", "Proposta", "concluido", "Proposta vinculada")
      : e("proposta", "Proposta", "aguardando", "Sem proposta vinculada"),
    l.contrato_link_interno
      ? e("contrato", "Contrato", "andamento", "Contrato vinculado; assinatura é ato separado")
      : e("contrato", "Contrato", "aguardando", "Sem contrato vinculado"),
    l.case_id
      ? e("caso", "Caso 360", "concluido", "Caso aberto")
      : e("caso", "Caso 360", "aguardando", "Sem caso aberto"),
  ];
}

export type LinhaBrief = { campo: CampoVarrido; rotulo: string; estado: "ja_sabemos" | "sugerido" | "nao_registrado"; valor: string | null };

/**
 * Brief pré-call: o bloco "O que já sabemos" do roteiro de 15 minutos.
 * Já sabemos = campo gravado no lead. Sugerido = achado da varredura ainda não
 * decidido. O resto é "Não registrado" e vira pergunta da call.
 */
export function briefPreCall(
  lead: Record<string, unknown> | null,
  pendentes: readonly { campo: CampoVarrido; valor: string }[],
  rotular: (campo: string, valor: string) => string = (_c, v) => v,
): LinhaBrief[] {
  return CAMPOS_VARRIDOS.map((campo) => {
    const destino = CAMPO_LEAD_POR_VARREDURA[campo]?.campoLead;
    const bruto = destino && lead ? lead[destino] : null;
    const valores = Array.isArray(bruto) ? bruto.filter(Boolean).map(String) : bruto ? [String(bruto)] : [];
    if (valores.length) {
      return { campo, rotulo: ROTULO_CAMPO[campo], estado: "ja_sabemos" as const, valor: valores.map((v) => rotular(destino!, v)).join(", ") };
    }
    const p = pendentes.find((x) => x.campo === campo);
    if (p) return { campo, rotulo: ROTULO_CAMPO[campo], estado: "sugerido" as const, valor: p.valor };
    return { campo, rotulo: ROTULO_CAMPO[campo], estado: "nao_registrado" as const, valor: null };
  });
}
