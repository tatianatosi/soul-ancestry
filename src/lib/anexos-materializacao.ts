/**
 * Materialização dos anexos JÁ REVISADOS JURIDICAMENTE (II, IV e V) como
 * instância documental canônica do caso.
 *
 * Regras invioláveis deste lote:
 * - Só cria VÍNCULO e VERSÃO. Nunca reescreve conteúdo jurídico aprovado.
 * - Instância congelada (anexada ao contrato, assinada ou arquivada) é
 *   preservada: o lote não gera versão nova por cima dela.
 * - Conteúdo idêntico ao já salvo não vira versão nova.
 * - Nada aqui assina, envia, cobra ou dispara pesquisa externa.
 */

import type { InstanciaPersistida } from "@/lib/anexos-instancia";

/** Anexos com revisão jurídica concluída — escopo fechado deste lote. */
export const ANEXOS_REVISADOS = [
  "ANEXO_II_DESPESAS_EXTERNAS",
  "ANEXO_IV_PROCURACAO",
  "ANEXO_V_ALTERACAO_ESCOPO",
] as const;

export type AnexoRevisado = (typeof ANEXOS_REVISADOS)[number];

export function ehAnexoRevisado(codigo: string): codigo is AnexoRevisado {
  return (ANEXOS_REVISADOS as readonly string[]).includes(codigo);
}

/** Estados em que a instância salva é intocável por materialização automática. */
export const STATUS_CONGELADOS = ["signed_with_contract", "attached", "archived"];

export type AcaoMaterializacao = "materializar" | "ja_canonica" | "preservado" | "fora_do_lote";

export const ROTULO_ACAO_MATERIALIZACAO: Record<AcaoMaterializacao, string> = {
  materializar: "Vai gerar versão",
  ja_canonica: "Já é a instância canônica",
  preservado: "Preservado — não será tocado",
  fora_do_lote: "Fora deste lote",
};

export type CandidatoMaterializacao = {
  codigo: string;
  titulo: string;
  /** Hash do conteúdo derivado da ficha, calculado no servidor. */
  hash: string;
};

export type ItemPlanoMaterializacao = {
  codigo: string;
  titulo: string;
  acao: AcaoMaterializacao;
  motivo: string;
  versaoAtual: number | null;
  proximaVersao: number | null;
  statusPersistido: string | null;
};

function vigentePorCodigo(persistidas: InstanciaPersistida[]) {
  const mapa = new Map<string, InstanciaPersistida>();
  for (const p of persistidas) {
    if (p.is_test) continue;
    const atual = mapa.get(p.annex_code);
    if (!atual || p.annex_version > atual.annex_version) mapa.set(p.annex_code, p);
  }
  return mapa;
}

/**
 * Decide, anexo a anexo, o que o lote faz. Puro: não grava nada.
 */
export function planejarMaterializacao(input: {
  candidatos: CandidatoMaterializacao[];
  persistidas: InstanciaPersistida[];
}): ItemPlanoMaterializacao[] {
  const vigentes = vigentePorCodigo(input.persistidas);

  return input.candidatos
    .map((c) => {
      const v = vigentes.get(c.codigo) ?? null;
      const base = {
        codigo: c.codigo,
        titulo: c.titulo,
        versaoAtual: v?.annex_version ?? null,
        statusPersistido: v?.status ?? null,
      };

      if (!ehAnexoRevisado(c.codigo)) {
        return {
          ...base,
          acao: "fora_do_lote" as const,
          motivo: "Este lote materializa apenas os Anexos II, IV e V revisados.",
          proximaVersao: null,
        };
      }

      if (v && STATUS_CONGELADOS.includes(v.status)) {
        return {
          ...base,
          acao: "preservado" as const,
          motivo: `Instância v${v.annex_version} está em "${v.status}": conteúdo aprovado preservado, sem nova versão.`,
          proximaVersao: null,
        };
      }

      if (v && v.file_hash === c.hash && v.tem_conteudo) {
        return {
          ...base,
          acao: "ja_canonica" as const,
          motivo: `Instância v${v.annex_version} já corresponde ao documento do caso.`,
          proximaVersao: null,
        };
      }

      return {
        ...base,
        acao: "materializar" as const,
        motivo: v
          ? `Vínculo e versão novos a partir de v${v.annex_version}, preservando o histórico.`
          : "Primeira materialização deste anexo no caso.",
        proximaVersao: (v?.annex_version ?? 0) + 1,
      };
    })
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
}

export function resumoMaterializacao(plano: ItemPlanoMaterializacao[]) {
  const conta = (a: AcaoMaterializacao) => plano.filter((p) => p.acao === a).length;
  const materializar = conta("materializar");
  return {
    total: plano.length,
    materializar,
    ja_canonicas: conta("ja_canonica"),
    preservadas: conta("preservado"),
    fora_do_lote: conta("fora_do_lote"),
    mensagem: materializar
      ? `${materializar} anexo(s) revisado(s) serão vinculados ao caso em versão nova. Nenhum conteúdo aprovado é reescrito.`
      : "Nada a materializar: os anexos revisados já estão salvos como instância canônica ou estão preservados.",
  };
}
