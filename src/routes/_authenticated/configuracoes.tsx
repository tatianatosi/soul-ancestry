import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { EstadoVazio, PAPEL_LABEL, SaasShell } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { definirPapel, listarAuditoria, listarUsuarios, type Papel } from "@/lib/saas.functions";
import { obterModoProprietaria, type EventoProprietaria } from "@/lib/modo-proprietaria.functions";
import { CAPACIDADES_PROPRIETARIA, ROTULO_CAPACIDADE } from "@/lib/modo-proprietaria";
import { ConfiguracaoAcessoV4 } from "@/components/desk/configuracao-acesso-v4";
import { CaCard } from "@/components/ui/ca-card";
import { Etiqueta } from "@/components/prancha-v4/kit";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Papéis e Modo Proprietária — Clube Ancestral" },
      { name: "description", content: "Administração de membros e papéis dentro da organização." },
      { property: "og:title", content: "Papéis e Modo Proprietária — Clube Ancestral" },
      { property: "og:description", content: "Administração de acesso no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfiguracoesPage,
});

const PAPEIS = Object.keys(PAPEL_LABEL) as Papel[];

function ConfiguracoesPage() {
  const autoridade = useAutoridade();
  // Antes: `ehAdmin` escondia a tela inteira e desligava a consulta.
  const decisao = autoridade.decidir({ capacidade: "ver_todos_estados_da_organizacao" });
  const liberado = decisao.decisao !== "bloquear";
  const queryClient = useQueryClient();
  const listar = useServerFn(listarUsuarios);
  const definir = useServerFn(definirPapel);

  const carregarModo = useServerFn(obterModoProprietaria);
  const qModo = useQuery({ queryKey: ["modo-proprietaria"], queryFn: () => carregarModo() });

  const carregarAuditoria = useServerFn(listarAuditoria);
  const qAuditoria = useQuery({
    queryKey: ["saas", "auditoria"],
    queryFn: () => carregarAuditoria(),
    enabled: liberado,
  });

  const q = useQuery({
    queryKey: ["saas", "usuarios"],
    queryFn: () => listar(),
    enabled: liberado,
  });

  const m = useMutation({
    mutationFn: (v: { userId: string; papel: Papel; conceder: boolean; motivo: string }) => definir({ data: v }),
    onSuccess: (_r, variaveis) => {
      toast.success(
        variaveis.conceder
          ? `Papel ${PAPEL_LABEL[variaveis.papel]} concedido.`
          : `Papel ${PAPEL_LABEL[variaveis.papel]} removido.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["saas", "usuarios"] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível atualizar o papel."),
  });

  const usuariosOperacionais = q.data?.filter((usuario) => {
    const email = usuario.email?.toLowerCase() ?? "";
    return !email.endsWith(".test") && !email.includes("@exemplo.");
  });

  return (
    <SaasShell titulo="Configuração & Acesso" descricao="Composição da prancha V4. Somente administradores da organização. Gestão de contas da equipe fica em Equipe e papéis." visualKit="pantone">
      {/*
        Prancha V4 (19/10/2026): Permissões · painel selecionado (Política
        operacional por padrão) · Registro de auditoria — somente leitura,
        sobre as mesmas consultas desta rota.
      */}
      <ConfiguracaoAcessoV4
        liberado={liberado}
        motivoBloqueio={decisao.motivo}
        papelAtual={qModo.data?.papel}
        usuarios={usuariosOperacionais}
        carregandoUsuarios={q.isLoading}
        eventos={qAuditoria.data}
        carregandoEventos={qAuditoria.isLoading}
        erroEventos={qAuditoria.error}
        rotuloAcao={rotuloAcaoEvento}
        renderTrilha={(eventos) => <TrilhaAuditoria eventos={eventos} />}
      />
      <CaCard className="mt-4"><details>
        <summary className="cursor-pointer font-serif text-lg text-navy">Abrir Modo Proprietária</summary>
        <div className="mt-5 border-t border-navy/10 pt-5">
          <PainelModoProprietaria
            dados={qModo.data}
            carregando={qModo.isLoading}
            erro={qModo.error}
            aoTentarNovamente={() => void qModo.refetch()}
          />
        </div>
      </details></CaCard>

      <CaCard className="mt-6"><details>
        <summary className="cursor-pointer font-serif text-lg text-navy">Abrir gestão detalhada de membros e permissões</summary>
        <div className="mt-5 border-t border-navy/10 pt-5">

      {!liberado ? (
        <EstadoVazio mensagem={decisao.motivo} />
      ) : (
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={usuariosOperacionais}
          aoTentarNovamente={() => void q.refetch()}
          recurso="os membros da organização"
          vazio="Nenhum membro nesta organização ainda."
        >
          {(usuarios) => (
        <div className="space-y-3">
          {usuarios.map((u) => (
            <div key={u.userId} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-navy">{u.nome ?? u.email ?? "Membro"}</p>
                  <p className="text-xs text-navy/50">{u.email ?? u.userId}</p>
                </div>
                {u.arquivado ? <Etiqueta texto="Arquivado" /> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {PAPEIS.map((papel) => {
                  const ativo = u.papeis.includes(papel);
                  return (
                    <AcaoOperacional
                      key={papel}
                      rotulo={PAPEL_LABEL[papel]}
                      acaoExterna="definir_papel_membro"
                      efeito={
                        ativo
                          ? `Remove o papel ${PAPEL_LABEL[papel]} deste membro.`
                          : `Concede o papel ${PAPEL_LABEL[papel]} a este membro — inclui acesso administrativo quando aplicável.`
                      }
                      className={
                        ativo
                          ? "rounded-full bg-navy px-3 py-1 text-xs text-cream"
                          : "rounded-full border border-navy/20 px-3 py-1 text-xs text-navy/60 hover:bg-navy/5"
                      }
                      onConfirmar={(motivo) => {
                        if (m.isPending) return;
                        m.mutate({ userId: u.userId, papel, conceder: !ativo, motivo });
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
          )}
        </EstadoDados>
      )}
        </div>
      </details></CaCard>

      <CaCard className="mt-4"><details>
        <summary className="cursor-pointer font-serif text-lg text-navy">Abrir trilha de auditoria</summary>
        <div className="mt-5 border-t border-navy/10 pt-5">
          {!liberado ? (
            <EstadoVazio mensagem={decisao.motivo} />
          ) : (
            <EstadoDados
              carregando={qAuditoria.isLoading}
              erro={qAuditoria.error}
              dados={qAuditoria.data}
              aoTentarNovamente={() => void qAuditoria.refetch()}
              recurso="a trilha de auditoria"
              vazio="Nenhum evento de auditoria registrado nesta organização ainda."
            >
              {(eventos) => <TrilhaAuditoria eventos={eventos} />}
            </EstadoDados>
          )}
        </div>
      </details></CaCard>
    </SaasShell>
  );
}

/**
 * 24/09/2026 — achado real: `listarAuditoria` já existia (lê audit_logs com
 * diff completo, RLS admin-only), mas nenhuma tela a consumia — a trilha
 * administrativa geral do motor de Governança ficava sem tela, mesmo com o
 * resto do motor (escritores em ~30 módulos, RLS real) já pronto. Reaproveita
 * `EstadoDados`/`SaasShell` já usados no resto desta página.
 */
function TrilhaAuditoria({ eventos }: { eventos: Record<string, unknown>[] }) {
  return (
    <ul className="space-y-1.5 text-xs text-navy/70">
      {eventos.map((e) => {
        const valoresAntes = e["valores_anteriores"];
        const valoresDepois = e["valores_posteriores"];
        const temDiff = valoresAntes != null || valoresDepois != null;
        return (
          <li key={String(e["id"])} className="rounded-md bg-cream/60 px-2 py-1.5">
            <span className="font-medium text-navy">{rotuloAcaoEvento(String(e["acao"]))}</span>
            {e["entidade"] ? ` · ${String(e["entidade"])}` : ""}
            {" · "}
            {String(e["autorNome"] ?? e["autorEmail"] ?? "Autor não identificado")}
            {" · "}
            {new Date(String(e["created_at"])).toLocaleString("pt-BR")}
            {temDiff ? (
              <details className="mt-1">
                <summary className="cursor-pointer text-navy/50">Ver antes/depois</summary>
                <pre className="mt-1 overflow-x-auto rounded bg-navy/5 p-2 text-[11px] text-navy/70">
                  {JSON.stringify({ antes: valoresAntes ?? null, depois: valoresDepois ?? null }, null, 2)}
                </pre>
              </details>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function rotuloAcaoEvento(acao: string): string {
  if (acao === "revogar_override_comercial") return "Revogou uma decisão anterior";
  return acao.replace(/_/g, " ");
}

/**
 * Declara o Modo Proprietária em vez de deixá-lo implícito no comportamento
 * dos botões. Pedido repetido: "o modo proprietário nunca foi feito" — a
 * decisão sempre existiu (`modo-proprietaria.ts`, `useAutoridade`), mas
 * nenhuma tela dizia isso de volta. Esta seção lê o estado real — nunca
 * declara ativo por suposição — e mostra os últimos avanços que o próprio
 * modo já autorizou, gravados em `owner_override_events`.
 */
function PainelModoProprietaria({
  dados,
  carregando,
  erro,
  aoTentarNovamente,
}: {
  dados?: { ativo: boolean; papel: string | null; ultimosEventos: EventoProprietaria[] };
  carregando: boolean;
  erro: unknown;
  aoTentarNovamente: () => void;
}) {
  if (carregando) {
    return <p className="mb-4 text-sm text-navy/60">Carregando Modo Proprietária…</p>;
  }
  if (erro || !dados) {
    return (
      <div
        role="alert"
        className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta"
      >
        Não foi possível confirmar o Modo Proprietária agora. Isto é falha de leitura, não desativação.
        <button
          type="button"
          onClick={aoTentarNovamente}
          className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!dados.ativo) {
    return (
      <div className="mb-4 rounded-xl border border-navy/15 bg-navy/5 p-4 text-sm text-navy/80">
        <p className="font-medium text-navy">Modo Proprietária: não ativo nesta conta</p>
        <p className="mt-1 text-xs text-navy/60">
          Seu papel atual é {dados.papel ?? "não identificado"}. O modo é liberado para o papel{" "}
          <strong>admin</strong> da organização.
        </p>
      </div>
    );
  }

  return (
    <section className="mb-4 rounded-xl border border-gold/50 bg-gold/10 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-navy/60">Modo Proprietária</p>
      <p className="mt-1 font-serif text-lg text-navy">Ativo nesta conta</p>
      <p className="mt-1 text-sm text-navy/75">
        Nenhuma das ações abaixo é bloqueada por gate interno de domínio — quando existe pendência, ela
        vira decisão registrada com motivo, nunca um botão desabilitado.
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-navy/70">
          As {CAPACIDADES_PROPRIETARIA.length} capacidades liberadas
        </summary>
        <ul className="mt-2 grid gap-1 text-xs text-navy/70 sm:grid-cols-2">
          {CAPACIDADES_PROPRIETARIA.map((c) => (
            <li key={c}>• {ROTULO_CAPACIDADE[c]}</li>
          ))}
        </ul>
      </details>

      <details className="mt-3 border-t border-gold/30 pt-3">
        <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-navy/60">
          Últimas decisões registradas ({dados.ultimosEventos.length})
        </summary>
        {dados.ultimosEventos.length === 0 ? (
          <p className="mt-1 text-xs text-navy/55">
            Nenhuma pendência precisou ser superada por decisão sua ainda — não é ausência de registro.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-xs text-navy/70">
            {dados.ultimosEventos.slice(0, 8).map((e) => (
              <li key={e.id} className="rounded-md bg-cream/60 px-2 py-1.5">
                <span className="font-medium text-navy">{rotuloAcaoEvento(e.acao)}</span>
                {e.entidade ? ` · ${e.entidade}` : ""}
                {" · "}
                {new Date(e.criadoEm).toLocaleString("pt-BR")}
                {e.motivo ? <span className="block text-navy/55">{e.motivo}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </details>
    </section>
  );
}
