import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { motivoCampoInvalido } from "@/components/campos/aviso-campo";
import { Rotulo, Selecao, Texto, inputCls } from "@/components/caso/campos";
import { useSaas } from "@/components/saas/shell";
import { criarLeadManual, verificarDuplicidadeLead, type PossivelDuplicidade } from "@/lib/crm-desk.functions";
import { AREAS_RESPONSAVEIS, OBJETIVOS, ORIGENS_LEAD, PROXIMAS_ACOES } from "@/lib/crm-desk";
import { hojeISO } from "@/lib/painel-dia";
import { formatarTelefone } from "@/lib/validacao-pessoa";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

type Props = {
  aberto: boolean;
  onFechar: () => void;
  onCriado: (id: string | null) => void;
};

/**
 * Responsável, próxima ação e prazo vêm pré-preenchidos (usuária logada,
 * "Realizar Discovery", hoje) em vez de bloquear o salvamento: quem está
 * criando o lead em plena call precisa registrar o essencial e ajustar
 * depois, não parar para escolher três campos antes de começar. A regra de
 * "nenhum lead ativo sem responsável/próxima ação/prazo" continua valendo —
 * só deixa de exigir digitação manual no momento da captura.
 */
const vazio = {
  nome: "",
  email: "",
  telefone: "",
  origem: "",
  objetivo: "",
  area_responsavel: "comercial",
  responsavel_nome: "",
  proxima_acao: "realizar_discovery",
  proxima_acao_em: hojeISO(),
  resumo_call: "",
  indicado_por: "",
};

