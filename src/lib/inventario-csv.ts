/**
 * Exportação CSV do inventário patrimonial — camada SOMENTE-LEITURA.
 * Gera texto CSV a partir de INVENTARIO, com filtros por domínio e status.
 * Nenhuma ação externa, escrita ou alteração de dado é executada aqui.
 */

import {
  INVENTARIO,
  INVENTARIO_DATA,
  INVENTARIO_VERSAO,
  ROTULO_DOMINIO,
  camadasFaltantes,
  type Dominio,
  type ItemInventario,
  type StatusInventario,
} from "@/lib/inventario-patrimonial";

export type FiltroInventario = {
  dominio?: Dominio | "todos";
  status?: StatusInventario | "todos";
};

export const CABECALHO_CSV = [
  "id",
  "dominio",
  "dominio_rotulo",
  "nome_canonico",
  "finalidade",
  "status",
  "severidade",
  "origem",
  "fonte_de_verdade_atual",
  "localizacao",
  "versao",
  "data",
  "responsavel",
  "camada_1_fonte_documental",
  "camada_2_conteudo_homologado",
  "camada_3_estrutura_no_app",
  "camada_4_instancia_de_caso",
  "camada_5_validacao_autenticada",
  "camadas_faltantes",
  "vinculos",
  "dependencias",
  "risco",
  "acao_necessaria",
  "proprietaria_pode_agir_internamente",
  "depende_de",
] as const;

export function filtrarInventario(filtro: FiltroInventario = {}): ItemInventario[] {
  const { dominio = "todos", status = "todos" } = filtro;
  return INVENTARIO.filter(
    (item) =>
      (dominio === "todos" || item.dominio === dominio) &&
      (status === "todos" || item.status === status),
  );
}

function celula(valor: string | boolean | null): string {
  const texto =
    typeof valor === "boolean" ? (valor ? "sim" : "nao") : (valor ?? "").toString().replace(/\r?\n/g, " ").trim();
  return `"${texto.replace(/"/g, '""')}"`;
}

export function linhaCsv(item: ItemInventario): string[] {
  const k = item.camadas;
  return [
    item.id,
    item.dominio,
    ROTULO_DOMINIO[item.dominio],
    item.nomeCanonico,
    item.finalidade,
    item.status,
    item.severidade,
    item.origem.join(" | "),
    item.fonteDeVerdadeAtual,
    item.localizacao,
    item.versao,
    item.data,
    item.responsavel,
    k.fonteDocumental ? "sim" : "nao",
    k.conteudoHomologado ? "sim" : "nao",
    k.estruturaNoApp ? "sim" : "nao",
    k.instanciaDeCaso ? "sim" : "nao",
    k.validacaoAutenticada ? "sim" : "nao",
    camadasFaltantes(item).join(" | ") || "nenhuma",
    item.vinculos.join(" | ") || "—",
    item.dependencias.join(" | ") || "—",
    item.risco,
    item.acaoNecessaria ?? "Nenhuma nesta etapa.",
    item.proprietariaPodeAgirInternamente ? "sim" : "nao",
    item.dependeDe.join(" | "),
  ];
}

/** CSV completo (com BOM para abrir corretamente no Excel em pt-BR). */
export function gerarCsvInventario(filtro: FiltroInventario = {}): string {
  const linhas = [
    CABECALHO_CSV.map((c) => celula(c)).join(","),
    ...filtrarInventario(filtro).map((item) => linhaCsv(item).map((v) => celula(v)).join(",")),
  ];
  return `\uFEFF${linhas.join("\r\n")}\r\n`;
}

export function nomeArquivoCsv(filtro: FiltroInventario = {}): string {
  const { dominio = "todos", status = "todos" } = filtro;
  return `inventario-patrimonial_${INVENTARIO_VERSAO}_${INVENTARIO_DATA}_dominio-${dominio}_status-${status}.csv`;
}

/** Dispara o download no navegador. Não envia nada para fora do dispositivo. */
export function baixarCsvInventario(filtro: FiltroInventario = {}): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([gerarCsvInventario(filtro)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivoCsv(filtro);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
