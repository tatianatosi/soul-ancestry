/**
 * Validação pura da abertura de caso no motor unificado.
 * Persistência vive em abrir-caso-operacional.functions.ts (tabelas existentes).
 */

export const SERVICOS_CASO_OPERACIONAL = [
  { valor: "pesquisa", rotulo: "Pesquisa genealógica" },
  { valor: "cidadania", rotulo: "Cidadania" },
  { valor: "documentacao", rotulo: "Documentação" },
  { valor: "consultoria", rotulo: "Consultoria" },
] as const;

export const TITULO_PRIMEIRA_TAREFA_CASO = "Abrir jornada do caso";
export const PROXIMA_ACAO_ABERTURA = "Definir serviço no planejador e confirmar jornada";

const texto = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

export type EntradaAberturaCaso = {
  cliente_id?: unknown;
  titulo?: unknown;
  tipo_servico?: unknown;
  resumo?: unknown;
};

export function validarAberturaCasoOperacional(entrada: EntradaAberturaCaso): {
  ok: boolean;
  erros: string[];
} {
  const erros: string[] = [];
  if (!texto(entrada.cliente_id)) erros.push("Caso operacional exige cliente vinculado.");
  if (!texto(entrada.titulo)) erros.push("Informe o título do caso.");
  const servico = texto(entrada.tipo_servico);
  if (!servico) erros.push("Caso operacional exige tipo de serviço.");
  else if (!SERVICOS_CASO_OPERACIONAL.some((s) => s.valor === servico)) {
    erros.push("Tipo de serviço fora do vocabulário operacional.");
  }
  return { ok: erros.length === 0, erros };
}
