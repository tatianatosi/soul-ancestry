import { createFileRoute, Link } from "@tanstack/react-router";

import { EquipeMoldura } from "@/components/equipe/moldura";

/**
 * Página TEMPORÁRIA de diagnóstico de rotas (validação humana em andamento).
 * Mostra apenas a topologia de rotas do código — nenhum dado de cliente, caso,
 * organização, e-mail ou token é lido ou exibido aqui.
 */
export const Route = createFileRoute("/equipe/diagnostico-rotas")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de rotas — Equipe Clube Ancestral" },
      { name: "description", content: "Mapa interno temporário das rotas, guards e redirecionamentos da aplicação." },
      { property: "og:title", content: "Diagnóstico de rotas — Equipe Clube Ancestral" },
      { property: "og:description", content: "Mapa interno de rotas e proteções." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DiagnosticoRotas,
});

type Linha = { rota: string; origem: string; escopo: string; guard: string; semSessao: string };

const ROTAS: Linha[] = [
  { rota: "/", origem: "src/routes/index.tsx", escopo: "Público", guard: "nenhum", semSessao: "renderiza (sem redirect)" },
  { rota: "/devolutiva", origem: "src/routes/devolutiva.tsx", escopo: "Público (legado/demo)", guard: "nenhum", semSessao: "renderiza" },
  { rota: "/canvas/$token", origem: "src/routes/canvas.$token.tsx", escopo: "Público por token", guard: "token + canvas_publicado no servidor", semSessao: "renderiza se publicado" },
  { rota: "/acesso", origem: "src/routes/acesso.tsx", escopo: "Cliente", guard: "nenhum", semSessao: "renderiza formulário de link mágico" },
  { rota: "/acesso/confirmar", origem: "src/routes/acesso.confirmar.tsx", escopo: "Cliente", guard: "sessão do link mágico", semSessao: "mensagem de link inválido" },
  { rota: "/acesso/sem-permissao", origem: "src/routes/acesso.sem-permissao.tsx", escopo: "Cliente", guard: "nenhum", semSessao: "renderiza" },
  { rota: "/portal, /portal/casos/$id, /portal/documentos, /portal/proposta", origem: "src/routes/portal/*", escopo: "Cliente autenticado", guard: "layout /portal (ssr:false, getUser) + RLS", semSessao: "→ /acesso" },
  { rota: "/equipe/entrar", origem: "src/routes/equipe.entrar.tsx", escopo: "Equipe", guard: "nenhum (login)", semSessao: "renderiza login por senha" },
  { rota: "/equipe/esqueci-minha-senha", origem: "src/routes/equipe.esqueci-minha-senha.tsx", escopo: "Equipe", guard: "nenhum", semSessao: "renderiza (resposta genérica)" },
  { rota: "/equipe/redefinir-senha", origem: "src/routes/equipe.redefinir-senha.tsx", escopo: "Equipe", guard: "sessão de recuperação do link", semSessao: "pede novo link" },
  { rota: "/equipe/sem-permissao", origem: "src/routes/equipe.sem-permissao.tsx", escopo: "Equipe", guard: "nenhum", semSessao: "renderiza" },
  { rota: "/equipe/diagnostico-rotas", origem: "este arquivo (temporário)", escopo: "Equipe", guard: "nenhum — só topologia, sem dados", semSessao: "renderiza" },
  { rota: "/painel, /casos, /clientes, /leads, /tarefas, /evidencias, /financeiro, /relatorios, /contratos, /contratos/$id, /acessos-portal, /equipe, /qualidade, /configuracoes, /mockup, /studio-devolutivas", origem: "src/routes/_authenticated/*", escopo: "Backoffice", guard: "layout _authenticated (ssr:false, getUser) + SaasShell (staff ativo + papel)", semSessao: "→ /equipe/entrar" },
  { rota: "/auth", origem: "src/routes/auth.tsx", escopo: "Legado", guard: "redirect permanente", semSessao: "→ /equipe/entrar" },
];

const DESTINOS = [
  ["Sem sessão em rota pública", "nenhum redirecionamento"],
  ["Sem sessão em /portal/*", "/acesso"],
  ["Cliente autenticado sem autorização ativa", "/acesso/sem-permissao"],
  ["Sem sessão em rota de backoffice", "/equipe/entrar"],
  ["Sessão autenticada sem staff_access ativo", "/equipe/sem-permissao"],
  ["Staff ativo", "navegação conforme papel no SaasShell"],
];

function DiagnosticoRotas() {
  return (
    <EquipeMoldura titulo="Diagnóstico de rotas" subtitulo="Página temporária de validação. Nenhum dado operacional é exibido.">
      <div className="space-y-6 text-sm text-navy">
        <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-navy/5 text-navy/70">
              <tr>
                <th className="px-3 py-2">Rota</th>
                <th className="px-3 py-2">Origem</th>
                <th className="px-3 py-2">Escopo</th>
                <th className="px-3 py-2">Guard</th>
                <th className="px-3 py-2">Sem sessão</th>
              </tr>
            </thead>
            <tbody>
              {ROTAS.map((l) => (
                <tr key={l.rota} className="border-t border-navy/10 align-top">
                  <td className="px-3 py-2 font-medium">{l.rota}</td>
                  <td className="px-3 py-2 text-navy/60">{l.origem}</td>
                  <td className="px-3 py-2">{l.escopo}</td>
                  <td className="px-3 py-2 text-navy/70">{l.guard}</td>
                  <td className="px-3 py-2 text-navy/70">{l.semSessao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <h2 className="font-serif text-lg">Redirecionamento efetivo</h2>
          <ul className="mt-2 space-y-1 text-xs text-navy/70">
            {DESTINOS.map(([origem, destino]) => (
              <li key={origem}>
                <span className="font-medium text-navy">{origem}:</span> {destino}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-navy/55">
          Middleware: <code>src/start.ts</code> anexa o token de sessão às server functions;{" "}
          <code>requireSupabaseAuth</code> valida no servidor; RLS por organização decide o acesso final no banco.
        </p>

        <Link to="/equipe/entrar" className="inline-block text-xs text-navy/70 underline underline-offset-4">
          Voltar ao login da equipe
        </Link>
      </div>
    </EquipeMoldura>
  );
}
