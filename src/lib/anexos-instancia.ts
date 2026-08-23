/**
 * Conferência entre o que a tela mostra (motor em memória) e a INSTÂNCIA
 * DOCUMENTAL CANÔNICA persistida por caso (anexos versionados).
 *
 * Somente leitura e comparação: nada aqui assina, envia, cobra ou grava.
 */

export type InstanciaPersistida = {
  annex_code: string;
  title: string;
  status: string;
  annex_version: number;
  model_version: string | null;
  file_hash: string | null;
  tem_conteudo: boolean;
  atualizado_em: string | null;
  is_test: boolean;
};

export type AnexoNaTela = {
  codigo: string;
  titulo: string;
  /** status equivalente ao domínio persistido (contract_annexes.status). */
  status: string;
  modelo: string | null;
};

/**
 * Traduz o anexo derivado na tela para o mesmo domínio de status usado na
 * instância salva (contract_annexes.status).
 */
export function statusTelaDeAnexo(a: { aplicavel: boolean; pendencias: unknown[]; estado: string }): string {
  if (!a.aplicavel) return "not_applicable";
  if (a.pendencias.length) return "missing";
  if (a.estado === "aprovado") return "approved";
  if (a.estado === "em_revisao") return "ready_for_review";
  return "drafting";
}

export type EstadoInstancia = "canonica" | "desatualizada" | "nao_materializada" | "somente_persistida";

export type LinhaInstancia = {
  codigo: string;
  titulo: string;
  estado: EstadoInstancia;
  versao: number | null;
  modelo: string | null;
  statusTela: string | null;
  statusPersistido: string | null;
  atualizadoEm: string | null;
  temConteudo: boolean;
  hash: string | null;
  observacao: string;
};

export const ROTULO_ESTADO_INSTANCIA: Record<EstadoInstancia, string> = {
  canonica: "Instância canônica vigente",
  desatualizada: "Instância desatualizada",
  nao_materializada: "Ainda não materializada",
  somente_persistida: "Só existe na instância salva",
};

export const EXPLICACAO_ESTADO_INSTANCIA: Record<EstadoInstancia, string> = {
  canonica: "A tela mostra exatamente o documento salvo e versionado do caso.",
  desatualizada: "A tela mudou depois da última materialização. Salve o caso para gerar a próxima versão.",
  nao_materializada: "O documento aparece na tela mas ainda não foi salvo como instância do caso.",
  somente_persistida: "Existe uma instância salva que as regras atuais do caso não geram mais.",
};

/** Mantém apenas a maior versão de cada anexo e descarta registros de teste. */
export function instanciasVigentes(linhas: InstanciaPersistida[]): InstanciaPersistida[] {
  const porCodigo = new Map<string, InstanciaPersistida>();
  for (const l of linhas) {
    if (l.is_test) continue;
    const atual = porCodigo.get(l.annex_code);
    if (!atual || l.annex_version > atual.annex_version) porCodigo.set(l.annex_code, l);
  }
  return [...porCodigo.values()].sort((a, b) => a.annex_code.localeCompare(b.annex_code));
}

export function conferirInstancias(tela: AnexoNaTela[], persistidas: InstanciaPersistida[]): LinhaInstancia[] {
  const vigentes = instanciasVigentes(persistidas);
  const porCodigo = new Map(vigentes.map((v) => [v.annex_code, v]));
  const linhas: LinhaInstancia[] = [];

  for (const a of tela) {
    const p = porCodigo.get(a.codigo);
    if (!p) {
      linhas.push({
        codigo: a.codigo,
        titulo: a.titulo,
        estado: "nao_materializada",
        versao: null,
        modelo: a.modelo,
        statusTela: a.status,
        statusPersistido: null,
        atualizadoEm: null,
        temConteudo: false,
        hash: null,
        observacao: EXPLICACAO_ESTADO_INSTANCIA.nao_materializada,
      });
      continue;
    }
    const divergente = p.status !== a.status || (a.modelo != null && p.model_version !== a.modelo) || !p.tem_conteudo;
    const estado: EstadoInstancia = divergente ? "desatualizada" : "canonica";
    linhas.push({
      codigo: a.codigo,
      titulo: p.title || a.titulo,
      estado,
      versao: p.annex_version,
      modelo: p.model_version,
      statusTela: a.status,
      statusPersistido: p.status,
      atualizadoEm: p.atualizado_em,
      temConteudo: p.tem_conteudo,
      hash: p.file_hash,
      observacao: EXPLICACAO_ESTADO_INSTANCIA[estado],
    });
  }

  const naTela = new Set(tela.map((a) => a.codigo));
  for (const p of vigentes) {
    if (naTela.has(p.annex_code)) continue;
    linhas.push({
      codigo: p.annex_code,
      titulo: p.title,
      estado: "somente_persistida",
      versao: p.annex_version,
      modelo: p.model_version,
      statusTela: null,
      statusPersistido: p.status,
      atualizadoEm: p.atualizado_em,
      temConteudo: p.tem_conteudo,
      hash: p.file_hash,
      observacao: EXPLICACAO_ESTADO_INSTANCIA.somente_persistida,
    });
  }

  return linhas.sort((a, b) => a.codigo.localeCompare(b.codigo));
}

export type ResumoInstancias = {
  total: number;
  canonicas: number;
  desatualizadas: number;
  nao_materializadas: number;
  somente_persistidas: number;
  conforme: boolean;
  mensagem: string;
};

export function resumoInstancias(linhas: LinhaInstancia[]): ResumoInstancias {
  const conta = (e: EstadoInstancia) => linhas.filter((l) => l.estado === e).length;
  const canonicas = conta("canonica");
  const desatualizadas = conta("desatualizada");
  const nao = conta("nao_materializada");
  const so = conta("somente_persistida");
  const conforme = linhas.length > 0 && desatualizadas === 0 && nao === 0 && so === 0;
  const mensagem = !linhas.length
    ? "Nenhum anexo aplicável a este caso até agora."
    : conforme
      ? "Todos os anexos exibidos correspondem à instância documental salva do caso."
      : "Há anexos na tela que ainda não estão salvos como instância documental do caso. Salve o caso para materializar a versão.";
  return {
    total: linhas.length,
    canonicas,
    desatualizadas,
    nao_materializadas: nao,
    somente_persistidas: so,
    conforme,
    mensagem,
  };
}
