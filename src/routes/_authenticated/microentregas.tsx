import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { EstadoVazio, SaasShell } from "@/components/saas/shell";
import { CardIndicador, CarregandoDesk, SectionHeader, type TomEstado } from "@/components/desk/ui-desk";
import { CaCard } from "@/components/ui/ca-card";
import { Etiqueta, type Tom } from "@/components/prancha-v4/kit";
import { Button } from "@/components/ui/button";
import { listarFilaMicroentregas } from "@/lib/biblioteca-evidencias.functions";
import { APROVACOES } from "@/lib/biblioteca-evidencias";
import { FilaKitMicroentregas } from "@/components/desk/kit-conectado";
import { RascunhosApp } from "@/components/golive/rascunhos-app";
import { buscaGoLive, useCasoGoLive } from "@/components/golive/dados";
import { listarRegistros } from "@/lib/saas.functions";

export const Route = createFileRoute("/_authenticated/microentregas")({
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Microentregas — Clube Ancestral" },
      { name: "description", content: "Fila editorial interna de microentregas ligadas à Biblioteca, evidências e achados." },
      { property: "og:title", content: "Microentregas — Clube Ancestral" },
      { property: "og:description", content: "Acompanhe revisão, aprovação e publicação das microentregas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MicroentregasPage,
});

type Linha = Awaited<ReturnType<typeof listarFilaMicroentregas>>[number];

const ORDEM = ["draft", "in_review", "approved", "published"] as const;
const TOM_STATUS: Record<string, TomEstado> = {
  draft: "neutro",
  in_review: "atencao",
  approved: "sucesso",
  published: "sucesso",
};

// V4-04: chip de estado do kit V4 (mesmos tons da fila; rascunho fica neutro).
function tomChip(status: string): Tom {
  const t = TOM_STATUS[status];
  return t === "atencao" || t === "sucesso" ? t : "neutro";
}

function dataBr(v: string | null) {
  if (!v) return "Sem prazo definido";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("pt-BR");
}

function rotuloStatus(status: string) {
  return APROVACOES.find((item) => item.id === status)?.rotulo ?? status;
}

function origemRotulo(tipo: string) {
  if (tipo === "evidence") return "Evidência";
  if (tipo === "client_deliverable") return "Entrega interna";
  if (tipo === "legal_rule") return "Marco jurídico";
  return tipo || "Origem não identificada";
}

function MicroentregasPage() {
  const carregar = useServerFn(listarFilaMicroentregas);
  const fila = useQuery({ queryKey: ["fila-microentregas"], queryFn: () => carregar() });
  const [status, setStatus] = useState("");
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const linhas = useMemo(
    () => (fila.data ?? []).filter((item) => !status || item.status === status),
    [fila.data, status],
  );
  const selecionada = (fila.data ?? []).find((item) => item.id === selecionadaId) ?? null;
  const contagem = (valor: string) => (fila.data ?? []).filter((item) => item.status === valor).length;

  return (
    <SaasShell
      titulo="Microentregas"
      descricao="Fila editorial ligada à Biblioteca. Publicação permanece humana, sanitizada e controlada."
      visualKit="pantone"
    >
      <section className="space-y-4">
        <SectionHeader
          titulo="Rascunho → revisão → aprovado → publicado"
          descricao="Cada item abaixo é uma projeção real já registrada; esta tela não cria cópias nem publica automaticamente."
          acoes={
            <Button asChild variant="outline" size="sm">
              <Link to="/biblioteca">Abrir Biblioteca Mestre</Link>
            </Button>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ORDEM.map((item) => (
            <CardIndicador key={item} rotulo={rotuloStatus(item)} valor={contagem(item)} apoio="Fila editorial real" tom={TOM_STATUS[item]} />
          ))}
        </div>

        <FilaKitMicroentregas />

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-navy/10 bg-cream/60 p-2">
          <label htmlFor="status-micro" className="px-1 text-xs font-medium text-navy/60">Status</label>
          <select id="status-micro" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-navy/20 bg-background px-3 py-2 text-sm">
            <option value="">Todos</option>
            {APROVACOES.map((item) => <option key={item.id} value={item.id}>{item.rotulo}</option>)}
          </select>
        </div>

        {fila.isLoading ? <CarregandoDesk linhas={4} rotulo="Carregando microentregas" /> : null}
        {fila.isError ? (
          <div role="alert" className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
            <p>Não foi possível ler a fila. Isto é uma falha de leitura, não uma fila vazia.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void fila.refetch()}>Tentar novamente</Button>
          </div>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
          <CaCard titulo="Fila editorial" eyebrow={`Microentregas · ${linhas.length} no filtro`}>
          {!fila.isLoading && !fila.isError && !linhas.length ? (
            <EstadoVazio mensagem="Nenhuma microentrega neste filtro. A fila mostra somente projeções já registradas na Biblioteca." />
          ) : null}
          <div className="space-y-3">
            {linhas.map((item) => (
              <article key={item.id} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-navy/50">{item.casoCodigo ?? "Caso sem código"}</p>
                    <h2 className="font-serif text-xl text-navy">{item.tipo}</h2>
                  </div>
                  <Etiqueta texto={rotuloStatus(item.status)} tom={tomChip(item.status)} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-navy/70">{item.descricao || "Descrição sanitizada ainda não preenchida."}</p>
                <dl className="mt-3 grid gap-2 text-xs text-navy/60 sm:grid-cols-3">
                  <div><dt className="font-medium text-navy">Responsável</dt><dd>{item.responsavel ?? "Não definido"}</dd></div>
                  <div><dt className="font-medium text-navy">Prazo interno</dt><dd>{dataBr(item.prazo)}</dd></div>
                  <div><dt className="font-medium text-navy">Origem</dt><dd>{origemRotulo(item.origemTipo)}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelecionadaId(item.id)}>Ver detalhe</Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/biblioteca-evidencias/$caseId" params={{ caseId: item.caseId }}>Abrir na Biblioteca</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
          </CaCard>

          <aside className="lg:sticky lg:top-4 lg:self-start" aria-live="polite">
            {selecionada ? <Detalhe item={selecionada} /> : (
              <CaCard titulo="Detalhe da microentrega" eyebrow="Microentregas · vínculos">
                <EstadoVazio mensagem="Selecione uma microentrega. O detalhe mostra somente os vínculos reais encontrados." />
              </CaCard>
            )}
          </aside>
        </div>

        {/*
          Resgate (Frente 4, 19/10/2026): o editor real de rascunhos de copy
          — RascunhosApp, de golive.microentregas.tsx — com validação de
          texto antes de publicar no App Cliente. A fila acima é a visão
          geral multi-caso, só leitura; esta é a única superfície de edição
          e publicação desta tela (compõe, não compete: antes desta
          integração a tela não tinha editor nem gate de publicação
          próprios). RascunhosApp e seus escritores
          (`salvarRascunhoProjecaoApp`/`publicarRascunhoProjecaoApp`) leem e
          gravam em `app_projections`, a mesma tabela da fila acima — mas
          escopados ao caso operacional configurado no servidor (mesmo
          mecanismo de /golive/microentregas), não a um caso escolhido nesta
          tela. Edição de outro caso específico continua pela Biblioteca.
        */}
        <SectionHeader
          titulo="Rascunhos para o App Cliente"
          descricao="Editor do caso operacional configurado: grava, relê e só libera para publicação depois de passar na validação de texto do servidor."
        />
        {/* 26/10/2026: sem ?casoId os rascunhos caíam no caso piloto (Ana). Agora escolhe-se o caso. */}
        <EscolhaDeCasoRascunhos />
      </section>
    </SaasShell>
  );
}

function Detalhe({ item }: { item: Linha }) {
  return (
    <CaCard
      titulo={item.tipo}
      eyebrow="Detalhe da microentrega"
      acao={<Etiqueta texto={rotuloStatus(item.status)} tom={tomChip(item.status)} />}
    >
      <div className="mt-2 space-y-4 text-sm">
        <Bloco titulo="Descrição" texto={item.descricao} vazio="Descrição sanitizada não preenchida." />
        <Bloco titulo="Fonte" texto={item.fonte ? `${item.fonte.titulo} · ${item.fonte.tipo}` : null} vazio="Nenhuma fonte diretamente vinculada a esta origem." />
        <Bloco titulo="Evidência" texto={item.evidencia ? `${item.evidencia.titulo}${item.evidencia.descricao ? ` — ${item.evidencia.descricao}` : ""}` : null} vazio="Nenhuma evidência diretamente vinculada a esta projeção." />
        <Bloco titulo="Achado" texto={item.achado ? `${item.achado.titulo}${item.achado.resumo ? ` — ${item.achado.resumo}` : ""}` : null} vazio="Nenhum achado relacionado foi localizado pelos vínculos existentes." />
        <Bloco titulo="Origem da entrega" texto={item.entrega ? `${item.entrega.titulo}${item.entrega.resumo ? ` — ${item.entrega.resumo}` : ""}` : origemRotulo(item.origemTipo)} vazio="Origem não identificada." />
      </div>
      <Button asChild className="mt-5 w-full">
        <Link to="/biblioteca-evidencias/$caseId" params={{ caseId: item.caseId }}>Revisar na Biblioteca</Link>
      </Button>
    </CaCard>
  );
}

function Bloco({ titulo, texto, vazio }: { titulo: string; texto: string | null | undefined; vazio: string }) {
  return (
    <section className="border-t border-navy/10 pt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-navy/55">{titulo}</h3>
      <p className={texto ? "mt-1 text-navy/80" : "mt-1 text-navy/45"}>{texto || vazio}</p>
    </section>
  );
}

function EscolhaDeCasoRascunhos() {
  const casoId = useCasoGoLive();
  const listar = useServerFn(listarRegistros);
  const casos = useQuery({
    queryKey: ["microentregas-casos"],
    queryFn: () => listar({ data: { entidade: "crm_casos" } }),
    enabled: !casoId,
  });
  if (casoId) {
    return (
      <>
        <p className="mb-2 text-xs text-navy/60">
          Caso escolhido. <Link to="/microentregas" className="underline">Trocar de caso</Link>
        </p>
        <RascunhosApp />
      </>
    );
  }
  const lista = ((casos.data ?? []) as Array<{ id: string; codigo?: string | null; titulo?: string | null }>).slice(0, 50);
  return (
    <div className="rounded-xl border border-navy/10 bg-cream/40 p-4 text-sm" data-microentregas-escolher-caso>
      <p className="text-navy/70">Escolha o caso para editar os rascunhos que vão ao App Cliente:</p>
      {casos.isPending ? <p className="mt-2 text-navy/50">Carregando casos…</p> : null}
      {casos.isError ? <p className="mt-2 text-terracotta">Não foi possível carregar os casos.</p> : null}
      <ul className="mt-3 flex flex-wrap gap-2">
        {lista.map((c) => (
          <li key={c.id}>
            <Link to="/microentregas" search={{ casoId: c.id }} className="inline-flex min-h-11 items-center rounded-lg border border-navy/20 px-3">
              {c.codigo ?? c.titulo ?? c.id.slice(0, 8)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
