import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AVISO_RASCUNHO_TESTE,
  MODELOS_CONTRATUAIS,
  montarRascunhoModelo,
  type ChaveModelo,
} from "@/lib/matriz-modelos-contratuais";
import { qualificacaoInstitucionalRenderizada } from "@/lib/qualificacao-institucional";

export const Route = createFileRoute("/_authenticated/governanca/modelos-contratuais")({
  head: () => ({
    meta: [
      { title: "Matriz de modelos contratuais | Clube Ancestral" },
      {
        name: "description",
        content:
          "Matriz interna dos três modelos de composição contratual (individual, casal e núcleo familiar) com anexos, gates e rascunhos TESTE somente-leitura.",
      },
      { property: "og:title", content: "Matriz de modelos contratuais | Clube Ancestral" },
      {
        property: "og:description",
        content: "Modelos versionados de composição contratual em revisão jurídica, com prévias TESTE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MatrizModelosPage,
});

const CLASSE_ROTULO: Record<string, string> = {
  fixo: "Fixo",
  condicional: "Condicional",
  nao_aplicavel_por_padrao: "Não aplicável por padrão",
};

function AvisoRascunho() {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-destructive">
      {AVISO_RASCUNHO_TESTE}
    </div>
  );
}

function PreviaTeste({ chave }: { chave: ChaveModelo }) {
  const rascunho = montarRascunhoModelo(chave);
  return (
    <div className="space-y-4" data-testid={`previa-teste-${chave}`}>
      <AvisoRascunho />
      <div className="rounded-md border p-3 text-sm">
        <p className="font-semibold">{rascunho.capa.modelo}</p>
        <p className="text-muted-foreground">
          Versão {rascunho.capa.versao} · status {rascunho.capa.status} · gerado em {rascunho.capa.dataGeracao}
        </p>
        <p className="mt-1 break-words font-mono text-xs text-muted-foreground">
          {rascunho.capa.identificadorTecnico}
        </p>
      </div>

      <section className="space-y-1">
        <h4 className="text-sm font-semibold">Perfil institucional ({rascunho.perfil.versao})</h4>
        <ul className="text-xs text-muted-foreground">
          {rascunho.perfil.campos.map((c) => (
            <li key={c.rotulo}>
              <span className="font-medium text-foreground">{c.rotulo}:</span> {c.valor}
            </li>
          ))}
          {rascunho.perfil.placeholders.map((p) => (
            <li key={p.rotulo}>
              <span className="font-medium text-foreground">{p.rotulo}:</span> {p.valor}
            </li>
          ))}
        </ul>
        <h5 className="pt-2 text-sm font-semibold">{rascunho.perfil.qualificacao.titulo}</h5>
        {rascunho.perfil.qualificacao.paragrafos.map((p) => (
          <p key={p.slice(0, 24)} className="text-xs text-muted-foreground">
            {p}
          </p>
        ))}
      </section>

      <section className="space-y-1">
        <h4 className="text-sm font-semibold">Bloco de partes</h4>
        <ul className="text-xs text-muted-foreground">
          {rascunho.partes.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-1">
        <h4 className="text-sm font-semibold">Preâmbulo e 14 cláusulas</h4>
        <p className="text-xs text-muted-foreground">{rascunho.preambulo}</p>
        <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
          {rascunho.clausulas.map((c) => (
            <li key={c.numero}>
              <span className="font-medium text-foreground">{c.titulo}</span>
              <ul className="list-disc pl-4">
                {c.itens.map((i) => (
                  <li key={i.slice(0, 30)}>{i}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-1">
        <h4 className="text-sm font-semibold">Anexos e gates</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-1 pr-2">Anexo</th>
                <th className="py-1 pr-2">Aplicabilidade</th>
                <th className="py-1 pr-2">Fonte necessária</th>
                <th className="py-1 pr-2">Gate</th>
                <th className="py-1">Motivo do bloqueio</th>
              </tr>
            </thead>
            <tbody>
              {rascunho.anexos.map((a) => (
                <tr key={a.codigo} className="border-t align-top">
                  <td className="py-1 pr-2 font-medium">{a.codigo}</td>
                  <td className="py-1 pr-2">{CLASSE_ROTULO[a.aplicabilidade]}</td>
                  <td className="py-1 pr-2">{a.fonteNecessaria}</td>
                  <td className="py-1 pr-2">{a.gate}</td>
                  <td className="py-1">{a.motivoBloqueio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-1">
        <h4 className="text-sm font-semibold">Pendências para formalização</h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {rascunho.pendencias.map((p) => (
            <li key={p.tema}>
              <span className="font-medium text-foreground">{p.tema}:</span> {p.situacao} — gate:{" "}
              {p.gateBloqueado}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MatrizModelosPage() {
  const [previa, setPrevia] = useState<ChaveModelo | null>(null);
  const qualificacao = qualificacaoInstitucionalRenderizada();

  return (
    <SaasShell titulo="Matriz de modelos contratuais" descricao="Composição de pessoas, anexos e gates sobre o contrato-base único">
      <div className="space-y-6">
        <AvisoRascunho />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {qualificacao.titulo} · {qualificacao.versao}{" "}
              <Badge variant="outline">{qualificacao.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {qualificacao.paragrafos.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            {qualificacao.pendencias.map((p) => (
              <p key={p} className="text-xs font-medium text-destructive">
                {p}
              </p>
            ))}
          </CardContent>
        </Card>

        {MODELOS_CONTRATUAIS.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                {m.nome} <Badge variant="outline">{m.status}</Badge>
                <Badge variant="secondary">{m.base}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="break-words font-mono text-xs text-muted-foreground">{m.id}</p>
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {m.regrasComposicao.map((r) => (
                  <li key={r.slice(0, 30)}>{r}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {m.anexos.map((a) => (
                  <Badge key={a.codigo} variant="outline" className="text-[10px]">
                    {a.codigo} · {CLASSE_ROTULO[a.aplicabilidade]}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{m.gates.length} gates bloqueantes.</p>
              <Button variant="outline" size="sm" onClick={() => setPrevia(previa === m.chave ? null : m.chave)}>
                {previa === m.chave ? "Ocultar prévia TESTE" : "Ver prévia TESTE (somente leitura)"}
              </Button>
              {previa === m.chave ? <PreviaTeste chave={m.chave} /> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </SaasShell>
  );
}
