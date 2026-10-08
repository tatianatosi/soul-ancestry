/**
 * Corte U3 (28/09/2026) — decisões que só a equipe pode tomar, listadas a
 * partir do dado real do caso. Nada aqui altera dado: cada pendência diz o
 * que foi visto, por que importa e onde decidir. Regras genéricas (valem para
 * qualquer caso), nunca nomes fixos no código.
 */
import { VIA_LEAD_PARA_CASO } from "@/lib/handoff-triagem";
import { idadeEm } from "@/lib/contrato-partes-canonicas";

export type PendenciaHumana = {
  tipo:
    | "provavel_ancestral_como_signatario"
    | "signatario_sem_pessoa"
    | "menor_sem_representacao"
    | "dossie_mae_divergente"
    | "via_divergente_do_lead"
    | "lead_de_teste_no_nucleo";
  titulo: string;
  detalhe: string;
  ondeDecidir: string;
};

export type MembroNucleoPendencia = {
  nome: string;
  papel?: string | null;
  papel_no_caso?: string | null;
  vinculo?: string | null;
  cliente_id?: string | null;
  data_nascimento?: string | null;
  representacao_necessaria?: boolean | null;
  /**
   * Status vindo de `case_dependents.status_representacao` — o registro que
   * a decisão humana atualiza. Retificação de 07/10/2026: esta regra lia só
   * `nucleo_membros.representacao_necessaria`, um espelho que ninguém
   * atualizou (Felipe: `false` desde 18/08), e por isso continuava pedindo
   * uma representação que já estava **documentada** em `case_dependents`
   * desde 05/10. Reconciliação é de LEITURA: nenhum status é alterado aqui.
   */
  status_representacao?: string | null;
};

/** Representação já registrada como documentada/confirmada no dependente. */
export function representacaoJaDocumentada(m: MembroNucleoPendencia): boolean {
  const s = texto(m.status_representacao).toLowerCase();
  return m.representacao_necessaria === true || s === "documentada" || s === "confirmada";
}

export type LeadPendencia = {
  nome?: string | null;
  via_juridica_preliminar?: string | null;
  dados_teste?: boolean | null;
};

const texto = (v: unknown) => (v == null ? "" : String(v).trim());

/** Ano citado no vínculo (ex.: "certidão de casamento 1912"), quando houver. */
export function anoCitado(vinculo: string | null | undefined): number | null {
  const m = texto(vinculo).match(/\b(1[5-9]\d\d)\b/);
  return m ? Number(m[1]) : null;
}

const ehSignatario = (m: MembroNucleoPendencia) =>
  m.papel === "contratante_signatario" || m.papel_no_caso === "contratante" || m.papel_no_caso === "titular";

export function pendenciasHumanasDoCaso(entrada: {
  caso: { via_juridica_preliminar?: string | null; dossie_mae_referencia?: string | null };
  nucleo?: { dossie_mae?: string | null } | null;
  membros: readonly MembroNucleoPendencia[];
  leads: readonly LeadPendencia[];
  hoje?: Date;
}): PendenciaHumana[] {
  const hoje = entrada.hoje ?? new Date();
  const out: PendenciaHumana[] = [];

  for (const m of entrada.membros) {
    if (!ehSignatario(m)) continue;
    const ano = anoCitado(m.vinculo);
    if (ano !== null && ano <= 1950) {
      out.push({
        tipo: "provavel_ancestral_como_signatario",
        titulo: `${m.nome}: provável ancestral registrado como signatário`,
        detalhe: `O vínculo cita ${ano} ("${texto(m.vinculo)}"). Ancestral é pessoa da pesquisa, não parte do contrato.`,
        ondeDecidir: "Núcleos (papel do membro) e Pesquisa (pessoa da linhagem).",
      });
    } else if (!m.cliente_id) {
      out.push({
        tipo: "signatario_sem_pessoa",
        titulo: `${m.nome}: signatário sem Pessoa 360 vinculada`,
        detalhe: "Sem pessoa vinculada, o contrato não tem de onde ler documento, endereço e contato.",
        ondeDecidir: "Núcleos › vincular a pessoa cadastrada.",
      });
    }
  }

  for (const m of entrada.membros) {
    const idade = idadeEm(m.data_nascimento, hoje);
    const menorPorData = idade !== null && idade < 18;
    const menorPorVinculo = idade === null && /\bmenor\b/i.test(texto(m.vinculo));
    if ((menorPorData || menorPorVinculo) && !representacaoJaDocumentada(m)) {
      out.push({
        tipo: "menor_sem_representacao",
        titulo: `${m.nome}: menor sem representação legal marcada`,
        detalhe: menorPorData
          ? `Idade ${idade} pela data de nascimento; representação necessária não está marcada.`
          : `O vínculo diz "menor" e não há data de nascimento; representação necessária não está marcada.`,
        ondeDecidir: "Núcleos › membro (representação) — com data de nascimento na Pessoa 360.",
      });
    }
  }

  const dossieCaso = texto(entrada.caso.dossie_mae_referencia);
  const dossieNucleo = texto(entrada.nucleo?.dossie_mae);
  if (dossieCaso && dossieNucleo && dossieCaso !== dossieNucleo) {
    out.push({
      tipo: "dossie_mae_divergente",
      titulo: "Dossiê-mãe com duas referências",
      detalhe: `Núcleo: "${dossieNucleo}" · Caso: "${dossieCaso}". O dossiê-mãe é do núcleo.`,
      ondeDecidir: "Núcleos › dossiê-mãe (a referência do caso é legado).",
    });
  }

  const viaCaso = texto(entrada.caso.via_juridica_preliminar);
  for (const l of entrada.leads) {
    const viaLead = texto(l.via_juridica_preliminar);
    if (l.dados_teste) {
      out.push({
        tipo: "lead_de_teste_no_nucleo",
        titulo: `Lead de teste ligado a este caso/núcleo${l.nome ? ` (${l.nome})` : ""}`,
        detalhe: "Um lead marcado como dado de teste aponta para um núcleo/caso real.",
        ondeDecidir: "CRM Vivo › lead (desvincular ou arquivar).",
      });
    }
    if (!viaCaso || !viaLead || viaLead === "via_a_confirmar") continue;
    const equivalente = VIA_LEAD_PARA_CASO[viaLead];
    const bate = equivalente ? equivalente === viaCaso || viaCaso.startsWith(viaLead) : false;
    if (!bate) {
      out.push({
        tipo: "via_divergente_do_lead",
        titulo: "Via do caso diferente da hipótese do lead",
        detalhe: `Lead: ${viaLead.replace(/_/g, " ")} · Caso: ${viaCaso.replace(/_/g, " ")}${equivalente ? "" : " (sem equivalente direto entre as listas)"}.`,
        ondeDecidir: "Caso 360 › Jornada (via confirmada) — o lead é só hipótese.",
      });
    }
  }

  return out;
}
