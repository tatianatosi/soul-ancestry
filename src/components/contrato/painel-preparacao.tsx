/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { useState } from "react";

import { Painel, Selo, moeda } from "@/components/comercial/base";
import {
  conferirEscopoProposta,
  painelPreparacaoContratual,
  registrarCampoEscopoProposta,
  registrarOverrideGateInterno,
  registrarRevalidacaoProposta,
} from "@/lib/escopo-conferencia.functions";
import { ROTULO_DECISAO_VALIDADE } from "@/lib/proposta-saneamento";
import { contextoGatesDaConferencia } from "@/lib/escopo-conferencia";
import {
  ACOES_GATEADAS,
  ACOES_GATEADAS_INTERNAS,
  ROTULO_ACAO,
  ROTULO_GATE,
  podeExecutar,
  type AcaoGateada,
  type AvaliacaoGate,
} from "@/lib/gates-formalizacao";
import { ROTULO_FONTE_CANONICA } from "@/lib/preco-canonico";

/**
 * Decisão auditada da Proprietária Administradora para superar um gate
 * INTERNO específico, sem esperar a pendência que o gerou ser resolvida.
 * Ações externas/irreversíveis (assinatura, envio, pagamento) não aparecem
 * aqui — continuam exigindo a janela de confirmação explícita própria delas.
 */
function OverrideGateInterno({ caseId, acao, onFeito }: { caseId: string; acao: AcaoGateada; onFeito: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const registrar = useServerFn(registrarOverrideGateInterno);
  const m = useMutation({
    mutationFn: () => registrar({ data: { caseId, acao, motivo } }),
    onSuccess: () => {
      toast.success(`Decisão registrada: "${ROTULO_ACAO[acao] ?? acao}" liberada por decisão da Proprietária.`);
      setAberto(false);
      setMotivo("");
      onFeito();
    },
    onError: (e: any) => toast.error(e?.message ?? "Não foi possível registrar a decisão."),
  });

  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="text-[11px] font-medium text-navy underline">
        Assumir e liberar mesmo assim (decisão auditada)
      </button>
    );
  }
  const faltam = Math.max(0, 10 - motivo.trim().length);
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo da decisão (mín. 10 caracteres)"
        className="min-w-[220px] flex-1 rounded border border-navy/20 px-2 py-1 text-xs"
      />
      <button
        type="button"
        onClick={() => {
          if (motivo.trim().length < 10) {
            toast.error(`Escreva o motivo da decisão antes de confirmar — faltam ${faltam} caractere(s).`);
            return;
          }
          m.mutate();
        }}
        disabled={m.isPending}
        className="rounded bg-navy px-2 py-1 text-[11px] font-medium text-cream disabled:opacity-50"
      >
        {m.isPending ? "Registrando…" : "Confirmar decisão"}
      </button>
      <button type="button" onClick={() => setAberto(false)} className="text-[11px] text-navy/50 underline">
        Cancelar
      </button>
      {motivo.length > 0 && faltam > 0 ? (
        <span className="w-full text-[11px] text-terracotta">Faltam {faltam} caractere(s) no motivo.</span>
      ) : null}
    </div>
  );
}

/**
 * Registra o texto de um campo de escopo ausente, transcrito da própria
 * proposta Canva aprovada (nunca inventado, nunca vindo de outra fonte —
 * ver regra em escopo-proposta.ts). É a peça que faltava: não existia
 * nenhuma tela para gravar as páginas 3-7, só a leitura.
 */
function RegistrarCampoEscopo({
  caseId,
  campo,
  label,
  paginas,
  onFeito,
}: {
  caseId: string;
  campo: string;
  label: string;
  paginas: number[];
  onFeito: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const registrar = useServerFn(registrarCampoEscopoProposta);
  const m = useMutation({
    mutationFn: () => registrar({ data: { caseId, campo, texto } }),
    onSuccess: () => {
      toast.success(`"${label}" registrado (p. ${paginas.join(", ")}).`);
      setAberto(false);
      setTexto("");
      onFeito();
    },
    onError: (e: any) => toast.error(e?.message ?? "Não foi possível registrar este campo."),
  });

  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="text-[11px] font-medium text-navy underline">
        Registrar texto da página {paginas.join(", ")}
      </button>
    );
  }
  return (
    <div className="mt-1 space-y-1">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={`Cole ou digite aqui exatamente o que a página ${paginas.join(", ")} da proposta aprovada declara para "${label}".`}
        rows={3}
        className="w-full rounded border border-navy/20 px-2 py-1 text-xs"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (texto.trim().length < 3) {
              toast.error("Escreva o texto da proposta para este campo antes de registrar.");
              return;
            }
            m.mutate();
          }}
          disabled={m.isPending}
          className="rounded bg-navy px-2 py-1 text-[11px] font-medium text-cream disabled:opacity-50"
        >
          {m.isPending ? "Registrando…" : "Registrar"}
        </button>
        <button type="button" onClick={() => setAberto(false)} className="text-[11px] text-navy/50 underline">
          Cancelar
        </button>
      </div>
    </div>
  );
}

