/**
 * Ações de registro do GoLive que o motor já tinha e nenhuma tela chamava
 * (religação de 31/10/2026, decisão da Proprietária): Discovery, call,
 * conferência de pessoa, pagamento manual e publicação direta no App.
 *
 * Todas gravam no caso escolhido por `?casoId=` (o `useEscritorGoLive` injeta o
 * caso). Nenhuma fala com fora, nenhuma apaga. Cada uma diz na própria
 * confirmação o que gravou.
 */
import { useState } from "react";

import { Acao } from "@/components/golive/acoes";
import { RESULTADOS_DISCOVERY } from "@/lib/golive-comercial";

type Envio = (v: Record<string, string>) => Promise<unknown>;

/** Discovery como registro próprio: resultado + resumo, e o lead passa a qualificado. */
export function AcaoDiscovery({ leadId, aoConfirmar }: { leadId: string; aoConfirmar: Envio }) {
  return (
    <Acao
      rotulo="Registrar Discovery"
      titulo="Resultado do Discovery"
      variante="outline"
      campos={[
        {
          nome: "resultado",
          rotulo: "Resultado do Discovery",
          tipo: "escolha",
          obrigatorio: true,
          opcoes: RESULTADOS_DISCOVERY.map((r) => ({ valor: r.valor, rotulo: r.rotulo })),
        },
        {
          nome: "resumo",
          rotulo: "Resumo interno",
          tipo: "area",
          obrigatorio: true,
          ajuda:
            "Grava o resultado no lead, passa o lead para qualificado e deixa uma reunião no histórico do caso.",
        },
      ]}
      aoConfirmar={(v) =>
        aoConfirmar({ leadId, resultado: v["resultado"] ?? "", resumo: v["resumo"] ?? "" })
      }
      confirmacao="Discovery registrado no lead e no histórico do caso."
    />
  );
}

/** Call realizada como registro próprio: data + resumo, com a interação no histórico. */
export function AcaoCall({ leadId, aoConfirmar }: { leadId: string; aoConfirmar: Envio }) {
  return (
    <Acao
      rotulo="Registrar call"
      titulo="Call realizada"
      variante="outline"
      campos={[
        { nome: "ocorridoEm", rotulo: "Data da call", tipo: "data" },
        {
          nome: "resumo",
          rotulo: "Resumo da call",
          tipo: "area",
          obrigatorio: true,
          ajuda: "Grava a data e o resumo no lead e uma interação de call no histórico do caso.",
        },
      ]}
      aoConfirmar={(v) =>
        aoConfirmar({ leadId, resumo: v["resumo"] ?? "", ocorridoEm: v["ocorridoEm"] ?? "" })
      }
      confirmacao="Call registrada no lead e no histórico do caso."
    />
  );
}

export type ResolucaoPessoa = {
  acao: "reutilizar" | "confirmar" | "nova";
  pessoa: { id: string; nome: string } | null;
  motivo?: string;
};

/** Texto para a equipe: o que a conferência achou. Puro, para teste. */
export function descreverResolucaoPessoa(r: ResolucaoPessoa): string {
  if (r.acao === "reutilizar" && r.pessoa) {
    return `Já cadastrada com este e-mail: ${r.pessoa.nome || "sem nome"}. Use esta pessoa em vez de criar outra.`;
  }
  if (r.acao === "confirmar" && r.pessoa) {
    return `${r.motivo ?? "Telefone igual a uma pessoa já cadastrada."} (${r.pessoa.nome || "sem nome"})`;
  }
  return "Nenhuma pessoa igual encontrada. Pode cadastrar como nova.";
}

