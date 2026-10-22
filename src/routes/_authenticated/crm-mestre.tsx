import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Loader2, Printer, TriangleAlert } from "lucide-react";

import { EstadoVazio, SaasShell } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { Indicador } from "@/components/prancha-v4/kit";
import { baixarCsvCrmMestre, imprimirPdfCrmMestre } from "@/lib/crm-mestre-export";
import {
  BLOQUEIOS_EXEMPLARES_HANDOFF,
  BRIEF_DISCOVERY,
  CAMPOS_PROIBIDOS_CLIENTE_CA04,
  DECISOES_PENDENTES_CA04,
  EIXO_COMERCIAL_TRANSICOES,
  EIXO_FORMALIZACAO_TRANSICOES,
  FONTES_VERDADE_CA04,
  LISTAS_BASE_CA04,
  MATRIZ_HANDOFF_CA04,
  ROTEIRO_DISCOVERY_V2,
  type NomeListaCA04,
} from "@/lib/ca04-crm-mestre";

export const Route = createFileRoute("/_authenticated/crm-mestre")({
  head: () => ({
    meta: [
      { title: "CRM Mestre, Discovery e Handoff — Clube Ancestral" },
      {
        name: "description",
        content:
          "Registro interno somente leitura do CA-04: fontes de verdade, listas controladas, máquinas de estado, roteiro de Discovery, Brief e matriz de handoff.",
      },
      { property: "og:title", content: "CRM Mestre, Discovery e Handoff" },
      {
        property: "og:description",
        content: "Dicionário CRM v1.1, eixos comercial e de formalização, handoff e decisões humanas pendentes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
  pendingComponent: CarregandoCrmMestre,
  errorComponent: ErroCrmMestre,
});

const CARTAO = "rounded-xl border border-navy/10 bg-cream/40 p-4";
const BOTAO =
  "inline-flex items-center gap-2 rounded-lg border border-navy/20 bg-cream/40 px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-cream disabled:opacity-60";

/** Estado de carregamento da rota, com a mesma moldura da tela. */
function CarregandoCrmMestre() {
  return (
    <SaasShell
      titulo="CRM Mestre, Discovery e Handoff"
      descricao="Carregando o registro somente leitura do CA-04."
    >
      <div className="space-y-4" role="status" aria-live="polite">
        <p className="flex items-center gap-2 text-sm text-navy/70">
          <Loader2 className="h-4 w-4 animate-spin text-gold" aria-hidden="true" />
          Carregando o registro somente leitura…
        </p>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${CARTAO} space-y-2`}>
            <div className="h-4 w-1/3 animate-pulse rounded bg-navy/10" />
            <div className="h-3 w-full animate-pulse rounded bg-navy/5" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-navy/5" />
          </div>
        ))}
      </div>
    </SaasShell>
  );
}

/** Estado de erro: mensagem clara, sem detalhe técnico e com nova tentativa. */
function ErroCrmMestre({ reset }: { reset: () => void }) {
  return (
    <SaasShell
      titulo="CRM Mestre, Discovery e Handoff"
      descricao="Não foi possível exibir o registro agora."
    >
      <div className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-6 text-sm text-navy">
        <p className="flex items-center gap-2 font-medium text-terracotta">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          Não conseguimos carregar esta tela agora.
        </p>
        <p className="mt-2 text-navy/80">
          Nenhum dado foi alterado. Tente novamente em instantes; se persistir, registre em Governança.
        </p>
        <button type="button" onClick={reset} className={`${BOTAO} mt-4`}>
          Tentar novamente
        </button>
      </div>
    </SaasShell>
  );
}

/** Seção com estado vazio explícito quando a fonte canônica não traz itens. */
function Secao({
  titulo,
  vazio,
  mensagemVazio,
  children,
}: {
  titulo: string;
  vazio: boolean;
  mensagemVazio: string;
  children: React.ReactNode;
}) {
  return (
    // V4-02: seção do dicionário CA-04 dentro do CaCard (casca V4), só leitura.
    <CaCard titulo={titulo} eyebrow="CA-04 · referência" className="rounded-2xl">
      <div className="space-y-3">{vazio ? <EstadoVazio mensagem={mensagemVazio} /> : children}</div>
    </CaCard>
  );
}

/** Exportação somente leitura: CSV e PDF (impressão do navegador). */
function AcoesExportacao() {
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          className={BOTAO}
          onClick={() => {
            setErro(null);
            try {
              baixarCsvCrmMestre();
            } catch {
              setErro("Não foi possível gerar o CSV agora.");
            }
          }}
        >
          <Download className="h-4 w-4" aria-hidden="true" /> Exportar CSV
        </button>
        <button
          type="button"
          className={BOTAO}
          onClick={() => {
            setErro(null);
            const ok = imprimirPdfCrmMestre();
            if (!ok) setErro("Libere as janelas pop-up para salvar o PDF.");
          }}
        >
          <Printer className="h-4 w-4" aria-hidden="true" /> Exportar PDF
        </button>
      </div>
      {erro ? <p className="text-xs text-terracotta">{erro}</p> : null}
    </div>
  );
}

function Pagina() {
  const listas = Object.keys(LISTAS_BASE_CA04) as NomeListaCA04[];

  return (
    <SaasShell
      titulo="CRM Mestre, Discovery e Handoff"
      descricao="CA-04 — mapa de regras do sistema comercial (Painel de Calls + CRM Vivo). Nenhum lead é gravado aqui: a operação vive em /calls e /leads, na mesma tabela."
      acoes={<AcoesExportacao />}
    >
      <div className="space-y-6">
        {/* V4-02: contagens do próprio dicionário versionado (ca04-crm-mestre.ts) — referência, não operação. */}
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-crm-mestre-kpis>
          <Indicador rotulo="Fontes de verdade" valor={String(FONTES_VERDADE_CA04.length)} apoio="Camadas do CA-04" />
          <Indicador
            rotulo="Transições de eixo"
            valor={String(EIXO_COMERCIAL_TRANSICOES.length + EIXO_FORMALIZACAO_TRANSICOES.length)}
            apoio={`Comercial ${EIXO_COMERCIAL_TRANSICOES.length} · Formalização ${EIXO_FORMALIZACAO_TRANSICOES.length}`}
          />
          <Indicador rotulo="Listas controladas" valor={String(listas.length)} apoio="LISTAS_BASE v1.1" />
          <Indicador rotulo="Decisões pendentes" valor={String(DECISOES_PENDENTES_CA04.length)} apoio="Aguardam decisão humana" />
        </dl>
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy">
          Este é o sistema que vai junto com o Painel de Calls — não é legado de Governança.
          Operar a call em{" "}
          <Link to="/calls" className="font-medium underline decoration-gold underline-offset-4">
            /calls
          </Link>
          ; o{" "}
          <Link
            to="/governanca/dicionario-calls-crm"
            className="font-medium underline decoration-gold underline-offset-4"
          >
            dicionário
          </Link>{" "}
          avalia o lead vivo. SKU e preço vêm do catálogo homologado, não da Planilha Mestre.
        </p>
        <Secao titulo={"Fontes de verdade"} vazio={FONTES_VERDADE_CA04.length === 0} mensagemVazio={"Nenhuma fonte de verdade registrada nesta versão do CA-04."}>
          <div className="grid gap-3 md:grid-cols-2">
            {FONTES_VERDADE_CA04.map((f) => (
              <article key={f.camada} className={CARTAO}>
                <p className="text-sm font-semibold text-navy">{f.camada}</p>
                <p className="mt-1 text-sm text-navy/80">{f.responsabilidade}</p>
                <p className="mt-2 text-xs text-terracotta">Não usar como: {f.naoUsarComo}</p>
              </article>
            ))}
          </div>
        </Secao>

        <Secao titulo={"Eixo Comercial"} vazio={EIXO_COMERCIAL_TRANSICOES.length === 0} mensagemVazio={"Nenhuma transição comercial registrada nesta versão."}>
          <TabelaTransicoes transicoes={EIXO_COMERCIAL_TRANSICOES} />
        </Secao>

        <Secao titulo={"Eixo Formalização/Operação"} vazio={EIXO_FORMALIZACAO_TRANSICOES.length === 0} mensagemVazio={"Nenhuma transição de formalização registrada nesta versão."}>
          <TabelaTransicoes transicoes={EIXO_FORMALIZACAO_TRANSICOES} />
          <p className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-navy">
            Resultado comercial é sempre derivado dos dois eixos. O estado exato que marca “Convertido”
            depende de decisão humana ainda pendente — nada é derivado como convertido antes dela.
          </p>
        </Secao>

        <Secao titulo={"Roteiro Mestre de Discovery v2"} vazio={ROTEIRO_DISCOVERY_V2.length === 0} mensagemVazio={"Roteiro ainda não publicado nesta versão."}>
          <ol className={`${CARTAO} list-decimal space-y-1 pl-6 text-sm text-navy/85`}>
            {ROTEIRO_DISCOVERY_V2.map((passo) => (
              <li key={passo}>{passo}</li>
            ))}
          </ol>
        </Secao>

        <Secao titulo={"Brief de Discovery por pessoa"} vazio={BRIEF_DISCOVERY.length === 0} mensagemVazio={"Nenhum campo de Brief registrado nesta versão."}>
          <div className={`${CARTAO} overflow-x-auto`}>
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-navy/60">
                <tr>
                  <th className="py-2">Campo</th>
                  <th className="py-2">Origem</th>
                  <th className="py-2">Retorna ao CRM</th>
                </tr>
              </thead>
              <tbody className="text-navy/85">
                {BRIEF_DISCOVERY.map((c) => (
                  <tr key={c.campo} className="border-t border-navy/10">
                    <td className="py-2 pr-3">{c.campo}</td>
                    <td className="py-2 pr-3">{c.origem}</td>
                    <td className="py-2">{c.retornaAoCrm ? "Sim (referência)" : "Não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Secao>

        <Secao titulo={"Matriz de handoff"} vazio={MATRIZ_HANDOFF_CA04.length === 0} mensagemVazio={"Nenhuma etapa de handoff registrada nesta versão."}>
          <div className="space-y-3">
            {MATRIZ_HANDOFF_CA04.map((e) => (
              <article key={e.etapa} className={CARTAO}>
                <p className="text-sm font-semibold text-navy">{e.etapa}</p>
                <dl className="mt-2 grid gap-2 text-sm text-navy/80 md:grid-cols-2">
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Recebe</dt><dd>{e.dadoRecebido}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Cria</dt><dd>{e.dadoCriado}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Responsável</dt><dd>{e.responsavel}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Condição de aprovação</dt><dd>{e.condicaoAprovacao}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Visibilidade</dt><dd>{e.visibilidade}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Bloqueio</dt><dd className="text-terracotta">{e.bloqueio}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <ul className={`${CARTAO} list-disc space-y-1 pl-6 text-sm text-navy/85`}>
            {BLOQUEIOS_EXEMPLARES_HANDOFF.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Secao>

        <Secao titulo={"Nunca projetar ao cliente"} vazio={(CAMPOS_PROIBIDOS_CLIENTE_CA04 as readonly string[]).length === 0} mensagemVazio={"Nenhum campo proibido registrado nesta versão."}>
          <div className={`${CARTAO} flex flex-wrap gap-2`}>
            {CAMPOS_PROIBIDOS_CLIENTE_CA04.map((c) => (
              <span key={c} className="rounded-full border border-terracotta/30 bg-terracotta/10 px-3 py-1 text-xs text-terracotta">
                {c}
              </span>
            ))}
          </div>
        </Secao>

        <Secao titulo={"Listas controladas (LISTAS_BASE v1.1)"} vazio={listas.length === 0} mensagemVazio={"Nenhuma lista controlada disponível nesta versão."}>
          <div className="grid gap-3 md:grid-cols-2">
            {listas.map((nome) => (
              <details key={nome} className={CARTAO}>
                <summary className="cursor-pointer text-sm font-medium text-navy">
                  {nome} <span className="text-navy/50">({LISTAS_BASE_CA04[nome].length})</span>
                </summary>
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-navy/80">
                  {(LISTAS_BASE_CA04[nome] as readonly string[]).map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </Secao>

        <Secao titulo={"Decisões humanas pendentes"} vazio={DECISOES_PENDENTES_CA04.length === 0} mensagemVazio={"Nenhuma decisão humana pendente registrada."}>
          <ol className={`${CARTAO} space-y-2 text-sm text-navy/85`}>
            {DECISOES_PENDENTES_CA04.map((d) => (
              <li key={d.numero} className="flex gap-3">
                <span className="text-navy/50">{String(d.numero).padStart(2, "0")}</span>
                <span>
                  {d.titulo}
                  <span className="block text-xs text-navy/55">Responsável: {d.responsavel}</span>
                </span>
              </li>
            ))}
          </ol>
        </Secao>
      </div>
    </SaasShell>
  );
}

function TabelaTransicoes({
  transicoes,
}: {
  transicoes: readonly {
    de: string;
    para: string;
    gatilho: string;
    responsavel: string;
    dadosMinimos: string;
    bloqueio: string;
    fonteVerdade: string;
  }[];
}) {
  return (
    <div className={`${CARTAO} overflow-x-auto`}>
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-navy/60">
          <tr>
            <th className="py-2">Transição</th>
            <th className="py-2">Gatilho</th>
            <th className="py-2">Responsável</th>
            <th className="py-2">Dados mínimos</th>
            <th className="py-2">Bloqueio</th>
            <th className="py-2">Fonte de verdade</th>
          </tr>
        </thead>
        <tbody className="text-navy/85">
          {transicoes.map((t) => (
            <tr key={`${t.de}-${t.para}`} className="border-t border-navy/10 align-top">
              <td className="py-2 pr-3 font-medium text-navy">
                {t.de === "*" ? "Qualquer etapa" : t.de} → {t.para}
              </td>
              <td className="py-2 pr-3">{t.gatilho}</td>
              <td className="py-2 pr-3">{t.responsavel}</td>
              <td className="py-2 pr-3">{t.dadosMinimos}</td>
              <td className="py-2 pr-3 text-terracotta">{t.bloqueio}</td>
              <td className="py-2">{t.fonteVerdade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
