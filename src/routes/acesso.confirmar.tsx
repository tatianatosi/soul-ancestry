import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand";
import { confirmarAcessoPortal } from "@/lib/portal.functions";

export const Route = createFileRoute("/acesso/confirmar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Confirmando acesso — Clube Ancestral" },
      { name: "description", content: "Validação do link de acesso do cliente ao portal do Clube Ancestral." },
      { property: "og:title", content: "Confirmando acesso — Clube Ancestral" },
      { property: "og:description", content: "Validando seu link de acesso seguro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmarPage,
});

/** Motivos em linguagem da família — nunca o código cru do sistema. */
export const MOTIVOS: Record<string, string> = {
  expirado: "Este link já passou da validade. Peça um novo na tela de acesso.",
  esgotado: "Este link já foi usado. Peça um novo na tela de acesso.",
  indisponivel: "Seu acesso não está liberado no momento. Fale com a equipe.",
  sem_autorizacao: "Este e-mail ainda não está liberado pela equipe.",
  sem_caso: "Seu acesso está ativo, mas nenhum caso foi liberado ainda. A equipe precisa liberar o seu caso.",
  pendente: "Seu acesso ainda está em preparação pela equipe.",
  sem_sessao: "Não conseguimos validar o link neste navegador. Peça um novo link e abra-o no mesmo aparelho.",
  falha: "Tivemos um problema ao validar seu acesso. Tente novamente em instantes.",
  tempo_esgotado:
    "A validação demorou mais que o esperado. Sua sessão pode estar ativa — use Verificar novamente.",
};

/** Teto global da validação: passando disto, a tela sempre mostra um estado final. */
export const TIMEOUT_CONFIRMACAO_MS = 12_000;
/** Teto de cada leitura de sessão, para nenhuma chamada ficar pendente para sempre. */
const TIMEOUT_LEITURA_MS = 4_000;

/** Envolve uma promessa com prazo. Nunca deixa a tela presa no carregamento. */
async function comPrazo<T>(p: Promise<T>, ms: number, aoEstourar: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(aoEstourar), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Troca o material do link por sessão e só então confirma a autorização.
 *
 * 16/09/2026 — antes esta tela apenas esperava 1,2 s por uma sessão pronta.
 * Quando o provedor entrega o link no formato com código/token na URL, ninguém
 * fazia a troca, a sessão nunca aparecia e a pessoa voltava para /acesso sem
 * explicação. Agora: troca explícita, espera com releituras e motivo visível.
 */
async function temSessaoAgora(): Promise<boolean> {
  const r = await comPrazo(supabase.auth.getSession(), TIMEOUT_LEITURA_MS, {
    data: { session: null },
  } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
  return Boolean(r.data.session);
}

async function obterSessao(ate: number): Promise<boolean> {
  const url = new URL(window.location.href);
  const tokenHash = url.searchParams.get("token_hash");
  const code = url.searchParams.get("code");

  if (await temSessaoAgora()) return true;

  if (tokenHash) {
    const tipo = (url.searchParams.get("type") ?? "magiclink") as
      | "magiclink"
      | "email"
      | "recovery"
      | "invite";
    const r = await comPrazo(
      supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash }),
      TIMEOUT_LEITURA_MS,
      { error: new Error("tempo_esgotado") } as Awaited<ReturnType<typeof supabase.auth.verifyOtp>>,
    );
    if (!r.error) return true;
  } else if (code) {
    const r = await comPrazo(
      supabase.auth.exchangeCodeForSession(code),
      TIMEOUT_LEITURA_MS,
      { error: new Error("tempo_esgotado") } as Awaited<
        ReturnType<typeof supabase.auth.exchangeCodeForSession>
      >,
    );
    if (!r.error) return true;
  }

  // Link no formato de fragmento: o cliente processa sozinho, mas leva alguns
  // instantes. Releituras curtas, sempre dentro do teto global.
  while (Date.now() < ate) {
    await new Promise((r) => setTimeout(r, 300));
    if (await temSessaoAgora()) return true;
  }
  return false;
}

function ConfirmarPage() {
  const navigate = useNavigate();
  const confirmar = useServerFn(confirmarAcessoPortal);
  const [estado, setEstado] = useState<"validando" | "negado">("validando");
  const [motivo, setMotivo] = useState<string>(MOTIVOS["falha"]!);
  const rodou = useRef(false);

  useEffect(() => {
    if (rodou.current) return;
    rodou.current = true;
    let cancelado = false;

    (async () => {
      const temSessao = await obterSessao();
      if (cancelado) return;
      if (!temSessao) {
        setMotivo(MOTIVOS["sem_sessao"]!);
        setEstado("negado");
        return;
      }
      try {
        const r = await confirmar({});
        if (cancelado) return;
        if (r.autorizado && r.destino) {
          navigate({ to: r.destino, replace: true });
          return;
        }
        setMotivo(MOTIVOS[String(r.motivo ?? "falha")] ?? MOTIVOS["falha"]!);
        setEstado("negado");
      } catch {
        if (cancelado) return;
        setMotivo(MOTIVOS["falha"]!);
        setEstado("negado");
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [confirmar, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md rounded-2xl bg-cream p-8 text-center shadow-xl">
        <BrandLogo size={44} variant="client-light" showText={false} className="mb-4 justify-center" />

        {estado === "validando" ? (
          <>
            <h1 className="font-serif text-2xl text-navy">Validando seu acesso…</h1>
            <p className="mt-2 text-sm text-navy/70">Confirmando autorização e casos liberados.</p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-navy">Não foi possível liberar o acesso</h1>
            <p className="mt-2 text-sm text-navy/70">{motivo}</p>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/acesso", replace: true });
              }}
              className="mt-5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream"
            >
              Solicitar novo link
            </button>
          </>
        )}
      </div>
    </main>
  );
}
