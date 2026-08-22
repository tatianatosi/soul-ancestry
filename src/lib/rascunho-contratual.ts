/**
 * Rascunho único de trabalho e versionamento por evento de governança.
 *
 * Um rascunho editável por organization_id + case_id + template_version.
 * Salvar, importar, confirmar, bloquear, recalcular anexos ou revisar
 * parâmetros atualiza o mesmo rascunho. Snapshot imutável só nasce em evento
 * de governança e nunca ao abrir a tela.
 */

export const MARCA_RASCUNHO_TRABALHO = "RASCUNHO INTERNO — INCOMPLETO — NÃO APTO PARA ASSINATURA";

export const EVENTOS_GOVERNANCA = [
  "revisao_solicitada",
  "retorno_ajuste",
  "aprovacao",
  "envio_assinatura",
  "assinatura_registrada",
] as const;
export type EventoGovernanca = (typeof EVENTOS_GOVERNANCA)[number];

export const ACOES_DE_RASCUNHO = [
  "abrir_tela",
  "salvar_campo",
  "importar_origem",
  "confirmar_campo",
  "bloquear_campo",
  "atualizar_escopo",
  "recalcular_anexos",
  "revisar_parametros",
] as const;
export type AcaoRascunho = (typeof ACOES_DE_RASCUNHO)[number];

export function chaveRascunho(organizationId: string, caseId: string, templateVersion: string) {
  return `${organizationId}::${caseId}::${templateVersion}`;
}

export function acaoCriaSnapshot(acao: string): acao is EventoGovernanca {
  return (EVENTOS_GOVERNANCA as readonly string[]).includes(acao);
}

/** Impressão digital estável de conteúdo — conteúdo idêntico não cria versão. */
export function impressaoDigital(conteudo: unknown): string {
  const texto = JSON.stringify(conteudo, (_k, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < texto.length; i++) {
    h1 = Math.imul(h1 ^ texto.charCodeAt(i), 16777619) >>> 0;
    h2 = Math.imul(h2 + texto.charCodeAt(i), 2246822519) >>> 0;
  }
  return `${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}`;
}

export type RascunhoTrabalho = {
  chave: string;
  conteudo: unknown;
  impressao: string;
  atualizadoEm: string;
  revisao: number;
};

export type SnapshotImutavel = {
  chave: string;
  evento: EventoGovernanca;
  motivo: string;
  autor: string;
  em: string;
  versaoModelo: string;
  perfilInstitucional: string;
  conteudo: unknown;
  impressao: string;
};

export type EstadoMotor = { rascunhos: RascunhoTrabalho[]; snapshots: SnapshotImutavel[] };

export function estadoInicial(): EstadoMotor {
  return { rascunhos: [], snapshots: [] };
}

/** Toda ação de trabalho atualiza o rascunho único da chave; nunca cria versão. */
export function aplicarAcaoRascunho(
  estado: EstadoMotor,
  input: { chave: string; conteudo: unknown; em: string },
): EstadoMotor {
  const impressao = impressaoDigital(input.conteudo);
  const atual = estado.rascunhos.find((r) => r.chave === input.chave);
  if (!atual) {
    return { ...estado, rascunhos: [...estado.rascunhos, { chave: input.chave, conteudo: input.conteudo, impressao, atualizadoEm: input.em, revisao: 1 }] };
  }
  const mudou = atual.impressao !== impressao;
  return {
    ...estado,
    rascunhos: estado.rascunhos.map((r) =>
      r.chave === input.chave
        ? { ...r, conteudo: input.conteudo, impressao, atualizadoEm: mudou ? input.em : r.atualizadoEm, revisao: mudou ? r.revisao + 1 : r.revisao }
        : r,
    ),
  };
}

/** Snapshot imutável só por evento de governança; conteúdo idêntico não duplica versão. */
export function registrarEventoGovernanca(
  estado: EstadoMotor,
  input: { chave: string; evento: string; motivo: string; autor: string; em: string; versaoModelo: string; perfilInstitucional: string },
): EstadoMotor {
  if (!acaoCriaSnapshot(input.evento)) return estado;
  const rascunho = estado.rascunhos.find((r) => r.chave === input.chave);
  if (!rascunho) return estado;
  const jaExiste = estado.snapshots.some((s) => s.chave === input.chave && s.evento === input.evento && s.impressao === rascunho.impressao);
  if (jaExiste) return estado;
  return {
    ...estado,
    snapshots: [
      ...estado.snapshots,
      {
        chave: input.chave,
        evento: input.evento,
        motivo: input.motivo,
        autor: input.autor,
        em: input.em,
        versaoModelo: input.versaoModelo,
        perfilInstitucional: input.perfilInstitucional,
        conteudo: rascunho.conteudo,
        impressao: rascunho.impressao,
      },
    ],
  };
}

/** Rascunho de trabalho nunca satisfaz gate de revisão/assinatura. */
export function rascunhoSatisfazGate(): false {
  return false;
}