/** Conferência de pessoa canônica por e-mail/telefone. Não cria nem funde nada. */
export function AcaoConferirPessoa({
  aoConfirmar,
}: {
  aoConfirmar: (v: Record<string, string>) => Promise<unknown>;
}) {
  const [resultado, setResultado] = useState<string | null>(null);
  return (
    <div className="space-y-1">
      <Acao
        rotulo="Conferir se a pessoa já existe"
        titulo="Pessoa canônica"
        variante="outline"
        campos={[
          { nome: "nome", rotulo: "Nome completo", obrigatorio: true },
          { nome: "email", rotulo: "E-mail", tipo: "email" },
          { nome: "telefone", rotulo: "Telefone", tipo: "telefone" },
        ]}
        aoConfirmar={async (v) => {
          const r = (await aoConfirmar({
            nome: v["nome"] ?? "",
            email: v["email"] ?? "",
            telefone: v["telefone"] ?? "",
          })) as ResolucaoPessoa;
          setResultado(descreverResolucaoPessoa(r));
          return r;
        }}
        confirmacao="Conferência feita. Nada foi criado nem fundido."
      />
      {resultado ? (
        <p className="text-xs text-navy/70" data-golive-pessoa-resultado>
          {resultado}
        </p>
      ) : null}
    </div>
  );
}

export type FaturaAberta = {
  id: string;
  numero?: string | null;
  valor?: number | null;
  status?: string | null;
};

/** Faturas que ainda aceitam registro manual de pagamento. */
export function faturasAbertas<T extends FaturaAberta>(faturas: readonly T[]): T[] {
  return faturas.filter(
    (f) => !["paga", "cancelada"].includes(String(f.status ?? "").toLowerCase()),
  );
}

/** Pagamento manual: confirma o pagamento e marca a fatura como paga. Só com comprovante. */
export function AcaoPagamento({
  faturas,
  aoConfirmar,
}: {
  faturas: readonly FaturaAberta[];
  aoConfirmar: Envio;
}) {
  const abertas = faturasAbertas(faturas);
  if (!abertas.length) return null;
  return (
    <Acao
      rotulo="Registrar pagamento"
      titulo="Pagamento recebido"
      variante="outline"
      campos={[
        {
          nome: "faturaId",
          rotulo: "Fatura",
          tipo: "escolha",
          obrigatorio: true,
          opcoes: abertas.map((f) => ({
            valor: f.id,
            rotulo: `${f.numero ?? "Cobrança"}${typeof f.valor === "number" ? ` — R$ ${f.valor.toFixed(2).replace(".", ",")}` : ""}`,
          })),
        },
        { nome: "valor", rotulo: "Valor recebido (R$)", tipo: "numero", obrigatorio: true },
        {
          nome: "metodo",
          rotulo: "Forma de pagamento",
          ajuda: "Ex.: Pix, boleto, cartão. Vazio grava “manual”.",
        },
        {
          nome: "pagoEm",
          rotulo: "Data do pagamento",
          tipo: "data",
          ajuda: "Confirma o pagamento e marca a fatura como paga. Use só com comprovante em mãos.",
        },
      ]}
      aoConfirmar={(v) =>
        aoConfirmar({
          faturaId: v["faturaId"] ?? "",
          valor: String(v["valor"] ?? "").replace(",", "."),
          metodo: v["metodo"] ?? "",
          pagoEm: v["pagoEm"] ?? "",
        })
      }
      confirmacao="Pagamento registrado e fatura marcada como paga."
    />
  );
}

/** Publicação direta no App de uma microentrega concluída (texto já sanitizado para a família). */
export function AcaoPublicarNoApp({
  microentregaId,
  aoConfirmar,
}: {
  microentregaId: string;
  aoConfirmar: Envio;
}) {
  return (
    <Acao
      rotulo="Publicar no App agora"
      titulo="Publicar direto para a família"
      variante="outline"
      campos={[
        {
          nome: "resumoSanitizado",
          rotulo: "Texto que a família vai ler",
          tipo: "area",
          obrigatorio: true,
          ajuda:
            "Publica na hora, sem passar por rascunho. Para revisar antes, use “Escrever para a família”.",
        },
      ]}
      aoConfirmar={(v) =>
        aoConfirmar({
          microentregaId,
          resumoSanitizado: v["resumoSanitizado"] ?? "",
          tipo: "microentrega",
        })
      }
      confirmacao="Publicado no App da família."
    />
  );
}
