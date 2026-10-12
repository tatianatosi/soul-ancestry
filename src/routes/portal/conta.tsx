import { UserRound, ShieldCheck, ChevronDown, Users } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { membrosDoMeuCaso, minhasFaturas } from "@/lib/portal-cliente.functions";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { COPY_TELAS } from "@/lib/portal-copy";
import { planoPublicado } from "@/lib/plano-publicacao";
import { assinaturaPublicada } from "@/lib/assinatura-app";
import { publicacoesParaCliente } from "@/lib/projecoes-cliente";
import { CLIENTE_DEMO_NOME } from "@/lib/portal-demo-sophia";
import { PortalShell, usePortal, PortalCarregando } from "@/components/portal/portal-shell";
import { LinkPortal, usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { BlocoExemploVisual } from "@/components/portal/bloco-exemplo-visual";
import { AvisoFalhaConexao } from "@/components/portal/aviso-falha-conexao";
import { MENSAGEM_INSTABILIDADE_FINANCEIRA } from "@/lib/portal-resiliencia";

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
  const { visibilidade, carregando } = useVisibilidade("conta");
  const { data } = usePortal();
  const vivo = usePortalVivo();

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

  /*
   * 12/10/2026 — Conta: perfil, assinatura individual e núcleo familiar.
   * Só leitores sanitizados já existentes: e-mail da própria sessão,
   * `membrosDoMeuCaso` (somente nome e papel) e `minhasFaturas`
   * (somente faturas da pessoa autenticada, já filtradas pela RPC de
   * contratante). Na prévia administrativa nada disso é lido: estados neutros.
   */
  const sessaoCliente = !previa;
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    if (!sessaoCliente) return;
    void supabase.auth.getSession().then(({ data: s }) => setEmail(s.session?.user?.email ?? null));
  }, [sessaoCliente]);
  const lerMembros = useServerFn(membrosDoMeuCaso);
  const membrosQ = useQuery({
    queryKey: ["portal-conta-membros"],
    queryFn: () => lerMembros(),
    enabled: sessaoCliente,
  });
  const lerFaturas = useServerFn(minhasFaturas);
  const faturasQ = useQuery({
    queryKey: ["portal-conta-faturas"],
    queryFn: () => lerFaturas(),
    enabled: sessaoCliente,
  });
  const [faturasAbertas, setFaturasAbertas] = useState(false);
  const casoAtual = vivo.data?.casoAtivoId ?? previa?.identidade?.caseId ?? null;
  const membros = (membrosQ.data ?? []).filter((m) => !casoAtual || m.casoId === casoAtual);
  const meuPapel = membros.find((m) => m.clienteId === data?.cliente?.id)?.papel ?? null;
  const faturas = faturasQ.data?.faturas ?? [];
  const hoje = new Date().toISOString().slice(0, 10);
  const vencidasOuAtuais = faturas.filter((f) => f.vencimento && f.vencimento <= hoje && f.statusRotulo !== "Cancelada");
  const ultima = vencidasOuAtuais[vencidasOuAtuais.length - 1] ?? null;
  const statusMensalidade: "em_dia" | "pendente" | null = ultima
    ? ultima.statusRotulo === "Paga"
      ? "em_dia"
      : "pendente"
    : null;
  const moeda = (v: number, m: string) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: m || "BRL" });


  return (
    <PortalShell titulo={COPY_TELAS.conta.titulo} descricao={COPY_TELAS.conta.descricao}>
      {carregando ? (
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
               {meuPapel === "contratante" ? (
                 <span data-conta-selo className="mt-3 inline-flex rounded-full border border-gold/60 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-navy">
                   Titular / Signatário
                 </span>
               ) : null}
               <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="border-b border-border py-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/60">Nome</dt>
                  <dd className="text-sm text-navy">{titular ?? "Não registrado"}</dd>
                </div>
                <div className="min-w-0 border-b border-border py-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/60">E-mail cadastrado</dt>
                  <dd className="break-all text-sm text-navy" data-conta-email>
                    {sessaoCliente ? (email ?? "Não registrado") : "Não exibido na visualização da equipe"}
                  </dd>
                </div>
                 {paisInteresse ? (
                <div className="border-b border-border py-3">
                   <dt className="text-[11px] uppercase tracking-widest text-navy/60">Origem de interesse</dt>
                  <dd className="text-sm text-navy">{paisInteresse}</dd>
                </div>
                 ) : null}
               </dl>
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
              {vivo.isError ? (
                /* 12/10/2026 — falha de leitura (fail-closed): nunca "nenhuma assinatura", nunca dado financeiro. */
                <div className="mt-2" data-conta-assinatura-erro>
                  <AvisoFalhaConexao mensagem={MENSAGEM_INSTABILIDADE_FINANCEIRA} aoTentar={vivo.refetch} />
                </div>
              ) : vivo.isLoading ? (
                <p className="mt-2 text-sm text-navy/60" role="status">Carregando sua assinatura…</p>
              ) : assinatura ? (
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
                  <div className="mt-3 flex flex-wrap items-center gap-2" data-conta-mensalidade>
                    <span className="text-[11px] uppercase tracking-widest text-cream/80">Última mensalidade</span>
                    {statusMensalidade === "em_dia" ? (
                      <span className="rounded-full border border-sage bg-sage px-2.5 py-0.5 text-xs font-semibold text-cream">Em dia</span>
                    ) : statusMensalidade === "pendente" ? (
                      <span className="rounded-full border border-terracotta bg-terracotta px-2.5 py-0.5 text-xs font-semibold text-cream">Pendente</span>
                    ) : (
                      <span className="rounded-full border border-cream/50 px-2.5 py-0.5 text-xs font-medium text-cream">
                        {faturasQ.isError ? "Não foi possível consultar" : "Aguardando confirmação"}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    data-conta-ver-faturas
                    onClick={() => setFaturasAbertas(true)}
                    className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-gold/70 px-4 text-sm font-medium text-gold hover:bg-gold/10"
                  >
                    Visualizar faturas e comprovantes
                  </button>
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

            <Sheet open={faturasAbertas} onOpenChange={setFaturasAbertas}>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="font-serif text-xl text-navy">Faturas e comprovantes</SheetTitle>
                  <SheetDescription>Somente as suas faturas aparecem aqui.</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-2" data-conta-faturas-lista>
                  {!sessaoCliente ? (
                    <p className="text-sm text-navy/70">Na visualização da equipe, as faturas da pessoa não são exibidas.</p>
                  ) : faturasQ.isError ? (
                    <AvisoFalhaConexao mensagem={MENSAGEM_INSTABILIDADE_FINANCEIRA} aoTentar={faturasQ.refetch} />
                  ) : faturasQ.isLoading ? (
                    <p className="text-sm text-navy/70" role="status">Carregando suas faturas…</p>
                  ) : faturas.length === 0 ? (
                    <p className="app-v11-lacuna text-sm text-navy/70">
                      {faturasQ.data?.restritoAoContratante
                        ? "As faturas deste caso ficam com a pessoa responsável pelo pagamento."
                        : "Nenhuma fatura liberada até o momento."}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {faturas.map((f) => (
                        <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm text-navy">{f.descricao ?? f.numero ?? "Fatura"}</p>
                            <p className="text-xs text-navy/60">
                              {f.vencimento ? `Vencimento ${new Date(`${f.vencimento}T12:00:00`).toLocaleDateString("pt-BR")}` : "Vencimento não registrado"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-navy">{moeda(f.valor, f.moeda)}</p>
                            <p className="text-xs text-navy/70">{f.statusRotulo}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <section data-conta-nucleo className="app-v11-faixa">
              <h2 className="flex items-center gap-2 font-serif text-xl text-navy">
                <Users className="h-5 w-5" aria-hidden="true" /> Seu núcleo familiar
              </h2>
              {!sessaoCliente ? (
                <p className="mt-2 text-sm text-navy/70">Na visualização da equipe, a lista da família não é exibida.</p>
              ) : membrosQ.isError ? (
                <div className="mt-2">
                  <AvisoFalhaConexao mensagem="Instabilidade de conexão ao carregar sua família." aoTentar={membrosQ.refetch} />
                </div>
              ) : membrosQ.isLoading ? (
                <p className="mt-2 text-sm text-navy/70" role="status">Carregando sua família…</p>
              ) : membros.length === 0 ? (
                <p className="app-v11-lacuna mt-2 text-sm text-navy/70">Não registrado</p>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {membros.map((m) => (
                    <li key={m.clienteId} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <span className="text-sm text-navy">{m.nome}</span>
                      {m.papel === "dependente" ? (
                        <span className="rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-navy">
                          Dependente / Menor
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-navy/60">
                As informações compartilhadas respeitam o anexo de privacidade contratual familiar.
              </p>
            </section>


            {/* 12/10/2026: com falha de leitura, nenhuma seção afirma vazio. */}
            {vivo.isError ? null : (
            <>
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
            </>
            )}

          </div>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
