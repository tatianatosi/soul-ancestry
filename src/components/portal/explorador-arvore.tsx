import { useState } from "react";
import { ChevronDown, Network, Rows3, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PessoaNaArvore } from "@/lib/arvore-publicacao";
import type { GeracaoArvore } from "@/lib/portal-arvore-geracoes";
import type { VinculoArvoreCliente } from "@/lib/portal-dados-vivos.functions";

/** Ascendentes diretos da titular (G1), subindo só por vínculos pai/mãe aprovados. */
function ascendentesDiretos(pessoas: PessoaNaArvore[], vinculos: readonly VinculoArvoreCliente[]): Set<string> {
  const titular = pessoas.find((p) => p.geracao === 1);
  const out = new Set<string>();
  if (!titular) return out;
  const fila = [titular.chave];
  while (fila.length) {
    const atual = fila.shift()!;
    for (const v of vinculos) {
      if (v.tipo === "pai_mae" && v.para === atual && !out.has(v.de)) {
        out.add(v.de);
        fila.push(v.de);
      }
    }
  }
  return out;
}

export function PerfilPessoaArvore({ pessoa, destaque = false, titular = false }: { pessoa: PessoaNaArvore; destaque?: boolean; titular?: boolean }) {
  return (
    <details className={`app-arvore-perfil${destaque || titular ? " app-arvore-perfil--destaque" : ""}`} data-arvore-pessoa data-arvore-titular={titular || undefined}>
      <summary>
        <span className="app-arvore-inicial" aria-hidden="true">{pessoa.nome.charAt(0)}</span>
        <span className="min-w-0"><span className="block font-medium">{pessoa.nome}</span>{titular ? <span className="text-xs text-navy/60">G1 · Você</span> : pessoa.geracao ? <span className="text-xs text-navy/60">G{pessoa.geracao} · {pessoa.geracao}ª geração</span> : null}</span>
        <ChevronDown className="app-detalhe-seta h-4 w-4 shrink-0" aria-hidden="true" />
      </summary>
      <div className="app-arvore-ficha">
        <h3 className="font-serif text-xl text-navy">Na história da família</h3>
        <p className="mt-2 text-sm text-navy/75">{pessoa.vinculo ?? "Em pesquisa"}</p>
        <p className="mt-3 text-sm leading-relaxed text-navy/70">Eventos, lugares e documentos desta pessoa aparecerão quando forem compartilhados com sua família.</p>
        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-navy/70">Para sugerir uma correção, fale com a equipe pelos canais já combinados.</p>
      </div>
    </details>
  );
}

/** Exploração visual dos mesmos nós publicados; sem inventar arestas relacionais. */
/** Ligações publicadas: cada linha dourada une duas pessoas já compartilhadas. */
export function LigacoesArvore({ pessoas, vinculos }: { pessoas: PessoaNaArvore[]; vinculos: readonly VinculoArvoreCliente[] }) {
  const nome = new Map(pessoas.map((p) => [p.chave, p.nome]));
  const linhas = vinculos.filter((v) => nome.has(v.de) && nome.has(v.para));
  if (linhas.length === 0) return null;
  const ger = new Map(pessoas.map((p) => [p.chave, p.geracao ?? 0]));
  const porGeracao = (a: VinculoArvoreCliente, b: VinculoArvoreCliente) => (ger.get(b.de) ?? 0) - (ger.get(a.de) ?? 0);
  const casais = linhas.filter((v) => v.tipo === "conjuge").sort(porGeracao);
  const filiacoes = linhas.filter((v) => v.tipo === "pai_mae").sort(porGeracao);
  const Linha = ({ a, b, rotulo }: { a: string; b: string; rotulo: string }) => (
    <li className="app-ligacao">
      <span className="app-ligacao-no">{a}</span>
      <span className="app-ligacao-traco" aria-hidden="true" />
      <span className="app-ligacao-rotulo">{rotulo}</span>
      <span className="app-ligacao-traco" aria-hidden="true" />
      <span className="app-ligacao-no">{b}</span>
    </li>
  );
  return (
    <section className="app-ligacoes-moldura" aria-label="Ligações da família" data-arvore-ligacoes>
      <h3 className="font-serif text-xl text-navy">Ligações da família</h3>
      <p className="mt-1 text-sm text-navy/70">Uniões e gerações compartilhadas com você pela equipe.</p>
      <ul className="mt-4 space-y-3">
        {casais.map((v) => <Linha key={`${v.de}-${v.para}`} a={nome.get(v.de)!} b={nome.get(v.para)!} rotulo="casal" />)}
        {filiacoes.map((v) => <Linha key={`${v.de}-${v.para}`} a={nome.get(v.de)!} b={nome.get(v.para)!} rotulo="pai ou mãe de" />)}
      </ul>
    </section>
  );
}

