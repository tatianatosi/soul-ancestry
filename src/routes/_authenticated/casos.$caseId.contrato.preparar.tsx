/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selo, inputCls, moeda } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { AnexosAplicaveis } from "@/components/contrato/anexos-aplicaveis";
import { CadeiaFormalizacao } from "@/components/contrato/cadeia-formalizacao";
import { CadeiaOperacional } from "@/components/contrato/cadeia-operacional";
import { PlanejadorOperacional } from "@/components/contrato/planejador-operacional";
import { AnexosIaV, PainelPendenciasContratuais } from "@/components/contrato/anexos-i-v";
import { ConflitoCoerencia } from "@/components/contrato/conflito-coerencia";
import { EscopoProposta } from "@/components/contrato/escopo-proposta";
import { CompletudeCanva } from "@/components/contrato/completude-canva";
import { EstruturaFamiliar } from "@/components/contrato/estrutura-familiar";
import { PainelDependentes } from "@/components/contrato/painel-dependentes";
import { LinhaParametro } from "@/components/contrato/linha-parametro";
import { PainelBloqueios } from "@/components/contrato/painel-bloqueios";
import { RegraComercial } from "@/components/contrato/regra-comercial";
import { CartaoDetalhe } from "@/components/contrato/cartao-detalhe";
import { MatrizAceiteTabela } from "@/components/contrato/matriz-aceite-tabela";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { CabecalhoBloco, GovernancaFicha } from "@/components/contrato/ficha-governanca";
import { bloqueiosResolutivos } from "@/lib/bloqueios-dicionario";
import { GRUPOS, ROTULO_EVENTO_PREVIA } from "@/lib/contrato-parametros.server";
import { BLOCOS_FICHA, estadoDoBloco } from "@/lib/ficha-familiar";
import { anexosIaV, entradaDeValores, gatesBloqueados, pendenciasDosAnexos } from "@/lib/anexos-i-v";
import { conferirInstancias, statusTelaDeAnexo } from "@/lib/anexos-instancia";
import { instanciasDocumentaisDoCaso } from "@/lib/anexos-instancia.functions";
import { InstanciaDocumental } from "@/components/contrato/instancia-documental";
import { TrilhoProntidaoContrato } from "@/components/contrato/trilho-prontidao";
import { AbrirDocumentoContrato } from "@/components/contrato/abrir-documento-contrato";
import { resumoProntidao } from "@/lib/contrato-prontidao";
import { avaliarMatrizClausulas, previaFinalLiberada } from "@/lib/matriz-clausulas";
import { blocosRenderizados } from "@/lib/matriz-aceite";
import { perfilInstitucionalRenderizado } from "@/lib/perfil-institucional";
import { garantirPerfilInstitucionalDaSessao, lerPerfilInstitucionalPersistido } from "@/lib/perfil-institucional-persistido.functions";
import { MatrizClausulas, PerfilInstitucionalBloco } from "@/components/contrato/matriz-clausulas";
import { modeloAplicavelAoCaso } from "@/lib/matriz-modelos-contratuais";
import {
  CONTRATO_BASE_VERSAO,
  contratoBaseAssinavel,
  type EstadoVigenciaContratoBase,
} from "@/lib/contrato-base-consolidado";

import {
  aprovarParametros,
  congelarPrevia,
  dispensarAnexoComMotivo,
  enviarParaAssinatura,
  gerarPrevia,
  lerPrevia,
  materializarAnexosRevisados,
  reativarAnexoDispensado,
  ressincronizarAnexosDoCaso,
  preencherDeOrigens,
  registrarAssinatura,
} from "@/lib/contrato-parametros.functions";
import { MaterializarRevisados } from "@/components/contrato/materializar-revisados";
import { RessincronizarAnexos } from "@/components/contrato/ressincronizar-anexos";
import { ReconciliarCpfPartes } from "@/components/contrato/reconciliar-cpf-partes";
import { ReconciliarContatoPartesContrato } from "@/components/contrato/reconciliar-contato-partes";
import { sincronizarPessoaDoCaso, type DecisaoConflitoContrato } from "@/lib/contratos.functions";
import type { ItemPlanoMaterializacao } from "@/lib/anexos-materializacao";

import { abrirPreparacaoContrato, solicitarRevisaoHumana } from "@/lib/contrato-preparar.functions";
import { checklistPreContrato, type EstadoChecklistItem } from "@/lib/contrato-checklist-pre";

const TITULO = "Preparar contrato do caso | Clube Ancestral";
const DESCRICAO = "Ficha única parametrizável e prévia contratual do caso, reaproveitando proposta, modelo ativo e anexos existentes.";

/**
 * Lista opcional de um payload já carregado (campo do registro, coluna JSONB ou
 * consulta secundária cujo erro a tela já mostra em bloco próprio).
 *
 * Existe para não escrever o coalescimento solto para lista vazia: ali a lista
 * vazia era indistinguível
 * de falha de leitura. Aqui a intenção fica declarada — falha de carga da
 * consulta principal já é barrada antes deste ponto, e o erro das consultas
 * secundárias (`qa`, `qi`) aparece nos painéis de Auditoria e Instância.
 */
function listaOpcional<T>(valor: T[] | null | undefined): T[] {
  return Array.isArray(valor) ? valor : [];
}

export const Route = createFileRoute("/_authenticated/casos/$caseId/contrato/preparar")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

/**
 * Cards colapsáveis da tela (CONTRATO-ANA-LEITURA-EM-UMA-HORA, 19/09/2026).
 * Nenhum começa aberto — Resumo e Decisão Humana, fora deste registro,
 * ficam sempre visíveis.
 */
const CARTOES = [
  "planejador",
  "formalizacao",
  "clausulas",
  "familia",
  "coerencia",
  "previas",
  "auditoria",
] as const;
type ChaveCartao = (typeof CARTOES)[number];

const TOM_ESTADO_CHECKLIST: Record<EstadoChecklistItem, "ok" | "alerta" | "erro"> = {
  concluido: "ok",
  pendente: "alerta",
  bloqueado: "erro",
};
const ROTULO_ESTADO_CHECKLIST: Record<EstadoChecklistItem, string> = {
  concluido: "Concluído",
  pendente: "Pendente",
  bloqueado: "Bloqueado",
};

