import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { EstadoVazio, PAPEL_LABEL, SaasShell } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoDados } from "@/components/saas/estado-dados";
import { definirPapel, listarUsuarios, type Papel } from "@/lib/saas.functions";
import { obterModoProprietaria, type EventoProprietaria } from "@/lib/modo-proprietaria.functions";
import { CAPACIDADES_PROPRIETARIA, ROTULO_CAPACIDADE } from "@/lib/modo-proprietaria";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Usuários e papéis — Clube Ancestral" },
      { name: "description", content: "Administração de membros e papéis dentro da organização." },
      { property: "og:title", content: "Usuários e papéis — Clube Ancestral" },
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

  const q = useQuery({
    queryKey: ["saas", "usuarios"],
    queryFn: () => listar(),
    enabled: liberado,
  });

  const m = useMutation({
    mutationFn: (v: { userId: string; papel: Papel; conceder: boolean }) => definir({ data: v }),
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

  return (
    <SaasShell titulo="Usuários e papéis" descricao="Somente administradores da organização.">
      <PainelModoProprietaria
        dados={qModo.data}
        carregando={qModo.isLoading}
        erro={qModo.error}
        aoTentarNovamente={() => void qModo.refetch()}
      />

      {!liberado ? (
        <EstadoVazio mensagem={decisao.motivo} />
      ) : (
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data}
          aoTentarNovamente={() => void q.refetch()}
          recurso="os membros da organização"
          vazio="Nenhum membro nesta organização ainda."
        >
          {(usuarios) => (
        <div className="space-y-3">
          {usuarios.map((u) => (
            <div key={u.userId} className="rounded-xl border border-navy/10 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-navy">{u.nome ?? u.email ?? "Membro"}</p>
                  <p className="text-xs text-navy/50">{u.email ?? u.userId}</p>
                </div>
                {u.arquivado ? <span className="text-xs text-navy/50">Arquivado</span> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {PAPEIS.map((papel) => {
                  const ativo = u.papeis.includes(papel);
                  return (
                    <button
                      key={papel}
                      onClick={() => m.mutate({ userId: u.userId, papel, conceder: !ativo })}
                      className={
                        ativo
                          ? "rounded-full bg-navy px-3 py-1 text-xs text-cream"
                          : "rounded-full border border-navy/20 px-3 py-1 text-xs text-navy/60 hover:bg-navy/5"
                      }
                    >
                      {PAPEL_LABEL[papel]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
          )}
        </EstadoDados>
      )}
    </SaasShell>
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

      <div className="mt-3 border-t border-gold/30 pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-navy/60">
          Últimas decisões registradas ({dados.ultimosEventos.length})
        </p>
        {dados.ultimosEventos.length === 0 ? (
          <p className="mt-1 text-xs text-navy/55">
            Nenhuma pendência precisou ser superada por decisão sua ainda — não é ausência de registro.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-xs text-navy/70">
            {dados.ultimosEventos.slice(0, 8).map((e) => (
              <li key={e.id} className="rounded-md bg-white/60 px-2 py-1.5">
                <span className="font-medium text-navy">{rotuloAcaoEvento(e.acao)}</span>
                {e.entidade ? ` · ${e.entidade}` : ""}
                {" · "}
                {new Date(e.criadoEm).toLocaleString("pt-BR")}
                {e.motivo ? <span className="block text-navy/55">{e.motivo}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
