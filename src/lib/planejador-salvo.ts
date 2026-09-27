/**
 * Corte 1 (27/09/2026) — "salvar/dessalvar": o formulário do Planejador do
 * Caso 360 abria sempre em branco e, ao salvar, gravava listas vazias por cima
 * do plano já persistido. Este módulo puro traduz a linha real de
 * `case_plans` de volta para o formulário, para que ele abra com o que foi
 * salvo e só mude o que a pessoa editar.
 */
import { COMPOSICOES, type Composicao, type Fonte } from "@/lib/cadeia-operacional";
import { FASES_JORNADA, type FaseJornada } from "@/lib/onboarding-jornada";
import { PRODUTOS_PAI_CANONICOS, type ProdutoPaiId } from "@/lib/planejador-produtos-pai";

export type FormularioPlanejador = {
  objetivo: string;
  etapa: string;
  faseJornada: FaseJornada | "";
  produtoPaiId: ProdutoPaiId | "";
  composicao: Composicao | "";
  rotaConfirmada: string;
  produtoSkuCodigo: string;
  proximaAcao: string;
  prazoProximaAcao: string;
  entregas: string;
  microentregas: string;
  marcos: string;
  checklist: string;
  perguntas: string;
  dependenciasCliente: string;
  dependenciasTerceiros: string;
};

export const FORMULARIO_PLANEJADOR_VAZIO: FormularioPlanejador = {
  objetivo: "",
  etapa: "",
  faseJornada: "",
  produtoPaiId: "",
  composicao: "",
  rotaConfirmada: "",
  produtoSkuCodigo: "",
  proximaAcao: "",
  prazoProximaAcao: "",
  entregas: "",
  microentregas: "",
  marcos: "",
  checklist: "",
  perguntas: "",
  dependenciasCliente: "",
  dependenciasTerceiros: "",
};

/** Partes do plano salvo que o formulário não edita, mas não pode apagar ao salvar. */
export type PreservadoDoPlano = { fontes: Fonte[]; regrasAnexos: string[] };

const texto = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));

const lista = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : texto((x as any)?.titulo ?? (x as any)?.nome ?? ""))).filter(Boolean) : [];

const umPorLinha = (v: unknown): string => lista(v).join("\n");

function umDe<T extends string>(v: unknown, permitidos: readonly T[]): T | "" {
  const s = texto(v);
  return (permitidos as readonly string[]).includes(s) ? (s as T) : "";
}

/** Linha de `case_plans` (+ código do SKU já resolvido) → formulário preenchido. */
export function formularioDoPlanoSalvo(
  linha: Record<string, unknown> | null | undefined,
  skuCodigo?: string | null,
): FormularioPlanejador {
  if (!linha) return { ...FORMULARIO_PLANEJADOR_VAZIO };
  const prazo = texto(linha["prazo_proxima_acao"]);
  return {
    objetivo: texto(linha["objetivo"]),
    etapa: texto(linha["etapa"]),
    faseJornada: umDe(linha["fase_jornada"], FASES_JORNADA.map((f) => f.id) as FaseJornada[]),
    produtoPaiId: umDe(linha["produto_pai_id"], PRODUTOS_PAI_CANONICOS.map((p) => p.id) as ProdutoPaiId[]),
    composicao: umDe(linha["composicao"], COMPOSICOES),
    rotaConfirmada: texto(linha["rota_confirmada"]),
    produtoSkuCodigo: texto(skuCodigo),
    proximaAcao: texto(linha["proxima_acao"]),
    prazoProximaAcao: prazo ? prazo.slice(0, 10) : "",
    entregas: umPorLinha(linha["entregas"]),
    microentregas: umPorLinha(linha["microentregas"]),
    marcos: umPorLinha(linha["marcos"]),
    checklist: umPorLinha(linha["checklist_aplicavel"]),
    perguntas: umPorLinha(linha["perguntas"]),
    dependenciasCliente: umPorLinha(linha["dependencias_cliente"]),
    dependenciasTerceiros: umPorLinha(linha["dependencias_terceiros"]),
  };
}

/** Fontes (mapa jsonb) e regras de anexos salvas voltam intactas no próximo salvar. */
export function preservadoDoPlanoSalvo(linha: Record<string, unknown> | null | undefined): PreservadoDoPlano {
  if (!linha) return { fontes: [], regrasAnexos: [] };
  const mapa = linha["fontes"];
  const fontes: Fonte[] =
    mapa && typeof mapa === "object" && !Array.isArray(mapa)
      ? Object.entries(mapa as Record<string, any>).map(([chave, f]) => ({
          chave,
          estado: f?.estado,
          referencia: f?.referencia ?? null,
        }))
      : [];
  return { fontes, regrasAnexos: lista(linha["regras_anexos"]) };
}
