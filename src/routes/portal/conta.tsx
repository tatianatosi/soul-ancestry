import { UserRound, ShieldCheck, ChevronDown } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { planoPublicado } from "@/lib/plano-publicacao";
import { assinaturaPublicada } from "@/lib/assinatura-app";
import { publicacoesParaCliente } from "@/lib/projecoes-cliente";
import { PortalShell, usePortal, PortalCarregando } from "@/components/portal/portal-shell";
import { LinkPortal, usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { AvisoFalhaConexao } from "@/components/portal/aviso-falha-conexao";
import { MENSAGEM_INSTABILIDADE_FINANCEIRA } from "@/lib/portal-resiliencia";
import { WHATSAPP_ESPECIALISTA } from "@/lib/contato-especialista";
import { CLIENTE_DEMO_NOME } from "@/lib/portal-demo-sophia";
import { Button } from "@/components/ui/button";
import { CartaoEditorial, dataCurta, iniciais } from "@/components/portal/elementos-mockup";

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
   const titularPrevia = vivo.data && "titularNome" in vivo.data ? (vivo.data.titularNome as string | null) : null;
   // 13/10/2026 (hotfix autorizado): o nome fixo da demo só entra na demo
   // institucional; prévia real mostra só o nome vindo do cadastro do caso.
   const titular = data?.cliente?.nome ?? (previaDemo ? CLIENTE_DEMO_NOME : null);
   const titularExibido = titular ?? titularPrevia;
   const codigoCaso = previaDemo ? null : (previa?.identidade?.codigo ?? null);
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

  const resumo = vivo.data?.resumoCaso ?? null;
  const perfil = resumo?.perfil ?? null;
  const membroDesde = dataCurta(resumo?.membroDesde);
  /*
   * Histórico de atividades (13/10/2026): só marcos aprovados para a família
   * (case_timeline_events) e marcos/entregas publicados no App, com data.
   */
  const atividades = [
    ...(vivo.data?.historico ?? []).map((m) => ({ id: `h-${m.id}`, rotulo: "Marco da jornada", texto: m.texto, data: m.data ?? null })),
    ...publicacoesParaCliente(
      (vivo.data?.projecoes ?? []).filter((p) => p.projection_type === "marco" || p.projection_type === "microentrega"),
    ).map((p) => ({ id: `p-${p.id}`, rotulo: p.tipoRotulo, texto: p.conteudo, data: p.publicadoEm ?? null })),
  ]
    .filter((a) => a.data)
    .sort((a, b) => String(b.data).localeCompare(String(a.data)));

  const proximaAcao = vivo.data?.proximaAcao ?? null;
  const alertaAcionavel =
    proximaAcao &&
    (proximaAcao.destino === "/portal/documentos" || proximaAcao.destino === "/portal/conta")
      ? proximaAcao
      : null;

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
                   {perfil?.nome ?? titularExibido ? iniciais(perfil?.nome ?? titularExibido) : <UserRound className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Meu perfil</p>
                  <h2 className="break-words font-serif text-xl text-navy">{perfil?.nome ?? titularExibido ?? "Não registrado"}</h2>
                </div>
              </div>
               <p className="mt-3 text-sm text-navy/65">Um espaço para cuidar da sua história e acompanhar as novidades da sua família.</p>
               <dl className="mt-3 grid grid-cols-1 gap-x-4 md:grid-cols-2">
                 {codigoCaso ? (
                <div className="border-b border-border py-3" data-conta-codigo>
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Projeto familiar</dt>
                  <dd className="text-sm text-navy">{codigoCaso}</dd>
                </div>
                 ) : null}
                 {titularExibido ? (
                <div className="border-b border-border py-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Titular</dt>
                  <dd className="text-sm text-navy">{titularExibido}</dd>
                </div>
                 ) : null}
                <div className="border-b border-border py-3" data-conta-email>
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">E-mail</dt>
                  <dd className="break-all text-sm text-navy">{perfil?.email ?? "Não registrado"}</dd>
                </div>
                <div className="border-b border-border py-3" data-conta-whatsapp-titular>
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">WhatsApp</dt>
                  <dd className="text-sm text-navy">{perfil?.telefone ?? "Não registrado"}</dd>
                </div>
                <div className="border-b border-border py-3" data-conta-membro-desde>
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Membro desde</dt>
                  <dd className="text-sm text-navy">{membroDesde ?? "Não registrado"}</dd>
                </div>
                 {paisInteresse ? (
                <div className="border-b border-border py-3">
                   <dt className="text-[11px] uppercase tracking-widest text-navy/50">Origem de interesse</dt>
                  <dd className="text-sm text-navy">{paisInteresse}</dd>
                </div>
                 ) : null}
                 {(vivo.data?.casoAtivoId ?? previa?.identidade?.caseId) === "a11a0000-0000-4000-8000-000000000002" ? (
                <div className="border-b border-border py-3" data-conta-modalidade>
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Modalidade</dt>
                  <dd className="text-sm text-navy">Projeto Familiar (3 assinaturas ativas)</dd>
                </div>
                 ) : null}
               </dl>
              <p className="mt-3 text-xs text-navy/55">
                  Se alguma informação mudar, avise a equipe pelo canal que você já utiliza.
              </p>
            </section>

            <section className="app-v11-faixa app-conta-atendimento">
              <details open className="app-conta-contato"><summary className="flex min-h-11 cursor-pointer items-center gap-2 font-serif text-xl text-navy"><ShieldCheck className="h-5 w-5" aria-hidden="true" /><span className="flex-1">Estamos por perto</span><ChevronDown className="app-detalhe-seta h-4 w-4" aria-hidden="true" /></summary>
              <p className="mt-2 text-sm text-navy/75">{acompanhamento}</p>
              <Button asChild variant="outline" className="mt-3 h-auto min-h-11 whitespace-normal text-left"><a href={WHATSAPP_ESPECIALISTA.url} target="_blank" rel="noopener noreferrer" data-conta-whatsapp>Falar com a Especialista no WhatsApp · {WHATSAPP_ESPECIALISTA.rotulo}</a></Button>
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
                </>
               ) : (
                /*
                  07/10/2026 — este espaço nunca some: antes a seção inteira
                  desaparecia sem assinatura nem upsell publicados, e ninguém
                  via onde o Desk publicaria isso. O estado vazio é sempre
                  editável/publicável do Desk, nunca hardcoded aqui.
                */
                <div className="mt-2" data-conta-assinatura-vazio>
                  <CartaoEditorial texto="A assinatura da sua família terá seu lugar aqui quando for compartilhada pela equipe." />
                </div>
               )}
             </section>

            {/* 12/10/2026: com falha de leitura, nenhuma seção afirma vazio. */}
            {vivo.isError ? null : (
            <>
            <section data-conta-plano className="app-v11-faixa">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Meu plano</h2>
                {plano ? (
                  <span
                    data-conta-plano-situacao
                    className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-navy/70"
                  >
                    {plano.situacao ?? "Não registrado"}
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
                <div className="mt-2" data-conta-plano-vazio>
                  <CartaoEditorial texto="O plano da sua família terá seu lugar aqui quando for compartilhado pela equipe." />
                </div>
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
                  <div className="mt-3">
                   <CartaoEditorial texto="Os recados da equipe terão seu lugar aqui." />
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
            <section data-conta-marcos data-conta-historico className="app-v11-faixa">
              <h2 className="font-serif text-xl text-navy">Histórico de atividades</h2>
              {atividades.length === 0 ? (
                <div className="mt-3">
                  <CartaoEditorial texto="As atividades da sua jornada terão seu lugar aqui à medida que forem liberadas para a família." />
                </div>
              ) : (
                <ol className="mt-3 space-y-0 border-l-2 border-gold/40 pl-4">
                  {atividades.map((a) => (
                    <li key={a.id} className="relative py-2.5">
                      <span aria-hidden="true" className="absolute -left-[1.4rem] top-4 h-2.5 w-2.5 rounded-full bg-gold" />
                      <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">
                        {dataCurta(a.data)} · {a.rotulo}
                      </p>
                      <p className="mt-0.5 line-clamp-3 whitespace-pre-line text-sm text-navy/85">{a.texto}</p>
                    </li>
                  ))}
                </ol>
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
