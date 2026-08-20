/**
 * G-08 — FONTES E DOCUMENTOS (seção interna de Pesquisa Transversal)
 *
 * Regras puras de catálogo, validação e apresentação. Um registro aqui é
 * apenas Documento/Fonte: material bruto ou referência externa.
 * Nunca é evidência, achado, pessoa, relação, evento, linhagem ou relatório,
 * e nunca é projetado ao App Cliente.
 */

export type Opcao = { id: string; rotulo: string };

export const TIPOS_DOCUMENTO: Opcao[] = [
  { id: "certidao_nascimento", rotulo: "Certidão de nascimento" },
  { id: "certidao_casamento", rotulo: "Certidão de casamento" },
  { id: "certidao_obito", rotulo: "Certidão de óbito" },
  { id: "registro_civil", rotulo: "Registro civil" },
  { id: "inteiro_teor", rotulo: "Inteiro teor" },
  { id: "certidao_estrangeira", rotulo: "Certidão estrangeira" },
  { id: "registro_religioso_batismo", rotulo: "Registro religioso ou batismo" },
  { id: "registro_imigracao", rotulo: "Registro de imigração" },
  { id: "lista_passageiros", rotulo: "Lista de passageiros" },
  { id: "registro_consular", rotulo: "Registro consular" },
  { id: "naturalizacao", rotulo: "Naturalização" },
  { id: "passaporte", rotulo: "Passaporte" },
  { id: "documento_identidade", rotulo: "Documento de identidade" },
  { id: "comprovante_residencia", rotulo: "Comprovante de residência" },
  { id: "documento_militar", rotulo: "Documento militar" },
  { id: "documento_notarial", rotulo: "Documento notarial" },
  { id: "inventario_testamento", rotulo: "Inventário ou testamento" },
  { id: "documento_judicial", rotulo: "Documento judicial" },
  { id: "documento_cidadania", rotulo: "Documento de cidadania" },
  { id: "certidao_negativa_positiva", rotulo: "Certidão negativa ou positiva" },
  { id: "registro_arquivo_historico", rotulo: "Registro de arquivo histórico" },
  { id: "fotografia_imagem_historica", rotulo: "Fotografia ou imagem histórica" },
  { id: "correspondencia", rotulo: "Correspondência" },
  { id: "arvore_recebida_familia", rotulo: "Árvore genealógica recebida da família" },
  { id: "relato_familiar", rotulo: "Relato familiar" },
  { id: "documento_comercial_contratual", rotulo: "Documento comercial ou contratual" },
  { id: "proposta_canva", rotulo: "Proposta Canva" },
  { id: "outro_documento", rotulo: "Outro documento" },
];

export const STATUS_FONTE: Opcao[] = [
  { id: "pendente_revisao", rotulo: "Pendente de revisão" },
  { id: "revisado", rotulo: "Revisado" },
  { id: "rejeitado", rotulo: "Rejeitado" },
  { id: "arquivado", rotulo: "Arquivado" },
];

export const QUALIDADE_ORIGEM: Opcao[] = [
  { id: "original_oficial", rotulo: "Original oficial" },
  { id: "copia_autenticada", rotulo: "Cópia autenticada" },
  { id: "copia_simples", rotulo: "Cópia simples" },
  { id: "imagem_digital", rotulo: "Imagem digital" },
  { id: "relato_familiar", rotulo: "Relato familiar" },
  { id: "fonte_secundaria", rotulo: "Fonte secundária" },
  { id: "origem_a_confirmar", rotulo: "Origem a confirmar" },
];

export const CONFIDENCIALIDADE: Opcao[] = [
  { id: "equipe_do_caso", rotulo: "Equipe do caso" },
  { id: "interno", rotulo: "Interno" },
  { id: "restrito", rotulo: "Restrito (administração e pesquisa)" },
];

