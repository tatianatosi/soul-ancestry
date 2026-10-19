/**
 * Funil em degraus centralizados da Prancha V4 ("Funil de leads · Visão
 * Geral" no Hoje e "Conversão por etapa" no Comercial). Cada etapa é uma
 * faixa centrada, mais estreita que a anterior, com o rótulo à esquerda e a
 * contagem real à direita; a última etapa vem em dourado.
 *
 * A largura é só o degrau (posição da etapa), não proporção: o número ao lado
 * é a única leitura quantitativa, e etapa em zero continua desenhada com "0"
 * — o gráfico nunca some. Sem nenhuma contagem, o rodapé diz isso.
 *
 * Usado só por /painel e /leads; o kit compartilhado (kit.tsx) não muda.
 */
import { cn } from "@/lib/utils";

export function FunilDegraus({
  etapas,
  tituloAcessivel,
  rodape,
}: {
  etapas: { rotulo: string; total: number }[];
  tituloAcessivel: string;
  rodape?: string;
}) {
  const n = etapas.length;
  const semNenhum = etapas.every((e) => e.total === 0);
  return (
    <figure role="img" aria-label={tituloAcessivel} className="min-w-0">
      <ol className="flex flex-col items-center gap-2">
        {etapas.map((etapa, i) => {
          const largura = n > 1 ? 100 - (i * 60) / (n - 1) : 100;
          const ultima = i === n - 1 && n > 1;
          return (
            <li
              key={etapa.rotulo}
              className={cn(
                "flex min-w-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[11px]",
                ultima ? "border-gold/50 bg-gold/25" : "border-navy/10 bg-navy/[0.06]",
              )}
              style={{ width: `${largura}%`, minWidth: "8.5rem" }}
            >
              <span className="truncate font-medium text-navy">{etapa.rotulo}</span>
              <span className={cn("shrink-0 font-semibold tabular-nums", etapa.total > 0 ? "text-navy" : "text-navy/40")}>
                {etapa.total}
              </span>
            </li>
          );
        })}
      </ol>
      <figcaption className="mt-3 text-center text-[10px] text-navy/50">
        {semNenhum ? "Sem dado registrado ainda" : rodape ?? null}
      </figcaption>
    </figure>
  );
}
