import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoDeEscrita } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import {
  carregarJornadaCaso,
  criarMicroentregaCliente,
  definirEsperaExterna,
  registrarInteracao,
  transicionarMicroentrega,
} from "@/lib/jornada-cliente.functions";
import { projetarMicroentregaParaApp } from "@/lib/biblioteca-evidencias.functions";
import {
  FASES_JORNADA,
  ROTULO_FASE,
  ROTULO_TIPO_ENTREGA,
  TIPOS_ENTREGA,
  TRANSICOES_ENTREGA,
  type StatusAprovacao,
} from "@/lib/jornada-cliente";

/* ------------------------------ primitivos ------------------------------ */

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-cream/50 p-5">
      <h3 className="font-serif text-lg text-navy">{titulo}</h3>
      {descricao ? <p className="mt-1 text-xs text-navy/55">{descricao}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Campo({
  label,
  valor,
  onChange,
  area,
  tipo = "text",
  desabilitado,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  area?: boolean;
  tipo?: string;
  desabilitado?: boolean;
}) {
  const cls =
    "mt-1 w-full rounded-lg border border-navy/15 bg-cream/40 px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:opacity-60";
  return (
    <label className="block text-xs uppercase tracking-wide text-navy/50">
      {label}
      {area ? (
        <textarea rows={3} className={cls} value={valor} disabled={desabilitado} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={tipo} className={cls} value={valor} disabled={desabilitado} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function Selecao({
  label,
  valor,
  onChange,
  opcoes,
  desabilitado,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  opcoes: { valor: string; rotulo: string }[];
  desabilitado?: boolean;
}) {
  return (
    <label className="block text-xs uppercase tracking-wide text-navy/50">
      {label}
      <select
        className="mt-1 w-full rounded-lg border border-navy/15 bg-cream/40 px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:opacity-60"
        value={valor}
        disabled={desabilitado}
        onChange={(e) => onChange(e.target.value)}
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Lista imutável usada como padrão de mapa constante — não é resultado de consulta. */
const SEM_TRANSICAO: readonly StatusAprovacao[] = [];

const CORES_CADENCIA: Record<string, string> = {
  regular: "bg-emerald-50 text-emerald-800 border-emerald-200",
  atencao: "bg-amber-50 text-amber-900 border-amber-200",
  critico: "bg-terracotta/10 text-terracotta border-terracotta/30",
};

/* -------------------------------- painel -------------------------------- */

export function AbaJornadaCliente({
  casoId,
  bloqueado: _bloqueado,
}: {
  casoId: string;
  /**
   * Mantida apenas por compatibilidade com quem chama em `src/routes/`.
   * Ignorada: a autoridade é decidida por `useAutoridade`/`AcaoOperacional`.
   */
  bloqueado?: boolean;
}) {
  const qc = useQueryClient();
  const carregar = useServerFn(carregarJornadaCaso);
  const registrar = useServerFn(registrarInteracao);
  const espera = useServerFn(definirEsperaExterna);
  const criarEntrega = useServerFn(criarMicroentregaCliente);
  const transicionar = useServerFn(transicionarMicroentrega);
  const projetar = useServerFn(projetarMicroentregaParaApp);

  const q = useQuery({
    queryKey: ["jornada-cliente", casoId],
    queryFn: () => carregar({ data: { casoId } }),
  });

  const invalidar = () => qc.invalidateQueries({ queryKey: ["jornada-cliente", casoId] });
  // Autoridade operacional: nenhum gate de domínio desabilita controle aqui.
  // O vínculo somente leitura do servidor vira pendência declarada, levada a
  // `AcaoOperacional`; apenas falta de papel ou de organização bloqueia, e essa
  // decisão é do motor de autoridade, não desta tela.
  const pendenciaJornada =
    q.data && !q.data.podeEscrever
      ? "Seu vínculo de equipe neste caso está marcado como somente leitura."
      : null;

  const [inter, setInter] = useState({
    tipo: "call",
    ocorridoEm: "",
    resumo: "",
    resultado: "",
    proximaAcao: "",
    prazo: "",
    visibilidade: "interna",
    touchpoint: false,
    feito: "",
    aguardando: "",
    naoDepende: "",
    marco: "",
  });

  const [entrega, setEntrega] = useState({
    tipo: "atualizacao_de_fase",
    fase: "onboarding",
    titulo: "",
    resumo: "",
    deepLink: "",
    referencia: "",
  });

  const mRegistrar = useMutation({
    mutationFn: () =>
      registrar({
        data: {
          casoId,
          tipo: inter.tipo,
          ocorridoEm: inter.ocorridoEm || undefined,
          resumoInterno: inter.resumo,
          resultado: inter.resultado || null,
          proximaAcao: inter.proximaAcao || null,
          prazoProximaAcao: inter.prazo || null,
          visibilidade: inter.visibilidade as "interna" | "cliente_aprovado",
          contaComoTouchpoint: inter.touchpoint,
          touchpoint: inter.touchpoint
            ? {
                oQueFoiFeito: inter.feito,
                oQueEstaAguardando: inter.aguardando,
                oQueNaoDependeDoCliente: inter.naoDepende,
                proximoMarcoVerificavel: inter.marco,
              }
            : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Interação registrada. Registros são imutáveis.");
      setInter((s) => ({ ...s, resumo: "", resultado: "", proximaAcao: "", prazo: "", feito: "", aguardando: "", naoDepende: "", marco: "" }));
      void invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mEntrega = useMutation({
    mutationFn: () =>
      criarEntrega({
        data: {
          casoId,
          tipo: entrega.tipo,
          fase: entrega.fase,
          tituloCliente: entrega.titulo,
          resumoAprovado: entrega.resumo,
          deepLink: entrega.deepLink || null,
          referenciaInterna: entrega.referencia || null,
        },
      }),
    onSuccess: () => {
      toast.success("Micro-entrega criada em rascunho.");
      setEntrega((s) => ({ ...s, titulo: "", resumo: "", deepLink: "", referencia: "" }));
      void invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mTransicao = useMutation({
    mutationFn: (v: { entregaId: string; para: StatusAprovacao }) => transicionar({ data: v }),
    onSuccess: () => {
      toast.success("Status atualizado.");
      void invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mProjetar = useMutation({
    mutationFn: (v: { entregaId: string }) => projetar({ data: v }),
    onSuccess: (r) => {
      toast.success(
        r.criado
          ? "Projeção criada em rascunho na Biblioteca Mestre. Segue revisão e aprovação por lá antes de liberar ao App."
          : "Esta micro-entrega já tinha uma projeção — nenhuma duplicada.",
      );
      void invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mEspera = useMutation({
    mutationFn: (v: { aguardando: boolean; motivo?: string }) => espera({ data: { casoId, ...v } }),
    onSuccess: () => {
      toast.success("Espera institucional atualizada.");
      void invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [motivoEspera, setMotivoEspera] = useState("");
  const caso = q.data?.caso as Record<string, unknown> | undefined;
  const cadencia = q.data?.cadencia;

  const publicadas = useMemo(
    () => q.data?.entregas?.filter((e) => e['approval_status'] === "publicado").length ?? 0,
    [q.data?.entregas],
  );

  if (q.isLoading) return <p className="text-sm text-navy/55">Carregando jornada…</p>;
  if (q.error) return <p className="text-sm text-terracotta">{(q.error as Error).message}</p>;

  return (
    <div className="space-y-4">
      {pendenciaJornada ? (
        <p className="rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaJornada} A operação segue disponível por decisão sua e a
          gravação pede motivo.
        </p>
      ) : null}
      <Secao titulo="Saúde do caso" descricao="Cadência de contato e espera institucional. Nenhuma projeção de prazo ou resultado.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className={"rounded-lg border p-4 " + (CORES_CADENCIA[cadencia?.status ?? "regular"] ?? "")}>
            <p className="text-[11px] uppercase tracking-wide opacity-70">Cadência</p>
            <p className="mt-1 font-serif text-2xl capitalize">{cadencia?.status ?? "—"}</p>
            <p className="mt-1 text-xs">{cadencia?.motivo}</p>
          </div>
          <div className="rounded-lg border border-navy/10 p-4">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">Dias sem touchpoint</p>
            <p className="mt-1 font-serif text-2xl text-navy">{cadencia?.diasSemTouchpoint ?? 0}</p>
            <p className="mt-1 text-xs text-navy/55">Limite operacional: 14 dias.</p>
          </div>
          <div className="rounded-lg border border-navy/10 p-4">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">Micro-entregas publicadas</p>
            <p className="mt-1 font-serif text-2xl text-navy">{publicadas}</p>
            <p className="mt-1 text-xs text-navy/55">Prontas para projetar ao App — chegam ao cliente só após revisão e aprovação na Biblioteca Mestre.</p>
          </div>
        </div>

        <div className="rounded-lg border border-navy/10 p-4">
          <p className="text-xs text-navy/55">
            Próximo marco verificável: <span className="text-navy">{String(caso?.['proximo_marco_verificavel'] ?? "não registrado")}</span>
          </p>
          {caso?.['aguardando_instituicao_externa'] ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-navy/15 px-3 py-1 text-xs text-navy/70">
                Aguardando instituição externa — {String(caso['motivo_espera_externa'] ?? "")}
              </span>
              <AcaoDeEscrita
                rotulo="Encerrar espera"
                capacidade="editar_fila_responsavel_prazo"
                pendenciaGate={pendenciaJornada}
                efeito="Encerra a espera institucional registrada neste caso."
                className="rounded-lg border border-navy/15 px-3 py-1 text-xs text-navy hover:bg-navy/5 disabled:opacity-50"
                onConfirmar={() => {
                  if (mEspera.isPending) return;
                  mEspera.mutate({ aguardando: false });
                }}
              />
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="min-w-[16rem] flex-1">
                <Campo label="Motivo da espera institucional" valor={motivoEspera} onChange={setMotivoEspera} />
              </div>
              <AcaoDeEscrita
                rotulo="Registrar espera"
                faltando={motivoEspera.trim() ? null : "Informe o motivo da espera institucional."}
                capacidade="editar_fila_responsavel_prazo"
                pendenciaGate={pendenciaJornada}
                efeito="Marca o caso como aguardando instituição externa, com o motivo registrado."
                className="rounded-lg bg-navy px-3 py-2 text-xs text-cream disabled:opacity-50"
                onConfirmar={() => {
                  if (mEspera.isPending) return;
                  mEspera.mutate({ aguardando: true, motivo: motivoEspera });
                }}
              />
            </div>
          )}
        </div>
      </Secao>

      <Secao
        titulo="Interações internas"
        descricao="Registro imutável. Correções não editam o histórico: geram novo registro vinculado."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Selecao
            label="Tipo"
            valor={inter.tipo}
            onChange={(v) => setInter((s) => ({ ...s, tipo: v }))}
           
            opcoes={[
              { valor: "call", rotulo: "Call" },
              { valor: "whatsapp", rotulo: "WhatsApp" },
              { valor: "email", rotulo: "E-mail" },
              { valor: "reuniao", rotulo: "Reunião" },
              { valor: "sistema", rotulo: "Sistema" },
              { valor: "outro", rotulo: "Outro" },
            ]}
          />
          <Campo label="Ocorrido em" tipo="datetime-local" valor={inter.ocorridoEm} onChange={(v) => setInter((s) => ({ ...s, ocorridoEm: v }))} />
          <div className="sm:col-span-2">
            <Campo label="Resumo interno" area valor={inter.resumo} onChange={(v) => setInter((s) => ({ ...s, resumo: v }))} />
          </div>
          <Campo label="Resultado" valor={inter.resultado} onChange={(v) => setInter((s) => ({ ...s, resultado: v }))} />
          <Campo label="Próxima ação" valor={inter.proximaAcao} onChange={(v) => setInter((s) => ({ ...s, proximaAcao: v }))} />
          <Campo label="Prazo da próxima ação" tipo="date" valor={inter.prazo} onChange={(v) => setInter((s) => ({ ...s, prazo: v }))} />
          <Selecao
            label="Visibilidade"
            valor={inter.visibilidade}
            onChange={(v) => setInter((s) => ({ ...s, visibilidade: v }))}
           
            opcoes={[
              { valor: "interna", rotulo: "Interna" },
              { valor: "cliente_aprovado", rotulo: "Aprovada para o cliente" },
            ]}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-navy/70">
          <input
            type="checkbox"
            checked={inter.touchpoint}
            onChange={(e) => setInter((s) => ({ ...s, touchpoint: e.target.checked }))}
          />
          Conta como touchpoint com o cliente (exige as quatro respostas)
        </label>

        {inter.touchpoint ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="O que foi feito" area valor={inter.feito} onChange={(v) => setInter((s) => ({ ...s, feito: v }))} />
            <Campo label="O que está sendo aguardado" area valor={inter.aguardando} onChange={(v) => setInter((s) => ({ ...s, aguardando: v }))} />
            <Campo label="O que não depende do cliente" area valor={inter.naoDepende} onChange={(v) => setInter((s) => ({ ...s, naoDepende: v }))} />
            <Campo label="Próximo marco verificável" area valor={inter.marco} onChange={(v) => setInter((s) => ({ ...s, marco: v }))} />
          </div>
        ) : null}

        <AcaoDeEscrita
          rotulo={mRegistrar.isPending ? "Registrando…" : "Registrar interação"}
          faltando={inter.resumo.trim() ? null : "Preencha o resumo interno antes de registrar."}
          capacidade="editar_rascunho"
          pendenciaGate={pendenciaJornada}
          efeito="Grava um registro imutável de interação interna neste caso."
          className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
          onConfirmar={() => {
            if (mRegistrar.isPending) return;
            mRegistrar.mutate();
          }}
        />

        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data?.interacoes}
          aoTentarNovamente={() => void q.refetch()}
          recurso="as interações internas"
          vazio="Nenhuma interação registrada."
        >
          {(interacoes) => (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                  <tr>
                    <th className="py-2 pr-3">Quando</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3">Resumo interno</th>
                    <th className="py-2 pr-3">Próxima ação</th>
                    <th className="py-2 pr-3">Visibilidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {interacoes.map((i) => (
                  <tr key={String(i['id'])} className="align-top">
                    <td className="py-2 pr-3 text-navy/70">{String(i['ocorrido_em'] ?? "").slice(0, 16).replace("T", " ")}</td>
                    <td className="py-2 pr-3 text-navy/70">{String(i['tipo'] ?? "")}</td>
                    <td className="py-2 pr-3 text-navy">{String(i['resumo_interno'] ?? "")}</td>
                    <td className="py-2 pr-3 text-navy/70">
                      {String(i['proxima_acao'] ?? "—")}
                      {i['prazo_proxima_acao'] ? ` · ${String(i['prazo_proxima_acao'])}` : ""}
                    </td>
                    <td className="py-2 pr-3 text-navy/70">{i['visibilidade'] === "cliente_aprovado" ? "Aprovada ao cliente" : "Interna"}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </EstadoDados>
      </Secao>

      <Secao
        titulo="Micro-entregas ao cliente"
        descricao="Texto já aprovado para o cliente. “Publicado” marca pronta — só chega ao App depois de projetada, revisada e aprovada na Biblioteca Mestre."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Selecao
            label="Tipo de entrega"
            valor={entrega.tipo}
            onChange={(v) => setEntrega((s) => ({ ...s, tipo: v }))}
           
            opcoes={TIPOS_ENTREGA.map((t) => ({ valor: t, rotulo: ROTULO_TIPO_ENTREGA[t] }))}
          />
          <Selecao
            label="Fase da jornada"
            valor={entrega.fase}
            onChange={(v) => setEntrega((s) => ({ ...s, fase: v }))}
           
            opcoes={FASES_JORNADA.map((f) => ({ valor: f, rotulo: ROTULO_FASE[f] }))}
          />
          <div className="sm:col-span-2">
            <Campo label="Título para o cliente" valor={entrega.titulo} onChange={(v) => setEntrega((s) => ({ ...s, titulo: v }))} />
          </div>
          <div className="sm:col-span-2">
            <Campo label="Resumo aprovado" area valor={entrega.resumo} onChange={(v) => setEntrega((s) => ({ ...s, resumo: v }))} />
          </div>
          <Campo label="Deep link no App Cliente" valor={entrega.deepLink} onChange={(v) => setEntrega((s) => ({ ...s, deepLink: v }))} />
          <Campo label="Referência interna" valor={entrega.referencia} onChange={(v) => setEntrega((s) => ({ ...s, referencia: v }))} />
        </div>

        <AcaoDeEscrita
          rotulo={mEntrega.isPending ? "Criando…" : "Criar rascunho de micro-entrega"}
          faltando={
            !entrega.titulo.trim()
              ? "Preencha o título para o cliente."
              : !entrega.resumo.trim()
                ? "Preencha o resumo aprovado."
                : null
          }
          capacidade="editar_rascunho"
          pendenciaGate={pendenciaJornada}
          efeito="Cria a micro-entrega em rascunho. Nada aparece no App Cliente antes de publicar, projetar, revisar e aprovar na Biblioteca Mestre."
          className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
          onConfirmar={() => {
            if (mEntrega.isPending) return;
            mEntrega.mutate();
          }}
        />

        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data?.entregas}
          aoTentarNovamente={() => void q.refetch()}
          recurso="as micro-entregas ao cliente"
          vazio="Nenhuma micro-entrega registrada."
        >
          {(entregas) => (
            <div className="space-y-3">
            {entregas.map((e) => {
              const status = String(e['approval_status'] ?? "rascunho") as StatusAprovacao;
              return (
                <div key={String(e['id'])} className="rounded-lg border border-navy/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-navy">{String(e['title_client'] ?? "")}</p>
                    <span className="rounded-full border border-navy/15 px-3 py-1 text-[11px] uppercase tracking-wide text-navy/60">{status}</span>
                  </div>
                  <p className="mt-1 text-xs text-navy/60">{String(e['summary_approved'] ?? "")}</p>
                  <p className="mt-1 text-[11px] text-navy/45">
                    {ROTULO_TIPO_ENTREGA[String(e['deliverable_type']) as keyof typeof ROTULO_TIPO_ENTREGA] ?? String(e['deliverable_type'] ?? "")}
                    {e['journey_phase'] ? ` · ${ROTULO_FASE[String(e['journey_phase']) as keyof typeof ROTULO_FASE] ?? String(e['journey_phase'])}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(TRANSICOES_ENTREGA[status] || SEM_TRANSICAO).map((p) => (
                      <AcaoOperacional
                        key={p}
                        rotulo={p === "publicado" ? "Publicar (pronta para o App)" : `Mover para ${p}`}
                        capacidade={p === "publicado" ? undefined : "aprovar_projecao_app_cliente"}
                        acaoExterna={p === "publicado" ? "publicar_no_app_cliente" : undefined}
                        pendenciaGate={pendenciaJornada}
                        efeito={
                          p === "publicado"
                            ? "Marca a micro-entrega como pronta. Ainda precisa ser projetada, revisada e aprovada na Biblioteca Mestre antes de chegar ao App Cliente."
                            : `Move a micro-entrega para o estado ${p}.`
                        }
                        className="rounded-lg border border-navy/15 px-3 py-1 text-xs text-navy hover:bg-navy/5 disabled:opacity-50"
                        onConfirmar={() => {
                          if (mTransicao.isPending) return;
                          mTransicao.mutate({ entregaId: String(e['id']), para: p });
                        }}
                      />
                    ))}
                    {status === "publicado" ? (
                      <AcaoOperacional
                        rotulo="Projetar ao App"
                        capacidade="aprovar_projecao_app_cliente"
                        pendenciaGate={pendenciaJornada}
                        efeito="Cria a projeção correspondente na Biblioteca Mestre, em rascunho. Nada chega ao cliente até revisão e aprovação por lá."
                        className="rounded-lg border border-gold/60 bg-gold/10 px-3 py-1 text-xs text-navy hover:bg-gold/20 disabled:opacity-50"
                        onConfirmar={() => {
                          if (mProjetar.isPending) return;
                          mProjetar.mutate({ entregaId: String(e['id']) });
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </EstadoDados>
      </Secao>
    </div>
  );
}
