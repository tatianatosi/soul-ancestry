/**
 * O titular compartilha um achado com a própria família (03/10/2026).
 *
 * ## A decisão que estava construída e não ligada
 *
 * Decisão da Proprietária de 09/09/2026: "cliente decide se deseja
 * compartilhar o achado". Três server functions do portal
 * (`autorizarCompartilhamentoAchado`, `revogarCompartilhamentoAchadoPortal`,
 * `meusCompartilhamentosDeAchado`) e a RLS de `app_projection_shares`
 * existiam desde então, com zero chamadores: o App nunca mostrou isso.
 *
 * O que faltava não era código, era a regra de escopo. Ela veio em
 * 03/10/2026: "o compartilhamento de achado será compartilhado somente com
 * cada membro que faz parte do mesmo processo e família, e não é necessário
 * leitor pois já temos um anexo no contrato referente a privacidade de
 * dados, como também as premissas estão em https://clubeancestral.com.br/".
 *
 * Por isso a lista de pessoas vem de `portal_membros_do_meu_caso`, que
 * devolve só quem está no MESMO caso do titular, e só id, nome e papel —
 * nunca dado civil. O que se compartilha é o texto já sanitizado do achado,
 * nunca o documento original.
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  autorizarCompartilhamentoAchado,
  membrosDoMeuCaso,
  meusCompartilhamentosDeAchado,
  revogarCompartilhamentoAchadoPortal,
} from "@/lib/portal-cliente.functions";
import type { PublicacaoCliente } from "@/lib/projecoes-cliente";

export function CompartilharAchadoCliente({ achados }: { achados: PublicacaoCliente[] }) {
  const carregarMembros = useServerFn(membrosDoMeuCaso);
  const carregarShares = useServerFn(meusCompartilhamentosDeAchado);
  const autorizar = useServerFn(autorizarCompartilhamentoAchado);
  const revogar = useServerFn(revogarCompartilhamentoAchadoPortal);

  const qMembros = useQuery({ queryKey: ["portal-membros-caso"], queryFn: () => carregarMembros({}), retry: false });
  const qShares = useQuery({ queryKey: ["portal-compartilhamentos"], queryFn: () => carregarShares({}), retry: false });

  const [achadoId, setAchadoId] = useState("");
  const [comQuem, setComQuem] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  const mAutorizar = useMutation({
    mutationFn: () => autorizar({ data: { projecaoId: achadoId, compartilharComClienteId: comQuem } }),
    onSuccess: () => {
      setAviso("Pronto: a pessoa escolhida já pode ver este achado.");
      setAchadoId("");
      setComQuem("");
      void qShares.refetch();
    },
    onError: (e: Error) => setAviso(e.message),
  });
  const mRevogar = useMutation({
    mutationFn: (id: string) => revogar({ data: { id } }),
    onSuccess: () => {
      setAviso("Compartilhamento desfeito.");
      void qShares.refetch();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const membros = qMembros.data ?? [];
  const compartilhamentos = (qShares.data?.compartilhamentos ?? []) as Record<string, unknown>[];
  const ativos = compartilhamentos.filter((c) => !c["revogado_em"]);

  const nomeDoMembro = (id: unknown) => membros.find((m) => m.clienteId === String(id))?.nome ?? "alguém da sua família";
  const tituloDoAchado = (id: unknown) => achados.find((a) => a.id === String(id))?.conteudo ?? "um achado seu";

  // Sem achado publicado ou sem outra pessoa no caso, não há o que oferecer —
  // e o estado vazio diz por quê, em vez de mostrar um seletor vazio.
  const semNada = achados.length === 0 || membros.length === 0;

  return (
    <section className="mt-8 rounded-2xl border border-navy/10 bg-cream/60 p-5" data-compartilhar-achado-cliente>
      <h2 className="font-serif text-xl text-navy">Compartilhar com a família</h2>
      <p className="mt-1 text-sm text-navy/70">
        Você decide o que compartilhar. Só é possível compartilhar com quem faz parte do mesmo processo da sua família, e
        apenas o texto do achado — nunca o documento original.
      </p>

      {qMembros.error || qShares.error ? (
        <p role="alert" className="mt-3 text-sm text-terracotta">
          Não conseguimos carregar seus compartilhamentos agora. Tente novamente em instantes.
        </p>
      ) : null}

      {ativos.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {ativos.map((c) => (
            <li key={String(c["id"])} className="rounded-xl border border-navy/10 bg-white/70 p-3 text-sm">
              <p className="text-navy/85">{String(tituloDoAchado(c["projection_id"])).slice(0, 120)}</p>
              <p className="mt-1 text-xs text-navy/55">
                compartilhado com {nomeDoMembro(c["compartilhado_com_client_id"])}
              </p>
              <button
                type="button"
                disabled={mRevogar.isPending}
                onClick={() => mRevogar.mutate(String(c["id"]))}
                className="mt-2 rounded-lg border border-navy/20 px-3 py-1 text-xs text-navy disabled:opacity-60"
              >
                {mRevogar.isPending ? "Desfazendo…" : "Deixar de compartilhar"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-navy/60">Você ainda não compartilhou nenhum achado.</p>
      )}

      {semNada ? (
        <p className="mt-4 text-sm text-navy/60">
          {achados.length === 0
            ? "Quando houver um achado publicado para você, ele aparece aqui para compartilhar."
            : "No momento não há outra pessoa do seu processo cadastrada para receber um achado."}
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-navy/70">
            Achado
            <select
              value={achadoId}
              onChange={(e) => setAchadoId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy"
            >
              <option value="">Escolha…</option>
              {achados.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.conteudo.slice(0, 70)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-navy/70">
            Com quem
            <select
              value={comQuem}
              onChange={(e) => setComQuem(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy"
            >
              <option value="">Escolha…</option>
              {membros.map((m) => (
                <option key={m.clienteId} value={m.clienteId}>
                  {m.papel ? `${m.nome} — ${m.papel}` : m.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="button"
              disabled={!achadoId || !comQuem || mAutorizar.isPending}
              onClick={() => mAutorizar.mutate()}
              className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
            >
              {mAutorizar.isPending ? "Compartilhando…" : "Compartilhar"}
            </button>
          </div>
        </div>
      )}

      {aviso ? (
        <p role="status" className="mt-3 text-sm text-navy/75">
          {aviso}
        </p>
      ) : null}
    </section>
  );
}
