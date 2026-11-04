import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { atualizarRegistro } from "@/lib/saas.functions";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
  ESTADOS_AUTORIZACAO_PESQUISA,
  rotuloAutorizacaoPesquisa,
  type EstadoAutorizacaoPesquisa,
} from "@/lib/autorizacao-pesquisa";

/**
 * A07 (04/11/2026) — registra a autorização de pesquisa na ficha do caso.
 * Grava pelo escritor genérico do caso (`atualizarRegistro`), que confere a organização, relê a
 * linha gravada e registra quem mudou o quê no histórico do caso.
 */

export function RegistrarAutorizacaoPesquisa({
  casoId,
  estadoAtual,
  onRegistrado,
}: {
  casoId: string;
  estadoAtual: string | null | undefined;
  onRegistrado?: () => void;
}) {
  const atualizar = useServerFn(atualizarRegistro);
  const inicial = (ESTADOS_AUTORIZACAO_PESQUISA.some((e) => e.valor === estadoAtual)
    ? estadoAtual
    : "nao_autorizada") as EstadoAutorizacaoPesquisa;
  const [escolha, setEscolha] = useState<EstadoAutorizacaoPesquisa>(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const alterado = escolha !== inicial;
  useAvisoEdicaoNaoSalva(alterado);

  const registrar = useMutation({
    mutationFn: async () => {
      const r = await atualizar({
        data: { entidade: "crm_casos", id: casoId, dados: { estado_de_autorizacao_pesquisa: escolha } },
      });
      if (r.naoGuardados?.includes("estado_de_autorizacao_pesquisa")) {
        throw new Error("A releitura do caso não confirmou a autorização gravada. Nada foi considerado salvo.");
      }
      return r;
    },
    onSuccess: () => {
      setErro(null);
      toast.success(`Autorização de pesquisa registrada: ${rotuloAutorizacaoPesquisa(escolha)}.`);
      onRegistrado?.();
    },
    onError: (e: Error) => {
      setErro(e.message);
      toast.error("Não foi possível registrar a autorização", { description: e.message });
    },
  });

  return (
    <div className="mt-3 rounded-lg border border-navy/15 bg-cream/60 p-3 text-xs text-navy/80">
      <p className="font-semibold text-navy">Autorização de pesquisa deste caso</p>
      <p className="mt-1">
        Situação registrada: <strong>{rotuloAutorizacaoPesquisa(estadoAtual)}</strong>. O assistente só analisa o
        dossiê depois de uma autorização registrada. Registrar não executa nenhuma pesquisa nem consulta externa.
      </p>
      <label className="mt-2 block">
        <span className="block text-navy/70">Nova situação</span>
        <select
          value={escolha}
          onChange={(e) => setEscolha(e.target.value as EstadoAutorizacaoPesquisa)}
          className="mt-1 min-h-11 w-full rounded-lg border border-navy/20 bg-background px-2 text-sm text-navy"
        >
          {ESTADOS_AUTORIZACAO_PESQUISA.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.rotulo}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => registrar.mutate()}
        disabled={!alterado || registrar.isPending}
        className="mt-2 min-h-11 rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
      >
        {registrar.isPending ? "Registrando…" : "Registrar autorização"}
      </button>
      {erro ? <p className="mt-2 text-terracotta">Nada foi gravado: {erro}</p> : null}
    </div>
  );
}
