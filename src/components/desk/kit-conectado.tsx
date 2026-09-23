/**
 * Kit visual do Clube Ancestral ligado às tabelas reais.
 *
 * 13/09/2026 — decisão da Proprietária: o kit não ganha banco próprio. Os
 * componentes exportados aqui apenas *leem* as fontes canônicas já existentes
 * (`crm_casos` via ficha do caso, `clientes`/`nucleo_membros`/`documents` via
 * Pessoa, `app_projections` via fila de microentregas) e alimentam os
 * componentes do kit. Nenhuma tabela nova, nenhuma inferência, nenhum dado
 * inventado: ausência de dado aparece declarada.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  ChecklistCard,
  ContentShelf,
  FamilyCoreCard,
  KitCard,
  KitEmptyState,
  KpiCard,
  MicrodeliveryCard,
  NextActionCard,
  PublicationQueue,
  type ContentKind,
  type GenealogyPerson,
} from "@/components/clube-ancestral-kit";
import { carregarFichaCaso } from "@/lib/caso-ficha.functions";
import { carregarPessoa } from "@/lib/pessoa.functions";
import { listarFilaMicroentregas } from "@/lib/biblioteca-evidencias.functions";

function Falha({ mensagem }: { mensagem: string }) {
  return (
    <p role="alert" className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
      {mensagem}
    </p>
  );
}

function Carregando({ rotulo }: { rotulo: string }) {
  return <p className="rounded-xl border border-navy/10 bg-cream/40 p-4 text-sm text-navy/60">{rotulo}…</p>;
}

function dataBr(valor: unknown) {
  if (typeof valor !== "string" || !valor) return "Sem data registrada";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? valor : d.toLocaleDateString("pt-BR");
}

function texto(valor: unknown, vazio = "Não registrado") {
  return typeof valor === "string" && valor.trim() ? valor : vazio;
}

/** Caso 360 — leitura do kit sobre a ficha real do caso. */
export function ResumoKitCaso({ caseId }: { caseId: string }) {
  const carregar = useServerFn(carregarFichaCaso);
  const q = useQuery({
    queryKey: ["kit-conectado", "caso", caseId],
    queryFn: () => carregar({ data: { id: caseId } }),
    retry: false,
  });

  if (q.isLoading) return <Carregando rotulo="Carregando a leitura do caso" />;
  if (q.isError || !q.data) {
    return <Falha mensagem="A leitura do caso falhou. Isto é erro de leitura, não caso vazio." />;
  }

  const ficha = q.data;
  const caso = ficha.caso as Record<string, unknown>;
  const checks = ficha.checksAtivacao as Record<string, unknown>[];
  const checksOk = checks.filter((c) => c["status"] === "ok" || c["status"] === "concluido").length;

  return (
    <section className="space-y-4" aria-label="Leitura do caso com o kit visual">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Pessoas no caso" value={ficha.membros.length} detail="Registros reais de núcleo e membros" />
        <KpiCard
          label="Requisitos de ativação"
          value={checks.length ? `${checksOk}/${checks.length}` : "Sem registro"}
          detail="Validações persistidas do caso"
          tone={checks.length && checksOk === checks.length ? "success" : "attention"}
        />
        <KpiCard
          label="Bloqueios reais"
          value={ficha.bloqueiosReais.length}
          detail="Motivos apurados pelo motor do caso"
          tone={ficha.bloqueiosReais.length ? "critical" : "success"}
        />
        <KpiCard label="Eventos na linha do tempo" value={ficha.timeline.length} detail="Registros já gravados" />
      </div>

      <NextActionCard
        action={texto(caso["proxima_acao"] ?? caso["proxima_acao_codigo"], "Próxima ação não registrada")}
        owner={texto(caso["proxima_acao_responsavel"], "Responsável não definido")}
        due={dataBr(caso["prazo_proxima_acao"])}
      />

      {checks.length ? (
        <ChecklistCard
          title="Requisitos de ativação registrados"
          items={checks.map((c, i) => ({
            id: String(c["check_key"] ?? i),
            label: texto(c["label"] ?? c["check_key"], "Requisito sem rótulo"),
            done: c["status"] === "ok" || c["status"] === "concluido",
            detail: texto(c["dominio"], "Domínio não informado"),
          }))}
        />
      ) : (
        <KitEmptyState
          title="Nenhum requisito de ativação registrado"
          description="Este caso ainda não tem validações persistidas. Nada é presumido como atendido."
        />
      )}

      {ficha.bloqueiosReais.length ? (
        <KitCard title="Bloqueios reais do caso" eyebrow="Fonte canônica">
          <ul className="space-y-2 text-sm text-navy/80">
            {ficha.bloqueiosReais.map((b, index) => (
              <li key={`${b.regra}-${b.tabela_campo}-${index}`} className="border-t border-navy/10 pt-2 first:border-0 first:pt-0">
                <strong className="text-navy">{b.motivo}</strong>
                <span className="block text-xs text-navy/55">{b.dominio}</span>
              </li>
            ))}
          </ul>
        </KitCard>
      ) : null}
    </section>
  );
}

