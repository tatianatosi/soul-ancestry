import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";

import {
  BarrasHorizontais,
  Cartao,
  Etiqueta,
  Linha,
  RedeVinculos,
  sigla,
  type Tom,
} from "@/components/prancha-v4/kit";
import { PAPEIS_PESSOA } from "@/lib/caso-ficha";
import { formatarCpf } from "@/lib/validacao-pessoa";
import { cn } from "@/lib/utils";

/*
 * 13/10/2026 — Pessoa 360 com a composição da Prancha V4: identidade no
 * topo; identidade, parentesco e casos; fontes, localização e confiança;
 * completude por dimensão e rede de vínculos.
 *
 * Só dado que /pessoas/$clienteId já carrega (carregarPessoa). Nenhum
 * parentesco é suposto: pai/mãe/filhos vêm de `case_members.pai_id/mae_id`;
 * cônjuge só quando `clientes.nome_conjuge` está preenchido. Toda medida é
 * contagem real (x de y), nunca percentual estimado. Cartão e gráfico
 * aparecem sempre; sem registro, mostram o estado zero.
 */

type Linha_ = Record<string, unknown>;

export type DadosPessoa360 = {
  cliente: Linha_;
  casos: Linha_[];
  caseMembers: Linha_[];
  documentos: Linha_[];
};

const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

const ESTADO_DOC: Record<string, { rotulo: string; tom: Tom }> = {
  aprovado: { rotulo: "Confirmada", tom: "sucesso" },
  liberado: { rotulo: "Confirmada", tom: "sucesso" },
  em_revisao: { rotulo: "Em revisão", tom: "atencao" },
  pendente: { rotulo: "Pendente", tom: "neutro" },
  recusado: { rotulo: "Recusada", tom: "critico" },
};

// Mesmo vocabulário fechado de pessoas.$clienteId.tsx (CHECK clientes_estado_civil_check) — nunca duplicar como texto livre.
const ROTULO_ESTADO_CIVIL: Record<string, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
  uniao_estavel: "União estável",
};

function ArvoreGenealogica({
  nome,
  pai,
  mae,
  conjuge,
  filhos,
}: {
  nome: string;
  pai: { nome: string; declarado: boolean } | null;
  mae: { nome: string; declarado: boolean } | null;
  conjuge: string | null;
  filhos: { id: string; nome: string }[];
}) {
  const w = 460;
  const h = 200;
  const yPais = 28;
  const yCentro = 100;
  const yFilhos = 172;
  const xPai = w * 0.3;
  const xMae = w * 0.7;
  const xCentro = w / 2;
  const filhosExibidos = filhos.slice(0, 3);
  const xFilho = (i: number) =>
    filhosExibidos.length === 1
      ? xCentro
      : w * (0.2 + (0.6 * i) / Math.max(1, filhosExibidos.length - 1));

  return (
    <figure
      role="img"
      aria-label={`Árvore genealógica de ${nome}: ${pai ? pai.nome : "pai não registrado"}, ${mae ? mae.nome : "mãe não registrada"}, ${filhosExibidos.length} filho(s) registrado(s)`}
      className="relative mx-auto h-48 max-w-lg overflow-hidden rounded-lg border border-navy/10 bg-cream/35"
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
        <line x1={xPai} y1={yPais + 16} x2={xCentro} y2={yCentro - 16} className={pai ? "stroke-gold/60" : "stroke-navy/15"} strokeWidth="2" strokeDasharray={pai?.declarado ? "4 4" : undefined} />
        <line x1={xMae} y1={yPais + 16} x2={xCentro} y2={yCentro - 16} className={mae ? "stroke-gold/60" : "stroke-navy/15"} strokeWidth="2" strokeDasharray={mae?.declarado ? "4 4" : undefined} />
        {filhosExibidos.map((f, i) => (
          <line key={`l-${f.id}`} x1={xCentro} y1={yCentro + 16} x2={xFilho(i)} y2={yFilhos - 16} className="stroke-gold/60" strokeWidth="2" />
        ))}

        <g aria-hidden>
          <rect x={xPai - 16} y={yPais - 16} width={32} height={32} rx="10" ry="10" className={pai ? "fill-card stroke-navy/40" : "fill-card stroke-navy/15"} strokeWidth="2" />
          <text x={xPai} y={yPais + 4} textAnchor="middle" className="fill-navy text-[10px] font-semibold">{pai ? sigla(pai.nome) : "—"}</text>
        </g>
        <g aria-hidden>
          <rect x={xMae - 16} y={yPais - 16} width={32} height={32} rx="10" ry="10" className={mae ? "fill-card stroke-navy/40" : "fill-card stroke-navy/15"} strokeWidth="2" />
          <text x={xMae} y={yPais + 4} textAnchor="middle" className="fill-navy text-[10px] font-semibold">{mae ? sigla(mae.nome) : "—"}</text>
        </g>

        <g aria-hidden>
          <rect x={xCentro - 24} y={yCentro - 24} width={48} height={48} rx="10" ry="10" className="fill-card stroke-gold" strokeWidth="2.5" />
          <text x={xCentro} y={yCentro + 5} textAnchor="middle" className="fill-navy text-[12px] font-semibold">{sigla(nome)}</text>
        </g>

        {filhosExibidos.length ? (
          filhosExibidos.map((f, i) => (
            <g key={f.id} aria-hidden>
              <rect x={xFilho(i) - 16} y={yFilhos - 16} width={32} height={32} rx="10" ry="10" className="fill-card stroke-navy/40" strokeWidth="2" />
              <text x={xFilho(i)} y={yFilhos + 4} textAnchor="middle" className="fill-navy text-[10px] font-semibold">{sigla(f.nome)}</text>
            </g>
          ))
        ) : (
          <text x={xCentro} y={yFilhos + 4} textAnchor="middle" className="fill-navy/40 text-[10px]">Nenhum filho registrado</text>
        )}
      </svg>
      <figcaption className="absolute bottom-1 left-3 right-3 text-[9px] text-navy/50">
        {conjuge ? `Cônjuge: ${conjuge} · ` : ""}traço contínuo = vínculo gravado no caso · tracejado = só declarado no cadastro
      </figcaption>
    </figure>
  );
}

