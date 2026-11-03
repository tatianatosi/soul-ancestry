import { formatarValor } from "@/lib/assinatura-app";
import type {
  CondicaoComercialCliente,
  EtapaCliente,
  MarcoHistoricoCliente,
} from "@/lib/portal-dados-vivos";

/**
 * Experiência integral do App Cliente, montada POR CASO a partir da leitura viva (01/11/2026).
 *
 * Substitui a versão anterior, que guardava árvore, documentos, radar, contrato e responsáveis
 * escritos no código (pessoas, datas e valores de uma família específica, parte deles inventados).
 * Regra do produto: nada inferido, ausência é explícita. Esta função só reorganiza o que
 * `dadosVivosDoPortal` já entregou, já sanitizado; o que não veio aparece como "Não registrado".
 */

export const NAO_REGISTRADO = "Não registrado";

/** Subconjunto do retorno de `dadosVivosDoPortal` que esta experiência usa. */
export type DadosVivosDoCaso = {
  casoAtivoId: string | null;
  etapa: EtapaCliente | null;
  proximaEntrega: { data: string; texto: string } | null;
  documentos: { id?: string; titulo?: string | null; liberado_cliente?: boolean | null; liberado_em?: string | null }[];
  historico: MarcoHistoricoCliente[];
  condicaoComercial: CondicaoComercialCliente | null;
};

export type BlocoEstado = "completo" | "vazio";

export type ExperienciaIntegralDoCaso = {
  casoId: string | null;
  etapa: { rotulo: string; posicao: number; total: number } | null;
  proximaEntrega: { data: string; texto: string } | null;
  documentosLiberados: { id: string; titulo: string; liberadoEm: string | null }[];
  historico: MarcoHistoricoCliente[];
  condicao: {
    responsaveis: number;
    mensal: string;
    meses: number;
    porResponsavel: string;
    total: string;
  } | null;
  /** O que não veio do caso, em texto de cliente. Nunca preenchido por dedução. */
  ausencias: string[];
  estado: BlocoEstado;
};

export function experienciaIntegralDoCaso(dados: DadosVivosDoCaso | null | undefined): ExperienciaIntegralDoCaso {
  const d = dados ?? null;
  const documentosLiberados = (d?.documentos ?? [])
    .filter((x) => x.liberado_cliente === true && x.id && x.titulo?.trim())
    .map((x) => ({ id: String(x.id), titulo: String(x.titulo).trim(), liberadoEm: x.liberado_em ?? null }));
  const c = d?.condicaoComercial ?? null;
  const condicao = c
    ? {
        responsaveis: c.assinaturas,
        mensal: formatarValor(c.mensalCentavos),
        meses: c.meses,
        porResponsavel: formatarValor(c.adultoCentavos),
        total: formatarValor(c.totalCentavos),
      }
    : null;

  const ausencias: string[] = [];
  if (!d?.casoAtivoId) ausencias.push(`Caso: ${NAO_REGISTRADO}`);
  if (!d?.etapa) ausencias.push(`Etapa da jornada: ${NAO_REGISTRADO}`);
  if (!d?.proximaEntrega) ausencias.push(`Próxima entrega: ${NAO_REGISTRADO}`);
  if (documentosLiberados.length === 0) ausencias.push("Documentos: nenhum liberado até agora");
  if (!d?.historico?.length) ausencias.push("Histórico aprovado para a família: nenhum marco até agora");
  if (!condicao) ausencias.push(`Condição comercial: ${NAO_REGISTRADO}`);

  return {
    casoId: d?.casoAtivoId ?? null,
    etapa: d?.etapa ? { rotulo: d.etapa.rotulo, posicao: d.etapa.posicao, total: d.etapa.total } : null,
    proximaEntrega: d?.proximaEntrega ?? null,
    documentosLiberados,
    historico: d?.historico ?? [],
    condicao,
    ausencias,
    estado: ausencias.length >= 6 ? "vazio" : "completo",
  };
}
