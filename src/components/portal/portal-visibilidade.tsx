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

/** Escopo conservador enquanto a leitura não retorna: nada é presumido. */
const ESCOPO_INDEFINIDO: EscopoCliente = {
  temAcesso: false,
  entregasLiberadas: 0,
  fase1Contratada: false,
  fase1Status: "nao_prevista",
  escopoIncluiFase2: false,
  fase2Status: "nao_aplicavel",
};

export function useEscopoPortal() {
  const carregar = useServerFn(escopoDoPortal);
  return useQuery({ queryKey: ["portal-escopo"], queryFn: () => carregar({}) });
}

/** Estado de visibilidade de uma tela do spec CA-UX-01.2. */
export function useVisibilidade(tela: TelaApp): { visibilidade: ResultadoVisibilidade; carregando: boolean } {
  const { data, isLoading } = useEscopoPortal();
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

  return (
    <section className={TIPO_CLIENTE.cartao} aria-live="polite">
      <span className="inline-flex rounded-full border border-navy/15 bg-cream px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-navy/80">
        {COPY_ESTADO_TITULO[estado]}
      </span>
      <p className={`mt-3 ${TIPO_CLIENTE.corpo}`}>{COPY_ESTADO_TEXTO[estado]}</p>
      {mostraConteudo && children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