const ROTULO_STATUS: Record<string, string> = {
  aprovado_para_preparacao: "Aprovado para preparação",
  requer_revisao: "Requer revisão humana",
  bloqueado: "Bloqueado",
};

/**
 * Leitura de lista sem silenciar falha. Antes o painel coalescia para lista vazia
 * toda lista vinda da conferência: quando o campo não voltava, a tela mostrava
 * "nenhum" e a proprietária lia ausência de bloqueio onde havia leitura
 * incompleta. Agora campo ausente aparece como aviso explícito.
 */
function ListaLida<T>({
  valor,
  campo,
  vazio,
  children,
}: {
  valor: unknown;
  campo: string;
  vazio: string;
  children: (itens: T[]) => React.ReactNode;
}) {
  if (!Array.isArray(valor)) {
    return (
      <p role="alert" className="text-terracotta">
        Leitura incompleta: o campo “{campo}” não voltou do servidor. Nada aqui é assumido como vazio.
      </p>
    );
  }
  if (valor.length === 0) return <p>{vazio}</p>;
  return <>{children(valor as T[])}</>;
}

/** Texto de lista em linha: campo ausente vira aviso, no lugar de “nenhuma”. */
function textoLista(valor: unknown, separador: string, vazio: string): string {
  if (!Array.isArray(valor)) return "leitura incompleta (campo não retornado)";
  return valor.length ? valor.join(separador) : vazio;
}

/** Contagem de lista: campo ausente não é zero. */
function contagemLista(valor: unknown): string {
  return Array.isArray(valor) ? String(valor.length) : "leitura incompleta";
}

function Bloco({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-navy/15 bg-cream/40 p-3">
      <h3 className="text-sm font-semibold text-navy">
        {n}. {titulo}
      </h3>
      <div className="mt-2 space-y-1 text-xs text-navy/80">{children}</div>
    </section>
  );
}

