/**
 * Três atos de governança da formalização que existiam como escritor e não
 * tinham tela (Corte F, 05/10/2026).
 *
 * Medido antes de montar:
 *  - `crm_casos.condicoes_verificadas_em` é lido por `gatesAtivacaoFicha`
 *    (passo 2 "Reconciliar oferta", gate `escopo_sku_preco`) e **nada** o
 *    escrevia: o único escritor, `verificarCondicoesCaso`, não tinha chamador;
 *  - `sincronizarContratoBase` propaga a versão vigente do contrato-base para
 *    os modelos da organização; sem chamador, a atualização do contrato-base
 *    não chegava aos casos abertos;
 *  - `verificarAtoEmNomeDoCliente` é o gate servidor-side dos Anexos III e IV
 *    antes de qualquer ato perante instituição externa; sem chamador, o gate
 *    de procuração não era exercido por nenhuma tela.
 *
 * Nada aqui envia, assina, cobra, pesquisa fora ou publica no portal. A
 * verificação de ato **não executa o ato**: devolve liberado ou recusa com o
 * anexo que falta.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { CaCard } from "@/components/ui/ca-card";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { verificarCondicoesCaso } from "@/lib/saas.functions";
import { sincronizarContratoBase } from "@/lib/contrato-parametros.functions";
import { verificarAtoEmNomeDoCliente } from "@/lib/atos-representacao.functions";

function dataHora(v?: string | null): string {
  return v ? new Date(v).toLocaleString("pt-BR") : "—";
}

export function GovernancaFormalizacao({
  caseId,
  condicoesVerificadasEm,
  aoConcluir,
}: {
  caseId: string;
  condicoesVerificadasEm: string | null;
  aoConcluir?: () => void;
}) {
  const qc = useQueryClient();
  const conferir = useServerFn(verificarCondicoesCaso);
  const sincronizar = useServerFn(sincronizarContratoBase);
  const verificarAto = useServerFn(verificarAtoEmNomeDoCliente);

  const [descricaoAto, setDescricaoAto] = useState("");
  const [resultadoAto, setResultadoAto] = useState<{ liberado: boolean; texto: string } | null>(null);

  const invalidar = () => {
    void qc.invalidateQueries();
    aoConcluir?.();
  };

  const mConferir = useMutation({
    mutationFn: () => conferir({ data: { id: caseId } }),
    onSuccess: () => {
      toast.success("Conferência de escopo, SKU e preço registrada no caso.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mSincronizar = useMutation({
    mutationFn: () => sincronizar(),
    onSuccess: (r: { modelos: string[]; clausulas: number; previasLegado: number }) => {
      toast.success(
        `Contrato-base propagado: ${r.modelos.length} modelo(s) (${r.modelos.join(", ") || "nenhum"}), ` +
          `${r.clausulas} cláusulas; ${r.previasLegado} prévia(s) antiga(s) marcada(s) como legado sem corpo.`,
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mAto = useMutation({
    mutationFn: () => verificarAto({ data: { caseId, descricao: descricaoAto } }),
    onSuccess: (r: { liberado: boolean; descricao: string }) =>
      setResultadoAto({
        liberado: r.liberado,
        texto: `Anexos III e IV conferidos no servidor. O ato descrito pode ser praticado em nome do cliente: "${r.descricao}". A verificação não executa o ato.`,
      }),
    onError: (e: Error) => setResultadoAto({ liberado: false, texto: e.message }),
  });

  return (
    <CaCard variante="compacto" titulo="Governança da formalização" data-governanca-formalizacao>
      <div className="space-y-4">
        <section data-conferencia-condicoes className="rounded-xl border border-navy/15 bg-cream/40 p-3">
          <h3 className="text-sm font-medium">Conferência formal de escopo, SKU e preço</h3>
          <p className="mt-1 text-xs text-navy/60">
            É o que satisfaz o passo 2 da formalização (“Reconciliar oferta”) na Visão do caso. Registra data e
            autor da conferência — não altera escopo, SKU nem preço.
          </p>
          <p className="mt-1 text-xs text-navy/70">
            Última conferência: <strong>{dataHora(condicoesVerificadasEm)}</strong>
          </p>
          <AcaoOperacional
            rotulo={condicoesVerificadasEm ? "Registrar nova conferência" : "Registrar conferência"}
            className="mt-2 rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
            capacidade="corrigir_os_anexos_previa"
            efeito="Grava data e autor da conferência de escopo, SKU e preço no caso. Nenhum valor é alterado."
            onConfirmar={() => mConferir.mutate()}
          />
        </section>

        <section data-sincronizar-contrato-base className="rounded-xl border border-navy/15 bg-cream/40 p-3">
          <h3 className="text-sm font-medium">Propagar a versão vigente do contrato-base</h3>
          <p className="mt-1 text-xs text-navy/60">
            Atualiza os modelos da organização (MODELO-ESTUDO e BASE-GEN-V2) com o preâmbulo, as cláusulas fixas e o
            perfil institucional vigentes, e marca como legado as prévias antigas sem corpo contratual. Não toca
            contrato assinado nem prévia já aprovada.
          </p>
          <AcaoOperacional
            rotulo="Sincronizar contrato-base"
            className="mt-2 rounded-lg border border-navy/25 px-3 py-1.5 text-xs text-navy"
            capacidade="corrigir_os_anexos_previa"
            efeito="Grava o corpo do contrato-base vigente nos modelos da organização. Nenhum envio, assinatura ou cobrança."
            onConfirmar={() => mSincronizar.mutate()}
          />
        </section>

        <section data-gate-ato-cliente className="rounded-xl border border-navy/15 bg-cream/40 p-3">
          <h3 className="text-sm font-medium">Ato em nome do cliente — conferir procuração antes</h3>
          <p className="mt-1 text-xs text-navy/60">
            Descreva o ato pretendido perante instituição externa. O servidor confere os Anexos III e IV; sem Anexo IV
            vigente, recusa. <strong>Esta verificação não executa o ato.</strong>
          </p>
          <textarea
            rows={2}
            value={descricaoAto}
            onChange={(e) => {
              setDescricaoAto(e.target.value);
              setResultadoAto(null);
            }}
            placeholder="Ex.: solicitar certidão de nascimento no arquivo da localidade de origem"
            className="mt-2 w-full rounded-lg border border-navy/20 px-3 py-2 text-xs"
          />
          <button
            type="button"
            disabled={mAto.isPending || descricaoAto.trim().length < 10}
            onClick={() => mAto.mutate()}
            className="mt-2 rounded-lg border border-navy/25 px-3 py-1.5 text-xs text-navy disabled:opacity-50"
          >
            Verificar anexos exigidos
          </button>
          {resultadoAto ? (
            <p
              data-resultado-ato
              className={
                resultadoAto.liberado
                  ? "mt-2 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-xs text-navy"
                  : "mt-2 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-xs text-terracotta"
              }
            >
              {resultadoAto.texto}
            </p>
          ) : null}
        </section>
      </div>
    </CaCard>
  );
}
