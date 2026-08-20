/**
 * ANA-SAVE-SEC-01B — dicionário de erros de persistência da Aba Casos.
 *
 * Códigos são estáveis: o servidor devolve o código na mensagem e a interface
 * traduz para texto humano. Nenhum código aqui executa ação externa.
 */

export const CODIGOS_PERSISTENCIA = {
  DIVERGENCIA: "DIVERGENCIA_PERSISTENCIA",
  NAO_MAPEADO: "CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA",
  SEM_LINHA: "NENHUMA_LINHA_AFETADA",
  PERMISSAO: "ERRO_PERMISSAO",
  PROXIMA_ACAO: "PROXIMA_ACAO_INCOMPLETA",
  INESPERADO: "ERRO_INESPERADO",
} as const;

export type CodigoPersistencia = (typeof CODIGOS_PERSISTENCIA)[keyof typeof CODIGOS_PERSISTENCIA];

export type LeituraErro = { codigo: CodigoPersistencia; titulo: string; detalhe: string };

const TITULOS: Record<CodigoPersistencia, string> = {
  DIVERGENCIA_PERSISTENCIA: "Divergência de persistência",
  CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA: "Campo não mapeado",
  NENHUMA_LINHA_AFETADA: "Nenhuma linha afetada",
  ERRO_PERMISSAO: "Erro de permissão",
  PROXIMA_ACAO_INCOMPLETA: "Próxima ação incompleta",
  ERRO_INESPERADO: "Erro inesperado",
};

const PERMISSAO_RE = /(permissão|permission|row-level security|policy|não permite editar|não autorizado)/i;

/** Traduz a mensagem do servidor em código estável + texto para a tela. */
export function classificarErroPersistencia(erro: unknown): LeituraErro {
  const bruto = erro instanceof Error ? erro.message : String(erro ?? "");
  const encontrado = (Object.values(CODIGOS_PERSISTENCIA) as string[]).find((c) => bruto.includes(c)) as
    | CodigoPersistencia
    | undefined;
  const codigo: CodigoPersistencia = encontrado ?? (PERMISSAO_RE.test(bruto) ? "ERRO_PERMISSAO" : "ERRO_INESPERADO");
  const detalhe = bruto.replace(`${codigo}:`, "").trim() || "Nada foi gravado.";
  return { codigo, titulo: TITULOS[codigo], detalhe };
}

/** Rótulos de estado visíveis nos formulários da Aba Casos. */
export const ESTADOS_SALVAMENTO = {
  salvando: "Salvando…",
  salvo: (hora: string) => `Salvo às ${hora}`,
  sujo: "Alterações não salvas",
  limpo: "Sem alterações pendentes",
} as const;

export function horaAgora(agora = new Date()): string {
  return agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
