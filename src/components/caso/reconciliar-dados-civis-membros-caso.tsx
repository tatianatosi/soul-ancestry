import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { conferirDivergenciaCampoCivilMembrosCaso } from "@/lib/caso-canonico.functions";
import { CAMPOS_CIVIS_RECONCILIAVEIS, ROTULO_CAMPO_CIVIL, type CampoCivilReconciliavel } from "@/lib/pessoa-vinculo";

/**
 * P32 (26/09/2026) — pedido direto: "algo simples... sem forms infinitos".
 * Em vez de repetir o painel de CPF/telefone/CEP mais 6 vezes (um card por
 * campo), este é UM painel só, com um bloco compacto por campo civil
 * (e-mail, RG, nacionalidade, data de nascimento, profissão, estado civil).
 *
 * P32b (26/09/2026) — correção direta ao feedback da Proprietária: "só
 * deixar o cadastro mais completo sem dedup e somente adicionando dado de
 * acordo com o avanço do lead". Removida a ação "resolver conflito com
 * motivo" (sobrescrever o valor do caso pelo canônico) — conflito agora é só
 * sinal informativo, nunca um botão de escrita. A única ação continua sendo
 * preencher o que está vazio a partir do cadastro canônico, nunca fundir ou
 * decidir entre dois valores preenchidos.
 */

type ItemPlanoCivil = {
  membroId: string;
  nome: string;
  acao: "preencher" | "conflito" | "ja_sincronizado" | "sem_dado_canonico" | "dependente_nao_sincronizado";
  valor?: string;
  atual?: string;
  canonico?: string;
};

const ROTULO_ACAO: Record<ItemPlanoCivil["acao"], string> = {
  preencher: "Vai preencher com o dado canônico",
  conflito: "Diverge do cadastro canônico — não é gravado automaticamente",
  ja_sincronizado: "Já bate com o cadastro canônico",
  sem_dado_canonico: "Cadastro canônico ainda sem este dado",
  dependente_nao_sincronizado: "Dependente — nunca herda este dado do responsável",
};

const ESTILO_ACAO: Record<ItemPlanoCivil["acao"], string> = {
  preencher: "border-gold/50 bg-gold/10 text-navy/80",
  conflito: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  ja_sincronizado: "border-navy/20 bg-cream/40 text-navy/70",
  sem_dado_canonico: "border-navy/10 bg-cream/30 text-navy/55",
  dependente_nao_sincronizado: "border-navy/10 bg-cream/30 text-navy/55",
};

function BlocoCampoCivil({ caseId, campo, onMudou }: { caseId: string; campo: CampoCivilReconciliavel; onMudou: () => void }) {
  const conferir = useServerFn(conferirDivergenciaCampoCivilMembrosCaso);
  const [plano, setPlano] = useState<ItemPlanoCivil[] | null>(null);
  const [aberto, setAberto] = useState(false);
  const rotulo = ROTULO_CAMPO_CIVIL[campo];

  const mVerificar = useMutation({
    mutationFn: (confirmar: boolean) => conferir({ data: { caseId, campo, confirmar } }),
    onSuccess: (r: any) => {
      setPlano(Array.isArray(r.plano) ? r.plano : []);
      setAberto(true);
      if (!r.simulado && r.atualizados > 0) onMudou();
    },
  });

  const preencher = plano ? plano.filter((p) => p.acao === "preencher").length : 0;
  const conflitos = plano ? plano.filter((p) => p.acao === "conflito").length : 0;

  return (
    <div className="rounded-md border border-navy/10 bg-white/40 p-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-navy">{rotulo}</p>
        <div className="flex flex-wrap items-center gap-2">
          {plano && !aberto ? (
            <span className="text-[11px] text-navy/55">
              {preencher > 0 ? `${preencher} a preencher` : ""}
              {preencher > 0 && conflitos > 0 ? " · " : ""}
              {conflitos > 0 ? `${conflitos} em conflito` : ""}
              {preencher === 0 && conflitos === 0 ? "Tudo sincronizado" : ""}
            </span>
          ) : null}
          <button
            type="button"
            disabled={mVerificar.isPending}
            onClick={() => (aberto ? setAberto(false) : mVerificar.mutate(false))}
            className="rounded border border-navy/20 px-2 py-1 text-[11px] text-navy hover:bg-cream/50"
          >
            {aberto ? "Recolher" : "Ver"}
          </button>
          {aberto && preencher > 0 ? (
            <button
              type="button"
              disabled={mVerificar.isPending}
              onClick={() => mVerificar.mutate(true)}
              className="rounded bg-navy px-2 py-1 text-[11px] text-cream hover:bg-navy/90 disabled:opacity-40"
            >
              Preencher pendentes
            </button>
          ) : null}
        </div>
      </div>

      {aberto && plano && plano.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {plano
            .filter((p) => p.acao === "conflito" || p.acao === "preencher")
            .map((p) => (
              <li key={p.membroId} className={`rounded border p-1.5 text-[11px] ${ESTILO_ACAO[p.acao]}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{p.nome}</span>
                  <span className="uppercase tracking-wide">{ROTULO_ACAO[p.acao]}</span>
                </div>
                {p.acao === "conflito" ? (
                  <p className="mt-1">
                    No caso: {p.atual ?? "—"} · No cadastro canônico: {p.canonico ?? "—"} — só sinal, nada é
                    sobrescrito automaticamente.
                  </p>
                ) : null}
              </li>
            ))}
          {plano.every((p) => p.acao !== "conflito" && p.acao !== "preencher") ? (
            <li className="text-[11px] text-navy/55">Nenhuma pendência — todos sincronizados ou sem dado canônico.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

export function PainelDadosCivisMembrosCaso({ caseId, onMudou }: { caseId: string; onMudou: () => void }) {
  return (
    <section className="rounded-lg border border-navy/15 bg-cream/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Conferir dados civis dos membros com o cadastro canônico</h3>
        <span className="text-[11px] text-navy/55">Pessoa Canônica · nunca funde automaticamente</span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        E-mail, RG, nacionalidade, data de nascimento, profissão e estado civil — o mesmo dado existe em `clientes`
        e em `case_members` sem nunca terem sido comparados. Um painel só, um bloco por campo: só preenche o que
        está vazio a partir do cadastro canônico; conflito (os dois já preenchidos, divergentes) é só sinal — não
        funde, não sobrescreve.
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {CAMPOS_CIVIS_RECONCILIAVEIS.map((campo) => (
          <BlocoCampoCivil key={campo} caseId={caseId} campo={campo} onMudou={onMudou} />
        ))}
      </div>
    </section>
  );
}
