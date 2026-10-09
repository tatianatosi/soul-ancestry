/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Roteiro mestre da Mesa Discovery (documentos da Proprietária de
 * 10–11/08/2026, executados em 27/09/2026): Abertura com 4 consentimentos,
 * resposta narrativa por pergunta com origem, bloco SPIN com nota/dispensa,
 * extensões por país e Fechamento/pós-call em níveis. Tudo grava no lead
 * canônico (`leads.discovery_registro`) e relê do servidor; nada disto vai ao
 * App Cliente, e nada cria caso, proposta, contrato, cobrança ou SKU.
 */
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import type { LeadDesk } from "@/lib/crm-desk";
import { AVISO_PRIVACIDADE } from "@/lib/decisoes-da-proprietaria";
import {
  registrarBlocoDiscovery,
  salvarConsentimentosDiscovery,
  salvarPosCallDiscovery,
  salvarRespostaDiscovery,
} from "@/lib/crm-desk.functions";
import {
  ABERTURA_ROTEIRO,
  CANAIS_CALL,
  CONSENTIMENTOS,
  DECISOES_POS_CALL,
  FECHAMENTO_ROTEIRO,
  HIPOTESES_ROTA,
  MATURIDADES,
  ORIGENS_RESPOSTA,
  PRECISA_PROPOSTA,
  RESPOSTAS_CONSENTIMENTO,
  SIM_NAO,
  URGENCIAS,
  extensoesDoLead,
  idPerguntaExtensao,
  pendenciasPosCall,
  type PosCall,
  type TipoConsentimento,
} from "@/lib/discovery-roteiro-mestre";
import { MOTIVO_DISPENSA_MINIMO, situacaoBlocos, type RegistroDiscovery } from "@/lib/discovery-registro";
import type { EtapaSpin } from "@/lib/discovery-roteiro";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

type Props = { lead: LeadDesk; registro: RegistroDiscovery; onSalvo: () => void; onAviso: (t: string) => void };

const erroDe = (r: any) => (r && r.ok === false ? String(r.erro ?? "Não gravado.") : null);

/* ------------------------------------------------------------------ */

