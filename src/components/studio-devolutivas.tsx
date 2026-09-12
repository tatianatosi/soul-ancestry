import { useMemo, useState } from "react";
import { AlertTriangle, Check, Lock, Unlock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand";
import {
  CHECKLIST_SEGURANCA,
  DEVOLUTIVA_DEMO,
  ESTADOS_VALIDACAO,
  WORKFLOW,
  detectarTermos,
  rotuloEstado,
  tomEstado,
  type AchadoStudio,
  type DevolutivaStudio,
  type EstadoValidacao,
  type PendenciaStudio,
  type Prioridade,
  type WorkflowEstado,
} from "@/data/studio-devolutivas";

/**
 * Studio de Devolutivas — área interna isolada de preview.
 * Sem integração, sem envio, sem publicação. Somente diagramação visual.
 */

type ModoPreview = "a4" | "whatsapp" | "texto";

const inputCls =
  "w-full rounded-xl border border-navy/15 bg-cream/80 px-3 py-2 text-[13px] text-navy outline-none transition focus:border-gold";

const labelCls = "text-[10.5px] font-semibold uppercase tracking-[0.14em] text-navy/55";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-navy/10 bg-cream p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/60">{titulo}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function StudioDevolutivas() {
  const [dados, setDados] = useState<DevolutivaStudio>(DEVOLUTIVA_DEMO);
  const [workflow, setWorkflow] = useState<WorkflowEstado>("rascunho");
  const [check, setCheck] = useState<Record<string, boolean>>({});
  const [disclaimerLiberado, setDisclaimerLiberado] = useState(false);
  const [modo, setModo] = useState<ModoPreview>("a4");

  const set = <K extends keyof DevolutivaStudio>(k: K, v: DevolutivaStudio[K]) =>
    setDados((d) => ({ ...d, [k]: v }));

  const termos = useMemo(
    () =>
      detectarTermos([
        dados.leituraInicial,
        dados.relevancia,
        dados.proximaEtapa.titulo,
        dados.proximaEtapa.descricao,
        dados.proximaEtapa.convite,
        dados.proximaEtapa.semPressa,
        ...dados.proximaEtapa.acoes,
        ...dados.achados.map((a) => `${a.titulo} ${a.descricao}`),
        ...dados.pendencias.map((p) => `${p.descricao} ${p.proximoPasso}`),
      ]),
    [dados],
  );

  const checklistCompleto = CHECKLIST_SEGURANCA.every((i) => check[i.id]);
  const podeDiagramar = checklistCompleto && termos.length === 0;

  const atualizarAchado = (id: string, patch: Partial<AchadoStudio>) =>
    setDados((d) => ({ ...d, achados: d.achados.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
  const atualizarPendencia = (id: string, patch: Partial<PendenciaStudio>) =>
    setDados((d) => ({ ...d, pendencias: d.pendencias.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  const achadosVisiveis = [...dados.achados].filter((a) => a.aprovado).sort((a, b) => a.ordem - b.ordem);
  const pendenciasVisiveis = [...dados.pendencias]
    .filter((p) => p.aprovado)
    .sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="min-h-screen bg-areia/40">
      {/* Cabeçalho da área interna */}
      <header className="border-b border-navy/10 bg-navy px-5 py-4 text-cream">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo size={34} showText={false} />
            <div>
              <h1 className="font-serif text-lg italic leading-tight">Studio de Devolutivas</h1>
              <p className="text-[11.5px] text-cream/70">One-page de leitura inicial — preview interno</p>
            </div>
          </div>
          <span className="rounded-full border border-gold/60 bg-gold/15 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gold">
            Dados demonstrativos — não enviar
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        {/* ───────── COLUNA ESQUERDA — EDITOR ───────── */}
        <div className="flex flex-col gap-5">
          <Secao titulo="Dados de apresentação">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Título">
                <input className={inputCls} value={dados.titulo} onChange={(e) => set("titulo", e.target.value)} />
              </Campo>
              <Campo label="Nome de exibição">
                <input className={inputCls} value={dados.nome} onChange={(e) => set("nome", e.target.value)} />
              </Campo>
              <Campo label="Linha familiar em análise">
                <input className={inputCls} value={dados.linha} onChange={(e) => set("linha", e.target.value)} />
              </Campo>
              <Campo label="País / contexto">
                <input
                  className={inputCls}
                  value={dados.contexto}
                  onChange={(e) => set("contexto", e.target.value)}
                />
              </Campo>
              <Campo label="Data de atualização">
                <input
                  className={inputCls}
                  value={dados.atualizadoEm}
                  onChange={(e) => set("atualizadoEm", e.target.value)}
                />
              </Campo>
              <Campo label="Estado do workflow">
                <select
                  className={inputCls}
                  value={workflow}
                  onChange={(e) => setWorkflow(e.target.value as WorkflowEstado)}
                >
                  {WORKFLOW.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label}
                      {w.id === "pronto_diagramacao" && !podeDiagramar ? " (checklist pendente)" : ""}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
          </Secao>

          <Secao titulo="Leitura inicial">
            <textarea
              rows={5}
              className={cn(inputCls, "resize-y leading-relaxed")}
              value={dados.leituraInicial}
              onChange={(e) => set("leituraInicial", e.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
              <span className="flex items-center gap-1.5 text-navy/60">
                <AlertTriangle className="h-3.5 w-3.5 text-gold" />
                Evite conclusões jurídicas, promessas e afirmações não documentadas.
              </span>
              <span className="text-navy/50">{dados.leituraInicial.length} caracteres</span>
            </div>
          </Secao>

          {/* Achados */}
          <Secao titulo="Achados">
            {dados.achados.map((a) => (
              <article key={a.id} className="rounded-2xl border border-navy/10 bg-cream/70 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_88px]">
                  <Campo label="Título do achado">
                    <input
                      className={inputCls}
                      value={a.titulo}
                      onChange={(e) => atualizarAchado(a.id, { titulo: e.target.value })}
                    />
                  </Campo>
                  <Campo label="Ordem">
                    <input
                      type="number"
                      className={inputCls}
                      value={a.ordem}
                      onChange={(e) => atualizarAchado(a.id, { ordem: Number(e.target.value) })}
                    />
                  </Campo>
                </div>
                <div className="mt-3">
                  <Campo label="Descrição externa aprovada">
                    <textarea
                      rows={2}
                      className={cn(inputCls, "resize-y")}
                      value={a.descricao}
                      onChange={(e) => atualizarAchado(a.id, { descricao: e.target.value })}
                    />
                  </Campo>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Campo label="Estado de validação">
                    <select
                      className={inputCls}
                      value={a.estado}
                      onChange={(e) => atualizarAchado(a.id, { estado: e.target.value as EstadoValidacao })}
                    >
                      {ESTADOS_VALIDACAO.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Revisão por">
                    <input
                      className={inputCls}
                      value={a.revisor}
                      onChange={(e) => atualizarAchado(a.id, { revisor: e.target.value })}
                    />
                  </Campo>
                  <Campo label="Data da revisão">
                    <input
                      className={inputCls}
                      value={a.revisadoEm}
                      onChange={(e) => atualizarAchado(a.id, { revisadoEm: e.target.value })}
                    />
                  </Campo>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-navy/75">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={a.aprovado}
                      onChange={(e) => atualizarAchado(a.id, { aprovado: e.target.checked })}
                    />
                    Aprovado para peça externa
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={a.alertaDadoPessoal}
                      onChange={(e) => atualizarAchado(a.id, { alertaDadoPessoal: e.target.checked })}
                    />
                    Alerta de dado pessoal
                  </label>
                  <span className={cn("rounded-full border px-2.5 py-1 text-[10.5px]", tomEstado(a.estado))}>
                    {rotuloEstado(a.estado)}
                  </span>
                  <button
                    type="button"
                    aria-label="Remover achado"
                    onClick={() =>
                      setDados((d) => ({ ...d, achados: d.achados.filter((x) => x.id !== a.id) }))
                    }
                    className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-navy/15 text-navy/60 hover:bg-navy/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {a.alertaDadoPessoal && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-terracotta">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Revisar dado pessoal antes de aprovar para peça externa.
                  </p>
                )}
              </article>
            ))}
            <button
              type="button"
              onClick={() =>
                setDados((d) => ({
                  ...d,
                  achados: [
                    ...d.achados,
                    {
                      id: `a${Date.now()}`,
                      titulo: "",
                      descricao: "",
                      estado: "pendente",
                      ordem: d.achados.length + 1,
                      aprovado: false,
                      alertaDadoPessoal: false,
                      revisor: "",
                      revisadoEm: "",
                    },
                  ],
                }))
              }
              className="flex items-center justify-center gap-2 rounded-full border border-navy/20 px-4 py-2 text-[12px] font-medium text-navy hover:bg-navy/5"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar achado
            </button>
          </Secao>

          {/* Pendências */}
          <Secao titulo="Pendências">
            {dados.pendencias.map((p) => (
              <article key={p.id} className="rounded-2xl border border-navy/10 bg-cream/70 p-4">
                <Campo label="Descrição simples">
                  <input
                    className={inputCls}
                    value={p.descricao}
                    onChange={(e) => atualizarPendencia(p.id, { descricao: e.target.value })}
                  />
                </Campo>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Campo label="Prioridade">
                    <select
                      className={inputCls}
                      value={p.prioridade}
                      onChange={(e) => atualizarPendencia(p.id, { prioridade: e.target.value as Prioridade })}
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </Campo>
                  <Campo label="Ordem">
                    <input
                      type="number"
                      className={inputCls}
                      value={p.ordem}
                      onChange={(e) => atualizarPendencia(p.id, { ordem: Number(e.target.value) })}
                    />
                  </Campo>
                  <Campo label="Próximo passo relacionado">
                    <input
                      className={inputCls}
                      value={p.proximoPasso}
                      onChange={(e) => atualizarPendencia(p.id, { proximoPasso: e.target.value })}
                    />
                  </Campo>
                </div>
                <div className="mt-3 flex items-center gap-4 text-[12px] text-navy/75">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p.aprovado}
                      onChange={(e) => atualizarPendencia(p.id, { aprovado: e.target.checked })}
                    />
                    Aprovado para exibição
                  </label>
                  <button
                    type="button"
                    aria-label="Remover pendência"
                    onClick={() =>
                      setDados((d) => ({ ...d, pendencias: d.pendencias.filter((x) => x.id !== p.id) }))
                    }
                    className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-navy/15 text-navy/60 hover:bg-navy/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
            <button
              type="button"
              onClick={() =>
                setDados((d) => ({
                  ...d,
                  pendencias: [
                    ...d.pendencias,
                    {
                      id: `p${Date.now()}`,
                      descricao: "",
                      prioridade: "media",
                      ordem: d.pendencias.length + 1,
                      aprovado: false,
                      proximoPasso: "",
                    },
                  ],
                }))
              }
              className="flex items-center justify-center gap-2 rounded-full border border-navy/20 px-4 py-2 text-[12px] font-medium text-navy hover:bg-navy/5"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar pendência
            </button>
          </Secao>

          <Secao titulo="Por que isso é relevante">
            <textarea
              rows={3}
              className={cn(inputCls, "resize-y leading-relaxed")}
              value={dados.relevancia}
              onChange={(e) => set("relevancia", e.target.value)}
            />
          </Secao>

          <Secao titulo="Próxima etapa recomendada">
            <Campo label="Título">
              <input
                className={inputCls}
                value={dados.proximaEtapa.titulo}
                onChange={(e) => set("proximaEtapa", { ...dados.proximaEtapa, titulo: e.target.value })}
              />
            </Campo>
            <Campo label="Texto descritivo">
              <textarea
                rows={3}
                className={cn(inputCls, "resize-y")}
                value={dados.proximaEtapa.descricao}
                onChange={(e) => set("proximaEtapa", { ...dados.proximaEtapa, descricao: e.target.value })}
              />
            </Campo>
            <Campo label="Lista de ações (uma por linha)">
              <textarea
                rows={4}
                className={cn(inputCls, "resize-y")}
                value={dados.proximaEtapa.acoes.join("\n")}
                onChange={(e) =>
                  set("proximaEtapa", {
                    ...dados.proximaEtapa,
                    acoes: e.target.value.split("\n"),
                  })
                }
              />
            </Campo>
            <Campo label="Copy de convite">
              <input
                className={inputCls}
                value={dados.proximaEtapa.convite}
                onChange={(e) => set("proximaEtapa", { ...dados.proximaEtapa, convite: e.target.value })}
              />
            </Campo>
            <Campo label="Copy de sem pressa / sem compromisso">
              <input
                className={inputCls}
                value={dados.proximaEtapa.semPressa}
                onChange={(e) => set("proximaEtapa", { ...dados.proximaEtapa, semPressa: e.target.value })}
              />
            </Campo>
          </Secao>

          <Secao titulo="Disclaimer obrigatório">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11.5px] text-navy/60">
                {disclaimerLiberado ? "Edição interna liberada" : "Texto padrão em uso"}
              </span>
              <button
                type="button"
                onClick={() => setDisclaimerLiberado((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-navy/20 px-3 py-1.5 text-[11.5px] text-navy hover:bg-navy/5"
              >
                {disclaimerLiberado ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {disclaimerLiberado ? "Voltar ao texto padrão" : "Liberar edição interna"}
              </button>
            </div>
            <textarea
              rows={3}
              className={cn(inputCls, "resize-y leading-relaxed")}
              value={dados.disclaimer}
              onChange={(e) => set("disclaimer", e.target.value)}
            />
            {!disclaimerLiberado ? (
              <p className="text-[11px] text-navy/50">
                Texto padrão do disclaimer. Alterações aqui saem na devolutiva enviada ao cliente.
              </p>
            ) : null}
          </Secao>

          {/* Validação de termos */}
          <section
            className={cn(
              "rounded-2xl border p-5",
              termos.length ? "border-terracotta/40 bg-terracotta/10" : "border-sage/40 bg-sage/10",
            )}
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/70">
              Validação de termos
            </h2>
            {termos.length ? (
              <>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-terracotta">
                  <AlertTriangle className="h-4 w-4" /> Termos proibidos detectados — revise antes de avançar.
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {termos.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-terracotta/40 bg-cream/60 px-2.5 py-1 text-[11px] text-terracotta"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-sage">
                <Check className="h-4 w-4" /> Nenhum termo proibido detectado.
              </p>
            )}
          </section>

          {/* Checklist */}
          <Secao titulo="Checklist de segurança">
            <ul className="flex flex-col gap-2">
              {CHECKLIST_SEGURANCA.map((i) => (
                <li key={i.id}>
                  <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-navy/80">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={!!check[i.id]}
                      onChange={(e) => setCheck((c) => ({ ...c, [i.id]: e.target.checked }))}
                    />
                    <span>{i.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="text-[11.5px] text-navy/60">
              {podeDiagramar
                ? "Checklist completo — o estado “Pronto para diagramação” está disponível."
                : "Marque todos os itens e resolva os termos proibidos para liberar “Pronto para diagramação”."}
            </p>
          </Secao>

          <Secao titulo="Preview">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["a4", "Preview A4 vertical"],
                  ["whatsapp", "Preview WhatsApp vertical"],
                  ["texto", "Preview texto simples"],
                ] as [ModoPreview, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setModo(id)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[12px] font-medium transition",
                    modo === id ? "bg-navy text-cream" : "border border-navy/20 text-navy hover:bg-navy/5",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11.5px] text-navy/55">
              Preview interno de diagramação. Não há envio, download, publicação ou integração nesta área.
            </p>
          </Secao>
        </div>

        {/* ───────── COLUNA DIREITA — PREVIEW ───────── */}
        <div className="lg:sticky lg:top-5 lg:self-start">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10.5px] uppercase tracking-[0.16em] text-navy/55">
              {modo === "a4" ? "A4 vertical" : modo === "whatsapp" ? "WhatsApp vertical" : "Texto simples"}
            </span>
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-terracotta">
              Não enviar
            </span>
          </div>
          <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-navy/10 bg-cream/50 p-3">
            {modo === "texto" ? (
              <pre className="whitespace-pre-wrap break-words font-sans text-[12.5px] leading-relaxed text-navy/85">
                {textoSimples(dados, achadosVisiveis, pendenciasVisiveis)}
              </pre>
            ) : (
              <OnePagePreview
                dados={dados}
                achados={achadosVisiveis}
                pendencias={pendenciasVisiveis}
                modo={modo}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function textoSimples(d: DevolutivaStudio, achados: AchadoStudio[], pend: PendenciaStudio[]) {
  const l: string[] = [];
  l.push(d.titulo, `${d.nome} · ${d.linha}`, "", d.leituraInicial, "");
  if (achados.length) {
    l.push("O que já identificamos:");
    achados.forEach((a) => l.push(`• ${a.titulo}${a.descricao ? ` — ${a.descricao}` : ""}`));
    l.push("");
  }
  if (pend.length) {
    l.push("O que ainda precisamos confirmar:");
    pend.forEach((p) => l.push(`• ${p.descricao}`));
    l.push("");
  }
  if (d.relevancia) l.push("Por que isso é relevante:", d.relevancia, "");
  l.push(
    "Próxima etapa recomendada:",
    d.proximaEtapa.titulo,
    d.proximaEtapa.descricao,
    ...d.proximaEtapa.acoes.filter(Boolean).map((a) => `• ${a}`),
    "",
    d.proximaEtapa.convite,
    d.proximaEtapa.semPressa,
    "",
    d.disclaimer,
  );
  return l.join("\n").trim();
}

function OnePagePreview({
  dados,
  achados,
  pendencias,
  modo,
}: {
  dados: DevolutivaStudio;
  achados: AchadoStudio[];
  pendencias: PendenciaStudio[];
  modo: ModoPreview;
}) {
  const a4 = modo === "a4";
  return (
    <div
      className={cn(
        "mx-auto w-full bg-cream shadow-[0_2px_18px_rgba(27,43,75,0.08)]",
        a4 ? "max-w-[460px] aspect-[1/1.414] overflow-hidden" : "max-w-[380px] rounded-2xl",
      )}
    >
      <div className={cn("flex flex-col", a4 ? "gap-4 px-8 py-8" : "gap-6 px-6 py-7")}>
        <header className="flex items-center justify-between gap-3">
          <BrandLogo size={30} showText={false} />
          <span className="rounded-full border border-navy/20 px-3 py-1 text-[9.5px] uppercase tracking-[0.18em] text-navy/70">
            Leitura inicial
          </span>
        </header>

        <div className="border-l-2 border-gold pl-4">
          <h1 className={cn("font-serif italic leading-tight text-navy", a4 ? "text-xl" : "text-2xl")}>
            {dados.titulo}
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy/70">
            {dados.nome} · {dados.linha}
          </p>
          {dados.atualizadoEm && (
            <p className="mt-1 text-[10.5px] uppercase tracking-[0.12em] text-navy/45">{dados.atualizadoEm}</p>
          )}
        </div>

        {dados.leituraInicial && (
          <section className="rounded-2xl border border-navy/10 bg-areia/60 p-4">
            <p className="text-[12.5px] leading-relaxed text-navy/85">{dados.leituraInicial}</p>
          </section>
        )}

        {achados.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/60">
              O que já identificamos
            </h2>
            {achados.map((a) => (
              <article key={a.id} className="rounded-xl border border-navy/10 bg-cream/70 p-3">
                {a.titulo && (
                  <h3 className="font-serif text-[14.5px] italic leading-snug text-navy">{a.titulo}</h3>
                )}
                {a.descricao && (
                  <p className="mt-1 text-[12px] leading-relaxed text-navy/75">{a.descricao}</p>
                )}
                <span
                  className={cn(
                    "mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
                    tomEstado(a.estado),
                  )}
                >
                  {rotuloEstado(a.estado)}
                </span>
              </article>
            ))}
          </section>
        )}

        {pendencias.length > 0 && (
          <section>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/60">
              O que ainda precisamos confirmar
            </h2>
            <ol className="mt-2.5 flex flex-col gap-2">
              {pendencias.map((p, i) => (
                <li key={p.id} className="flex gap-2.5 text-[12px] leading-relaxed text-navy/80">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gold/60 text-[10.5px] font-semibold text-navy">
                    {i + 1}
                  </span>
                  <span>{p.descricao}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {dados.relevancia && (
          <section className="rounded-2xl border border-gold/40 bg-gold/10 p-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/70">
              Por que isso é relevante
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy/85">{dados.relevancia}</p>
          </section>
        )}

        <section className="rounded-2xl bg-navy p-4 text-cream">
          <div className="text-[10px] uppercase tracking-[0.18em] text-gold/80">Próxima etapa recomendada</div>
          {dados.proximaEtapa.titulo && (
            <h2 className="mt-1.5 font-serif text-base italic leading-snug">{dados.proximaEtapa.titulo}</h2>
          )}
          {dados.proximaEtapa.descricao && (
            <p className="mt-1.5 text-[12px] leading-relaxed text-cream/80">{dados.proximaEtapa.descricao}</p>
          )}
          {dados.proximaEtapa.acoes.filter(Boolean).length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {dados.proximaEtapa.acoes.filter(Boolean).map((it, i) => (
                <li key={i} className="flex gap-2.5 text-[12px] leading-relaxed text-cream/90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          )}
          {dados.proximaEtapa.convite && (
            <p className="mt-3 text-[12px] leading-relaxed text-cream/85">{dados.proximaEtapa.convite}</p>
          )}
          {dados.proximaEtapa.semPressa && (
            <p className="mt-1 text-[11.5px] leading-relaxed text-cream/65">{dados.proximaEtapa.semPressa}</p>
          )}
        </section>

        {dados.disclaimer && (
          <footer className="border-t border-navy/10 pt-4">
            <p className="text-[11px] leading-relaxed text-navy/60">{dados.disclaimer}</p>
          </footer>
        )}
      </div>
    </div>
  );
}
