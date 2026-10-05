/**
 * Registro de consentimentos da organização (Corte F, 05/10/2026).
 *
 * Medido antes de montar: o bloco de consentimentos **por caso** já existia,
 * dentro de `painelPrivacidade` (/privacidade/$id). O que faltava era a visão da
 * organização: `listarConsentimentos`, que sem filtro devolve todo o registro,
 * não tinha chamador nenhum — a equipe não conseguia conferir, num lugar só, o
 * que foi consentido, por quem, com que texto e por qual canal.
 *
 * Por isso este painel vive no índice, não na tela do caso: não duplica a
 * leitura que o caso já faz. Somente leitura: nada é coletado, revogado ou
 * enviado aqui — registrar e revogar continuam na tela do caso.
 */

import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoDados } from "@/components/saas/estado-dados";
import { Selo } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { listarConsentimentos } from "@/lib/documentos.functions";
import { METODOS_COLETA, TIPOS_CONSENTIMENTO } from "@/lib/documentos.server";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

function dataHora(v?: string | null): string {
  return v ? new Date(v).toLocaleString("pt-BR") : "—";
}

export function RegistroConsentimentos({
  nomePorCliente,
  codigoPorCaso,
}: {
  nomePorCliente: Record<string, string>;
  codigoPorCaso: Record<string, string>;
}) {
  const carregar = useServerFn(listarConsentimentos);
  const q = useQuery({ queryKey: ["consentimentos", "organizacao"], queryFn: () => carregar({ data: {} }) });

  const linhas = (q.data ?? []) as Linha[];
  const ativos = linhas.filter((c) => c["status"] !== "revogado" && !c["revogado_em"]).length;

  return (
    <CaCard
      variante="compacto"
      titulo="Consentimentos registrados na organização"
      data-registro-consentimentos
    >
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={linhas}
        aoTentarNovamente={() => void q.refetch()}
        recurso="os consentimentos"
        vazio="Nenhum consentimento registrado nesta organização. Registrar é feito na tela do caso."
      >
        {(dados) => (
          <div className="space-y-2">
            <p className="text-xs text-navy/60">
              {dados.length} registro(s) · {ativos} em vigor ·{" "}
              {dados.length - ativos} revogado(s). Coletar e revogar continuam na tela do caso.
            </p>
            {(dados as Linha[]).map((c) => {
              const revogado = c["status"] === "revogado" || Boolean(c["revogado_em"]);
              const casoId = c["case_id"] ? String(c["case_id"]) : null;
              return (
                <div
                  key={String(c["id"])}
                  className={
                    revogado
                      ? "rounded-xl border border-terracotta/40 bg-terracotta/5 p-3"
                      : "rounded-xl border border-gold/60 bg-gold/10 p-3"
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">
                      {TIPOS_CONSENTIMENTO[c["tipo_consentimento"]] ?? c["tipo_consentimento"] ?? "—"}
                    </strong>
                    <Selo texto={String(c["status"] ?? "—")} tom={revogado ? "erro" : "ok"} />
                    {c["versao_texto"] ? <Selo texto={`Texto ${c["versao_texto"]}`} /> : null}
                  </div>
                  <p className="mt-1 text-xs text-navy/70">
                    {c["client_id"] ? (nomePorCliente[String(c["client_id"])] ?? "cliente não identificado") : "sem cliente vinculado"}
                    {casoId ? (
                      <>
                        {" · "}
                        <Link
                          to="/privacidade/$id"
                          params={{ id: casoId }}
                          className="font-medium text-navy underline underline-offset-2"
                        >
                          {codigoPorCaso[casoId] ?? "abrir caso"}
                        </Link>
                      </>
                    ) : null}
                  </p>
                  <p className="text-xs text-navy/60">
                    Coletado em {dataHora(c["coletado_em"])} · método:{" "}
                    {METODOS_COLETA[c["metodo_coleta"]] ?? c["metodo_coleta"] ?? "não informado"} · evidência:{" "}
                    {c["evidencia_consentimento"] ?? "—"}
                  </p>
                  {revogado ? (
                    <p className="mt-1 text-xs text-terracotta">
                      Revogado em {dataHora(c["revogado_em"])} · motivo: {c["revogacao_motivo"] ?? "—"}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </EstadoDados>
    </CaCard>
  );
}
