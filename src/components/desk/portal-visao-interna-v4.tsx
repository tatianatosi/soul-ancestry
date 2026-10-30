import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Cartao, Etiqueta, FilaEtapas, Linha, Pessoa, type Tom } from "@/components/prancha-v4/kit";
import { EstadoVazio } from "@/components/saas/shell";
import { listarNucleos } from "@/lib/nucleos-desk.functions";
import { PAPEIS_PESSOA } from "@/lib/caso-ficha";
import { STATUS_ACESSO_LABEL } from "@/lib/portal-elegibilidade";
import { rotuloTipoProjecao } from "@/lib/projecoes-cliente";

/*
 * 19/10/2026 — Portal do cliente (visão interna) com a composição da Prancha
 * V4: Família no portal, Núcleos com acesso, Núcleos sem acesso, Conteúdo
 * publicado no App e Fila de publicação. Casca permanente: todo cartão
 * aparece sempre; sem registro, aparece no formato da prancha em estado
 * vazio honesto — nunca número ou parentesco inventado.
 *
 * Somente leitura. Fontes já existentes, nenhuma consulta nova ao banco:
 * - acessos/casos/projeções: o mesmo `listarAcessosPortal` da rota;
 * - núcleo e papéis: `listarNucleos` (mesma queryKey ["nucleos-desk"] de
 *   /nucleos e do Caso 360). Parentesco só vem do que está gravado em
 *   `nucleo_membros` (papel, papel_no_caso, vínculo declarado) — ascendente
 *   e cônjuge só aparecem quando o vínculo gravado diz isso.
 * Nenhuma ação de convite, envio, publicação ou alteração de acesso aqui:
 * essas seguem nas ações existentes da rota, com `useAutoridade`.
 */

type CasoBase = { id: string; codigo: string | null; titulo: string | null; cliente_id: string | null; demo?: boolean | null };
type AcessoBase = { id: string; client_id: string | null; access_status: string; is_demo?: boolean | null };
type VinculoBase = { client_portal_access_id: string; case_id: string; access_status?: string | null };
type ClienteBase = { id: string; nome: string };
type ProjecaoBase = { id?: string; case_id: string | null; approval_status: string | null; archived_at: string | null; projection_type?: string | null };

type MembroNucleo = {
  id: string;
  nome: string;
  papel: string | null;
  papel_no_caso: string | null;
  parentesco: string | null;
  dependente: boolean;
  cliente_id: string | null;
};

const RE_CONJUGE = /c[oô]njuge|espos[ao]|marido|companheir/i;
const RE_ASCENDENTE = /\b(pai|m[ãa]e|av[óôo]|bisav[óôo]|trisav[óôo]|ascendente)\b/i;

const ROTULO_PAPEL = new Map(PAPEIS_PESSOA.map((p) => [p.valor, p.rotulo]));

/** Estados do acesso, do mais forte para o mais fraco. */
const PRIORIDADE_ACESSO = ["active", "invited", "pending", "suspended", "expired", "revoked"];

const ETAPAS_FILA: { status: string; rotulo: string; tom: Tom }[] = [
  { status: "draft", rotulo: "Rascunho", tom: "neutro" },
  { status: "in_review", rotulo: "Revisão", tom: "atencao" },
  { status: "approved", rotulo: "Aprovado", tom: "sucesso" },
  { status: "published", rotulo: "Publicado", tom: "sucesso" },
];

const ESTADO_CONTEUDO: Record<string, { texto: string; tom: Tom }> = {
  published: { texto: "Publicado", tom: "sucesso" },
  approved: { texto: "Aprovado", tom: "neutro" },
  in_review: { texto: "Aprovar", tom: "atencao" },
  draft: { texto: "Rascunho", tom: "neutro" },
};

function rotuloTipoInterno(tipo: string | null | undefined): string {
  const bruto = String(tipo ?? "").trim();
  const rotulo = rotuloTipoProjecao(bruto);
  // Visão interna: tipo sem rótulo aprovado aparece cru (a equipe precisa
  // saber o que é); a tela do cliente continua usando só o rótulo aprovado.
  return rotulo === "Atualização da equipe" && bruto ? bruto.replace(/_/g, " ") : rotulo;
}