/** Origem/emissor do material recebido. Lista fechada; "outra" cobre o resto. */
export const ORIGENS_DOCUMENTO: Opcao[] = [
  { id: "cartorio", rotulo: "Cartório" },
  { id: "arquivo_publico", rotulo: "Arquivo público" },
  { id: "arquivo_religioso", rotulo: "Arquivo religioso" },
  { id: "consulado", rotulo: "Consulado ou embaixada" },
  { id: "orgao_publico", rotulo: "Órgão público" },
  { id: "familia", rotulo: "Família" },
  { id: "cliente", rotulo: "Cliente" },
  { id: "acervo_interno", rotulo: "Acervo interno" },
  { id: "outra", rotulo: "Outra origem" },
];

export const PESSOA_NAO_IDENTIFICADA = "pessoa_nao_identificada";

/** Extensões aceitas. TIFF só entra se o acervo atual aceitar o mime. */
export const EXTENSOES_ACEITAS = ["pdf", "jpg", "jpeg", "png", "tif", "tiff"] as const;
export const MIMES_ACEITOS: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  tif: "image/tiff",
  tiff: "image/tiff",
};
export const TAMANHO_MAXIMO_BYTES = 25 * 1024 * 1024;

export function rotulo(lista: Opcao[], id: unknown): string {
  const found = lista.find((o) => o.id === String(id ?? ""));
  return found ? found.rotulo : String(id ?? "—");
}

export function extensaoDe(nome: string): string {
  const parte = nome.toLowerCase().split(".").pop() ?? "";
  return parte.trim();
}

export type ChecagemArquivo = { ok: boolean; erros: string[] };

/** Valida extensão, tamanho, arquivo vazio/corrompido e nome utilizável. */
export function validarArquivo(arquivo: { name?: string; size?: number } | null | undefined): ChecagemArquivo {
  const erros: string[] = [];
  if (!arquivo || !arquivo.name) {
    erros.push("ARQUIVO_OBRIGATORIO");
    return { ok: false, erros };
  }
  const ext = extensaoDe(arquivo.name);
  if (!(EXTENSOES_ACEITAS as readonly string[]).includes(ext)) erros.push("EXTENSAO_NAO_ACEITA");
  const tamanho = Number(arquivo.size ?? 0);
  if (!Number.isFinite(tamanho) || tamanho <= 0) erros.push("ARQUIVO_VAZIO_OU_CORROMPIDO");
  if (tamanho > TAMANHO_MAXIMO_BYTES) erros.push("ARQUIVO_ACIMA_DO_LIMITE");
  return { ok: erros.length === 0, erros };
}

export type FormularioFonte = {
  arquivo?: { name?: string; size?: number } | null;
  tipo_documento?: unknown;
  origem_documento?: unknown;
  pessoa_ref_id?: unknown;
  pessoa_nao_identificada?: unknown;
  status?: unknown;
  qualidade_origem?: unknown;
  confidencialidade?: unknown;
};

export type ChecagemFormulario = { ok: boolean; erros: string[]; statusInicial: "pendente_revisao" };

/**
 * Valida o formulário "Adicionar documento". `exigeArquivo` fica falso na
 * edição de metadados, em que o arquivo já existe e não pode ser trocado.
 */
export function validarFormularioFonte(form: FormularioFonte, exigeArquivo = true): ChecagemFormulario {
  const erros: string[] = [];
  if (exigeArquivo) erros.push(...validarArquivo(form.arquivo).erros);

  if (!TIPOS_DOCUMENTO.some((t) => t.id === String(form.tipo_documento ?? ""))) erros.push("TIPO_DOCUMENTO_INVALIDO");
  if (!ORIGENS_DOCUMENTO.some((o) => o.id === String(form.origem_documento ?? ""))) erros.push("ORIGEM_DOCUMENTO_INVALIDA");

  const naoIdentificada = form.pessoa_nao_identificada === true;
  const pessoa = String(form.pessoa_ref_id ?? "").trim();
  if (naoIdentificada === Boolean(pessoa)) erros.push("PESSOA_RELACIONADA_OBRIGATORIA");

  if (form.status !== undefined && !STATUS_FONTE.some((s) => s.id === String(form.status))) erros.push("STATUS_INVALIDO");
  if (form.qualidade_origem !== undefined && !QUALIDADE_ORIGEM.some((q) => q.id === String(form.qualidade_origem)))
    erros.push("QUALIDADE_ORIGEM_INVALIDA");
  if (form.confidencialidade !== undefined && !CONFIDENCIALIDADE.some((c) => c.id === String(form.confidencialidade)))
    erros.push("CONFIDENCIALIDADE_INVALIDA");

  return { ok: erros.length === 0, erros, statusInicial: "pendente_revisao" };
}

