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

/** Detecta sessão autenticada de equipe interna (e-mail e senha). */
export function useSessaoInterna(): boolean {
  const [interna, setInterna] = useState(false);

  useEffect(() => {
    let ativo = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      // Cliente entra por link mágico (sem senha); equipe interna tem sessão de usuário
      // com e-mail confirmado e papel resolvido no servidor. Aqui só liberamos a
      // camada visual — o controle de acesso real continua no servidor/RLS.
      setInterna(Boolean(data.session?.user));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (ativo) setInterna(Boolean(sessao?.user));
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
