/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selo, inputCls } from "@/components/comercial/base";
import { ORIGENS_PARAM } from "@/lib/contrato-parametros.server";
import { definirStatusParametro, salvarParametro } from "@/lib/contrato-parametros.functions";

export const ROTULO_ORIGEM: Record<string, string> = {
  planejador: "Planejador homologado",
  crm: "CRM",

  proposta: "Proposta",
  formulario: "Formulário",
  whatsapp: "WhatsApp",
  transcricao: "Transcrição",
  documento: "Documento",
  preenchimento_humano: "Preenchimento humano",
  calculo_aprovado: "Cálculo aprovado",
};

/** Linha única de parâmetro contratual: valor, origem, situação e confirmação humana. */
export function LinhaParametro({ valor, aoMudar }: { valor: any; aoMudar: () => void }) {
  const salvar = useServerFn(salvarParametro);
  const definir = useServerFn(definirStatusParametro);
  const [texto, setTexto] = useState((valor.valor as string) ?? "");
  const [origem, setOrigem] = useState((valor.origem as string) ?? "preenchimento_humano");
  const [detalhe, setDetalhe] = useState((valor.origem_detalhe as string) ?? "");
  const [justificativa, setJustificativa] = useState("");

  const mSalvar = useMutation({
    mutationFn: () => salvar({ data: { id: valor.id, valor: texto, origem, origemDetalhe: detalhe, justificativa } }),
    onSuccess: () => {
      toast.success("Parâmetro registrado com origem.");
      aoMudar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mStatus = useMutation({
    mutationFn: (status: "validado" | "bloqueado" | "importado_a_confirmar") =>
      definir({ data: { id: valor.id, status, justificativa } }),
    onSuccess: () => {
      toast.success("Situação atualizada.");
      aoMudar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const tom = valor.status === "validado" ? "ok" : valor.status === "vazio" ? "erro" : "alerta";
  const conflitos = (valor.conflito ?? []) as any[];

  return (
    <div className="rounded-lg border border-navy/15 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-navy">
          {valor.label} {valor.obrigatorio && <span className="text-terracotta">*</span>}
        </p>
        <div className="flex items-center gap-2">
          {valor.origem && <Selo texto={ROTULO_ORIGEM[valor.origem] ?? valor.origem} tom="neutro" />}
          <Selo texto={valor.status} tom={tom as any} />
        </div>
      </div>
      {conflitos.length > 0 && (
        <p className="mt-1 text-xs text-terracotta">
          Conflito entre origens: {conflitos.map((c) => `${ROTULO_ORIGEM[c.origem] ?? c.origem}: ${c.valor}`).join(" · ")}
        </p>
      )}
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        <input
          className={inputCls}
          value={texto}
          maxLength={4000}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Vazio enquanto não houver dado real"
        />
        <select className={inputCls} value={origem} onChange={(e) => setOrigem(e.target.value)}>
          {ORIGENS_PARAM.map((o) => (
            <option key={o} value={o}>
              {ROTULO_ORIGEM[o]}
            </option>
          ))}
        </select>
        <input
          className={inputCls}
          value={detalhe}
          maxLength={300}
          onChange={(e) => setDetalhe(e.target.value)}
          placeholder="Referência da origem"
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          className={`${inputCls} md:w-1/2`}
          value={justificativa}
          maxLength={500}
          onChange={(e) => setJustificativa(e.target.value)}
          placeholder="Justificativa (para substituição ou bloqueio)"
        />
        <button onClick={() => mSalvar.mutate()} disabled={mSalvar.isPending} className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream">
          Salvar
        </button>
        <button
          onClick={() => mStatus.mutate("validado")}
          disabled={mStatus.isPending || !valor.valor}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50"
        >
          Confirmar
        </button>
        <button
          onClick={() => mStatus.mutate("bloqueado")}
          disabled={mStatus.isPending}
          className="rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs text-terracotta"
        >
          Bloquear
        </button>
      </div>
    </div>
  );
}
