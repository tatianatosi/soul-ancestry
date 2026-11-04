import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { CaCard } from "@/components/ui/ca-card";
import { Button } from "@/components/ui/button";
import { STATUS_INTEGRACAO } from "@/lib/integracoes.server";
import { atualizarPerfilAgenteMcp, cadastrarAgenteMcp, listarIntegracoes } from "@/lib/integracoes.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

const inputCls = "w-full rounded-lg border border-navy/15 bg-cream/40 px-3 py-2 text-sm";
const dataBr = (v: string) => new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Painel de agentes (MCP): cadastro, perfil e histórico de visitas — mesma leitura do Centro de Integrações. */
export function AgentesMcp() {
  const qc = useQueryClient();
  const carregar = useServerFn(listarIntegracoes);
  const cadastrar = useServerFn(cadastrarAgenteMcp);
  const atualizar = useServerFn(atualizarPerfilAgenteMcp);
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["integracoes"], queryFn: () => carregar({}) });

  const [novo, setNovo] = useState({ nome: "", provedor: "", descricao: "" });
  const [sel, setSel] = useState<string | null>(null);
  const [perfil, setPerfil] = useState({ nome: "", provedor: "", descricao: "", ownerUserId: "" });

  const agentes = ((data?.integracoes ?? []) as any[]).filter((i) => i.categoria === "agente_mcp");
  const atual = agentes.find((a) => a.id === sel) ?? null;
  const visitas = ((data?.execucoes ?? []) as any[]).filter((r) => r.integration_id === sel);
  const pode = Boolean(data?.podeConfigurar);

  const mNovo = useMutation({
    mutationFn: () => cadastrar({ data: novo }),
    onSuccess: async (r) => {
      toast.success("Agente cadastrado, desligado e em modo simulado.");
      setNovo({ nome: "", provedor: "", descricao: "" });
      await qc.invalidateQueries({ queryKey: ["integracoes"] });
      abrir(r.id);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao cadastrar."),
  });
  const mPerfil = useMutation({
    mutationFn: () => atualizar({ data: { id: sel as string, ...perfil } }),
    onSuccess: async () => {
      toast.success("Perfil salvo.");
      await qc.invalidateQueries({ queryKey: ["integracoes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar."),
  });

  function abrir(id: string) {
    const a = ((data?.integracoes ?? []) as any[]).find((i) => i.id === id);
    setSel(id);
    setPerfil({ nome: a?.nome ?? "", provedor: a?.provedor ?? "", descricao: a?.descricao ?? "", ownerUserId: a?.owner_user_id ?? "" });
  }

  return (
    <CaCard titulo="Agentes (MCP)">
      <div className="space-y-4" data-agentes-mcp>
        <p className="text-xs text-navy/70">
          Assistentes externos autorizados a consultar o Clube Ancestral. Todo cadastro nasce desligado e em modo simulado:
          cadastrar não conecta nenhum agente nem libera dados.
        </p>
        {isLoading ? <p className="text-sm text-navy/60">Carregando agentes…</p> : null}
        {isError ? (
          <p className="text-sm text-terracotta">
            {error instanceof Error ? error.message : "Falha ao carregar os agentes."}{" "}
            <button className="underline" onClick={() => refetch()}>Tentar novamente</button>
          </p>
        ) : null}

        {!isLoading && !isError ? (
          agentes.length ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {agentes.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => abrir(a.id)}
                    className={`w-full rounded-lg border p-3 text-left text-sm ${sel === a.id ? "border-gold bg-gold/10" : "border-navy/15 bg-white"}`}
                  >
                    <span className="font-medium text-navy">{a.nome}</span>
                    <span className="block text-xs text-navy/60">
                      {a.provedor || "Provedor não registrado"} · {STATUS_INTEGRACAO[a.status] ?? a.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy/60">Nenhum agente cadastrado.</p>
          )
        ) : null}

        {pode ? (
          <div className="grid gap-2 rounded-lg border border-navy/10 p-3 sm:grid-cols-3">
            <input className={inputCls} aria-label="Nome do agente" placeholder="Nome do agente" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            <input className={inputCls} aria-label="Provedor" placeholder="Provedor (ex.: Claude, ChatGPT)" value={novo.provedor} onChange={(e) => setNovo({ ...novo, provedor: e.target.value })} />
            <input className={inputCls} aria-label="Finalidade" placeholder="Finalidade" value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} />
            <Button className="sm:col-span-3" disabled={novo.nome.trim().length < 2 || mNovo.isPending} onClick={() => mNovo.mutate()}>
              Cadastrar agente (desligado)
            </Button>
          </div>
        ) : (
          <p className="text-xs text-navy/60">Somente admin ou operações cadastram e editam agentes.</p>
        )}

        {atual ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2" data-agente-perfil>
              <h3 className="font-serif text-lg text-navy">Perfil</h3>
              <input className={inputCls} aria-label="Nome no perfil" value={perfil.nome} disabled={!pode} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} />
              <input className={inputCls} aria-label="Provedor no perfil" placeholder="Provedor" value={perfil.provedor} disabled={!pode} onChange={(e) => setPerfil({ ...perfil, provedor: e.target.value })} />
              <textarea className={inputCls} aria-label="Finalidade no perfil" placeholder="Finalidade" rows={3} value={perfil.descricao} disabled={!pode} onChange={(e) => setPerfil({ ...perfil, descricao: e.target.value })} />
              <select className={inputCls} aria-label="Responsável interno" value={perfil.ownerUserId} disabled={!pode} onChange={(e) => setPerfil({ ...perfil, ownerUserId: e.target.value })}>
                <option value="">Responsável não definido</option>
                {((data?.equipe ?? []) as any[]).map((m) => (
                  <option key={m.auth_user_id} value={m.auth_user_id}>{m.nome || m.email}</option>
                ))}
              </select>
              <p className="text-xs text-navy/60">
                Situação: {STATUS_INTEGRACAO[atual.status] ?? atual.status} · cadastrado em {dataBr(atual.created_at)}
              </p>
              {pode ? (
                <Button variant="outline" disabled={mPerfil.isPending} onClick={() => mPerfil.mutate()}>Salvar perfil</Button>
              ) : null}
            </div>
            <div className="space-y-2" data-agente-visitas>
              <h3 className="font-serif text-lg text-navy">Histórico de visitas</h3>
              {visitas.length ? (
                <ul className="divide-y divide-navy/10 text-sm">
                  {visitas.map((v) => (
                    <li key={v.id} className="py-2">
                      <span className="text-navy">{v.operacao}</span>{" "}
                      <span className="text-xs text-navy/60">· {v.resultado} · {v.ambiente} · {dataBr(v.created_at)}</span>
                      {v.mensagem ? <p className="text-xs text-navy/60">{v.mensagem}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-navy/60">Nenhuma visita registrada. O agente ainda não acessou o sistema.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </CaCard>
  );
}
