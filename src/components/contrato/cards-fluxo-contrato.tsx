/**
 * Cards dos 6 marcos do contrato (Prancha V4 / corte L08).
 *
 * Leitura pura e honesta: os marcos são derivados SOMENTE de fatos já
 * persistidos (status do instrumento e existência de versão interna),
 * avaliados pela camada canônica `avaliarFluxoContrato` — a mesma regra
 * testada em `fluxo-contrato-ana.test.ts`. Nada aqui grava, envia, assina
 * ou cobra; é apresentação sobre dados reais.
 *
 * Marcos derivados do status do instrumento:
 * - preparado: existe versão interna (rascunho) do instrumento;
 * - revisado: o instrumento passou da revisão humana
 *   (approved_for_send em diante);
 * - aprovado: approved_for_send, sent ou signed;
 * - enviado: sent ou signed;
 * - assinado: signed;
 * - liberado: nunca inferido — só consta quando houver fato registrado
 *   (hoje não há campo de liberação no instrumento, então permanece
 *   "Não registrado").
 */

import { CheckCircle2, Circle, Lock } from "lucide-react";

import { KitBadge, KitCard } from "@/components/clube-ancestral-kit/base";
import { avaliarFluxoContrato, proximoPassoContrato, type EstadoPasso, type MarcosContrato } from "@/lib/fluxo-contrato";
import type { ContextoGates } from "@/lib/gates-formalizacao";
import { cn } from "@/lib/utils";

/** Gates que a tela não consegue provar ficam como não atendidos (bloqueio honesto). */
const GATES_NAO_COMPROVADOS: ContextoGates = {
  propostaValida: false,
  camposAusentes: [],
  conflitos: [],
  precoOk: false,
  caseServiceOk: false,
  cadastroCompleto: false,
  nucleoValidado: false,
  menorEnvolvido: false,
  representacaoRegistrada: false,
  revisaoJuridicaOk: false,
  contratoOsProntos: false,
  assinaturaRegistrada: false,
  pagamentoConfirmado: false,
  autorizacaoPesquisa: false,
  despesasAplicaveis: false,
  despesasPendentes: [],
};

export function marcosDoStatus(status: string | null | undefined, temVersaoInterna: boolean): MarcosContrato {
  const s = status ?? "draft";
  const passouRevisao = ["approved_for_send", "sent", "signed"].includes(s);
  return {
    preparado: temVersaoInterna,
    revisado: passouRevisao,
    aprovado: passouRevisao,
    enviado: ["sent", "signed"].includes(s),
    assinado: s === "signed",
    liberado: false,
  };
}

const TOM_ESTADO = { concluido: "success", disponivel: "gold", bloqueado: "attention" } as const;
const ROTULO_ESTADO = { concluido: "Concluído", disponivel: "Disponível", bloqueado: "Aguardando" } as const;

export function CardsFluxoContrato({
  status,
  temVersaoInterna,
  gates,
  titulo = "Marcos do contrato",
}: {
  status: string | null | undefined;
  temVersaoInterna: boolean;
  /** Gates reais quando a tela os tem; sem eles, tudo não comprovado. */
  gates?: ContextoGates;
  titulo?: string;
}) {
  const fluxo = avaliarFluxoContrato(gates ?? GATES_NAO_COMPROVADOS, marcosDoStatus(status, temVersaoInterna));
  const proximo = proximoPassoContrato(fluxo);
  return (
    <KitCard
      title={titulo}
      eyebrow="Leitura dos fatos registrados"
      action={proximo ? <KitBadge tone="gold">Próximo: {proximo.rotulo}</KitBadge> : <KitBadge tone="success">Fluxo concluído</KitBadge>}
    >
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {fluxo.map((passo: EstadoPasso, indice: number) => (
          <li
            key={passo.passo}
            className={cn(
              "rounded-lg border p-3",
              passo.estado === "concluido"
                ? "border-sucesso/30 bg-sucesso-suave"
                : passo.estado === "disponivel"
                  ? "border-gold/50 bg-gold/10"
                  : "border-navy/10 bg-cream/40",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-navy">
                {passo.estado === "concluido" ? (
                  <CheckCircle2 className="h-4 w-4 text-sucesso" aria-hidden />
                ) : passo.estado === "disponivel" ? (
                  <Circle className="h-4 w-4 text-gold" aria-hidden />
                ) : (
                  <Lock className="h-4 w-4 text-navy/35" aria-hidden />
                )}
                {indice + 1}. {passo.rotulo}
              </span>
              <span className="shrink-0">
                <KitBadge tone={TOM_ESTADO[passo.estado]}>{ROTULO_ESTADO[passo.estado]}</KitBadge>
              </span>
            </div>
            {passo.motivos.length ? (
              <ul className="mt-2 space-y-1 text-[11px] text-navy/60">
                {passo.motivos.slice(0, 3).map((motivo) => (
                  <li key={motivo}>· {motivo}</li>
                ))}
              </ul>
            ) : null}
            {passo.exigeConfirmacaoHumana ? (
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-terracotta">
                Ato externo — só com confirmação humana
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-navy/55">
        Nenhum marco é automático e nenhum emite cobrança. Enviar, registrar assinatura e liberar são atos
        separados, sempre com confirmação humana explícita.
      </p>
    </KitCard>
  );
}

/** Resumo em linguagem familiar: só repete fatos já registrados; ausências são explícitas. */
export function ResumoFamiliarContrato({
  titulo,
  statusRotulo,
  valorReferencia,
  prazoReferencia,
  proximoPasso,
}: {
  titulo: string;
  statusRotulo: string;
  valorReferencia: string | null;
  prazoReferencia: string | null;
  proximoPasso: string | null;
}) {
  return (
    <KitCard title="Resumo em leitura familiar" eyebrow="O que este instrumento é">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-navy/50">Instrumento</dt>
          <dd className="font-medium text-navy">{titulo}</dd>
        </div>
        <div>
          <dt className="text-navy/50">Situação</dt>
          <dd className="font-medium text-navy">{statusRotulo}</dd>
        </div>
        <div>
          <dt className="text-navy/50">Valor de referência</dt>
          <dd className="font-medium text-navy">{formatarValorReferencia(valorReferencia)}</dd>
        </div>
        <div>
          <dt className="text-navy/50">Vencimentos de referência</dt>
          <dd className="font-medium text-navy">{prazoReferencia ?? "Não registrado"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-navy/50">Próximo passo</dt>
          <dd className="font-medium text-navy">{proximoPasso ?? "Não registrado"}</dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-navy/10 pt-3 text-[11px] text-navy/55">
        Valores de referência não são cobrança: fatura, pagamento e assinatura são atos separados, sempre com
        confirmação humana.
      </p>
    </KitCard>
  );
}