/** Pessoa & Famílias — núcleo, casos e documentos reais da Pessoa Canônica. */
export function NucleoKitPessoa({ clienteId }: { clienteId: string }) {
  const carregar = useServerFn(carregarPessoa);
  const q = useQuery({
    queryKey: ["kit-conectado", "pessoa", clienteId],
    queryFn: () => carregar({ data: { clienteId } }),
    retry: false,
  });

  if (q.isLoading) return <Carregando rotulo="Carregando pessoa e núcleo" />;
  if (q.isError || !q.data) return <Falha mensagem="A leitura da pessoa falhou. Nada foi inferido." />;
  if (!q.data.encontrada) {
    return <KitEmptyState title="Pessoa não encontrada" description="Nenhum registro desta pessoa nesta organização." />;
  }

  const dados = q.data;
  const cliente = dados.cliente as Record<string, unknown>;
  const pessoas: GenealogyPerson[] = [
    {
      id: String(cliente["id"]),
      name: texto(cliente["nome"], "Pessoa sem nome registrado"),
      role: "Pessoa Canônica",
      place: texto(cliente["endereco_cidade"], "Cidade não registrada"),
      status: texto(cliente["status_comercial"], "Sem status comercial"),
    },
    ...dados.nucleoMembros.map((m) => ({
      id: String(m["id"]),
      name: texto(m["nome"], "Membro sem nome"),
      role: texto(m["papel"], "Papel não registrado"),
      place: texto(m["vinculo"], "Vínculo não registrado"),
      status: texto(m["processo"], "Sem processo vinculado"),
    })),
  ];

  const documentos = dados.documentos.slice(0, 8).map((d) => ({
    id: String(d["id"]),
    kind: "Relatório" as ContentKind,
    title: texto(d["titulo"], "Documento sem título"),
    subtitle: dataBr(d["created_at"]),
    state: d["liberado_cliente"] ? "Liberado ao cliente" : texto(d["status"], "Interno"),
  }));

  return (
    <section className="space-y-4" aria-label="Pessoa e núcleo com o kit visual">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Casos da pessoa" value={dados.casos.length} detail="Vínculos reais em crm_casos" />
        <KpiCard label="Membros de núcleo" value={dados.nucleoMembros.length} detail="Registros em núcleo familiar" />
        <KpiCard label="Documentos" value={dados.documentos.length} detail="Arquivos vinculados à pessoa" />
        <KpiCard label="Entregas publicadas" value={dados.projecoesPublicadas.length} detail="Projeções do App Cliente" />
      </div>

      <FamilyCoreCard
        title="Núcleo familiar registrado"
        people={pessoas}
        status={dados.nucleoMembros.length ? "Registros reais" : "Sem membros cadastrados"}
      />

      {documentos.length ? (
        <ContentShelf title="Documentos da pessoa" items={documentos} />
      ) : (
        <KitEmptyState
          title="Nenhum documento vinculado"
          description="Esta pessoa ainda não tem documento registrado nos casos dela."
        />
      )}
    </section>
  );
}

const MAPA_STATUS: Record<string, "draft" | "review" | "approved" | "published"> = {
  draft: "draft",
  in_review: "review",
  approved: "approved",
  published: "published",
};

/** Documentos & Microentregas — fila editorial real da Biblioteca. */
export function FilaKitMicroentregas() {
  const carregar = useServerFn(listarFilaMicroentregas);
  const q = useQuery({ queryKey: ["kit-conectado", "microentregas"], queryFn: () => carregar(), retry: false });

  if (q.isLoading) return <Carregando rotulo="Carregando a fila de microentregas" />;
  if (q.isError || !q.data) return <Falha mensagem="A fila não pôde ser lida. Isto não significa fila vazia." />;

  const linhas = q.data;
  const counts = { draft: 0, review: 0, approved: 0, published: 0 };
  for (const item of linhas) {
    const chave = MAPA_STATUS[item.status];
    if (chave) counts[chave] += 1;
  }

  return (
    <section className="space-y-4" aria-label="Fila de microentregas com o kit visual">
      <PublicationQueue counts={counts} />
      {linhas.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {linhas.slice(0, 6).map((item) => (
            <MicrodeliveryCard
              key={item.id}
              title={`${item.casoCodigo ?? "Caso sem código"} · ${item.tipo}`}
              state={item.status}
              publishedAt={item.prazo ? dataBr(item.prazo) : undefined}
            />
          ))}
        </div>
      ) : (
        <KitEmptyState
          title="Nenhuma microentrega registrada"
          description="A fila mostra somente projeções já gravadas na Biblioteca."
        />
      )}
    </section>
  );
}
