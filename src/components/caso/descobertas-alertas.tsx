/**
 * Painel de Descobertas e Alertas para um Caso.
 *
 * Mostra descobertas recentes (achados) e oferece UI para
 * notificar o cliente via WhatsApp ou app.
 *
 * Integração com a UI: este componente aparece no card do caso
 * quando há descobertas não-comunicadas.
 */

import { useState } from "react";
import { AlertCircle, Send, Check, Copy } from "lucide-react";
import {
  gerarAlertaAchado,
  gerarAlertaEquipe,
  type AchadoParaAlerta,
  type ClienteContato,
  VALIDACAO_PRE_ENVIO,
} from "@/lib/alertas-whatsapp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DescoberturasAlertasProps {
  caseId: string;
  caseTitulo: string;
  achados: AchadoParaAlerta[];
  cliente?: ClienteContato;
  onAlertaSending?: (achado: AchadoParaAlerta) => Promise<void>;
}

export function DescoberturasAlertas({
  caseId,
  caseTitulo,
  achados,
  cliente,
  onAlertaSending,
}: DescoberturasAlertasProps) {
  const [copiado, setCopiado] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  if (!achados.length) {
    return null;
  }

  if (!cliente) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Sem cliente associado</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Não é possível enviar alertas sem informações de contato do cliente.
        </AlertDescription>
      </Alert>
    );
  }

  const clienteConfirmado = cliente;

  async function enviarAlerta(achado: AchadoParaAlerta) {
    setEnviando(achado.id);
    setErroEnvio(null);
    try {
      if (onAlertaSending) {
        await onAlertaSending(achado);
      }
      // TODO: Integrar com API de WhatsApp/notificações
      console.log("Alerta enviado para", clienteConfirmado.whatsapp, achado);
    } catch (err) {
      setErroEnvio((err as Error).message);
    } finally {
      setEnviando(null);
    }
  }

  function copiarTemplate(achado: AchadoParaAlerta) {
    const alerta = gerarAlertaAchado(achado, clienteConfirmado);
    navigator.clipboard.writeText(alerta.template);
    setCopiado(achado.id);
    setTimeout(() => setCopiado(null), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50 p-4">
        <h3 className="font-medium text-emerald-900">
          🎉 {achados.length} descoberta{achados.length > 1 ? "s" : ""} para comunicar
        </h3>
        <p className="mt-1 text-sm text-emerald-800">
          Caso: <span className="font-medium">{caseTitulo}</span>
        </p>
      </div>

      <div className="space-y-3">
        {achados.map((achado) => (
          <div
            key={achado.id}
            className="rounded-md border border-navy/10 bg-cream/50 p-4 space-y-3"
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-navy">
                  {achado.discovery_type.charAt(0).toUpperCase() + achado.discovery_type.slice(1)}
                </p>
                <p className="mt-0.5 text-sm text-navy/70">
                  Ancestral: <span className="font-medium text-navy">{achado.ancestor_name}</span>
                </p>
              </div>
              <span className="text-xs text-navy/50">
                {new Date(achado.recorded_at).toLocaleString("pt-BR")}
              </span>
            </div>

            {/* Descrição */}
            <div className="text-sm text-navy/80">
              <p className="font-medium text-navy/70">Descrição:</p>
              <p className="mt-1">{achado.description}</p>
            </div>

            {/* Evidência */}
            <div className="text-sm text-navy/80">
              <p className="font-medium text-navy/70">Evidência:</p>
              <p className="mt-1 rounded bg-navy/5 p-2 font-mono text-xs text-navy/70">
                {achado.evidence}
              </p>
            </div>

            {/* Checklist pré-envio */}
            <div className="space-y-1 rounded-md bg-yellow-50 p-3">
              <p className="text-xs font-medium text-yellow-900">Antes de enviar:</p>
              {VALIDACAO_PRE_ENVIO.slice(0, 3).map((item, i) => (
                <p key={i} className="text-xs text-yellow-800">
                  {item}
                </p>
              ))}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copiarTemplate(achado)}
                className="gap-2"
              >
                {copiado === achado.id ? (
                  <>
                    <Check className="h-4 w-4" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copiar template
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => enviarAlerta(achado)}
                disabled={enviando === achado.id}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {enviando === achado.id ? (
                  "Enviando…"
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Enviar via WhatsApp
                  </>
                )}
              </Button>
            </div>

            {erroEnvio && enviando === achado.id && (
              <p className="text-xs text-red-600">Erro: {erroEnvio}</p>
            )}
          </div>
        ))}
      </div>

      {/* Nota sobre integração */}
      <div className="rounded-md bg-blue-50 p-3">
        <p className="text-xs text-blue-900">
          <strong>ℹ️ Nota:</strong> Por enquanto, o botão copia o template para você colar manualmente
          no WhatsApp. Integração com envio automático será adicionada na próxima versão.
        </p>
      </div>
    </div>
  );
}
