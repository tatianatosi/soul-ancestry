/**
 * Botão de ação sujeito à autoridade operacional.
 *
 * Comportamento:
 * - decisão `permitir`  → executa direto;
 * - decisão `confirmar` → abre janela com o que vai acontecer, a pendência
 *   preservada e o campo de motivo obrigatório; só então executa;
 * - decisão `bloquear`  → desabilita e mostra o motivo em texto, nunca em
 *   silêncio.
 *
 * Nenhuma tela deve mais desabilitar botão por conta própria com
 * `somenteLeitura` ou gate de domínio: passe a pendência em `pendenciaGate` e
 * deixe a decisão aqui.
 */

import { toast } from "sonner";
import { useRef, useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAutoridade } from "@/components/saas/autoridade";
import { MOTIVO_MINIMO } from "@/lib/modo-proprietaria";
import type { AcaoExterna, Capacidade } from "@/lib/modo-proprietaria";

export type AcaoOperacionalProps = Omit<ButtonProps, "onClick" | "disabled"> & {
  /** Rótulo da ação, usado também no texto da confirmação. */
  rotulo: string;
  /** Capacidade interna exercida. */
  capacidade?: Capacidade;
  /** Ação externa/irreversível, quando for o caso. */
  acaoExterna?: AcaoExterna | string;
  /** Pendência de gate detectada pela tela — não bloqueia a proprietária. */
  pendenciaGate?: string | null;
  /** Validação trivial de formulário (campo obrigatório vazio) — bloqueia
   *  pra todo mundo, sem motivo, sem virar pendência auditada. */
  validacaoFormulario?: string | null;
  /** Descrição do efeito concreto, mostrada na confirmação. */
  efeito?: string;
  /** Executa a ação. Recebe o motivo quando a confirmação o exigir. */
  onConfirmar: (motivo: string) => void | Promise<void>;
  children?: ReactNode;
};

export function AcaoOperacional({
  rotulo,
  capacidade,
  acaoExterna,
  pendenciaGate = null,
  validacaoFormulario = null,
  efeito,
  onConfirmar,
  children,
  ...props
}: AcaoOperacionalProps) {
  const autoridade = useAutoridade();
  const decisao = autoridade.decidir({ capacidade, acaoExterna, pendenciaGate, validacaoFormulario });
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [executando, setExecutando] = useState(false);
  /**
   * Trava de reentrada independente do estado do React.
   *
   * 21/09/2026 — `executando` sozinho não impedia duplo submit quando
   * `onConfirmar` é síncrono (várias telas passam `m.mutate()`, que devolve
   * void): `await undefined` resolve no microtask seguinte, e o par
   * true/false colapsa no mesmo lote de render — o botão nunca chega a ficar
   * desabilitado, e dois cliques rápidos disparam duas escritas. O ref muda
   * na hora, antes de qualquer render, então barra a segunda entrada sem
   * depender de batching.
   */
  const emVoo = useRef(false);

  const motivoInsuficiente = decisao.exigeMotivo && motivo.trim().length < MOTIVO_MINIMO;

  async function executar(texto: string) {
    if (emVoo.current) return;
    emVoo.current = true;
    setExecutando(true);
    try {
      await onConfirmar(texto);
      setAberto(false);
      setMotivo("");
    } catch (e) {
      // Falha de ação nunca fica muda: a pessoa vê o motivo e o erro vai ao coletor.
      toast.error(e instanceof Error ? e.message : "A ação não foi concluída.");
    } finally {
      emVoo.current = false;
      setExecutando(false);
    }
  }

  if (decisao.decisao === "bloquear") {
    return (
      <span className="inline-flex flex-col gap-1">
        <Button {...props} disabled type="button">
          {children ?? rotulo}
        </Button>
        <span className="text-xs text-navy/70" role="status">
          {decisao.motivo}
        </span>
      </span>
    );
  }

  return (
    <>
      <span className="inline-flex flex-col gap-1">
        <Button
          {...props}
          type="button"
          disabled={executando}
          onClick={() => {
            if (decisao.decisao === "permitir") void executar("");
            else setAberto(true);
          }}
        >
          {children ?? rotulo}
        </Button>
        {decisao.porDecisaoDaProprietaria && decisao.pendencia ? (
          <span className="text-xs text-navy/70">Pendência registrada — segue por decisão sua.</span>
        ) : null}
      </span>

      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{rotulo}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                {efeito ? <p>{efeito}</p> : null}
                <p>{decisao.motivo}</p>
                {decisao.pendencia ? (
                  <p className="rounded-md bg-navy/5 p-2 text-xs">
                    Pendência preservada: {decisao.pendencia}
                  </p>
                ) : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {decisao.exigeMotivo ? (
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-navy/60">
                Motivo da decisão
              </label>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                placeholder="Registre por que esta ação está sendo tomada agora."
              />
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={executando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={executando || motivoInsuficiente}
              onClick={(e) => {
                e.preventDefault();
                void executar(motivo.trim());
              }}
            >
              {executando ? "Executando…" : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
