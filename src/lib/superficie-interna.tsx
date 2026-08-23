import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Superfície interna: controla a exibição de elementos rotulados como "(interno)"
 * (alternância App Cliente/Desk, seletores de caso-modelo, atalhos de módulos internos).
 *
 * Regra do produto: o App Cliente é projeção autorizada do Desk. Nenhum rótulo interno
 * pode aparecer para visitante anônimo ou para cliente autenticado por link mágico.
 * O padrão é SEMPRE falso; só é verdadeiro quando existe sessão de equipe interna.
 */
const SuperficieInternaContext = createContext(false);

export function useSuperficieInterna(): boolean {
  return useContext(SuperficieInternaContext);
}

/** Detecta sessão autenticada de equipe interna (papel em user_roles). */
export function useSessaoInterna(): boolean {
  const [interna, setInterna] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function avaliar() {
      const { data } = await supabase.auth.getSession();
      const usuario = data.session?.user;
      if (!usuario) {
        if (ativo) setInterna(false);
        return;
      }
      // Cliente entra por link mágico e não é membro de organização: a leitura de
      // user_roles volta vazia (RLS). Equipe interna volta com papel.
      const { data: papeis, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", usuario.id);
      if (!ativo) return;
      setInterna(
        decidirSuperficieInterna({
          autenticado: true,
          papeis: (papeis ?? []).map((p) => p.role as string),
          erroLeitura: Boolean(error),
        }),
      );
    }

    void avaliar();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void avaliar();
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return interna;
}


export function SuperficieInternaProvider({ valor, children }: { valor: boolean; children: ReactNode }) {
  return <SuperficieInternaContext.Provider value={valor}>{children}</SuperficieInternaContext.Provider>;
}
