/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selo, inputCls } from "@/components/comercial/base";
import { ORIGENS_PARAM } from "@/lib/contrato-parametros.server";
import { definirStatusParametro, salvarParametro } from "@/lib/contrato-parametros.functions";
import { CAT_ORIGEM, CAT_STATUS_PARAMETRO } from "@/lib/parametros-catalogos";
import { ROTULO_DESTINO, ROTULO_TIPO, definicaoCampo, validarValorCampo } from "@/lib/parametros-dicionario";

export const ROTULO_ORIGEM: Record<string, string> = Object.fromEntries(CAT_ORIGEM.map((o) => [o.valor, o.rotulo]));
const AJUDA_ORIGEM: Record<string, string> = Object.fromEntries(CAT_ORIGEM.map((o) => [o.valor, o.ajuda ?? ""]));
const AJUDA_STATUS: Record<string, string> = Object.fromEntries(CAT_STATUS_PARAMETRO.map((o) => [o.valor, o.ajuda ?? ""]));
const ROTULO_STATUS: Record<string, string> = Object.fromEntries(CAT_STATUS_PARAMETRO.map((o) => [o.valor, o.rotulo]));

/** Linha única de parâmetro contratual: valor, origem, situação e confirmação humana. */
export function LinhaParametro({ valor, aoMudar }: { valor: any; aoMudar: () => void }) {
  const salvar = useServerFn(salvarParametro);
  const definir = useServerFn(definirStatusParametro);
  const def = definicaoCampo(valor.campo);
  const [texto, setTexto] = useState((valor.valor as string) ?? "");
  const [origem, setOrigem] = useState((valor.origem as string) ?? "preenchimento_humano");
  const [detalhe, setDetalhe] = useState((valor.origem_detalhe as string) ?? "");
  const [justificativa, setJustificativa] = useState("");

  const origensPermitidas = def.origens?.length ? def.origens : [...ORIGENS_PARAM];
  const opcoes = def.opcoes ?? [];
  const valorLegado = valor.valor && !opcoes.some((o) => o.valor === valor.valor) ? (valor.valor as string) : null;

  const mSalvar = useMutation({
    mutationFn: () => {
      const check = validarValorCampo({
        campo: valor.campo,
        valor: texto,
        origem,
        justificativa,
        valorAtual: valor.valor,
      });
      if (!check.ok) return Promise.reject(new Error(check.erro));
      return salvar({ data: { id: valor.id, valor: texto, origem, origemDetalhe: detalhe, justificativa } });
    },
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
  const classificatorio = def.tipo === "dropdown" || def.tipo === "multiselect" || def.tipo === "booleano";
  const exigeJustificativa = def.justificativa === "obrigatoria";

  return (
    <div id={`campo-${valor.id}`} className="rounded-lg border border-navy/15 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-navy" title={def.validacao}>
          {valor.label} {valor.obrigatorio && <span className="text-terracotta">*</span>}
        </p>
        <div className="flex items-center gap-2">
          {valor.origem && (
            <span title={AJUDA_ORIGEM[valor.origem]}>
              <Selo texto={ROTULO_ORIGEM[valor.origem] ?? valor.origem} tom="neutro" />
            </span>
          )}
          <span title={AJUDA_STATUS[valor.status] ?? ""}>
            <Selo texto={ROTULO_STATUS[valor.status] ?? valor.status} tom={tom as any} />
          </span>
        </div>
      </div>
      <p className="mt-0.5 text-[11px] text-navy/50">
        {ROTULO_TIPO[def.tipo]} · confiança mínima {def.confiancaMinima} · destino: {def.destinos.map((x) => ROTULO_DESTINO[x]).join(", ")}
        {exigeJustificativa && " · justificativa obrigatória"}
      </p>
      {conflitos.length > 0 && (
        <p className="mt-1 text-xs text-terracotta">
          Conflito entre origens: {conflitos.map((c) => `${ROTULO_ORIGEM[c.origem] ?? c.origem}: ${c.valor}`).join(" · ")}
        </p>
      )}
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        {classificatorio ? (
          <select className={inputCls} value={texto} onChange={(e) => setTexto(e.target.value)} title={def.validacao}>
            <option value="">— selecionar —</option>
            {valorLegado && <option value={valorLegado}>{valorLegado} (valor legado registrado)</option>}
            {opcoes.map((o) => (
              <option key={o.valor} value={o.valor} title={o.ajuda}>
                {o.rotulo}
              </option>
            ))}
          </select>
        ) : def.tipo === "texto_longo" || def.tipo === "pessoa_vinculada" ? (
          <textarea
            className={`${inputCls} md:col-span-2`}
            rows={3}
            value={texto}
            maxLength={4000}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Vazio enquanto não houver dado real"
          />
        ) : (
          <input
            className={inputCls}
            type={def.tipo === "data" ? "date" : "text"}
            inputMode={def.tipo === "monetario" ? "decimal" : undefined}
            value={texto}
            maxLength={4000}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={def.tipo === "monetario" ? "Somente números (ex.: 9600)" : "Vazio enquanto não houver dado real"}
          />
        )}
        <select className={inputCls} value={origem} onChange={(e) => setOrigem(e.target.value)}>
          {origensPermitidas.map((o) => (
            <option key={o} value={o} title={AJUDA_ORIGEM[o]}>
              {ROTULO_ORIGEM[o] ?? o}
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
      {classificatorio && (
        <p className="mt-1 text-[11px] text-navy/50">
          {opcoes.find((o) => o.valor === texto)?.ajuda ?? "Campo de lista controlada: texto livre é rejeitado."}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          className={`${inputCls} md:w-1/2`}
          value={justificativa}
          maxLength={500}
          onChange={(e) => setJustificativa(e.target.value)}
          placeholder={exigeJustificativa ? "Justificativa obrigatória para este campo" : "Justificativa (para substituição ou bloqueio)"}
        />
        <button onClick={() => mSalvar.mutate()} disabled={mSalvar.isPending} className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream">
          Salvar
        </button>
        <button
          onClick={() => mStatus.mutate("validado")}
          disabled={mStatus.isPending || !valor.valor}
          title={AJUDA_STATUS["validado"]}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50"
        >
          Confirmar
        </button>
        <button
          onClick={() => mStatus.mutate("bloqueado")}
          disabled={mStatus.isPending}
          title={AJUDA_STATUS["bloqueado"]}
          className="rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs text-terracotta"
        >
          Bloquear
        </button>
      </div>
    </div>
  );
}
