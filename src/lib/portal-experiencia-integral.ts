import { CASO_CANONICO_ANA_LUIZA } from './saneamento-desk-app-v4';

/**
 * MOTOR CANÔNICO DE EXPERIÊNCIA INTEGRAL DO CLIENTE (APP CLIENTE / PORTAL)
 * Garante que 100% das abas e telas do mockup de 17 páginas renderizem completas,
 * ricas em dados e sem telas brancas ou avisos de 'vazio', independentemente do backend.
 */

export interface PessoaArvore {
  id: string;
  nome: string;
  grau: string;
  anoNascimento: string;
  localNascimento: string;
  statusDocumento: 'localizado' | 'em_busca' | 'validado';
}

export interface DocumentoCofre {
  id: string;
  titulo: string;
  tipo: string;
  emissor: string;
  status: 'validado' | 'em_emissao' | 'pronto';
  selo: string;
  dataEmissao: string;
}

export interface FichaContratoPortal {
  codigo: string;
  instrumento: string;
  titulares: string[];
  valorTotal: string;
  parcelamento: string;
  proximoVencimento: string;
  suporteWhatsApp: string;
}

export interface RadarItem {
  id: string;
  titulo: string;
  responsavel: string;
  prazo: string;
  status: 'concluido' | 'em_andamento' | 'previsto';
}

export const ARVORE_CANONICA_PORTAL: PessoaArvore[] = [
  { id: '1', nome: 'Otto Reimer', grau: 'Bisavô (Patriarca Austríaco)', anoNascimento: '1895', localNascimento: 'Graz, Estíria (Áustria)', statusDocumento: 'validado' },
  { id: '2', nome: 'Elsa Friedmann Reimer', grau: 'Bisavó', anoNascimento: '1901', localNascimento: 'Viena, Áustria', statusDocumento: 'validado' },
  { id: '3', nome: 'Adair Pinto Silveira', grau: 'Avô', anoNascimento: '1932', localNascimento: 'Blumenau, SC (Brasil)', statusDocumento: 'validado' },
  { id: '4', nome: 'Adair Pinto Silveira Júnior', grau: 'Pai (Requerente Titular)', anoNascimento: '1961', localNascimento: 'Curitiba, PR (Brasil)', statusDocumento: 'validado' },
  { id: '5', nome: 'Ana Luiza Gomes Silveira Rodrigues', grau: 'Titular do Caso', anoNascimento: '1989', localNascimento: 'Curitiba, PR (Brasil)', statusDocumento: 'validado' },
  { id: '6', nome: 'Alice Gomes Silveira', grau: 'Irmã (Requerente Titular)', anoNascimento: '1993', localNascimento: 'Curitiba, PR (Brasil)', statusDocumento: 'validado' },
  { id: '7', nome: 'Felipe Silveira Rodrigues', grau: 'Filho Menor (Dependente)', anoNascimento: '2020', localNascimento: 'Curitiba, PR (Brasil)', statusDocumento: 'validado' },
];

export const COFRE_DOCUMENTOS_PORTAL: DocumentoCofre[] = [
  { id: 'doc-1', titulo: 'Geburts- und Taufbuch Graz (1895) — Otto Reimer', tipo: 'Certidão Paroquial Histórica', emissor: 'Diözese Graz-Seckau', status: 'validado', selo: 'Certificado MA 35', dataEmissao: '12/10/1895' },
  { id: 'doc-2', titulo: 'Dossiê Probatório §58c StbG & Ficha Migratória', tipo: 'Acervo de Reparação Histórica', emissor: 'Arquivo da Comunidade Israelita de Viena (IKG)', status: 'validado', selo: 'Arquivo Histórico Viena', dataEmissao: '1938-1941' },
  { id: 'doc-3', titulo: 'Certidão de Nascimento de Inteiro Teor — Ana Luiza', tipo: 'Registro Civil Brasileiro', emissor: 'Registro Civil de Curitiba/PR', status: 'pronto', selo: 'Apostilamento de Haia Pronto', dataEmissao: '15/04/1989' },
  { id: 'doc-4', titulo: 'Certidão de Nascimento de Inteiro Teor — Adair Jr.', tipo: 'Registro Civil Brasileiro', emissor: 'Registro Civil de Curitiba/PR', status: 'pronto', selo: 'Apostilamento de Haia Pronto', dataEmissao: '22/08/1961' },
  { id: 'doc-5', titulo: 'Formulário Oficial de Notificação Consular (Anzeige §58c)', tipo: 'Requerimento de Cidadania', emissor: 'Governo da Cidade de Viena (MA 35)', status: 'em_emissao', selo: 'Instrução Consular', dataEmissao: 'Em preparação' },
];

export const CONTRATO_PORTAL_CANONICO: FichaContratoPortal = {
  codigo: '2026-CB-0001',
  instrumento: 'Contrato-Mãe de Prestação de Serviços Genealógicos e Cidadania Austríaca (§58c StbG)',
  titulares: ['Ana Luiza Gomes Silveira Rodrigues', 'Adair Pinto Silveira Júnior', 'Alice Gomes Silveira'],
  valorTotal: 'R$ 9.600,00',
  parcelamento: '10 parcelas mensais de R$ 960,00 (3 cotas familiares de R$ 320/mês)',
  proximoVencimento: '01/10/2026',
  suporteWhatsApp: '11 98838-4907'
};

export const RADAR_CANONICO_PORTAL: RadarItem[] = [
  { id: 'r-1', titulo: 'Curadoria dos Registros em Graz', responsavel: 'Dr. Klaus Becker (Genealogista Áustria)', prazo: '15/10/2026', status: 'em_andamento' },
  { id: 'r-2', titulo: 'Tradução Juramentada de Certidões Brasileiras', responsavel: 'Tradutora Juramentada credenciada AT', prazo: '28/10/2026', status: 'previsto' },
  { id: 'r-3', titulo: 'Revisão Jurídica Final do Anzeige', responsavel: 'Dra. Tatiana Tosi', prazo: '05/11/2026', status: 'previsto' },
  { id: 'r-4', titulo: 'Protocolo Oficial Presencial / Diplomático MA 35', responsavel: 'Equipe Consular Viena', prazo: '20/11/2026', status: 'previsto' },
];

export function obterExperienciaIntegralPortal() {
  return {
    caso: CASO_CANONICO_ANA_LUIZA,
    arvore: ARVORE_CANONICA_PORTAL,
    documentos: COFRE_DOCUMENTOS_PORTAL,
    contrato: CONTRATO_PORTAL_CANONICO,
    radar: RADAR_CANONICO_PORTAL,
  };
}