function Pagina() {
  const autoridade = useAutoridade();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_os_anexos_previa" });
  const { caseId } = Route.useParams();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const qc = useQueryClient();
  const chave = ["contrato-preparar", caseId];
  const invalidar = () => qc.invalidateQueries({ queryKey: chave });

  // CONTRATO-ANA-LEITURA-EM-UMA-HORA: estado puro de UI, nunca dispara query
  // nem mutation. Cada card abre/fecha independente, sem accordion aninhado.
  const [cartoesAbertos, setCartoesAbertos] = useState<Record<ChaveCartao, boolean>>({
    planejador: false,
    formalizacao: false,
    clausulas: false,
    familia: false,
    coerencia: false,
    previas: false,
    auditoria: false,
  });
  const alternarCartao = (chave: ChaveCartao) =>
    setCartoesAbertos((v) => ({ ...v, [chave]: !v[chave] }));

  /**
   * Dois modos da mesma ficha (autorização da Proprietária, 2026-09-24):
   * "Preparar contrato" é o trabalho de dado (Planejador & Comercial,
   * Formalização & Anexos, Estrutura Familiar & Ficha); "Revisar prévia" é
   * a leitura de conferência (Cláusulas & Perfil Institucional, Coerência &
   * Instrumentos, Prévia & Versões, Auditoria). Nenhum card foi removido —
   * só passou a aparecer sob o modo certo, ainda colapsável como antes.
   */
  const [modo, setModo] = useState<"preparar" | "revisar">("preparar");

  const abrir = useServerFn(abrirPreparacaoContrato);
  const importar = useServerFn(preencherDeOrigens);
  const gerar = useServerFn(gerarPrevia);
  const congelar = useServerFn(congelarPrevia);
  const aprovar = useServerFn(aprovarParametros);
  const enviar = useServerFn(enviarParaAssinatura);
  const assinar = useServerFn(registrarAssinatura);
  const ver = useServerFn(lerPrevia);
  const revisar = useServerFn(solicitarRevisaoHumana);
  const lerInstancias = useServerFn(instanciasDocumentaisDoCaso);
  const carregarPerfilPersistido = useServerFn(lerPerfilInstitucionalPersistido);
  const garantirPerfil = useServerFn(garantirPerfilInstitucionalDaSessao);

  const q = useQuery({ queryKey: chave, queryFn: () => abrir({ data: { caseId } }), retry: false });
  const registroId = (q.data as any)?.registro?.id as string | undefined;

  const casoUuid = (q.data as any)?.caso?.id as string | undefined;
  const qi = useQuery({
    queryKey: [...chave, "instancias-anexos", casoUuid],
    queryFn: () => lerInstancias({ data: { caseId: casoUuid as string } }),
    enabled: Boolean(casoUuid),
  });

  // CA12-PERFIL (09/09/2026): perfil institucional persistido é a fonte
  // viva por organização — antes existia sem nenhuma tela consumindo.
  const qPerfilPersistido = useQuery({
    queryKey: ["perfil-institucional-persistido"],
    queryFn: () => carregarPerfilPersistido(),
  });
  /**
   * Fonte canônica do status do perfil institucional: o registro persistido em
   * `institutional_profiles`. Sem registro, cai no valor fixo de código.
   */
  const perfilStatusPersistido = qPerfilPersistido.data?.persistido
    ? (qPerfilPersistido.data.payload.status as EstadoVigenciaContratoBase)
    : undefined;
  const mGarantirPerfil = useMutation({
    mutationFn: () => garantirPerfil(),
    onSuccess: () => {
      toast.success("Perfil institucional registrado como fonte viva desta organização.");
      qc.invalidateQueries({ queryKey: ["perfil-institucional-persistido"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const materializar = useServerFn(materializarAnexosRevisados);
  const [planoRevisados, setPlanoRevisados] = useState<ItemPlanoMaterializacao[] | null>(null);
  const mMaterializar = useMutation({
    mutationFn: (confirmar: boolean) => materializar({ data: { id: registroId as string, confirmar } }),
    onSuccess: (r: any) => {
      setPlanoRevisados(listaOpcional(r.plano) as ItemPlanoMaterializacao[]);
      if (r.simulado) {
        toast.info("Prévia do lote: nada foi gravado ainda.");
        return;
      }
      toast.success(
        r.materializados
          ? `${r.materializados} anexo(s) revisado(s) materializado(s) como documento oficial do caso. Conteúdo aprovado preservado.`
          : "Nada a materializar: os anexos revisados já estão salvos ou preservados.",
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ressincronizar = useServerFn(ressincronizarAnexosDoCaso);
  const [planoRessincronizacao, setPlanoRessincronizacao] = useState<
    { codigo: string; titulo: string; acao: "materializar" | "ja_canonica"; versaoAtual: number | null }[] | null
  >(null);
  const mRessincronizar = useMutation({
    mutationFn: (confirmar: boolean) => ressincronizar({ data: { id: registroId as string, confirmar } }),
    onSuccess: (r: any) => {
      setPlanoRessincronizacao(listaOpcional(r.plano) as any);
      if (r.simulado) {
        toast.info("Prévia da sincronização: nada foi gravado ainda.");
        return;
      }
      toast.success(
        r.materializados
          ? `${r.materializados} anexo(s) sincronizado(s) a partir da ficha atual.`
          : "Nada a sincronizar: os anexos já refletem a ficha atual.",
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dispensarAnexo = useServerFn(dispensarAnexoComMotivo);
  const mDispensarAnexo = useMutation({
    mutationFn: (v: { annexCode: string; motivo: string }) =>
      dispensarAnexo({ data: { id: registroId as string, annexCode: v.annexCode, motivo: v.motivo } }),
    onSuccess: (r: any) => {
      toast.success(`Anexo ${r.annexCode} dispensado com motivo.`);
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reativarAnexo = useServerFn(reativarAnexoDispensado);
  const mReativarAnexo = useMutation({
    mutationFn: (v: { annexCode: string }) => reativarAnexo({ data: { id: registroId as string, annexCode: v.annexCode } }),
    onSuccess: (r: any) => {
      toast.success(r.jaAtivo ? `Anexo ${r.annexCode} já seguia pela regra vigente.` : `Anexo ${r.annexCode} voltou a seguir a regra vigente.`);
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reconciliarCpf = useServerFn(sincronizarPessoaDoCaso);
  const [planoReconciliacaoCpf, setPlanoReconciliacaoCpf] = useState<any[] | null>(null);
  const [contratoAssinadoReconciliacao, setContratoAssinadoReconciliacao] = useState(false);
  const mReconciliarCpf = useMutation({
    mutationFn: (confirmar: boolean) => reconciliarCpf({ data: { caseId, confirmar } }),
    onSuccess: (r: any) => {
      const plano = listaOpcional(r.plano) as any[];
      setPlanoReconciliacaoCpf(plano as any);
      setContratoAssinadoReconciliacao(Boolean(r.contratoAssinado));
      // Fase C (27/09/2026): preenchimento automático de campo vazio, sem
      // segundo clique — nunca dispara em contrato já assinado.
      if (r.simulado) {
        if (!r.contratoAssinado && plano.some((p: any) => p.acao === "preencher")) {
          mReconciliarCpf.mutate(true);
        } else {
          toast.info("Prévia da conferência de CPF: nada foi gravado ainda.");
        }
        return;
      }
      toast.success(
        r.atualizados
          ? `${r.atualizados} CPF(s) preenchido(s) a partir do cadastro canônico.`
          : "Nada a preencher: nenhuma parte estava com CPF vazio.",
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Fase E (27/09/2026): decisão explícita para conflito de CPF (atualizar
  // snapshot / manter com motivo / corrigir Pessoa Canônica) — nunca uma
  // sobrescrita silenciosa, sempre com motivo.
  const mResolverConflitoCpf = useMutation({
    mutationFn: (vars: { id: string; decisao: DecisaoConflitoContrato; motivo: string }) =>
      reconciliarCpf({ data: { caseId, resolverPartyId: vars.id, decisao: vars.decisao, motivo: vars.motivo } }),
    onSuccess: (r: any) => {
      setPlanoReconciliacaoCpf(listaOpcional(r.plano) as any);
      if (r.atualizados > 0) {
        toast.success("Conflito de CPF resolvido.");
        invalidar();
      } else {
        toast.success("Divergência mantida com o motivo registrado.");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [html, setHtml] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [assinatura, setAssinatura] = useState({ dataAssinatura: "", origemExterna: "", referencia: "" });

  const mImportar = useMutation({
    mutationFn: () => importar({ data: { id: registroId as string } }),
    onSuccess: (r: any) => {
      toast.success(
        `${r.importados} campo(s) carregados como “a confirmar”${r.conflitos.length ? ` · ${r.conflitos.length} conflito(s)` : ""}${
          r.limpos?.length ? ` · ${r.limpos.length} valor(es) fora da convenção homologada devolvidos a pendência` : ""
        }${
          r.proposta?.campos?.length
            ? ` · ${r.proposta.campos.length} campo(s) comercial(is) da proposta aprovada v${r.proposta.versao}`
            : ""
        }${r.proposta?.conflitos?.length ? ` · ${r.proposta.conflitos.length} divergência(s) proposta × Planejador` : ""}.`,
      );

      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mGerar = useMutation({
    mutationFn: (tipo: "rascunho" | "final") => gerar({ data: { id: registroId as string, tipo } }),
    onSuccess: (r: any) => {
      toast.success(
        r.identico
          ? "Rascunho já estava idêntico: nada mudou, nenhuma versão nova foi criada."
          : "Rascunho de trabalho atualizado (versão nova só em evento de governança).",
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mCongelar = useMutation({
    mutationFn: (v: { evento: any; motivo: string }) => congelar({ data: { id: registroId as string, ...v } }),
    onSuccess: (r: any) => {
      toast.success(r.duplicada ? `Conteúdo idêntico à v${r.versao}: versão reaproveitada.` : `Versão v${r.versao} congelada.`);
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mAprovar = useMutation({
    mutationFn: (previaId: string) => aprovar({ data: { id: registroId as string, previaId } }),
    onSuccess: () => {
      toast.success("Revisão humana aprovada e registrada.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mRevisar = useMutation({
    mutationFn: async () => {
      const r = await revisar({ data: { id: registroId as string, nota } });
      await congelar({ data: { id: registroId as string, evento: "revisao_solicitada", motivo: nota } });
      return r;
    },
    onSuccess: () => {
      toast.success("Revisão humana solicitada e registrada em auditoria.");
      setNota("");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mEnviar = useMutation({
    mutationFn: () => enviar({ data: { id: registroId as string } }),
    onSuccess: () => {
      toast.success("Solicitação de assinatura criada a partir dos parâmetros aprovados.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mAssinar = useMutation({
    mutationFn: (motivo: string) => assinar({ data: { id: registroId as string, ...assinatura, motivo } }),
    onSuccess: () => {
      toast.success("Assinatura externa registrada. Gates de financeiro e ativação seguem próprios.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mVer = useMutation({
    mutationFn: (previaId: string) => ver({ data: { previaId } }),
    onSuccess: (r: any) => setHtml(r.html),
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return (
      <SaasShell titulo="Preparar contrato">
        <p className="text-sm text-navy/60">Carregando o caso…</p>
      </SaasShell>
    );
  }
  if (q.error || !q.data) {
    return (
      <SaasShell titulo="Preparar contrato">
        <CaCard variante="compacto" titulo="Preparação bloqueada">
          <p className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
            {(q.error as Error)?.message ?? "Caso indisponível para esta organização."}
            {q.error ? (
              <button
                type="button"
                onClick={() => void q.refetch()}
                className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
              >
                Tentar novamente
              </button>
            ) : null}
          </p>
        </CaCard>
      </SaasShell>
    );
  }

  const d = q.data as any;
  const bloqueios = d.bloqueios as { chave: string; motivo: string }[];
  // Item 5 (autorização explícita da Proprietária, 2026-09-23): checklist
  // operacional real de pré-contrato. Reusa dado já carregado por esta
  // mesma tela (produtoPaiId, membros, bloqueios, contrato, faturas) —
  // nenhuma query nova além das duas adicionadas em abrirPreparacaoContrato
  // (case_plans, invoices).
  const checklistPre = checklistPreContrato({
    produtoPaiId: d.produtoPaiId ?? null,
    membros: listaOpcional(d.membros),
    bloqueios,
    registroStatus: d.registro?.status ?? null,
    contrato: d.contrato ?? null,
    faturas: listaOpcional(d.faturas),
  });
  const bloqueado = bloqueios.length > 0;
  const resolutivos = bloqueiosResolutivos(bloqueios, listaOpcional(d.valores) as any);
  const impeditivos = resolutivos.filter((b) => b.impeditivo);
  const rascunhoAtual = listaOpcional<any>(d.previas).find((p: any) => p.estado === "rascunho_editavel");
  const ultimaFinal = listaOpcional<any>(d.previas).find((p: any) => p.tipo === "final" && p.estado === "congelado");
  const finalAprovada = listaOpcional<any>(d.previas).find((p: any) => p.tipo === "final" && p.aprovado_em);
  // CA14-MATRIZES-DE-COMPOSICAO (09/09/2026): individual/casal/núcleo são
  // variações do mesmo contrato-base — aplicadas à composição real do caso
  // (titular/dependente já resolvidos por pessoasDoCasoComFallbackNucleo),
  // nunca por suposição nem por um segundo checklist jurídico.
  const composicaoCaso = modeloAplicavelAoCaso(listaOpcional(d.membros) as { titular: boolean; dependente: boolean }[]);

  // Anexos I–V: derivação somente-leitura da ficha, sem escrever nada.
  const entradaAnexos = entradaDeValores({
    caseId: d.caso.codigo,
    clienteNome: null,
    responsavel: null,
    contratoBaseVersao: CONTRATO_BASE_VERSAO,
    modelo: "MODELO-ESTUDO",
    valores: listaOpcional(d.valores) as any[],
  });
  const anexosGovernados = anexosIaV(entradaAnexos);
  const anexosPersistidosPorCodigo = Object.fromEntries(
    listaOpcional<any>(d.anexosPersistidos).map((p) => [p.annexCode, p]),
  );
  // Fila única de pendências (item 5, autorização "Contrato de Uma Hora",
  // 2026-09-24): soma o que já existe em três lugares distintos e conceitualmente
  // diferentes (checklist de prontidão, bloqueios de gate, pendências de anexo)
  // sem fundi-los numa entidade nova — cada contagem ainda aponta para a seção real.
  const pendenciasChecklist = checklistPre.filter((i) => i.estado !== "concluido").length;
  const pendenciasAnexos = pendenciasDosAnexos(anexosGovernados).length;
  const totalPendenciasFicha = pendenciasChecklist + bloqueios.length + pendenciasAnexos;
  const perfilInstitucional = perfilInstitucionalRenderizado(perfilStatusPersistido);
  const gatesContratuais = gatesBloqueados({
    anexos: anexosGovernados,
    modelo: "MODELO-ESTUDO",
    perfilInstitucionalAtivo: perfilInstitucional.vigente,
    metodoAssinaturaConfigurado: Boolean(listaOpcional<any>(d.valores).find((v) => v.campo === "forma_assinatura")?.valor),
    revisorHumanoAprovado: Boolean(finalAprovada),
    conflitos: [],
  });
  const clausulasAvaliadas = avaliarMatrizClausulas({
    modelo: "MODELO-ESTUDO",
    entradaAnexos,
    anexos: anexosGovernados,
    conflitos: [],
    /*
     * 04/09/2026 — achado real reportado pela Proprietária (pente fino
     * ponta a ponta na tela de preparação de contrato): estes dois campos
     * estavam hardcoded `false` para todo caso, sempre — nenhuma tela ou
     * fluxo jamais os definia como `true`, então a prévia final nunca
     * conseguia ser liberada (previaFinalLiberada exige zero cláusulas
     * bloqueantes), mesmo com o contrato-base já vigente. A cláusula H
     * (retenção/descarte) e a O (foro) do próprio contrato-base
     * (contrato-base-consolidado.ts, cláusulas 7.3 e 14.2) dizem
     * textualmente que essas regras "observarão a política institucional
     * versionada e vigente" — ou seja, já são a mesma vigência do
     * contrato-base (CONTRATO_BASE_STATUS), revisada nos itens 2 e 4 de
     * ITENS_REVISAO_JURIDICA antes de `CONTRATO_BASE_STATUS` virar
     * "vigente". Não era uma segunda aprovação pendente: era um campo que
     * nunca foi ligado à aprovação que já existia.
     */
    politicaPrivacidadeVigente: contratoBaseAssinavel(),
    foroConfigurado: contratoBaseAssinavel(),
    metodoAssinaturaConfigurado: Boolean(listaOpcional<any>(d.valores).find((v) => v.campo === "forma_assinatura")?.valor),
    revisaoJuridicaAprovada: Boolean(finalAprovada),
    perfilStatus: perfilStatusPersistido,
  });
  const blocosCaso = blocosRenderizados(anexosGovernados);
  const linhasInstancia = conferirInstancias(
    anexosGovernados.map((a: any) => ({
      codigo: a.codigo,
      titulo: a.titulo,
      status: statusTelaDeAnexo(a),
      modelo: null,
    })),
    listaOpcional(qi.data) as any,
  );
  // Autoridade operacional: bloqueio de gate não desabilita controle nem
  // esconde bloco. Vira pendência declarada, preservada na confirmação.
  const pendenciaBloqueios = bloqueios.length
    ? `${bloqueios.length} bloqueio(s) de gate aberto(s): ${bloqueios
        .map((b) => b.motivo)
        .join("; ")}`
    : null;
  const previaFinalCaso = previaFinalLiberada({
    modelo: "MODELO-ESTUDO",
    linhas: clausulasAvaliadas,
    bloqueiosGates: gatesContratuais,
  });

  /*
    Resgate Ana (autorização da Proprietária, 27/09/2026): a tela é o fluxo de
    revisão de uma hora do Contrato de Estudo Genealógico v2. Preparar:
    Proposta → Partes → Escopo → Condição particular → OS/Anexos → Pendências →
    Salvar. Revisar: Contrato v2 completo → Anexo I/OS e anexos → histórico →
    solicitar revisão. Matriz técnica, gates, fontes, auditoria e inventários
    ficam recolhidos em "Detalhes internos" — nada foi apagado.
  */
  const pendenciasHumanas = listaOpcional<any>(d.pendenciasHumanas);
  /*
   * Trilho de prontidão (04/10/2026): a tela já tinha todos os sinais, só não
   * respondia "onde está e o que falta" sem abrir cartão. Derivado do que já
   * foi carregado — nenhuma consulta nova, nenhum estado novo.
   */
  const prontidao = resumoProntidao({
    propostaAprovada: d.proposta?.status === "aprovada",
    completudePct: Number(d.completude?.pct ?? 0),
    partesComPendencia: listaOpcional<any>(d.valores).filter(
      (v) => ["partes", "membros"].includes(v.grupo) && v.obrigatorio && !String(v.valor ?? "").trim(),
    ).length,
    escopoResumoPreenchido: Boolean(
      String(listaOpcional<any>(d.valores).find((v) => v.campo === "escopo_resumo")?.valor ?? "").trim(),
    ),
    condicaoValor: (d.condicaoParticular as any)?.valor ?? null,
    anexoIStatus:
      listaOpcional<any>(d.anexosPersistidos).find((a) => a.annexCode === "ANEXO_I_ORDEM_SERVICO")?.status ?? null,
    anexosPendentes: pendenciasAnexos,
    rascunhoSalvo: Boolean(listaOpcional<any>(d.previas).find((p: any) => p.estado === "rascunho_editavel")),
    versaoFinalCongelada: Boolean(
      listaOpcional<any>(d.previas).find((p: any) => p.tipo === "final" && p.estado === "congelado"),
    ),
    revisaoAprovadaEm: (d.revisaoAprovadaEm as string | null) ?? null,
    assinaturaRegistradaEm: (d.contrato?.signed_at as string | null) ?? null,
    bloqueiosImpeditivos: bloqueiosResolutivos(bloqueios, listaOpcional(d.valores) as any)
      .filter((b) => b.impeditivo)
      .map((b) => b.titulo),
    pendenciasHumanas: listaOpcional<any>(d.pendenciasHumanas).length,
  });
  const instrumento = String(d.instrumento ?? "Contrato de Estudo Genealógico v2");

  /*
   * Saída em documento (04/10/2026): medido que não existia nenhuma — a prévia
   * só vivia dentro do iframe da tela. A identificação abaixo vem do que a
   * tela já carregou; o conteúdo é o MESMO HTML da prévia gerada.
   */
  const previaVisivel = listaOpcional<any>(d.previas).find((p: any) => p.estado === "rascunho_editavel")
    ? "rascunho de trabalho"
    : ultimaFinal
      ? `versão v${ultimaFinal.versao} (congelada)`
      : "sem versão gerada";
  const identificacaoDocumento = {
    caso: String(d.caso?.codigo ?? "—"),
    instrumento,
    versao: previaVisivel,
    revisao: d.revisaoAprovadaEm
      ? `aprovada em ${new Date(d.revisaoAprovadaEm).toLocaleDateString("pt-BR")}`
      : "ainda não aprovada",
    geradoEm: new Date().toLocaleString("pt-BR"),
  };
  const condicao = d.condicaoParticular ?? null;
  const planejadorCaso = d.planejador ?? null;
  const governado = Boolean(d.governadoPeloPlanejador);
  const gruposFicha = (grupos: string[]) =>
    grupos.flatMap((g) => {
      const itens = listaOpcional<any>(d.valores).filter((v) => v.grupo === g);
      if (!itens.length) return [];
      const titulo = GRUPOS.find((x) => x.chave === g)?.titulo ?? g;
      return [
        <p key={`t-${g}`} className="text-xs uppercase tracking-wide text-navy/50">
          {titulo}
        </p>,
        // A chave inclui valor/status: depois de salvar e reler, a linha
        // remonta com o valor persistido (nunca um rascunho só do navegador).
        ...itens.map((v) => (
          <LinhaParametro key={`${v.id}:${v.valor ?? ""}:${v.status ?? ""}`} valor={v} aoMudar={invalidar} />
        )),
      ];
    });

  return (
    <SaasShell titulo={`${instrumento} — ${d.caso.codigo}`}>
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <div className="space-y-6">
        {/* ===================== CABEÇALHO ===================== */}
        <CaCard
          variante="compacto"
          titulo={`${instrumento} — ${d.caso.codigo} — ${d.cliente?.nome ?? "cliente não vinculado"}`}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs" data-instrumento-contrato>
            <Selo texto={`Situação da ficha: ${d.registro.status}`} tom={d.registro.status === "assinado" ? "ok" : "alerta"} />
            {governado ? (
              <Selo texto="Governado pelo Planejador + proposta Canva" tom="ok" />
            ) : null}
            <span data-contrato-validacao-documental>
              <Selo
                texto={
                  d.caso.documentos_minimos_ok
                    ? "Validação jurídica: cadeia documental completa"
                    : "Validação jurídica: documentos mínimos pendentes"
                }
                tom={d.caso.documentos_minimos_ok ? "ok" : "alerta"}
              />
            </span>
            {d.contrato && (
              <Link
                to="/contratos/$id"
                params={{ id: d.contrato.id }}
                title="Abrir Partes, Escopo, Cláusulas e Anexos do instrumento registrado"
              >
                <Selo texto={`Contrato ${d.contrato.contract_number} · ${d.contrato.status} · abrir instrumento →`} tom="neutro" />
              </Link>
            )}
          </div>
          {d.aliasDe && (
            <p className="mt-2 rounded border border-gold/50 bg-gold/10 p-2 text-xs text-navy">
              Referência legada/interna corrigida. Este fluxo opera no caso <strong>{d.caso.codigo}</strong>. A referência{" "}
              <strong>{d.aliasDe}</strong> é interna incorreta: preservada apenas como histórico, sem criar, contratar, assinar,
              cobrar, pesquisar ou operar por ela — nada foi copiado nem duplicado.
            </p>
          )}
          <p className="mt-2 text-xs text-navy/60">
            {d.cliente?.id ? (
              <Link
                to="/pessoas/$clienteId"
                params={{ clienteId: String(d.cliente.id) }}
                className="font-medium text-navy underline underline-offset-2"
              >
                Abrir Pessoa 360
              </Link>
            ) : (
              <span className="text-navy/50">Vincule o cliente do caso para abrir a Pessoa 360.</span>
            )}
            {" · "}
            <Link to="/casos/$caseId" params={{ caseId }} className="font-medium text-navy underline underline-offset-2">
              Caso 360
            </Link>
          </p>
        </CaCard>

        <TrilhoProntidaoContrato resumo={prontidao} />

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Modo de trabalho da ficha">
          <button
            type="button"
            role="tab"
            aria-selected={modo === "preparar"}
            onClick={() => setModo("preparar")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              modo === "preparar" ? "bg-navy text-cream" : "border border-navy/20 text-navy/70"
            }`}
          >
            Preparar contrato
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === "revisar"}
            onClick={() => setModo("revisar")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              modo === "revisar" ? "bg-navy text-cream" : "border border-navy/20 text-navy/70"
            }`}
          >
            Revisar prévia
          </button>
        </div>

        {/* ===================== PREPARAR CONTRATO ===================== */}
        {modo === "preparar" && (
          <div className="space-y-4" data-modo-preparar>
            <div id="proposta">
            <CaCard titulo="1. Proposta aprovada">
              <ul className="space-y-1 text-sm text-navy/80">
                <li>
                  <strong>Proposta:</strong>{" "}
                  {d.proposta ? (
                    <>
                      v{d.proposta.versao} · {d.proposta.status}
                      {d.proposta.origem === "canva" ? " · Canva" : ""} · {moeda(d.proposta.valor, d.proposta.moeda)}
                    </>
                  ) : (
                    <span className="text-terracotta">não localizada</span>
                  )}
                </li>
                <li>
                  <strong>Planejador:</strong>{" "}
                  {planejadorCaso
                    ? [
                        planejadorCaso.produtoPaiId ? `Produto-Pai ${planejadorCaso.produtoPaiId}` : "Produto-Pai não definido",
                        planejadorCaso.rota ? `rota ${planejadorCaso.rota}` : null,
                        planejadorCaso.fase ? `fase ${planejadorCaso.fase}` : null,
                        planejadorCaso.marco ? `marco ${planejadorCaso.marco}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "sem plano ativo"}
                </li>
                <li>
                  <strong>Composição ({d.membros.length}):</strong>{" "}
                  {d.membros.length
                    ? d.membros.map((m: any) => `${m.nome}${m.requerente ? " (requerente)" : ""}`).join(" · ")
                    : "nenhum membro vinculado"}
                </li>
              </ul>
              <div id="canva" className="mt-3">
                <CompletudeCanva caseId={caseId} proposalId={(d.proposta as any)?.id ?? null} podeEscrever={podeEscrever} />
              </div>
              <div className="mt-3">
                <button
                  onClick={() => mImportar.mutate()}
                  disabled={mImportar.isPending}
                  className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
                >
                  Pré-carregar do Planejador homologado (sem redigitação)
                </button>
              </div>
            </CaCard>

            </div>

            <div id="partes">
              <CaCard titulo="2. Partes e representação">
                <div className="space-y-3">
                  <EstruturaFamiliar codigoCaso={d.caso?.codigo} caseId={caseId} />
                  <ReconciliarContatoPartesContrato
                    caseId={caseId}
                    contratoAssinado={contratoAssinadoReconciliacao}
                    onMudou={invalidar}
                  />
                  <ReconciliarCpfPartes
                    plano={planoReconciliacaoCpf}
                    contratoAssinado={contratoAssinadoReconciliacao}
                    ocupado={mReconciliarCpf.isPending || mResolverConflitoCpf.isPending}
                    onVerificar={() => mReconciliarCpf.mutate(false)}
                    onSincronizar={() => mReconciliarCpf.mutate(true)}
                    onResolverConflito={(id, decisao, motivo) =>
                      mResolverConflitoCpf.mutate({ id, decisao, motivo })
                    }
                  />
                  <div id="dependentes">
                    <PainelDependentes caseId={caseId} podeEscrever={podeEscrever} />
                  </div>
                  <div id="ficha" className="space-y-3">{gruposFicha(["partes", "membros"])}</div>
                </div>
              </CaCard>
            </div>

            <div id="escopo">
            <CaCard titulo="3. Escopo e entregas">
              <EscopoProposta dados={(d as any).escopo} proposta={d.proposta as any} />
              <div className="mt-3 space-y-3">{gruposFicha(["objeto", "servicos"])}</div>
              {/*
                Divergência de país/rota tem ação corretiva real, então fica no
                fluxo. As três conferências que só repetiam o mesmo ato
                (instrumentos, matriz jurídica, preparação) saíram da tela por
                decisão da Proprietária em 04/10/2026 — os componentes e as
                rotas continuam no repositório.
              */}
              <div id="coerencia" className="mt-3">
                <ConflitoCoerencia
                  coerencia={d.coerencia}
                  valorPaisRota={listaOpcional<any>(d.valores).find((v) => v.campo === "pais_rota") ?? null}
                  aoCorrigir={invalidar}
                />
              </div>
            </CaCard>

            </div>

            <div id="comercial">
            <CaCard titulo="4. Condição particular do caso">
              <div data-condicao-particular className="space-y-1 text-sm text-navy/80">
                <p>
                  <strong>Valor:</strong> {condicao?.valor != null ? moeda(condicao.valor, "BRL") : "não registrado"}
                </p>
                <p>
                  <strong>Condição:</strong> {condicao?.condicao ?? "não registrada"}
                </p>
                {condicao?.composicao ? (
                  <p>
                    <strong>Composição familiar:</strong> {condicao.composicao}
                  </p>
                ) : null}
                <p className="text-[11px] text-navy/50">Fonte: {condicao?.fonte ?? "—"}. Sem SKU técnico nem catálogo.</p>
              </div>
              <div className="mt-3 space-y-3">{gruposFicha(["comerciais"])}</div>
            </CaCard>
            </div>

            <div id="anexos">
              <CaCard titulo="5. Ordem de Serviço (Anexo I) e anexos">
                <CadeiaFormalizacao caseId={caseId} podeEscrever={podeEscrever} governadoPeloPlanejador={governado} />
                <div className="mt-3">
                  <AnexosIaV
                    anexos={anexosGovernados}
                    entrada={entradaAnexos}
                    persistidos={anexosPersistidosPorCodigo}
                    renderAcoes={
                      podeEscrever
                        ? (a, persistido) =>
                            persistido?.overrideManual ? (
                              <AcaoOperacional
                                rotulo="Reativar regra do anexo"
                                acaoExterna="reativar_anexo_dispensado"
                                efeito={`Volta o anexo ${a.codigo} a seguir a regra vigente, desfazendo a dispensa manual registrada.`}
                                className="rounded border border-navy/20 px-2 py-1 text-[11px] text-navy/80"
                                onConfirmar={() => mReativarAnexo.mutate({ annexCode: a.codigo })}
                              />
                            ) : (
                              <AcaoOperacional
                                rotulo="Dispensar anexo com motivo"
                                acaoExterna="dispensar_anexo_com_motivo"
                                pendenciaGate={persistido ? null : "Anexo ainda não sincronizado — sincronize antes de dispensar."}
                                efeito={`Marca o anexo ${a.codigo} como não aplicável a este caso por decisão humana, com motivo registrado. Não altera cláusula nem toca instância já anexada/assinada.`}
                                className="rounded border border-terracotta/40 px-2 py-1 text-[11px] text-terracotta"
                                onConfirmar={(motivo) => mDispensarAnexo.mutate({ annexCode: a.codigo, motivo })}
                              />
                            )
                        : undefined
                    }
                  />
                </div>
              </CaCard>
            </div>

            <CaCard titulo="6. Salvar rascunho">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => mGerar.mutate("rascunho")}
                  disabled={mGerar.isPending}
                  className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
                >
                  Salvar rascunho
                </button>
                <span className="text-[11px] text-navy/60" data-estado-rascunho>
                  {mGerar.isPending
                    ? "Salvando rascunho…"
                    : rascunhoAtual
                      ? `Rascunho salvo em ${new Date(rascunhoAtual.created_at).toLocaleString("pt-BR")} (relido do servidor).`
                      : "Nenhum rascunho salvo ainda."}
                </span>
              </div>
              <p className="mt-2 text-xs text-navy/60">
                Salvar grava e relê o rascunho único deste caso. Nada é criado, enviado, assinado, cobrado ou publicado
                externamente a partir daqui.
              </p>
            </CaCard>
          </div>
        )}

        {/* ===================== REVISAR PRÉVIA ===================== */}
        {modo === "revisar" && (
          <div className="space-y-4" data-modo-revisar>
            <div id="previas">
              <CaCard titulo={`1. ${instrumento} — prévia completa`}>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => mGerar.mutate("rascunho")}
                    disabled={mGerar.isPending}
                    className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
                  >
                    Salvar rascunho de trabalho
                  </button>
                  {(rascunhoAtual ?? listaOpcional<any>(d.previas)[0]) && (
                    <button
                      onClick={() => mVer.mutate((rascunhoAtual ?? listaOpcional<any>(d.previas)[0]).id)}
                      className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
                    >
                      Ver prévia do contrato completo
                    </button>
                  )}
                  <AbrirDocumentoContrato html={html} identificacao={identificacaoDocumento} />
                  <span className="self-center text-[11px] text-navy/60">
                    {mGerar.isPending
                      ? "Salvando rascunho…"
                      : rascunhoAtual
                        ? "Rascunho salvo."
                        : "Nenhum rascunho salvo ainda."}
                  </span>
                </div>
                {html && (
                  <iframe
                    title="Prévia do instrumento"
                    srcDoc={html}
                    sandbox=""
                    className="mt-3 h-[640px] w-full rounded-lg border border-navy/15 bg-cream/40"
                  />
                )}
              </CaCard>
            </div>

            <CaCard titulo="2. Anexo I (Ordem de Serviço) e anexos aplicáveis">
              <AnexosAplicaveis
                valores={listaOpcional(d.valores)}
                anexosGerados={listaOpcional(d.anexos)}
                aoVerPrevia={(codigo) => {
                  const alvo = rascunhoAtual ?? listaOpcional<any>(d.previas)[0];
                  if (alvo) mVer.mutate(alvo.id);
                  else toast.info(`Gere o rascunho de trabalho para visualizar a instância de ${codigo}.`);
                  document.getElementById("previas")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </CaCard>

            <CaCard titulo="3. Versões e histórico">
              <div className="space-y-2">
                {(d.previas as any[]).map((p) => (
                  <div key={p.id} className="rounded-lg border border-navy/15 bg-cream/40 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-navy">
                          {p.estado === "rascunho_editavel" ? "Rascunho de trabalho (editável)" : `Versão v${p.versao} (congelada)`}
                        </p>
                        <p className="text-xs text-navy/60">
                          {ROTULO_EVENTO_PREVIA[p.evento ?? ""] ?? "Evento não registrado"} ·{" "}
                          {new Date(p.congelado_em ?? p.created_at).toLocaleString("pt-BR")}
                        </p>
                        {p.motivo && <p className="text-xs text-navy/60">Motivo: {p.motivo}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => mVer.mutate(p.id)} className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80">
                          Ver prévia
                        </button>
                        {p.tipo === "final" && !p.aprovado_em && (
                          <button onClick={() => mAprovar.mutate(p.id)} className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream">
                            Aprovar revisão humana
                          </button>
                        )}
                        {p.aprovado_em && <Selo texto="Revisão aprovada" tom="ok" />}
                      </div>
                    </div>
                  </div>
                ))}
                {d.previas.length === 0 && <p className="text-sm text-navy/60">Nenhuma prévia gerada ainda.</p>}
              </div>
            </CaCard>

            <div id="decisao-humana">
              <CaCard titulo="4. Solicitar revisão, aprovar e preparar assinatura">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className={`${inputCls} md:w-1/2`}
                        value={nota}
                        maxLength={500}
                        onChange={(e) => setNota(e.target.value)}
                        placeholder="O que precisa de revisão humana"
                      />
                      <button
                        onClick={() => mRevisar.mutate()}
                        disabled={mRevisar.isPending || !nota.trim()}
                        title="Registra o pedido de revisão humana em auditoria."
                        className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
                      >
                        Solicitar revisão humana
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AcaoOperacional
                        rotulo="Congelar retorno para ajuste"
                        className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50"
                        acaoExterna="congelar_retorno_ajuste"
                        efeito={
                          rascunhoAtual
                            ? "Congela o rascunho atual como retorno para ajuste — vira versão imutável no histórico."
                            : "Nenhum rascunho editável no momento — a pendência fica registrada."
                        }
                        onConfirmar={(motivo) => mCongelar.mutate({ evento: "retorno_ajuste", motivo })}
                      />
                      <AcaoOperacional
                        rotulo="Congelar versão final"
                        className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
                        acaoExterna="congelar_versao_final"
                        efeito={
                          pendenciasHumanas.some((p: any) => p.chave !== "revisao_previa")
                            ? "Ainda há pendência humana aberta — é possível prosseguir; a pendência fica registrada."
                            : "Congela a versão final do contrato — vira versão imutável no histórico."
                        }
                        onConfirmar={(motivo) => mCongelar.mutate({ evento: "aprovacao", motivo })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-navy/10 pt-3">
                    <p className="text-sm text-navy/70">
                      {d.revisaoAprovadaEm
                        ? `Revisão humana aprovada em ${new Date(d.revisaoAprovadaEm).toLocaleString("pt-BR")}.`
                        : "Revisão humana ainda não aprovada. Assinatura e cobrança são atos externos posteriores."}
                    </p>
                    <AcaoOperacional
                      rotulo="Criar solicitação de assinatura"
                      acaoExterna="solicitar_assinatura"
                      pendenciaGate={
                        [
                          pendenciaBloqueios,
                          d.revisaoAprovadaEm ? null : "Revisão humana ainda não aprovada.",
                          ["aprovado", "validado"].includes(d.registro.status)
                            ? null
                            : `Registro do contrato está em "${d.registro.status}", não em aprovado nem validado.`,
                        ]
                          .filter(Boolean)
                          .join(" ") || null
                      }
                      efeito="Cria a solicitação de assinatura do contrato, registrando template, versão e aprovador."
                      className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
                      onConfirmar={() => {
                        if (mEnviar.isPending) return;
                        mEnviar.mutate();
                      }}
                    />
                    {finalAprovada && d.registro.contract_id && (
                      <div className="grid gap-2 md:grid-cols-4">
                        <input
                          className={inputCls}
                          type="date"
                          value={assinatura.dataAssinatura}
                          onChange={(e) => setAssinatura({ ...assinatura, dataAssinatura: e.target.value })}
                        />
                        <input
                          className={inputCls}
                          placeholder="Origem externa da assinatura"
                          maxLength={200}
                          value={assinatura.origemExterna}
                          onChange={(e) => setAssinatura({ ...assinatura, origemExterna: e.target.value })}
                        />
                        <input
                          className={inputCls}
                          placeholder="Referência / comprovante"
                          maxLength={200}
                          value={assinatura.referencia}
                          onChange={(e) => setAssinatura({ ...assinatura, referencia: e.target.value })}
                        />
                        <AcaoOperacional
                          rotulo="Registrar assinatura externa"
                          acaoExterna="registrar_assinatura_externa"
                          validacaoFormulario={
                            !assinatura.dataAssinatura || !assinatura.origemExterna || !assinatura.referencia
                              ? "Preencha data, origem externa e referência da assinatura antes de confirmar."
                              : null
                          }
                          efeito="Marca o contrato como assinado e atualiza o caso. Esse estado passa a atender uma condição usada na liberação de acesso ao Portal do Cliente — não publica conteúdo, não envia mensagem, não gera cobrança e não concede acesso automaticamente."
                          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
                          onConfirmar={(motivo) => {
                            if (mAssinar.isPending) return;
                            mAssinar.mutate(motivo);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {ultimaFinal && !ultimaFinal.aprovado_em && (
                  <p className="mt-1 text-xs text-terracotta">Versão final gerada aguardando aprovação de revisão humana.</p>
                )}
              </CaCard>
            </div>
          </div>
        )}

        {/* ===================== DETALHES INTERNOS (recolhidos) ===================== */}
        <details id="detalhes-internos" className="rounded-lg border border-navy/15 bg-card p-4">
          <summary className="cursor-pointer text-sm font-medium text-navy/70">
            Detalhes internos (matriz técnica, gates, fontes, auditoria e inventários)
          </summary>
          <div className="mt-4 space-y-4 border-t border-navy/10 pt-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Selo texto={`Completude ${d.completude?.pct ?? 0}%`} tom={(d.completude?.pct ?? 0) === 100 ? "ok" : "alerta"} />
              <Selo texto={`Modelo: ${d.modelo?.code ?? "não localizado"}`} tom={d.modelo ? "ok" : "erro"} />
              <Selo texto={`Base: ${d.base?.code ?? "não localizada"}`} tom={d.base ? "ok" : "erro"} />
              <span className="text-navy/60" data-fila-pendencias-ficha-interna>
                {totalPendenciasFicha} marcador(es) técnico(s): {pendenciasChecklist} checklist · {bloqueios.length} gate(s) ·{" "}
                {pendenciasAnexos} anexo(s)
              </span>
            </div>
            {d.caso.codigos_legados?.length > 0 && (
              <p className="text-xs text-navy/60">
                Códigos legados registrados (somente referência): {d.caso.codigos_legados.join(", ")}
              </p>
            )}

            <CartaoDetalhe
              titulo="Planejador & Comercial (fontes)"
              aberto={cartoesAbertos.planejador}
              aoAlternar={() => alternarCartao("planejador")}
            >
              <PlanejadorOperacional caseId={caseId} podeEscrever={podeEscrever} />
              <CadeiaOperacional caseId={caseId} podeEscrever={podeEscrever} />
              <RegraComercial caseId={caseId} />
              <CaCard variante="compacto" titulo="Entidades reaproveitadas (nada é duplicado)">
                <ul className="space-y-1 text-sm text-navy/80">
                  <li>
                    <strong>Ficha de parâmetros:</strong> única por caso (reaproveitada quando já existe)
                  </li>
                  <li>
                    <strong>Template ativo:</strong> {d.modelo ? `${d.modelo.name} v${d.modelo.template_version}` : "—"} +{" "}
                    {d.base ? `${d.base.name} v${d.base.template_version}` : "—"}
                  </li>
                  <li>
                    <strong>Anexos pelas regras existentes:</strong> {d.anexos.map((a: any) => a.codigo).join(", ") || "—"}
                  </li>
                  <li>
                    <strong>Composição contratual (matriz aplicável):</strong>{" "}
                    {composicaoCaso.estado === "sem_dados" ? (
                      <span className="text-terracotta">Sem dados suficientes — {composicaoCaso.motivo}</span>
                    ) : (
                      <>
                        {composicaoCaso.modelo.nome} — {composicaoCaso.motivo}
                        <span className="ml-2 text-navy/50">
                          Anexos aplicáveis: {composicaoCaso.modelo.anexos.map((a) => a.codigo).join(", ")}
                        </span>
                      </>
                    )}
                  </li>
                  <li>
                    <strong>Cadastro CRM:</strong>{" "}
                    {d.cliente ? [d.cliente.email, d.cliente.telefone].filter(Boolean).join(" · ") || "sem contato" : "—"}
                  </li>
                </ul>
              </CaCard>
            </CartaoDetalhe>

            <CartaoDetalhe
              titulo="Instâncias documentais dos anexos"
              aberto={cartoesAbertos.formalizacao}
              aoAlternar={() => alternarCartao("formalizacao")}
            >
              {qi.isError ? (
                <p className="mb-2 flex flex-wrap items-center gap-3 text-xs text-terracotta">
                  Não foi possível carregar os anexos.
                  <button
                    type="button"
                    onClick={() => void qi.refetch()}
                    className="rounded-md border border-terracotta/50 px-2 py-1 text-[11px] font-medium text-terracotta hover:bg-terracotta/10"
                  >
                    Tentar novamente
                  </button>
                </p>
              ) : null}
              <InstanciaDocumental linhas={linhasInstancia} carregando={qi.isLoading} />
              <div className="mt-2">
                <MaterializarRevisados
                  plano={planoRevisados}
                  ocupado={mMaterializar.isPending}
                  onVerificar={() => mMaterializar.mutate(false)}
                  onMaterializar={() => mMaterializar.mutate(true)}
                />
              </div>
              <div className="mt-2">
                <RessincronizarAnexos
                  plano={planoRessincronizacao}
                  ocupado={mRessincronizar.isPending}
                  onVerificar={() => mRessincronizar.mutate(false)}
                  onSincronizar={() => mRessincronizar.mutate(true)}
                />
              </div>
              <div className="mt-3">
                <PainelPendenciasContratuais anexos={anexosGovernados} gates={gatesContratuais} />
              </div>
            </CartaoDetalhe>

            <CartaoDetalhe
              titulo="Cláusulas & Perfil Institucional"
              resumo={`Prévia final ${previaFinalCaso.liberada ? "liberada" : "bloqueada"}`}
              aberto={cartoesAbertos.clausulas}
              aoAlternar={() => alternarCartao("clausulas")}
            >
              <CaCard variante="compacto" titulo="Perfil institucional e matriz de cláusulas A–P">
                <p className="mb-2 text-[11px] text-navy/60">
                  Texto jurídico fixo não é editável por caso.{" "}
                  <Link to="/governanca/contrato-base" className="text-terracotta underline">
                    Ver contrato-base
                  </Link>
                </p>
                {qPerfilPersistido.data && !qPerfilPersistido.data.persistido && (
                  <div className="mb-2 rounded-lg border border-terracotta/40 bg-terracotta/5 p-2 text-[11px] text-terracotta">
                    <p>
                      Pendência: perfil institucional ainda não registrado como fonte viva nesta organização — a prévia usa a
                      versão de referência do contrato-base até o registro.
                    </p>
                    <button
                      type="button"
                      onClick={() => mGarantirPerfil.mutate()}
                      disabled={mGarantirPerfil.isPending}
                      className="mt-1 rounded border border-terracotta/50 px-2 py-1 disabled:opacity-60"
                    >
                      {mGarantirPerfil.isPending ? "Registrando…" : "Registrar perfil institucional desta organização"}
                    </button>
                  </div>
                )}
                <PerfilInstitucionalBloco
                  campos={perfilInstitucional.campos}
                  versao={perfilInstitucional.versao}
                  status={perfilInstitucional.status}
                  pendencias={perfilInstitucional.pendencias}
                />
                <div className="mt-3 space-y-3">
                  <MatrizClausulas linhas={clausulasAvaliadas} />
                  <MatrizAceiteTabela blocos={blocosCaso} />
                </div>
              </CaCard>
            </CartaoDetalhe>

            <CartaoDetalhe
              titulo="Ficha — assinatura e governança"
              aberto={cartoesAbertos.familia}
              aoAlternar={() => alternarCartao("familia")}
            >
              <GovernancaFicha />
              {BLOCOS_FICHA.map((s) => (
                <CaCard variante="compacto" key={s.chave} titulo={s.titulo}>
                  <CabecalhoBloco bloco={s} estado={estadoDoBloco(listaOpcional(d.valores) as any[], s.grupos)} />
                </CaCard>
              ))}
              <div className="space-y-3">{gruposFicha(["assinatura"])}</div>
            </CartaoDetalhe>

            <p className="text-xs text-navy/60">
              A trilha de auditoria desta organização — incluindo cada evento desta preparação — fica em um único
              lugar:{" "}
              <Link to="/configuracoes" className="font-medium text-navy underline underline-offset-2">
                Configuração › trilha de auditoria
              </Link>
              .
            </p>
          </div>
        </details>
      </div>
    </SaasShell>
  );
}
