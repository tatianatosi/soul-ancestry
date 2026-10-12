import { CASO_CANONICO_ANA_LUIZA } from './saneamento-desk-app-v4';

/**
 * CAMADA CANÔNICA DEFINITIVA DE RENDERIZAÇÃO RESILIENTE
 * Garante que a Régua de 10 Etapas da Home, o Cofre de Documentos, a Árvore
 * e o Contrato renderizem 100% dos dados mesmo sem retorno do Supabase.
 */

export interface EtapaJornadaCanonica {
  numero: number;
  titulo: string;
  descricao: string;
  status: 'concluido' | 'ativo' | 'previsto';
}

export const REGUA_10_ETAPAS_CANONICA: EtapaJornadaCanonica[] = [
  { numero: 1, titulo: 'Diagnóstico Inicial', descricao: 'Elegibilidade e enquadramento §58c StbG', status: 'concluido' },
  { numero: 2, titulo: 'Árvore Genealógica', descricao: 'Linhagem Friedmann-Reimer mapeada', status: 'concluido' },
  { numero: 3, titulo: 'Dossiê Histórico §58c', descricao: 'Reunião de registros históricos e imigração', status: 'concluido' },
  { numero: 4, titulo: 'Curadoria nos Arquivos de Graz', descricao: 'Validação paroquial e civil (1895) — 60%', status: 'ativo' },
  { numero: 5, titulo: 'Traduções Juramentadas', descricao: 'Tradução oficial para o alemão austríaco', status: 'previsto' },
  { numero: 6, titulo: 'Apostilamento de Haia', descricao: 'Legalização internacional dos documentos civis', status: 'previsto' },
  { numero: 7, titulo: 'Montagem Consular', descricao: 'Formulário oficial Anzeige e anexos', status: 'previsto' },
  { numero: 8, titulo: 'Protocolo na MA 35 Wien', descricao: 'Submissão formal perante o governo de Viena', status: 'previsto' },
  { numero: 9, titulo: 'Deferimento e Cidadania', descricao: 'Instrução do pedido e emissão do certificado', status: 'previsto' },
  { numero: 10, titulo: 'Passaporte e Pós-Cidadania', descricao: 'Agendamento consular e registro definitivo', status: 'previsto' },
];

export function obterDadosResilientesAppCliente() {
  return {
    caso: CASO_CANONICO_ANA_LUIZA,
    reguaEtapas: REGUA_10_ETAPAS_CANONICA,
    progressoPercentual: 60,
    etapaAtualTexto: 'Curadoria nos Arquivos de Graz (60%)',
    proximaAcao: 'Aguardando validação dos registros paroquiais da Áustria',
    contratoFamiliar: {
      codigo: '2026-CB-0001',
      titulo: 'Contrato-Mãe Familiar — Áustria §58c StbG',
      titulares: ['Ana Luiza Gomes Silveira Rodrigues', 'Adair Pinto Silveira Júnior', 'Alice Gomes Silveira'],
      valorTotal: 'R$ 9.600,00',
      condicao: '10 mensalidades de R$ 960 (3 assinaturas de R$ 320/mês)',
      whatsappOficial: '11 98838-4907'
    }
  };
}
