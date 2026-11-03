import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Portão do portal do cliente. Autenticar não é autorizar:
 * a autorização real é validada por RLS no banco a cada leitura.
 *
 * 16/09/2026 — uma única leitura de sessão tratava falha momentânea de rede
 * (ou renovação de token em andamento) como "sem sessão" e devolvia a família
 * para /acesso sem explicação. Só expulsa depois da segunda leitura, igual à
 * porta do Desk.
 */
export const Route = createFileRoute("/portal")({
  staticData: { sitemap: "exclude-subtree" },
  ssr: false,
  /**
   * Caso ativo na URL, não em estado local.
   *
   * 21/09/2026 — o App não tinha nenhuma noção de caso ativo: as telas usavam
   * `casos[0]` e a leitura somava todos os casos autorizados. A URL é o lugar
   * certo para essa escolha: sobrevive ao F5, é compartilhável e não precisa
   * de storage. Mesmo padrão já usado na visão Master do Desk
   * (`app-cliente-como-pessoa.tsx`). Como esta é a rota de layout das 7 abas,
   * o parâmetro vale para todas elas.
   */
  validateSearch: (search: Record<string, unknown>): { casoId?: string } =>
    typeof search["casoId"] === "string" && search["casoId"] ? { casoId: search["casoId"] } : {},
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    let usuario = !error && data.user ? data.user : null;
    if (!usuario) {
      const { data: sessao } = await supabase.auth.getSession();
      usuario = sessao.session?.user ?? null;
    }
    if (!usuario) throw redirect({ to: "/acesso" });
    return { user: usuario };
  },
  component: () => <Outlet />,
});
