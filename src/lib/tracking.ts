/**
 * Ancestral Canvas — camada simples de tracking (mock/local).
 *
 * Sem integração externa: os eventos ficam em memória + localStorage para
 * consumo futuro pelo Desk Intelligence (conversão por país, via, produto,
 * SKU e receita originada no App Cliente).
 */

export type TrackingEventName =
  | "delivery_viewed"
  | "stage2_cta_clicked"
  | "stage2_modal_opened"
  | "payment_link_clicked"
  | "payment_status_updated"
  | "report_exported"
  | "whatsapp_message_copied";

export type TrackingPayload = {
  caseId: string;
  clientId: string;
  country: string;
  suggestedRoute: string;
  offerId: string;
  sku: string;
  price: number;
  paymentStatus: string;
};

export type TrackingEvent = TrackingPayload & {
  event: TrackingEventName;
  timestamp: string;
  source: "app_cliente";
};

const STORAGE_KEY = "ancestral:tracking";
const buffer: TrackingEvent[] = [];

function persist() {
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(buffer.slice(-200)));
  } catch {
    /* ambiente sem storage — o buffer em memória basta */
  }
}

export function track(event: TrackingEventName, payload: TrackingPayload): TrackingEvent {
  const entry: TrackingEvent = {
    ...payload,
    event,
    timestamp: new Date().toISOString(),
    source: "app_cliente",
  };
  buffer.push(entry);
  if (typeof window !== "undefined") persist();
  return entry;
}

/** Leitura dos eventos registrados (base para o Desk Intelligence). */
export function trackedEvents(): TrackingEvent[] {
  return [...buffer];
}

export function clearTrackedEvents() {
  buffer.length = 0;
  if (typeof window !== "undefined") persist();
}