/** Painel de preparação contratual — leitura, conferência e gates. Não cria nada. */
export function PainelPreparacao({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const carregar = useServerFn(painelPreparacaoContratual);
  const conferir = useServerFn(conferirEscopoProposta);
  const revalidar = useServerFn(registrarRevalidacaoProposta);
  const chave = ["painel-preparacao", caseId];

  const q = useQuery({ queryKey: chave, queryFn: () => carregar({ data: { caseId } }), retry: false });
  const m = useMutation({
    mutationFn: () => conferir({ data: { caseId } }),
    onSuccess: (r: any) => {
      toast.success(`Conferência registrada: ${ROTULO_STATUS[r.status] ?? r.status}`);
      qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: any) => toast.error(e?.message ?? "Não foi possível conferir o escopo."),
  });

  const mRevalidar = useMutation({
    mutationFn: () => revalidar({ data: { caseId } }),
    onSuccess: (r: any) =>
      toast.success(r?.criada ? "Ação interna de revalidação registrada." : "Já existe ação interna de revalidação em aberto."),
    onError: (e: any) => toast.error(e?.message ?? "Não foi possível registrar a ação interna."),
  });

  if (q.isLoading) return <Painel titulo="Preparação contratual">Carregando conferência…</Painel>;
  if (q.error) return <Painel titulo="Preparação contratual">{(q.error as any)?.message}</Painel>;

  const d = q.data as any;
  const r = d.resultado;
  const san = d.saneamento;
  const contexto = contextoGatesDaConferencia(r);
  const liberadas = ACOES_GATEADAS.filter((a) => podeExecutar(a, contexto));

  return (
    <Painel titulo="Preparação contratual — conferência e gates">
      <div className="flex flex-wrap items-center gap-2">
        <Selo
          texto={ROTULO_STATUS[r.status] ?? r.status}
          tom={r.status === "aprovado_para_preparacao" ? "ok" : r.status === "requer_revisao" ? "alerta" : "erro"}
        />
        <Selo texto={`Próxima ação: ${r.proxima_acao_recomendada}`} tom="neutro" />
        <button
          type="button"
          onClick={() => m.mutate()}
          disabled={m.isPending}
          className="rounded bg-navy px-3 py-1 text-xs font-medium text-cream disabled:opacity-60"
        >
          {m.isPending ? "Conferindo…" : "Conferir escopo da proposta"}
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Bloco n={1} titulo="Proposta Canva vigente">
          {d.proposta ? (
            <>
              <p>
                v{d.proposta.versao} · {d.proposta.status} · origem {d.proposta.origem ?? "não registrada"} ·{" "}
                {d.proposta.origem_referencia ?? "sem referência do deck"}
              </p>
              <p>Páginas registradas: {textoLista(d.proposta.paginas_registradas, ", ", "nenhuma")}</p>
            </>
          ) : (
            <p>Nenhuma proposta vinculada a este caso.</p>
          )}
        </Bloco>

        <Bloco n={2} titulo="Preço e condição homologados">
          {d.produto ? (
            <p>
              {d.produto.code} · {d.produto.nome_comercial} ·{" "}
              {moeda(d.produto.preco_comercial_vigente, "BRL")} · {d.produto.condicao_comercial_padrao ?? "condição não homologada"}
            </p>
          ) : (
            <p>Case service sem produto canônico vinculado.</p>
          )}
          <p>
            Fonte aplicada: <strong>{ROTULO_FONTE_CANONICA[d.preco?.fonte] ?? d.preco?.fonte ?? "não determinada"}</strong>
          </p>
          <ListaLida valor={d.preco?.divergencias} campo="preco.divergencias" vazio="Nenhuma divergência de preço apurada.">
            {(itens) =>
              (itens as any[]).map((x) => (
                <p key={x.fonte} className="text-terracotta">
                  Divergência ({ROTULO_FONTE_CANONICA[x.fonte] ?? x.fonte}): {x.descricao}
                </p>
              ))
            }
          </ListaLida>
        </Bloco>

        <Bloco n={3} titulo="Escopo, família e despesas de terceiros">
          <p>
            Núcleo: {d.nucleo?.nome ?? "não registrado"} · {d.membros.length} pessoa(s) vinculadas.
          </p>
          <p>Despesas de terceiros registradas: {d.despesas.length}</p>
          <ListaLida valor={r.conflitos} campo="resultado.conflitos" vazio="Nenhum conflito de escopo aberto.">
            {(itens) =>
              (itens as any[]).map((c) => (
                <p key={`${c.codigo}-${c.campo}`} className="text-terracotta">
                  {c.campo}: {c.descricao}
                </p>
              ))
            }
          </ListaLida>
        </Bloco>

        <Bloco n={4} titulo="Gates de formalização">
          <ListaLida<AvaliacaoGate> valor={r.gates} campo="resultado.gates" vazio="Nenhum gate avaliado nesta conferência.">
            {(itens) => (
              <ul className="space-y-1">
                {itens.map((g) => (
                  <li key={g.gate} className={g.ok ? "text-navy/70" : "text-terracotta"}>
                    {g.ok ? "✓" : "✗"} {ROTULO_GATE[g.gate] ?? g.gate}
                    {g.motivo ? ` — ${g.motivo}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </ListaLida>
        </Bloco>

        <Bloco n={5} titulo="Ações liberadas">
          {liberadas.length ? (
            <p>{liberadas.map((a) => ROTULO_ACAO[a] ?? a).join(" · ")}</p>
          ) : (
            <p>Nenhuma ação de formalização liberada até resolver os bloqueios.</p>
          )}
          <ListaLida valor={r.bloqueios} campo="resultado.bloqueios" vazio="Nenhum bloqueio de formalização aberto.">
            {(itens) =>
              (itens as any[]).map((b) => (
                <p key={b.codigo} className="text-terracotta">
                  {b.codigo}: {b.descricao}
                </p>
              ))
            }
          </ListaLida>
          {Array.isArray(r.bloqueios) && r.bloqueios.length > 0 && (
            <div className="mt-2 space-y-1 rounded border border-navy/15 bg-white p-2">
              <p className="text-[11px] text-navy/60">
                Bloqueio interno — a Proprietária Administradora pode assumir a pendência e seguir. A pendência
                continua registrada; a decisão fica auditada.
              </p>
              {ACOES_GATEADAS_INTERNAS.filter((a) => !liberadas.includes(a)).map((a) => (
                <div key={a} className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-navy/70">{ROTULO_ACAO[a] ?? a}:</span>
                  <OverrideGateInterno caseId={caseId} acao={a} onFeito={() => qc.invalidateQueries({ queryKey: chave })} />
                </div>
              ))}
            </div>
          )}
        </Bloco>

        <Bloco n={6} titulo="Campos da proposta Canva (páginas 1–7)">
          <p>
            Deck interno: {d.proposta?.origem_referencia ?? "não registrado"} · páginas usadas:{" "}
            {textoLista(r.paginas_usadas, ", ", "nenhuma")}
          </p>
          <p className="mt-1 font-medium text-navy">Extraídos ({contagemLista(r.campos_extraidos)})</p>
          <ListaLida valor={r.campos_extraidos} campo="resultado.campos_extraidos" vazio="Nenhum campo extraído.">
            {(itens) => (
              <ul className="space-y-0.5">
                {(itens as any[]).map((c) => (
                  <li key={c.campo}>
                    ✓ {c.label} <span className="text-navy/50">· p. {c.paginas.join(", ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </ListaLida>
          <p className="mt-1 font-medium text-navy">Não localizados ({contagemLista(r.campos_ausentes)})</p>
          <ListaLida valor={r.campos_ausentes} campo="resultado.campos_ausentes" vazio="Nenhum campo pendente.">
            {(itens) => (
              <ul className="space-y-1.5">
                {(itens as any[]).map((c) => (
                  <li key={c.campo} className={c.obrigatorio ? "text-terracotta" : "text-navy/60"}>
                    <div>
                      {c.obrigatorio ? "✗" : "○"} {c.label} <span className="text-navy/50">· p. {c.paginas.join(", ")}</span>
                      {c.obrigatorio ? " · obrigatório" : " · opcional, não declarado"}
                    </div>
                    <RegistrarCampoEscopo
                      caseId={caseId}
                      campo={c.campo}
                      label={c.label}
                      paginas={c.paginas}
                      onFeito={() => qc.invalidateQueries({ queryKey: chave })}
                    />
                  </li>
                ))}
              </ul>
            )}
          </ListaLida>
          <p className="mt-1">Anexos afetados: {textoLista(r.anexos_afetados, " · ", "nenhum")}</p>
          <p className="text-navy/50">Nada é inferido: campo não localizado permanece pendência e mantém o bloqueio.</p>
        </Bloco>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Bloco n={7} titulo="Páginas 1–7 — status de extração">
          <ListaLida valor={san?.paginas} campo="saneamento.paginas" vazio="Nenhuma página avaliada.">
            {(itens) => (
              <ul className="space-y-0.5">
                {(itens as any[]).map((p) => (
                  <li key={p.page_number} className={p.bloqueia ? "text-terracotta" : "text-navy/70"}>
                    {p.bloqueia ? "✗" : "✓"} p. {p.page_number} — {p.rotulo}
                    {p.campos_nao_localizados.length ? ` · não localizados: ${p.campos_nao_localizados.join(", ")}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </ListaLida>
          <p className="text-navy/50">
            Referência interna do deck: {san?.deck_referencia_interna ?? "não registrada"}. Nenhum link ou conteúdo do Canva é exibido.
          </p>
        </Bloco>

        <Bloco n={8} titulo="Validade comercial e decisão humana">
          <p className={san?.validade?.bloqueia ? "text-terracotta" : "text-navy/70"}>{san?.validade?.descricao}</p>
          {san?.validade?.bloqueia ? (
            <>
              <p className="mt-1 font-medium text-navy">Decisão humana requerida (nenhuma é automática):</p>
              <ListaLida
                valor={san.validade.decisoes_humanas}
                campo="saneamento.validade.decisoes_humanas"
                vazio="Nenhuma decisão humana listada."
              >
                {(itens) => (
                  <ul className="space-y-0.5">
                    {(itens as any[]).map((dec) => (
                      <li key={dec}>○ {ROTULO_DECISAO_VALIDADE[dec as keyof typeof ROTULO_DECISAO_VALIDADE] ?? dec}</li>
                    ))}
                  </ul>
                )}
              </ListaLida>
              <button
                type="button"
                onClick={() => mRevalidar.mutate()}
                disabled={mRevalidar.isPending}
                className="mt-2 rounded border border-navy/30 px-3 py-1 text-xs font-medium text-navy disabled:opacity-60"
              >
                {mRevalidar.isPending ? "Registrando…" : "Criar ação interna: revalidar proposta"}
              </button>
            </>
          ) : null}
        </Bloco>

        <Bloco n={9} titulo="Estado por campo do escopo">
          <ListaLida valor={san?.campos} campo="saneamento.campos" vazio="Nenhum campo avaliado.">
            {(itens) => (
              <ul className="space-y-0.5">
                {(itens as any[]).map((c) => (
                  <li key={c.campo} className={c.bloqueia ? "text-terracotta" : c.pendencia ? "text-navy/60" : "text-navy/80"}>
                    {c.bloqueia ? "✗" : c.pendencia ? "○" : "✓"} {c.label} — {c.estado_rotulo}
                    <span className="text-navy/50"> · p. {c.paginas.join(", ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </ListaLida>
          <p className="text-navy/50">Campo ausente permanece ausente: nada é preenchido por suposição.</p>
        </Bloco>

        <Bloco n={10} titulo="Bloqueios do saneamento">
          <ListaLida valor={san?.bloqueios} campo="saneamento.bloqueios" vazio="Nenhum bloqueio de saneamento aberto.">
            {(itens) =>
              (itens as any[]).map((b) => (
                <p key={b.codigo} className="text-terracotta">
                  {b.codigo}: {b.descricao}
                </p>
              ))
            }
          </ListaLida>
        </Bloco>
      </div>

    </Painel>
  );
}
