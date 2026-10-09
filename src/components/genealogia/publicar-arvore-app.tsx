/**
 * Corte 2a (28/09/2026) — "Publicar pessoa na árvore" (Desk). A equipe
 * escreve como o nome e o vínculo aparecem para o cliente e em qual geração;
 * o servidor recusa perfil não aprovado ou altamente restrito e reduz menor
 * ao primeiro nome. Despublicar exige motivo. Confirmações inline.
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { EstadoDados } from "@/components/saas/estado-dados";
import {
  despublicarPessoaDaArvore,
  listarArvoreDoCaso,
  publicarPessoaNaArvore,
} from "@/lib/arvore-publicacao.functions";
import { RESUMO_GATE_ARVORE, prontidaoParaArvore } from "@/lib/visibilidade-arvore";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

const ROTULO_GERACAO: Record<number, string> = {
  // Mesmos rótulos que o cliente vê na aba Árvore (mockup p.6).
  1: "1 · Você (cliente)",
  2: "2 · Avós",
  3: "3 · Bisavós",
  4: "4 · Bisavós de bisavós",
  5: "5 · Ancestrais",
};

type Linha = {
  perfilId: string;
  nome: string;
  clientVisibility: string;
  sensitivityLevel?: string | null;
  temPessoaPesquisa?: boolean;
  publicacao: { id: string; conteudo: string; geracao: number | null; publicadoEm: string | null } | null;
};

function LinhaPessoa({ caseId, p, onMudou }: { caseId: string; p: Linha; onMudou: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState(p.publicacao?.conteudo.split(" · ")[0] ?? p.nome);
  const [vinculo, setVinculo] = useState(p.publicacao?.conteudo.split(" · ").slice(1).join(" · ") ?? "");
  const [geracao, setGeracao] = useState<number>(p.publicacao?.geracao ?? 0);
  const [retirando, setRetirando] = useState(false);
  const [motivo, setMotivo] = useState("");
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    nome !== (p.publicacao?.conteudo.split(" · ")[0] ?? p.nome) ||
      vinculo !== (p.publicacao?.conteudo.split(" · ").slice(1).join(" · ") ?? "") ||
      geracao !== (p.publicacao?.geracao ?? 0) ||
      (retirando && motivo.trim() !== ""),
  );
  const publicar = useServerFn(publicarPessoaNaArvore);
  const despublicar = useServerFn(despublicarPessoaDaArvore);
  /*
   * 04/10/2026 — antes a tela só dizia "Visibilidade ao cliente não aprovada
   * — não pode ser publicada", sem dizer onde mudar, e o Perfil 360° não tinha
   * o seletor. Era um beco sem saída real, relatado pela Proprietária. Agora o
   * bloqueio vem nomeado, com o caminho, de uma fonte única.
   */
  const prontidao = prontidaoParaArvore({
    clientVisibility: p.clientVisibility,
    sensitivityLevel: p.sensitivityLevel,
    temPessoaPesquisa: p.temPessoaPesquisa,
  });
  const aprovado = prontidao.pode;

  const mPublicar = useMutation({
    mutationFn: () => publicar({ data: { caseId, perfilId: p.perfilId, nome, vinculo, geracao } }),
    onSuccess: (r: { nomePublicado: string; menor: boolean }) => {
      toast.success(r.menor ? `Publicado só o primeiro nome (menor): ${r.nomePublicado}.` : `${r.nomePublicado} está na árvore do App.`);
      setAberto(false);
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mDespublicar = useMutation({
    mutationFn: () => despublicar({ data: { caseId, projecaoId: p.publicacao!.id, motivo } }),
    onSuccess: () => {
      toast.success("Pessoa retirada da árvore do App.");
      setRetirando(false);
      setMotivo("");
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <li className="rounded-lg border border-navy/10 bg-white/60 p-2.5 text-xs text-navy/80" data-arvore-app-pessoa>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-navy">{p.nome}</p>
          <p>
            {p.publicacao
              ? `No App: “${p.publicacao.conteudo}” · geração ${p.publicacao.geracao ?? "—"}${p.publicacao.publicadoEm ? ` · desde ${new Date(p.publicacao.publicadoEm).toLocaleDateString("pt-BR")}` : ""}`
              : aprovado
                ? "Ainda não está na árvore do App."
                : "Ainda não pode ir ao App — motivo abaixo."}
          </p>
        </div>
        <div className="flex gap-2">
          {aprovado ? (
            <button type="button" onClick={() => setAberto((v) => !v)} className="rounded border border-navy/20 px-2 py-1 hover:bg-cream/60">
              {p.publicacao ? "Editar no App" : "Publicar na árvore"}
            </button>
          ) : null}
          {p.publicacao ? (
            <button type="button" onClick={() => setRetirando((v) => !v)} className="rounded border border-terracotta/40 px-2 py-1 text-terracotta">
              Retirar do App
            </button>
          ) : null}
        </div>
      </div>

      {!aprovado ? (
        <ul className="mt-2 space-y-1 text-[11px] text-terracotta" data-arvore-bloqueios>
          {prontidao.bloqueios.map((b) => (
            <li key={b.chave}>
              {b.texto} <span className="text-navy/60">Resolver em: {b.ondeResolver}.</span>
            </li>
          ))}
        </ul>
      ) : null}
      {prontidao.observacoes.length ? (
        <p className="mt-1 text-[11px] text-navy/55">{prontidao.observacoes.join(" ")}</p>
      ) : null}

      {aberto ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="text-[11px] text-navy/60">Nome como o cliente vê</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 w-full rounded border border-navy/20 bg-cream/40 px-2 py-1" />
          </label>
          <label className="block">
            <span className="text-[11px] text-navy/60">Vínculo (ex.: bisavó materna)</span>
            <input value={vinculo} onChange={(e) => setVinculo(e.target.value)} className="mt-1 w-full rounded border border-navy/20 bg-cream/40 px-2 py-1" />
          </label>
          <label className="block">
            <span className="text-[11px] text-navy/60">Geração</span>
            <select value={geracao} onChange={(e) => setGeracao(Number(e.target.value))} className="mt-1 w-full rounded border border-navy/20 bg-cream/40 px-2 py-1">
              <option value={0}>Escolha…</option>
              {[1, 2, 3, 4, 5].map((g) => (
                <option key={g} value={g}>
                  {ROTULO_GERACAO[g]}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="button"
              disabled={mPublicar.isPending || !geracao || nome.trim().length < 2}
              onClick={() => mPublicar.mutate()}
              className="rounded bg-navy px-3 py-1 text-cream disabled:opacity-40"
            >
              {mPublicar.isPending ? "Publicando…" : "Confirmar publicação"}
            </button>
            <span className="text-[11px] text-navy/55">Menor de idade aparece só pelo primeiro nome.</span>
          </div>
        </div>
      ) : null}

      {retirando && p.publicacao ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (obrigatório)"
            className="min-w-[14rem] flex-1 rounded border border-navy/20 bg-cream/40 px-2 py-1"
          />
          <button
            type="button"
            disabled={mDespublicar.isPending || motivo.trim().length < 5}
            onClick={() => mDespublicar.mutate()}
            className="rounded bg-terracotta px-3 py-1 text-cream disabled:opacity-40"
          >
            Confirmar retirada
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function PublicarArvoreApp({ caseId }: { caseId: string }) {
  const listar = useServerFn(listarArvoreDoCaso);
  const q = useQuery({ queryKey: ["arvore-app", caseId], queryFn: () => listar({ data: { caseId } }), retry: false });
  return (
    <section className="space-y-2 rounded-xl border border-gold/40 bg-gold/5 p-3" data-publicar-arvore-app>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Publicar pessoa na árvore do App</h3>
        <span className="text-[11px] text-navy/55">Nomes e vínculos que o cliente vê na aba Árvore</span>
      </div>
      <p className="text-[11px] text-navy/60">{RESUMO_GATE_ARVORE}</p>
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data}
        aoTentarNovamente={() => void q.refetch()}
        recurso="as pessoas da ficha genealógica"
        vazio="Nenhuma pessoa na ficha genealógica deste caso ainda."
      >
        {(lista) => (
          <ul className="space-y-1.5">
            {lista.map((p) => (
              <LinhaPessoa key={p.perfilId} caseId={caseId} p={p} onMudou={() => void q.refetch()} />
            ))}
          </ul>
        )}
      </EstadoDados>
    </section>
  );
}
