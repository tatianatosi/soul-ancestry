/**
 * Financeiro no shell de go-live.
 *
 * Valor e condição são registro manual; faturas, pagamentos e situação vêm
 * do que já está gravado no caso canônico. Nada é cobrado, nada é integrado,
 * nada é estimado. Sem catálogo, SKU ou preço técnico.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Rosca } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { registrarFaturaGoLive, registrarPagamentoGoLive } from "@/lib/golive-escritores.functions";

export const Route = createFileRoute("/_authenticated/golive/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Go-live Clube Ancestral" },
      { name: "description", content: "Valor, condição, faturas e pagamentos registrados do caso do piloto." },
      { property: "og:title", content: "Financeiro — Go-live Clube Ancestral" },
      { property: "og:description", content: "Valor, condição, faturas e pagamentos do caso do piloto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FinanceiroGoLive,
});

const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function FinanceiroGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const faturas = caso?.faturas ?? [];
  const comValor = faturas.filter((f) => typeof f.valor === "number");
  const total = comValor.reduce((s, f) => s + (f.valor as number), 0);
  const pagas = faturas.filter((f) => /pag|quitad|liquidad/i.test(f.status ?? ""));

  const novaFatura = useServerFn(registrarFaturaGoLive);
  const novoPagamento = useServerFn(registrarPagamentoGoLive);

  const acaoFatura = (
    <Acao
      rotulo="Emitir fatura"
      titulo="Cobrança do caso"
      variante="outline"
      campos={[
        { nome: "numero", rotulo: "Número", obrigatorio: true },
        { nome: "valor", rotulo: "Valor (R$)", tipo: "numero", obrigatorio: true },
        { nome: "vencimento", rotulo: "Vencimento", tipo: "data" },
        { nome: "descricao", rotulo: "Descrição" },
      ]}
      aoConfirmar={(v) =>
        novaFatura({
          data: {
            numero: v["numero"] ?? "",
            valor: Number(v["valor"] ?? 0),
            vencimento: v["vencimento"] ?? "",
            descricao: v["descricao"] ?? "",
          },
        })
      }
      confirmacao="Fatura registrada. Nenhuma cobrança foi enviada."
    />
  );

  const acaoPagamento = (
    <Acao
      rotulo="Registrar pagamento manual"
      titulo="Pagamento recebido"
      variante="outline"
      campos={[
        {
          nome: "faturaId",
          rotulo: "Fatura",
          tipo: "escolha",
          obrigatorio: true,
          opcoes: faturas.map((f) => ({ valor: f.id, rotulo: f.numero ?? "Cobrança" })),
        },
        { nome: "valor", rotulo: "Valor (R$)", tipo: "numero", obrigatorio: true },
        { nome: "metodo", rotulo: "Forma de pagamento", padrao: "pix" },
        { nome: "pagoEm", rotulo: "Data do pagamento", tipo: "data" },
      ]}
      aoConfirmar={(v) =>
        novoPagamento({
          data: {
            faturaId: v["faturaId"] ?? "",
            valor: Number(v["valor"] ?? 0),
            metodo: v["metodo"] ?? "",
            pagoEm: v["pagoEm"] ?? "",
          },
        })
      }
      confirmacao="Pagamento registrado à mão."
    />
  );


  return (
    <GoLiveShell titulo="Financeiro" descricao="Valor, condição, faturas e pagamentos — registro manual.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <Bloco titulo="Valor e condição">
        {comValor.length ? (
          <p className="text-sm text-navy">
            {MOEDA.format(total)} em {comValor.length} cobrança{comValor.length === 1 ? "" : "s"} registrada
            {comValor.length === 1 ? "" : "s"}.
          </p>
        ) : (
          <Vazio
            cta={
              <Link to="/financeiro">
                <Button size="sm">Registrar valor e condição</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      {faturas.length ? (
        <Bloco titulo="Situação das cobranças">
          <Rosca
            titulo="Situação das cobranças"
            dados={Object.entries(
              faturas.reduce<Record<string, number>>((acc, f) => {
                const chave = humano(f.status, "Sem situação");
                acc[chave] = (acc[chave] ?? 0) + 1;
                return acc;
              }, {}),
            ).map(([rotulo, valor]) => ({ rotulo, valor }))}
          />
        </Bloco>
      ) : null}

      <Bloco titulo="Faturas">
        {faturas.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {faturas.map((f) => (
              <li key={f.id} className="break-words">
                {f.numero ?? "Cobrança"}
                {typeof f.valor === "number" ? ` — ${MOEDA.format(f.valor)}` : ""}{" "}
                <span className="text-navy/55">
                  · {humano(f.status, "sem situação registrada")}
                  {f.vencimento ? ` · vence ${dataHumana(f.vencimento)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/financeiro">
                <Button size="sm">Emitir fatura</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="Pagamentos">
        {pagas.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {pagas.map((f) => (
              <li key={f.id} className="break-words">
                {f.numero ?? "Cobrança"}
                {typeof f.valor === "number" ? ` — ${MOEDA.format(f.valor)}` : ""}{" "}
                <span className="text-navy/55">· {humano(f.status)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/financeiro">
                <Button size="sm">Registrar pagamento manual</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="Situação do caso">
        <ul className="space-y-1 text-sm text-navy">
          <li>
            Contrato assinado:{" "}
            <span className={caso?.caso.contratoAssinado ? "text-navy/70" : "text-[var(--terracota,#9A3A2F)]"}>
              {caso?.caso.contratoAssinado ? "sim" : "ainda não"}
            </span>
          </li>
          <li>
            Pagamento confirmado:{" "}
            <span className={caso?.caso.pagamentoConfirmado ? "text-navy/70" : "text-[var(--terracota,#9A3A2F)]"}>
              {caso?.caso.pagamentoConfirmado ? "sim" : "ainda não"}
            </span>
          </li>
        </ul>
      </Bloco>
    </GoLiveShell>
  );
}