/** Cadastro manual curto: cria o lead já em Triagem, com deduplicação por e-mail e telefone. */
export function NovoLeadDialog({ aberto, onFechar, onCriado }: Props) {
  const criar = useServerFn(criarLeadManual);
  const verificarDuplicidade = useServerFn(verificarDuplicidadeLead);
  const qc = useQueryClient();
  const { contexto } = useSaas();
  const [form, setForm] = useState({ ...vazio });
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(JSON.stringify(form) !== JSON.stringify({ ...vazio }));
  /* Aviso não bloqueante (ordem de 19/10/2026): duplicidade nunca impede o
     salvamento — só mostra o selo depois que o lead já foi gravado. */
  const [duplicidades, setDuplicidades] = useState<PossivelDuplicidade[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // Pré-preenche com o nome da usuária logada assim que carregar, sem
  // sobrescrever se ela já tiver digitado outro responsável.
  useEffect(() => {
    const nome = contexto?.perfil?.nome;
    if (nome && !form.responsavel_nome) setForm((f) => ({ ...f, responsavel_nome: nome }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contexto?.perfil?.nome]);

  const set = (k: keyof typeof vazio) => (v: unknown) => setForm((f) => ({ ...f, [k]: String(v ?? "") }));

  /*
   * Checagem de duplicidade não bloqueante, enquanto a usuária ainda digita
   * (ordem de 19/10/2026): roda no blur de nome/e-mail/telefone, só para
   * mostrar o selo de aviso antes do clique em salvar. Nunca impede digitar
   * nem salvar — mesma busca real (buscarDuplicidades) que o salvamento usa.
   */
  async function conferirDuplicidadeAoVivo(nome: string, email: string, telefone: string) {
    const emailPronto = email.includes("@") && email.includes(".");
    const telefonePronto = telefone.replace(/\D/g, "").length >= 8;
    if (!emailPronto && !telefonePronto) return;
    try {
      const r = await verificarDuplicidade({ data: { nome, email: email || null, telefone: telefone || null } });
      setDuplicidades(r.duplicidades);
    } catch {
      // Checagem é só um aviso adicional; falha nela não impede o cadastro.
    }
  }

  const mut = useMutation({
    mutationFn: () => criar({ data: { ...form } }),
    onSuccess: (r) => {
      if (!r.ok) {
        // Só erro real de validação bloqueia (ex. nome ausente, e-mail
        // inválido) — duplicidade nunca chega aqui: ela vem em r.duplicidades
        // mesmo quando r.ok é true, como aviso depois de já ter salvo.
        setMsg(r.erros.map((e) => `${e.campo}: ${e.motivo}`).join(" · "));
        return;
      }
      setForm({ ...vazio });
      setDuplicidades(r.duplicidades);
      setMsg(
        r.duplicidades.length
          ? "Lead salvo em Triagem. Possível duplicidade encontrada — confirme se é a mesma pessoa."
          : null,
      );
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
      onCriado(r.lead?.id ?? null);
    },
    onError: (e: Error) => setMsg(e.message),
  });

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-navy/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-navy/10 bg-cream/40 p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-navy">Novo lead</h2>
            <p className="text-xs text-navy/60">
              Cria contato e lead em uma única operação, já em Triagem. Não libera proposta, contrato, cobrança, onboarding,
              pesquisa externa nem App Cliente.
            </p>
          </div>
          <button type="button" className="text-sm text-navy/60" onClick={onFechar}>
            Fechar
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Texto
            label="Nome completo *"
            valor={form.nome}
            onChange={set("nome")}
            erro={motivoCampoInvalido("Nome completo", "nome", form.nome)}
          />
          <Texto label="Indicado por (opcional)" valor={form.indicado_por} onChange={set("indicado_por")} />
          <Texto
            label="E-mail (e-mail ou telefone obrigatório)"
            tipo="email"
            valor={form.email}
            onChange={(v) => {
              set("email")(v);
              void conferirDuplicidadeAoVivo(form.nome, v, form.telefone);
            }}
            erro={motivoCampoInvalido("E-mail", "email", form.email)}
          />
          <Texto
            label="Telefone (e-mail ou telefone obrigatório)"
            valor={form.telefone}
            onChange={(v) => {
              const formatado = formatarTelefone(v);
              set("telefone")(formatado);
              void conferirDuplicidadeAoVivo(form.nome, form.email, formatado);
            }}
            erro={motivoCampoInvalido("Telefone", "telefone", form.telefone)}
          />
          <Selecao label="Origem *" valor={form.origem} opcoes={ORIGENS_LEAD} onChange={set("origem")} />
          <Selecao
            label="Área responsável *"
            valor={form.area_responsavel}
            opcoes={AREAS_RESPONSAVEIS}
            onChange={set("area_responsavel")}
          />
          <Selecao label="Interesse inicial *" valor={form.objetivo} opcoes={OBJETIVOS} onChange={set("objetivo")} />
          <Texto label="Responsável *" valor={form.responsavel_nome} onChange={set("responsavel_nome")} />
          <Selecao label="Próxima ação *" valor={form.proxima_acao} opcoes={PROXIMAS_ACOES} onChange={set("proxima_acao")} />
          <div>
            <Rotulo>Prazo da próxima ação *</Rotulo>
            <input
              type="date"
              className={inputCls}
              value={form.proxima_acao_em}
              onChange={(e) => set("proxima_acao_em")(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Texto label="Resumo (texto livre curto)" valor={form.resumo_call} onChange={set("resumo_call")} />
          </div>
        </div>

        {/*
          Selo de duplicidade — sempre aviso, nunca trava (ordem de
          19/10/2026): aparece enquanto a usuária digita (checagem ao vivo por
          e-mail/telefone) e continua visível depois de salvar, se o
          resultado do servidor também achou duplicidade. O botão "Salvar"
          abaixo nunca fica desabilitado por isso.
        */}
        {duplicidades.length ? (
          <div className="mt-4 rounded-xl border border-terracotta/40 bg-terracotta/5 p-3">
            <p className="text-sm font-medium text-terracotta">
              Possível duplicidade — salvar continua liberado, confirme se é a mesma pessoa
            </p>
            <ul className="mt-2 space-y-1 text-xs text-navy/70">
              {duplicidades.map((d) => (
                <li key={d.id}>
                  <strong>{d.codigo ?? "—"}</strong> · {d.nome} · {d.email ?? "sem e-mail"} · {d.telefone ?? "sem telefone"} —{" "}
                  {d.motivo}
                  <button type="button" className="ml-2 underline" onClick={() => onCriado(d.id)}>
                    abrir ficha existente
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {msg ? <p className="mt-3 rounded-lg border border-navy/10 bg-cream/50 px-3 py-2 text-sm text-navy">{msg}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-50"
            disabled={mut.isPending}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? "Salvando…" : "Salvar lead em Triagem"}
          </button>
          <button type="button" className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy" onClick={onFechar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
