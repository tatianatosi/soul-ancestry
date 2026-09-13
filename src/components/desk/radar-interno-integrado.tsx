import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { RadarInternoCaso } from "@/components/caso/radar-interno";
import { MatrizPrioridadesConectada } from "@/components/desk/matriz-prioridades-conectada";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { carregarFichaCaso } from "@/lib/caso-ficha.functions";
import { papelDoRegistro } from "@/lib/caso-ficha";
import { posicionar } from "@/lib/matriz-posicionamento";
import { ROTULO_SINAL } from "@/lib/prioridade-matriz";
import { radarInternoDoCaso } from "@/lib/radar-interno-caso";
import { listarRegistros } from "@/lib/saas.functions";

type Linha = Record<string, unknown>;
type ModoRadar = "matriz" | "individual";

function texto(valor: unknown, vazio = "Não informado"): string {
  const normalizado = String(valor ?? "").trim();
  return normalizado || vazio;
}

function dataPtBr(valor: unknown): string {
  const iso = String(valor ?? "").slice(0, 10);
  if (!iso) return "Sem prazo definido";
  const [ano, mes, dia] = iso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

export function RadarInternoIntegrado() {
  const listar = useServerFn(listarRegistros);
  const carregar = useServerFn(carregarFichaCaso);
  const [modo, setModo] = useState<ModoRadar>("matriz");
  const [caseId, setCaseId] = useState("");

  const casosQuery = useQuery({
    queryKey: ["saas", "crm_casos", false],
    queryFn: () => listar({ data: { entidade: "crm_casos", incluirArquivados: false } }),
    retry: false,
  });
  const casos = useMemo(() => (casosQuery.data ?? []) as Linha[], [casosQuery.data]);

  useEffect(() => {
    if (!caseId && casos[0]?.["id"]) setCaseId(String(casos[0]["id"]));
  }, [caseId, casos]);

  const fichaQuery = useQuery({
    queryKey: ["radar-interno", "ficha", caseId],
    queryFn: () => {
      if (!caseId) throw new Error("Selecione um caso para abrir o Radar Individual.");
      return carregar({ data: { id: caseId } });
    },
    enabled: modo === "individual" && Boolean(caseId),
    retry: false,
  });

  const selecionarNaMatriz = (id: string) => {
    setCaseId(id);
    setModo("individual");
  };

  const ficha = fichaQuery.data;
  const caso = ficha?.caso as Linha | undefined;
  const posicao = caso
    ? posicionar({
        tipo: "caso",
        id: texto(caso["id"], ""),
        rotulo: texto(caso["codigo"] ?? caso["titulo"]),
        elegibilidade: (caso["hipotese_elegibilidade"] as string) ?? null,
        prazo: (caso["prazo_proxima_acao"] as string) ?? null,
        diasSemTouchpoint: (caso["dias_sem_touchpoint"] as number) ?? null,
        esperaExternaAtiva: Boolean(caso["aguardando_instituicao_externa"]),
        bloqueios: ficha?.bloqueiosReais?.map((b) => b.motivo) ?? [],
        responsavel: (caso["proxima_acao_responsavel"] as string) ?? null,
        origem: papelDoRegistro(caso).valor === "demo" ? "demo" : "real",
      })
    : null;

  return (
    <Tabs value={modo} onValueChange={(valor) => setModo(valor as ModoRadar)}>
      <TabsList aria-label="Modo do Radar Interno" className="h-auto bg-navy/5">
        <TabsTrigger value="matriz">Matriz de Prioridade</TabsTrigger>
        <TabsTrigger value="individual">Radar Individual</TabsTrigger>
      </TabsList>

      <TabsContent value="matriz" className="mt-5">
        <MatrizPrioridadesConectada casoSelecionado={caseId} onSelecionarCaso={selecionarNaMatriz} />
      </TabsContent>

      <TabsContent value="individual" className="mt-5 space-y-4">
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-navy/50">
                Caso ativo
              </span>
              <Select value={caseId} onValueChange={setCaseId}>
                <SelectTrigger aria-label="Selecionar caso para o Radar Individual" className="bg-cream text-navy">
                  <SelectValue placeholder="Selecione um caso" />
                </SelectTrigger>
                <SelectContent>
                  {casos.map((item) => {
                    const id = texto(item["id"], "");
                    if (!id) return null;
                    const demonstrativo = papelDoRegistro(item).valor === "demo";
                    return (
                      <SelectItem key={id} value={id}>
                        {texto(item["codigo"] ?? item["titulo"] ?? id)}{demonstrativo ? " · demonstração" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </label>
            <p className="text-xs text-navy/55">A seleção não altera o caso nem sua prioridade.</p>
          </div>
        </section>

        {casosQuery.isLoading || fichaQuery.isLoading ? (
          <p className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-sm text-navy/60">
            Carregando o Radar Individual…
          </p>
        ) : null}
        {casosQuery.isError || fichaQuery.isError ? (
          <p className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-5 text-sm text-terracotta">
            O Radar Individual não pôde ser lido agora. Nenhuma informação foi inferida.
          </p>
        ) : null}
        {!casosQuery.isLoading && !casosQuery.isError && casos.length === 0 ? (
          <p className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-sm text-navy/60">
            Nenhum caso ativo disponível para leitura individual.
          </p>
        ) : null}

        {caso && ficha && posicao ? (
          <>
            <section className="rounded-xl border border-navy/10 bg-cream/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">Caso selecionado</p>
                  <h2 className="mt-1 font-serif text-xl text-navy">{texto(caso["codigo"] ?? caso["titulo"])}</h2>
                </div>
                <span className="rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-semibold text-navy">
                  {ROTULO_SINAL[posicao.sinal]}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><dt className="text-navy/50">Urgência</dt><dd className="font-medium text-navy">{posicao.urgencia}</dd></div>
                <div><dt className="text-navy/50">Hipótese de elegibilidade</dt><dd className="font-medium text-navy">{posicao.elegibilidade}</dd></div>
                <div><dt className="text-navy/50">Responsável</dt><dd className="font-medium text-navy">{texto(caso["proxima_acao_responsavel"])}</dd></div>
                <div><dt className="text-navy/50">Prazo</dt><dd className="font-medium text-navy">{dataPtBr(caso["prazo_proxima_acao"])}</dd></div>
                <div className="sm:col-span-2"><dt className="text-navy/50">Próxima ação</dt><dd className="font-medium text-navy">{texto(caso["proxima_acao"] ?? caso["proxima_acao_codigo"])}</dd></div>
                <div className="sm:col-span-2"><dt className="text-navy/50">Bloqueios reais</dt><dd className="font-medium text-navy">{ficha.bloqueiosReais.length ? ficha.bloqueiosReais.map((b) => b.motivo).join(" · ") : "Nenhum bloqueio registrado"}</dd></div>
              </dl>
            </section>
            <RadarInternoCaso
              contexto={{
                caseId: texto(caso["id"], ""),
                status: texto(caso["status"]),
                prioridade: ROTULO_SINAL[posicao.sinal],
                urgencia: posicao.urgencia,
                elegibilidade: posicao.elegibilidade,
                responsavel: texto(caso["proxima_acao_responsavel"]),
                prazo: dataPtBr(caso["prazo_proxima_acao"]),
                proximaAcao: texto(caso["proxima_acao"] ?? caso["proxima_acao_codigo"]),
                bloqueios: ficha.bloqueiosReais.length
                  ? ficha.bloqueiosReais.map((b) => b.motivo).join(" · ")
                  : "Nenhum bloqueio registrado",
              }}
              eixos={radarInternoDoCaso({
                caso,
                nucleoCompletude: ficha.nucleoOk,
                nucleoCriterios: ficha.nucleoCriterios,
                checksAtivacao: ficha.checksAtivacao,
                bloqueiosReais: ficha.bloqueiosReais,
              })}
            />
          </>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}