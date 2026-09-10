/**
 * Validação Jurídica como decisão de ato formal, não bloqueio universal
 * (CA08-JURIDICO-PROPORCIONAL, 09/09/2026).
 *
 * Função pura: só combina o que já existe (citizenship_tracks,
 * versioned_legal_rules, legal_reference_milestones, a matriz jurídica de
 * temas contratuais e representação de dependentes) numa leitura por caso.
 * Nenhuma taxonomia nova é criada aqui — "ato afetado" é só o rótulo do
 * efeito operacional já previsto na missão (assinatura, envio formal,
 * protocolo, publicação jurídica, acesso sensível de menor), nunca conteúdo
 * jurídico novo.
 */

export type AtoFormal = "assinatura" | "envio_formal" | "protocolo" | "publicacao_juridica" | "acesso_sensivel_menor";

export const ROTULO_ATO_FORMAL: Record<AtoFormal, string> = {
  assinatura: "Assinatura do contrato",
  envio_formal: "Envio formal ao cliente ou a terceiros",
  protocolo: "Protocolo em instituição externa",
  publicacao_juridica: "Publicação de conteúdo jurídico (App/Biblioteca Mestre)",
  acesso_sensivel_menor: "Acesso sensível de dado de menor",
};

export type RotaJuridicaCaso = {
  trackId: string;
  pais: string | null;
  nacionalidade: string | null;
  viaPreliminar: string | null;
  statusVia: string | null;
  trackName: string | null;
  lifecycleStatus: string;
  revisaoHumanaJuridica: string | null;
};

export type MarcoBruto = {
  id: string;
  track_id: string;
  label: string;
  reference_type: string;
  status: string;
  review_required: string;
  lifecycle_status: string;
};

export type RegraBruta = {
  id: string;
  track_id: string;
  tema: string;
  status: string;
  fonte_referencia: string | null;
};

export type TemaMatrizBruto = {
  tema_codigo: string;
  tema: string;
  status: string;
  bloqueia_assinatura: boolean;
  versao_juridica_aplicavel: string | null;
};

export type DependenteBruto = {
  nome: string;
  participa_do_contrato: boolean;
  status_representacao: string | null;
};

export type PendenciaJuridicaCaso = {
  origem: "marco" | "regra" | "tema_contratual" | "representacao_menor";
  rotulo: string;
  estado: string;
  decisaoHumanaNecessaria: string;
  documentoOuEvidencia: string | null;
  atoAfetado: AtoFormal;
};

export type ResultadoValidacaoJuridicaCaso = {
  semRotaAplicavel: boolean;
  rota: RotaJuridicaCaso | null;
  pendencias: PendenciaJuridicaCaso[];
  atosAfetados: AtoFormal[];
};

/** Marco cuja referência sustenta protocolo/procedimento externo vs. conteúdo publicável. */
function atoDoMarco(referenceType: string): AtoFormal {
  return referenceType === "procedimento" || referenceType === "prazo" || referenceType === "requisito"
    ? "protocolo"
    : "publicacao_juridica";
}

export function avaliarValidacaoJuridicaCaso(entrada: {
  track: RotaJuridicaCaso | null;
  marcos: readonly MarcoBruto[];
  regras: readonly RegraBruta[];
  temasMatriz: readonly TemaMatrizBruto[];
  dependentes: readonly DependenteBruto[];
}): ResultadoValidacaoJuridicaCaso {
  if (!entrada.track) {
    // Sem rota aplicável, só a validação de temas contratuais/representação
    // ainda vale — nunca "sem dados" quando há bloqueio real de outra fonte.
    const pendencias = avaliarPendenciasSemRota(entrada.temasMatriz, entrada.dependentes);
    return {
      semRotaAplicavel: true,
      rota: null,
      pendencias,
      atosAfetados: [...new Set(pendencias.map((p) => p.atoAfetado))],
    };
  }

  const pendencias: PendenciaJuridicaCaso[] = [];

  for (const m of entrada.marcos) {
    const emDia = m.status === "vigente" && (m.lifecycle_status === "vigente" || m.lifecycle_status === "homologado");
    if (emDia || m.review_required === "dispensa_homologada") continue;
    pendencias.push({
      origem: "marco",
      rotulo: m.label,
      estado: `${m.status} · ${m.lifecycle_status}`,
      decisaoHumanaNecessaria:
        m.review_required === "obrigatoria"
          ? "Revisão jurídica humana obrigatória deste marco antes do ato formal correspondente."
          : "Definir se a revisão jurídica humana é exigida para este marco.",
      documentoOuEvidencia: "Fonte oficial verificada e registrada (verified_at/verified_by).",
      atoAfetado: atoDoMarco(m.reference_type),
    });
  }

  for (const r of entrada.regras) {
    if (r.status === "aprovado") continue;
    pendencias.push({
      origem: "regra",
      rotulo: r.tema,
      estado: r.status,
      decisaoHumanaNecessaria: "Aprovar a versão da regra jurídica antes de projetar conteúdo relacionado.",
      documentoOuEvidencia: r.fonte_referencia ? `Fonte: ${r.fonte_referencia}` : "Fonte de referência da regra.",
      atoAfetado: "publicacao_juridica",
    });
  }

  pendencias.push(...avaliarPendenciasSemRota(entrada.temasMatriz, entrada.dependentes));

  return {
    semRotaAplicavel: false,
    rota: entrada.track,
    pendencias,
    atosAfetados: [...new Set(pendencias.map((p) => p.atoAfetado))],
  };
}

function avaliarPendenciasSemRota(
  temasMatriz: readonly TemaMatrizBruto[],
  dependentes: readonly DependenteBruto[],
): PendenciaJuridicaCaso[] {
  const pendencias: PendenciaJuridicaCaso[] = [];

  for (const t of temasMatriz) {
    if (!t.bloqueia_assinatura) continue;
    if (t.status === "aprovado" && t.versao_juridica_aplicavel) continue;
    if (t.status === "nao_aplicavel") continue;
    pendencias.push({
      origem: "tema_contratual",
      rotulo: t.tema,
      estado: t.status,
      decisaoHumanaNecessaria: "Registrar decisão do tema na matriz jurídica (aprovado, rejeitado ou não aplicável).",
      documentoOuEvidencia: t.versao_juridica_aplicavel ? null : "Versão jurídica aplicável do tema.",
      atoAfetado: "assinatura",
    });
  }

  const participantes = dependentes.filter((d) => d.participa_do_contrato);
  for (const d of participantes) {
    if (d.status_representacao === "documentada") continue;
    pendencias.push({
      origem: "representacao_menor",
      rotulo: d.nome,
      estado: d.status_representacao ?? "sem_registro",
      decisaoHumanaNecessaria: "Confirmar e documentar a representação legal do dependente.",
      documentoOuEvidencia: "Documento de representação legal (procuração/termo de guarda).",
      atoAfetado: "acesso_sensivel_menor",
    });
  }

  return pendencias;
}
