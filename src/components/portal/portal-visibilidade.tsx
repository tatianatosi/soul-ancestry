import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";

import {
  visibilidadeTela,
  type EscopoCliente,
  type ResultadoVisibilidade,
  type TelaApp,
} from "@/lib/app-visibilidade";
import { escopoDoPortal } from "@/lib/portal-jornada.functions";
import { TIPO_CLIENTE } from "@/lib/marca";
import { COPY_ESTADO_TEXTO, COPY_ESTADO_TITULO } from "@/lib/portal-copy";
import { usePreviaPortal, useFontePortal } from "@/components/portal/fonte-portal";

/** Escopo conservador enquanto a leitura não retorna: nada é presumido. */
const ESCOPO_INDEFINIDO: EscopoCliente = {
  temAcesso: false,
  entregasLiberadas: 0,
  fase1Contratada: false,
  fase1Status: "nao_prevista",
  escopoIncluiFase2: false,
  fase2Status: "nao_aplicavel",
};

/**
 * Prévia no Desk: a sessão de staff não é cliente. Sem isto, Jornada / Radar /
 * Árvore / Legado / Conta ficam em "Carregando" para sempre (escopoDoPortal
 * exige portal autenticado).
 */
const ESCOPO_PREVIA: EscopoCliente = {
  temAcesso: true,
  entregasLiberadas: 0,
  fase1Contratada: true,
  fase1Status: "em_preparacao",
  escopoIncluiFase2: false,
  fase2Status: "nao_aplicavel",
};

export function useEscopoPortal() {
  const previa = usePreviaPortal();
  const carregar = useServerFn(escopoDoPortal);
  return useQuery({
    queryKey: ["portal-escopo"],
    queryFn: () => carregar({}),
    enabled: previa === null,
  });
}

/** Estado de visibilidade de uma tela do spec CA-UX-01.2. */
export function useVisibilidade(tela: TelaApp): { visibilidade: ResultadoVisibilidade; carregando: boolean } {
  const fonte = useFontePortal();
  const previa = usePreviaPortal();
  const { data, isLoading } = useEscopoPortal();
  if (previa) {
    return {
      visibilidade: visibilidadeTela(tela, fonte?.escopo ?? ESCOPO_PREVIA),
      carregando: false,
    };
  }
  return {
    visibilidade: visibilidadeTela(tela, data ?? ESCOPO_INDEFINIDO),
    carregando: isLoading,
  };
}

export function BlocoVisibilidade({
  visibilidade,
  children,
}: {
  visibilidade: ResultadoVisibilidade;
  children?: ReactNode;
}) {
  const estado = visibilidade.estado;
  const mostraConteudo = estado === "always_available" || estado === "released";

  // Conteúdo liberado: sem cartão/pill repetido — o mockup já carda por seção.
  if (mostraConteudo) {
    return (
      <div aria-live="polite" data-visibilidade={estado}>
        {children}
      </div>
    );
  }

  return (
    <section className={TIPO_CLIENTE.cartao} aria-live="polite" data-visibilidade={estado}>
      <span className="inline-flex rounded-full border border-navy/15 bg-cream px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-navy/80">
        {COPY_ESTADO_TITULO[estado]}
      </span>
      <p className={`mt-3 ${TIPO_CLIENTE.corpo}`}>{COPY_ESTADO_TEXTO[estado]}</p>
    </section>
  );
}

