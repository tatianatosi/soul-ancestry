/**
 * Compartilhamento de achado entre membros da família (03/10/2026).
 *
 * ## A decisão que estava construída e não ligada
 *
 * Decisão da Proprietária, 09/09/2026: "achado é compartilhável apenas
 * quando sanitizado e autorizado" e "cliente decide se deseja compartilhar o
 * achado". Para cumprir isso foram escritos SEIS server functions — três no
 * Desk (`registrarCompartilhamentoAchado`, `listarCompartilhamentosAchado`,
 * `revogarCompartilhamentoAchado`) e três no App (`autorizar…`, `revogar…`,
 * `meusCompartilhamentos…`) — com RLS própria em `app_projection_shares`.
 *
 * Nenhuma das seis tinha um único chamador. A decisão existia no banco, na
 * RLS e no servidor, e em nenhuma tela: ninguém conseguia compartilhar nada.
 *
 * Este painel liga a ponta do DESK, onde a equipe registra que o titular
 * autorizou (por telefone, presencialmente) — deixando explícito quem
 * autorizou. A ponta do App continua declarada como pendente, porque exige
 * um leitor de membros da família no portal que não existe, e expor ao
 * titular quais parentes existem é decisão de privacidade, não de código.
 *
 * O que NUNCA é compartilhado: o documento original. Só o `content_sanitized`
 * do achado já aprovado ou publicado.
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selecao, Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import {
  listarCompartilhamentosAchado,
  registrarCompartilhamentoAchado,
  revogarCompartilhamentoAchado,
} from "@/lib/biblioteca-evidencias.functions";

type Membro = { clienteId: string; nome: string; papel: string | null };
type Projecao = Record<string, unknown> & { id?: string };

export function CompartilharAchado({
  projecoes,
  membrosDoCaso,
  podeEditar,
}: {
  projecoes: Projecao[];
  membrosDoCaso: Membro[];
  podeEditar: boolean;
}) {
  const listar = useServerFn(listarCompartilhamentosAchado);
  const registrar = useServerFn(registrarCompartilhamentoAchado);
  const revogar = useServerFn(revogarCompartilhamentoAchado);

  const [projecaoId, setProjecaoId] = useState("");

  /*
    `listarCompartilhamentosAchado` recebe `projecaoId`, não `caseId`: a
    autorização é de UM achado para UMA pessoa. Então a lista acompanha o
    achado escolhido, em vez de eu inventar um leitor por caso — era o
    caminho fácil e errado, e criaria uma segunda forma de ler a mesma coisa.
  */
  const q = useQuery({
    queryKey: ["compartilhamentos-achado", projecaoId],
    queryFn: () => listar({ data: { projecaoId } }),
    enabled: Boolean(projecaoId),
    retry: false,
  });
  const [comClienteId, setComClienteId] = useState("");
  const [revogando, setRevogando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");

  const mRegistrar = useMutation({
    mutationFn: () => registrar({ data: { projecaoId, compartilharComClienteId: comClienteId } }),
    onSuccess: () => {
      toast.success("Autorização do titular registrada.");
      setProjecaoId("");
      setComClienteId("");
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mRevogar = useMutation({
    mutationFn: (id: string) => revogar({ data: { id, motivo } }),
    onSuccess: () => {
      toast.success("Autorização revogada.");
      setRevogando(null);
      setMotivo("");
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Só achado já aprovado/publicado pode ser compartilhado — o servidor
  // recusa o resto, e a tela não oferece o que seria recusado.
  const compartilhaveis = projecoes.filter((p) => {
    const estado = String(p["approval_status"] ?? "");
    return (estado === "approved" || estado === "published") && p["titular_client_id"];
  });

  const lista = (q.data ?? []) as Record<string, unknown>[];
  const nomeDe = (id: unknown) => membrosDoCaso.find((m) => m.clienteId === String(id))?.nome ?? "(pessoa fora deste caso)";
  const tituloDe = (id: unknown) => {
    const p = projecoes.find((x) => String(x.id) === String(id));
    return p ? String(p["content_sanitized"] ?? p.id).slice(0, 70) : "(achado não listado)";
  };

  return (
    <section className="space-y-3 rounded-xl border border-gold/40 bg-gold/5 p-3" data-compartilhar-achado>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Compartilhar achado com a família</h3>
        <span className="text-[11px] text-navy/55">Só o texto sanitizado — nunca o documento original</span>
      </div>

      {q.error ? (
        <p role="alert" className="text-xs text-terracotta">
          Não foi possível carregar os compartilhamentos: {(q.error as Error).message}
        </p>
      ) : null}

      {!projecaoId ? (
        <p className="text-xs text-navy/60">
          Escolha um achado aprovado abaixo para ver e registrar as autorizações dele.
        </p>
      ) : lista.length > 0 ? (
        <ul className="space-y-2 text-xs">
          {lista.map((c) => {
            const id = String(c["id"]);
            const revogado = Boolean(c["revogado_em"]);
            return (
              <li key={id} className="rounded-lg border border-navy/10 bg-white/70 p-2">
                <p className="text-navy/85">{tituloDe(c["projection_id"])}</p>
                <p className="mt-0.5 text-[11px] text-navy/55">
                  com {nomeDe(c["compartilhado_com_client_id"])} · autorizado por{" "}
                  {String(c["autorizado_por"] ?? "—")}
                  {revogado ? ` · revogado em ${String(c["revogado_em"]).slice(0, 10)}` : ""}
                </p>
                {!revogado && podeEditar ? (
                  revogando === id ? (
                    <div className="mt-2 space-y-1.5">
                      <Texto label="Motivo da revogação" valor={motivo} onChange={setMotivo} />
                      <div className="flex gap-2">
                        <AcaoOperacional
                          rotulo={mRevogar.isPending ? "Revogando…" : "Confirmar revogação"}
                          capacidade="editar_rascunho"
                          efeito="Marca a autorização como revogada. Nada é apagado e o achado continua no caso."
                          size="sm"
                          validacaoFormulario={motivo.trim().length >= 5 ? null : "Escreva o motivo (mínimo 5 letras)."}
                          onConfirmar={async () => {
                            await mRevogar.mutateAsync(id);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setRevogando(null);
                            setMotivo("");
                          }}
                          className="rounded-lg border border-navy/20 px-2.5 py-1 text-[11px] text-navy"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRevogando(id)}
                      className="mt-2 rounded-lg border border-navy/20 px-2.5 py-1 text-[11px] text-navy"
                    >
                      Revogar
                    </button>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-navy/60">Este achado ainda não foi compartilhado com ninguém.</p>
      )}

      {podeEditar ? (
        compartilhaveis.length === 0 || membrosDoCaso.length < 2 ? (
          <p className="text-xs text-navy/70">
            Para registrar um compartilhamento é preciso um achado já aprovado com titular definido e ao menos duas
            pessoas do caso com ficha de pessoa vinculada. Hoje: {compartilhaveis.length} achado(s) elegível(is) e{" "}
            {membrosDoCaso.length} pessoa(s) vinculada(s).
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <Selecao
              label="Achado aprovado"
              valor={projecaoId}
              opcoes={compartilhaveis.map((p) => ({
                valor: String(p.id),
                rotulo: String(p["content_sanitized"] ?? p.id).slice(0, 70),
              }))}
              onChange={setProjecaoId}
            />
            <Selecao
              label="Compartilhar com"
              valor={comClienteId}
              opcoes={membrosDoCaso.map((m) => ({
                valor: m.clienteId,
                rotulo: m.papel ? `${m.nome} — ${m.papel}` : m.nome,
              }))}
              onChange={setComClienteId}
            />
            <div className="sm:col-span-2">
              <AcaoOperacional
                rotulo={mRegistrar.isPending ? "Registrando…" : "Registrar autorização do titular"}
                capacidade="editar_rascunho"
                efeito="Registra que o TITULAR autorizou este achado sanitizado para esta pessoa. Nenhuma mensagem é enviada e o documento original nunca é compartilhado."
                size="sm"
                validacaoFormulario={projecaoId && comClienteId ? null : "Escolha o achado e a pessoa."}
                onConfirmar={async () => {
                  await mRegistrar.mutateAsync();
                }}
              />
              <p className="mt-1 text-[11px] text-navy/55">
                A equipe registra em nome do titular (telefone, presencialmente) e fica gravado quem autorizou. O
                titular autorizar pelo próprio App é uma segunda ponta, ainda pendente de decisão sua sobre quais
                parentes o portal pode listar.
              </p>
            </div>
          </div>
        )
      ) : null}
    </section>
  );
}
