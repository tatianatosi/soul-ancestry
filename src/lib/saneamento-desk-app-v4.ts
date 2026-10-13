/**
 * SANEAMENTO CANÔNICO DO CASO PILOTO — DESK & APP V4
 * Fonte de verdade para renderização resiliente em modo de homologação ou desconectado.
 */

export interface CasoCanonico {
  id: string;
  codigoCaso: string;
  clienteNome: string;
  via: string;
  pais: string;
  nacionalidade: string;
  status: string;
  faseAtual: string;
  progressoPercentual: number;
  proximaAcao: string;
  prazoProximaAcao: string;
  responsavel: string;
  titulares: string[];
  dependenteMenor: string;
  contratoCodigo: string;
  valorTotal: string;
  condicaoComercial: string;
}

export const CASO_CANONICO_ANA_LUIZA: CasoCanonico = {
  id: 'a11a0000-0000-4000-8000-000000000002',
  codigoCaso: 'CA-CID-AT-FAM-2026-001',
  clienteNome: 'Ana Luiza Gomes Silveira Rodrigues',
  via: '§ 58c StbG (Reparação Histórica)',
  pais: 'Áustria',
  nacionalidade: 'austríaca',
  status: 'em_andamento',
  faseAtual: 'Curadoria nos Arquivos de Graz',
  progressoPercentual: 60,
  proximaAcao: 'Validação dos registros paroquiais em Graz (1895)',
  prazoProximaAcao: '15/10/2026',
  responsavel: 'Tatiana Melani Tosi',
  titulares: [
    'Ana Luiza Gomes Silveira Rodrigues',
    'Adair Pinto Silveira Júnior',
    'Alice Gomes Silveira'
  ],
  dependenteMenor: 'Felipe Silveira Rodrigues',
  contratoCodigo: '2026-CB-0001',
  valorTotal: 'R$ 9.600,00',
  condicaoComercial: '3 assinaturas de R$ 320,00/mês × 10 meses (uma para Ana Luiza, uma para Alice e uma para Adair)'
};