export function ExploradorArvore({ pessoas, geracoes, vinculos = [] }: { pessoas: PessoaNaArvore[]; geracoes: readonly GeracaoArvore[]; vinculos?: readonly VinculoArvoreCliente[] }) {
  const [modo, setModo] = useState<"geracoes" | "pessoas">("geracoes");
  const [foco, setFoco] = useState<string | null>(null);
  const pessoasVisiveis = foco ? pessoas.filter((pessoa) => pessoa.chave === foco) : pessoas;
  const ascendentes = ascendentesDiretos(pessoas, vinculos);
  const temTitular = pessoas.some((p) => p.geracao === 1);
  const perfil = (pessoa: PessoaNaArvore) => <PerfilPessoaArvore key={pessoa.chave} pessoa={pessoa} titular={pessoa.geracao === 1} destaque={ascendentes.has(pessoa.chave)} />;
  return (
    <div className="app-explorador-arvore" data-explorador-arvore>
      <div className="app-arvore-ferramentas">
        <div className="app-arvore-modos" role="group" aria-label="Visão da árvore">
          <Button variant="ghost" aria-pressed={modo === "geracoes"} onClick={() => setModo("geracoes")}><Rows3 aria-hidden="true" />Gerações</Button>
          <Button variant="ghost" aria-pressed={modo === "pessoas"} onClick={() => setModo("pessoas")}><Network aria-hidden="true" />Pessoas</Button>
        </div>
        <label className="app-arvore-foco text-xs text-navy/70">Focar pessoa<select value={foco ?? ""} onChange={(event) => setFoco(event.target.value || null)} aria-label="Focar pessoa"><option value="">Todas as pessoas</option>{pessoas.map((pessoa) => <option key={pessoa.chave} value={pessoa.chave}>{pessoa.nome}</option>)}</select></label>
      </div>
      <details className="app-arvore-aviso"><summary>Sobre as conexões da família<ChevronDown className="app-detalhe-seta h-4 w-4" aria-hidden="true" /></summary><p className="text-sm leading-relaxed text-navy/70">As pessoas estão em suas gerações publicadas. {vinculos.length > 0 ? "As linhas douradas mostram as ligações já compartilhadas. Outras aparecerão conforme forem confirmadas." : "As conexões do genograma aparecerão quando as relações forem compartilhadas; por enquanto, os nós permanecem independentes."}</p></details>
      {modo === "pessoas" ? (
        <div className="app-arvore-pessoas" aria-label="Pessoas publicadas">{pessoasVisiveis.map(perfil)}</div>
      ) : (
        <div className="app-arvore-geracoes">{geracoes.filter((geracao) => !foco || pessoasVisiveis.some((pessoa) => `G${pessoa.geracao}` === geracao.id)).map((geracao) => (
          <section key={geracao.id} className="app-arvore-geracao" aria-label={geracao.id === "G1" ? "G1 · Você (âncora)" : `${geracao.id} · ${Number(geracao.id.slice(1))}ª geração`}>
            <h3 className="text-xs font-medium text-navy/70"><span className="app-geracao-nivel">{geracao.id}</span><span>{geracao.id === "G1" ? "Você (âncora)" : `${Number(geracao.id.slice(1))}ª geração`}</span></h3>
            <div className="app-arvore-nos">{geracao.id === "G1" && !temTitular ? <p className="app-arvore-ancora"><UserRound aria-hidden="true" className="h-5 w-5" />Você</p> : null}{pessoasVisiveis.filter((pessoa) => `G${pessoa.geracao}` === geracao.id).map(perfil)}{geracao.id !== "G1" && !pessoasVisiveis.some((pessoa) => `G${pessoa.geracao}` === geracao.id) ? <p className="app-estado-editorial" data-arvore-lacuna>Em pesquisa · geração ainda sem pessoas compartilhadas</p> : null}</div>
          </section>
        ))}</div>
      )}
      <LigacoesArvore pessoas={pessoas} vinculos={vinculos} />
    </div>
  );
}