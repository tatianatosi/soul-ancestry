/**
 * Edição da Visão de Pesquisa do caso (03/10/2026).
 *
 * ## O defeito que isto fecha
 *
 * O hub `/pesquisa-evidencias/$caseId` EXIBIA objetivo, hipótese interna,
 * próximo marco e próxima ação da pesquisa — e `salvarVisaoPesquisa`, o
 * escritor desses mesmos campos, tinha zero chamadores. A equipe lia a visão
 * e não conseguia mudar nada por tela: para corrigir um objetivo ou registrar
 * a próxima ação da pesquisa, só por SQL.
 *
 * O escritor já recusa campo fora da lista mapeada
 * (`CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA`) e já valida a situação contra o
 * vocabulário real — por isso este painel manda só o que mudou, e nunca
 * inventa valor de status.
 */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { motivoCampoInvalido } from "@/components/campos/aviso-campo";
import { Selecao, Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { STATUS_PESQUISA } from "@/lib/pesquisa-cadeia";
import { salvarVisaoPesquisa } from "@/lib/pesquisa-cadeia.functions";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

type Pesquisa = Record<string, unknown> & { id?: string };

export function EditarVisaoPesquisa({ pesquisa, aoSalvar }: { pesquisa: Pesquisa | null; aoSalvar: () => void }) {
  const salvar = useServerFn(salvarVisaoPesquisa);
  const [aberto, setAberto] = useState(false);
  const t = (k: string) => String((pesquisa?.[k] as string | null) ?? "");
  const [form, setForm] = useState<Record<string, string>>({});
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(Object.keys(form).length > 0);

  const valor = (k: string) => (k in form ? form[k] : t(k));
  const mudar = (k: string) => (v: string) => setForm({ ...form, [k]: v });

  const m = useMutation({
    mutationFn: () => {
      /*
        Só os campos de fato alterados vão ao servidor. Mandar o objeto
        inteiro reescreveria campo que outra tela acabou de gravar — é o
        mesmo cuidado já adotado no painel da Jornada.
      */
      const mudados: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) if (v !== t(k)) mudados[k] = v;
      if (Object.keys(mudados).length === 0) throw new Error("Nada mudou — nenhum campo foi alterado.");
      return salvar({ data: { id: String(pesquisa?.id), valores: mudados } });
    },
    onSuccess: () => {
      toast.success("Visão de pesquisa salva.");
      setForm({});
      setAberto(false);
      aoSalvar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!pesquisa?.id) return null;

  if (!aberto) {
    return (
      <p className="mt-2 text-xs">
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="font-medium text-navy underline decoration-gold underline-offset-4"
        >
          Editar a visão de pesquisa (objetivo, hipótese, marco, próxima ação) →
        </button>
      </p>
    );
  }

  return (
    <section className="mt-3 rounded-xl border-2 border-gold/40 bg-gold/5 p-3" data-editar-visao-pesquisa>
      <h3 className="text-sm font-medium text-navy">Visão de pesquisa</h3>
      <p className="mb-2 text-xs text-navy/60">
        Uso interno. Nada aqui contata instituição, publica no App nem conclui parentesco. Hipótese é hipótese: a lista
        estruturada continua no módulo de pesquisa.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <Texto area label="Objetivo da pesquisa" valor={valor("research_objective")} onChange={mudar("research_objective")} />
        </div>
        <div className="md:col-span-2">
          <Texto
            area
            label="Hipótese interna (resumo em texto)"
            valor={valor("internal_hypothesis")}
            onChange={mudar("internal_hypothesis")}
          />
        </div>
        <Selecao
          label="Situação"
          valor={valor("status")}
          opcoes={Object.entries(STATUS_PESQUISA).map(([v, r]) => ({ valor: v, rotulo: String(r) }))}
          onChange={mudar("status")}
        />
        <Texto label="Próximo marco" valor={valor("next_milestone")} onChange={mudar("next_milestone")} />
        <Texto label="Próxima ação de pesquisa" valor={valor("next_research_action")} onChange={mudar("next_research_action")} />
        <Texto
          label="Prazo da próxima ação"
          tipo="date"
          valor={String(valor("next_research_action_due_at")).slice(0, 10)}
          onChange={mudar("next_research_action_due_at")}
          erro={motivoCampoInvalido("Prazo da próxima ação", "data_futura", String(valor("next_research_action_due_at")).slice(0, 10))}
        />
        <div className="md:col-span-2">
          <Texto area label="Escopo autorizado" valor={valor("authorized_scope")} onChange={mudar("authorized_scope")} />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <AcaoOperacional
            rotulo={m.isPending ? "Salvando…" : "Salvar visão de pesquisa"}
            capacidade="editar_rascunho"
            efeito="Atualiza os campos internos da pesquisa deste caso. Nenhuma consulta, envio ou publicação é disparada."
            size="sm"
            validacaoFormulario={Object.keys(form).length ? null : "Altere algum campo antes de salvar."}
            onConfirmar={async () => {
              await m.mutateAsync();
            }}
          />
          <button
            type="button"
            onClick={() => {
              setForm({});
              setAberto(false);
            }}
            className="rounded-lg border border-navy/20 px-2.5 py-1 text-[11px] text-navy"
          >
            Cancelar
          </button>
        </div>
      </div>
    </section>
  );
}