export function AberturaConsentimentos({ lead, registro, onSalvo, onAviso }: Props) {
  const salvar = useServerFn(salvarConsentimentosDiscovery);
  const m = useMutation({
    mutationFn: (p: { tipo: TipoConsentimento; valor: string }) =>
      salvar({ data: { leadId: lead.id as string, consentimentos: { [p.tipo]: p.valor || null }, canal: "verbal_em_call" } }),
    onSuccess: (r: any) => {
      const e = erroDe(r);
      if (e) return onAviso(e);
      onAviso("Consentimento gravado no lead.");
      onSalvo();
    },
    onError: (e: Error) => onAviso(e.message),
  });
  const gravacaoDoLead =
    lead.consentimento_status === "concedido" ? "sim" : lead.consentimento_status === "recusado" ? "nao" : "";
  return (
    <Secao
      titulo="Abertura e consentimentos"
      descricao="Antes das perguntas. Cada consentimento é separado — 'consentimento lido' não vale para tudo."
    >
      <ul className="mb-3 list-disc space-y-1 pl-5 text-xs text-navy/70" data-abertura-roteiro>
        {ABERTURA_ROTEIRO.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {/*
        D-01 ligado (03/10/2026): o registro deixa de ser cego. Quem concede
        precisa saber QUAL aviso foi apresentado, e o banco exige a versão
        junto com data e canal — era exatamente a peça que faltava e que
        fazia o gate falhar em silêncio.
      */}
      <p className="mb-3 text-[11px] text-navy/60" data-aviso-privacidade>
        Aviso apresentado: <strong>{AVISO_PRIVACIDADE.versao}</strong> ·{" "}
        <a
          href={AVISO_PRIVACIDADE.url}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-gold underline-offset-2"
        >
          política de privacidade publicada
        </a>{" "}
        · {AVISO_PRIVACIDADE.anexoContratual}. O consentimento concedido grava data, canal e esta versão.
      </p>
      <div className="grid gap-3 md:grid-cols-2" data-consentimentos>
        {CONSENTIMENTOS.map((c) => (
          <Selecao
            key={c.tipo}
            label={c.rotulo}
            ajuda={c.cobre}
            valor={c.tipo === "gravacao" ? (registro.consentimentos.gravacao ?? gravacaoDoLead) : (registro.consentimentos[c.tipo] ?? "")}
            opcoes={RESPOSTAS_CONSENTIMENTO}
            desabilitado={m.isPending}
            onChange={(v) => m.mutate({ tipo: c.tipo, valor: v })}
          />
        ))}
      </div>
    </Secao>
  );
}

/* ------------------------------------------------------------------ */

/** Resposta narrativa da pergunta: texto amplo, origem e "não sabe / não tem agora". */
export function RespostaNarrativa({
  lead,
  registro,
  perguntaId,
  onSalvo,
  onAviso,
}: Props & { perguntaId: string }) {
  const salvo = registro.respostas[perguntaId];
  const [texto, setTexto] = useState(salvo?.texto ?? "");
  const [origem, setOrigem] = useState(salvo?.origem ?? "relato_call");
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    texto !== (salvo?.texto ?? "") || origem !== (salvo?.origem ?? "relato_call"),
  );
  useEffect(() => {
    setTexto(salvo?.texto ?? "");
    setOrigem(salvo?.origem ?? "relato_call");
  }, [perguntaId, lead.id, salvo?.em]); // eslint-disable-line react-hooks/exhaustive-deps
  const salvar = useServerFn(salvarRespostaDiscovery);
  const m = useMutation({
    mutationFn: (p: { naoSabe: boolean }) =>
      salvar({ data: { leadId: lead.id as string, perguntaId, texto, origem, naoSabe: p.naoSabe } }),
    onSuccess: (r: any) => {
      const e = erroDe(r);
      if (e) return onAviso(e);
      onAviso("Resposta gravada no lead.");
      onSalvo();
    },
    onError: (e: Error) => onAviso(e.message),
  });
  const sujo = texto !== (salvo?.texto ?? "") || origem !== (salvo?.origem ?? "relato_call");
  return (
    <div className="mt-3 space-y-2 border-t border-navy/10 pt-3" data-resposta-narrativa={perguntaId}>
      <Texto
        label="Resposta do cliente (nas palavras dele)"
        area
        valor={texto}
        onChange={setTexto}
        ajuda="Nomes, lugares, datas e parentescos que não cabem nos campos acima. Relato não é prova."
      />
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[12rem]">
          <Selecao label="Origem da resposta" valor={origem} opcoes={ORIGENS_RESPOSTA} onChange={setOrigem} />
        </div>
        <button
          type="button"
          disabled={!sujo || m.isPending}
          onClick={() => m.mutate({ naoSabe: false })}
          className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
        >
          Gravar resposta
        </button>
        <button
          type="button"
          disabled={m.isPending}
          onClick={() => m.mutate({ naoSabe: true })}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
        >
          Não sabe / não tem agora
        </button>
        {salvo?.nao_sabe ? <span className="text-[11px] text-navy/60">Lacuna registrada.</span> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const ROTULO_ESTADO_BLOCO = {
  completo: "Completo",
  dispensado: "Dispensado",
  em_andamento: "Em andamento",
  pendente: "Pendente",
} as const;

/** Estado dos 4 blocos SPIN + nota opcional e dispensa com motivo do bloco atual. */
export function BlocoSpinCard({ lead, registro, etapa, onSalvo, onAviso }: Props & { etapa: EtapaSpin }) {
  const situacao = situacaoBlocos(lead, registro);
  const atual = situacao.find((b) => b.etapa === etapa)!;
  const [nota, setNota] = useState(atual.nota ?? "");
  const [motivo, setMotivo] = useState(atual.motivoDispensa ?? "");
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    nota !== (atual.nota ?? "") || motivo !== (atual.motivoDispensa ?? ""),
  );
  useEffect(() => {
    setNota(atual.nota ?? "");
    setMotivo(atual.motivoDispensa ?? "");
  }, [etapa, lead.id, atual.nota, atual.motivoDispensa]);
  const salvar = useServerFn(registrarBlocoDiscovery);
  const m = useMutation({
    mutationFn: (p: { dispensado?: boolean }) =>
      salvar({ data: { leadId: lead.id as string, bloco: etapa, nota, dispensado: p.dispensado, motivo } }),
    onSuccess: (r: any) => {
      const e = erroDe(r);
      if (e) return onAviso(e);
      onAviso("Bloco gravado no lead.");
      onSalvo();
    },
    onError: (e: Error) => onAviso(e.message),
  });
  return (
    <div className="mb-3 rounded-xl border border-navy/10 bg-cream/20 p-3" data-bloco-spin={etapa}>
      <div className="mb-2 flex flex-wrap gap-2">
        {situacao.map((b) => (
          <span
            key={b.etapa}
            data-estado-bloco={b.estado}
            className={`rounded-full border px-2 py-0.5 text-[11px] ${
              b.etapa === etapa ? "border-gold bg-gold/15 text-navy" : "border-navy/15 text-navy/65"
            }`}
          >
            {b.rotulo}: {ROTULO_ESTADO_BLOCO[b.estado]} ({b.respondidas}/{b.total})
          </span>
        ))}
      </div>
      <Texto label={`Nota do bloco ${atual.rotulo} (opcional)`} area valor={nota} onChange={setNota} />
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <button
          type="button"
          disabled={m.isPending || nota === (atual.nota ?? "")}
          onClick={() => m.mutate({})}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy disabled:opacity-40"
        >
          Gravar nota
        </button>
        <div className="min-w-[16rem] flex-1">
          <Texto label="Motivo para dispensar este bloco" valor={motivo} onChange={setMotivo} />
        </div>
        {atual.estado === "dispensado" ? (
          <button
            type="button"
            disabled={m.isPending}
            onClick={() => m.mutate({ dispensado: false })}
            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
          >
            Retomar bloco
          </button>
        ) : (
          <button
            type="button"
            disabled={m.isPending || motivo.trim().length < MOTIVO_DISPENSA_MINIMO}
            onClick={() => m.mutate({ dispensado: true })}
            className="rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs text-terracotta disabled:opacity-40"
          >
            Dispensar bloco
          </button>
        )}
      </div>
      {atual.estado === "dispensado" ? (
        <p className="mt-1 text-[11px] text-navy/60">Dispensado: {atual.motivoDispensa}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Perguntas curtas por país, dentro da Situação. Contexto sempre "a validar". */
export function ExtensoesPais(props: Props) {
  const extensoes = extensoesDoLead(props.lead);
  if (!extensoes.length) {
    return (
      <p className="mt-3 text-[11px] text-navy/55" data-extensoes-pais="vazio">
        Extensões por país aparecem quando o país de interesse estiver registrado.
      </p>
    );
  }
  return (
    <div className="mt-4 space-y-4" data-extensoes-pais>
      {extensoes.map((e) => (
        <div key={e.pais} className="rounded-xl border border-navy/10 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">
            Extensão {e.rotulo}
            {e.pendenteValidacao ? " · pendente de validação humana" : ""}
          </p>
          <p className="mt-0.5 text-[11px] text-navy/50">{e.contexto}</p>
          {e.perguntas.map((p) => (
            <div key={p.id} className="mt-2">
              <p className="text-sm text-navy">{p.pergunta}</p>
              <RespostaNarrativa {...props} perguntaId={idPerguntaExtensao(e.pais, p.id)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Fechamento + pós-call: nível 1 sempre; nível 2 quando a call qualificou. Pendência informa, não trava. */
export function FechamentoPosCall({ lead, registro, onSalvo, onAviso }: Props) {
  const [pos, setPos] = useState<Partial<PosCall>>(registro.pos_call);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(JSON.stringify(pos) !== JSON.stringify(registro.pos_call));
  useEffect(() => setPos(registro.pos_call), [lead.id, JSON.stringify(registro.pos_call)]); // eslint-disable-line react-hooks/exhaustive-deps
  const salvar = useServerFn(salvarPosCallDiscovery);
  const m = useMutation({
    mutationFn: () => salvar({ data: { leadId: lead.id as string, posCall: pos as Record<string, unknown> } }),
    onSuccess: (r: any) => {
      const e = erroDe(r);
      if (e) return onAviso(e);
      onAviso("Pós-call gravado no lead.");
      onSalvo();
    },
    onError: (e: Error) => onAviso(e.message),
  });
  const set = (k: keyof PosCall) => (v: string) => setPos((p) => ({ ...p, [k]: v || null }));
  const val = (k: keyof PosCall) => String(pos[k] ?? "");
  const pend = pendenciasPosCall(lead, pos, registro.consentimentos);
  const sujo = JSON.stringify(pos) !== JSON.stringify(registro.pos_call);
  return (
    <Secao
      titulo="Fechamento e pós-call"
      descricao="Resumo factual, sem conclusão jurídica. Hipótese de rota é sempre pendente de validação humana. Produto e preço não entram aqui."
    >
      <ul className="mb-3 list-disc space-y-1 pl-5 text-xs text-navy/70" data-fechamento-roteiro>
        {FECHAMENTO_ROTEIRO.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">Nível 1 — toda call</p>
      <div className="mt-2 grid gap-3 md:grid-cols-2" data-pos-call-nivel1>
        <Selecao label="Canal da call" valor={val("canal")} opcoes={CANAIS_CALL} onChange={set("canal")} />
        <Texto label="Participantes" valor={val("participantes")} onChange={set("participantes")} />
      </div>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-navy/55">
        Nível 2 — oportunidade qualificada{pend.qualificada ? "" : " (preencha quando a call qualificar)"}
      </p>
      <div className="mt-2 grid gap-3 md:grid-cols-2" data-pos-call-nivel2>
        <Texto label="Linha investigada (sobrenome/ancestral)" valor={val("linha_investigada")} onChange={set("linha_investigada")} />
        <Selecao label="Maturidade" valor={val("maturidade")} opcoes={MATURIDADES} onChange={set("maturidade")} />
        <Selecao label="Urgência declarada" valor={val("urgencia")} opcoes={URGENCIAS} onChange={set("urgencia")} />
        <Selecao
          label="Hipótese de rota (pendente de validação humana)"
          valor={val("hipotese_rota")}
          opcoes={HIPOTESES_ROTA}
          onChange={set("hipotese_rota")}
        />
        <Selecao label="Precisa de proposta?" valor={val("precisa_proposta")} opcoes={PRECISA_PROPOSTA} onChange={set("precisa_proposta")} />
        <Selecao label="Proposta enviada?" valor={val("proposta_enviada")} opcoes={SIM_NAO} onChange={set("proposta_enviada")} />
        <Selecao label="Diagnóstico solicitado?" valor={val("diagnostico_solicitado")} opcoes={SIM_NAO} onChange={set("diagnostico_solicitado")} />
        <Selecao label="Diagnóstico entregue?" valor={val("diagnostico_entregue")} opcoes={SIM_NAO} onChange={set("diagnostico_entregue")} />
        {pos.diagnostico_entregue === "sim" ? (
          <Texto label="Diagnóstico entregue em" tipo="date" valor={val("diagnostico_entregue_em").slice(0, 10)} onChange={set("diagnostico_entregue_em")} />
        ) : null}
        <Selecao label="Decisão pós-call" valor={val("decisao")} opcoes={DECISOES_POS_CALL} onChange={set("decisao")} />
        <Texto label="Lacunas, dúvidas e bloqueadores" area valor={val("lacunas")} onChange={set("lacunas")} />
        <Texto label="O que NÃO pode aparecer no App" area valor={val("restricoes_app")} onChange={set("restricoes_app")} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!sujo || m.isPending}
          onClick={() => m.mutate()}
          className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
        >
          Gravar pós-call
        </button>
      </div>
      {pend.nivel1.length || pend.nivel2.length ? (
        <div className="mt-3 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70" data-pendencias-pos-call>
          Pendências do pós-call (informam, não travam):{" "}
          {[...pend.nivel1, ...pend.nivel2].map((p) => p.rotulo).join(" · ")}
        </div>
      ) : (
        <p className="mt-3 text-xs text-navy/60">Pós-call completo para este nível.</p>
      )}
    </Secao>
  );
}

/* ------------------------------------------------------------------ */

const ROTULO_DECISAO = { aceita: "Aceita", rejeitada: "Rejeitada", hipotese: "Hipótese" } as const;

/** Histórico da Discovery lido do próprio lead — visível a toda a equipe (não só admin). */
export function DecisoesDiscovery({ registro }: { registro: RegistroDiscovery }) {
  const sugestoes = [...registro.sugestoes].sort((a, b) => (a.em < b.em ? 1 : -1));
  const respostas = Object.keys(registro.respostas).length;
  return (
    <div className="rounded-xl border border-navy/10 bg-cream/30 p-3" data-decisoes-discovery>
      <p className="text-xs font-medium uppercase tracking-wide text-navy/60">Histórico da Discovery</p>
      <p className="mt-1 text-xs text-navy/60">
        {respostas} resposta(s) registrada(s) · {sugestoes.length} sugestão(ões) decidida(s)
      </p>
      {sugestoes.length ? (
        <ul className="mt-2 space-y-1">
          {sugestoes.slice(0, 12).map((s) => (
            <li key={s.id} className="text-xs text-navy/75">
              <strong>{ROTULO_DECISAO[s.decisao]}</strong> · {s.campo}: {s.valor}
              {s.origem.autor ? ` · disse ${s.origem.autor}` : ""}
              {s.origem.trecho ? ` · “${s.origem.trecho}”` : ""}
              {s.em ? ` · ${s.em.slice(0, 10)}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
