import { SuperficieGoLive } from "@/components/golive/superficie";
/**
 * Financeiro no shell de go-live.
 *
 * Três blocos analíticos da prancha v3: valores contratado/recebido/a
 * receber/vencido, recebimento mensal confirmado e situação das faturas.
 *
 * Só leitura do que já está gravado no caso canônico. Nada é cobrado,
 * integrado ou estimado; sem catálogo, SKU, preço provisório ou dado
 * fictício. Nenhuma cobrança, assinatura ou envio externo é disparado aqui.
 */
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, FaixaKpis, GradeDesk, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Linha as LinhaSerie, Rosca } from "@/components/golive/graficos";
import {
  origemDaCondicao,
  planoDeParcelas,
  recebimentoPorMes,
  situacaoDasFaturas,
  totaisFinanceiros,
} from "@/lib/golive-analitico";
import { useGoLive } from "@/components/golive/dados";
import { Acao, Acoes } from "@/components/golive/acoes";
import { Button } from "@/components/ui/button";
import { registrarFaturaGoLive } from "@/lib/golive-escritores.functions";
import { dataHumana, humano } from "@/lib/rotulos-golive";


const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function FinanceiroGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const faturas = caso?.faturas ?? [];
  const pagamentos = caso?.pagamentos ?? [];
  const totais = totaisFinanceiros(faturas, pagamentos);
  const recebimento = recebimentoPorMes(faturas, pagamentos, 6);
  const situacao = situacaoDasFaturas(faturas);
  /* Origem da condição: call realizada gravada no lead do próprio caso. */
  const origem = origemDaCondicao(caso?.lead ?? null);
  const parcelas = planoDeParcelas(faturas, caso?.lead ?? null);
  const proposta = caso?.propostas[0] ?? null;
  const contrato = caso?.contratos[0] ?? null;



  const contratoAssinado = (caso?.contratos ?? []).some((c) => c.status === "signed" || Boolean(c.assinadoEm));
  const novaFatura = useServerFn(registrarFaturaGoLive);

  const acaoFatura = contratoAssinado ? (
    <Acao
      rotulo="Registrar fatura autorizada"
      titulo="Fatura só com autorização"
      variante="outline"
      campos={[
        { nome: "numero", rotulo: "Número da fatura", obrigatorio: true },
        { nome: "valor", rotulo: "Valor (R$)", tipo: "numero", obrigatorio: true },
        { nome: "vencimento", rotulo: "Vencimento", tipo: "data" },
        { nome: "descricao", rotulo: "Condição combinada", tipo: "area" },
        {
          nome: "autorizacao",
          rotulo: "Quem autorizou e quando",
          obrigatorio: true,
          ajuda: "Sem autorização declarada, a fatura não é registrada. Nada é cobrado automaticamente.",
        },
      ]}
      aoConfirmar={(v) =>
        novaFatura({
          data: {
            numero: v["numero"] ?? "",
            valor: Number(v["valor"] ?? 0),
            vencimento: v["vencimento"] ?? "",
            descricao: v["descricao"] ?? "",
            autorizacao: v["autorizacao"] ?? "",
          },
        })
      }
      confirmacao="Fatura registrada com a autorização declarada."
    />
  ) : null;

  const irParaContratos = (
    <Link to="/contratos">
      <Button size="sm">Abrir contratos</Button>
    </Link>
  );

  return (
    <SuperficieGoLive titulo="Financeiro" descricao="Valores, recebimentos confirmados e situação das faturas.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <FaixaKpis itens={[
        { rotulo: "Contratado", valor: MOEDA.format(totais.contratado), tom: totais.contratado ? "azul" : "cinza" },
        { rotulo: "Recebido confirmado", valor: MOEDA.format(totais.pago), tom: totais.pago ? "verde" : "cinza" },
        { rotulo: "Em aberto", valor: MOEDA.format(totais.emAberto), tom: totais.emAberto ? "dourado" : "cinza" },
        { rotulo: "Vencido", valor: MOEDA.format(totais.vencido), tom: totais.vencido ? "terracota" : "cinza" },
      ]} />

      <GradeDesk>
      <Bloco titulo="1. Valores do caso">
        {faturas.length ? (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { rotulo: "Contratado", valor: totais.contratado },
              { rotulo: "Recebido", valor: totais.pago },
              { rotulo: "A receber", valor: totais.emAberto },
              { rotulo: "Vencido", valor: totais.vencido },
            ].map((i) => (
              <div key={i.rotulo} className="min-w-0 rounded-xl border border-navy/10 bg-cream/60 p-3">
                <dt className="text-[11px] uppercase tracking-wide text-navy/50">{i.rotulo}</dt>
                <dd className="break-words text-sm font-semibold text-navy">{MOEDA.format(i.valor)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>

      <Bloco titulo="2. Recebimento por mês">
        {recebimento.length ? (
          <>
            <LinhaSerie titulo="Recebimento confirmado" dados={recebimento} />
            <p className="text-xs text-navy/55">Só pagamentos com data de confirmação registrada.</p>
          </>
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>
      </GradeDesk>

      <GradeDesk>
      <Bloco titulo="3. Situação das faturas">
        {situacao.length ? (
          <Rosca titulo="Situação das faturas" dados={situacao} />
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>

      <Bloco titulo="Plano de parcelas e a conversa que originou">
        {origem ? (
          <p className="text-sm text-navy">
            Conversa de descoberta realizada em {dataHumana(origem.callEm)}
            {origem.resultado ? ` · resultado: ${humano(origem.resultado, "sem resultado registrado")}` : ""}
            {origem.status ? ` · ${humano(origem.status, "")}` : ""}
            {origem.resumo ? <span className="block text-navy/70">{origem.resumo}</span> : null}
          </p>
        ) : (
          <p className="text-xs text-navy/55">
            Este caso ainda não tem uma conversa de descoberta registrada com data e resultado.
          </p>
        )}
        {parcelas.length ? (
          <ul className="mt-3 space-y-1 text-sm text-navy">
            {parcelas.map((p, i) => (
              <li key={p.id} className="break-words">
                Parcela {i + 1}
                {p.numero ? ` · ${p.numero}` : ""}
                {typeof p.valor === "number" ? ` — ${MOEDA.format(p.valor)}` : ""}{" "}
                <span className="text-navy/55">
                  · {p.vencimento ? `vence ${dataHumana(p.vencimento)}` : "sem vencimento registrado"} · {p.situacao}
                  {p.diasAposCall !== null ? ` · ${p.diasAposCall} dias após a conversa` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>
      </GradeDesk>

      <GradeDesk>
      <Bloco titulo="Faturas">
        {acaoFatura ? <Acoes>{acaoFatura}</Acoes> : (
          <p className="text-xs text-navy/55">
            A fatura só é registrada depois da assinatura do contrato e com autorização declarada.
          </p>
        )}
        {faturas.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {faturas.map((f) => (
              <li key={f.id} className="break-words">
                {f.numero ?? "Cobrança"}
                {typeof f.valor === "number" ? ` — ${MOEDA.format(f.valor)}` : ""}{" "}
                <span className="text-navy/55">
                  · {humano(f.status, "sem situação registrada")}
                  {f.vencimento ? ` · vence ${dataHumana(f.vencimento)}` : "· sem vencimento registrado"}
                </span>
                {/* Autorização declarada no registro e pagamento só se confirmado. */}
                <div className="mt-1 space-y-0.5 text-xs text-navy/70">
                  <div>
                    Autorização:{" "}
                    {f.descricao?.match(/Autoriza[çc][ãa]o:\s*(.+)$/i)?.[1] ?? "não registrada"}
                  </div>
                  <div>
                    Pagamento:{" "}
                    {pagamentos.some((p) => p.faturaId === f.id && p.pagoEm)
                      ? `confirmado em ${dataHumana(pagamentos.find((p) => p.faturaId === f.id && p.pagoEm)!.pagoEm)}`
                      : "sem pagamento confirmado"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>

      <Bloco titulo="Pagamentos">
        {pagamentos.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {pagamentos.map((p) => (
              <li key={p.id} className="break-words">
                {faturas.find((f) => f.id === p.faturaId)?.numero ?? "Cobrança"}
                {typeof p.valor === "number" ? ` — ${MOEDA.format(p.valor)}` : ""}{" "}
                <span className="text-navy/55">
                  · {humano(p.metodo, "forma não informada")}
                  {p.pagoEm ? ` · recebido em ${dataHumana(p.pagoEm)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>
      </GradeDesk>

      {/* Cards de contexto: mesma leitura já carregada, sem novo cálculo. */}
      <GradeDesk>
        <Bloco titulo="Proposta aprovada">
          {proposta ? (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Situação" valor={humano(proposta.status)} />
              <Campo rotulo="Valor" valor={typeof proposta.valor === "number" ? MOEDA.format(proposta.valor) : null} />
              <Campo rotulo="Aprovada em" valor={proposta.aprovadaEm ? dataHumana(proposta.aprovadaEm) : null} />
              <Campo rotulo="Forma de pagamento" valor={humano(proposta.formaPagamento)} />
            </dl>
          ) : (
            <Vazio cta={irParaContratos} />
          )}
        </Bloco>

        <Bloco titulo="Contrato vinculado">
          {contrato ? (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Número" valor={contrato.numero} />
              <Campo rotulo="Situação" valor={humano(contrato.status)} />
              <Campo rotulo="Assinatura" valor={contrato.assinadoEm ? dataHumana(contrato.assinadoEm) : "Não registrada"} />
              <Campo rotulo="Versão" valor={contrato.versao ? `v${contrato.versao}` : null} />
            </dl>
          ) : (
            <Vazio cta={irParaContratos} />
          )}
        </Bloco>
      </GradeDesk>

    </SuperficieGoLive>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="text-sm break-words text-navy">{valor ?? "Sem itens nesta etapa"}</dd>
    </div>
  );
}
