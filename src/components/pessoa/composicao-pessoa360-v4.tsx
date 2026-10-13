import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";

import {
  BarrasHorizontais,
  Cartao,
  Linha,
  Pessoa,
  RedeVinculos,
  sigla,
  type Tom,
} from "@/components/prancha-v4/kit";
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

function Estrelas({ valor, apoio }: { valor: number; apoio: string }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
      <div className="flex items-center gap-1" role="img" aria-label={`Confiança ${valor.toFixed(1)} de 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn("h-4 w-4", i < Math.round(valor) ? "fill-gold text-gold" : "text-navy/15")}
            aria-hidden
          />
        ))}
        <span className="ml-1 font-serif text-xl text-navy">{valor.toFixed(1)}</span>
      </div>
      <p className="mt-1 text-[10px] text-navy/55">{apoio}</p>
    </div>
  );
}

export function ComposicaoPessoa360V4({ dados, nome }: { dados: DadosPessoa360; nome: string }) {
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

  return (
    <div className="space-y-4" data-pessoa360-v4>
      <div className="flex items-center gap-3 rounded-xl border border-navy/10 bg-card p-4" data-pessoa360-identidade-topo>
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
            {texto(cliente.origem) ? ` · entrou por ${texto(cliente.origem)}` : ""}
            {` · ${casos.length} caso(s) vinculado(s)`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr_0.9fr]">
        <Cartao titulo="Identidade" data-pessoa360-identidade>
          <Linha rotulo="Nome civil" valor={texto(cliente.nome) ?? "Não registrado"} />
          <Linha rotulo="Nascimento" valor={nascimento ?? "Não registrado"} tom={nascimento ? "neutro" : "atencao"} />
          <Linha rotulo="Naturalidade" valor={naturalidade ?? "Não registrada"} tom={naturalidade ? "neutro" : "atencao"} />
          <Linha
            rotulo="Confiança do dado"
            valor={confiancaEstado ?? "Sem registro em caso"}
            tom={confiancaEstado === "Confirmada" ? "sucesso" : confiancaEstado === "Em revisão" ? "atencao" : "critico"}
          />
        </Cartao>

        <Cartao titulo="Gráfico de parentesco" data-pessoa360-parentesco>
          <div className="mx-auto grid max-w-lg grid-cols-4 grid-rows-[auto_28px_auto_28px_auto] items-center text-center">
            <div className="col-span-2">
              {pai || texto(cliente.nome_pai) ? (
                <Pessoa nome={pai ? nomeDe(pai) : String(cliente.nome_pai)} papel={pai ? "Pai" : "Pai · declarado"} />
              ) : (
                <span className="text-[10px] text-navy/40">Pai não registrado</span>
              )}
            </div>
            <div className="col-span-2">
              {mae || texto(cliente.nome_mae) ? (
                <Pessoa nome={mae ? nomeDe(mae) : String(cliente.nome_mae)} papel={mae ? "Mãe" : "Mãe · declarada"} />
              ) : (
                <span className="text-[10px] text-navy/40">Mãe não registrada</span>
              )}
            </div>
            <div className={cn("col-span-4 mx-auto h-7 w-px", pai || mae ? "bg-gold" : "bg-navy/15")} />
            <div className="col-span-2 col-start-2 rounded-lg border border-gold/50 bg-gold/10 p-2">
              <Pessoa nome={nome} papel={conjuge ? `Cônjuge: ${conjuge}` : "Esta pessoa"} destaque />
            </div>
            <div className={cn("col-span-4 mx-auto h-7 w-px", filhos.length ? "bg-gold" : "bg-navy/15")} />
            {filhos.length ? (
              filhos.slice(0, 2).map((f) => (
                <div key={String(f.id)} className="col-span-2">
                  <Pessoa nome={nomeDe(f)} papel="Filho(a)" />
                </div>
              ))
            ) : (
              <div className="col-span-4 text-[10px] text-navy/40">Nenhum filho registrado</div>
            )}
          </div>
          <p className="mt-2 text-center text-[10px] text-navy/50">Só vínculos gravados no caso ou declarados no cadastro.</p>
        </Cartao>

        <Cartao titulo="Casos vinculados" data-pessoa360-casos>
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

        <Cartao titulo="Fontes" data-pessoa360-fontes>
          {docs.length ? (
            docs.slice(0, 5).map((d) => {
              const e = ESTADO_DOC[String(d.status)] ?? { rotulo: "Sem status", tom: "neutro" as Tom };
              return <Linha key={String(d.id)} rotulo={texto(d.titulo) ?? "Documento sem título"} valor={e.rotulo} tom={e.tom} />;
            })
          ) : (
            <Linha rotulo="Nenhuma fonte registrada" />
          )}
        </Cartao>

        <Cartao titulo="Localização" data-pessoa360-localizacao>
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

        <Cartao titulo="Confiança da pessoa" data-pessoa360-confianca>
          <Estrelas
            valor={docs.length ? (confirmadas / docs.length) * 5 : 0}
            apoio={docs.length ? `${confirmadas} de ${docs.length} fonte(s) confirmada(s)` : "Nenhuma fonte conferida ainda"}
          />
        </Cartao>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Cartao titulo="Completude por dimensão" data-pessoa360-completude>
          <BarrasHorizontais
            tituloAcessivel="Completude da ficha da pessoa por dimensão"
            itens={[
              { rotulo: "Identidade", valor: pct(identidadeOk, camposIdentidade.length), apoio: `${identidadeOk} de ${camposIdentidade.length} campos` },
              { rotulo: "Parentesco", valor: pct(parentescoOk, 2), apoio: `${parentescoOk} de 2 genitores`, tom: "gold" },
              { rotulo: "Fontes", valor: pct(confirmadas, docs.length), apoio: `${confirmadas} de ${docs.length} confirmadas`, tom: "terracotta" },
              { rotulo: "Casos vinculados", valor: pct(casosComAcao, casos.length), apoio: `${casosComAcao} de ${casos.length} com próxima ação` },
            ]}
          />
        </Cartao>
        <Cartao titulo="Rede de vínculos" data-pessoa360-rede>
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
