import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import {
  ABAS_KIT_APP_CLIENTE,
  ClienteArvoreTemplate,
  ClienteContaTemplate,
  ClienteDocumentosTemplate,
  ClienteHomeTemplate,
  ClienteJornadaTemplate,
  ClienteLegadoTemplate,
  ClienteRadarTemplate,
  ClienteTabBar,
  ClienteTopbar,
  type AbaKitAppCliente,
} from "@/components/clube-ancestral-kit/kit-app-cliente";

/**
 * Prancha visual do Kit do App Cliente — sete abas aprovadas.
 * Rota pública de leitura, conteúdo demonstrativo, sem dado real.
 */
export const Route = createFileRoute("/previa-kit-app-cliente")({
  head: () => ({
    meta: [
      { title: "Kit visual do App Cliente — Clube Ancestral" },
      {
        name: "description",
        content:
          "Prancha visual do kit do App Cliente: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta. Conteúdo demonstrativo.",
      },
      { property: "og:title", content: "Kit visual do App Cliente — Clube Ancestral" },
      { property: "og:description", content: "Sete telas aprovadas do App Cliente em versão visual." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviaKitAppCliente,
});

const JORNADA = [
  { id: "e1", title: "Aceite e formalização", detail: "Concluída", state: "done" as const },
  { id: "e2", title: "Onboarding", detail: "Concluída", state: "done" as const },
  { id: "e3", title: "Pesquisa inicial", detail: "Em andamento", state: "current" as const },
  { id: "e4", title: "Preparação documental", detail: "A seguir", state: "next" as const },
  { id: "e5", title: "Protocolo e acompanhamento", detail: "A seguir", state: "next" as const },
];

const PESSOAS = [
  { id: "p1", name: "Titular demonstrativo", role: "Requerente", place: "São Paulo", status: "Confirmado" },
  { id: "p2", name: "Ascendente demonstrativo", role: "Avô", place: "Lucca", status: "Confirmado" },
  { id: "p3", name: "Ascendente demonstrativa", role: "Bisavó", place: "Lucca", status: "Em pesquisa" },
];

function PreviaKitAppCliente() {
  const [aba, setAba] = useState<AbaKitAppCliente>("home");

  return (
    <div data-visual-kit="pantone" className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col border-x border-navy/10 bg-background">
        <ClienteTopbar titulo="Clube Ancestral" saudacao="Conteúdo demonstrativo para aprovação visual" />
        <div className="flex-1 overflow-x-hidden">
          {aba === "home" ? (
            <ClienteHomeTemplate
              etapa="Pesquisa inicial"
              progresso={45}
              acao={{ action: "Enviar cópia da certidão de casamento dos seus pais", owner: "Você", due: "18/09" }}
              microentrega={{ title: "Primeiro panorama da linhagem materna", state: "Publicada", publishedAt: "10/09" }}
            />
          ) : null}
          {aba === "jornada" ? (
            <ClienteJornadaTemplate
              etapas={JORNADA}
              acao={{ action: "Enviar cópia da certidão de casamento dos seus pais", owner: "Você", due: "18/09" }}
            />
          ) : null}
          {aba === "radar" ? (
            <ClienteRadarTemplate
              eixos={[
                { label: "Documentação", value: 62 },
                { label: "Origem", value: 78 },
                { label: "Conexões familiares", value: 55 },
                { label: "Elegibilidade", value: 48 },
                { label: "Memória", value: 70 },
                { label: "Legado", value: 35 },
              ]}
            />
          ) : null}
          {aba === "arvore" ? <ClienteArvoreTemplate pessoas={PESSOAS} destaque={PESSOAS[0]} /> : null}
          {aba === "documentos" ? (
            <ClienteDocumentosTemplate
              documentos={[
                { title: "Certidão de nascimento — titular", detail: "Recebida em 02/09", status: "Publicado" },
                { title: "Certidão de casamento — avós", detail: "Recebida em 05/09", status: "Publicado" },
              ]}
            />
          ) : null}
          {aba === "legado" ? (
            <ClienteLegadoTemplate
              itens={[
                { id: "l1", kind: "Narrativa", title: "A travessia de 1898", subtitle: "Capítulo inicial", state: "Publicado" },
                { id: "l2", kind: "Memória", title: "Vozes da família", subtitle: "Registro de memórias", state: "Publicado" },
              ]}
            />
          ) : null}
          {aba === "conta" ? (
            <ClienteContaTemplate
              titular="Titular demonstrativo"
              estado={{ texto: "Acesso ativo", tom: "success" }}
              campos={[
                { rotulo: "E-mail", valor: "titular@exemplo.com" },
                { rotulo: "Telefone", valor: "(11) 90000-0000" },
                { rotulo: "Caso", valor: "Estudo genealógico familiar" },
              ]}
              linhas={[
                ["Contrato assinado", "28/08", "Disponível"],
                ["Anexo I — Escopo", "28/08", "Disponível"],
              ]}
            />
          ) : null}
        </div>
        <ClienteTabBar active={aba} onSelect={setAba} />
      </div>
      <p className="py-3 text-center text-[11px] text-navy/50">
        Prancha visual · {ABAS_KIT_APP_CLIENTE.length} abas aprovadas · conteúdo demonstrativo
      </p>
    </div>
  );
}
