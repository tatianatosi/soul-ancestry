import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AvisoFalhaConexao } from "@/components/portal/aviso-falha-conexao";
import { MENSAGEM_CONTEUDO_MANTIDO } from "@/lib/portal-resiliencia";
import { useServerFn } from "@tanstack/react-start";
import { UploadCloud } from "lucide-react";

import {
  confirmarEnvioDocumento,
  prepararEnvioDocumento,
} from "@/lib/portal-cliente.functions";
import {
  erroDoArquivoCliente,
  FORMATOS_ROTULO,
  TAMANHO_MAXIMO_ROTULO,
} from "@/lib/portal-envio-arquivo";

/**
 * Caixa "Enviar novo documento" da aba Documentos (mockup 5/7).
 *
 * 21/09/2026 — `prepararEnvioDocumento`/`confirmarEnvioDocumento` já
 * existiam e funcionavam, mas só eram chamados pela rota profunda
 * `/portal/casos/$id`. A aba Documentos, que no mockup aprovado tem a caixa
 * de envio, não os chamava: o cliente não conseguia enviar documento pela
 * tela feita para isso. Este componente conecta os escritores existentes —
 * nenhum escritor novo.
 *
 * O envio é em dois passos, como o servidor exige: URL temporária assinada,
 * PUT do arquivo, e só então o registro. O banco força "pendente de
 * revisão": enviar não é validar nem liberar.
 */
export function EnviarDocumento({
  casoId,
  solicitacaoId = null,
}: {
  casoId: string | null;
  solicitacaoId?: string | null;
}) {
  const queryClient = useQueryClient();
  const preparar = useServerFn(prepararEnvioDocumento);
  const confirmar = useServerFn(confirmarEnvioDocumento);
  const entrada = useRef<HTMLInputElement | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);
  // 12/10/2026: o arquivo escolhido só sai daqui depois do sucesso.
  const [pendente, setPendente] = useState<File | null>(null);

  const envio = useMutation({
    mutationFn: async (arquivo: File) => {
      if (!casoId) throw new Error("Nenhum acompanhamento selecionado para receber o arquivo.");
      const pronto = await preparar({
        data: { casoId, nome: arquivo.name, tamanho: arquivo.size },
      });
      const resposta = await fetch(pronto.url, { method: "PUT", body: arquivo });
      if (!resposta.ok) throw new Error("Falha no envio do arquivo. Tente novamente.");
      await confirmar({
        data: {
          casoId,
          solicitacaoId,
          titulo: arquivo.name,
          caminho: pronto.caminho,
          nomeArquivo: arquivo.name,
          tamanho: arquivo.size,
        },
      });
      return arquivo.name;
    },
    onSuccess: (nome) => {
      setPendente(null);
      setEnviado(nome);
      // Sem isso o arquivo enviado só apareceria no próximo F5.
      void queryClient.invalidateQueries({ queryKey: ["portal-entregas"] });
      void queryClient.invalidateQueries({ queryKey: ["portal-dados-vivos"] });
    },
    onError: () => setErro(MENSAGEM_CONTEUDO_MANTIDO),
  });

  function escolher(arquivo: File | undefined) {
    setErro(null);
    setEnviado(null);
    setPendente(null);
    if (!arquivo) return;
    // Mesma regra do servidor: recusar aqui evita subir arquivo que seria
    // recusado depois, e a mensagem é idêntica nos dois lados.
    const recusa = erroDoArquivoCliente(arquivo.name, arquivo.size);
    if (recusa) {
      setErro(recusa);
      return;
    }
    setPendente(arquivo);
    envio.mutate(arquivo);
  }

  const ocupado = envio.isPending;

  return (
    <section className="rounded-2xl border border-dashed border-gold/60 bg-cream/40 p-6 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gold/20 text-navy">
        <UploadCloud className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-3 text-base font-semibold text-navy">Enviar novo documento</h2>
      <p className="mt-1 text-xs text-navy/60">
        {FORMATOS_ROTULO} — até {TAMANHO_MAXIMO_ROTULO} por arquivo.
      </p>

      <input
        ref={entrada}
        type="file"
        className="sr-only"
        onChange={(e) => {
          escolher(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={ocupado || !casoId}
        onClick={() => entrada.current?.click()}
        className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-50"
      >
        {ocupado ? "Enviando…" : "Selecionar arquivo"}
      </button>

      {!casoId ? (
        <p className="mt-3 text-xs text-navy/55">
          Assim que um acompanhamento estiver selecionado, o envio fica disponível aqui.
        </p>
      ) : null}

      {erro && pendente && !ocupado ? (
        <div className="mt-3 text-left">
          <p className="mb-2 text-xs text-navy/70" data-arquivo-mantido>
            Arquivo mantido: “{pendente.name}”
          </p>
          <AvisoFalhaConexao
            mensagem={MENSAGEM_CONTEUDO_MANTIDO}
            rotuloBotao="Reenviar"
            aoTentar={() => {
              setErro(null);
              envio.mutate(pendente);
            }}
          />
        </div>
      ) : erro ? (
        <p role="alert" className="mt-3 text-xs text-terracotta">
          {erro}
        </p>
      ) : null}

      {enviado ? (
        <p role="status" className="mt-3 text-xs text-navy/70">
          “{enviado}” foi enviado e está aguardando a conferência da equipe.
        </p>
      ) : null}
    </section>
  );
}
