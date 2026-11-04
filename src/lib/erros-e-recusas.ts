/**
 * A09 (04/11/2026, decisão D13: "a Proprietária quer ler os logs").
 *
 * Leitura humana dos registros que já existem em `audit_logs`: erros do app (`erro_app`) e recusas
 * gravadas pelo servidor. Nenhuma ação nova é criada aqui; a lista abaixo usa somente literais que o
 * código já grava. Regras puras, sem I/O, para a tela e para o teste.
 */
export const ACAO_ERRO_APP = "erro_app";

export const ACOES_DE_RECUSA = [
  "gate_formalizacao_bloqueado",
  "analysis_blocked_insufficient_case_data",
  "analysis_blocked_research_not_authorized",
  "biblioteca_acesso_negado",
  "bootstrap_denied",
  "convite_portal_bloqueado",
  "reenvio_convite_bloqueado",
  "reativacao_acesso_bloqueada",
  "leitura_demo_bloqueada",
] as const;

export const ROTULO_ACAO: Record<string, string> = {
  erro_app: "Erro do app",
  gate_formalizacao_bloqueado: "Etapa de formalização recusada",
  analysis_blocked_insufficient_case_data: "Análise de pesquisa recusada: dados insuficientes",
  analysis_blocked_research_not_authorized: "Análise de pesquisa recusada: sem autorização",
  biblioteca_acesso_negado: "Acesso à Biblioteca recusado",
  bootstrap_denied: "Configuração inicial recusada",
  convite_portal_bloqueado: "Convite ao App recusado",
  reenvio_convite_bloqueado: "Reenvio de convite recusado",
  reativacao_acesso_bloqueada: "Reativação de acesso recusada",
  leitura_demo_bloqueada: "Leitura de dado de demonstração recusada",
};

export type LinhaAuditoria = {
  id: string;
  created_at: string;
  acao: string;
  entidade: string | null;
  user_id: string | null;
  metadados: Record<string, unknown> | null;
};

export type RegistroLegivel = {
  id: string;
  em: string;
  tipo: "erro" | "recusa";
  rotulo: string;
  onde: string;
  motivo: string;
  origem: string | null;
  quem: string | null;
  deTeste: boolean;
};

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * Registro gravado pela suíte de testes (antes da correção de 04/11/2026) — não é erro do app.
 * Reconhecido só pela pilha: arquivo de teste ou executor de testes.
 */
export function ehRegistroDeTeste(metadados: Record<string, unknown> | null | undefined): boolean {
  const pilha = texto(metadados?.["pilha"]);
  return /__tests__\/|\.test\.tsx?:|@vitest\//.test(pilha);
}

function motivoDe(l: LinhaAuditoria): string {
  const m = l.metadados ?? {};
  const direto = texto(m["mensagem"]) || texto(m["motivo"]);
  if (direto) return direto;
  const descricoes = Array.isArray(m["descricoes"]) ? (m["descricoes"] as unknown[]).map(texto).filter(Boolean) : [];
  if (descricoes.length) return descricoes.join("; ");
  const lacunas = Array.isArray(m["lacunas"]) ? (m["lacunas"] as { campo?: unknown }[]).map((x) => texto(x?.campo)).filter(Boolean) : [];
  if (lacunas.length) return `Campos faltantes: ${lacunas.join(", ")}`;
  return "Motivo não registrado";
}

function ondeDe(l: LinhaAuditoria): string {
  const m = l.metadados ?? {};
  const tela = texto(m["tela"]);
  if (tela) return tela;
  const entidade = texto(l.entidade);
  if (entidade.startsWith("/_serverFn/")) return "Função do servidor";
  return entidade || "Não registrado";
}

export type GrupoDeRegistros = RegistroLegivel & {
  chave: string;
  quantidade: number;
  primeiraEm: string;
};

/**
 * Agrupa ocorrências repetidas (mesmo tipo, motivo e lugar) para a leitura caber numa tela:
 * cada grupo mostra quantas vezes aconteceu e quando foi a última. A entrada vem da mais recente
 * para a mais antiga; a ordem dos grupos segue a última ocorrência.
 */
export function agruparRegistros(registros: RegistroLegivel[]): GrupoDeRegistros[] {
  const grupos = new Map<string, GrupoDeRegistros>();
  for (const r of registros) {
    const chave = [r.tipo, r.rotulo, r.motivo, r.onde, r.deTeste ? "teste" : "app"].join("|");
    const atual = grupos.get(chave);
    if (atual) {
      atual.quantidade += 1;
      if (r.em < atual.primeiraEm) atual.primeiraEm = r.em;
      if (r.em > atual.em) atual.em = r.em;
    } else {
      grupos.set(chave, { ...r, chave, quantidade: 1, primeiraEm: r.em });
    }
  }
  return [...grupos.values()].sort((a, b) => (a.em < b.em ? 1 : a.em > b.em ? -1 : 0));
}

export function legivel(l: LinhaAuditoria): RegistroLegivel {
  const m = l.metadados ?? {};
  return {
    id: l.id,
    em: l.created_at,
    tipo: l.acao === ACAO_ERRO_APP ? "erro" : "recusa",
    rotulo: ROTULO_ACAO[l.acao] ?? l.acao,
    onde: ondeDe(l),
    motivo: motivoDe(l),
    origem: texto(m["origem"]) || null,
    quem: l.user_id,
    deTeste: l.acao === ACAO_ERRO_APP && ehRegistroDeTeste(m),
  };
}