/** Campos que a lista interna nunca deve exibir. */
export const CAMPOS_PROIBIDOS_NA_LISTA = [
  "cpf",
  "cpf_completo",
  "preco",
  "valor",
  "honorario",
  "condicao_comercial",
  "sku",
  "storage_path",
];

export type LinhaLista = {
  id: string;
  titulo: string;
  tipo: string;
  pessoa: string;
  origem: string;
  data_documento: string;
  local: string;
  status: string;
  qualidade: string;
  incluido_em: string;
  autor: string;
  arquivado: boolean;
};

export function mascararCpf(valor?: string | null): string {
  const d = (valor ?? "").replace(/\D/g, "");
  if (d.length !== 11) return "";
  return `***.${d.slice(3, 6)}.***-**`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function linhaDaLista(
  registro: Record<string, any>,
  pessoas: { id: string; nome: string }[],
  equipe: { id: string; nome: string }[],
): LinhaLista {
  const pessoa = registro["pessoa_nao_identificada"]
    ? "Pessoa ainda não identificada"
    : (pessoas.find((p) => p.id === registro["pessoa_ref_id"])?.nome ?? "Pessoa ainda não identificada");
  const local = [registro["cidade"], registro["estado_provincia"], registro["pais"]].filter(Boolean).join(" · ");
  return {
    id: String(registro["id"]),
    titulo: String(registro["titulo_interno"] || registro["nome_arquivo"] || "—"),
    tipo: rotulo(TIPOS_DOCUMENTO, registro["tipo_documento"]),
    pessoa,
    origem: [rotulo(ORIGENS_DOCUMENTO, registro["origem_documento"]), registro["instituicao_emissora"]]
      .filter(Boolean)
      .join(" · "),
    data_documento: registro["data_documento"] ? String(registro["data_documento"]).slice(0, 10) : "—",
    local: local || "—",
    status: rotulo(STATUS_FONTE, registro["status"]),
    qualidade: rotulo(QUALIDADE_ORIGEM, registro["qualidade_origem"]),
    incluido_em: registro["created_at"] ? String(registro["created_at"]).slice(0, 10) : "—",
    autor: equipe.find((e) => e.id === registro["created_by"])?.nome ?? "Equipe interna",
    arquivado: Boolean(registro["archived_at"]),
  };
}

export function filtrarLista(
  linhas: LinhaLista[],
  filtros: { busca?: string; status?: string; tipo?: string; pessoa?: string; origem?: string; local?: string },
): LinhaLista[] {
  const b = (filtros.busca ?? "").trim().toLowerCase();
  return linhas.filter((l) => {
    if (b && ![l.titulo, l.pessoa, l.tipo, l.origem].some((v) => v.toLowerCase().includes(b))) return false;
    if (filtros.status && l.status !== filtros.status) return false;
    if (filtros.tipo && l.tipo !== filtros.tipo) return false;
    if (filtros.pessoa && l.pessoa !== filtros.pessoa) return false;
    if (filtros.origem && !l.origem.includes(filtros.origem)) return false;
    if (filtros.local && !l.local.toLowerCase().includes(filtros.local.toLowerCase())) return false;
    return true;
  });
}

/**
 * Documento/Fonte nunca gera automaticamente entidades genealógicas nem
 * projeções ao App Cliente. Função explícita para o teste de regressão.
 */
export const EFEITOS_COLATERAIS_PROIBIDOS = [
  "evidences",
  "research_people",
  "research_relationships",
  "research_events",
  "lineage_paths",
  "genealogical_findings",
  "case_reports",
  "app_projections",
  "client_deliverables",
] as const;

export function efeitosDoUpload(): string[] {
  return ["case_source_documents", "audit_logs"];
}
