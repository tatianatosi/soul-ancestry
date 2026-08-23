"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  MOTIVO_MINIMO_LOTE,
  ROTULO_ESTADO_INTERNO,
  TEXTO_CHECKBOX_LOTE,
  itensLoteS01aS05,
  montarLote,
} from "@/lib/lote-aprovacoes";
import { ROTULO_GRUPO_APROVACAO, ROTULO_REVERSIBILIDADE } from "@/lib/varredura-administracao";
import { registrarDecisaoProprietaria } from "@/lib/modo-proprietaria.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Resultado = { id: string; ok: boolean; detalhe: string };

export function LoteAprovacoesS01aS05() {
  const registrar = useServerFn(registrarDecisaoProprietaria);
  const itens = itensLoteS01aS05();

  const [aberta, setAberta] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>(itens.map((i) => i.id));
  const [motivo, setMotivo] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  const alternar = (id: string) =>
    setSelecionados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));

  const m = useMutation({
    mutationFn: async () => {
      const lote = montarLote({ selecionados, motivo, checkboxConfirmado: confirmado });
      if (!lote.valido) {
        setErros(lote.erros);
        return [] as Resultado[];
      }
      setErros([]);
      const saida: Resultado[] = [];
      for (const { item, decisao } of lote.decisoes) {
        try {
          await registrar({ data: decisao });
          saida.push({
            id: item.id,
            ok: true,
            detalhe: `${item.origem_id} · ${ROTULO_ESTADO_INTERNO[item.estadoInternoAlvo]}`,
          });
        } catch (e: any) {
          saida.push({
            id: item.id,
            ok: false,
            detalhe: String(e?.message ?? "Não foi possível registrar a decisão."),
          });
        }
      }
      return saida;
    },
    onSuccess: (r) => setResultados(r),
    onError: (e: any) => setErros([String(e?.message ?? "Falha ao registrar o lote.")]),
  });

  const abrir = () => {
    setAberta(true);
    setMotivo("");
    setConfirmado(false);
    setErros([]);
    setResultados([]);
    setSelecionados(itens.map((i) => i.id));
  };

  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-base text-navy">Aprovação em lote — S-01 a S-05</h3>
          <p className="mt-1 max-w-2xl text-xs text-navy/60">
            Uma única janela de confirmação para as cinco primeiras aprovações pendentes. Cada decisão é gravada
            separadamente com autora, motivo, item e estado interno. Itens com efeito externo param em
            “pronto para confirmação externa” e seguem exigindo confirmação final explícita, item a item.
          </p>
        </div>
        <Button onClick={abrir}>Aprovar em lote (S-01 a S-05)</Button>
      </div>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {itens.map((i) => (
          <li key={i.id} className="rounded-lg border border-navy/10 p-3 text-xs text-navy/70">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-navy">{i.id}</span>
              <span className="text-navy/45">({i.origem_id})</span>
              <Badge variant={i.exigeConfirmacaoExterna ? "destructive" : "secondary"}>
                {ROTULO_ESTADO_INTERNO[i.estadoInternoAlvo]}
              </Badge>
            </div>
            <p className="mt-1 text-navy">{i.linha.alvo}</p>
            <p className="mt-1">{ROTULO_GRUPO_APROVACAO[i.linha.grupo]} · {ROTULO_REVERSIBILIDADE[i.linha.reversibilidade]}</p>
          </li>
        ))}
      </ul>

      <Dialog open={aberta} onOpenChange={setAberta}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-navy">Confirmação única do lote S-01 a S-05</DialogTitle>
            <DialogDescription>
              Registra a decisão auditada de cada item selecionado e avança apenas o estado interno.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-navy/70">
            <ul className="space-y-2">
              {itens.map((i) => (
                <li key={i.id} className="flex gap-3 rounded-lg border border-navy/10 p-3">
                  <Checkbox
                    id={`lote-${i.id}`}
                    checked={selecionados.includes(i.id)}
                    onCheckedChange={() => alternar(i.id)}
                    aria-label={`Selecionar ${i.id}`}
                  />
                  <label htmlFor={`lote-${i.id}`} className="flex-1 cursor-pointer text-xs">
                    <span className="font-medium text-navy">
                      {i.id} · {i.linha.alvo}
                    </span>
                    <span className="mt-1 block text-navy/60">Impacto: {i.linha.impacto}</span>
                    <span className="block text-navy/60">Prévia: {i.linha.previa}</span>
                    <span className="mt-1 block text-navy/50">
                      Estado interno após decisão: {ROTULO_ESTADO_INTERNO[i.estadoInternoAlvo]}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <label className="block space-y-1">
              <span className="text-navy/80">Motivo da decisão (mínimo {MOTIVO_MINIMO_LOTE} caracteres)</span>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva a fonte da decisão e por que estas aprovações são assumidas agora."
              />
            </label>

            <div className="flex items-start gap-3 rounded-lg border border-gold/40 bg-cream/40 p-3">
              <Checkbox
                id="lote-confirmacao"
                checked={confirmado}
                onCheckedChange={(v) => setConfirmado(v === true)}
                aria-label="Confirmação obrigatória do lote"
              />
              <label htmlFor="lote-confirmacao" className="cursor-pointer text-xs text-navy/75">
                {TEXTO_CHECKBOX_LOTE}
              </label>
            </div>

            {erros.length > 0 ? (
              <ul className="space-y-1 text-xs text-terracotta">
                {erros.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : null}

            {resultados.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {resultados.map((r) => (
                  <li key={r.id} className={r.ok ? "text-navy/70" : "text-terracotta"}>
                    {r.id}: {r.ok ? "decisão registrada" : "falhou"} — {r.detalhe}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAberta(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => m.mutate()}
              disabled={m.isPending || !confirmado || motivo.trim().length < MOTIVO_MINIMO_LOTE || selecionados.length === 0}
            >
              {m.isPending ? "Registrando decisões…" : `Aprovar ${selecionados.length} item(ns) com auditoria`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
