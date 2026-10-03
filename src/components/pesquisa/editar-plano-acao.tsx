/**
 * Escrita do Plano de Ação de Pesquisa (03/10/2026).
 *
 * ## O defeito que isto fecha
 *
 * A varredura de órfãos mediu o padrão que vinha se repetindo: a rota
 * `/plano-acao/$caseId` importava SOMENTE o leitor (`painelPlanoAcao`). Os
 * quatro escritores — `salvarItemPlano`, `salvarInstituicao`,
 * `salvarEstimativa`, `arquivarRegistroG07` — existiam, com autorização por
 * papel e releitura, e tinham ZERO chamadores. Resultado: a equipe via a
 * fila de ações e não conseguia criar, editar nem arquivar nada pela tela.
 *
 * Nada aqui contata instituição, dispara envio, cobra ou publica no App: o
 * plano é fila interna. Estimativa é previsão de terceiro, nunca cobrança.
 */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selecao, Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { motivoCampoInvalido } from "@/components/campos/aviso-campo";
import {
  APROVACOES_CLIENTE,
  CANAIS,
  ORIGENS_ESTIMATIVA,
  PAGADORES,
  PRIORIDADES,
  STATUS_ACAO,
  TIPOS_ACAO,
  TIPOS_DESPESA,
} from "@/lib/plano-acao-pesquisa";
import {
  arquivarRegistroG07,
  salvarEstimativa,
  salvarInstituicao,
  salvarItemPlano,
} from "@/lib/plano-acao-pesquisa.functions";

type Valores = Record<string, unknown>;
const texto = (v: unknown) => String(v ?? "");
const op = (lista: readonly { id?: string; valor?: string; rotulo: string }[]) =>
  lista.map((o) => ({ valor: String((o as { id?: string; valor?: string }).id ?? (o as { valor?: string }).valor ?? ""), rotulo: o.rotulo }));

