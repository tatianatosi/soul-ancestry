import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { EquipeMoldura } from "@/components/equipe/moldura";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/equipe/sem-permissao")({
  staticData: { sitemap: false },
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sem permissão — Equipe Clube Ancestral" },
      { name: "description", content: "Sua conta está autenticada, mas sem autorização interna ativa." },
      { property: "og:title", content: "Sem permissão — Equipe Clube Ancestral" },
      { property: "og:description", content: "Autenticação concluída sem autorização interna ativa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SemPermissao,
});

function SemPermissao() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/equipe/entrar", replace: true });
  }

  return (
    <EquipeMoldura titulo="Sem permissão" subtitulo="Área exclusiva da equipe Clube Ancestral.">
      <p className="text-sm text-navy/70">
        Sua sessão foi autenticada, mas não há autorização interna ativa para esta conta. Isso acontece quando o
        acesso está pendente, suspenso, revogado ou sem papel atribuído.
      </p>
      <p className="mt-3 text-sm text-navy/70">Fale com um administrador da sua organização.</p>
      <button onClick={sair} className="mt-6 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream">
        Encerrar sessão
      </button>
    </EquipeMoldura>
  );
}
