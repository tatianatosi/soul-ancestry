/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { inputCls } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { CONFLITO_PAIS_ROTA } from "@/lib/coerencia-caso";
import { corrigirParametroPlanejador } from "@/lib/contrato-parametros.functions";

/**
 * Conflito crítico de coerência (código canônico x país/rota) com correção
 * humana rastreável: valor anterior, novo valor, justificativa, responsável,
 * data/hora e nova versão de homologação do Planejador.
 */
export function ConflitoCoerencia({
  coerencia,
  valorPaisRota,
  aoCorrigir,
}: {
  coerencia: { qualificador: { sigla: string; pais: string } | null; conflitos: any[] };
  valorPaisRota: any | null;
  aoCorrigir: () => void;
}) {
  const corrigir = useServerFn(corrigirParametroPlanejador);
  const [novoValor, setNovoValor] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [versao, setVersao] = useState("");

  const m = useMutation({
    mutationFn: () =>
      corrigir({
        data: {
          valorId: valorPaisRota?.id as string,
          valorAnterior: String(valorPaisRota?.valor ?? ""),
          novoValor,
          justificativa,
          versaoHomologacao: versao,
        },
      }),
    onSuccess: () => {
      toast.success("Correção homologada registrada. Reexecute a pré-carga.");
      setNovoValor("");
      setJustificativa("");
      setVersao("");
      aoCorrigir();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!coerencia?.conflitos?.length) return null;

  return (
    <CaCard variante="compacto" titulo={`Conflito crítico — ${CONFLITO_PAIS_ROTA}`}>
      <div className="rounded-lg border-2 border-terracotta bg-terracotta/5 p-3">
        <ul className="space-y-1 text-sm text-terracotta">
          {coerencia.conflitos.map((c: any, i: number) => (
            <li key={`${c.fonte}-${i}`}>{c.mensagem}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-navy/70">
          Bloqueados enquanto o conflito existir: prévia final, solicitação de revisão humana, assinatura, financeiro, abertura de
          pesquisa externa e qualquer projeção cliente-facing baseada neste parâmetro. Nenhum valor é substituído automaticamente.
        </p>
      </div>

      {valorPaisRota ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-navy/70">
            Valor anterior registrado: <strong>{valorPaisRota.valor || "vazio"}</strong> (origem {valorPaisRota.origem ?? "—"})
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className={inputCls}
              value={novoValor}
              maxLength={4000}
              onChange={(e) => setNovoValor(e.target.value)}
              placeholder={`Novo país/rota homologado (${coerencia.qualificador?.pais ?? "país do código"})`}
            />
            <input
              className={inputCls}
              value={versao}
              maxLength={120}
              onChange={(e) => setVersao(e.target.value)}
              placeholder="Nova versão/identificador de homologação do Planejador"
            />
          </div>
          <input
            className={inputCls}
            value={justificativa}
            maxLength={500}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Justificativa da correção (opcional)"
          />
          <button
            onClick={() => m.mutate()}
            disabled={m.isPending || !novoValor || !versao}
            className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
          >
            Registrar correção homologada
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-navy/70">Parâmetro país/rota ainda não existe na ficha: pré-carregue antes de corrigir.</p>
      )}
    </CaCard>
  );
}
