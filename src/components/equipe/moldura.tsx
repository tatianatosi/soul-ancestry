import type { ReactNode } from "react";

/** Moldura visual dedicada à equipe interna — nunca compartilhada com o portal do cliente. */
export function EquipeMoldura({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-cream p-8 shadow-xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-navy/50">Clube Ancestral · Interno</p>
        <h1 className="mt-2 font-serif text-3xl text-navy">{titulo}</h1>
        {subtitulo ? <p className="mt-2 text-sm text-navy/60">{subtitulo}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
