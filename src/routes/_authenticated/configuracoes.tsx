import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoVazio, PAPEL_LABEL, SaasShell } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoDados } from "@/components/saas/estado-dados";
import { definirPapel, listarUsuarios, type Papel } from "@/lib/saas.functions";

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

  const q = useQuery({
    queryKey: ["saas", "usuarios"],
    queryFn: () => listar(),
    enabled: liberado,
  });

  const m = useMutation({
    mutationFn: (v: { userId: string; papel: Papel; conceder: boolean }) => definir({ data: v }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["saas", "usuarios"] }),
  });

  return (
    <SaasShell titulo="Usuários e papéis" descricao="Somente administradores da organização.">
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
