/**
 * Jurídico & Contratos no shell de go-live.
 *
 * Três blocos analíticos da prancha v3: completude formal por instrumento,
 * riscos/prazos e pipeline proposta → escopo → rascunho → revisão humana →
 * pronto para assinatura → registrado.
 *
 * Só apresentação sobre o que o motor aprovado já devolve para o caso
 * canônico. A proposta Canva é referência de apresentação; o contrato usa o
 * escopo aprovado. Sem catálogo, SKU, preço provisório, homologação,
 * contrato de teste ou dado fictício. Nenhuma assinatura, cobrança ou ação
 * externa é criada aqui.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, FaixaKpis, GoLiveShell, GradeDesk, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { Barras, BarrasPercentual, Escada } from "@/components/golive/graficos";
import { Button } from "@/components/ui/button";
import {
  completudeFormal,
  etapaAtual,
  pipelineJuridico,
  riscosEPrazos,
  temInstrumento,
} from "@/lib/golive-juridico";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/juridico")({
  head: () => ({
    meta: [
      { title: "Validação jurídica da trilha — Go-live Clube Ancestral" },
      { name: "description", content: "Completude formal, riscos e pipeline de contrato do caso do piloto." },
      { property: "og:title", content: "Validação jurídica da trilha — Go-live Clube Ancestral" },
      { property: "og:description", content: "Proposta, escopo, contrato, anexos e OS do caso do piloto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JuridicoGoLive,
});

function JuridicoGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const propostas = caso?.propostas ?? [];
  const escopo = caso?.escopo ?? [];
  const contratos = caso?.contratos ?? [];
  const anexos = caso?.anexos ?? [];
  const ordens = caso?.ordensServico ?? [];

  const instrumentos = { propostas, escopo, contratos, anexos, ordens };
  const completude = completudeFormal(instrumentos);
  const riscos = riscosEPrazos(instrumentos);
  const pipeline = pipelineJuridico(instrumentos);
  const atual = etapaAtual(pipeline);
  const temDado = temInstrumento(instrumentos);
  const emRevisao = contratos.filter((c) => /review|revis|pending/i.test(c.status ?? "")).length;
  const pendenciasFormais = riscos.find((r) => r.rotulo === "Revisão pendente")?.valor ?? 0;
  const assinados = contratos.filter((c) => Boolean(c.assinadoEm) || /signed|assinad/i.test(c.status ?? "")).length;
  const anexosPendentes = riscos.find((r) => r.rotulo === "Anexo pendente")?.valor ?? 0;

  return (
    <GoLiveShell
      titulo="Validação jurídica da trilha"
      descricao="Conferência, riscos e validação humana dos instrumentos."
    >
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <FaixaKpis itens={[
        { rotulo: "Em revisão", valor: emRevisao, tom: emRevisao ? "dourado" : "cinza" },
        { rotulo: "Pendências formais", valor: pendenciasFormais, tom: pendenciasFormais ? "terracota" : "cinza" },
        { rotulo: "Assinados", valor: assinados, tom: assinados ? "verde" : "cinza" },
        { rotulo: "Anexos pendentes", valor: anexosPendentes, tom: anexosPendentes ? "terracota" : "cinza" },
      ]} />

      <GradeDesk>
      <Bloco titulo="1. Completude formal por instrumento">
        {temDado ? (
          <BarrasPercentual titulo="Completude formal" dados={completude} />
        ) : (
          <Vazio
            cta={
              <Link to="/golive/formalizacao">
                <Button size="sm">Abrir Formalização</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="2. Riscos e prazos">
        {temDado ? (
          <Barras titulo="Pendências formais" dados={riscos} />
        ) : (
          <Vazio
            cta={
              <Link to="/contratos">
                <Button size="sm">Abrir contratos</Button>
              </Link>
            }
          />
        )}
      </Bloco>
      </GradeDesk>

      <GradeDesk>
      <Bloco titulo="3. Pipeline do contrato">
        {temDado ? (
          <>
            <Escada etapas={pipeline} />
            <p className="text-xs text-navy/55">
              {atual ? `Etapa atual: ${atual}.` : "Todas as etapas registradas."}
            </p>
          </>
        ) : (
          <Vazio
            cta={
              <Link to="/propostas">
                <Button size="sm">Abrir propostas</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="Proposta">
        {propostas.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {propostas.map((p) => (
              <li key={p.id} className="break-words">
                Versão {p.versao ?? 1} — {humano(p.status)}
                {p.enviadaEm ? <span className="text-navy/55"> · enviada em {dataHumana(p.enviadaEm)}</span> : null}
                {p.aprovadaEm ? <span className="text-navy/55"> · aprovada em {dataHumana(p.aprovadaEm)}</span> : null}
              </li>
            ))}
            <li className="text-xs text-navy/55">Apresentação usada como referência; o contrato segue o escopo aprovado.</li>
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/propostas">
                <Button size="sm">Abrir propostas</Button>
              </Link>
            }
          />
        )}
      </Bloco>
      </GradeDesk>

      <Bloco titulo="Escopo aprovado">
        {escopo.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {escopo.map((i) => (
              <li key={i.id} className="break-words">
                {i.titulo}
                <span className="text-navy/55">
                  {" "}
                  — {humano(i.status, "sem situação")}
                  {i.exigeRevisaoHumana ? " · exige revisão humana" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/golive/formalizacao">
                <Button size="sm">Abrir Formalização</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <GradeDesk>
      <Bloco titulo="Contrato">
        {contratos.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {contratos.map((c) => (
              <li key={c.id} className="break-words">
                {c.numero ? `${c.numero} — ` : ""}
                {c.titulo}{" "}
                <span className="text-navy/55">
                  · {humano(c.status, "sem situação registrada")}
                  {c.assinadoEm ? ` · assinado em ${dataHumana(c.assinadoEm)}` : ""}
                  {!c.assinadoEm && c.liberadoParaEnvioEm
                    ? ` · liberado para assinatura em ${dataHumana(c.liberadoParaEnvioEm)}`
                    : ""}
                </span>
                {/* Revisão em curso: revisora, versão e pendências já gravadas. */}
                <div className="mt-1 space-y-0.5 text-xs text-navy/70">
                  <div>Revisora: {c.revisora ?? "não registrada"}</div>
                  <div>Versão: {c.versao ?? "não registrada"}</div>
                  {c.objetivo ? <div>Objetivo: {c.objetivo}</div> : null}
                  {c.pendencias.length ? (
                    <div className="text-[var(--terracota,#9A3A2F)]">
                      Pendências: {c.pendencias.map((p) => humano(p)).join(" · ")}
                    </div>
                  ) : (
                    <div>Sem pendências registradas</div>
                  )}
                  <div>
                    Assinatura:{" "}
                    {c.assinadoEm
                      ? `${dataHumana(c.assinadoEm)}${c.assinaturaReferencia ? ` · referência ${c.assinaturaReferencia}` : ""}`
                      : "não assinada"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/contratos">
                <Button size="sm">Abrir contratos</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="Anexos e Ordem de Serviço">
        {anexos.length || ordens.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {anexos.map((a) => (
              <li key={a.id} className="break-words">
                {a.codigo ? `${a.codigo} — ` : ""}
                {a.titulo}{" "}
                <span className="text-navy/55">
                  · {humano(a.status, "sem situação registrada")}
                  {a.obrigatorio ? " · obrigatório" : ""}
                  {a.revisadoEm ? ` · revisado em ${dataHumana(a.revisadoEm)}` : ""}
                </span>
              </li>
            ))}
            {ordens.map((o) => (
              <li key={o.id} className="break-words">
                {o.numero ?? "Ordem de serviço"}{" "}
                <span className="text-navy/55">
                  · {humano(o.status, "sem situação registrada")}
                  {o.inicio ? ` · início ${dataHumana(o.inicio)}` : ""}
                  {o.fim ? ` · término ${dataHumana(o.fim)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/contratos">
                <Button size="sm">Abrir contratos</Button>
              </Link>
            }
          />
        )}
      </Bloco>
      </GradeDesk>
    </GoLiveShell>
  );
}
