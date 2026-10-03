/**
 * Marcos jurídicos por país — promoção país a país, dentro do centro de
 * inteligência de fontes (03/10/2026).
 *
 * Autorização: "promova os 43 marcos juridicos" + a varredura de hoje
 * ("você vai encontrar uma base bem rica de material já por países... na
 * premissa de centro de inteligência"). O painel mora junto do catálogo de
 * fontes porque é a mesma pergunta operacional: para este país, qual é a
 * base de pesquisa e qual é o marco jurídico — com endereço oficial.
 *
 * A tela nunca promove em massa: um país por vez, com responsável. País sem
 * fonte oficial documentada aparece com a pendência escrita, não com botão
 * desabilitado sem explicação.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { painelMarcosJuridicos, promoverMarcosDoPais, type PaisDoPainel } from "@/lib/marcos-juridicos.functions";

export function MarcosJuridicosPorPais() {
  const carregar = useServerFn(painelMarcosJuridicos);
  const promover = useServerFn(promoverMarcosDoPais);
  const qc = useQueryClient();
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["marcos-juridicos-paises"],
    queryFn: () => carregar({} as never),
  });
  const [responsavel, setResponsavel] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: (pais: string) => promover({ data: { pais, responsavel: responsavel.trim() || undefined } }),
    onSuccess: (r) => {
      toast.success(
        `${r.pais}: ${r.promovidos.length} marco(s) vigente(s)` +
          (r.recusados.length ? ` · ${r.recusados.length} recusado(s) com motivo` : ""),
      );
      void qc.invalidateQueries({ queryKey: ["marcos-juridicos-paises"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-lg border border-navy/10 bg-cream/40 p-4" data-marcos-juridicos-paises>
      <h2 className="font-serif text-base text-navy">Marcos jurídicos por país</h2>
      <p className="mb-3 text-[11px] text-navy/50">
        Promoção país a país, com responsável. Só marco com endereço oficial vira vigente — país habilitado no Planejador
        não é parecer jurídico.
      </p>
      <EstadoDados
        carregando={isPending}
        erro={error}
        dados={data ? [data] : undefined}
        aoTentarNovamente={() => void refetch()}
        recurso="os marcos jurídicos por país"
      >
        {([painel]) => (
          <div className="space-y-3">
            <p className="text-[11px] text-navy/60">
              {painel.total} marcos · {painel.totalComFonte} com fonte oficial · {painel.totalVigentes} vigentes. Fontes
              oficiais vêm de <code className="text-[10px]">{painel.documentoDeReferencias}</code>.
            </p>
            <label className="block text-[10px] uppercase tracking-wide text-navy/50">
              Responsável pela revisão
              <input
                className="w-full rounded border border-navy/15 px-2 py-1 text-[11px]"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder={painel.responsavelPadrao}
              />
            </label>

            {painel.paises.map((p: PaisDoPainel) => (
              <div key={p.pais} className="rounded border border-navy/10 bg-white/60 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-navy">{p.pais}</p>
                  <p className="text-[10px] uppercase tracking-wide text-navy/40">
                    {p.marcos.length} marco(s) · {p.comFonte} com fonte · {p.vigentes} vigente(s)
                  </p>
                </div>
                {p.promoveis > 0 ? (
                  <div className="mt-2">
                    <AcaoOperacional
                      rotulo={`Promover ${p.promoveis} marco(s) de ${p.pais}`}
                      capacidade="avancar_pesquisa_evidencia_microentrega"
                      efeito={`Grava status vigente e ciclo homologado nos marcos de ${p.pais}, aplicando o endereço oficial documentado quando o marco ainda não tem fonte. Registra responsável, data e auditoria.`}
                      onConfirmar={() => m.mutate(p.pais)}
                    />
                  </div>
                ) : null}
                {!p.fonteDocumentada && p.comFonte === 0 ? (
                  <p className="mt-2 text-[11px] text-terracotta">
                    Sem fonte oficial documentada no repositório para {p.pais}. A promoção fica pendente da sua indicação da
                    autoridade — nenhum endereço é inventado aqui.
                  </p>
                ) : null}
                <button
                  type="button"
                  className="mt-2 text-[10px] uppercase tracking-wide text-navy/40 underline decoration-gold"
                  onClick={() => setAberto((a) => (a === p.pais ? null : p.pais))}
                >
                  {aberto === p.pais ? "Ocultar marcos" : "Ver marcos"}
                </button>
                {aberto === p.pais ? (
                  <ul className="mt-2 space-y-2">
                    {p.marcos.map((mk) => (
                      <li key={mk.id} className="border-l-2 border-gold/50 pl-2 text-[11px] text-navy/70">
                        <p className="text-navy">{mk.label}</p>
                        <p className="text-[10px] text-navy/50">
                          {mk.tipo} · {mk.status} · {mk.lifecycle}
                          {mk.verificadoEm ? ` · verificado em ${mk.verificadoEm.slice(0, 10)}` : ""}
                        </p>
                        {mk.fonteUrl ? (
                          <p className="break-all text-[10px] text-navy/50">
                            Fonte oficial: {mk.autoridade ? `${mk.autoridade} — ` : ""}
                            {mk.fonteUrl}
                          </p>
                        ) : mk.fonteDocumentada ? (
                          <p className="break-all text-[10px] text-navy/50">
                            Fonte a aplicar na promoção: {mk.autoridade} — {mk.fonteDocumentada}
                          </p>
                        ) : null}
                        {mk.motivoRecusa ? <p className="text-[10px] text-terracotta">{mk.motivoRecusa}</p> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}

            {painel.paisesSemFonteDocumentada.length > 0 ? (
              <p className="text-[11px] text-navy/50">
                Pendência declarada — países com marco no banco e sem fonte oficial em nenhum documento do repositório:{" "}
                {painel.paisesSemFonteDocumentada.join(" · ")}.
              </p>
            ) : null}
          </div>
        )}
      </EstadoDados>
    </section>
  );
}
