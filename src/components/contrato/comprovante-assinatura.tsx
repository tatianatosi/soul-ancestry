/**
 * Comprovante de assinatura: sobe o documento assinado real ao acervo
 * privado (interno restrito) e, só depois de gravado, registra a assinatura
 * no contrato pelo escritor existente — referência = documento guardado.
 * Nada é enviado, assinado ou cobrado daqui.
 */
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { prepararUploadDocumento, salvarDocumento } from "@/lib/documentos.functions";
import { registrarAssinaturaContratoGoLive } from "@/lib/golive-escritores.functions";
import { useEscritorGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";

export function ComprovanteAssinatura({ casoId, contratoId, versao }: { casoId: string; contratoId: string; versao?: number | string | null }) {
  const preparar = useServerFn(prepararUploadDocumento);
  const salvar = useServerFn(salvarDocumento);
  const registrar = useEscritorGoLive(registrarAssinaturaContratoGoLive);
  const qc = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [data, setData] = useState("");
  const [forma, setForma] = useState("");
  const [estado, setEstado] = useState<{ tipo: "ok" | "erro" | "andamento"; texto: string } | null>(null);

  async function enviar() {
    if (!arquivo) return setEstado({ tipo: "erro", texto: "Escolha o documento assinado." });
    if (!data) return setEstado({ tipo: "erro", texto: "Informe a data da assinatura." });
    setEstado({ tipo: "andamento", texto: "Guardando o documento assinado…" });
    try {
      const alvo = await preparar({ data: { casoId, nomeArquivo: arquivo.name } });
      const up = await supabase.storage.from("documentos").uploadToSignedUrl(alvo.path, alvo.token, arquivo);
      if (up.error) throw new Error(`Falha no envio do arquivo: ${up.error.message}`);
      const doc = await salvar({
        data: {
          casoId,
          titulo: `Contrato assinado${versao ? ` — versão ${versao}` : ""}`,
          categoria: "contrato",
          sensibilidade: "sensivel",
          visibilidade: "interno_restrito",
          status: "aprovado",
          finalidade: "Comprovante de assinatura do contrato",
          storagePath: alvo.path,
          nomeArquivo: arquivo.name,
          mimeType: arquivo.type,
          tamanhoBytes: arquivo.size,
        },
      });
      setEstado({ tipo: "andamento", texto: "Documento guardado. Atualizando o contrato…" });
      await registrar({
        data: { contratoId, referencia: `Documento ${doc.id} · ${arquivo.name}`, assinadoEm: data, forma: forma || "documento_assinado_enviado" },
      });
      await qc.invalidateQueries();
      setEstado({ tipo: "ok", texto: "Comprovante guardado e contrato marcado como assinado." });
      setAberto(false);
    } catch (e) {
      setEstado({ tipo: "erro", texto: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <div className="mt-2">
      {!aberto ? (
        <Button size="sm" onClick={() => setAberto(true)}>Subir comprovante de assinatura</Button>
      ) : (
        <div className="space-y-2 rounded-md border border-border bg-card p-3 text-sm">
          <p className="text-xs text-muted-foreground">
            O documento fica no acervo interno (não aparece no App). Ao guardar, o contrato passa a “assinado” com data e referência do arquivo.
          </p>
          <label className="block">
            <span className="text-xs font-medium">Documento assinado (PDF ou imagem)</span>
            <input type="file" accept="application/pdf,image/*" className="mt-1 block w-full text-xs" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium">Data da assinatura</span>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mt-1 block w-full rounded border border-border bg-background px-2 py-2" />
          </label>
          <label className="block">
            <span className="text-xs font-medium">Forma (opcional)</span>
            <input value={forma} onChange={(e) => setForma(e.target.value)} placeholder="Ex.: assinatura física, plataforma digital" className="mt-1 block w-full rounded border border-border bg-background px-2 py-2" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={enviar} disabled={estado?.tipo === "andamento"}>Guardar comprovante e registrar assinatura</Button>
            <Button size="sm" variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
          </div>
        </div>
      )}
      {estado ? (
        <p role="status" className={`mt-1 text-xs ${estado.tipo === "erro" ? "text-destructive" : "text-muted-foreground"}`}>{estado.texto}</p>
      ) : null}
    </div>
  );
}
