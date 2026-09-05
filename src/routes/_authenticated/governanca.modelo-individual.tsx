import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell } from "@/components/saas/shell";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  lerRegistroModeloIndividual,
  registrarModeloIndividual,
} from "@/lib/modelo-individual.functions";
import {
  ANEXOS_MODELO_INDIVIDUAL,
  GATES_MODELO_INDIVIDUAL,
  MODELO_INDIVIDUAL_AUTOR,
  MODELO_INDIVIDUAL_AVISO,
  MODELO_INDIVIDUAL_BASE,
  MODELO_INDIVIDUAL_DATA,
  MODELO_INDIVIDUAL_FINALIDADE,
  MODELO_INDIVIDUAL_FONTE,
  MODELO_INDIVIDUAL_ID,
  MODELO_INDIVIDUAL_NOME,
  MODELO_INDIVIDUAL_STATUS,
  MODELO_INDIVIDUAL_VERSAO,
  REGRAS_PRIVACIDADE_MODELO,
  REQUISITOS_INCLUSAO_ACOMPANHANTE,
  TRAVAS_ACOMPANHANTE,
  previaTesteModeloIndividual,
} from "@/lib/modelo-individual-acompanhante";

export const Route = createFileRoute("/_authenticated/governanca/modelo-individual")({
  head: () => ({
    meta: [
      { title: "Modelo individual com acompanhante | Clube Ancestral" },
      {
        name: "description",
        content:
          "Modelo interno versionado de composição contratual: requerente único com acompanhante facultativa, anexos e gates.",
      },
      { property: "og:title", content: "Modelo individual com acompanhante | Clube Ancestral" },
      {
        property: "og:description",
        content:
          "Configuração interna do modelo de composição contratual com requerente único e acompanhante facultativa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModeloIndividualPage,
});

const CLASSE_ROTULO: Record<string, string> = {
  fixo: "Fixo",
  condicional: "Condicional",
  nao_aplicavel_por_padrao: "Não aplicável por padrão",
};

type EventoRegistro = { id: string; evento: string; detalhe: string | null; criado_em: string };

function RegistroVersionado() {
  const queryClient = useQueryClient();
  const ler = useServerFn(lerRegistroModeloIndividual);
  const registrar = useServerFn(registrarModeloIndividual);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["modelo-individual-registro"],
    queryFn: () => ler({}),
  });
  const mutation = useMutation({
    mutationFn: () => registrar({}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modelo-individual-registro"] }),
  });

  const modelo = data?.modelo as
    | { versao: string; status: string; autor: string | null; criado_em: string }
    | null
    | undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registro versionado (organização)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {modelo ? (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{modelo.versao}</Badge>
            <Badge variant="outline">{modelo.status}</Badge>
            <Badge variant="outline">{modelo.autor ?? "—"}</Badge>
            <Badge variant="outline">
              Registrado em {new Date(modelo.criado_em).toLocaleDateString("pt-BR")}
            </Badge>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Modelo ainda não registrado nesta organização. O registro é apenas de governança
            interna e não libera contrato, assinatura ou cobrança.
          </p>
        )}
        {!modelo && (
          <AcaoOperacional
            size="sm"
            rotulo="Registrar modelo v1.0 (under_legal_review)"
            capacidade="criar_versao_derivada"
            efeito="Grava o registro versionado do modelo nesta organização. Não libera contrato, assinatura ou cobrança."
            onConfirmar={async () => {
              await mutation.mutateAsync();
            }}
          />
        )}
        {mutation.isError && (
          <p className="text-xs text-terracotta">{(mutation.error as Error).message}</p>
        )}
        <EstadoDados
          carregando={isLoading}
          erro={error}
          dados={data?.eventos as EventoRegistro[] | undefined}
          aoTentarNovamente={() => void refetch()}
          recurso="os eventos do registro"
          vazio="Nenhum evento registrado ainda."
        >
          {(eventos) => (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {eventos.map((ev) => (
                <li key={ev.id}>
                  {new Date(ev.criado_em).toLocaleString("pt-BR")} · {ev.evento}
                  {ev.detalhe ? ` · ${ev.detalhe}` : ""}
                </li>
              ))}
            </ul>
          )}
        </EstadoDados>
      </CardContent>
    </Card>
  );
}

function ModeloIndividualPage() {
  const previa = previaTesteModeloIndividual();


  return (
    <SaasShell
      titulo={`${MODELO_INDIVIDUAL_NOME} — ${MODELO_INDIVIDUAL_VERSAO}`}
      descricao="Modelo interno versionado de composição contratual. Sem dados reais ou DEMO."
    >
      <div className="space-y-6 p-6">
        <header className="space-y-2">
          <h1 className="sr-only">
            {MODELO_INDIVIDUAL_NOME} — {MODELO_INDIVIDUAL_VERSAO}
          </h1>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{MODELO_INDIVIDUAL_STATUS}</Badge>
            <Badge variant="outline">{MODELO_INDIVIDUAL_ID}</Badge>
            <Badge variant="outline">Criado em {MODELO_INDIVIDUAL_DATA}</Badge>
            <Badge variant="outline">{MODELO_INDIVIDUAL_AUTOR}</Badge>
            <Badge variant="outline">Base: {MODELO_INDIVIDUAL_BASE}</Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">{MODELO_INDIVIDUAL_FINALIDADE}</p>
          <p className="max-w-3xl rounded-md border border-terracotta/40 bg-terracotta/5 p-3 text-xs text-terracotta">
            {MODELO_INDIVIDUAL_AVISO}
          </p>
          <p className="text-xs text-muted-foreground">Fonte canônica: {MODELO_INDIVIDUAL_FONTE}</p>
        </header>

        <RegistroVersionado />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Requerente único obrigatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Exatamente uma pessoa adulta como requerente principal.</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Parte contratante e signatário por padrão, com confirmação humana obrigatória.</li>
                <li>Campos: nome, identificação por fonte permitida, papel, estado de dados e documentos, processo individual abrangido, fonte e status de confirmação.</li>
                <li>Uma única instância de ANX-INDIVIDUAL, quando aplicável.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acompanhante facultativa e limitada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-1">
                {Object.entries(TRAVAS_ACOMPANHANTE).map(([chave, valor]) => (
                  <li key={chave} className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs">{chave}</span>
                    <Badge variant="outline">{String(valor)}</Badge>
                  </li>
                ))}
              </ul>
              <p className="pt-2 text-xs">
                Promoção a requerente ou signatária exige: {REQUISITOS_INCLUSAO_ACOMPANHANTE.join(" · ")}.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anexos do modelo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {ANEXOS_MODELO_INDIVIDUAL.map((anexo) => (
              <div key={anexo.codigo} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-navy">{anexo.codigo}</span>
                  <span className="text-muted-foreground">{anexo.titulo}</span>
                  <Badge variant="outline">{CLASSE_ROTULO[anexo.classe]}</Badge>
                </div>
                <p className="pt-1 text-xs text-muted-foreground">{anexo.regra}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gates bloqueantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {GATES_MODELO_INDIVIDUAL.map((gate) => (
                <div key={gate.codigo} className="rounded-md border p-3">
                  <p className="font-medium text-navy">{gate.codigo}</p>
                  <p className="text-xs text-muted-foreground">{gate.regra}</p>
                  <p className="pt-1 text-xs text-terracotta">Bloqueia: {gate.bloqueia}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Privacidade e acesso</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {REGRAS_PRIVACIDADE_MODELO.map((regra) => (
                    <li key={regra}>{regra}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prévia TESTE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Badge variant="outline">{previa.marca}</Badge>
                {previa.blocos.map((bloco) => (
                  <div key={bloco.titulo} className="rounded-md border bg-muted/30 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {bloco.titulo}
                    </p>
                    <p className="font-mono text-sm text-navy">{bloco.conteudo}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SaasShell>
  );
}
