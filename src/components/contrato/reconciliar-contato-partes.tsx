import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  sincronizarContatoPartesDoCaso,
  CAMPOS_CONTATO_PARTE_RECONCILIAVEIS,
  ROTULO_CAMPO_CONTATO_PARTE,
  type CampoContatoParte,
} from "@/lib/contratos.functions";

/**
 * Fase 0 (27/09/2026) — "Prompt Canônicos": generaliza `ReconciliarCpfPartes`
 * (já em produção, só CPF) para nome/e-mail/telefone — mesmo princípio sem
 * dedup: só preenche o que está vazio; um valor já preenchido e divergente é
 * só sinal, nunca um botão de "usar o canônico". Corte 4 do plano de motor
 * jurídico/Caso 360 unificado (27/09/2026) estendeu o mesmo mecanismo para
 * endereço (composto a partir dos campos estruturados de `clientes`).
 */

type ItemPlanoContato = {
  parte: string;
  id: string;
  acao: "preencher" | "conflito" | "ja_sincronizado" | "sem_dado_canonico" | "dependente_nao_sincronizado";
  valor?: string;
  atual?: string;
  canonico?: string;
};

const ROTULO_ACAO: Record<ItemPlanoContato["acao"], string> = {
  preencher: "Vai preencher com o dado canônico",
  conflito: "Diverge do cadastro canônico — não é gravado automaticamente",
  ja_sincronizado: "Já bate com o cadastro canônico",
  sem_dado_canonico: "Cadastro canônico ainda sem este dado",
  dependente_nao_sincronizado: "Dependente — nunca herda este dado do responsável",
};

const ESTILO_ACAO: Record<ItemPlanoContato["acao"], string> = {
  preencher: "border-gold/50 bg-gold/10 text-navy/80",
  conflito: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  ja_sincronizado: "border-navy/20 bg-cream/40 text-navy/70",
  sem_dado_canonico: "border-navy/10 bg-cream/30 text-navy/55",
  dependente_nao_sincronizado: "border-navy/10 bg-cream/30 text-navy/55",
};

function BlocoCampoContato({
  caseId,
  campo,
  contratoAssinado,
  onMudou,
}: {
  caseId: string;
  campo: CampoContatoParte;
  contratoAssinado?: boolean;
  onMudou: () => void;
}) {
  const sincronizar = useServerFn(sincronizarContatoPartesDoCaso);
  const [plano, setPlano] = useState<ItemPlanoContato[] | null>(null);
  const [aberto, setAberto] = useState(false);
  const rotulo = ROTULO_CAMPO_CONTATO_PARTE[campo];

  const mVerificar = useMutation({
    mutationFn: (confirmar: boolean) => sincronizar({ data: { caseId, campo, confirmar } }),
    onSuccess: (r: any) => {
      setPlano(Array.isArray(r.plano) ? r.plano : []);
      setAberto(true);
      if (!r.simulado && r.atualizados > 0) onMudou();
      // Fase C (27/09/2026): preenchimento de campo vazio passa a ser
      // automático — conflito continua só sinal, nunca escrito sozinho.
      // Nunca dispara em contrato já assinado (snapshot imutável).
      if (r.simulado && !contratoAssinado && Array.isArray(r.plano) && r.plano.some((p: any) => p.acao === "preencher")) {
        mVerificar.mutate(true);
      }
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
          {aberto && preencher > 0 && !contratoAssinado ? (
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
              <li key={p.id} className={`rounded border p-1.5 text-[11px] ${ESTILO_ACAO[p.acao]}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{p.parte}</span>
                  <span className="uppercase tracking-wide">{ROTULO_ACAO[p.acao]}</span>
                </div>
                {p.acao === "conflito" ? (
                  <p className="mt-1">
                    Na parte do contrato: {p.atual ?? "—"} · No cadastro canônico: {p.canonico ?? "—"} — só
                    sinal, nada é sobrescrito automaticamente.
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

export function ReconciliarContatoPartesContrato({
  caseId,
  contratoAssinado,
  onMudou,
}: {
  caseId: string;
  contratoAssinado?: boolean;
  onMudou: () => void;
}) {
  return (
    <section className="rounded-lg border border-navy/15 bg-cream/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">
          Conferir nome, e-mail, telefone e endereço das partes com o cadastro canônico
        </h3>
        <span className="text-[11px] text-navy/55">Pessoa Canônica · nunca funde automaticamente</span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        `contract_parties` é o snapshot da parte no contrato; `clientes` é a Pessoa Canônica viva. Só
        preenche o que está vazio a partir do cadastro canônico; conflito (os dois já preenchidos,
        divergentes) é só sinal — não funde, não sobrescreve. Endereço compara a string composta do
        endereço estruturado de `clientes` contra o texto livre do contrato.
      </p>
      {contratoAssinado ? (
        <p className="mt-2 text-xs text-terracotta">
          Contrato já assinado: partes não podem ser alteradas por aqui — o snapshot permanece
          imutável.
        </p>
      ) : null}
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CAMPOS_CONTATO_PARTE_RECONCILIAVEIS.map((campo) => (
          <BlocoCampoContato key={campo} caseId={caseId} campo={campo} contratoAssinado={contratoAssinado} onMudou={onMudou} />
        ))}
      </div>
    </section>
  );
}
