import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { EstadoVazio, PAPEL_LABEL, SaasShell } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoDados } from "@/components/saas/estado-dados";
import { StatusEnvioRecuperacao } from "@/components/equipe/status-envio-recuperacao";
import { CardIndicador } from "@/components/desk/ui-desk";
import {
  alterarPapelMembro,
  alterarStatusMembro,
  arquivarMembroEquipe,
  convidarMembroEquipe,
  listarEquipe,
} from "@/lib/equipe.functions";
import { KitBadge, KitCard, KpiCard } from "@/components/clube-ancestral-kit";

export const Route = createFileRoute("/_authenticated/equipe")({
  head: () => ({
    meta: [
      { title: "Usuários e papéis — Clube Ancestral" },
      { name: "description", content: "Gestão de acessos internos, papéis e status da equipe Clube Ancestral." },
      { property: "og:title", content: "Usuários e papéis — Clube Ancestral" },
      { property: "og:description", content: "Convites internos, papéis e suspensão de acessos da equipe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EquipePage,
});

const STATUS_LABEL: Record<string, string> = {
  invited: "Convidado",
  active: "Ativo",
  suspended: "Suspenso",
  revoked: "Revogado",
};

const PAPEIS = ["admin", "operacoes", "pesquisador", "comercial", "financeiro", "leitura"] as const;

function EquipePage() {
  const autoridade = useAutoridade();
  // Antes: `ehAdmin` escondia a tela inteira. Agora só falta de papel/organização bloqueia.
  const decisao = autoridade.decidir({ capacidade: "editar_fila_responsavel_prazo" });
  const liberado = decisao.decisao !== "bloquear";
  const queryClient = useQueryClient();
  const listar = useServerFn(listarEquipe);
  const convidar = useServerFn(convidarMembroEquipe);
  const mudarPapel = useServerFn(alterarPapelMembro);
  const mudarStatus = useServerFn(alterarStatusMembro);
  const arquivar = useServerFn(arquivarMembroEquipe);

  const q = useQuery({ queryKey: ["equipe"], queryFn: () => listar({}) });
  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["equipe"] });

  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<string>("leitura");
  const [dias, setDias] = useState(7);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const mConvite = useMutation({
    mutationFn: () => convidar({ data: { email, nome, papel, diasValidade: dias } }),
    onSuccess: () => {
      setMsg("Convite criado. Enviamos um link temporário para definição da senha inicial.");
      setErro(null);
      setEmail("");
      setNome("");
      invalidar();
    },
    onError: (e: Error) => {
      setErro(e.message);
      setMsg(null);
    },
  });

  async function executar(fn: () => Promise<unknown>) {
    try {
      await fn();
      setErro(null);
      invalidar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  // Cartões de decisão do grupo Administração — contam só o que já está
  // carregado por listarEquipe; sem fonte real, "Sem dados suficientes".
  const membros = q.data?.membros ?? [];
  const usuariosAtivos = q.data ? membros.filter((m) => m.status === "active").length : null;
  const convitesPendentes = q.data ? membros.filter((m) => m.status === "invited").length : null;
  const suspensosOuRevogados = q.data
    ? membros.filter((m) => m.status === "suspended" || m.status === "revoked").length
    : null;
  const papeisNaoReconhecidos = q.data
    ? membros.filter((m) => m.status === "active" && !(PAPEIS as readonly string[]).includes(m.role)).length
    : null;

  return (
    <SaasShell
      titulo="Usuários e papéis"
      descricao="Equipe interna acessa por e-mail e senha. Não existe autocadastro."
      visualKit="pantone"
    >
      {!liberado ? (
        <EstadoVazio mensagem={decisao.motivo} />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Usuários ativos" value={usuariosAtivos} detail="Status ativo" tone="success" />
            <KpiCard label="Convites pendentes" value={convitesPendentes} detail="Aguardando definição de senha" tone="attention" />
            <KpiCard label="Suspensos ou revogados" value={suspensosOuRevogados} detail="Sem acesso ativo" tone="critical" />
            <KpiCard label="Papéis não reconhecidos" value={papeisNaoReconhecidos} detail="Fora da lista padrão" tone="critical" />
          </div>

          <StatusEnvioRecuperacao />

          <KitCard eyebrow="Acesso Master" title="Convidar membro" action={<KitBadge tone="gold">Equipe interna</KitBadge>}>
            <h2 className="font-serif text-xl">Convidar membro</h2>
            <p className="mt-1 text-sm text-navy/60">
              O convite envia um link temporário apenas para definir a senha inicial. Papel e organização são
              gravados no servidor.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                  placeholder="pessoa@clubeancestral.com"
                />
              </label>
              <label className="text-sm">
                Nome
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Papel
                <select
                  value={papel}
                  onChange={(e) => setPapel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  {PAPEIS.map((p) => (
                    <option key={p} value={p}>
                      {PAPEL_LABEL[p]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Validade do convite (dias)
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={dias}
                  onChange={(e) => setDias(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                />
              </label>
            </div>
            <button
              onClick={() => mConvite.mutate()}
              disabled={!email || mConvite.isPending}
              className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-50"
            >
              {mConvite.isPending ? "Enviando…" : "Convidar"}
            </button>
            {msg ? <p className="mt-3 text-sm text-green-700">{msg}</p> : null}
            {erro ? <p className="mt-3 text-sm text-terracotta">{erro}</p> : null}
          </KitCard>

          <section>
            <h2 className="font-serif text-xl">Membros</h2>
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={q.data?.membros}
              aoTentarNovamente={() => void q.refetch()}
              recurso="a equipe"
              vazio="Nenhum acesso interno cadastrado."
            >
              {(listaMembros) => (
              <div className="mt-3 space-y-3">
                {listaMembros.map((m) => (
                  <div key={m.id} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {m.full_name ?? "—"}
                          {m.demo ? <span className="ml-2 text-xs uppercase text-gold">DEMO</span> : null}
                        </p>
                        <p className="text-sm text-navy/60">{m.email}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-navy/50">
                          {PAPEL_LABEL[m.role as keyof typeof PAPEL_LABEL]} · {STATUS_LABEL[m.status]}
                          {m.last_login_at
                            ? ` · último acesso ${new Date(m.last_login_at).toLocaleString("pt-BR")}`
                            : ""}
                        </p>
                        {m.reason ? <p className="mt-1 text-xs text-navy/50">Motivo: {m.reason}</p> : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={m.role}
                          onChange={(e) => executar(() => mudarPapel({ data: { id: m.id, papel: e.target.value } }))}
                          className="rounded-lg border border-navy/20 px-2 py-1.5 text-xs"
                        >
                          {PAPEIS.map((p) => (
                            <option key={p} value={p}>
                              {PAPEL_LABEL[p]}
                            </option>
                          ))}
                        </select>
                        {m.status !== "active" ? (
                          <button
                            onClick={() => executar(() => mudarStatus({ data: { id: m.id, status: "active" } }))}
                            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                          >
                            Reativar
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const motivo = window.prompt("Motivo da suspensão (opcional):");
                              if (motivo === null) return;
                              executar(() => mudarStatus({ data: { id: m.id, status: "suspended", motivo } }));
                            }}
                            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                          >
                            Suspender
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const motivo = window.prompt("Motivo da revogação (opcional):");
                            if (motivo === null) return;
                            executar(() => mudarStatus({ data: { id: m.id, status: "revoked", motivo } }));
                          }}
                          className="rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs text-terracotta"
                        >
                          Revogar
                        </button>
                        <button
                          onClick={() => {
                            const motivo = window.prompt("Motivo do arquivamento (opcional):");
                            if (motivo === null) return;
                            executar(() => arquivar({ data: { id: m.id, motivo } }));
                          }}
                          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                        >
                          Arquivar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </EstadoDados>
            <p className="mt-4 text-xs text-navy/50">
              Acessos internos nunca são excluídos fisicamente: são arquivados com motivo e responsável, e toda
              alteração entra na auditoria.
            </p>
          </section>
        </div>
      )}
    </SaasShell>
  );
}
