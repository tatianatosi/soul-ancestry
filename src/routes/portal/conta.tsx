import { UserRound, ShieldCheck, ChevronDown } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_TELAS } from "@/lib/portal-copy";
import { planoPublicado } from "@/lib/plano-publicacao";
import { assinaturaPublicada } from "@/lib/assinatura-app";
import { publicacoesParaCliente } from "@/lib/projecoes-cliente";
import { CLIENTE_DEMO_NOME } from "@/lib/portal-demo-sophia";
import { PortalShell, usePortal, PortalCarregando } from "@/components/portal/portal-shell";
import { LinkPortal, usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { BlocoExemploVisual } from "@/components/portal/bloco-exemplo-visual";
import { Button } from "@/components/ui/button";
import { minhasFaturas } from "@/lib/portal-cliente.functions";
import { comTimeoutPortal } from "@/lib/portal-resiliencia";

export const Route = createFileRoute("/portal/conta")({
  head: () => ({
    meta: [
      { title: "Conta — Portal Clube Ancestral" },
      { name: "description", content: "Seus dados de acesso ao portal do Clube Ancestral." },
      { property: "og:title", content: "Conta — Portal Clube Ancestral" },
      { property: "og:description", content: "Dados básicos do seu acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalConta,
});


export function PortalConta() {
  const previa = usePreviaPortal();
  const escopo = useVisibilidade("conta");
  const { visibilidade, carregando } = escopo;
  const contexto = usePortal();
  const { data } = contexto;
  const vivo = usePortalVivo();
  const carregarFaturas = useServerFn(minhasFaturas);
  const faturas = useQuery({
    queryKey: ["portal-faturas"],
    queryFn: () => comTimeoutPortal(carregarFaturas({})),
    enabled: previa === null,
    retry: false,
  });

  /**
   * APP-CASE-ID-CONTA-RADAR (19/09/2026): `previa` cobre dois casos distintos
   * — Acesso Master de um caso real (`identidade.fonte !== "demo"`, ver
   * `app-cliente-como-pessoa.tsx`) e a demo institucional (`fonte === "demo"`,
   * `sessao-demo-app-cliente.tsx`). Antes, qualquer `previa` caía direto nos
   * valores fixos de Sophia — em prévia real de outro caso, a Conta mostrava
   * o titular/país errados (os da demo). `radar.tsx` já prioriza
   * `previa.identidade.codigo`; aqui replica o mesmo padrão e usa `fonte`
   * para nunca fabricar titular/país fora da demo de verdade.
   */
  const previaDemo = previa?.identidade?.fonte === "demo";
   const titular = data?.cliente?.nome ?? (previaDemo ? CLIENTE_DEMO_NOME : null);
   const paisInteresse = data?.cliente?.pais_interesse ?? (previaDemo ? "Itália" : null);
  const acompanhamento = previa || data?.autorizado ? "Sua jornada está sendo acompanhada pela equipe." : "Aguardando novidades da equipe.";

  /**
   * Alertas usa o mesmo `proximaAcao` já publicado para Home/Documentos —
   * nunca uma fonte nova. Só vira alerta quando o motor sinaliza algo
   * acionável (documento pendente ou pagamento em aberto); qualquer outro
   * destino (jornada seguindo, caso encerrado/pausado) fica no "sem alerta".
   */
  /**
   * Corte 3a (01/10/2026) — o plano que a equipe publicou para este caso.
   * Sem publicação, `null`: a Conta mantém o texto de acompanhamento e não
   * inventa plano nenhum. Preço e parcela nunca chegam aqui (o escritor e o
   * leitor recusam).
   */
  const plano = planoPublicado(vivo.data?.projecoes ?? []);
  /*
   * A7 liberado em 03/10/2026, com escopo da própria Proprietária: "somente
   * devemos mostrar sua assinatura e possibilidade de upsell com preço".
   * Até aqui o App era sem preço nenhum. Entram só estes dois blocos, com o
   * valor em campo estruturado (`assinatura-app.ts`) — nunca parcela,
   * desconto, cobrança, contrato ou código de catálogo, que seguem recusados no servidor.
   */
  const assinatura = assinaturaPublicada(vivo.data?.projecoes ?? []);
  /*
    07/10/2026 — correção da Proprietária: o upsell fica só no campo
    editável do Desk, nunca chega ao App ("só no desk não no app"). A
    assinatura do próprio cliente continua aparecendo aqui; o upsell não.
  */

  /**
   * Corte 3b (01/10/2026) — "Atualização da equipe" publicada em
   * /atendimento aparece aqui, da mais recente para a mais antiga. O texto é
   * o que a equipe escreveu para a família; `publicacoesParaCliente` já
   * sanitiza e descarta conteúdo vazio.
   */
  const atualizacoes = publicacoesParaCliente(
    (vivo.data?.projecoes ?? []).filter((p) => p.projection_type === "atualizacao"),
  );

  const proximaAcao = vivo.data?.proximaAcao ?? null;
  const alertaAcionavel =
    proximaAcao &&
    (proximaAcao.destino === "/portal/documentos" || proximaAcao.destino === "/portal/conta")
      ? proximaAcao
      : null;

  return (
    <PortalShell titulo={COPY_TELAS.conta.titulo} descricao={COPY_TELAS.conta.descricao}>
      {!previa && (faturas.isError || vivo.isError || contexto.isError || Boolean(escopo.erro)) ? (
        <section role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">
            Instabilidade de conexão ao carregar seus dados financeiros.
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => {
            void faturas.refetch();
            vivo.refetch();
            void contexto.refetch();
            escopo.tentarNovamente();
          }}>
            Tentar novamente
          </Button>
        </section>
      ) : carregando || vivo.isLoading || contexto.isLoading || (!previa && faturas.isLoading) ? (
        <PortalCarregando />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <div className="app-v11-secoes app-conta-composicao" data-aba-conta>
            {/*
              25/09/2026 — a faixa de crachás no topo (código do caso, canal
              de acesso) era leitura técnica; os mesmos dados humanos seguem
              no cartão "Dados da conta" logo abaixo.
            */}


            <section
              data-conta-perfil
              className="app-v11-faixa"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/60 bg-navy font-serif text-xl text-gold"
                >
                   {titular ? titular.trim().charAt(0).toUpperCase() : <UserRound className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Sua família</p>
                  <h2 className="font-serif text-xl text-navy">Sobre você e sua família</h2>
                </div>
              </div>
               <p className="mt-3 text-sm text-navy/65">Um espaço para cuidar da sua história e acompanhar as novidades da sua família.</p>
               {titular || paisInteresse ? <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                 {titular ? (
                <div className="border-b border-border py-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Titular</dt>
                  <dd className="text-sm text-navy">{titular}</dd>
                </div>
                 ) : null}
                 {paisInteresse ? (
                <div className="border-b border-border py-3">
                   <dt className="text-[11px] uppercase tracking-widest text-navy/50">Origem de interesse</dt>
                  <dd className="text-sm text-navy">{paisInteresse}</dd>
                </div>
                 ) : null}
               </dl> : null}
              <p className="mt-3 text-xs text-navy/55">
                  Se alguma informação mudar, avise a equipe pelo canal que você já utiliza.
              </p>
            </section>

            <section className="app-v11-faixa app-conta-atendimento">
              <details className="app-conta-contato"><summary className="flex min-h-11 cursor-pointer items-center gap-2 font-serif text-xl text-navy"><ShieldCheck className="h-5 w-5" aria-hidden="true" /><span className="flex-1">Estamos por perto</span><ChevronDown className="app-detalhe-seta h-4 w-4" aria-hidden="true" /></summary>
              <p className="mt-2 text-sm text-navy/75">{acompanhamento}</p>
              <p className="mt-3 text-sm leading-relaxed text-navy/75">Ainda não há um canal de contato disponibilizado neste aplicativo.</p>
              <BlocoExemploVisual tipo="contato" />
              <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-navy/70">Seus canais, preferências de aviso e informações de privacidade aparecerão quando estiverem disponíveis neste espaço.</p></details>
            </section>

             <section data-conta-assinatura className="app-v11-faixa">
              <h2 className="font-serif text-xl text-navy">Sua assinatura</h2>
              {assinatura ? (
                <>
                  <p className="mt-2 text-sm text-navy" data-conta-assinatura-nome>
                    {assinatura.nome}
                  </p>
                  <p className="mt-1 font-serif text-2xl text-navy" data-conta-assinatura-valor>
                    {assinatura.valor}{" "}
                    <span className="text-sm text-navy/60">{assinatura.periodicidadeRotulo}</span>
                  </p>
                  {assinatura.situacao ? (
                    <p className="mt-1 text-xs text-navy/60">{assinatura.situacao}</p>
                  ) : null}
                  {assinatura.valor === "R$ 320,00" || assinatura.valor === "R$ 320,00" ? (
                    <p className="mt-2 text-sm text-navy/70" data-conta-assinatura-condicao>
                      {(vivo.data?.casoAtivoId ?? previa?.identidade?.caseId) === "a11a0000-0000-4000-8000-000000000002" ? (
                        <span className="mb-2 block">Condição familiar: 3 assinaturas / parcelas mensais</span>
                      ) : null}
                      Condição prevista por 10 meses. A cobrança individual ainda aguarda confirmação e, por isso, nenhum link de pagamento é exibido.
                    </p>
                  ) : null}
                </>
               ) : (
                /*
                  07/10/2026 — este espaço nunca some: antes a seção inteira
                  desaparecia sem assinatura nem upsell publicados, e ninguém
                  via onde o Desk publicaria isso. O estado vazio é sempre
                  editável/publicável do Desk, nunca hardcoded aqui.
                */
                <p className="mt-2 text-sm text-navy/60" data-conta-assinatura-vazio>
                  Nenhuma assinatura publicada ainda. A equipe publica aqui quando houver.
                </p>
               )}
             </section>

            <section data-conta-plano className="app-v11-faixa">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Meu plano</h2>
                {plano?.situacao ? (
                  <span
                    data-conta-plano-situacao
                    className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-navy/70"
                  >
                    {plano.situacao}
                  </span>
                ) : null}
              </div>
              {plano ? (
                <>
                  <p className="mt-2 text-sm text-navy" data-conta-plano-nome>
                    {plano.nome}
                  </p>
                  {plano.vigencia ? (
                    <p className="mt-1 text-xs text-navy/60">{plano.vigencia}</p>
                  ) : null}
                </>
              ) : (
                <div><p className="mt-2 text-sm text-navy/60" data-conta-plano-vazio>
                  Nenhum plano publicado ainda. A equipe publica aqui quando houver.
                </p><BlocoExemploVisual tipo="plano" /></div>
              )}
            </section>

            <section data-conta-alertas className="app-v11-faixa">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Novidades para você</h2>
                <span className="text-[10px] font-medium uppercase tracking-wide text-navy/45">
                  Da sua jornada
                </span>
              </div>
              {atualizacoes.length > 0 ? (
                <ul className="mt-3 space-y-2" data-conta-atualizacoes>
                  {atualizacoes.map((a) => (
                    <li key={a.id} className="app-conta-registro">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                        {a.tipoRotulo}
                        {a.publicadoEm ? ` · ${new Date(a.publicadoEm).toLocaleDateString("pt-BR")}` : ""}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm text-navy">{a.conteudo}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              {alertaAcionavel ? (
                <div className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                     {alertaAcionavel.destino === "/portal/conta" ? "Aviso para você" : "Documento solicitado"}
                  </p>
                  <p className="mt-1 text-sm text-navy">{alertaAcionavel.acao}</p>
                  {alertaAcionavel.destino === "/portal/documentos" ? (
                    <LinkPortal
                      to="/portal/documentos"
                      className="mt-2 inline-flex min-h-11 items-center text-xs font-medium text-navy/70 underline hover:text-navy"
                    >
                      Ver documentos solicitados
                    </LinkPortal>
                  ) : null}
                </div>
              ) : atualizacoes.length === 0 ? (
                  <div className="app-v11-lacuna mt-3">
                   <p className="text-sm text-navy/70">Nenhum recado novo por enquanto.</p>
                </div>
              ) : null}
            </section>

            {/*
              REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026) — Ficha Piloto
              da Giovanna, campos #47-49 ("Conta > Histórico", 3 marcos).
              `case_timeline_events` (visibility='cliente_aprovado',
              `summary_client_approved`) já tinha tabela, coluna e policy de
              portal (`cte_select_portal`); faltava o escritor
              (`aprovarEventoTimelineParaCliente`, Caso 360 > Histórico) e
              esta leitura. Só o texto que a equipe escreveu explicitamente
              para a família — nunca o título interno do evento.
            */}
            <section data-conta-marcos className="app-v11-faixa">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Marcos da sua jornada</h2>
              </div>
              {(vivo.data?.historico ?? []).length === 0 ? (
                <p className="app-v11-lacuna mt-3 text-sm text-navy/60">
                   Ainda não há um marco da jornada liberado para a família.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {(vivo.data?.historico ?? []).map((marco) => (
                     <li key={marco.id} className="app-conta-registro text-sm text-navy/80">
                      <p>{marco.texto}</p>
                      {marco.data ? (
                        <p className="mt-1 text-xs text-navy/45">
                          {new Date(marco.data).toLocaleDateString("pt-BR")}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </div>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
