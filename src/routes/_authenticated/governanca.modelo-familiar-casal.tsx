import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ANEXOS_MODELO_FAMILIAR_CASAL,
  CAMPOS_OBRIGATORIOS_POR_PESSOA,
  GATES_MODELO_FAMILIAR_CASAL,
  MODELO_FAMILIAR_CASAL_AUTOR,
  MODELO_FAMILIAR_CASAL_AVISO,
  MODELO_FAMILIAR_CASAL_BASE,
  MODELO_FAMILIAR_CASAL_DATA,
  MODELO_FAMILIAR_CASAL_FINALIDADE,
  MODELO_FAMILIAR_CASAL_FONTE,
  MODELO_FAMILIAR_CASAL_ID,
  MODELO_FAMILIAR_CASAL_NOME,
  MODELO_FAMILIAR_CASAL_STATUS,
  MODELO_FAMILIAR_CASAL_VERSAO,
  NAO_INFERIDOS,
  NUCLEO_FAMILIAR_CASAL,
  REGRAS_PRIVACIDADE_FAMILIAR,
  previaTesteModeloFamiliarCasal,
} from "@/lib/modelo-familiar-casal";
import {
  lerRegistroModeloFamiliarCasal,
  registrarModeloFamiliarCasal,
} from "@/lib/modelo-familiar-casal.functions";

export const Route = createFileRoute("/_authenticated/governanca/modelo-familiar-casal")({
  head: () => ({
    meta: [
      { title: "Modelo familiar casal (dois adultos) | Clube Ancestral" },
      {
        name: "description",
        content:
          "Modelo interno versionado de composição contratual familiar: casal com dois adultos, anexos individuais e gates bloqueantes.",
      },
      { property: "og:title", content: "Modelo familiar casal (dois adultos) | Clube Ancestral" },
      {
        property: "og:description",
        content:
          "Configuração interna do modelo de composição contratual familiar com dois adultos e assinatura individual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModeloFamiliarCasalPage,
});

const CLASSE_ROTULO: Record<string, string> = {
  fixo: "Fixo",
  condicional: "Condicional",
  nao_aplicavel_por_padrao: "Não aplicável por padrão",
};

type EventoRegistro = { id: string; evento: string; detalhe: string | null; criado_em: string };

function RegistroVersionado() {
  const queryClient = useQueryClient();
  const ler = useServerFn(lerRegistroModeloFamiliarCasal);
  const registrar = useServerFn(registrarModeloFamiliarCasal);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["modelo-familiar-casal-registro"],
    queryFn: () => ler({}),
  });
  const mutation = useMutation({
    mutationFn: () => registrar({}),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["modelo-familiar-casal-registro"] }),
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

function ModeloFamiliarCasalPage() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "editar_rascunho" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const previa = previaTesteModeloFamiliarCasal();

  return (
    <SaasShell
      titulo={`${MODELO_FAMILIAR_CASAL_NOME} — ${MODELO_FAMILIAR_CASAL_VERSAO}`}
      descricao="Modelo interno versionado de composição contratual familiar. Sem dados reais ou DEMO."
    >
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <div className="space-y-6 p-6">
        <header className="space-y-2">
          <h1 className="sr-only">
            {MODELO_FAMILIAR_CASAL_NOME} — {MODELO_FAMILIAR_CASAL_VERSAO}
          </h1>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{MODELO_FAMILIAR_CASAL_STATUS}</Badge>
            <Badge variant="outline">{MODELO_FAMILIAR_CASAL_ID}</Badge>
            <Badge variant="outline">Criado em {MODELO_FAMILIAR_CASAL_DATA}</Badge>
            <Badge variant="outline">{MODELO_FAMILIAR_CASAL_AUTOR}</Badge>
            <Badge variant="outline">Base: {MODELO_FAMILIAR_CASAL_BASE}</Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {MODELO_FAMILIAR_CASAL_FINALIDADE}
          </p>
          <p className="max-w-3xl rounded-md border border-terracotta/40 bg-terracotta/5 p-3 text-xs text-terracotta">
            {MODELO_FAMILIAR_CASAL_AVISO}
          </p>
          <p className="text-xs text-muted-foreground">
            Fonte canônica: {MODELO_FAMILIAR_CASAL_FONTE}
          </p>
        </header>

        <RegistroVersionado />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estrutura do núcleo familiar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="space-y-1">
                {Object.entries(NUCLEO_FAMILIAR_CASAL).map(([chave, valor]) => (
                  <li key={chave} className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs">{chave}</span>
                    <Badge variant="outline">{String(valor)}</Badge>
                  </li>
                ))}
              </ul>
              <p className="pt-2 text-xs text-muted-foreground">
                Um caso familiar · um contrato-base familiar · dois requerentes individuais · dois
                anexos individuais · assinatura individual de cada adulto parte contratante.
              </p>
              <p className="text-xs text-muted-foreground">
                Nunca inferido: {NAO_INFERIDOS.join(", ")}.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Papéis e campos obrigatórios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="text-navy">
                Pessoa A — requerente principal · Pessoa B — cônjuge/segunda requerente
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {CAMPOS_OBRIGATORIOS_POR_PESSOA.map((campo) => (
                  <li key={campo}>{campo}</li>
                ))}
              </ul>
              <p className="pt-1 text-xs">
                Pessoa que não é parte contratante não se torna signatária automaticamente.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anexos do modelo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {ANEXOS_MODELO_FAMILIAR_CASAL.map((anexo) => (
              <div key={anexo.codigo} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-navy">{anexo.codigo}</span>
                  <span className="text-muted-foreground">{anexo.titulo}</span>
                  <Badge variant="outline">{CLASSE_ROTULO[anexo.classe]}</Badge>
                  {typeof anexo.instanciasMaximas === "number" && (
                    <Badge variant="outline">máx. {anexo.instanciasMaximas}</Badge>
                  )}
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
              {GATES_MODELO_FAMILIAR_CASAL.map((gate) => (
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
                  {REGRAS_PRIVACIDADE_FAMILIAR.map((regra) => (
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
