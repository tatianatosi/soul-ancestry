import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import {
  ANA_LUIZA,
  ATIVOS,
  DUPLICIDADES,
  FLUXOS_QUEBRADOS,
  MAPAS,
  ORFAOS,
  PLANO,
  SNAPSHOT,
  type Ativo,
} from "@/lib/inventario-recuperacao";

export const Route = createFileRoute("/_authenticated/governanca/inventario-recuperacao")({
  head: () => ({
    meta: [
      { title: "Inventário e recuperação de ativos — Clube Ancestral" },
      {
        name: "description",
        content:
          "Inventário técnico-funcional somente leitura dos ativos existentes: banco, rotas, componentes, integrações e lacunas do piloto real.",
      },
      { property: "og:title", content: "Inventário e recuperação de ativos — Clube Ancestral" },
      {
        property: "og:description",
        content: "Mapa somente leitura do que já existe antes de qualquer nova construção.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InventarioPage,
});

const CORES_STATUS: Record<string, string> = {
  ativo: "bg-emerald-100 text-emerald-900",
  "parcialmente ativo": "bg-amber-100 text-amber-900",
  órfão: "bg-orange-100 text-orange-900",
  duplicado: "bg-fuchsia-100 text-fuchsia-900",
  legado: "bg-slate-200 text-slate-800",
  DEMO: "bg-sky-100 text-sky-900",
  "bloqueado por decisão": "bg-zinc-200 text-zinc-800",
  quebrado: "bg-red-100 text-red-900",
  desconhecido: "bg-yellow-100 text-yellow-900",
};

const CORES_RISCO: Record<string, string> = {
  baixo: "bg-emerald-100 text-emerald-900",
  médio: "bg-amber-100 text-amber-900",
  alto: "bg-orange-100 text-orange-900",
  crítico: "bg-red-100 text-red-900",
};

function Etiqueta({ texto, mapa }: { texto: string; mapa: Record<string, string> }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${mapa[texto] ?? "bg-muted"}`}>
      {texto}
    </span>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

function InventarioPage() {
  const [busca, setBusca] = useState("");
  const [dominio, setDominio] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [risco, setRisco] = useState("todos");
  const [aberto, setAberto] = useState<string | null>(null);

  const dominios = useMemo(() => Array.from(new Set(ATIVOS.map((a) => a.dominio))).sort(), []);
  const statuses = useMemo(() => Array.from(new Set(ATIVOS.map((a) => a.status))).sort(), []);
  const riscos = ["baixo", "médio", "alto", "crítico"];

  const filtrados: Ativo[] = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return ATIVOS.filter((a) => {
      if (dominio !== "todos" && a.dominio !== dominio) return false;
      if (status !== "todos" && a.status !== status) return false;
      if (risco !== "todos" && a.risco !== risco) return false;
      if (!termo) return true;
      return [a.id, a.local, a.dados, a.evidencia, a.consumidor, a.dependencias.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(termo);
    });
  }, [busca, dominio, status, risco]);

  const lacunasAna = ANA_LUIZA.filter((i) => !i.localizado);

  return (
    <SaasShell
      titulo="Inventário e recuperação de ativos"
      descricao="Página somente leitura. Nenhum ativo foi criado, alterado ou removido para gerar este inventário."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Bloqueio de nova construção ativo</p>
          <p className="mt-1">
            Snapshot de {SNAPSHOT.data}. {SNAPSHOT.metodo}
          </p>
          <p className="mt-1">
            Toda decisão de preservar, reconectar, corrigir, substituir ou arquivar depende de aprovação humana
            explícita. Nenhuma fase seguinte foi iniciada.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(SNAPSHOT.totais).map(([chave, valor]) => (
            <div key={chave} className="rounded-lg border bg-card p-3">
              <p className="text-2xl font-semibold">{valor}</p>
              <p className="text-xs text-muted-foreground capitalize">{chave.replace(/([A-Z])/g, " $1")}</p>
            </div>
          ))}
        </div>

        <Secao titulo={`Inventário de ativos (${filtrados.length} de ${ATIVOS.length})`}>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, local, evidência…"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              aria-label="Buscar ativo"
            />
            <select
              value={dominio}
              onChange={(e) => setDominio(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              aria-label="Filtrar por domínio"
            >
              <option value="todos">Todos os domínios</option>
              {dominios.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              aria-label="Filtrar por status"
            >
              <option value="todos">Todos os status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={risco}
              onChange={(e) => setRisco(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              aria-label="Filtrar por risco"
            >
              <option value="todos">Todos os riscos</option>
              {riscos.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-3">Ativo</th>
                  <th className="py-2 pr-3">Domínio</th>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3">Localização</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Risco</th>
                  <th className="py-2 pr-3">Decisão sugerida</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((a) => (
                  <>
                    <tr
                      key={a.id}
                      className="cursor-pointer border-b align-top hover:bg-muted/50"
                      onClick={() => setAberto(aberto === a.id ? null : a.id)}
                    >
                      <td className="py-2 pr-3 font-medium">{a.id}</td>
                      <td className="py-2 pr-3">{a.dominio}</td>
                      <td className="py-2 pr-3">{a.tipo}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{a.local}</td>
                      <td className="py-2 pr-3">
                        <Etiqueta texto={a.status} mapa={CORES_STATUS} />
                      </td>
                      <td className="py-2 pr-3">
                        <Etiqueta texto={a.risco} mapa={CORES_RISCO} />
                      </td>
                      <td className="py-2 pr-3">{a.decisao}</td>
                    </tr>
                    {aberto === a.id && (
                      <tr key={`${a.id}-det`} className="border-b bg-muted/30">
                        <td colSpan={7} className="p-4 text-sm">
                          <dl className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <dt className="text-xs uppercase text-muted-foreground">Responsável / consumidor</dt>
                              <dd>{a.consumidor}</dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase text-muted-foreground">Dependências</dt>
                              <dd>{a.dependencias.length ? a.dependencias.join(" · ") : "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase text-muted-foreground">Dados que produz/consome</dt>
                              <dd>{a.dados}</dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase text-muted-foreground">Evidência técnica</dt>
                              <dd>{a.evidencia}</dd>
                            </div>
                          </dl>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Secao>

        <Secao titulo="Mapas obrigatórios por domínio">
          <div className="grid gap-4 lg:grid-cols-2">
            {MAPAS.map((m) => (
              <div key={m.id} className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">{m.titulo}</h3>
                <ul className="space-y-1 text-sm">
                  {m.linhas.map((l) => (
                    <li key={l.item}>
                      <span className="font-medium">{l.item}:</span>{" "}
                      <span className="text-muted-foreground">{l.situacao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo={`Ana Luiza — ativos localizados e lacunas (${lacunasAna.length} lacunas)`}>
          <p className="mb-3 text-sm text-muted-foreground">
            Caso canônico CA-2026-ANA-001. Itens não localizados são registrados como lacuna, com a fonte onde
            deveriam estar. Nenhum dado fictício foi criado para preencher lacunas.
          </p>
          <ul className="space-y-2 text-sm">
            {ANA_LUIZA.map((i) => (
              <li key={i.item} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{i.item}</span>
                  <Etiqueta
                    texto={i.localizado ? "localizado" : "não localizado"}
                    mapa={{
                      localizado: "bg-emerald-100 text-emerald-900",
                      "não localizado": "bg-red-100 text-red-900",
                    }}
                  />
                </div>
                <p className="mt-1">{i.situacao}</p>
                <p className="mt-1 text-xs text-muted-foreground">Evidência: {i.evidencia}</p>
              </li>
            ))}
          </ul>
        </Secao>

        <div className="grid gap-4 lg:grid-cols-3">
          <Secao titulo="Duplicidades">
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {DUPLICIDADES.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Secao>
          <Secao titulo="Ativos órfãos">
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {ORFAOS.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Secao>
          <Secao titulo="Fluxos quebrados">
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {FLUXOS_QUEBRADOS.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Secao>
        </div>

        <Secao titulo="Plano de recuperação priorizado">
          <p className="mb-3 text-sm text-muted-foreground">
            P0 bloqueia o piloto real · P1 recupera o CRM vivo · P2 integra planejador e painéis · P3 melhoria
            futura. Nenhuma ação foi executada.
          </p>
          <div className="space-y-2">
            {(["P0", "P1", "P2", "P3"] as const).map((p) => (
              <div key={p}>
                {PLANO.filter((a) => a.prioridade === p).map((a) => (
                  <div key={a.acao} className="mb-2 rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        {a.prioridade}
                      </span>
                      <span className="font-medium">{a.acao}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{a.motivo}</p>
                    {a.requerAprovacao && (
                      <p className="mt-1 text-xs font-medium text-amber-700">Requer aprovação humana explícita</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Secao>
      </div>
    </SaasShell>
  );
}