function Vaga({ rotulo }: { rotulo: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2" data-vaga-familia={rotulo}>
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dashed border-navy/25 text-[11px] text-navy/35"
        aria-hidden="true"
      >
        —
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs text-navy/45">Sem registro</span>
        <span className="block truncate text-[10px] text-navy/40">{rotulo}</span>
      </span>
    </div>
  );
}

function rotuloEstadoAcesso(status: string | null): { texto: string; tom: Tom } | null {
  if (status === "active") return { texto: "Acesso ativo", tom: "sucesso" };
  if (status === "invited" || status === "pending") return { texto: "Convite enviado", tom: "atencao" };
  return null;
}

export function PortalVisaoInternaV4({
  casos,
  acessos,
  casosAcesso,
  clientes,
  projecoes,
  casosComAcessoPortal,
}: {
  casos: CasoBase[];
  acessos: AcessoBase[];
  casosAcesso: VinculoBase[];
  clientes: ClienteBase[];
  projecoes: ProjecaoBase[];
  casosComAcessoPortal: CasoBase[];
}) {
  const carregarNucleos = useServerFn(listarNucleos);
  const qNucleos = useQuery({ queryKey: ["nucleos-desk"], queryFn: () => carregarNucleos(), retry: false });

  const opcoes = [...casosComAcessoPortal, ...casos.filter((c) => !casosComAcessoPortal.some((x) => x.id === c.id))];
  const [casoEscolhido, setCasoEscolhido] = useState<string>("");
  const casoId = casoEscolhido || opcoes[0]?.id || "";
  const caso = casos.find((c) => c.id === casoId) ?? null;
  const nomeDoCliente = new Map(clientes.map((c) => [c.id, c.nome]));

  // Núcleo do caso — só pessoas gravadas em nucleo_membros.
  const nucleo = caso
    ? ((qNucleos.data ?? []) as { case_id: string | null; nome: string; membros: MembroNucleo[] }[]).find(
        (n) => n.case_id === caso.id,
      ) ?? null
    : null;
  const membros: MembroNucleo[] = nucleo?.membros ?? [];

  const centro =
    membros.find((m) => m.papel === "requerente") ??
    (caso?.cliente_id ? membros.find((m) => m.cliente_id === caso.cliente_id) : undefined) ??
    null;
  const papelDoCentro = centro
    ? centro.papel === "requerente"
      ? "Requerente"
      : (ROTULO_PAPEL.get(centro.papel_no_caso ?? "") ?? "Pessoa do caso")
    : null;
  const resto = membros.filter((m) => m.id !== centro?.id);
  const ascendente = resto.find((m) => RE_ASCENDENTE.test(m.parentesco ?? "")) ?? null;
  const conjuge = resto.find((m) => m.id !== ascendente?.id && RE_CONJUGE.test(m.parentesco ?? "")) ?? null;
  const dependentes = resto.filter((m) => m.id !== ascendente?.id && m.id !== conjuge?.id && m.dependente);
  const outros = resto.filter(
    (m) => m.id !== ascendente?.id && m.id !== conjuge?.id && !dependentes.some((d) => d.id === m.id),
  );

  // Estado de acesso por pessoa (cliente_id), só acessos deste caso: vínculo
  // gravado em client_portal_case_access ou acesso do próprio cliente do
  // caso / de um membro do núcleo.
  const clientesDoCaso = new Set<string>(
    [caso?.cliente_id ?? null, ...membros.map((m) => m.cliente_id)].filter((v): v is string => !!v),
  );
  const acessosDoCaso = caso
    ? acessos.filter(
        (a) =>
          (caso.demo || !a.is_demo) &&
          (casosAcesso.some((v) => v.client_portal_access_id === a.id && v.case_id === caso.id) ||
            (a.client_id ? clientesDoCaso.has(a.client_id) : false)),
      )
    : [];
  const estadoPorCliente = new Map<string, string>();
  for (const a of acessosDoCaso) {
    if (!a.client_id) continue;
    const atual = estadoPorCliente.get(a.client_id);
    if (!atual || PRIORIDADE_ACESSO.indexOf(a.access_status) < PRIORIDADE_ACESSO.indexOf(atual)) {
      estadoPorCliente.set(a.client_id, a.access_status);
    }
  }

  type PessoaAcesso = { chave: string; nome: string; estado: string | null };
  const pessoasDoCaso: PessoaAcesso[] = membros.map((m) => ({
    chave: m.id,
    nome: m.nome,
    estado: m.cliente_id ? (estadoPorCliente.get(m.cliente_id) ?? null) : null,
  }));
  for (const clienteId of estadoPorCliente.keys()) {
    if (membros.some((m) => m.cliente_id === clienteId)) continue;
    pessoasDoCaso.push({ chave: clienteId, nome: nomeDoCliente.get(clienteId) ?? "Pessoa sem nome", estado: estadoPorCliente.get(clienteId) ?? null });
  }
  if (caso?.cliente_id && !pessoasDoCaso.some((p) => p.chave === caso.cliente_id) && !membros.some((m) => m.cliente_id === caso.cliente_id)) {
    pessoasDoCaso.push({ chave: caso.cliente_id, nome: nomeDoCliente.get(caso.cliente_id) ?? "Cliente do caso", estado: null });
  }
  const comAcesso = pessoasDoCaso.filter((p) => rotuloEstadoAcesso(p.estado));
  const semAcesso = pessoasDoCaso.filter((p) => !rotuloEstadoAcesso(p.estado));

  // Conteúdo e fila — mesma app_projections já carregada pela rota.
  const projecoesDoCaso = caso ? projecoes.filter((p) => p.case_id === caso.id && !p.archived_at) : [];
  const conteudo = new Map<string, { tipo: string; status: string; n: number }>();
  for (const p of projecoesDoCaso) {
    const status = String(p.approval_status ?? "");
    if (!ESTADO_CONTEUDO[status]) continue;
    const tipo = rotuloTipoInterno(p.projection_type);
    const chave = `${tipo}|${status}`;
    const atual = conteudo.get(chave);
    if (atual) atual.n += 1;
    else conteudo.set(chave, { tipo, status, n: 1 });
  }
  const itensConteudo = [...conteudo.values()].sort(
    (a, b) => ETAPAS_FILA.findIndex((e) => e.status === b.status) - ETAPAS_FILA.findIndex((e) => e.status === a.status),
  );
  const etapasFila = ETAPAS_FILA.map((e) => ({
    rotulo: e.rotulo,
    tom: e.tom,
    contagem: caso ? projecoesDoCaso.filter((p) => p.approval_status === e.status).length : null,
  }));

  const nomeCaso = (c: CasoBase) => [c.codigo, c.titulo].filter(Boolean).join(" — ") || c.id;

  return (
    <div className="space-y-4" data-portal-visao-interna-v4>
      <label className="flex flex-wrap items-center gap-2 text-xs text-navy/70">
        <span className="font-medium text-navy">Núcleo / caso</span>
        <select
          value={casoId}
          onChange={(e) => setCasoEscolhido(e.target.value)}
          className="min-w-0 max-w-full rounded-lg border border-navy/20 bg-card px-3 py-1.5 text-xs"
          aria-label="Núcleo ou caso exibido"
        >
          {opcoes.length === 0 ? <option value="">Nenhum caso cadastrado</option> : null}
          {opcoes.map((c) => (
            <option key={c.id} value={c.id}>
              {nomeCaso(c)}
              {casosComAcessoPortal.some((x) => x.id === c.id) ? " · com acesso ao portal" : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Cartao titulo="Família no portal" className="lg:row-span-2" data-familia-no-portal>
          <div className="grid grid-cols-2 gap-4 sm:gap-x-12" data-arvore-familia>
            {ascendente ? <Pessoa nome={ascendente.nome} papel="Ascendente" /> : <Vaga rotulo="Ascendente" />}
            {conjuge ? <Pessoa nome={conjuge.nome} papel="Cônjuge" /> : <Vaga rotulo="Cônjuge" />}
          </div>
          <div className="mx-auto my-3 flex max-w-xs flex-col items-center">
            <span aria-hidden="true" className="h-4 w-px bg-gold/60" />
            <div className="w-full rounded-lg border border-gold/50 bg-gold/10 px-3 py-2">
              {centro ? <Pessoa nome={centro.nome} papel={papelDoCentro ?? "Pessoa do caso"} destaque /> : <Vaga rotulo="Requerente" />}
            </div>
            <span aria-hidden="true" className="h-4 w-px bg-gold/60" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-x-12">
            {dependentes.length ? (
              dependentes.map((d) => <Pessoa key={d.id} nome={d.nome} papel="Dependente" />)
            ) : (
              <Vaga rotulo="Dependente" />
            )}
          </div>
          {outros.length ? (
            <p className="mt-3 text-[11px] text-navy/55">
              Outras pessoas do núcleo sem vínculo de parentesco gravado: {outros.map((o) => o.nome).join(", ")}.
            </p>
          ) : null}
          <p className="mt-3 text-[10px] text-navy/45">
            {qNucleos.isLoading
              ? "Carregando núcleo…"
              : qNucleos.isError
                ? "Não foi possível ler o núcleo agora — isto é falha de leitura, não ausência de família."
                : !caso
                  ? "Selecione um caso para ver a família."
                  : !nucleo
                    ? "Este caso ainda não tem núcleo familiar cadastrado."
                    : "Só relações gravadas no núcleo; nada é inferido por sobrenome."}
          </p>
        </Cartao>

        <Cartao titulo="Núcleos com acesso" data-nucleos-com-acesso>
          {comAcesso.length ? (
            <div className="space-y-2.5">
              {comAcesso.map((p) => (
                <Pessoa key={p.chave} nome={p.nome} papel={rotuloEstadoAcesso(p.estado)!.texto} />
              ))}
            </div>
          ) : (
            <EstadoVazio mensagem="Ninguém deste caso com acesso ativo ou convite enviado." />
          )}
        </Cartao>

        <Cartao titulo="Núcleos sem acesso" data-nucleos-sem-acesso>
          {semAcesso.length ? (
            <div>
              {semAcesso.map((p) => (
                <Linha
                  key={p.chave}
                  rotulo={p.nome}
                  valor={p.estado ? (STATUS_ACESSO_LABEL[p.estado] ?? "Sem acesso") : "Sem acesso"}
                  tom={p.estado === "suspended" || p.estado === "revoked" ? "critico" : "neutro"}
                />
              ))}
            </div>
          ) : (
            <EstadoVazio mensagem="Nenhuma pessoa deste caso sem acesso registrada." />
          )}
        </Cartao>
      </div>

      <Cartao
        titulo="Conteúdo publicado no App"
        data-conteudo-publicado-app
        acao={
          caso ? (
            <Link
              to="/app-cliente-como-pessoa"
              search={{ casoId: caso.id }}
              className="text-[11px] font-medium text-navy underline decoration-gold underline-offset-4"
            >
              Ver como a família vê
            </Link>
          ) : undefined
        }
      >
        {itensConteudo.length ? (
          <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {itensConteudo.map((i) => (
              <Linha
                key={`${i.tipo}|${i.status}`}
                rotulo={i.n > 1 ? `${i.tipo} · ${i.n}` : i.tipo}
                valor={ESTADO_CONTEUDO[i.status].texto}
                tom={ESTADO_CONTEUDO[i.status].tom}
              />
            ))}
          </div>
        ) : (
          <EstadoVazio mensagem="Nenhum conteúdo deste caso em rascunho, revisão, aprovado ou publicado no App." />
        )}
      </Cartao>

      <Cartao titulo="Fila de publicação para o App Cliente" data-fila-publicacao-app>
        <p className="-mt-1 mb-3 text-[10px] text-navy/45">
          Portal interno · contagem real de itens do caso{caso ? ` ${nomeCaso(caso)}` : ""}
        </p>
        <FilaEtapas etapas={etapasFila} />
        {caso && projecoesDoCaso.length === 0 ? (
          <p className="mt-2 text-[11px] text-navy/55">
            Nenhum item na fila deste caso ainda — zero é a contagem real, não ausência de leitura.
          </p>
        ) : null}
        {!caso ? <Etiqueta texto="Selecione um caso" /> : null}
      </Cartao>
    </div>
  );
}
