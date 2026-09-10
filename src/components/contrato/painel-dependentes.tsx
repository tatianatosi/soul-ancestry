import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import { listarDependentes, salvarDependente } from "@/lib/crm-desk.functions";
import {
  STATUS_REPRESENTACAO,
  VINCULOS_DEPENDENTE,
  anexosImpactados,
  bloqueiosDependentes,
  rotuloStatusRepresentacao,
  type Dependente,
} from "@/lib/dependentes";

/**
 * Parâmetro `dependentes`: dependente não é signatário automático, não gera
 * cobrança própria e não recebe acesso ao App sem representação documentada.
 */
export function PainelDependentes({ caseId, podeEscrever }: { caseId: string; podeEscrever: boolean }) {
  const carregar = useServerFn(listarDependentes);
  const salvar = useServerFn(salvarDependente);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["dependentes", caseId], queryFn: () => carregar({ data: { caseId } }), retry: false });
  const [novo, setNovo] = useState<Record<string, unknown> | null>(null);
  const [edicao, setEdicao] = useState<Record<string, Record<string, unknown>>>({});

  const mut = useMutation({
    mutationFn: (p: { id?: string | null; valores: Record<string, unknown> }) => salvar({ data: { ...p, caseId } }),
    onSuccess: () => {
      toast.success("Dependente salvo.");
      setNovo(null);
      setEdicao({});
      void qc.invalidateQueries({ queryKey: ["dependentes", caseId] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível salvar o dependente."),
  });

  const lista = (q.data ?? []) as Dependente[];
  const bloqueios = bloqueiosDependentes(lista);
  const anexos = anexosImpactados(lista);

  const formulario = (valores: Record<string, unknown>, onChange: (k: string, v: unknown) => void) => (
    <div className="grid gap-3 md:grid-cols-2">
      <Texto label="Nome completo" valor={String(valores.nome_completo ?? "")} onChange={(v) => onChange("nome_completo", v)} />
      <Selecao
        label="Vínculo com o titular"
        valor={String(valores.vinculo_com_titular ?? "")}
        opcoes={VINCULOS_DEPENDENTE.map((v) => ({ valor: v.valor, rotulo: v.rotulo }))}
        onChange={(v) => onChange("vinculo_com_titular", v)}
      />
      <Texto
        label="Titular responsável legal"
        valor={String(valores.titular_responsavel_legal_nome ?? "")}
        onChange={(v) => onChange("titular_responsavel_legal_nome", v)}
      />
      <Selecao
        label="Status da representação"
        valor={String(valores.status_representacao ?? "")}
        opcoes={STATUS_REPRESENTACAO.map((s) => ({ valor: s.valor, rotulo: s.rotulo }))}
        onChange={(v) => onChange("status_representacao", v)}
      />
      <Texto
        label="Referência interna do documento de representação"
        valor={String(valores.documento_representacao_referencia_interna ?? "")}
        onChange={(v) => onChange("documento_representacao_referencia_interna", v)}
      />
      <div className="flex flex-wrap items-end gap-4 text-sm text-navy">
        {[
          ["participa_do_contrato", "Participa do contrato"],
          ["possui_acesso_app", "Acesso ao App"],
          ["anexo_individual_aplicavel", "Anexo individual"],
        ].map(([k, label]) => (
          <label key={k} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(valores[k])}
              onChange={(e) => onChange(k, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="md:col-span-2">
        <Texto
          label="Observação interna"
          area
          valor={String(valores.observacao_interna ?? "")}
          onChange={(v) => onChange("observacao_interna", v)}
        />
      </div>
    </div>
  );

  return (
    <Secao
      titulo="Dependentes"
      descricao="A existência de dependente não bloqueia por si só. Bloqueia quando ele participa de contrato, App ou anexo com representação pendente."
    >
      {bloqueios.length ? (
        <ul className="mb-3 space-y-1 rounded-lg border border-terracotta/40 bg-terracotta/5 p-3 text-xs text-navy/75">
          {bloqueios.map((b) => (
            <li key={`${b.codigo}-${b.dependente}`}>{b.descricao}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-xs text-navy/55">Nenhum bloqueio gerado pelos dependentes.</p>
      )}
      <p className="mb-3 text-xs text-navy/55">Anexos impactados: {anexos.length ? anexos.join(", ") : "nenhum"}.</p>

      <div className="space-y-3">
        {lista.map((d) => {
          const valores = { ...d, ...(edicao[String(d.id)] ?? {}) } as Record<string, unknown>;
          return (
            <div key={d.id} className="rounded-lg border border-navy/10 p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-navy/50">
                {d.nome_completo} · representação {rotuloStatusRepresentacao(d.status_representacao).toLowerCase()}
              </p>
              {formulario(valores, (k, v) => setEdicao((s) => ({ ...s, [String(d.id)]: { ...s[String(d.id)], [k]: v } })))}
              <button
                type="button"
                className="mt-2 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
                onClick={() => mut.mutate({ id: d.id, valores: edicao[String(d.id)] ?? {} })}
              >
                Gravar dependente
              </button>
            </div>
          );
        })}
        {q.error ? (
          <p role="alert" className="flex flex-wrap items-center gap-2 text-sm text-terracotta">
            Não foi possível carregar os dependentes. A lista está vazia por falha de leitura, não por ausência de
            declaração.
            <button
              type="button"
              onClick={() => void q.refetch()}
              className="rounded-md border border-terracotta/50 px-2 py-0.5 text-xs font-medium"
            >
              Tentar novamente
            </button>
          </p>
        ) : !lista.length ? (
          <p className="text-sm text-navy/55">Nenhum dependente declarado neste caso.</p>
        ) : null}
      </div>

      {(
        novo ? (
          <div className="mt-3 rounded-lg border border-gold/50 p-3">
            {formulario(novo, (k, v) => setNovo((s) => ({ ...(s ?? {}), [k]: v })))}
            <div className="mt-2 flex gap-2">
              <button type="button" className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream" onClick={() => mut.mutate({ valores: novo })}>
                Incluir dependente
              </button>
              <button type="button" className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy" onClick={() => setNovo(null)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="mt-3 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
            onClick={() => setNovo({ status_representacao: "pendente" })}
          >
            Declarar dependente
          </button>
        )
      )}
    </Secao>
  );
}
