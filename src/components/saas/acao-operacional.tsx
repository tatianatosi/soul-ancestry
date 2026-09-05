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

import { useState, type ReactNode } from "react";

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
  efeito,
  onConfirmar,
  children,
  ...props
}: AcaoOperacionalProps) {
  const autoridade = useAutoridade();
  const decisao = autoridade.decidir({ capacidade, acaoExterna, pendenciaGate });
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [executando, setExecutando] = useState(false);

  const motivoInsuficiente = decisao.exigeMotivo && motivo.trim().length < MOTIVO_MINIMO;

  async function executar(texto: string) {
    setExecutando(true);
    try {
      await onConfirmar(texto);
      setAberto(false);
      setMotivo("");
    } finally {
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
                Motivo da decisão (mínimo {MOTIVO_MINIMO} caracteres)
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
