import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";

import {
  BarrasHorizontais,
  Cartao,
  Etiqueta,
  Linha,
  Pessoa,
  RedeVinculos,
  sigla,
  type Tom,
} from "@/components/prancha-v4/kit";
import { PAPEIS_PESSOA } from "@/lib/caso-ficha";
import { mascararCpf } from "@/lib/validacao-pessoa";
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

/** Lugar sem registro: mesma forma da pessoa, tracejado e sem nome. */
function Vaga({ papel }: { papel: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 opacity-70" data-vaga-parentesco>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dashed border-navy/25 text-[11px] text-navy/35" aria-hidden>
        —
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs text-navy/45">Não registrado</span>
        <span className="block truncate text-[10px] text-navy/40">{papel}</span>
      </span>
    </div>
  );
}

/**
 * Gráfico de parentesco no desenho da prancha: ascendentes e cônjuge acima,
 * a pessoa ao centro, filhos abaixo. Cada lugar só com vínculo gravado
 * (case_members.pai_id/mae_id) ou declarado no cadastro (nome_pai, nome_mae,
 * nome_conjuge) — este último marcado como "declarado".
 */
function ArvoreGenealogica({
  nome,
  papel,
  pai,
  mae,
  conjuge,
  filhos,
}: {
  nome: string;
  papel: string;
  pai: { nome: string; declarado: boolean } | null;
  mae: { nome: string; declarado: boolean } | null;
  conjuge: string | null;
  filhos: { id: string; nome: string }[];
}) {
  const filhosExibidos = filhos.slice(0, 4);
  return (
    <figure
      role="img"
      aria-label={`Árvore genealógica de ${nome}: ${pai ? pai.nome : "pai não registrado"}, ${mae ? mae.nome : "mãe não registrada"}, ${filhosExibidos.length} filho(s) registrado(s)`}
      className="flex flex-col items-center"
    >
      <div className="grid w-full grid-cols-1 justify-items-start gap-2 sm:grid-cols-3">
        {pai ? <Pessoa nome={pai.nome} papel={`Ascendente · pai${pai.declarado ? " (declarado)" : ""}`} /> : <Vaga papel="Ascendente · pai" />}
        {mae ? <Pessoa nome={mae.nome} papel={`Ascendente · mãe${mae.declarado ? " (declarado)" : ""}`} /> : <Vaga papel="Ascendente · mãe" />}
        {conjuge ? <Pessoa nome={conjuge} papel="Cônjuge (declarado)" /> : <Vaga papel="Cônjuge" />}
      </div>
      <span className="h-5 w-px bg-navy/20" aria-hidden />
      <div className="rounded-xl border border-gold/50 bg-gold/10 px-5 py-2.5">
        <Pessoa nome={nome} papel={papel} />
      </div>
      <span className="h-5 w-px bg-navy/20" aria-hidden />
      <div className="grid w-full grid-cols-1 justify-items-start gap-2 sm:grid-cols-2">
        {filhosExibidos.length ? (
          filhosExibidos.map((f) => <Pessoa key={f.id} nome={f.nome} papel="Filho(a)" />)
        ) : (
          <Vaga papel="Filho(a) · nenhum filho registrado" />
        )}
      </div>
      <figcaption className="mt-2 text-[9px] text-navy/50">
        Vínculo gravado no caso ou declarado no cadastro · nada deduzido por sobrenome
      </figcaption>
    </figure>
  );
}

// `valor` nulo = sem denominador (nenhuma fonte): estrelas vazias e nenhum número.
function Estrelas({ valor, apoio, semFonte }: { valor: number | null; apoio: string; semFonte?: boolean }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
      <div
        className="flex items-center gap-1"
        role="img"
        aria-label={
          valor !== null
            ? `Confiança ${valor.toFixed(1)} de 5`
            : semFonte
              ? "Confiança sem fonte para medir"
              : "Confiança sem nota registrada"
        }
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
  // 19/10/2026 — só aresta com vínculo registrado: filiação gravada no caso
  // (pai, mãe, filhos) e cônjuge declarado no cadastro. Estar no mesmo caso
  // não vira aresta.
  const vizinhos = [
    ...caseMembers
      .filter((m) => m !== eu && ligadosAMim.has(String(m.id)))
      .map((m) => ({ id: String(m.id), nome: nomeDe(m), ligado: true })),
    ...(conjuge ? [{ id: "conjuge-declarado", nome: conjuge, ligado: false }] : []),
  ];

  // Papéis desta pessoa nos casos vinculados — um por membresia (case_members.papel_no_caso),
  // nunca inferido: vocabulário fechado real de PAPEIS_PESSOA (caso-ficha.ts).
  const minhasMembresias = caseMembers.filter((m) => m.cliente_id === cliente.id);
  const papeisNosCasos = minhasMembresias
    .map((m) => texto(m.papel_no_caso))
    .filter((v): v is string => Boolean(v));
  const papelCentral = papeisNosCasos.length
    ? Array.from(new Set(papeisNosCasos.map((p) => PAPEIS_PESSOA.find((o) => o.valor === p)?.rotulo ?? p))).join(" · ")
    : "Pessoa central";

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
          {papeisNosCasos.length ? (
            <div className="mb-3 flex flex-wrap gap-1.5" data-pessoa360-papeis>
              {papeisNosCasos.map((p, i) => (
                <Etiqueta key={`${p}-${i}`} texto={PAPEIS_PESSOA.find((o) => o.valor === p)?.rotulo ?? p} tom="sucesso" />
              ))}
            </div>
          ) : null}
          <Linha rotulo="Nome civil" valor={texto(cliente.nome) ?? "Não registrado"} tom={texto(cliente.nome) ? "neutro" : "atencao"} />
          {/* 22/10/2026: na composição V4 o CPF é selo de resumo, sempre
              mascarado. O número inteiro, com "revelar", fica na ficha completa
              (CpfMascarado em pessoas.$clienteId.tsx) — um selo não comporta
              botão sem mexer no kit compartilhado. */}
          <Linha rotulo="CPF" valor={texto(cliente.cpf) ? mascararCpf(String(cliente.cpf)) : "Não registrado"} tom={texto(cliente.cpf) ? "neutro" : "atencao"} />
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
            papel={papelCentral}
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
              <p className="text-[10px] text-navy/55">{local ? "Último endereço registrado no cadastro" : "Sem endereço no cadastro"}</p>
            </div>
          </div>
        </Cartao>

        <Cartao titulo="Confiança da pessoa" data-pessoa360-confianca className="rounded-2xl p-6 shadow-sm">
          {/*
            19/10/2026 — não há nota de confiança gravada para a pessoa
            (cadastro). Estrelas ficam vazias e a nota é "—"; o apoio mostra só
            a contagem real de fontes, sem convertê-la em nota.
          */}
          <Estrelas
            valor={null}
            semFonte={docs.length === 0}
            apoio={
              docs.length
                ? `Sem nota de confiança registrada · ${confirmadas} de ${docs.length} fonte(s) confirmada(s)`
                : "Sem nota de confiança registrada · nenhuma fonte conferida ainda"
            }
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
                ? "Vínculos registrados · traço dourado = filiação gravada no caso; tracejado = cônjuge declarado no cadastro"
                : "Nenhum vínculo de filiação ou cônjuge registrado para esta pessoa"
            }
          />
        </Cartao>
      </div>
    </div>
  );
}