// `valor` nulo = sem denominador (nenhuma fonte): estrelas vazias e nenhum número.
function Estrelas({ valor, apoio }: { valor: number | null; apoio: string }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
      <div
        className="flex items-center gap-1"
        role="img"
        aria-label={valor === null ? "Confiança sem fonte para medir" : `Confiança ${valor.toFixed(1)} de 5`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn("h-4 w-4", valor !== null && i < Math.round(valor) ? "fill-gold text-gold" : "text-navy/15")}
            aria-hidden
          />
        ))}
        <span className="ml-1 font-serif text-xl text-navy">{valor === null ? "—" : valor.toFixed(1)}</span>
      </div>
      <p className="mt-1 text-[10px] text-navy/55">{apoio}</p>
    </div>
  );
}

export function ComposicaoPessoa360V4({
  dados,
  nome,
  duplicidadesAbertas,
}: {
  dados: DadosPessoa360;
  nome: string;
  /** Possíveis duplicidades já detectadas pela rota (sinais da Pessoa 360). Ausente = não verificado: o cabeçalho não afirma nada. */
  duplicidadesAbertas?: number;
}) {
  const { cliente, casos, caseMembers, documentos } = dados;
  const eu = caseMembers.find((m) => m.cliente_id === cliente.id) ?? null;
  const porId = new Map(caseMembers.map((m) => [String(m.id), m]));
  const pai = eu?.pai_id ? (porId.get(String(eu.pai_id)) ?? null) : null;
  const mae = eu?.mae_id ? (porId.get(String(eu.mae_id)) ?? null) : null;
  const filhos = eu
    ? caseMembers.filter((m) => m.pai_id === eu.id || m.mae_id === eu.id)
    : [];
  const conjuge = texto(cliente.nome_conjuge);
  const nomeDe = (m: Linha_) => texto(m.nome) ?? "Pessoa sem nome registrado";

  const docs = documentos.filter((d) => d.status !== "arquivado");
  const confirmadas = docs.filter((d) => d.status === "aprovado" || d.status === "liberado").length;
  const confiancaEstado = !eu
    ? null
    : eu.data_verificacao_dado && (eu.pai_id || eu.mae_id)
      ? "Confirmada"
      : eu.pai_id || eu.mae_id || eu.status_cadastral
        ? "Em revisão"
        : "Pendente";

  const camposIdentidade = [
    "nome",
    "data_nascimento",
    "cidade_nascimento",
    "nacionalidade",
    "cpf",
    "rg_numero",
    "nome_mae",
    "nome_pai",
    "estado_civil",
    "profissao",
  ];
  const identidadeOk = camposIdentidade.filter((c) => texto(cliente[c])).length;
  const parentescoOk = (pai || texto(cliente.nome_pai) ? 1 : 0) + (mae || texto(cliente.nome_mae) ? 1 : 0);
  const casosComAcao = casos.filter((c) => texto(c.proxima_acao)).length;
  const pct = (a: number, b: number) => (b ? (a / b) * 100 : 0);

  const nascimento = texto(cliente.data_nascimento)
    ? new Date(String(cliente.data_nascimento)).toLocaleDateString("pt-BR", { timeZone: "UTC" })
    : null;
  const naturalidade =
    [texto(cliente.cidade_nascimento), texto(cliente.nacionalidade)].filter(Boolean).join(" · ") || null;
  const local = [texto(cliente.endereco_cidade), texto(cliente.endereco_uf), texto(cliente.endereco_pais)]
    .filter(Boolean)
    .join(", ");

  const ligadosAMim = new Set(
    [pai, mae, ...filhos].filter(Boolean).map((m) => String((m as Linha_).id)),
  );
  const vizinhos = caseMembers
    .filter((m) => m !== eu)
    .map((m) => ({ id: String(m.id), nome: nomeDe(m), ligado: ligadosAMim.has(String(m.id)) }));

  // Papéis desta pessoa nos casos vinculados — um por membresia (case_members.papel_no_caso),
  // nunca inferido: vocabulário fechado real de PAPEIS_PESSOA (caso-ficha.ts).
  const minhasMembresias = caseMembers.filter((m) => m.cliente_id === cliente.id);
  const papeisNosCasos = minhasMembresias
    .map((m) => texto(m.papel_no_caso))
    .filter((v): v is string => Boolean(v));

  return (
    <div className="space-y-4" data-pessoa360-v4>
      <div className="flex items-center gap-3 rounded-xl border border-navy/10 bg-cream-base p-4" data-pessoa360-identidade-topo>
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/50 bg-navy font-serif text-lg text-gold"
          aria-hidden
        >
          {sigla(nome)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-serif text-2xl text-navy">{nome}</h2>
          <p className="text-xs text-navy/60">
            Pessoa canônica
            {duplicidadesAbertas === undefined
              ? ""
              : duplicidadesAbertas === 0
                ? " · sem duplicidade detectada"
                : ` · ${duplicidadesAbertas} possível(is) duplicidade(s) em revisão`}
            {texto(cliente.origem) ? ` · entrou por ${texto(cliente.origem)}` : ""}
            {` · ${casos.length} caso(s) vinculado(s)`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr_0.9fr]">
        <Cartao titulo="Identidade" data-pessoa360-identidade className="rounded-2xl p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-lg text-gold"
              aria-hidden
            >
              {sigla(nome)}
            </span>
            <p className="min-w-0 truncate font-serif text-base text-navy">{texto(cliente.nome) ?? "Não registrado"}</p>
          </div>
          {papeisNosCasos.length ? (
            <div className="mb-3 flex flex-wrap gap-1.5" data-pessoa360-papeis>
              {papeisNosCasos.map((p, i) => (
                <Etiqueta key={`${p}-${i}`} texto={PAPEIS_PESSOA.find((o) => o.valor === p)?.rotulo ?? p} tom="sucesso" />
              ))}
            </div>
          ) : null}
          <Linha rotulo="Nome civil" valor={texto(cliente.nome) ?? "Não registrado"} tom={texto(cliente.nome) ? "neutro" : "atencao"} />
          <Linha rotulo="CPF" valor={texto(cliente.cpf) ? formatarCpf(String(cliente.cpf)) : "Não registrado"} tom={texto(cliente.cpf) ? "neutro" : "atencao"} />
          <Linha rotulo="Nascimento" valor={nascimento ?? "Não registrado"} tom={nascimento ? "neutro" : "atencao"} />
          <Linha rotulo="Naturalidade" valor={naturalidade ?? "Não registrada"} tom={naturalidade ? "neutro" : "atencao"} />
          <Linha
            rotulo="Estado civil"
            valor={texto(cliente.estado_civil) ? ROTULO_ESTADO_CIVIL[String(cliente.estado_civil)] ?? String(cliente.estado_civil) : "Não registrado"}
            tom={texto(cliente.estado_civil) ? "neutro" : "atencao"}
          />
          <Linha
            rotulo="Confiança do dado"
            valor={confiancaEstado ?? "Sem registro em caso"}
            tom={confiancaEstado === "Confirmada" ? "sucesso" : confiancaEstado === "Em revisão" ? "atencao" : "critico"}
          />
        </Cartao>

        <Cartao titulo="Gráfico de parentesco" data-pessoa360-parentesco className="rounded-2xl p-6 shadow-sm">
          <ArvoreGenealogica
            nome={nome}
            pai={pai ? { nome: nomeDe(pai), declarado: false } : texto(cliente.nome_pai) ? { nome: String(cliente.nome_pai), declarado: true } : null}
            mae={mae ? { nome: nomeDe(mae), declarado: false } : texto(cliente.nome_mae) ? { nome: String(cliente.nome_mae), declarado: true } : null}
            conjuge={conjuge}
            filhos={filhos.map((f) => ({ id: String(f.id), nome: nomeDe(f) }))}
          />
        </Cartao>

        <Cartao titulo="Casos vinculados" data-pessoa360-casos className="rounded-2xl p-6 shadow-sm">
          {casos.length ? (
            casos.slice(0, 5).map((c) => (
              <Link key={String(c.id)} to="/casos/$caseId" params={{ caseId: String(c.id) }} className="block hover:bg-cream/40">
                <Linha
                  rotulo={texto(c.titulo) ?? texto(c.codigo) ?? "Caso sem título"}
                  valor={c.ativo ? "Ativo" : (texto(c.fase)?.replace(/_/g, " ") ?? "Sem fase")}
                  tom={c.ativo ? "sucesso" : "neutro"}
                />
              </Link>
            ))
          ) : (
            <Linha rotulo="Nenhum caso vinculado" />
          )}
        </Cartao>

        <Cartao titulo="Fontes" data-pessoa360-fontes className="rounded-2xl p-6 shadow-sm">
          {docs.length ? (
            docs.slice(0, 5).map((d) => {
              const e = ESTADO_DOC[String(d.status)] ?? { rotulo: "Sem status", tom: "neutro" as Tom };
              return <Linha key={String(d.id)} rotulo={texto(d.titulo) ?? "Documento sem título"} valor={e.rotulo} tom={e.tom} />;
            })
          ) : (
            <Linha rotulo="Nenhuma fonte registrada" />
          )}
        </Cartao>

        <Cartao titulo="Localização" data-pessoa360-localizacao className="rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 rounded-lg border border-navy/10 bg-cream/40 p-3">
            <span className={cn("grid h-9 w-9 place-items-center rounded-full", local ? "bg-navy text-gold" : "bg-navy/10 text-navy/40")}>
              <MapPin className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold text-navy">{local || "Não registrada"}</p>
              <p className="text-[10px] text-navy/55">{local ? "Endereço do cadastro" : "Sem endereço no cadastro"}</p>
            </div>
          </div>
        </Cartao>

        <Cartao titulo="Confiança da pessoa" data-pessoa360-confianca className="rounded-2xl p-6 shadow-sm">
          <Estrelas
            valor={docs.length ? (confirmadas / docs.length) * 5 : null}
            apoio={docs.length ? `${confirmadas} de ${docs.length} fonte(s) confirmada(s)` : "Nenhuma fonte conferida ainda"}
          />
        </Cartao>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Cartao titulo="Completude por dimensão" data-pessoa360-completude className="rounded-2xl p-6 shadow-sm">
          <BarrasHorizontais
            tituloAcessivel="Completude da ficha da pessoa por dimensão"
            itens={[
              { rotulo: "Identidade", valor: pct(identidadeOk, camposIdentidade.length), apoio: `${identidadeOk} de ${camposIdentidade.length} campos` },
              { rotulo: "Parentesco", valor: pct(parentescoOk, 2), apoio: `${parentescoOk} de 2 genitores`, tom: "gold" },
              { rotulo: "Fontes", valor: pct(confirmadas, docs.length), apoio: docs.length ? `${confirmadas} de ${docs.length} confirmadas` : "Sem fonte para medir", tom: "terracotta" },
              { rotulo: "Casos vinculados", valor: pct(casosComAcao, casos.length), apoio: casos.length ? `${casosComAcao} de ${casos.length} com próxima ação` : "Sem caso para medir" },
            ]}
          />
        </Cartao>
        <Cartao titulo="Rede de vínculos" data-pessoa360-rede className="rounded-2xl p-6 shadow-sm">
          <RedeVinculos
            centro={{ nome }}
            vizinhos={vizinhos}
            legenda={
              vizinhos.length
                ? "Pessoas dos mesmos casos · traço dourado = filiação gravada; tracejado = mesmo caso, sem filiação"
                : "Nenhuma outra pessoa registrada nos casos desta pessoa"
            }
          />
        </Cartao>
      </div>
    </div>
  );
}