export function EditarPlanoAcao({
  caseId,
  podeEditar,
  instituicoes,
  itens,
  aoSalvar,
}: {
  caseId: string;
  podeEditar: boolean;
  instituicoes: Record<string, unknown>[];
  itens: Record<string, unknown>[];
  aoSalvar: () => void;
}) {
  const salvarItem = useServerFn(salvarItemPlano);
  const salvarInst = useServerFn(salvarInstituicao);
  const salvarEst = useServerFn(salvarEstimativa);
  const arquivar = useServerFn(arquivarRegistroG07);

  const [aba, setAba] = useState<"item" | "instituicao" | "estimativa" | "arquivar">("item");
  const [item, setItem] = useState<Valores>({ case_id: caseId, status: "aberta", priority: "media" });
  const [inst, setInst] = useState<Valores>({});
  const [est, setEst] = useState<Valores>({ case_id: caseId, currency: "BRL" });
  const [alvo, setAlvo] = useState<{ tabela: string; id: string; motivo: string }>({
    tabela: "research_action_plan_items",
    id: "",
    motivo: "",
  });

  const sucesso = (msg: string) => {
    toast.success(msg);
    aoSalvar();
  };
  const mItem = useMutation({
    mutationFn: () => salvarItem({ data: { id: texto(item.id) || undefined, valores: { ...item, case_id: caseId } } }),
    onSuccess: () => {
      sucesso("Ação do plano salva.");
      setItem({ case_id: caseId, status: "aberta", priority: "media" });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mInst = useMutation({
    mutationFn: () => salvarInst({ data: { id: texto(inst.id) || undefined, valores: inst } }),
    onSuccess: () => {
      sucesso("Instituição salva.");
      setInst({});
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mEst = useMutation({
    mutationFn: () => salvarEst({ data: { id: texto(est.id) || undefined, valores: { ...est, case_id: caseId } } }),
    onSuccess: () => {
      sucesso("Previsão de terceiro salva.");
      setEst({ case_id: caseId, currency: "BRL" });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mArquivar = useMutation({
    mutationFn: () =>
      arquivar({ data: { tabela: alvo.tabela as never, id: alvo.id, motivo: alvo.motivo } }),
    onSuccess: () => {
      sucesso("Registro arquivado com motivo.");
      setAlvo({ ...alvo, id: "", motivo: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!podeEditar) {
    return (
      <section className="mb-6 rounded-xl border border-navy/10 bg-cream/50 p-3">
        <p className="text-xs text-navy/70">
          Seu papel lê o plano de ação, mas não o edita. Quem edita vê aqui os formulários de ação, instituição e
          previsão.
        </p>
      </section>
    );
  }

  const ABAS = [
    ["item", "Ação do plano"],
    ["instituicao", "Instituição"],
    ["estimativa", "Previsão de terceiro"],
    ["arquivar", "Arquivar"],
  ] as const;

  return (
    <section className="mb-6 rounded-xl border-2 border-gold/40 bg-gold/5 p-4" data-editar-plano-acao>
      <h2 className="font-serif text-lg text-navy">Registrar no plano de ação</h2>
      <p className="mb-3 text-xs text-navy/60">
        Fila interna: nada aqui contata instituição, envia mensagem, cobra ou publica no App. Previsão de terceiro é
        estimativa, nunca cobrança.
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {ABAS.map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            onClick={() => setAba(id)}
            className={
              aba === id
                ? "rounded-lg bg-navy px-2.5 py-1 text-[11px] text-cream"
                : "rounded-lg border border-navy/20 px-2.5 py-1 text-[11px] text-navy"
            }
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === "item" ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Selecao
            label="Editar existente (ou deixe vazio para criar)"
            valor={texto(item.id)}
            opcoes={itens.map((i) => ({ valor: String(i.id), rotulo: String(i.titulo ?? i.id) }))}
            onChange={(v) => {
              const achado = itens.find((i) => String(i.id) === v);
              setItem(achado ? { ...achado } : { case_id: caseId, status: "aberta", priority: "media" });
            }}
          />
          <Texto label="Título da ação" valor={texto(item.titulo)} onChange={(v) => setItem({ ...item, titulo: v })} />
          <Selecao label="Tipo de ação" valor={texto(item.action_type)} opcoes={op(TIPOS_ACAO)} onChange={(v) => setItem({ ...item, action_type: v })} />
          <Selecao label="Prioridade" valor={texto(item.priority)} opcoes={op(PRIORIDADES)} onChange={(v) => setItem({ ...item, priority: v })} />
          <Selecao label="Situação" valor={texto(item.status)} opcoes={op(STATUS_ACAO)} onChange={(v) => setItem({ ...item, status: v })} />
          <Texto
            label="Prazo"
            tipo="date"
            valor={texto(item.due_date)}
            onChange={(v) => setItem({ ...item, due_date: v })}
            erro={motivoCampoInvalido("Prazo", "data_futura", texto(item.due_date))}
          />
          <Selecao
            label="Instituição de referência"
            valor={texto(item.institution_id)}
            opcoes={instituicoes.map((i) => ({ valor: String(i.id), rotulo: String(i.name ?? i.id) }))}
            onChange={(v) => setItem({ ...item, institution_id: v })}
          />
          <Selecao label="Canal sugerido" valor={texto(item.suggested_channel)} opcoes={op(CANAIS)} onChange={(v) => setItem({ ...item, suggested_channel: v })} />
          <Texto label="Próxima ação" valor={texto(item.next_action)} onChange={(v) => setItem({ ...item, next_action: v })} />
          <Texto
            label="Próxima rechecagem"
            tipo="date"
            valor={texto(item.next_check_at)}
            onChange={(v) => setItem({ ...item, next_check_at: v })}
            erro={motivoCampoInvalido("Próxima rechecagem", "data_futura", texto(item.next_check_at))}
          />
          <div className="md:col-span-2">
            <Texto area label="Motivo / nota interna" valor={texto(item.notes_internal)} onChange={(v) => setItem({ ...item, notes_internal: v })} />
          </div>
          <div className="md:col-span-2">
            <AcaoOperacional
              rotulo={mItem.isPending ? "Salvando…" : texto(item.id) ? "Atualizar ação" : "Criar ação"}
              capacidade="editar_rascunho"
              efeito="Grava a ação na fila interna de pesquisa e relê o registro. Nenhuma instituição é contatada."
              size="sm"
              validacaoFormulario={texto(item.titulo).trim() ? null : "Informe o título da ação."}
              onConfirmar={async () => {
                await mItem.mutateAsync();
              }}
            />
          </div>
        </div>
      ) : null}

      {aba === "instituicao" ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Selecao
            label="Editar existente (ou deixe vazio para criar)"
            valor={texto(inst.id)}
            opcoes={instituicoes.map((i) => ({ valor: String(i.id), rotulo: String(i.name ?? i.id) }))}
            onChange={(v) => {
              const achado = instituicoes.find((i) => String(i.id) === v);
              setInst(achado ? { ...achado } : {});
            }}
          />
          <Texto label="Nome da instituição" valor={texto(inst.name)} onChange={(v) => setInst({ ...inst, name: v })} />
          <Texto label="Tipo" valor={texto(inst.institution_type)} onChange={(v) => setInst({ ...inst, institution_type: v })} />
          <Texto label="País" valor={texto(inst.country)} onChange={(v) => setInst({ ...inst, country: v })} />
          <Texto label="Cidade" valor={texto(inst.city)} onChange={(v) => setInst({ ...inst, city: v })} />
          <Texto
            label="E-mail"
            tipo="email"
            valor={texto(inst.email)}
            onChange={(v) => setInst({ ...inst, email: v })}
            erro={motivoCampoInvalido("E-mail", "email", texto(inst.email))}
          />
          <Texto
            label="Telefone"
            valor={texto(inst.phone)}
            onChange={(v) => setInst({ ...inst, phone: v })}
            erro={motivoCampoInvalido("Telefone", "telefone", texto(inst.phone))}
          />
          <Selecao label="Canal preferido" valor={texto(inst.preferred_channel)} opcoes={op(CANAIS)} onChange={(v) => setInst({ ...inst, preferred_channel: v })} />
          <div className="md:col-span-2">
            <Texto area label="Instrução operacional" valor={texto(inst.operational_instruction)} onChange={(v) => setInst({ ...inst, operational_instruction: v })} />
          </div>
          <div className="md:col-span-2">
            <AcaoOperacional
              rotulo={mInst.isPending ? "Salvando…" : texto(inst.id) ? "Atualizar instituição" : "Criar instituição"}
              capacidade="editar_rascunho"
              efeito="Grava a instituição de referência e relê o registro. Nenhum contato é disparado."
              size="sm"
              validacaoFormulario={texto(inst.name).trim() ? null : "Informe o nome da instituição."}
              onConfirmar={async () => {
                await mInst.mutateAsync();
              }}
            />
          </div>
        </div>
      ) : null}

      {aba === "estimativa" ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Selecao label="Tipo de despesa" valor={texto(est.expense_type)} opcoes={op(TIPOS_DESPESA)} onChange={(v) => setEst({ ...est, expense_type: v })} />
          <Selecao
            label="Ação vinculada"
            valor={texto(est.research_action_plan_item_id)}
            opcoes={itens.map((i) => ({ valor: String(i.id), rotulo: String(i.titulo ?? i.id) }))}
            onChange={(v) => setEst({ ...est, research_action_plan_item_id: v })}
          />
          <Texto label="Quantidade" valor={texto(est.quantity)} onChange={(v) => setEst({ ...est, quantity: v })} />
          <Texto label="Moeda" valor={texto(est.currency)} onChange={(v) => setEst({ ...est, currency: v })} />
          <Texto label="Valor unitário mínimo" valor={texto(est.unit_price_min)} onChange={(v) => setEst({ ...est, unit_price_min: v })} />
          <Texto label="Valor unitário máximo" valor={texto(est.unit_price_max)} onChange={(v) => setEst({ ...est, unit_price_max: v })} />
          <Selecao label="Fonte da estimativa" valor={texto(est.estimate_source)} opcoes={op(ORIGENS_ESTIMATIVA)} onChange={(v) => setEst({ ...est, estimate_source: v })} />
          <Selecao label="Pagador" valor={texto(est.payer)} opcoes={op(PAGADORES)} onChange={(v) => setEst({ ...est, payer: v })} />
          <Selecao
            label="Aprovação do cliente"
            valor={texto(est.client_approval_status)}
            opcoes={op(APROVACOES_CLIENTE)}
            onChange={(v) => setEst({ ...est, client_approval_status: v })}
          />
          <div className="md:col-span-2">
            <AcaoOperacional
              rotulo={mEst.isPending ? "Salvando…" : "Registrar previsão"}
              capacidade="editar_rascunho"
              efeito="Grava a previsão de valor de terceiro e relê o registro. Não é cobrança, receita nem despesa executada."
              size="sm"
              validacaoFormulario={texto(est.expense_type).trim() ? null : "Informe o tipo de despesa."}
              onConfirmar={async () => {
                await mEst.mutateAsync();
              }}
            />
          </div>
        </div>
      ) : null}

      {aba === "arquivar" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {/*
            Sem exclusão física: arquivar exige motivo, e o registro continua
            auditável. É a regra do AGENTS.md, não uma escolha desta tela.
          */}
          <Selecao
            label="O que arquivar"
            valor={alvo.tabela}
            opcoes={[
              { valor: "research_action_plan_items", rotulo: "Ação do plano" },
              { valor: "institutions", rotulo: "Instituição" },
              { valor: "expense_estimates", rotulo: "Previsão de terceiro" },
            ]}
            onChange={(v) => setAlvo({ ...alvo, tabela: v, id: "" })}
          />
          <Selecao
            label="Registro"
            valor={alvo.id}
            opcoes={(alvo.tabela === "institutions" ? instituicoes : itens).map((i) => ({
              valor: String(i.id),
              rotulo: String(i.titulo ?? i.name ?? i.id),
            }))}
            onChange={(v) => setAlvo({ ...alvo, id: v })}
          />
          <div className="md:col-span-2">
            <Texto label="Motivo do arquivamento" valor={alvo.motivo} onChange={(v) => setAlvo({ ...alvo, motivo: v })} />
          </div>
          <div className="md:col-span-2">
            <AcaoOperacional
              rotulo={mArquivar.isPending ? "Arquivando…" : "Arquivar com motivo"}
              capacidade="editar_rascunho"
              efeito="Marca o registro como arquivado com motivo. Nada é apagado fisicamente."
              size="sm"
              validacaoFormulario={alvo.id && alvo.motivo.trim().length >= 5 ? null : "Escolha o registro e escreva o motivo (mínimo 5 letras)."}
              onConfirmar={async () => {
                await mArquivar.mutateAsync();
              }}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
