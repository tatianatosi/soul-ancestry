import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  sincronizarContatoPartesDoCaso,
  CAMPOS_CONTATO_PARTE_RECONCILIAVEIS,
  ROTULO_CAMPO_CONTATO_PARTE,
  type CampoContatoParte,
  type DecisaoConflitoContrato,
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
  acao:
    | "preencher"
    | "conflito"
    | "conflito_aceito"
    | "ja_sincronizado"
    | "sem_dado_canonico"
    | "dependente_nao_sincronizado";
  valor?: string;
  atual?: string;
  canonico?: string;
};

const ROTULO_ACAO: Record<ItemPlanoContato["acao"], string> = {
  preencher: "Vai preencher com o dado canônico",
  conflito: "Diverge do cadastro canônico — decisão humana pendente",
  conflito_aceito: "Divergência mantida por decisão humana (com motivo registrado)",
  ja_sincronizado: "Já bate com o cadastro canônico",
  sem_dado_canonico: "Cadastro canônico ainda sem este dado",
  dependente_nao_sincronizado: "Dependente — nunca herda este dado do responsável",
};

const ESTILO_ACAO: Record<ItemPlanoContato["acao"], string> = {
  preencher: "border-gold/50 bg-gold/10 text-navy/80",
  conflito: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  conflito_aceito: "border-navy/20 bg-cream/40 text-navy/70",
  ja_sincronizado: "border-navy/20 bg-cream/40 text-navy/70",
  sem_dado_canonico: "border-navy/10 bg-cream/30 text-navy/55",
  dependente_nao_sincronizado: "border-navy/10 bg-cream/30 text-navy/55",
};

/**
 * Fase E (27/09/2026): 3 decisões explícitas para um conflito de nome/
 * e-mail/telefone/endereço, cada uma exigindo motivo. Endereço nunca
 * oferece "corrigir cadastro canônico" (composto de 7 colunas — não dá
 * para fatiar uma string livre de volta com segurança).
 */
function ResolverConflitoContato({
  item,
  campo,
  contratoAssinado,
  ocupado,
  onResolver,
}: {
  item: ItemPlanoContato;
  campo: CampoContatoParte;
  contratoAssinado?: boolean;
  ocupado?: boolean;
  onResolver: (decisao: DecisaoConflitoContrato, motivo: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  if (contratoAssinado) return null;
  if (!aberto) {
    return (
      <button
        type="button"
        disabled={ocupado}
        onClick={() => setAberto(true)}
        className="mt-1 rounded border border-terracotta/40 px-1.5 py-0.5 text-[10px] font-medium text-terracotta hover:bg-terracotta/10 disabled:opacity-50"
      >
        Resolver conflito
      </button>
    );
  }
  return (
    <div className="mt-1.5 space-y-1.5 rounded border border-terracotta/30 bg-white/60 p-1.5">
      <textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo da decisão (obrigatório)"
        className="w-full rounded border border-navy/20 p-1 text-[10px]"
        rows={2}
      />
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          disabled={ocupado || !motivo.trim()}
          onClick={() => onResolver("atualizar_snapshot", motivo)}
          className="rounded bg-navy px-1.5 py-0.5 text-[10px] text-cream hover:bg-navy/90 disabled:opacity-40"
        >
          Atualizar contrato
        </button>
        {campo !== "endereco" ? (
          <button
            type="button"
            disabled={ocupado || !motivo.trim()}
            onClick={() => onResolver("corrigir_pessoa_canonica", motivo)}
            className="rounded border border-navy/25 px-1.5 py-0.5 text-[10px] text-navy hover:bg-cream/50 disabled:opacity-40"
          >
            Corrigir cadastro
          </button>
        ) : null}
        <button
          type="button"
          disabled={ocupado || !motivo.trim()}
          onClick={() => onResolver("manter_com_motivo", motivo)}
          className="rounded border border-navy/25 px-1.5 py-0.5 text-[10px] text-navy hover:bg-cream/50 disabled:opacity-40"
        >
          Manter (com motivo)
        </button>
      </div>
    </div>
  );
}

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

  const mResolver = useMutation({
    mutationFn: (vars: { id: string; decisao: DecisaoConflitoContrato; motivo: string }) =>
      sincronizar({ data: { caseId, campo, resolverPartyId: vars.id, decisao: vars.decisao, motivo: vars.motivo } }),
    onSuccess: (r: any) => {
      setPlano(Array.isArray(r.plano) ? r.plano : plano);
      if (r.atualizados > 0) onMudou();
    },
  });

  const preencher = plano ? plano.filter((p) => p.acao === "preencher").length : 0;
  const conflitos = plano
    ? plano.filter((p) => p.acao === "conflito" || p.acao === "conflito_aceito").length
    : 0;

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
            .filter((p) => p.acao === "conflito" || p.acao === "conflito_aceito" || p.acao === "preencher")
            .map((p) => (
              <li key={p.id} className={`rounded border p-1.5 text-[11px] ${ESTILO_ACAO[p.acao]}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{p.parte}</span>
                  <span className="uppercase tracking-wide">{ROTULO_ACAO[p.acao]}</span>
                </div>
                {p.acao === "conflito" || p.acao === "conflito_aceito" ? (
                  <>
                    <p className="mt-1">
                      Na parte do contrato: {p.atual ?? "—"} · No cadastro canônico: {p.canonico ?? "—"}
                      {p.acao === "conflito" ? " — decisão humana pendente." : " — decisão humana já registrada."}
                    </p>
                    <ResolverConflitoContato
                      item={p}
                      campo={campo}
                      contratoAssinado={contratoAssinado}
                      ocupado={mResolver.isPending}
                      onResolver={(decisao, motivo) => mResolver.mutate({ id: p.id, decisao, motivo })}
                    />
                  </>
                ) : null}
              </li>
            ))}
          {plano.every((p) => p.acao !== "conflito" && p.acao !== "conflito_aceito" && p.acao !== "preencher") ? (
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
