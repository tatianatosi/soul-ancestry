/**
 * Ordem P0 (2026-09-21) — "Estado Integrado do Caso": consolida, num único
 * bloco, o que hoje está espalhado entre a leitura de `carregarCanonico`/
 * `carregarFichaCaso` (já feita pela rota) e `lerCadeiaOperacional` (já
 * existente, mas hoje só chamada em `casos.$caseId.contrato.preparar.tsx`,
 * nunca dentro do Caso 360). Não lê nenhuma tabela nova por conta própria —
 * só recebe, via props, dados que a rota já buscou. Somente leitura: cada
 * linha aponta para a superfície fonte, nunca vira formulário aqui.
 */
import { Link } from "@tanstack/react-router";

type Linha = Record<string, any>;

function Item({
  rotulo,
  valor,
  linkTo,
  linkParams,
  linkTexto,
}: {
  rotulo: string;
  valor: string;
  linkTo?: string;
  linkParams?: Record<string, string>;
  linkTexto?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-navy/10 py-2 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <dt className="text-[11px] uppercase tracking-wide text-navy/50">{rotulo}</dt>
        {linkTo?.startsWith("#") ? (
          <a href={linkTo} className="text-[11px] text-navy underline decoration-gold underline-offset-4">
            {linkTexto ?? "Ver fonte →"}
          </a>
        ) : linkTo ? (
          <Link
            to={linkTo as any}
            params={linkParams as any}
            className="text-[11px] text-navy underline decoration-gold underline-offset-4"
          >
            {linkTexto ?? "Ver fonte →"}
          </Link>
        ) : null}
      </div>
      <dd className="text-sm text-navy/85">{valor}</dd>
    </div>
  );
}

export function EstadoIntegradoCaso({
  caseId,
  caso,
  cliente,
  clienteId,
  membros,
  nucleos,
  servicos,
  produtos,
  planejador,
  onboarding,
  ultimaEntrega,
  timelineUltimoEvento,
  contratoStatus,
  acessoApp,
}: {
  caseId: string;
  caso: Linha;
  cliente: Linha | null;
  clienteId: string | null;
  membros: Linha[];
  nucleos: Linha[];
  servicos: Linha[];
  produtos: Linha[];
  planejador: {
    etapa: string | null;
    faseJornada: string | null;
    rotaConfirmada: string | null;
    marcos: unknown[];
  } | null;
  onboarding: Linha[];
  ultimaEntrega: Linha | null;
  timelineUltimoEvento: Linha | null;
  contratoStatus: string | null;
  acessoApp: { liberado: boolean; statusAcesso: string | null; ultimoAcessoEm: string | null } | null;
}) {
  const servicoAtual = servicos.find((s) => !s["archived_at"]) ?? servicos[0] ?? null;
  const produtoDoServico = servicoAtual
    ? produtos.find((p) => p["id"] === servicoAtual["product_catalog_id"])
    : null;
  const produtoPai = (produtoDoServico?.["produto_pai"] as string | null) ?? null;

  const marcosConcluidos = planejador ? (planejador.marcos ?? []).length : 0;

  return (
    <section className="mb-6 rounded-xl border border-navy/15 bg-cream/40 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg text-navy">Estado integrado do caso</h2>
        <span className="text-[11px] text-navy/55">
          Só leitura — cada linha aponta para a tela que grava o dado
        </span>
      </div>
      <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        <Item
          rotulo="Pessoa / origem"
          valor={cliente ? String(cliente["nome"] ?? "Sem nome") : "Sem cliente vinculado"}
          linkTo={clienteId ? "/pessoas/$clienteId" : undefined}
          linkParams={clienteId ? { clienteId } : undefined}
          linkTexto="Pessoa 360 →"
        />
        <Item
          rotulo="Família / núcleo"
          valor={
            nucleos.length
              ? `${nucleos.length} núcleo(s) · ${membros.length} membro(s)`
              : `${membros.length} pessoa(s) no caso, sem núcleo`
          }
          linkTo="/nucleos"
          linkTexto="Núcleos →"
        />
        <Item
          rotulo="Produto-pai / trilha"
          valor={produtoPai ?? (servicoAtual ? "Produto vinculado sem produto-pai mapeado" : "Nenhum produto-pai vinculado")}
          linkTo="#secao-jornada"
          linkTexto="Produto-pai e trilha →"
        />
        <Item
          rotulo="Etapa / rota da jornada"
          valor={
            planejador
              ? `${planejador.etapa ?? "sem etapa"} · ${planejador.rotaConfirmada ?? "rota não confirmada"}`
              : "Planejador não persistido para o caso"
          }
          linkTo="/casos/$caseId/contrato/preparar"
          linkParams={{ caseId }}
          linkTexto="Cadeia operacional →"
        />
        <Item
          rotulo="Marcos do planejador"
          valor={planejador ? `${marcosConcluidos} marco(s) declarado(s)` : "Sem planejador persistido"}
          linkTo="/casos/$caseId/contrato/preparar"
          linkParams={{ caseId }}
          linkTexto="Cadeia operacional →"
        />
        <Item
          rotulo="Onboarding"
          valor={
            onboarding.length
              ? `${onboarding.filter((i) => i["status"] === "concluido").length}/${onboarding.length} item(ns) concluído(s)`
              : "Checklist não iniciado"
          }
          linkTo="#secao-jornada"
          linkTexto="Onboarding →"
        />
        <Item
          rotulo="Última microentrega"
          valor={ultimaEntrega ? String(ultimaEntrega["title_client"] ?? "Microentrega sem título") : "Nenhuma registrada"}
          linkTo="/biblioteca-evidencias/$caseId"
          linkParams={{ caseId }}
          linkTexto="Biblioteca de evidências →"
        />
        <Item
          rotulo="Contrato / OS"
          valor={contratoStatus ?? "Sem contrato ativo"}
          linkTo="/casos/$caseId/contrato/preparar"
          linkParams={{ caseId }}
          linkTexto="Preparar contrato →"
        />
        <Item
          rotulo="Acesso ao App"
          valor={
            acessoApp
              ? `${acessoApp.liberado ? "liberado" : "não liberado"}${acessoApp.statusAcesso ? ` (${acessoApp.statusAcesso})` : ""}${
                  acessoApp.ultimoAcessoEm ? ` · último acesso ${String(acessoApp.ultimoAcessoEm).slice(0, 10)}` : ""
                }`
              : "Sem projeção de acesso calculada"
          }
          linkTo="/acessos-portal"
          linkTexto="Acessos do portal →"
        />
        <Item
          rotulo="Último evento no histórico"
          valor={
            timelineUltimoEvento
              ? `${String(timelineUltimoEvento["title"] ?? "Evento")} — ${String(timelineUltimoEvento["occurred_at"] ?? "").slice(0, 10)}`
              : "Nenhum evento registrado"
          }
          linkTo="#secao-visao"
          linkTexto="Histórico completo →"
        />
      </dl>
    </section>
  );
}
