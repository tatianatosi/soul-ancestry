/**
 * Histórico por fase (item E, 07/10/2026) — registro manual, um de cada
 * vez, com data, fonte e conteúdo (texto colado ou descrição do anexo).
 * Mesma tabela do histórico automático já exibido nesta seção
 * (`case_timeline_events`); ver `historico-fase.ts` para o porquê.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selecao, Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { FASES_HISTORICO, rotuloFase, validarEntradaHistorico } from "@/lib/historico-fase";
import {
  arquivarHistoricoFase,
  painelHistoricoFase,
  registrarHistoricoFase,
} from "@/lib/historico-fase.functions";

export function HistoricoPorFase({ caseId }: { caseId: string }) {
  const carregar = useServerFn(painelHistoricoFase);
  const registrar = useServerFn(registrarHistoricoFase);
  const arquivar = useServerFn(arquivarHistoricoFase);
  const qc = useQueryClient();
  const chave = ["historico-fase", caseId];
  const q = useQuery({ queryKey: chave, queryFn: () => carregar({ data: { caseId } }), retry: false });

  const [fase, setFase] = useState<string>(FASES_HISTORICO[0].valor);
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [fonte, setFonte] = useState("");
  const [conteudo, setConteudo] = useState("");

  const erros = validarEntradaHistorico({ fase, dataOcorrencia, fonte, conteudo });

  const m = useMutation({
    mutationFn: () => registrar({ data: { caseId, fase, dataOcorrencia, fonte, conteudo } }),
    onSuccess: () => {
      toast.success("Histórico registrado.");
      setFonte("");
      setConteudo("");
      void qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mArquivar = useMutation({
    mutationFn: (registroId: string) => arquivar({ data: { caseId, registroId, motivo: "Removido do histórico pela equipe." } }),
    onSuccess: () => {
      toast.success("Registro arquivado.");
      void qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3" data-historico-por-fase>
      <p className="text-xs text-navy/55">
        Um registro por vez, nunca importação em bloco. Cada entrada fica ligada a uma fase — a data pode ser
        retroativa, é quando aquilo aconteceu, não quando foi digitado aqui.
      </p>

      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data?.registros as Record<string, unknown>[] | undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="o histórico por fase"
        vazio="Nenhum registro ainda."
      >
        {(registros) => (
          <ul className="space-y-2 text-sm">
            {(registros as { id: string; fase: string; dataOcorrencia: string | null; fonte: string; conteudo: string | null }[]).map(
              (r) => (
                <li key={r.id} className="rounded-lg border border-navy/10 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-navy/40">{rotuloFase(r.fase)}</p>
                  <p className="mt-0.5 text-navy">{r.fonte}</p>
                  {r.conteudo ? <p className="mt-1 whitespace-pre-wrap text-xs text-navy/70">{r.conteudo}</p> : null}
                  <p className="mt-1 text-xs text-navy/45">
                    {r.dataOcorrencia ? new Date(r.dataOcorrencia).toLocaleDateString("pt-BR") : "sem data"}{" "}
                    <button
                      type="button"
                      className="ml-2 underline decoration-gold text-[10px] text-navy/50"
                      onClick={() => mArquivar.mutate(r.id)}
                    >
                      arquivar
                    </button>
                  </p>
                </li>
              ),
            )}
          </ul>
        )}
      </EstadoDados>

      <div className="grid gap-2 sm:grid-cols-2 rounded-lg border border-navy/10 bg-cream/40 p-3">
        <Selecao
          label="Fase"
          valor={fase}
          opcoes={FASES_HISTORICO.map((f) => ({ valor: f.valor, rotulo: f.rotulo }))}
          onChange={setFase}
        />
        <Texto label="Data em que aconteceu" valor={dataOcorrencia} onChange={setDataOcorrencia} tipo="date" />
        <Texto label="Fonte (quem registrou, de onde veio)" valor={fonte} onChange={setFonte} />
        <Texto label="Conteúdo (texto colado ou descrição do anexo)" valor={conteudo} onChange={setConteudo} area />

        <div className="sm:col-span-2">
          <AcaoOperacional
            rotulo="Registrar no histórico"
            capacidade="avancar_caso_planejador_tarefa"
            validacaoFormulario={erros[0] ?? null}
            efeito="Grava um registro manual neste caso, auditado, sem alterar nenhum dado automático existente."
            onConfirmar={() => m.mutate()}
          />
        </div>
      </div>
    </div>
  );
}
