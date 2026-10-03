export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ancestralscan_triagens: {
        Row: {
          alertas_publicos: string[]
          consentimento_em: string | null
          consentimento_status: string
          consentimento_versao_aviso: string | null
          created_at: string
          created_by: string | null
          documentos_declarados: string[]
          geracao_declarada: string | null
          id: string
          lead_id: string | null
          localidade_ascendente_declarada: string | null
          organization_id: string
          origem_campanha: string | null
          paises_declarados: string[]
          respondido_em: string
          respostas_publicas: Json
          scores_orientativos: Json
          updated_at: string
          updated_by: string | null
          versao_scan: string
        }
        Insert: {
          alertas_publicos?: string[]
          consentimento_em?: string | null
          consentimento_status?: string
          consentimento_versao_aviso?: string | null
          created_at?: string
          created_by?: string | null
          documentos_declarados?: string[]
          geracao_declarada?: string | null
          id?: string
          lead_id?: string | null
          localidade_ascendente_declarada?: string | null
          organization_id: string
          origem_campanha?: string | null
          paises_declarados?: string[]
          respondido_em: string
          respostas_publicas?: Json
          scores_orientativos?: Json
          updated_at?: string
          updated_by?: string | null
          versao_scan: string
        }
        Update: {
          alertas_publicos?: string[]
          consentimento_em?: string | null
          consentimento_status?: string
          consentimento_versao_aviso?: string | null
          created_at?: string
          created_by?: string | null
          documentos_declarados?: string[]
          geracao_declarada?: string | null
          id?: string
          lead_id?: string | null
          localidade_ascendente_declarada?: string | null
          organization_id?: string
          origem_campanha?: string | null
          paises_declarados?: string[]
          respondido_em?: string
          respostas_publicas?: Json
          scores_orientativos?: Json
          updated_at?: string
          updated_by?: string | null
          versao_scan?: string
        }
        Relationships: [
          {
            foreignKeyName: "ancestralscan_triagens_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ancestralscan_triagens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_projection_shares: {
        Row: {
          autorizado_em: string
          autorizado_por: string
          autorizado_por_user_id: string | null
          compartilhado_com_client_id: string
          created_at: string
          escopo: string
          id: string
          organization_id: string
          projection_id: string
          revogado_em: string | null
          revogado_motivo: string | null
          revogado_por_user_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          autorizado_em?: string
          autorizado_por: string
          autorizado_por_user_id?: string | null
          compartilhado_com_client_id: string
          created_at?: string
          escopo?: string
          id?: string
          organization_id: string
          projection_id: string
          revogado_em?: string | null
          revogado_motivo?: string | null
          revogado_por_user_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          autorizado_em?: string
          autorizado_por?: string
          autorizado_por_user_id?: string | null
          compartilhado_com_client_id?: string
          created_at?: string
          escopo?: string
          id?: string
          organization_id?: string
          projection_id?: string
          revogado_em?: string | null
          revogado_motivo?: string | null
          revogado_por_user_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_projection_shares_compartilhado_com_client_id_fkey"
            columns: ["compartilhado_com_client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projection_shares_compartilhado_com_client_id_fkey"
            columns: ["compartilhado_com_client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projection_shares_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projection_shares_projection_id_fkey"
            columns: ["projection_id"]
            isOneToOne: false
            referencedRelation: "app_projections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projection_shares_projection_id_fkey"
            columns: ["projection_id"]
            isOneToOne: false
            referencedRelation: "portal_projecoes"
            referencedColumns: ["id"]
          },
        ]
      }
      app_projections: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          archived_reason: string | null
          case_id: string
          content_sanitized: string
          created_at: string
          created_by: string | null
          destination: string
          due_at: string | null
          effective_from: string | null
          geracao_cliente: number | null
          id: string
          organization_id: string
          pessoa_id: string | null
          projection_type: string
          source_entity_id: string
          source_entity_type: string
          titular_client_id: string | null
          updated_at: string
          updated_by: string | null
          vinculo_projecao_id: string | null
          visibility_scope: string
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          archived_reason?: string | null
          case_id: string
          content_sanitized: string
          created_at?: string
          created_by?: string | null
          destination: string
          due_at?: string | null
          effective_from?: string | null
          geracao_cliente?: number | null
          id?: string
          organization_id: string
          pessoa_id?: string | null
          projection_type: string
          source_entity_id: string
          source_entity_type: string
          titular_client_id?: string | null
          updated_at?: string
          updated_by?: string | null
          vinculo_projecao_id?: string | null
          visibility_scope?: string
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          archived_reason?: string | null
          case_id?: string
          content_sanitized?: string
          created_at?: string
          created_by?: string | null
          destination?: string
          due_at?: string | null
          effective_from?: string | null
          geracao_cliente?: number | null
          id?: string
          organization_id?: string
          pessoa_id?: string | null
          projection_type?: string
          source_entity_id?: string
          source_entity_type?: string
          titular_client_id?: string | null
          updated_at?: string
          updated_by?: string | null
          vinculo_projecao_id?: string | null
          visibility_scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_proj_vinculo_projecao_fk"
            columns: ["vinculo_projecao_id"]
            isOneToOne: false
            referencedRelation: "app_projections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_proj_vinculo_projecao_fk"
            columns: ["vinculo_projecao_id"]
            isOneToOne: false
            referencedRelation: "portal_projecoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projections_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projections_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projections_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projections_titular_client_id_fkey"
            columns: ["titular_client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projections_titular_client_id_fkey"
            columns: ["titular_client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
        ]
      }
      artifact_register: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          backup_historico: string | null
          case_id: string | null
          change_resumo: string | null
          classificacao: string
          created_at: string
          created_by: string | null
          demo: boolean
          dominio: string
          fonte_primaria: string | null
          id: string
          knowledge_item_id: string | null
          lacuna: string | null
          localizacao: string | null
          nivel_acesso: string
          nome_original: string
          organization_id: string
          origem: string | null
          proxima_acao: string | null
          relacao_operacional: string | null
          responsavel_nome: string | null
          responsavel_user_id: string | null
          status_recuperacao: string
          sucessor_id: string | null
          updated_at: string
          updated_by: string | null
          versao: number
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          backup_historico?: string | null
          case_id?: string | null
          change_resumo?: string | null
          classificacao?: string
          created_at?: string
          created_by?: string | null
          demo?: boolean
          dominio?: string
          fonte_primaria?: string | null
          id?: string
          knowledge_item_id?: string | null
          lacuna?: string | null
          localizacao?: string | null
          nivel_acesso?: string
          nome_original: string
          organization_id: string
          origem?: string | null
          proxima_acao?: string | null
          relacao_operacional?: string | null
          responsavel_nome?: string | null
          responsavel_user_id?: string | null
          status_recuperacao?: string
          sucessor_id?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          backup_historico?: string | null
          case_id?: string | null
          change_resumo?: string | null
          classificacao?: string
          created_at?: string
          created_by?: string | null
          demo?: boolean
          dominio?: string
          fonte_primaria?: string | null
          id?: string
          knowledge_item_id?: string | null
          lacuna?: string | null
          localizacao?: string | null
          nivel_acesso?: string
          nome_original?: string
          organization_id?: string
          origem?: string | null
          proxima_acao?: string | null
          relacao_operacional?: string | null
          responsavel_nome?: string | null
          responsavel_user_id?: string | null
          status_recuperacao?: string
          sucessor_id?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "artifact_register_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_register_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_register_knowledge_item_id_fkey"
            columns: ["knowledge_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_register_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_register_sucessor_id_fkey"
            columns: ["sucessor_id"]
            isOneToOne: false
            referencedRelation: "artifact_register"
            referencedColumns: ["id"]
          },
        ]
      }
      attribution_records: {
        Row: {
          archived_at: string | null
          campaign_id: string | null
          canal: string | null
          case_id: string | null
          cliente_id: string | null
          created_at: string
          id: string
          lead_id: string | null
          lead_source_id: string | null
          modelo: string
          observacao: string | null
          organization_id: string
          peso: number
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          valor_convertido: number | null
        }
        Insert: {
          archived_at?: string | null
          campaign_id?: string | null
          canal?: string | null
          case_id?: string | null
          cliente_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          lead_source_id?: string | null
          modelo?: string
          observacao?: string | null
          organization_id: string
          peso?: number
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          valor_convertido?: number | null
        }
        Update: {
          archived_at?: string | null
          campaign_id?: string | null
          canal?: string | null
          case_id?: string | null
          cliente_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          lead_source_id?: string | null
          modelo?: string
          observacao?: string | null
          organization_id?: string
          peso?: number
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          valor_convertido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attribution_records_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attribution_records_lead_source_id_fkey"
            columns: ["lead_source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      audiovisual_records: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audiovisual_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiovisual_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiovisual_records_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiovisual_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiovisual_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiovisual_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiovisual_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiovisual_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          acao: string
          created_at: string
          entidade: string
          entidade_id: string | null
          id: string
          metadados: Json | null
          organization_id: string
          user_id: string | null
          valores_anteriores: Json | null
          valores_posteriores: Json | null
        }
        Insert: {
          acao: string
          created_at?: string
          entidade: string
          entidade_id?: string | null
          id?: string
          metadados?: Json | null
          organization_id: string
          user_id?: string | null
          valores_anteriores?: Json | null
          valores_posteriores?: Json | null
        }
        Update: {
          acao?: string
          created_at?: string
          entidade?: string
          entidade_id?: string | null
          id?: string
          metadados?: Json | null
          organization_id?: string
          user_id?: string | null
          valores_anteriores?: Json | null
          valores_posteriores?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_throttle: {
        Row: {
          id: string
          occurred_at: string
          scope: string
          subject_hash: string
        }
        Insert: {
          id?: string
          occurred_at?: string
          scope: string
          subject_hash: string
        }
        Update: {
          id?: string
          occurred_at?: string
          scope?: string
          subject_hash?: string
        }
        Relationships: []
      }
      authorized_portal_emails: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          email: string
          finalidade: string
          id: string
          is_demo: boolean
          motivo_recusa: string | null
          nivel_pretendido: Database["public"]["Enums"]["portal_access_level"]
          notes_internal: string | null
          organization_id: string
          status: string
          updated_at: string
          updated_by: string | null
          validado_em: string | null
          validado_por: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          finalidade: string
          id?: string
          is_demo?: boolean
          motivo_recusa?: string | null
          nivel_pretendido?: Database["public"]["Enums"]["portal_access_level"]
          notes_internal?: string | null
          organization_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          validado_em?: string | null
          validado_por?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          finalidade?: string
          id?: string
          is_demo?: boolean
          motivo_recusa?: string | null
          nivel_pretendido?: Database["public"]["Enums"]["portal_access_level"]
          notes_internal?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          validado_em?: string | null
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "authorized_portal_emails_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorized_portal_emails_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorized_portal_emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorized_portal_emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprint_parameters: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          case_service_id: string | null
          citizenship_track_id: string | null
          condicao_comercial_padrao: string | null
          conteudo_aprovado_para_proposta: boolean
          created_at: string
          created_by: string | null
          criterios_aceite: Json
          data_vigencia: string | null
          despesas_terceiros_faixa: string | null
          despesas_terceiros_status: string
          entregas_previstas: Json
          escopo_aprovado: string | null
          excecao_comercial_id: string | null
          family_id: string | null
          fases_jornada: Json
          id: string
          link_proposta_interno: string | null
          observacao_interna: string | null
          organization_id: string
          origem_preco: string
          parcelas: number | null
          preco_comercial_vigente: number | null
          product_catalog_id: string | null
          proposal_id: string | null
          proposta_version: string | null
          regra_despesas: string | null
          status_preparacao: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          case_service_id?: string | null
          citizenship_track_id?: string | null
          condicao_comercial_padrao?: string | null
          conteudo_aprovado_para_proposta?: boolean
          created_at?: string
          created_by?: string | null
          criterios_aceite?: Json
          data_vigencia?: string | null
          despesas_terceiros_faixa?: string | null
          despesas_terceiros_status?: string
          entregas_previstas?: Json
          escopo_aprovado?: string | null
          excecao_comercial_id?: string | null
          family_id?: string | null
          fases_jornada?: Json
          id?: string
          link_proposta_interno?: string | null
          observacao_interna?: string | null
          organization_id: string
          origem_preco?: string
          parcelas?: number | null
          preco_comercial_vigente?: number | null
          product_catalog_id?: string | null
          proposal_id?: string | null
          proposta_version?: string | null
          regra_despesas?: string | null
          status_preparacao?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          case_service_id?: string | null
          citizenship_track_id?: string | null
          condicao_comercial_padrao?: string | null
          conteudo_aprovado_para_proposta?: boolean
          created_at?: string
          created_by?: string | null
          criterios_aceite?: Json
          data_vigencia?: string | null
          despesas_terceiros_faixa?: string | null
          despesas_terceiros_status?: string
          entregas_previstas?: Json
          escopo_aprovado?: string | null
          excecao_comercial_id?: string | null
          family_id?: string | null
          fases_jornada?: Json
          id?: string
          link_proposta_interno?: string | null
          observacao_interna?: string | null
          organization_id?: string
          origem_preco?: string
          parcelas?: number | null
          preco_comercial_vigente?: number | null
          product_catalog_id?: string | null
          proposal_id?: string | null
          proposta_version?: string | null
          regra_despesas?: string | null
          status_preparacao?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_parameters_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_parameters_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_parameters_case_service_id_fkey"
            columns: ["case_service_id"]
            isOneToOne: false
            referencedRelation: "case_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_parameters_citizenship_track_id_fkey"
            columns: ["citizenship_track_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_parameters_excecao_comercial_id_fkey"
            columns: ["excecao_comercial_id"]
            isOneToOne: false
            referencedRelation: "sku_price_exceptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_parameters_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_parameters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_parameters_product_catalog_id_fkey"
            columns: ["product_catalog_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_parameters_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      bootstrap_lock: {
        Row: {
          completed_at: string
          completed_by: string | null
          created_at: string
          id: string
          organization_id: string
        }
        Insert: {
          completed_at?: string
          completed_by?: string | null
          created_at?: string
          id?: string
          organization_id: string
        }
        Update: {
          completed_at?: string
          completed_by?: string | null
          created_at?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootstrap_lock_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cadastral_records: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadastral_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastral_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastral_records_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastral_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastral_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastral_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastral_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastral_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      case_activation_checks: {
        Row: {
          case_id: string
          check_key: string
          created_at: string
          dominio: string
          id: string
          isencao_autorizada_em: string | null
          isencao_autorizada_por: string | null
          isencao_expira_em: string | null
          isencao_motivo: string | null
          label: string
          obrigatorio: boolean
          observacao: string | null
          organization_id: string
          origem_validacao: string | null
          status: string
          updated_at: string
          validado_em: string | null
          validado_por: string | null
        }
        Insert: {
          case_id: string
          check_key: string
          created_at?: string
          dominio?: string
          id?: string
          isencao_autorizada_em?: string | null
          isencao_autorizada_por?: string | null
          isencao_expira_em?: string | null
          isencao_motivo?: string | null
          label: string
          obrigatorio?: boolean
          observacao?: string | null
          organization_id: string
          origem_validacao?: string | null
          status?: string
          updated_at?: string
          validado_em?: string | null
          validado_por?: string | null
        }
        Update: {
          case_id?: string
          check_key?: string
          created_at?: string
          dominio?: string
          id?: string
          isencao_autorizada_em?: string | null
          isencao_autorizada_por?: string | null
          isencao_expira_em?: string | null
          isencao_motivo?: string | null
          label?: string
          obrigatorio?: boolean
          observacao?: string | null
          organization_id?: string
          origem_validacao?: string | null
          status?: string
          updated_at?: string
          validado_em?: string | null
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_activation_checks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_activation_checks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
        ]
      }
      case_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          criticidade: string
          data_origin: string
          detalhe: string | null
          due_at: string | null
          id: string
          organization_id: string
          origem_regra: string | null
          resolucao_observacao: string | null
          status: string
          tipo: string
          titulo: string
          triggered_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          case_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          criticidade?: string
          data_origin?: string
          detalhe?: string | null
          due_at?: string | null
          id?: string
          organization_id: string
          origem_regra?: string | null
          resolucao_observacao?: string | null
          status?: string
          tipo: string
          titulo: string
          triggered_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          case_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          criticidade?: string
          data_origin?: string
          detalhe?: string | null
          due_at?: string | null
          id?: string
          organization_id?: string
          origem_regra?: string | null
          resolucao_observacao?: string | null
          status?: string
          tipo?: string
          titulo?: string
          triggered_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_alerts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_alerts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
        ]
      }
      case_aliases: {
        Row: {
          alias: string
          alias_type: string
          case_id: string
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          reason: string | null
          source: string
          superseded_by: string | null
        }
        Insert: {
          alias: string
          alias_type?: string
          case_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          reason?: string | null
          source?: string
          superseded_by?: string | null
        }
        Update: {
          alias?: string
          alias_type?: string
          case_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          reason?: string | null
          source?: string
          superseded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_aliases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_aliases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_aliases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_checklist_items: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          concluido_em: string | null
          concluido_por: string | null
          created_at: string
          evidencia_url: string | null
          fase: string
          id: string
          item_key: string
          label: string
          obrigatorio: boolean
          observacao: string | null
          ordem: number
          organization_id: string
          status: string
          template_id: string | null
          tipo_servico: string
          updated_at: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          evidencia_url?: string | null
          fase?: string
          id?: string
          item_key: string
          label: string
          obrigatorio?: boolean
          observacao?: string | null
          ordem?: number
          organization_id: string
          status?: string
          template_id?: string | null
          tipo_servico?: string
          updated_at?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          evidencia_url?: string | null
          fase?: string
          id?: string
          item_key?: string
          label?: string
          obrigatorio?: boolean
          observacao?: string | null
          ordem?: number
          organization_id?: string
          status?: string
          template_id?: string | null
          tipo_servico?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_checklist_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_checklist_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_checklist_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_checklist_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "quality_checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      case_dependents: {
        Row: {
          anexo_individual_aplicavel: boolean
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          created_at: string
          created_by: string | null
          dependent_person_id: string | null
          documento_representacao_referencia_interna: string | null
          id: string
          nome_completo: string
          observacao_interna: string | null
          organization_id: string
          participa_do_contrato: boolean
          possui_acesso_app: boolean
          status_representacao: string
          titular_responsavel_legal_id: string | null
          titular_responsavel_legal_nome: string | null
          updated_at: string
          updated_by: string | null
          vinculo_com_titular: string
        }
        Insert: {
          anexo_individual_aplicavel?: boolean
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          created_at?: string
          created_by?: string | null
          dependent_person_id?: string | null
          documento_representacao_referencia_interna?: string | null
          id?: string
          nome_completo: string
          observacao_interna?: string | null
          organization_id: string
          participa_do_contrato?: boolean
          possui_acesso_app?: boolean
          status_representacao?: string
          titular_responsavel_legal_id?: string | null
          titular_responsavel_legal_nome?: string | null
          updated_at?: string
          updated_by?: string | null
          vinculo_com_titular: string
        }
        Update: {
          anexo_individual_aplicavel?: boolean
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          created_at?: string
          created_by?: string | null
          dependent_person_id?: string | null
          documento_representacao_referencia_interna?: string | null
          id?: string
          nome_completo?: string
          observacao_interna?: string | null
          organization_id?: string
          participa_do_contrato?: boolean
          possui_acesso_app?: boolean
          status_representacao?: string
          titular_responsavel_legal_id?: string | null
          titular_responsavel_legal_nome?: string | null
          updated_at?: string
          updated_by?: string | null
          vinculo_com_titular?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_dependents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_dependents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_dependents_dependent_person_fk"
            columns: ["dependent_person_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_dependents_dependent_person_id_fkey"
            columns: ["dependent_person_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_dependents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_dependents_titular_responsavel_fk"
            columns: ["titular_responsavel_legal_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_dependents_titular_responsavel_legal_id_fkey"
            columns: ["titular_responsavel_legal_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
        ]
      }
      case_espera_externa: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          created_at: string
          created_by: string | null
          id: string
          motivo: string
          observacao_interna: string | null
          organization_id: string
          prazo_rechecagem: string
          responsavel_user_id: string
          status: string
          ultima_atualizacao_contextualizada_em: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          motivo: string
          observacao_interna?: string | null
          organization_id: string
          prazo_rechecagem: string
          responsavel_user_id: string
          status?: string
          ultima_atualizacao_contextualizada_em: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          motivo?: string
          observacao_interna?: string | null
          organization_id?: string
          prazo_rechecagem?: string
          responsavel_user_id?: string
          status?: string
          ultima_atualizacao_contextualizada_em?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_espera_externa_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_espera_externa_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_espera_externa_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_grupos_comunicacao: {
        Row: {
          activated_at: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          canal: string
          case_id: string
          contato_principal_membro_id: string | null
          created_at: string
          created_by: string | null
          id: string
          nome_grupo: string | null
          observacao_interna: string | null
          organization_id: string
          proposito: string
          referencia_externa: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activated_at?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          canal?: string
          case_id: string
          contato_principal_membro_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nome_grupo?: string | null
          observacao_interna?: string | null
          organization_id: string
          proposito: string
          referencia_externa?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activated_at?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          canal?: string
          case_id?: string
          contato_principal_membro_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nome_grupo?: string | null
          observacao_interna?: string | null
          organization_id?: string
          proposito?: string
          referencia_externa?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_grupos_comunicacao_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_grupos_comunicacao_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_grupos_comunicacao_contato_principal_membro_id_fkey"
            columns: ["contato_principal_membro_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_grupos_comunicacao_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_members: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          cep: string | null
          cliente_id: string | null
          consentimentos: string | null
          contratante: boolean
          cpf: string | null
          created_at: string
          created_by: string | null
          data_nascimento: string | null
          data_obito: string | null
          data_verificacao_dado: string | null
          dependente: boolean
          documentos_pendentes: string | null
          email: string | null
          endereco: string | null
          estado_civil: string | null
          fonte_origem_dado: string | null
          id: string
          local_nascimento: string | null
          local_obito: string | null
          mae_id: string | null
          nacionalidade: string | null
          nome: string
          observacoes_protegidas: string | null
          organization_id: string
          pai_id: string | null
          papel_no_caso: string | null
          parentesco: string
          profissao: string | null
          representa_pessoa_id: string | null
          representante_legal: string | null
          requerente: boolean
          rg: string | null
          status_cadastral: string
          telefone: string | null
          telefone_whatsapp: boolean | null
          titular: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          cep?: string | null
          cliente_id?: string | null
          consentimentos?: string | null
          contratante?: boolean
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          data_obito?: string | null
          data_verificacao_dado?: string | null
          dependente?: boolean
          documentos_pendentes?: string | null
          email?: string | null
          endereco?: string | null
          estado_civil?: string | null
          fonte_origem_dado?: string | null
          id?: string
          local_nascimento?: string | null
          local_obito?: string | null
          mae_id?: string | null
          nacionalidade?: string | null
          nome: string
          observacoes_protegidas?: string | null
          organization_id: string
          pai_id?: string | null
          papel_no_caso?: string | null
          parentesco: string
          profissao?: string | null
          representa_pessoa_id?: string | null
          representante_legal?: string | null
          requerente?: boolean
          rg?: string | null
          status_cadastral?: string
          telefone?: string | null
          telefone_whatsapp?: boolean | null
          titular?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          cep?: string | null
          cliente_id?: string | null
          consentimentos?: string | null
          contratante?: boolean
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          data_obito?: string | null
          data_verificacao_dado?: string | null
          dependente?: boolean
          documentos_pendentes?: string | null
          email?: string | null
          endereco?: string | null
          estado_civil?: string | null
          fonte_origem_dado?: string | null
          id?: string
          local_nascimento?: string | null
          local_obito?: string | null
          mae_id?: string | null
          nacionalidade?: string | null
          nome?: string
          observacoes_protegidas?: string | null
          organization_id?: string
          pai_id?: string | null
          papel_no_caso?: string | null
          parentesco?: string
          profissao?: string | null
          representa_pessoa_id?: string | null
          representante_legal?: string | null
          requerente?: boolean
          rg?: string | null
          status_cadastral?: string
          telefone?: string | null
          telefone_whatsapp?: boolean | null
          titular?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_members_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_members_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_members_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_members_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_members_mae_id_fkey"
            columns: ["mae_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_members_pai_id_fkey"
            columns: ["pai_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
        ]
      }
      case_phase_history: {
        Row: {
          case_id: string
          changed_at: string
          changed_by: string | null
          fase_anterior: string | null
          fase_nova: string
          id: string
          organization_id: string
        }
        Insert: {
          case_id: string
          changed_at?: string
          changed_by?: string | null
          fase_anterior?: string | null
          fase_nova: string
          id?: string
          organization_id: string
        }
        Update: {
          case_id?: string
          changed_at?: string
          changed_by?: string | null
          fase_anterior?: string | null
          fase_nova?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_phase_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_phase_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
        ]
      }
      case_plans: {
        Row: {
          ambiente_autorizado: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          case_service_id: string | null
          checklist_aplicavel: string[]
          composicao: string | null
          created_at: string
          created_by: string | null
          dados_teste: boolean
          dependencias_cliente: string[]
          dependencias_terceiros: string[]
          dias_sem_touchpoint: number
          dossie_mae_referencia: string | null
          dossie_mae_status: string | null
          entrega_robusta_atual: string | null
          entregas: string[]
          etapa: string | null
          family_id: string | null
          fase_jornada: string
          fontes: Json
          grupo_familiar_status: string | null
          id: string
          inicio_previsto: string | null
          marco_atual: string | null
          marcos: string[]
          microentregas: string[]
          motivos_bloqueio: Json
          nivel_acesso: string | null
          objetivo: string | null
          observacao_interna: string | null
          organization_id: string
          pendencias_cliente: string[]
          pendencias_internas: string[]
          perguntas: string[]
          plano_hash: string | null
          prazo_proxima_acao: string | null
          product_catalog_id: string | null
          produto_pai_id: string | null
          proxima_acao: string | null
          proxima_atualizacao_limite_em: string | null
          proxima_microentrega: string | null
          regras_anexos: string[]
          responsavel_user_id: string | null
          revisao_humana: string
          rota_confirmada: string | null
          status: string
          status_saude: string
          ultima_atualizacao_cliente_em: string | null
          updated_at: string
          updated_by: string | null
          versao: number
        }
        Insert: {
          ambiente_autorizado?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          case_service_id?: string | null
          checklist_aplicavel?: string[]
          composicao?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          dependencias_cliente?: string[]
          dependencias_terceiros?: string[]
          dias_sem_touchpoint?: number
          dossie_mae_referencia?: string | null
          dossie_mae_status?: string | null
          entrega_robusta_atual?: string | null
          entregas?: string[]
          etapa?: string | null
          family_id?: string | null
          fase_jornada?: string
          fontes?: Json
          grupo_familiar_status?: string | null
          id?: string
          inicio_previsto?: string | null
          marco_atual?: string | null
          marcos?: string[]
          microentregas?: string[]
          motivos_bloqueio?: Json
          nivel_acesso?: string | null
          objetivo?: string | null
          observacao_interna?: string | null
          organization_id: string
          pendencias_cliente?: string[]
          pendencias_internas?: string[]
          perguntas?: string[]
          plano_hash?: string | null
          prazo_proxima_acao?: string | null
          product_catalog_id?: string | null
          produto_pai_id?: string | null
          proxima_acao?: string | null
          proxima_atualizacao_limite_em?: string | null
          proxima_microentrega?: string | null
          regras_anexos?: string[]
          responsavel_user_id?: string | null
          revisao_humana?: string
          rota_confirmada?: string | null
          status?: string
          status_saude?: string
          ultima_atualizacao_cliente_em?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Update: {
          ambiente_autorizado?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          case_service_id?: string | null
          checklist_aplicavel?: string[]
          composicao?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          dependencias_cliente?: string[]
          dependencias_terceiros?: string[]
          dias_sem_touchpoint?: number
          dossie_mae_referencia?: string | null
          dossie_mae_status?: string | null
          entrega_robusta_atual?: string | null
          entregas?: string[]
          etapa?: string | null
          family_id?: string | null
          fase_jornada?: string
          fontes?: Json
          grupo_familiar_status?: string | null
          id?: string
          inicio_previsto?: string | null
          marco_atual?: string | null
          marcos?: string[]
          microentregas?: string[]
          motivos_bloqueio?: Json
          nivel_acesso?: string | null
          objetivo?: string | null
          observacao_interna?: string | null
          organization_id?: string
          pendencias_cliente?: string[]
          pendencias_internas?: string[]
          perguntas?: string[]
          plano_hash?: string | null
          prazo_proxima_acao?: string | null
          product_catalog_id?: string | null
          produto_pai_id?: string | null
          proxima_acao?: string | null
          proxima_atualizacao_limite_em?: string | null
          proxima_microentrega?: string | null
          regras_anexos?: string[]
          responsavel_user_id?: string | null
          revisao_humana?: string
          rota_confirmada?: string | null
          status?: string
          status_saude?: string
          ultima_atualizacao_cliente_em?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "case_plans_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_plans_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_plans_product_catalog_id_fkey"
            columns: ["product_catalog_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      case_reports: {
        Row: {
          archived_at: string | null
          archived_reason: string | null
          case_id: string
          created_at: string
          created_by: string | null
          data_aprovacao: string | null
          data_entrega: string | null
          data_origin: string
          fase_jornada: string
          id: string
          link_interno: string | null
          observacao_interna: string | null
          organization_id: string
          publicado_no_app: boolean
          report_status: string
          report_type: string
          responsavel_id: string | null
          resumo_aprovado_cliente: string | null
          revisor_id: string | null
          titulo: string | null
          updated_at: string
          updated_by: string | null
          versao: number
        }
        Insert: {
          archived_at?: string | null
          archived_reason?: string | null
          case_id: string
          created_at?: string
          created_by?: string | null
          data_aprovacao?: string | null
          data_entrega?: string | null
          data_origin?: string
          fase_jornada: string
          id?: string
          link_interno?: string | null
          observacao_interna?: string | null
          organization_id: string
          publicado_no_app?: boolean
          report_status?: string
          report_type: string
          responsavel_id?: string | null
          resumo_aprovado_cliente?: string | null
          revisor_id?: string | null
          titulo?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Update: {
          archived_at?: string | null
          archived_reason?: string | null
          case_id?: string
          created_at?: string
          created_by?: string | null
          data_aprovacao?: string | null
          data_entrega?: string | null
          data_origin?: string
          fase_jornada?: string
          id?: string
          link_interno?: string | null
          observacao_interna?: string | null
          organization_id?: string
          publicado_no_app?: boolean
          report_status?: string
          report_type?: string
          responsavel_id?: string | null
          resumo_aprovado_cliente?: string | null
          revisor_id?: string | null
          titulo?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "case_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
        ]
      }
      case_service_criterios: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          case_service_id: string | null
          created_at: string
          created_by: string | null
          criterio_codigo: string
          criterio_descricao: string
          decidido_em: string | null
          decidido_por: string | null
          entrega_codigo: string
          entrega_rotulo: string
          evidencia_interna: string | null
          id: string
          justificativa: string | null
          obrigatorio: boolean
          observacao_interna: string | null
          ordem: number
          organization_id: string
          origem_regra: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          case_service_id?: string | null
          created_at?: string
          created_by?: string | null
          criterio_codigo: string
          criterio_descricao: string
          decidido_em?: string | null
          decidido_por?: string | null
          entrega_codigo: string
          entrega_rotulo: string
          evidencia_interna?: string | null
          id?: string
          justificativa?: string | null
          obrigatorio?: boolean
          observacao_interna?: string | null
          ordem?: number
          organization_id: string
          origem_regra?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          case_service_id?: string | null
          created_at?: string
          created_by?: string | null
          criterio_codigo?: string
          criterio_descricao?: string
          decidido_em?: string | null
          decidido_por?: string | null
          entrega_codigo?: string
          entrega_rotulo?: string
          evidencia_interna?: string | null
          id?: string
          justificativa?: string | null
          obrigatorio?: boolean
          observacao_interna?: string | null
          ordem?: number
          organization_id?: string
          origem_regra?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_service_criterios_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_service_criterios_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_service_criterios_case_service_id_fkey"
            columns: ["case_service_id"]
            isOneToOne: false
            referencedRelation: "case_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_service_criterios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_services: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          citizenship_track_id: string | null
          composicao_familiar: string | null
          condicao_comercial_aprovada: string | null
          contrato_referencia_interna: string | null
          created_at: string
          created_by: string | null
          escopo_aprovado: string | null
          id: string
          observacao_interna: string | null
          organization_id: string
          preco_acordado: number | null
          preco_somente_leitura: boolean
          product_catalog_id: string | null
          responsavel_user_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          citizenship_track_id?: string | null
          composicao_familiar?: string | null
          condicao_comercial_aprovada?: string | null
          contrato_referencia_interna?: string | null
          created_at?: string
          created_by?: string | null
          escopo_aprovado?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id: string
          preco_acordado?: number | null
          preco_somente_leitura?: boolean
          product_catalog_id?: string | null
          responsavel_user_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          citizenship_track_id?: string | null
          composicao_familiar?: string | null
          condicao_comercial_aprovada?: string | null
          contrato_referencia_interna?: string | null
          created_at?: string
          created_by?: string | null
          escopo_aprovado?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id?: string
          preco_acordado?: number | null
          preco_somente_leitura?: boolean
          product_catalog_id?: string | null
          responsavel_user_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_services_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_services_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_services_citizenship_track_id_fkey"
            columns: ["citizenship_track_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_services_product_catalog_id_fkey"
            columns: ["product_catalog_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      case_source_document_links: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          case_id: string
          case_report_id: string | null
          created_at: string
          created_by: string | null
          document_request_id: string | null
          evidence_id: string | null
          id: string
          observacao_interna: string | null
          organization_id: string
          research_evidence_item_id: string | null
          research_person_id: string | null
          source_document_id: string
          tipo_vinculo: string
          updated_at: string
          updated_by: string | null
          vinculado_em: string
          vinculado_por: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          case_id: string
          case_report_id?: string | null
          created_at?: string
          created_by?: string | null
          document_request_id?: string | null
          evidence_id?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id: string
          research_evidence_item_id?: string | null
          research_person_id?: string | null
          source_document_id: string
          tipo_vinculo: string
          updated_at?: string
          updated_by?: string | null
          vinculado_em?: string
          vinculado_por?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          case_id?: string
          case_report_id?: string | null
          created_at?: string
          created_by?: string | null
          document_request_id?: string | null
          evidence_id?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id?: string
          research_evidence_item_id?: string | null
          research_person_id?: string | null
          source_document_id?: string
          tipo_vinculo?: string
          updated_at?: string
          updated_by?: string | null
          vinculado_em?: string
          vinculado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_source_document_links_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_source_document_links_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_source_document_links_case_report_id_fkey"
            columns: ["case_report_id"]
            isOneToOne: false
            referencedRelation: "case_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_source_document_links_document_request_id_fkey"
            columns: ["document_request_id"]
            isOneToOne: false
            referencedRelation: "document_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_source_document_links_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_source_document_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_source_document_links_research_evidence_item_id_fkey"
            columns: ["research_evidence_item_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_source_document_links_research_person_id_fkey"
            columns: ["research_person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_source_document_links_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "case_source_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      case_source_documents: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          case_id: string
          cidade: string | null
          confidencialidade: string
          created_at: string
          created_by: string | null
          data_documento: string | null
          estado_provincia: string | null
          extracao_status: string
          id: string
          idioma: string | null
          instituicao_emissora: string | null
          mime_type: string | null
          nome_arquivo: string
          observacoes: string | null
          organization_id: string
          origem_documento: string
          pais: string | null
          pessoa_nao_identificada: boolean
          pessoa_ref_id: string | null
          qualidade_origem: string
          referencia_origem: string | null
          status: string
          storage_path: string
          tamanho_bytes: number | null
          tipo_documento: string
          titulo_interno: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          case_id: string
          cidade?: string | null
          confidencialidade?: string
          created_at?: string
          created_by?: string | null
          data_documento?: string | null
          estado_provincia?: string | null
          extracao_status?: string
          id?: string
          idioma?: string | null
          instituicao_emissora?: string | null
          mime_type?: string | null
          nome_arquivo: string
          observacoes?: string | null
          organization_id: string
          origem_documento: string
          pais?: string | null
          pessoa_nao_identificada?: boolean
          pessoa_ref_id?: string | null
          qualidade_origem?: string
          referencia_origem?: string | null
          status?: string
          storage_path: string
          tamanho_bytes?: number | null
          tipo_documento: string
          titulo_interno?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          case_id?: string
          cidade?: string | null
          confidencialidade?: string
          created_at?: string
          created_by?: string | null
          data_documento?: string | null
          estado_provincia?: string | null
          extracao_status?: string
          id?: string
          idioma?: string | null
          instituicao_emissora?: string | null
          mime_type?: string | null
          nome_arquivo?: string
          observacoes?: string | null
          organization_id?: string
          origem_documento?: string
          pais?: string | null
          pessoa_nao_identificada?: boolean
          pessoa_ref_id?: string | null
          qualidade_origem?: string
          referencia_origem?: string | null
          status?: string
          storage_path?: string
          tamanho_bytes?: number | null
          tipo_documento?: string
          titulo_interno?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      case_timeline_events: {
        Row: {
          alerta: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          bloqueio: boolean
          case_id: string
          created_at: string
          created_by: string | null
          due_at: string | null
          event_type: string
          id: string
          next_action: string | null
          next_action_id: string | null
          occurred_at: string | null
          organization_id: string
          phase: string | null
          responsavel_nome: string | null
          responsible_user_id: string | null
          source_entity_id: string | null
          source_entity_type: string | null
          status: string
          summary_client_approved: string | null
          summary_internal: string | null
          title: string
          updated_at: string
          updated_by: string | null
          visibility: string
        }
        Insert: {
          alerta?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio?: boolean
          case_id: string
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          event_type: string
          id?: string
          next_action?: string | null
          next_action_id?: string | null
          occurred_at?: string | null
          organization_id: string
          phase?: string | null
          responsavel_nome?: string | null
          responsible_user_id?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          status?: string
          summary_client_approved?: string | null
          summary_internal?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          visibility?: string
        }
        Update: {
          alerta?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio?: boolean
          case_id?: string
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          event_type?: string
          id?: string
          next_action?: string | null
          next_action_id?: string | null
          occurred_at?: string | null
          organization_id?: string
          phase?: string | null
          responsavel_nome?: string | null
          responsible_user_id?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          status?: string
          summary_client_approved?: string | null
          summary_internal?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_timeline_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_timeline_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_timeline_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      caso_log: {
        Row: {
          autor_user_id: string | null
          campo: string
          case_id: string
          created_at: string
          entidade: string
          entidade_id: string | null
          id: string
          organization_id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          autor_user_id?: string | null
          campo: string
          case_id: string
          created_at?: string
          entidade?: string
          entidade_id?: string | null
          id?: string
          organization_id: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          autor_user_id?: string | null
          campo?: string
          case_id?: string
          created_at?: string
          entidade?: string
          entidade_id?: string | null
          id?: string
          organization_id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caso_log_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caso_log_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
        ]
      }
      casos: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          archived_reason: string | null
          canvas_publicado: boolean
          canvas_token: string
          case_id: string
          case_nome: string | null
          cliente_nome: string
          created_at: string
          dados_sensiveis_ocultos: boolean
          id: string
          origem: string | null
          pais: string | null
          produto_nome: string | null
          produto_sku: string | null
          redirect_case_id: string | null
          redirect_codigo: string | null
          responsavel: string | null
          status: string
          ultima_atualizacao: string | null
          updated_at: string
          via: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          archived_reason?: string | null
          canvas_publicado?: boolean
          canvas_token?: string
          case_id: string
          case_nome?: string | null
          cliente_nome: string
          created_at?: string
          dados_sensiveis_ocultos?: boolean
          id?: string
          origem?: string | null
          pais?: string | null
          produto_nome?: string | null
          produto_sku?: string | null
          redirect_case_id?: string | null
          redirect_codigo?: string | null
          responsavel?: string | null
          status?: string
          ultima_atualizacao?: string | null
          updated_at?: string
          via?: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          archived_reason?: string | null
          canvas_publicado?: boolean
          canvas_token?: string
          case_id?: string
          case_nome?: string | null
          cliente_nome?: string
          created_at?: string
          dados_sensiveis_ocultos?: boolean
          id?: string
          origem?: string | null
          pais?: string | null
          produto_nome?: string | null
          produto_sku?: string | null
          redirect_case_id?: string | null
          redirect_codigo?: string | null
          responsavel?: string | null
          status?: string
          ultima_atualizacao?: string | null
          updated_at?: string
          via?: string
        }
        Relationships: []
      }
      catalog_audit_events: {
        Row: {
          ator: string | null
          ator_papel: string | null
          campo: string | null
          created_at: string
          dados_teste: boolean
          evento: string
          id: string
          motivo: string | null
          organization_id: string
          origem: string
          product_id: string | null
          sku_codigo: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          ator?: string | null
          ator_papel?: string | null
          campo?: string | null
          created_at?: string
          dados_teste?: boolean
          evento: string
          id?: string
          motivo?: string | null
          organization_id: string
          origem?: string
          product_id?: string | null
          sku_codigo: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          ator?: string | null
          ator_papel?: string | null
          campo?: string | null
          created_at?: string
          dados_teste?: boolean
          evento?: string
          id?: string
          motivo?: string | null
          organization_id?: string
          origem?: string
          product_id?: string | null
          sku_codigo?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_audit_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_payment_link_refs: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          dados_teste: boolean
          divergencia: string | null
          estado_link: string
          id: string
          moeda: string
          observacao_interna: string | null
          organization_id: string
          product_id: string
          referencia_url: string | null
          sku_codigo: string
          tipo_link: string
          updated_at: string
          updated_by: string | null
          validado_em: string | null
          validado_por: string | null
          valor_validado: number | null
          versao_preco_associada: string | null
          versao_sku_associada: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          divergencia?: string | null
          estado_link?: string
          id?: string
          moeda?: string
          observacao_interna?: string | null
          organization_id: string
          product_id: string
          referencia_url?: string | null
          sku_codigo: string
          tipo_link?: string
          updated_at?: string
          updated_by?: string | null
          validado_em?: string | null
          validado_por?: string | null
          valor_validado?: number | null
          versao_preco_associada?: string | null
          versao_sku_associada?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          divergencia?: string | null
          estado_link?: string
          id?: string
          moeda?: string
          observacao_interna?: string | null
          organization_id?: string
          product_id?: string
          referencia_url?: string | null
          sku_codigo?: string
          tipo_link?: string
          updated_at?: string
          updated_by?: string | null
          validado_em?: string | null
          validado_por?: string | null
          valor_validado?: number | null
          versao_preco_associada?: string | null
          versao_sku_associada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_payment_link_refs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_reconciliation_runs: {
        Row: {
          bloqueios: Json
          case_id: string | null
          contract_id: string | null
          created_at: string
          decisoes_anteriores: Json
          divergencias: Json
          executado_por: string | null
          id: string
          motivo: string | null
          organization_id: string
          origem: string
          pode_gerar_contrato: boolean
          pode_gerar_os: boolean
          preco_homologado: number | null
          proposal_id: string
          registradas: number
          resolvidas: number
          service_order_id: string | null
          sku: string | null
          versao: number
        }
        Insert: {
          bloqueios?: Json
          case_id?: string | null
          contract_id?: string | null
          created_at?: string
          decisoes_anteriores?: Json
          divergencias?: Json
          executado_por?: string | null
          id?: string
          motivo?: string | null
          organization_id: string
          origem?: string
          pode_gerar_contrato?: boolean
          pode_gerar_os?: boolean
          preco_homologado?: number | null
          proposal_id: string
          registradas?: number
          resolvidas?: number
          service_order_id?: string | null
          sku?: string | null
          versao: number
        }
        Update: {
          bloqueios?: Json
          case_id?: string | null
          contract_id?: string | null
          created_at?: string
          decisoes_anteriores?: Json
          divergencias?: Json
          executado_por?: string | null
          id?: string
          motivo?: string | null
          organization_id?: string
          origem?: string
          pode_gerar_contrato?: boolean
          pode_gerar_os?: boolean
          preco_homologado?: number | null
          proposal_id?: string
          registradas?: number
          resolvidas?: number
          service_order_id?: string | null
          sku?: string | null
          versao?: number
        }
        Relationships: []
      }
      catalog_source_divergences: {
        Row: {
          case_id: string | null
          contract_id: string | null
          created_at: string
          detalhe: string
          fonte_linha: number | null
          fonte_referencia: string
          id: string
          observacao_resolucao: string | null
          organization_id: string
          resolucao_registrada_em: string | null
          resolucao_registrada_por: string | null
          resolvido: boolean
          service_order_id: string | null
          severidade: string
          sku: string
          tipo: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          contract_id?: string | null
          created_at?: string
          detalhe: string
          fonte_linha?: number | null
          fonte_referencia: string
          id?: string
          observacao_resolucao?: string | null
          organization_id: string
          resolucao_registrada_em?: string | null
          resolucao_registrada_por?: string | null
          resolvido?: boolean
          service_order_id?: string | null
          severidade?: string
          sku: string
          tipo: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          contract_id?: string | null
          created_at?: string
          detalhe?: string
          fonte_linha?: number | null
          fonte_referencia?: string
          id?: string
          observacao_resolucao?: string | null
          organization_id?: string
          resolucao_registrada_em?: string | null
          resolucao_registrada_por?: string | null
          resolvido?: boolean
          service_order_id?: string | null
          severidade?: string
          sku?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_source_divergences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      change_log: {
        Row: {
          autor_user_id: string | null
          created_at: string
          entidade: string
          entidade_id: string
          id: string
          organization_id: string
          resumo: string | null
          snapshot_anterior: Json
          titulo: string | null
          versao_anterior: number | null
          versao_nova: number | null
        }
        Insert: {
          autor_user_id?: string | null
          created_at?: string
          entidade: string
          entidade_id: string
          id?: string
          organization_id: string
          resumo?: string | null
          snapshot_anterior?: Json
          titulo?: string | null
          versao_anterior?: number | null
          versao_nova?: number | null
        }
        Update: {
          autor_user_id?: string | null
          created_at?: string
          entidade?: string
          entidade_id?: string
          id?: string
          organization_id?: string
          resumo?: string | null
          snapshot_anterior?: Json
          titulo?: string | null
          versao_anterior?: number | null
          versao_nova?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "change_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_cadastral: {
        Row: {
          acesso_restrito: boolean
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          campo: string
          campo_rotulo: string
          case_id: string
          cliente_id: string | null
          created_at: string
          created_by: string | null
          data_verificacao: string | null
          fonte: string | null
          id: string
          obrigatorio: boolean
          observacao_interna: string | null
          ordem: number
          organization_id: string
          pessoa_nome: string
          pessoa_nome_historico: string | null
          pessoa_ref_id: string | null
          pessoa_ref_tabela: string | null
          pessoa_tipo: string
          reconciliacao_motivo: string | null
          reconciliado_em: string | null
          reconciliado_por: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          acesso_restrito?: boolean
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          campo: string
          campo_rotulo: string
          case_id: string
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_verificacao?: string | null
          fonte?: string | null
          id?: string
          obrigatorio?: boolean
          observacao_interna?: string | null
          ordem?: number
          organization_id: string
          pessoa_nome: string
          pessoa_nome_historico?: string | null
          pessoa_ref_id?: string | null
          pessoa_ref_tabela?: string | null
          pessoa_tipo: string
          reconciliacao_motivo?: string | null
          reconciliado_em?: string | null
          reconciliado_por?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          acesso_restrito?: boolean
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          campo?: string
          campo_rotulo?: string
          case_id?: string
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_verificacao?: string | null
          fonte?: string | null
          id?: string
          obrigatorio?: boolean
          observacao_interna?: string | null
          ordem?: number
          organization_id?: string
          pessoa_nome?: string
          pessoa_nome_historico?: string | null
          pessoa_ref_id?: string | null
          pessoa_ref_tabela?: string | null
          pessoa_tipo?: string
          reconciliacao_motivo?: string | null
          reconciliado_em?: string | null
          reconciliado_por?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_cadastral_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_cadastral_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_cadastral_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_cadastral_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_cadastral_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      citizenship_tracks: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          ativo: boolean
          autorizacao_pesquisa_necessaria: boolean
          code: string
          created_at: string
          created_by: string | null
          criterio_aprovacao: string | null
          documentos_prioritarios: string | null
          evidencia_aprovacao_referencia: string | null
          id: string
          idioma_entrevista: string | null
          legal_reference_label: string | null
          legal_reference_summary: string | null
          lifecycle_status: string
          marco_juridico_referencia: string | null
          nacionalidade: string | null
          official_source_name: string | null
          official_source_url: string | null
          organization_id: string
          owner_id: string | null
          pais: string
          pesquisa_externa_aplicavel: boolean
          requisitos_entrada: string | null
          responsavel_revisao: string | null
          revisao_humana_juridica: string
          riscos_internos: string | null
          status_atualizacao: string
          status_via: string
          texto_sanitizado_cliente: string | null
          track_name: string | null
          ultima_revisao_em: string | null
          updated_at: string
          updated_by: string | null
          versao: string | null
          via_preliminar: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativo?: boolean
          autorizacao_pesquisa_necessaria?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          criterio_aprovacao?: string | null
          documentos_prioritarios?: string | null
          evidencia_aprovacao_referencia?: string | null
          id?: string
          idioma_entrevista?: string | null
          legal_reference_label?: string | null
          legal_reference_summary?: string | null
          lifecycle_status?: string
          marco_juridico_referencia?: string | null
          nacionalidade?: string | null
          official_source_name?: string | null
          official_source_url?: string | null
          organization_id: string
          owner_id?: string | null
          pais: string
          pesquisa_externa_aplicavel?: boolean
          requisitos_entrada?: string | null
          responsavel_revisao?: string | null
          revisao_humana_juridica?: string
          riscos_internos?: string | null
          status_atualizacao?: string
          status_via?: string
          texto_sanitizado_cliente?: string | null
          track_name?: string | null
          ultima_revisao_em?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: string | null
          via_preliminar?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativo?: boolean
          autorizacao_pesquisa_necessaria?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          criterio_aprovacao?: string | null
          documentos_prioritarios?: string | null
          evidencia_aprovacao_referencia?: string | null
          id?: string
          idioma_entrevista?: string | null
          legal_reference_label?: string | null
          legal_reference_summary?: string | null
          lifecycle_status?: string
          marco_juridico_referencia?: string | null
          nacionalidade?: string | null
          official_source_name?: string | null
          official_source_url?: string | null
          organization_id?: string
          owner_id?: string | null
          pais?: string
          pesquisa_externa_aplicavel?: boolean
          requisitos_entrada?: string | null
          responsavel_revisao?: string | null
          revisao_humana_juridica?: string
          riscos_internos?: string | null
          status_atualizacao?: string
          status_via?: string
          texto_sanitizado_cliente?: string | null
          track_name?: string | null
          ultima_revisao_em?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: string | null
          via_preliminar?: string | null
        }
        Relationships: []
      }
      client_access_events: {
        Row: {
          actor_user_id: string | null
          auth_user_id: string | null
          client_portal_access_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["portal_event_type"]
          id: string
          metadata: Json
          occurred_at: string
          organization_id: string
        }
        Insert: {
          actor_user_id?: string | null
          auth_user_id?: string | null
          client_portal_access_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["portal_event_type"]
          id?: string
          metadata?: Json
          occurred_at?: string
          organization_id: string
        }
        Update: {
          actor_user_id?: string | null
          auth_user_id?: string | null
          client_portal_access_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["portal_event_type"]
          id?: string
          metadata?: Json
          occurred_at?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_access_events_client_portal_access_id_fkey"
            columns: ["client_portal_access_id"]
            isOneToOne: false
            referencedRelation: "client_portal_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_access_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          client_id: string
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          organization_id: string
          principal: boolean
          relacao: string | null
          telefone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          organization_id: string
          principal?: boolean
          relacao?: string | null
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          organization_id?: string
          principal?: boolean
          relacao?: string | null
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_deliverables: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          available_at: string | null
          case_id: string
          client_id: string | null
          created_at: string
          created_by: string | null
          deep_link: string | null
          deliverable_type: string
          fallback_whatsapp_enviado: boolean
          family_id: string | null
          id: string
          internal_reference: string | null
          journey_phase: string | null
          notification_channel: string
          organization_id: string
          priority: string
          published_at: string | null
          responsible_user_id: string | null
          summary_approved: string | null
          title_client: string
          updated_at: string
          updated_by: string | null
          viewed_at: string | null
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          available_at?: string | null
          case_id: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deep_link?: string | null
          deliverable_type: string
          fallback_whatsapp_enviado?: boolean
          family_id?: string | null
          id?: string
          internal_reference?: string | null
          journey_phase?: string | null
          notification_channel?: string
          organization_id: string
          priority?: string
          published_at?: string | null
          responsible_user_id?: string | null
          summary_approved?: string | null
          title_client: string
          updated_at?: string
          updated_by?: string | null
          viewed_at?: string | null
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          available_at?: string | null
          case_id?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deep_link?: string | null
          deliverable_type?: string
          fallback_whatsapp_enviado?: boolean
          family_id?: string | null
          id?: string
          internal_reference?: string | null
          journey_phase?: string | null
          notification_channel?: string
          organization_id?: string
          priority?: string
          published_at?: string | null
          responsible_user_id?: string | null
          summary_approved?: string | null
          title_client?: string
          updated_at?: string
          updated_by?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_deliverables_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_deliverables_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_deliverables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_deliverables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_deliverables_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_access: {
        Row: {
          access_level: Database["public"]["Enums"]["portal_access_level"]
          access_status: Database["public"]["Enums"]["portal_access_status"]
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          auth_user_id: string | null
          authorized_email_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          demo: boolean
          email: string
          finalidade: string | null
          first_authenticated_at: string | null
          id: string
          invitation_expires_at: string | null
          invited_at: string | null
          invited_by: string | null
          is_demo: boolean
          last_authenticated_at: string | null
          magic_link_expires_at: string | null
          magic_link_max_uses: number
          magic_link_uses: number
          notes_internal: string | null
          organization_id: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["portal_access_level"]
          access_status?: Database["public"]["Enums"]["portal_access_status"]
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          auth_user_id?: string | null
          authorized_email_id?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          demo?: boolean
          email: string
          finalidade?: string | null
          first_authenticated_at?: string | null
          id?: string
          invitation_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_demo?: boolean
          last_authenticated_at?: string | null
          magic_link_expires_at?: string | null
          magic_link_max_uses?: number
          magic_link_uses?: number
          notes_internal?: string | null
          organization_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["portal_access_level"]
          access_status?: Database["public"]["Enums"]["portal_access_status"]
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          auth_user_id?: string | null
          authorized_email_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          demo?: boolean
          email?: string
          finalidade?: string | null
          first_authenticated_at?: string | null
          id?: string
          invitation_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_demo?: boolean
          last_authenticated_at?: string | null
          magic_link_expires_at?: string | null
          magic_link_max_uses?: number
          magic_link_uses?: number
          notes_internal?: string | null
          organization_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_access_authorized_email_id_fkey"
            columns: ["authorized_email_id"]
            isOneToOne: false
            referencedRelation: "authorized_portal_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_access_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_case_access: {
        Row: {
          access_status: Database["public"]["Enums"]["portal_case_status"]
          case_id: string
          client_portal_access_id: string
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          organization_id: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          updated_at: string
        }
        Insert: {
          access_status?: Database["public"]["Enums"]["portal_case_status"]
          case_id: string
          client_portal_access_id: string
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          organization_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
        }
        Update: {
          access_status?: Database["public"]["Enums"]["portal_case_status"]
          case_id?: string
          client_portal_access_id?: string
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          organization_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_case_access_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_case_access_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_case_access_client_portal_access_id_fkey"
            columns: ["client_portal_access_id"]
            isOneToOne: false
            referencedRelation: "client_portal_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_case_access_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          ativacao_decidida_em: string | null
          ativacao_decidida_por: string | null
          ativacao_justificativa: string | null
          cidade_nascimento: string | null
          classificacao: string
          cpf: string | null
          created_at: string
          created_by: string | null
          data_nascimento: string | null
          data_origin: string
          demo: boolean
          documento: string | null
          email: string | null
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_complemento: string | null
          endereco_logradouro: string | null
          endereco_numero: string | null
          endereco_pais: string | null
          endereco_uf: string | null
          estado_civil: string | null
          id: string
          indicado_por: string | null
          is_demo: boolean
          lead_id: string | null
          nacionalidade: string | null
          nome: string
          nome_conjuge: string | null
          nome_mae: string | null
          nome_pai: string | null
          nome_social: string | null
          observacoes: string | null
          organization_id: string
          origem: string | null
          pais_interesse: string | null
          procurador_cliente_id: string | null
          procurador_escopo: string | null
          profissao: string | null
          rg_numero: string | null
          rg_orgao_uf: string | null
          sexo: string | null
          status: string
          status_comercial: string | null
          telefone: string | null
          telefone_whatsapp: boolean | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativacao_decidida_em?: string | null
          ativacao_decidida_por?: string | null
          ativacao_justificativa?: string | null
          cidade_nascimento?: string | null
          classificacao?: string
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          data_origin?: string
          demo?: boolean
          documento?: string | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          endereco_pais?: string | null
          endereco_uf?: string | null
          estado_civil?: string | null
          id?: string
          indicado_por?: string | null
          is_demo?: boolean
          lead_id?: string | null
          nacionalidade?: string | null
          nome: string
          nome_conjuge?: string | null
          nome_mae?: string | null
          nome_pai?: string | null
          nome_social?: string | null
          observacoes?: string | null
          organization_id: string
          origem?: string | null
          pais_interesse?: string | null
          procurador_cliente_id?: string | null
          procurador_escopo?: string | null
          profissao?: string | null
          rg_numero?: string | null
          rg_orgao_uf?: string | null
          sexo?: string | null
          status?: string
          status_comercial?: string | null
          telefone?: string | null
          telefone_whatsapp?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativacao_decidida_em?: string | null
          ativacao_decidida_por?: string | null
          ativacao_justificativa?: string | null
          cidade_nascimento?: string | null
          classificacao?: string
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          data_origin?: string
          demo?: boolean
          documento?: string | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          endereco_pais?: string | null
          endereco_uf?: string | null
          estado_civil?: string | null
          id?: string
          indicado_por?: string | null
          is_demo?: boolean
          lead_id?: string | null
          nacionalidade?: string | null
          nome?: string
          nome_conjuge?: string | null
          nome_mae?: string | null
          nome_pai?: string | null
          nome_social?: string | null
          observacoes?: string | null
          organization_id?: string
          origem?: string | null
          pais_interesse?: string | null
          procurador_cliente_id?: string | null
          procurador_escopo?: string | null
          profissao?: string | null
          rg_numero?: string | null
          rg_orgao_uf?: string | null
          sexo?: string | null
          status?: string
          status_comercial?: string | null
          telefone?: string | null
          telefone_whatsapp?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_procurador_cliente_id_fkey"
            columns: ["procurador_cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_procurador_cliente_id_fkey"
            columns: ["procurador_cliente_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_conditions: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          case_service_id: string | null
          codigo: string
          condicao_aplicavel: string | null
          created_at: string
          created_by: string | null
          dados_teste: boolean
          data_origin: string
          forma_pagamento: string | null
          homologado_em: string | null
          homologado_por: string | null
          id: string
          observacao_interna: string | null
          organization_id: string
          origem: string
          parcelas: number | null
          primeiro_vencimento: string | null
          product_catalog_id: string | null
          proposal_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
          valor_parcela: number | null
          valor_total_referencia: number | null
          vencimento_dia: number | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          case_service_id?: string | null
          codigo: string
          condicao_aplicavel?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          data_origin?: string
          forma_pagamento?: string | null
          homologado_em?: string | null
          homologado_por?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id: string
          origem?: string
          parcelas?: number | null
          primeiro_vencimento?: string | null
          product_catalog_id?: string | null
          proposal_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor_parcela?: number | null
          valor_total_referencia?: number | null
          vencimento_dia?: number | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          case_service_id?: string | null
          codigo?: string
          condicao_aplicavel?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          data_origin?: string
          forma_pagamento?: string | null
          homologado_em?: string | null
          homologado_por?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id?: string
          origem?: string
          parcelas?: number | null
          primeiro_vencimento?: string | null
          product_catalog_id?: string | null
          proposal_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor_parcela?: number | null
          valor_total_referencia?: number | null
          vencimento_dia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_conditions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_conditions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_conditions_case_service_id_fkey"
            columns: ["case_service_id"]
            isOneToOne: false
            referencedRelation: "case_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_conditions_product_catalog_id_fkey"
            columns: ["product_catalog_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_conditions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_queue: {
        Row: {
          acao_codigo: string | null
          approved_at: string | null
          approved_by: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          assunto: string | null
          case_id: string | null
          corpo_rascunho: string | null
          created_at: string
          created_by: string | null
          data_origin: string
          id: string
          observacao_interna: string | null
          organization_id: string
          requires_human_approval: boolean
          sent_at: string | null
          status: string
          suggested_channel: string
          target_audience: string
          updated_at: string
          updated_by: string | null
          visibility: string
        }
        Insert: {
          acao_codigo?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assunto?: string | null
          case_id?: string | null
          corpo_rascunho?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          id?: string
          observacao_interna?: string | null
          organization_id: string
          requires_human_approval?: boolean
          sent_at?: string | null
          status?: string
          suggested_channel?: string
          target_audience?: string
          updated_at?: string
          updated_by?: string | null
          visibility?: string
        }
        Update: {
          acao_codigo?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assunto?: string | null
          case_id?: string | null
          corpo_rascunho?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          id?: string
          observacao_interna?: string | null
          organization_id?: string
          requires_human_approval?: boolean
          sent_at?: string | null
          status?: string
          suggested_channel?: string
          target_audience?: string
          updated_at?: string
          updated_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_queue_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_queue_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
        ]
      }
      composition_template_events: {
        Row: {
          ator: string | null
          criado_em: string
          detalhe: string | null
          evento: string
          id: string
          organization_id: string
          template_id: string
        }
        Insert: {
          ator?: string | null
          criado_em?: string
          detalhe?: string | null
          evento: string
          id?: string
          organization_id: string
          template_id: string
        }
        Update: {
          ator?: string | null
          criado_em?: string
          detalhe?: string | null
          evento?: string
          id?: string
          organization_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "composition_template_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "composition_template_events_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "composition_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      composition_templates: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          archived_reason: string | null
          atualizado_em: string
          autor: string | null
          base_contratual: string | null
          criado_em: string
          criado_por: string | null
          finalidade: string | null
          fonte: string | null
          id: string
          nome: string
          organization_id: string
          status: string
          template_key: string
          versao: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          archived_reason?: string | null
          atualizado_em?: string
          autor?: string | null
          base_contratual?: string | null
          criado_em?: string
          criado_por?: string | null
          finalidade?: string | null
          fonte?: string | null
          id?: string
          nome: string
          organization_id: string
          status?: string
          template_key: string
          versao: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          archived_reason?: string | null
          atualizado_em?: string
          autor?: string | null
          base_contratual?: string | null
          criado_em?: string
          criado_por?: string | null
          finalidade?: string | null
          fonte?: string | null
          id?: string
          nome?: string
          organization_id?: string
          status?: string
          template_key?: string
          versao?: string
        }
        Relationships: [
          {
            foreignKeyName: "composition_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_exceptions: {
        Row: {
          aprovado_em: string
          aprovado_por: string
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          motivo: string
          organization_id: string
          revogado_em: string | null
          updated_at: string
          updated_by: string | null
          valido_ate: string | null
        }
        Insert: {
          aprovado_em?: string
          aprovado_por: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          motivo: string
          organization_id: string
          revogado_em?: string | null
          updated_at?: string
          updated_by?: string | null
          valido_ate?: string | null
        }
        Update: {
          aprovado_em?: string
          aprovado_por?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          motivo?: string
          organization_id?: string
          revogado_em?: string | null
          updated_at?: string
          updated_by?: string | null
          valido_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_exceptions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_exceptions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_exceptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_exceptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_exceptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          client_id: string
          coletado_em: string | null
          created_at: string
          created_by: string | null
          documento_id: string | null
          escopo_compartilhamento: string | null
          evidencia_consentimento: string | null
          evidencia_id: string | null
          id: string
          metodo_coleta: string | null
          organization_id: string
          revogacao_motivo: string | null
          revogado_em: string | null
          revogado_por: string | null
          status: string
          texto_aceito: string | null
          tipo_consentimento: string
          updated_at: string
          updated_by: string | null
          versao_texto: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id: string
          coletado_em?: string | null
          created_at?: string
          created_by?: string | null
          documento_id?: string | null
          escopo_compartilhamento?: string | null
          evidencia_consentimento?: string | null
          evidencia_id?: string | null
          id?: string
          metodo_coleta?: string | null
          organization_id: string
          revogacao_motivo?: string | null
          revogado_em?: string | null
          revogado_por?: string | null
          status?: string
          texto_aceito?: string | null
          tipo_consentimento: string
          updated_at?: string
          updated_by?: string | null
          versao_texto: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string
          coletado_em?: string | null
          created_at?: string
          created_by?: string | null
          documento_id?: string | null
          escopo_compartilhamento?: string | null
          evidencia_consentimento?: string | null
          evidencia_id?: string | null
          id?: string
          metodo_coleta?: string | null
          organization_id?: string
          revogacao_motivo?: string | null
          revogado_em?: string | null
          revogado_por?: string | null
          status?: string
          texto_aceito?: string | null
          tipo_consentimento?: string
          updated_at?: string
          updated_by?: string | null
          versao_texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_evidencia_id_fkey"
            columns: ["evidencia_id"]
            isOneToOne: false
            referencedRelation: "evidencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          data_origin: string
          email: string | null
          id: string
          nome: string
          observacao_interna: string | null
          organization_id: string
          origem: string
          origem_detalhe: string | null
          responsavel_user_id: string | null
          status: string
          telefone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          email?: string | null
          id?: string
          nome: string
          observacao_interna?: string | null
          organization_id: string
          origem?: string
          origem_detalhe?: string | null
          responsavel_user_id?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          email?: string | null
          id?: string
          nome?: string
          observacao_interna?: string | null
          organization_id?: string
          origem?: string
          origem_detalhe?: string | null
          responsavel_user_id?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_annexes: {
        Row: {
          annex_code: string
          annex_type: string
          annex_version: number
          applicability_rule: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          contract_id: string | null
          contract_version_id: string | null
          created_at: string
          created_by: string | null
          file_hash: string | null
          file_path: string | null
          id: string
          internal_notes: string | null
          is_test: boolean
          model_version: string | null
          organization_id: string
          parameters_id: string | null
          prepared_by: string | null
          preview_id: string | null
          reason_not_applicable: string | null
          rendered_html: string | null
          required_for_contract: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          source: string | null
          source_reference: string | null
          status: string
          structured_data: Json
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          annex_code: string
          annex_type: string
          annex_version?: number
          applicability_rule?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          contract_id?: string | null
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          file_hash?: string | null
          file_path?: string | null
          id?: string
          internal_notes?: string | null
          is_test?: boolean
          model_version?: string | null
          organization_id: string
          parameters_id?: string | null
          prepared_by?: string | null
          preview_id?: string | null
          reason_not_applicable?: string | null
          rendered_html?: string | null
          required_for_contract?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          source_reference?: string | null
          status?: string
          structured_data?: Json
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          annex_code?: string
          annex_type?: string
          annex_version?: number
          applicability_rule?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          contract_id?: string | null
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          file_hash?: string | null
          file_path?: string | null
          id?: string
          internal_notes?: string | null
          is_test?: boolean
          model_version?: string | null
          organization_id?: string
          parameters_id?: string | null
          prepared_by?: string | null
          preview_id?: string | null
          reason_not_applicable?: string | null
          rendered_html?: string | null
          required_for_contract?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          source_reference?: string | null
          status?: string
          structured_data?: Json
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_annexes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_annexes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_annexes_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_annexes_contract_version_id_fkey"
            columns: ["contract_version_id"]
            isOneToOne: false
            referencedRelation: "contract_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_annexes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_annexes_parameters_id_fkey"
            columns: ["parameters_id"]
            isOneToOne: false
            referencedRelation: "contract_case_parameters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_annexes_preview_id_fkey"
            columns: ["preview_id"]
            isOneToOne: false
            referencedRelation: "contract_parameter_previews"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_case_parameters: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          bloqueio_motivo: string | null
          case_id: string
          completude_pct: number
          contract_id: string | null
          contract_template_id: string | null
          contract_template_version: number | null
          created_at: string
          created_by: string | null
          id: string
          observacoes_internas: string | null
          organization_id: string
          proposal_id: string | null
          revisao_humana_em: string | null
          revisao_humana_por: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio_motivo?: string | null
          case_id: string
          completude_pct?: number
          contract_id?: string | null
          contract_template_id?: string | null
          contract_template_version?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          observacoes_internas?: string | null
          organization_id: string
          proposal_id?: string | null
          revisao_humana_em?: string | null
          revisao_humana_por?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio_motivo?: string | null
          case_id?: string
          completude_pct?: number
          contract_id?: string | null
          contract_template_id?: string | null
          contract_template_version?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          observacoes_internas?: string | null
          organization_id?: string
          proposal_id?: string | null
          revisao_humana_em?: string | null
          revisao_humana_por?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_case_parameters_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_case_parameters_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_case_parameters_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_case_parameters_contract_template_id_fkey"
            columns: ["contract_template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_case_parameters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_case_parameters_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_clause_overrides: {
        Row: {
          action: string
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          base_contract_clause_reference: string | null
          change_reason: string | null
          clause_code: string
          clause_text: string | null
          clause_title: string
          contract_id: string
          contract_version_id: string | null
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          precedence_statement: string | null
          requires_human_review: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action: string
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          base_contract_clause_reference?: string | null
          change_reason?: string | null
          clause_code: string
          clause_text?: string | null
          clause_title: string
          contract_id: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          precedence_statement?: string | null
          requires_human_review?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action?: string
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          base_contract_clause_reference?: string | null
          change_reason?: string | null
          clause_code?: string
          clause_text?: string | null
          clause_title?: string
          contract_id?: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          precedence_statement?: string | null
          requires_human_review?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_clause_overrides_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_clause_overrides_contract_version_id_fkey"
            columns: ["contract_version_id"]
            isOneToOne: false
            referencedRelation: "contract_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_clause_overrides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_exceptions: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          authorized_at: string
          authorized_by: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          demo: boolean
          expires_at: string | null
          id: string
          impact: string
          organization_id: string
          reason: string
          revoked_at: string | null
          scope: string
          service_order_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          authorized_at?: string
          authorized_by?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          expires_at?: string | null
          id?: string
          impact: string
          organization_id: string
          reason: string
          revoked_at?: string | null
          scope: string
          service_order_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          authorized_at?: string
          authorized_by?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          expires_at?: string | null
          id?: string
          impact?: string
          organization_id?: string
          reason?: string
          revoked_at?: string | null
          scope?: string
          service_order_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_exceptions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_exceptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_exceptions_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_parameter_previews: {
        Row: {
          anexos: Json
          aprovado_em: string | null
          aprovado_por: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          congelado_em: string
          conteudo: Json
          conteudo_hash: string | null
          corpo_contratual: boolean
          created_at: string
          created_by: string | null
          estado: string
          evento: string | null
          gerado_por: string | null
          html: string
          id: string
          legado_sem_corpo: boolean
          legado_sem_evento: boolean
          motivo: string | null
          organization_id: string
          parameters_id: string
          placeholders_pendentes: Json
          template_code: string | null
          template_version: number | null
          tipo: string
          updated_at: string
          updated_by: string | null
          versao: number
        }
        Insert: {
          anexos?: Json
          aprovado_em?: string | null
          aprovado_por?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          congelado_em?: string
          conteudo?: Json
          conteudo_hash?: string | null
          corpo_contratual?: boolean
          created_at?: string
          created_by?: string | null
          estado?: string
          evento?: string | null
          gerado_por?: string | null
          html?: string
          id?: string
          legado_sem_corpo?: boolean
          legado_sem_evento?: boolean
          motivo?: string | null
          organization_id: string
          parameters_id: string
          placeholders_pendentes?: Json
          template_code?: string | null
          template_version?: number | null
          tipo?: string
          updated_at?: string
          updated_by?: string | null
          versao: number
        }
        Update: {
          anexos?: Json
          aprovado_em?: string | null
          aprovado_por?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          congelado_em?: string
          conteudo?: Json
          conteudo_hash?: string | null
          corpo_contratual?: boolean
          created_at?: string
          created_by?: string | null
          estado?: string
          evento?: string | null
          gerado_por?: string | null
          html?: string
          id?: string
          legado_sem_corpo?: boolean
          legado_sem_evento?: boolean
          motivo?: string | null
          organization_id?: string
          parameters_id?: string
          placeholders_pendentes?: Json
          template_code?: string | null
          template_version?: number | null
          tipo?: string
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_parameter_previews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_parameter_previews_parameters_id_fkey"
            columns: ["parameters_id"]
            isOneToOne: false
            referencedRelation: "contract_case_parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_parameter_values: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          atualizado_em: string | null
          atualizado_por: string | null
          campo: string
          conflito: Json
          created_at: string
          created_by: string | null
          grupo: string
          id: string
          justificativa: string | null
          label: string
          obrigatorio: boolean
          ordem: number
          organization_id: string
          origem: string | null
          origem_detalhe: string | null
          parameters_id: string
          status: string
          updated_at: string
          updated_by: string | null
          valor: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          campo: string
          conflito?: Json
          created_at?: string
          created_by?: string | null
          grupo: string
          id?: string
          justificativa?: string | null
          label: string
          obrigatorio?: boolean
          ordem?: number
          organization_id: string
          origem?: string | null
          origem_detalhe?: string | null
          parameters_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          campo?: string
          conflito?: Json
          created_at?: string
          created_by?: string | null
          grupo?: string
          id?: string
          justificativa?: string | null
          label?: string
          obrigatorio?: boolean
          ordem?: number
          organization_id?: string
          origem?: string | null
          origem_detalhe?: string | null
          parameters_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_parameter_values_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_parameter_values_parameters_id_fkey"
            columns: ["parameters_id"]
            isOneToOne: false
            referencedRelation: "contract_case_parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_parties: {
        Row: {
          active: boolean
          address: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          client_id: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          display_order: number
          document_number: string | null
          document_type: string | null
          email: string | null
          id: string
          legal_capacity_status: string
          organization_id: string
          person_name: string
          phone: string | null
          preferred_name: string | null
          relationship_to_case: string | null
          represented_by_party_id: string | null
          role: string
          signature_required: boolean
          signature_status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          legal_capacity_status?: string
          organization_id: string
          person_name: string
          phone?: string | null
          preferred_name?: string | null
          relationship_to_case?: string | null
          represented_by_party_id?: string | null
          role: string
          signature_required?: boolean
          signature_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          legal_capacity_status?: string
          organization_id?: string
          person_name?: string
          phone?: string | null
          preferred_name?: string | null
          relationship_to_case?: string | null
          represented_by_party_id?: string | null
          role?: string
          signature_required?: boolean
          signature_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_parties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_parties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_parties_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_parties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_parties_represented_by_party_id_fkey"
            columns: ["represented_by_party_id"]
            isOneToOne: false
            referencedRelation: "contract_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_review_events: {
        Row: {
          actor_user_id: string | null
          contract_id: string
          contract_version_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          organization_id: string
        }
        Insert: {
          actor_user_id?: string | null
          contract_id: string
          contract_version_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          organization_id: string
        }
        Update: {
          actor_user_id?: string | null
          contract_id?: string
          contract_version_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_review_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_review_events_contract_version_id_fkey"
            columns: ["contract_version_id"]
            isOneToOne: false
            referencedRelation: "contract_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_review_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_scope_items: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          category: string
          commercial_condition_id: string | null
          conteudo_hash: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          organization_id: string
          previous_version_id: string | null
          proposal_id: string | null
          requires_human_validation: boolean
          scope_version: number
          service_order_id: string | null
          source_annex_id: string | null
          source_reference: string | null
          source_type: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category: string
          commercial_condition_id?: string | null
          conteudo_hash?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          organization_id: string
          previous_version_id?: string | null
          proposal_id?: string | null
          requires_human_validation?: boolean
          scope_version?: number
          service_order_id?: string | null
          source_annex_id?: string | null
          source_reference?: string | null
          source_type?: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category?: string
          commercial_condition_id?: string | null
          conteudo_hash?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          organization_id?: string
          previous_version_id?: string | null
          proposal_id?: string | null
          requires_human_validation?: boolean
          scope_version?: number
          service_order_id?: string | null
          source_annex_id?: string | null
          source_reference?: string | null
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_scope_items_commercial_condition_id_fkey"
            columns: ["commercial_condition_id"]
            isOneToOne: false
            referencedRelation: "commercial_conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_scope_items_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_scope_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_scope_items_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "contract_scope_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_scope_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_scope_items_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_scope_items_source_annex_id_fkey"
            columns: ["source_annex_id"]
            isOneToOne: false
            referencedRelation: "contract_annexes"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_source_links: {
        Row: {
          access_level: string
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          organization_id: string
          source_id: string | null
          source_reference: string
          source_type: string
          updated_at: string
          updated_by: string | null
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          access_level?: string
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          source_id?: string | null
          source_reference: string
          source_type: string
          updated_at?: string
          updated_by?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          access_level?: string
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          source_id?: string | null
          source_reference?: string
          source_type?: string
          updated_at?: string
          updated_by?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_source_links_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_source_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          body_schema: Json
          code: string
          created_at: string
          created_by: string | null
          default_clauses: Json
          demo: boolean
          description: string | null
          effective_from: string | null
          effective_until: string | null
          id: string
          instrument_type: string
          legal_owner_user_id: string | null
          name: string
          notes_internal: string | null
          organization_id: string
          permitted_case_contexts: Json
          required_fields: Json
          requires_human_review: boolean
          status: string
          template_version: number
          updated_at: string
          updated_by: string | null
          uso_permitido: string
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          body_schema?: Json
          code: string
          created_at?: string
          created_by?: string | null
          default_clauses?: Json
          demo?: boolean
          description?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          instrument_type: string
          legal_owner_user_id?: string | null
          name: string
          notes_internal?: string | null
          organization_id: string
          permitted_case_contexts?: Json
          required_fields?: Json
          requires_human_review?: boolean
          status?: string
          template_version?: number
          updated_at?: string
          updated_by?: string | null
          uso_permitido?: string
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          body_schema?: Json
          code?: string
          created_at?: string
          created_by?: string | null
          default_clauses?: Json
          demo?: boolean
          description?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          instrument_type?: string
          legal_owner_user_id?: string | null
          name?: string
          notes_internal?: string | null
          organization_id?: string
          permitted_case_contexts?: Json
          required_fields?: Json
          requires_human_review?: boolean
          status?: string
          template_version?: number
          updated_at?: string
          updated_by?: string | null
          uso_permitido?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_validation_results: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          contract_id: string
          contract_version_id: string | null
          created_at: string
          created_by: string | null
          details: string | null
          id: string
          label: string
          organization_id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source_field: string | null
          status: string
          updated_at: string
          updated_by: string | null
          validation_key: string
          waived_by: string | null
          waiver_reason: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          contract_id: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          label: string
          organization_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          source_field?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          validation_key: string
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          contract_id?: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          label?: string
          organization_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_field?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          validation_key?: string
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_validation_results_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_validation_results_contract_version_id_fkey"
            columns: ["contract_version_id"]
            isOneToOne: false
            referencedRelation: "contract_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_validation_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          change_summary: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          created_from_version_id: string | null
          frozen_at: string | null
          frozen_by: string | null
          generated_content: Json
          id: string
          institutional_profile_id: string | null
          institutional_profile_snapshot: Json | null
          organization_id: string
          render_error: string | null
          rendered_file_hash: string | null
          rendered_file_path: string | null
          review_decision: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_template_id: string | null
          status: string
          superseded_at: string | null
          superseded_by_version_id: string | null
          updated_at: string
          updated_by: string | null
          version_number: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          change_summary?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          created_from_version_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          generated_content?: Json
          id?: string
          institutional_profile_id?: string | null
          institutional_profile_snapshot?: Json | null
          organization_id: string
          render_error?: string | null
          rendered_file_hash?: string | null
          rendered_file_path?: string | null
          review_decision?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_template_id?: string | null
          status?: string
          superseded_at?: string | null
          superseded_by_version_id?: string | null
          updated_at?: string
          updated_by?: string | null
          version_number: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          change_summary?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          created_from_version_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          generated_content?: Json
          id?: string
          institutional_profile_id?: string | null
          institutional_profile_snapshot?: Json | null
          organization_id?: string
          render_error?: string | null
          rendered_file_hash?: string | null
          rendered_file_path?: string | null
          review_decision?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_template_id?: string | null
          status?: string
          superseded_at?: string | null
          superseded_by_version_id?: string | null
          updated_at?: string
          updated_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_versions_created_from_version_id_fkey"
            columns: ["created_from_version_id"]
            isOneToOne: false
            referencedRelation: "contract_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_versions_institutional_profile_id_fkey"
            columns: ["institutional_profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_versions_source_template_id_fkey"
            columns: ["source_template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_versions_superseded_by_version_id_fkey"
            columns: ["superseded_by_version_id"]
            isOneToOne: false
            referencedRelation: "contract_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          approved_for_send_at: string | null
          approved_for_send_by: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          base_contract_reference: string | null
          cancellation_reason: string | null
          case_id: string | null
          client_id: string | null
          contract_number: string
          contract_type: string
          created_at: string
          created_by: string | null
          current_version_id: string | null
          demo: boolean
          effective_end_date: string | null
          effective_rule: string | null
          effective_start_date: string | null
          exclusions_summary: string | null
          external_expense_status: string
          external_signature_approved_at: string | null
          external_signature_approved_by: string | null
          external_signature_justification: string | null
          financial_change_status: string
          financial_gate_status: string
          id: string
          internal_notes: string | null
          invoice_reference: string | null
          no_exclusions_confirmed: boolean
          organization_id: string
          parent_contract_id: string | null
          payment_reference: string | null
          privacy_terms_status: string
          proposal_id: string | null
          provider_envelope_id: string | null
          purpose_summary: string | null
          relationship_type: string
          research_gate_status: string
          review_owner_user_id: string | null
          scope_summary: string | null
          signature_provider: string
          signature_reference: string | null
          signed_at: string | null
          signed_source: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approved_for_send_at?: string | null
          approved_for_send_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          base_contract_reference?: string | null
          cancellation_reason?: string | null
          case_id?: string | null
          client_id?: string | null
          contract_number: string
          contract_type: string
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          demo?: boolean
          effective_end_date?: string | null
          effective_rule?: string | null
          effective_start_date?: string | null
          exclusions_summary?: string | null
          external_expense_status?: string
          external_signature_approved_at?: string | null
          external_signature_approved_by?: string | null
          external_signature_justification?: string | null
          financial_change_status?: string
          financial_gate_status?: string
          id?: string
          internal_notes?: string | null
          invoice_reference?: string | null
          no_exclusions_confirmed?: boolean
          organization_id: string
          parent_contract_id?: string | null
          payment_reference?: string | null
          privacy_terms_status?: string
          proposal_id?: string | null
          provider_envelope_id?: string | null
          purpose_summary?: string | null
          relationship_type?: string
          research_gate_status?: string
          review_owner_user_id?: string | null
          scope_summary?: string | null
          signature_provider?: string
          signature_reference?: string | null
          signed_at?: string | null
          signed_source?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approved_for_send_at?: string | null
          approved_for_send_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          base_contract_reference?: string | null
          cancellation_reason?: string | null
          case_id?: string | null
          client_id?: string | null
          contract_number?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          demo?: boolean
          effective_end_date?: string | null
          effective_rule?: string | null
          effective_start_date?: string | null
          exclusions_summary?: string | null
          external_expense_status?: string
          external_signature_approved_at?: string | null
          external_signature_approved_by?: string | null
          external_signature_justification?: string | null
          financial_change_status?: string
          financial_gate_status?: string
          id?: string
          internal_notes?: string | null
          invoice_reference?: string | null
          no_exclusions_confirmed?: boolean
          organization_id?: string
          parent_contract_id?: string | null
          payment_reference?: string | null
          privacy_terms_status?: string
          proposal_id?: string | null
          provider_envelope_id?: string | null
          purpose_summary?: string | null
          relationship_type?: string
          research_gate_status?: string
          review_owner_user_id?: string | null
          scope_summary?: string | null
          signature_provider?: string
          signature_reference?: string | null
          signed_at?: string | null
          signed_source?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_current_version_fk"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "contract_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_parent_contract_id_fkey"
            columns: ["parent_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      controlled_taxonomies: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          ativo: boolean
          codigo: string
          created_at: string
          created_by: string | null
          descricao: string | null
          dominio: string
          id: string
          nome: string
          organization_id: string
          responsavel: string | null
          updated_at: string
          updated_by: string | null
          versao: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativo?: boolean
          codigo: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          dominio: string
          id?: string
          nome: string
          organization_id: string
          responsavel?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativo?: boolean
          codigo?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          dominio?: string
          id?: string
          nome?: string
          organization_id?: string
          responsavel?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: string
        }
        Relationships: []
      }
      conversion_events: {
        Row: {
          campaign_id: string | null
          canal: string | null
          case_id: string | null
          cliente_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          event_type: string
          evidencia_referencia: string | null
          id: string
          is_demo: boolean
          lead_id: string | null
          lead_source_id: string | null
          observacao: string | null
          occurred_at: string
          opportunity_id: string | null
          organization_id: string
          origem: string | null
          recorded_at: string
          recorded_by: string | null
          responsavel: string | null
          responsavel_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          canal?: string | null
          case_id?: string | null
          cliente_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          event_type: string
          evidencia_referencia?: string | null
          id?: string
          is_demo?: boolean
          lead_id?: string | null
          lead_source_id?: string | null
          observacao?: string | null
          occurred_at?: string
          opportunity_id?: string | null
          organization_id: string
          origem?: string | null
          recorded_at?: string
          recorded_by?: string | null
          responsavel?: string | null
          responsavel_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          canal?: string | null
          case_id?: string | null
          cliente_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          event_type?: string
          evidencia_referencia?: string | null
          id?: string
          is_demo?: boolean
          lead_id?: string | null
          lead_source_id?: string | null
          observacao?: string | null
          occurred_at?: string
          opportunity_id?: string | null
          organization_id?: string
          origem?: string | null
          recorded_at?: string
          recorded_by?: string | null
          responsavel?: string | null
          responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversion_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_lead_source_id_fkey"
            columns: ["lead_source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      correspondence_records: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "correspondence_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_records_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_casos: {
        Row: {
          aceite_comercial_em: string | null
          aceite_comercial_registrado_por: string | null
          aguardando_instituicao_externa: boolean
          alert_status: string
          alert_triggered_at: string | null
          alias_historico: string | null
          app_access_status: string
          app_visibility_level: string
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          ativacao_operacional: string | null
          ativado_em: string | null
          ativado_por: string | null
          ativo: boolean
          brief_interno: string | null
          cargo_responsavel_principal: string
          case_service_id: string | null
          citizenship_track_id: string | null
          cliente_id: string | null
          codigo: string
          codigos_legados: string[]
          colaboradores_do_caso: string[]
          communication_queue_id: string | null
          communication_status: string
          condicao_comercial_interna_pendente: boolean
          condicoes_verificadas_em: string | null
          condicoes_verificadas_por: string | null
          confianca_triagem: string | null
          consentimento_compartilhamento: boolean
          contrato_assinado: boolean
          created_at: string
          created_by: string | null
          dados_teste: boolean
          data_ativacao: string | null
          data_confirmacao_formal_proposta: string | null
          data_entrada: string
          data_entrada_caso: string | null
          data_origin: string
          data_prevista_contrato: string | null
          data_prevista_onboarding: string | null
          data_prevista_pagamento: string | null
          data_proposta: string | null
          demo: boolean
          documentos_minimos_ok: boolean
          dossie_mae_referencia: string | null
          eixo_comercial: string
          eixo_formalizacao: string
          eixo_operacao: string
          escopo_excluido_resumido: string | null
          escopo_incluido_resumido: string | null
          estado_de_autorizacao_pesquisa: string
          fase: string | null
          finalidade_registro: string | null
          hipotese_elegibilidade: string
          hipotese_trabalho_interna: string | null
          id: string
          id_canonico_decidido: string | null
          id_canonico_decidido_em: string | null
          id_canonico_decidido_por: string | null
          ids_historicos: Json
          info_cliente_liberada: boolean
          lead_id: string | null
          link_origem_interna: string | null
          marcos_gerais_da_proposta: string | null
          modelo: string
          motivo_espera_externa: string | null
          onboarding_iniciado_em: string | null
          onboarding_iniciado_por: string | null
          organization_id: string
          origem_brief: string | null
          pagamento_confirmado: boolean
          pais: string | null
          pais_linha_prioritaria: string | null
          papel_registro: string
          piloto: boolean
          prazo_proxima_acao: string | null
          preparacao_status: string | null
          prioridade: string
          proposta_id_origem: string | null
          proposta_referencia_interna: string | null
          proposta_url_interna: string | null
          proxima_acao: string | null
          proxima_acao_codigo: string | null
          proxima_acao_criterio_conclusao: string | null
          proxima_acao_dependencia: string | null
          proxima_acao_justificativa: string | null
          proxima_acao_responsavel: string | null
          proxima_atualizacao_limite_em: string | null
          proximo_marco_verificavel: string | null
          radar_aderencia_percentual: number | null
          requires_human_approval: boolean
          responsavel_id: string | null
          responsavel_principal: string
          resumo: string | null
          resumo_interno: string | null
          revisao_humana_juridica: string
          risco: string | null
          risco_observacao_interna: string | null
          riscos_identificados: string[]
          selo_interno: string | null
          sinal_aderencia_preliminar: string | null
          situacao_financeira: string
          situacao_operacional: string
          status: string
          status_caso_derivado: string | null
          status_radar: string
          status_via: string | null
          suggested_channel: string
          supervisora_do_caso: string
          suspenso_em: string | null
          suspenso_motivo: string | null
          suspenso_por: string | null
          target_audience: string
          tipo_servico: string | null
          titulo: string
          ultima_atualizacao_material_em: string | null
          ultimo_touchpoint_em: string | null
          updated_at: string
          updated_by: string | null
          via: string
          via_juridica_preliminar: string | null
          visibility: string
        }
        Insert: {
          aceite_comercial_em?: string | null
          aceite_comercial_registrado_por?: string | null
          aguardando_instituicao_externa?: boolean
          alert_status?: string
          alert_triggered_at?: string | null
          alias_historico?: string | null
          app_access_status?: string
          app_visibility_level?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativacao_operacional?: string | null
          ativado_em?: string | null
          ativado_por?: string | null
          ativo?: boolean
          brief_interno?: string | null
          cargo_responsavel_principal?: string
          case_service_id?: string | null
          citizenship_track_id?: string | null
          cliente_id?: string | null
          codigo: string
          codigos_legados?: string[]
          colaboradores_do_caso?: string[]
          communication_queue_id?: string | null
          communication_status?: string
          condicao_comercial_interna_pendente?: boolean
          condicoes_verificadas_em?: string | null
          condicoes_verificadas_por?: string | null
          confianca_triagem?: string | null
          consentimento_compartilhamento?: boolean
          contrato_assinado?: boolean
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          data_ativacao?: string | null
          data_confirmacao_formal_proposta?: string | null
          data_entrada?: string
          data_entrada_caso?: string | null
          data_origin?: string
          data_prevista_contrato?: string | null
          data_prevista_onboarding?: string | null
          data_prevista_pagamento?: string | null
          data_proposta?: string | null
          demo?: boolean
          documentos_minimos_ok?: boolean
          dossie_mae_referencia?: string | null
          eixo_comercial?: string
          eixo_formalizacao?: string
          eixo_operacao?: string
          escopo_excluido_resumido?: string | null
          escopo_incluido_resumido?: string | null
          estado_de_autorizacao_pesquisa?: string
          fase?: string | null
          finalidade_registro?: string | null
          hipotese_elegibilidade?: string
          hipotese_trabalho_interna?: string | null
          id?: string
          id_canonico_decidido?: string | null
          id_canonico_decidido_em?: string | null
          id_canonico_decidido_por?: string | null
          ids_historicos?: Json
          info_cliente_liberada?: boolean
          lead_id?: string | null
          link_origem_interna?: string | null
          marcos_gerais_da_proposta?: string | null
          modelo?: string
          motivo_espera_externa?: string | null
          onboarding_iniciado_em?: string | null
          onboarding_iniciado_por?: string | null
          organization_id: string
          origem_brief?: string | null
          pagamento_confirmado?: boolean
          pais?: string | null
          pais_linha_prioritaria?: string | null
          papel_registro?: string
          piloto?: boolean
          prazo_proxima_acao?: string | null
          preparacao_status?: string | null
          prioridade?: string
          proposta_id_origem?: string | null
          proposta_referencia_interna?: string | null
          proposta_url_interna?: string | null
          proxima_acao?: string | null
          proxima_acao_codigo?: string | null
          proxima_acao_criterio_conclusao?: string | null
          proxima_acao_dependencia?: string | null
          proxima_acao_justificativa?: string | null
          proxima_acao_responsavel?: string | null
          proxima_atualizacao_limite_em?: string | null
          proximo_marco_verificavel?: string | null
          radar_aderencia_percentual?: number | null
          requires_human_approval?: boolean
          responsavel_id?: string | null
          responsavel_principal?: string
          resumo?: string | null
          resumo_interno?: string | null
          revisao_humana_juridica?: string
          risco?: string | null
          risco_observacao_interna?: string | null
          riscos_identificados?: string[]
          selo_interno?: string | null
          sinal_aderencia_preliminar?: string | null
          situacao_financeira?: string
          situacao_operacional?: string
          status?: string
          status_caso_derivado?: string | null
          status_radar?: string
          status_via?: string | null
          suggested_channel?: string
          supervisora_do_caso?: string
          suspenso_em?: string | null
          suspenso_motivo?: string | null
          suspenso_por?: string | null
          target_audience?: string
          tipo_servico?: string | null
          titulo: string
          ultima_atualizacao_material_em?: string | null
          ultimo_touchpoint_em?: string | null
          updated_at?: string
          updated_by?: string | null
          via?: string
          via_juridica_preliminar?: string | null
          visibility?: string
        }
        Update: {
          aceite_comercial_em?: string | null
          aceite_comercial_registrado_por?: string | null
          aguardando_instituicao_externa?: boolean
          alert_status?: string
          alert_triggered_at?: string | null
          alias_historico?: string | null
          app_access_status?: string
          app_visibility_level?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativacao_operacional?: string | null
          ativado_em?: string | null
          ativado_por?: string | null
          ativo?: boolean
          brief_interno?: string | null
          cargo_responsavel_principal?: string
          case_service_id?: string | null
          citizenship_track_id?: string | null
          cliente_id?: string | null
          codigo?: string
          codigos_legados?: string[]
          colaboradores_do_caso?: string[]
          communication_queue_id?: string | null
          communication_status?: string
          condicao_comercial_interna_pendente?: boolean
          condicoes_verificadas_em?: string | null
          condicoes_verificadas_por?: string | null
          confianca_triagem?: string | null
          consentimento_compartilhamento?: boolean
          contrato_assinado?: boolean
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          data_ativacao?: string | null
          data_confirmacao_formal_proposta?: string | null
          data_entrada?: string
          data_entrada_caso?: string | null
          data_origin?: string
          data_prevista_contrato?: string | null
          data_prevista_onboarding?: string | null
          data_prevista_pagamento?: string | null
          data_proposta?: string | null
          demo?: boolean
          documentos_minimos_ok?: boolean
          dossie_mae_referencia?: string | null
          eixo_comercial?: string
          eixo_formalizacao?: string
          eixo_operacao?: string
          escopo_excluido_resumido?: string | null
          escopo_incluido_resumido?: string | null
          estado_de_autorizacao_pesquisa?: string
          fase?: string | null
          finalidade_registro?: string | null
          hipotese_elegibilidade?: string
          hipotese_trabalho_interna?: string | null
          id?: string
          id_canonico_decidido?: string | null
          id_canonico_decidido_em?: string | null
          id_canonico_decidido_por?: string | null
          ids_historicos?: Json
          info_cliente_liberada?: boolean
          lead_id?: string | null
          link_origem_interna?: string | null
          marcos_gerais_da_proposta?: string | null
          modelo?: string
          motivo_espera_externa?: string | null
          onboarding_iniciado_em?: string | null
          onboarding_iniciado_por?: string | null
          organization_id?: string
          origem_brief?: string | null
          pagamento_confirmado?: boolean
          pais?: string | null
          pais_linha_prioritaria?: string | null
          papel_registro?: string
          piloto?: boolean
          prazo_proxima_acao?: string | null
          preparacao_status?: string | null
          prioridade?: string
          proposta_id_origem?: string | null
          proposta_referencia_interna?: string | null
          proposta_url_interna?: string | null
          proxima_acao?: string | null
          proxima_acao_codigo?: string | null
          proxima_acao_criterio_conclusao?: string | null
          proxima_acao_dependencia?: string | null
          proxima_acao_justificativa?: string | null
          proxima_acao_responsavel?: string | null
          proxima_atualizacao_limite_em?: string | null
          proximo_marco_verificavel?: string | null
          radar_aderencia_percentual?: number | null
          requires_human_approval?: boolean
          responsavel_id?: string | null
          responsavel_principal?: string
          resumo?: string | null
          resumo_interno?: string | null
          revisao_humana_juridica?: string
          risco?: string | null
          risco_observacao_interna?: string | null
          riscos_identificados?: string[]
          selo_interno?: string | null
          sinal_aderencia_preliminar?: string | null
          situacao_financeira?: string
          situacao_operacional?: string
          status?: string
          status_caso_derivado?: string | null
          status_radar?: string
          status_via?: string | null
          suggested_channel?: string
          supervisora_do_caso?: string
          suspenso_em?: string | null
          suspenso_motivo?: string | null
          suspenso_por?: string | null
          target_audience?: string
          tipo_servico?: string | null
          titulo?: string
          ultima_atualizacao_material_em?: string | null
          ultimo_touchpoint_em?: string | null
          updated_at?: string
          updated_by?: string | null
          via?: string
          via_juridica_preliminar?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_casos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_casos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_casos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_casos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          canal: string
          case_id: string
          client_id: string | null
          consentimento_gravacao: boolean | null
          contact_id: string | null
          corrige_interacao_id: string | null
          created_at: string
          data_origin: string
          direcao: string
          id: string
          ocorrido_em: string
          opportunity_id: string | null
          organization_id: string
          origem: string
          origem_id: string | null
          origem_referencia_interna: string | null
          prazo_proxima_acao: string | null
          proxima_acao: string | null
          registrado_por: string | null
          resultado: string | null
          resumo_interno: string
          tipo: string
          visibilidade: string
        }
        Insert: {
          canal?: string
          case_id: string
          client_id?: string | null
          consentimento_gravacao?: boolean | null
          contact_id?: string | null
          corrige_interacao_id?: string | null
          created_at?: string
          data_origin?: string
          direcao?: string
          id?: string
          ocorrido_em?: string
          opportunity_id?: string | null
          organization_id: string
          origem?: string
          origem_id?: string | null
          origem_referencia_interna?: string | null
          prazo_proxima_acao?: string | null
          proxima_acao?: string | null
          registrado_por?: string | null
          resultado?: string | null
          resumo_interno: string
          tipo?: string
          visibilidade?: string
        }
        Update: {
          canal?: string
          case_id?: string
          client_id?: string | null
          consentimento_gravacao?: boolean | null
          contact_id?: string | null
          corrige_interacao_id?: string | null
          created_at?: string
          data_origin?: string
          direcao?: string
          id?: string
          ocorrido_em?: string
          opportunity_id?: string | null
          organization_id?: string
          origem?: string
          origem_id?: string | null
          origem_referencia_interna?: string | null
          prazo_proxima_acao?: string | null
          proxima_acao?: string | null
          registrado_por?: string | null
          resultado?: string | null
          resumo_interno?: string
          tipo?: string
          visibilidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_corrige_interacao_id_fkey"
            columns: ["corrige_interacao_id"]
            isOneToOne: false
            referencedRelation: "crm_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cultural_records: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cultural_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_records_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          alternativas: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          change_resumo: string | null
          contexto: string | null
          created_at: string
          created_by: string | null
          data_decisao: string | null
          decisao: string | null
          dominio: string
          evidencias: Json
          id: string
          impacto: string | null
          nivel_acesso: string
          organization_id: string
          responsavel_nome: string | null
          responsavel_user_id: string | null
          status: string
          substitui_ids: string[]
          substituida_por: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
          versao: number
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          alternativas?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          change_resumo?: string | null
          contexto?: string | null
          created_at?: string
          created_by?: string | null
          data_decisao?: string | null
          decisao?: string | null
          dominio?: string
          evidencias?: Json
          id?: string
          impacto?: string | null
          nivel_acesso?: string
          organization_id: string
          responsavel_nome?: string | null
          responsavel_user_id?: string | null
          status?: string
          substitui_ids?: string[]
          substituida_por?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
          versao?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          alternativas?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          change_resumo?: string | null
          contexto?: string | null
          created_at?: string
          created_by?: string | null
          data_decisao?: string | null
          decisao?: string | null
          dominio?: string
          evidencias?: Json
          id?: string
          impacto?: string | null
          nivel_acesso?: string
          organization_id?: string
          responsavel_nome?: string | null
          responsavel_user_id?: string | null
          status?: string
          substitui_ids?: string[]
          substituida_por?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          versao?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_substituida_por_fkey"
            columns: ["substituida_por"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_assessments: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          ascendente_ou_geracao_informada: string | null
          complexidade_percebida: string | null
          confianca_triagem: string | null
          created_at: string
          created_by: string | null
          estado_documental_inicial: string | null
          estrutura_familiar: string | null
          id: string
          interaction_id: string | null
          linha_transmissao: string | null
          notas_internas: string | null
          objetivo_principal: string
          opportunity_id: string
          organization_id: string
          pais_linha_prioritaria: string | null
          riscos_internos: string | null
          sinal_aderencia_preliminar: string | null
          via_preliminar: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ascendente_ou_geracao_informada?: string | null
          complexidade_percebida?: string | null
          confianca_triagem?: string | null
          created_at?: string
          created_by?: string | null
          estado_documental_inicial?: string | null
          estrutura_familiar?: string | null
          id?: string
          interaction_id?: string | null
          linha_transmissao?: string | null
          notas_internas?: string | null
          objetivo_principal: string
          opportunity_id: string
          organization_id: string
          pais_linha_prioritaria?: string | null
          riscos_internos?: string | null
          sinal_aderencia_preliminar?: string | null
          via_preliminar?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ascendente_ou_geracao_informada?: string | null
          complexidade_percebida?: string | null
          confianca_triagem?: string | null
          created_at?: string
          created_by?: string | null
          estado_documental_inicial?: string | null
          estrutura_familiar?: string | null
          id?: string
          interaction_id?: string | null
          linha_transmissao?: string | null
          notas_internas?: string | null
          objetivo_principal?: string
          opportunity_id?: string
          organization_id?: string
          pais_linha_prioritaria?: string | null
          riscos_internos?: string | null
          sinal_aderencia_preliminar?: string | null
          via_preliminar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discovery_assessments_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "crm_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_assessments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_requests: {
        Row: {
          access_level: string
          archived_at: string | null
          archived_reason: string | null
          case_id: string
          client_approval_status: string
          created_at: string
          created_by: string | null
          data_origin: string
          document_type: string
          estimated_external_cost: number | null
          evidence_id: string | null
          family_id: string | null
          full_name_text: string | null
          generation: number | null
          id: string
          institution_or_archive: string | null
          internal_link: string | null
          next_action: string | null
          next_action_due: string | null
          observation_internal: string | null
          organization_id: string
          priority: string
          received_at: string | null
          request_type: string
          requested_at: string | null
          research_person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access_level?: string
          archived_at?: string | null
          archived_reason?: string | null
          case_id: string
          client_approval_status?: string
          created_at?: string
          created_by?: string | null
          data_origin?: string
          document_type: string
          estimated_external_cost?: number | null
          evidence_id?: string | null
          family_id?: string | null
          full_name_text?: string | null
          generation?: number | null
          id?: string
          institution_or_archive?: string | null
          internal_link?: string | null
          next_action?: string | null
          next_action_due?: string | null
          observation_internal?: string | null
          organization_id: string
          priority?: string
          received_at?: string | null
          request_type?: string
          requested_at?: string | null
          research_person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access_level?: string
          archived_at?: string | null
          archived_reason?: string | null
          case_id?: string
          client_approval_status?: string
          created_at?: string
          created_by?: string | null
          data_origin?: string
          document_type?: string
          estimated_external_cost?: number | null
          evidence_id?: string | null
          family_id?: string | null
          full_name_text?: string | null
          generation?: number | null
          id?: string
          institution_or_archive?: string | null
          internal_link?: string | null
          next_action?: string | null
          next_action_due?: string | null
          observation_internal?: string | null
          organization_id?: string
          priority?: string
          received_at?: string | null
          request_type?: string
          requested_at?: string | null
          research_person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidences"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          carregado_em: string | null
          carregado_por: string | null
          case_id: string | null
          categoria: string
          client_id: string | null
          created_at: string
          created_by: string | null
          entrega_classificacao: string | null
          entrega_cliente: boolean
          entrega_responsavel_id: string | null
          entrega_versao: string | null
          file_hash: string | null
          finalidade: string | null
          id: string
          liberado_cliente: boolean
          liberado_em: string | null
          liberado_por: string | null
          mime_type: string | null
          nome_arquivo: string | null
          observacoes: string | null
          organization_id: string
          origem: string
          recolhido_em: string | null
          recolhido_por: string | null
          recolhimento_motivo: string | null
          revisado_em: string | null
          revisado_por: string | null
          revisao_motivo: string | null
          sensibilidade: string
          solicitacao_id: string | null
          status: string
          storage_path: string | null
          tamanho_bytes: number | null
          tipo: string
          titulo: string
          updated_at: string
          updated_by: string | null
          versao: number
          versao_substituta: string | null
          visibilidade: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          carregado_em?: string | null
          carregado_por?: string | null
          case_id?: string | null
          categoria?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          entrega_classificacao?: string | null
          entrega_cliente?: boolean
          entrega_responsavel_id?: string | null
          entrega_versao?: string | null
          file_hash?: string | null
          finalidade?: string | null
          id?: string
          liberado_cliente?: boolean
          liberado_em?: string | null
          liberado_por?: string | null
          mime_type?: string | null
          nome_arquivo?: string | null
          observacoes?: string | null
          organization_id: string
          origem?: string
          recolhido_em?: string | null
          recolhido_por?: string | null
          recolhimento_motivo?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          revisao_motivo?: string | null
          sensibilidade?: string
          solicitacao_id?: string | null
          status?: string
          storage_path?: string | null
          tamanho_bytes?: number | null
          tipo?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          versao?: number
          versao_substituta?: string | null
          visibilidade?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          carregado_em?: string | null
          carregado_por?: string | null
          case_id?: string | null
          categoria?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          entrega_classificacao?: string | null
          entrega_cliente?: boolean
          entrega_responsavel_id?: string | null
          entrega_versao?: string | null
          file_hash?: string | null
          finalidade?: string | null
          id?: string
          liberado_cliente?: boolean
          liberado_em?: string | null
          liberado_por?: string | null
          mime_type?: string | null
          nome_arquivo?: string | null
          observacoes?: string | null
          organization_id?: string
          origem?: string
          recolhido_em?: string | null
          recolhido_por?: string | null
          recolhimento_motivo?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          revisao_motivo?: string | null
          sensibilidade?: string
          solicitacao_id?: string | null
          status?: string
          storage_path?: string | null
          tamanho_bytes?: number | null
          tipo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          versao?: number
          versao_substituta?: string | null
          visibilidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_provisioning_queue: {
        Row: {
          approval_required: boolean
          approved_at: string | null
          approved_by: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          created_at: string
          created_by: string | null
          error_message: string | null
          external_result_reference: string | null
          family_id: string | null
          id: string
          observacao_interna: string | null
          organization_id: string
          requested_structure: Json
          required_gates: Json
          stage_trigger: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approval_required?: boolean
          approved_at?: string | null
          approved_by?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_result_reference?: string | null
          family_id?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id: string
          requested_structure?: Json
          required_gates?: Json
          stage_trigger: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approval_required?: boolean
          approved_at?: string | null
          approved_by?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_result_reference?: string | null
          family_id?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id?: string
          requested_structure?: Json
          required_gates?: Json
          stage_trigger?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drive_provisioning_queue_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_provisioning_queue_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_provisioning_queue_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_provisioning_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_content_items: {
        Row: {
          approval_at: string | null
          approval_by: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          content_body: string | null
          content_type: string
          country_or_service: string | null
          created_at: string
          created_by: string | null
          funnel_stage: string | null
          id: string
          is_demo: boolean
          organization_id: string
          owner_id: string | null
          planned_for: string | null
          published_at: string | null
          review_notes: string | null
          source_references: Json
          status: string
          target_audience: string | null
          theme: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approval_at?: string | null
          approval_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          content_body?: string | null
          content_type: string
          country_or_service?: string | null
          created_at?: string
          created_by?: string | null
          funnel_stage?: string | null
          id?: string
          is_demo?: boolean
          organization_id: string
          owner_id?: string | null
          planned_for?: string | null
          published_at?: string | null
          review_notes?: string | null
          source_references?: Json
          status?: string
          target_audience?: string | null
          theme?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approval_at?: string | null
          approval_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          content_body?: string | null
          content_type?: string
          country_or_service?: string | null
          created_at?: string
          created_by?: string | null
          funnel_stage?: string | null
          id?: string
          is_demo?: boolean
          organization_id?: string
          owner_id?: string | null
          planned_for?: string | null
          published_at?: string | null
          review_notes?: string | null
          source_references?: Json
          status?: string
          target_audience?: string | null
          theme?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_content_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_content_links: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          editorial_content_item_id: string
          id: string
          link_type: string
          linked_entity_id: string | null
          linked_entity_type: string
          organization_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          editorial_content_item_id: string
          id?: string
          link_type: string
          linked_entity_id?: string | null
          linked_entity_type: string
          organization_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          editorial_content_item_id?: string
          id?: string
          link_type?: string
          linked_entity_id?: string | null
          linked_entity_type?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_content_links_editorial_content_item_id_fkey"
            columns: ["editorial_content_item_id"]
            isOneToOne: false
            referencedRelation: "editorial_content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_content_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      education_records: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_records_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_labels: {
        Row: {
          applied_at: string
          applied_by: string | null
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          id: string
          label_id: string
          organization_id: string
          removed_at: string | null
          removed_by: string | null
          source: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          label_id: string
          organization_id: string
          removed_at?: string | null
          removed_by?: string | null
          source?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          label_id?: string
          organization_id?: string
          removed_at?: string | null
          removed_by?: string | null
          source?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "label_taxonomy"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_financeiros: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          caso_id: string | null
          created_at: string
          created_by: string | null
          dados_teste: boolean
          demo: boolean
          descricao: string
          id: string
          liberada_cliente: boolean
          moeda: string
          organization_id: string
          status: string
          tipo: string
          updated_at: string
          valor: number
          vencimento: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          demo?: boolean
          descricao: string
          id?: string
          liberada_cliente?: boolean
          moeda?: string
          organization_id: string
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
          vencimento?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          demo?: boolean
          descricao?: string
          id?: string
          liberada_cliente?: boolean
          moeda?: string
          organization_id?: string
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_financeiros_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_financeiros_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_financeiros_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_validations: {
        Row: {
          confianca_anterior: string | null
          confianca_nova: string
          created_at: string
          estado_anterior: string | null
          estado_novo: string
          evidence_id: string
          id: string
          justificativa: string
          organization_id: string
          revisado_em: string
          revisado_por: string
        }
        Insert: {
          confianca_anterior?: string | null
          confianca_nova: string
          created_at?: string
          estado_anterior?: string | null
          estado_novo: string
          evidence_id: string
          id?: string
          justificativa: string
          organization_id: string
          revisado_em?: string
          revisado_por: string
        }
        Update: {
          confianca_anterior?: string | null
          confianca_nova?: string
          created_at?: string
          estado_anterior?: string | null
          estado_novo?: string
          evidence_id?: string
          id?: string
          justificativa?: string
          organization_id?: string
          revisado_em?: string
          revisado_por?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_validations_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidences"
            referencedColumns: ["id"]
          },
        ]
      }
      evidences: {
        Row: {
          access_level: string
          archived_at: string | null
          archived_reason: string | null
          case_id: string
          confidence_level: string
          created_at: string
          created_by: string | null
          data_origin: string
          description_internal: string | null
          epistemic_validation_status: string
          evidence_nature: string
          evidence_type: string
          id: string
          legal_review_notes_internal: string | null
          legal_review_status: string
          negative_search_date: string | null
          negative_search_next_action: string | null
          negative_search_source: string | null
          organization_id: string
          reference_date: string | null
          reference_location: string | null
          research_item_id: string | null
          research_person_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_id: string | null
          storage_reference_internal: string | null
          title_internal: string
          updated_at: string
          updated_by: string | null
          validation_notes_internal: string | null
          workflow_status: string
        }
        Insert: {
          access_level?: string
          archived_at?: string | null
          archived_reason?: string | null
          case_id: string
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          data_origin?: string
          description_internal?: string | null
          epistemic_validation_status?: string
          evidence_nature: string
          evidence_type: string
          id?: string
          legal_review_notes_internal?: string | null
          legal_review_status?: string
          negative_search_date?: string | null
          negative_search_next_action?: string | null
          negative_search_source?: string | null
          organization_id: string
          reference_date?: string | null
          reference_location?: string | null
          research_item_id?: string | null
          research_person_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          storage_reference_internal?: string | null
          title_internal: string
          updated_at?: string
          updated_by?: string | null
          validation_notes_internal?: string | null
          workflow_status?: string
        }
        Update: {
          access_level?: string
          archived_at?: string | null
          archived_reason?: string | null
          case_id?: string
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          data_origin?: string
          description_internal?: string | null
          epistemic_validation_status?: string
          evidence_nature?: string
          evidence_type?: string
          id?: string
          legal_review_notes_internal?: string | null
          legal_review_status?: string
          negative_search_date?: string | null
          negative_search_next_action?: string | null
          negative_search_source?: string | null
          organization_id?: string
          reference_date?: string | null
          reference_location?: string | null
          research_item_id?: string | null
          research_person_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          storage_reference_internal?: string | null
          title_internal?: string
          updated_at?: string
          updated_by?: string | null
          validation_notes_internal?: string | null
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidences_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_research_person_id_fkey"
            columns: ["research_person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      evidencia_acessos: {
        Row: {
          acao: string
          created_at: string
          evidencia_id: string
          id: string
          metadados: Json | null
          organization_id: string
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          evidencia_id: string
          id?: string
          metadados?: Json | null
          organization_id: string
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          evidencia_id?: string
          id?: string
          metadados?: Json | null
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidencia_acessos_evidencia_id_fkey"
            columns: ["evidencia_id"]
            isOneToOne: false
            referencedRelation: "evidencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencia_acessos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evidencias: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          caso_id: string | null
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          demo: boolean
          descricao: string | null
          fonte: string | null
          grau_confianca: string | null
          hypothesis_id: string | null
          id: string
          justificativa: string | null
          liberada_cliente: boolean
          local_relacionado: string | null
          observacao: string | null
          organization_id: string
          origem: string
          periodo: string | null
          person_id: string | null
          pesquisador_id: string | null
          pessoa_relacionada: string | null
          relacao_hipotese: string | null
          revisado_em: string | null
          status: string
          storage_path: string | null
          tipo: string
          titulo: string
          updated_at: string
          updated_by: string | null
          url: string | null
          visibilidade: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id?: string | null
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          demo?: boolean
          descricao?: string | null
          fonte?: string | null
          grau_confianca?: string | null
          hypothesis_id?: string | null
          id?: string
          justificativa?: string | null
          liberada_cliente?: boolean
          local_relacionado?: string | null
          observacao?: string | null
          organization_id: string
          origem?: string
          periodo?: string | null
          person_id?: string | null
          pesquisador_id?: string | null
          pessoa_relacionada?: string | null
          relacao_hipotese?: string | null
          revisado_em?: string | null
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          visibilidade?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id?: string | null
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          demo?: boolean
          descricao?: string | null
          fonte?: string | null
          grau_confianca?: string | null
          hypothesis_id?: string | null
          id?: string
          justificativa?: string | null
          liberada_cliente?: boolean
          local_relacionado?: string | null
          observacao?: string | null
          organization_id?: string
          origem?: string
          periodo?: string | null
          person_id?: string | null
          pesquisador_id?: string | null
          pessoa_relacionada?: string | null
          relacao_hipotese?: string | null
          revisado_em?: string | null
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          visibilidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidencias_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_hypothesis_id_fkey"
            columns: ["hypothesis_id"]
            isOneToOne: false
            referencedRelation: "research_hypotheses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_estimates: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_approval_status: string
          created_at: string
          created_by: string | null
          currency: string
          data_origin: string
          estimate_source: string
          estimated_total_max: number | null
          estimated_total_min: number | null
          estimated_wait_days_max: number | null
          estimated_wait_days_min: number | null
          expense_type: string
          id: string
          institution_id: string | null
          notes_internal: string | null
          organization_id: string
          payer: string
          quantity: number
          research_action_plan_item_id: string | null
          unit_price_max: number | null
          unit_price_min: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_approval_status?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          data_origin?: string
          estimate_source?: string
          estimated_total_max?: number | null
          estimated_total_min?: number | null
          estimated_wait_days_max?: number | null
          estimated_wait_days_min?: number | null
          expense_type: string
          id?: string
          institution_id?: string | null
          notes_internal?: string | null
          organization_id: string
          payer?: string
          quantity?: number
          research_action_plan_item_id?: string | null
          unit_price_max?: number | null
          unit_price_min?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_approval_status?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          data_origin?: string
          estimate_source?: string
          estimated_total_max?: number | null
          estimated_total_min?: number | null
          estimated_wait_days_max?: number | null
          estimated_wait_days_min?: number | null
          expense_type?: string
          id?: string
          institution_id?: string | null
          notes_internal?: string | null
          organization_id?: string
          payer?: string
          quantity?: number
          research_action_plan_item_id?: string | null
          unit_price_max?: number | null
          unit_price_min?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_estimates_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_estimates_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_estimates_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_estimates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_estimates_research_action_plan_item_id_fkey"
            columns: ["research_action_plan_item_id"]
            isOneToOne: false
            referencedRelation: "research_action_plan_items"
            referencedColumns: ["id"]
          },
        ]
      }
      genealogical_events: {
        Row: {
          approximate_date: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          client_visibility: string
          created_at: string
          created_by: string | null
          data_precisao: string
          description_internal: string | null
          end_date: string | null
          event_type: string
          evidence_id: string | null
          family_id: string | null
          id: string
          impact_type: string | null
          locality: string | null
          organization_id: string
          person_id: string
          source_id: string | null
          start_date: string | null
          updated_at: string
          updated_by: string | null
          validation_status: string
        }
        Insert: {
          approximate_date?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          data_precisao?: string
          description_internal?: string | null
          end_date?: string | null
          event_type: string
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          impact_type?: string | null
          locality?: string | null
          organization_id: string
          person_id: string
          source_id?: string | null
          start_date?: string | null
          updated_at?: string
          updated_by?: string | null
          validation_status?: string
        }
        Update: {
          approximate_date?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          data_precisao?: string
          description_internal?: string | null
          end_date?: string | null
          event_type?: string
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          impact_type?: string | null
          locality?: string | null
          organization_id?: string
          person_id?: string
          source_id?: string | null
          start_date?: string | null
          updated_at?: string
          updated_by?: string | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "genealogical_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_events_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      genealogical_findings: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_deliverable_id: string | null
          client_projection_status: string
          confidence: string
          confirmed_facts: string | null
          created_at: string
          created_by: string | null
          eligible_for_client_deliverable: boolean
          evidence_links: string[]
          facts_to_confirm: string | null
          family_id: string | null
          family_relationship: string | null
          finding_type: string
          found_at: string
          generation: string | null
          id: string
          internal_notes: string | null
          internal_summary: string | null
          locality: string | null
          negative_next_action: string | null
          negative_source_consulted_at: string | null
          organization_id: string
          period_end: string | null
          period_start: string | null
          planning_impact: string | null
          primary_research_person_id: string | null
          relevance: string
          research_item_id: string | null
          responsible_user_id: string | null
          source_links: string[]
          timeline_impact: string
          title: string
          tree_impact: string
          updated_at: string
          updated_by: string | null
          validated_at: string | null
          validation_status: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_deliverable_id?: string | null
          client_projection_status?: string
          confidence?: string
          confirmed_facts?: string | null
          created_at?: string
          created_by?: string | null
          eligible_for_client_deliverable?: boolean
          evidence_links?: string[]
          facts_to_confirm?: string | null
          family_id?: string | null
          family_relationship?: string | null
          finding_type: string
          found_at?: string
          generation?: string | null
          id?: string
          internal_notes?: string | null
          internal_summary?: string | null
          locality?: string | null
          negative_next_action?: string | null
          negative_source_consulted_at?: string | null
          organization_id: string
          period_end?: string | null
          period_start?: string | null
          planning_impact?: string | null
          primary_research_person_id?: string | null
          relevance?: string
          research_item_id?: string | null
          responsible_user_id?: string | null
          source_links?: string[]
          timeline_impact?: string
          title: string
          tree_impact?: string
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validation_status?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_deliverable_id?: string | null
          client_projection_status?: string
          confidence?: string
          confirmed_facts?: string | null
          created_at?: string
          created_by?: string | null
          eligible_for_client_deliverable?: boolean
          evidence_links?: string[]
          facts_to_confirm?: string | null
          family_id?: string | null
          family_relationship?: string | null
          finding_type?: string
          found_at?: string
          generation?: string | null
          id?: string
          internal_notes?: string | null
          internal_summary?: string | null
          locality?: string | null
          negative_next_action?: string | null
          negative_source_consulted_at?: string | null
          organization_id?: string
          period_end?: string | null
          period_start?: string | null
          planning_impact?: string | null
          primary_research_person_id?: string | null
          relevance?: string
          research_item_id?: string | null
          responsible_user_id?: string | null
          source_links?: string[]
          timeline_impact?: string
          title?: string
          tree_impact?: string
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "genealogical_findings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_findings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_findings_client_deliverable_id_fkey"
            columns: ["client_deliverable_id"]
            isOneToOne: false
            referencedRelation: "client_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_findings_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_findings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_findings_primary_research_person_id_fkey"
            columns: ["primary_research_person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_findings_research_item_id_fkey"
            columns: ["research_item_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      genealogical_person_profiles: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          causa_morte: string | null
          client_id: string | null
          client_visibility: string
          created_at: string
          created_by: string | null
          evidence_id: string | null
          id: string
          internal_notes: string | null
          morte_data: string | null
          morte_data_aproximada: string | null
          morte_localidade: string | null
          morte_precisao: string
          nascimento_data: string | null
          nascimento_data_aproximada: string | null
          nascimento_localidade: string | null
          nascimento_precisao: string
          nome_completo: string
          nome_nascimento: string | null
          organization_id: string
          research_person_id: string
          responsible_user_id: string | null
          sepultamento_localidade: string | null
          sexo: string | null
          source_id: string | null
          status_verificacao: string
          updated_at: string
          updated_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          causa_morte?: string | null
          client_id?: string | null
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          evidence_id?: string | null
          id?: string
          internal_notes?: string | null
          morte_data?: string | null
          morte_data_aproximada?: string | null
          morte_localidade?: string | null
          morte_precisao?: string
          nascimento_data?: string | null
          nascimento_data_aproximada?: string | null
          nascimento_localidade?: string | null
          nascimento_precisao?: string
          nome_completo: string
          nome_nascimento?: string | null
          organization_id: string
          research_person_id: string
          responsible_user_id?: string | null
          sepultamento_localidade?: string | null
          sexo?: string | null
          source_id?: string | null
          status_verificacao?: string
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          causa_morte?: string | null
          client_id?: string | null
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          evidence_id?: string | null
          id?: string
          internal_notes?: string | null
          morte_data?: string | null
          morte_data_aproximada?: string | null
          morte_localidade?: string | null
          morte_precisao?: string
          nascimento_data?: string | null
          nascimento_data_aproximada?: string | null
          nascimento_localidade?: string | null
          nascimento_precisao?: string
          nome_completo?: string
          nome_nascimento?: string | null
          organization_id?: string
          research_person_id?: string
          responsible_user_id?: string | null
          sepultamento_localidade?: string | null
          sexo?: string | null
          source_id?: string | null
          status_verificacao?: string
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genealogical_person_profiles_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_person_profiles_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_person_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_person_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_person_profiles_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_person_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_person_profiles_research_person_id_fkey"
            columns: ["research_person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_person_profiles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      genealogical_relationships: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          client_visibility: string
          confidence_level: string
          created_at: string
          created_by: string | null
          directionality: string
          evidence_id: string | null
          id: string
          internal_notes: string | null
          locality: string | null
          organization_id: string
          person_from_id: string
          person_to_id: string
          relation_date: string | null
          relation_date_aproximada: string | null
          relation_type: string
          source_id: string | null
          status: string
          status_pesquisa: string
          supporting_evidence_count: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_visibility?: string
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          directionality?: string
          evidence_id?: string | null
          id?: string
          internal_notes?: string | null
          locality?: string | null
          organization_id: string
          person_from_id: string
          person_to_id: string
          relation_date?: string | null
          relation_date_aproximada?: string | null
          relation_type: string
          source_id?: string | null
          status?: string
          status_pesquisa?: string
          supporting_evidence_count?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_visibility?: string
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          directionality?: string
          evidence_id?: string | null
          id?: string
          internal_notes?: string | null
          locality?: string | null
          organization_id?: string
          person_from_id?: string
          person_to_id?: string
          relation_date?: string | null
          relation_date_aproximada?: string | null
          relation_type?: string
          source_id?: string | null
          status?: string
          status_pesquisa?: string
          supporting_evidence_count?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genealogical_relationships_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_relationships_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_relationships_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_relationships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_relationships_person_from_id_fkey"
            columns: ["person_from_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_relationships_person_to_id_fkey"
            columns: ["person_to_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genealogical_relationships_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      genealogical_sources_catalog: {
        Row: {
          acesso: string
          api_documentacao_url: string | null
          api_status: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          autenticacao_necessaria: boolean
          citizenship_track_id: string | null
          cobertura_geografica: string | null
          cobertura_temporal: string | null
          created_at: string
          created_by: string | null
          custo: string
          data_origin: string
          direitos_de_reuso: string | null
          estagio_maturidade: string
          id: string
          jurisdicao: string | null
          licenca_termos: string | null
          modelo_acesso: string | null
          modo_de_uso_permitido: string
          nivel_de_evidencia: string | null
          nivel_de_fonte: string
          nome: string
          observacao_risco: string | null
          organization_id: string
          pais_eixo: string
          permite_automacao: string | null
          permite_cache: string | null
          permite_download: string | null
          prioridade: string
          proxima_acao: string | null
          responsavel_revisao: string | null
          responsavel_validacao: string | null
          risco: string
          robots_verificado: string | null
          scraping_status: string
          status_documentacao: string
          status_integracao: string
          termos_de_uso_url: string | null
          tipo_de_acervo: string
          trata_dados_pessoais: boolean
          ultima_verificacao: string | null
          updated_at: string
          updated_by: string | null
          url_canonica: string | null
          url_pesquisa: string | null
          url_referencia_interna: string | null
          uso_recomendado: string | null
        }
        Insert: {
          acesso?: string
          api_documentacao_url?: string | null
          api_status?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          autenticacao_necessaria?: boolean
          citizenship_track_id?: string | null
          cobertura_geografica?: string | null
          cobertura_temporal?: string | null
          created_at?: string
          created_by?: string | null
          custo?: string
          data_origin?: string
          direitos_de_reuso?: string | null
          estagio_maturidade?: string
          id?: string
          jurisdicao?: string | null
          licenca_termos?: string | null
          modelo_acesso?: string | null
          modo_de_uso_permitido?: string
          nivel_de_evidencia?: string | null
          nivel_de_fonte?: string
          nome: string
          observacao_risco?: string | null
          organization_id: string
          pais_eixo: string
          permite_automacao?: string | null
          permite_cache?: string | null
          permite_download?: string | null
          prioridade?: string
          proxima_acao?: string | null
          responsavel_revisao?: string | null
          responsavel_validacao?: string | null
          risco?: string
          robots_verificado?: string | null
          scraping_status?: string
          status_documentacao?: string
          status_integracao?: string
          termos_de_uso_url?: string | null
          tipo_de_acervo?: string
          trata_dados_pessoais?: boolean
          ultima_verificacao?: string | null
          updated_at?: string
          updated_by?: string | null
          url_canonica?: string | null
          url_pesquisa?: string | null
          url_referencia_interna?: string | null
          uso_recomendado?: string | null
        }
        Update: {
          acesso?: string
          api_documentacao_url?: string | null
          api_status?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          autenticacao_necessaria?: boolean
          citizenship_track_id?: string | null
          cobertura_geografica?: string | null
          cobertura_temporal?: string | null
          created_at?: string
          created_by?: string | null
          custo?: string
          data_origin?: string
          direitos_de_reuso?: string | null
          estagio_maturidade?: string
          id?: string
          jurisdicao?: string | null
          licenca_termos?: string | null
          modelo_acesso?: string | null
          modo_de_uso_permitido?: string
          nivel_de_evidencia?: string | null
          nivel_de_fonte?: string
          nome?: string
          observacao_risco?: string | null
          organization_id?: string
          pais_eixo?: string
          permite_automacao?: string | null
          permite_cache?: string | null
          permite_download?: string | null
          prioridade?: string
          proxima_acao?: string | null
          responsavel_revisao?: string | null
          responsavel_validacao?: string | null
          risco?: string
          robots_verificado?: string | null
          scraping_status?: string
          status_documentacao?: string
          status_integracao?: string
          termos_de_uso_url?: string | null
          tipo_de_acervo?: string
          trata_dados_pessoais?: boolean
          ultima_verificacao?: string | null
          updated_at?: string
          updated_by?: string | null
          url_canonica?: string | null
          url_pesquisa?: string | null
          url_referencia_interna?: string | null
          uso_recomendado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genealogical_sources_catalog_citizenship_track_id_fkey"
            columns: ["citizenship_track_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_context_events: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historical_context_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_context_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_context_events_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_context_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_context_events_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_context_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_context_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_context_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          archived_at: string | null
          created_at: string
          created_records: number
          duplicated_records: number
          error_log: Json
          finished_at: string | null
          id: string
          imported_by: string | null
          mapping: Json
          mapping_version: string
          observacao: string | null
          organization_id: string
          rejected_records: number
          source_file_or_endpoint: string | null
          source_system: string
          started_at: string
          status: string
          total_rows: number
          updated_at: string
          updated_records: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_records?: number
          duplicated_records?: number
          error_log?: Json
          finished_at?: string | null
          id?: string
          imported_by?: string | null
          mapping?: Json
          mapping_version?: string
          observacao?: string | null
          organization_id: string
          rejected_records?: number
          source_file_or_endpoint?: string | null
          source_system: string
          started_at?: string
          status?: string
          total_rows?: number
          updated_at?: string
          updated_records?: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_records?: number
          duplicated_records?: number
          error_log?: Json
          finished_at?: string | null
          id?: string
          imported_by?: string | null
          mapping?: Json
          mapping_version?: string
          observacao?: string | null
          organization_id?: string
          rejected_records?: number
          source_file_or_endpoint?: string | null
          source_system?: string
          started_at?: string
          status?: string
          total_rows?: number
          updated_at?: string
          updated_records?: number
        }
        Relationships: []
      }
      incremental_scope: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          id: string
          incremental_reason: string
          item_id: string
          organization_id: string
          quantity: number
          reference_price_id: string | null
          track_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          incremental_reason: string
          item_id: string
          organization_id: string
          quantity?: number
          reference_price_id?: string | null
          track_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          incremental_reason?: string
          item_id?: string
          organization_id?: string
          quantity?: number
          reference_price_id?: string | null
          track_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incremental_scope_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incremental_scope_reference_price_id_fkey"
            columns: ["reference_price_id"]
            isOneToOne: false
            referencedRelation: "price_catalog_rescued"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incremental_scope_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_profile_events: {
        Row: {
          created_at: string
          created_by: string | null
          detalhe: string | null
          evento: string
          id: string
          organization_id: string
          payload: Json
          profile_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          detalhe?: string | null
          evento: string
          id?: string
          organization_id: string
          payload?: Json
          profile_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          detalhe?: string | null
          evento?: string
          id?: string
          organization_id?: string
          payload?: Json
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institutional_profile_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_profile_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_profiles: {
        Row: {
          campos: Json
          created_at: string
          created_by: string | null
          id: string
          observacao_governanca: string | null
          organization_id: string
          status: string
          updated_at: string
          updated_by: string | null
          versao: string
          whatsapp_configurado: boolean
        }
        Insert: {
          campos?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          observacao_governanca?: string | null
          organization_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          versao: string
          whatsapp_configurado?: boolean
        }
        Update: {
          campos?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          observacao_governanca?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          versao?: string
          whatsapp_configurado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "institutional_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          city: string | null
          contact_source: string | null
          country: string | null
          created_at: string
          created_by: string | null
          data_origin: string
          email: string | null
          id: string
          institution_type: string
          last_verified_at: string | null
          name: string
          notes_internal: string | null
          opening_hours: string | null
          operational_instruction: string | null
          organization_id: string
          phone: string | null
          preferred_channel: string
          update_status: string
          updated_at: string
          updated_by: string | null
          verified_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          city?: string | null
          contact_source?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          email?: string | null
          id?: string
          institution_type?: string
          last_verified_at?: string | null
          name: string
          notes_internal?: string | null
          opening_hours?: string | null
          operational_instruction?: string | null
          organization_id: string
          phone?: string | null
          preferred_channel?: string
          update_status?: string
          updated_at?: string
          updated_by?: string | null
          verified_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          city?: string | null
          contact_source?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          email?: string | null
          id?: string
          institution_type?: string
          last_verified_at?: string | null
          name?: string
          notes_internal?: string | null
          opening_hours?: string | null
          operational_instruction?: string | null
          organization_id?: string
          phone?: string | null
          preferred_channel?: string
          update_status?: string
          updated_at?: string
          updated_by?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_review_queue: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          id: string
          integration_id: string
          motivo: string
          organization_id: string
          resolucao: string | null
          resolvido_em: string | null
          resolvido_por: string | null
          run_id: string | null
          status: string
          tentativas: number
          updated_at: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          id?: string
          integration_id: string
          motivo: string
          organization_id: string
          resolucao?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          run_id?: string | null
          status?: string
          tentativas?: number
          updated_at?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          id?: string
          integration_id?: string
          motivo?: string
          organization_id?: string
          resolucao?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          run_id?: string | null
          status?: string
          tentativas?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_review_queue_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_review_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_review_queue_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "integration_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_runs: {
        Row: {
          ambiente: string
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          duracao_ms: number | null
          efeito_local: string | null
          id: string
          integration_id: string
          mensagem: string | null
          operacao: string
          organization_id: string
          payload_mascarado: Json
          resposta_mascarada: Json
          resultado: string
          tentativa: number
        }
        Insert: {
          ambiente?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          duracao_ms?: number | null
          efeito_local?: string | null
          id?: string
          integration_id: string
          mensagem?: string | null
          operacao: string
          organization_id: string
          payload_mascarado?: Json
          resposta_mascarada?: Json
          resultado: string
          tentativa?: number
        }
        Update: {
          ambiente?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          duracao_ms?: number | null
          efeito_local?: string | null
          id?: string
          integration_id?: string
          mensagem?: string | null
          operacao?: string
          organization_id?: string
          payload_mascarado?: Json
          resposta_mascarada?: Json
          resultado?: string
          tentativa?: number
        }
        Relationships: [
          {
            foreignKeyName: "integration_runs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          ativacao_confirmacao: string | null
          ativada_em: string | null
          ativada_por: string | null
          campos_obrigatorios: string[]
          categoria: string
          chave: string
          config: Json
          created_at: string
          created_by: string | null
          descricao: string | null
          falhas_consecutivas: number
          field_map: Json
          id: string
          modo_simulado: boolean
          nome: string
          organization_id: string
          owner_nome: string | null
          owner_user_id: string | null
          pausa_motivo: string | null
          provedor: string | null
          retry_backoff_seg: number
          retry_max: number
          status: string
          ultima_execucao_em: string | null
          ultima_execucao_status: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativacao_confirmacao?: string | null
          ativada_em?: string | null
          ativada_por?: string | null
          campos_obrigatorios?: string[]
          categoria: string
          chave: string
          config?: Json
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          falhas_consecutivas?: number
          field_map?: Json
          id?: string
          modo_simulado?: boolean
          nome: string
          organization_id: string
          owner_nome?: string | null
          owner_user_id?: string | null
          pausa_motivo?: string | null
          provedor?: string | null
          retry_backoff_seg?: number
          retry_max?: number
          status?: string
          ultima_execucao_em?: string | null
          ultima_execucao_status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativacao_confirmacao?: string | null
          ativada_em?: string | null
          ativada_por?: string | null
          campos_obrigatorios?: string[]
          categoria?: string
          chave?: string
          config?: Json
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          falhas_consecutivas?: number
          field_map?: Json
          id?: string
          modo_simulado?: boolean
          nome?: string
          organization_id?: string
          owner_nome?: string | null
          owner_user_id?: string | null
          pausa_motivo?: string | null
          provedor?: string | null
          retry_backoff_seg?: number
          retry_max?: number
          status?: string
          ultima_execucao_em?: string | null
          ultima_execucao_status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_adjustments: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          motivo: string
          organization_id: string
          referencia_externa: string | null
          updated_at: string
          updated_by: string | null
          valor: number
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          motivo: string
          organization_id: string
          referencia_externa?: string | null
          updated_at?: string
          updated_by?: string | null
          valor: number
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          motivo?: string
          organization_id?: string
          referencia_externa?: string | null
          updated_at?: string
          updated_by?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_adjustments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_adjustments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          client_id: string | null
          conciliacao_status: string
          contract_id: string | null
          created_at: string
          created_by: string | null
          dados_teste: boolean
          descricao: string | null
          emitida_em: string | null
          id: string
          liberada_cliente: boolean
          liberada_em: string | null
          liberada_por: string | null
          moeda: string
          numero: string | null
          organization_id: string
          paga_em: string | null
          proposal_id: string | null
          referencia_externa: string | null
          service_order_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
          valor: number
          valor_pago: number
          vencimento: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          conciliacao_status?: string
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          descricao?: string | null
          emitida_em?: string | null
          id?: string
          liberada_cliente?: boolean
          liberada_em?: string | null
          liberada_por?: string | null
          moeda?: string
          numero?: string | null
          organization_id: string
          paga_em?: string | null
          proposal_id?: string | null
          referencia_externa?: string | null
          service_order_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor?: number
          valor_pago?: number
          vencimento?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          conciliacao_status?: string
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          descricao?: string | null
          emitida_em?: string | null
          id?: string
          liberada_cliente?: boolean
          liberada_em?: string | null
          liberada_por?: string | null
          moeda?: string
          numero?: string | null
          organization_id?: string
          paga_em?: string | null
          proposal_id?: string | null
          referencia_externa?: string | null
          service_order_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor?: number
          valor_pago?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          change_resumo: string | null
          created_at: string
          created_by: string | null
          dominio: string
          fonte: string | null
          id: string
          link_url: string | null
          nivel_acesso: string
          organization_id: string
          owner_nome: string | null
          owner_user_id: string | null
          processo: string | null
          resumo: string | null
          status: string
          storage_path: string | null
          tipo: string
          titulo: string
          ultima_revisao_em: string | null
          updated_at: string
          updated_by: string | null
          versao: number
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          change_resumo?: string | null
          created_at?: string
          created_by?: string | null
          dominio?: string
          fonte?: string | null
          id?: string
          link_url?: string | null
          nivel_acesso?: string
          organization_id: string
          owner_nome?: string | null
          owner_user_id?: string | null
          processo?: string | null
          resumo?: string | null
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo: string
          ultima_revisao_em?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          change_resumo?: string | null
          created_at?: string
          created_by?: string | null
          dominio?: string
          fonte?: string | null
          id?: string
          link_url?: string | null
          nivel_acesso?: string
          organization_id?: string
          owner_nome?: string | null
          owner_user_id?: string | null
          processo?: string | null
          resumo?: string | null
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo?: string
          ultima_revisao_em?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      label_taxonomy: {
        Row: {
          active: boolean
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          category: string
          code: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          meta_agent_equivalent: string | null
          name: string
          organization_id: string
          scope: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category: string
          code: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meta_agent_equivalent?: string | null
          name: string
          organization_id: string
          scope?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category?: string
          code?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meta_agent_equivalent?: string | null
          name?: string
          organization_id?: string
          scope?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      lead_sources: {
        Row: {
          active: boolean
          archived_at: string | null
          canal: string | null
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          organization_id: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          canal?: string | null
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          organization_id: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          canal?: string | null
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          organization_id?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          area_responsavel: string | null
          asaas_evento_referencia: string | null
          call_agendada_em: string | null
          call_realizada_em: string | null
          case_id: string | null
          codigo: string | null
          complexidade_documental: string | null
          confianca_triagem: string | null
          consentimento_canal: string | null
          consentimento_em: string | null
          consentimento_gravacao: boolean
          consentimento_status: string
          consentimento_versao_aviso: string | null
          contrato_link_interno: string | null
          created_at: string
          created_by: string | null
          dados_teste: boolean
          data_origin: string
          demo: boolean
          despesas_terceiros_faixa: string | null
          despesas_terceiros_regra: string | null
          despesas_terceiros_status: string | null
          discovery_registro: Json
          discovery_resultado: string | null
          documentos_chave: string[]
          dossie_ambiente: string | null
          dossie_ativo: boolean
          dossie_link_interno: string | null
          dossie_mae_ref: string | null
          dossie_nivel_acesso: string | null
          dossie_responsavel: string | null
          eixo_comercial: string
          eixo_formalizacao: string
          elegibilidade_preliminar: string | null
          email: string | null
          estado_documental_inicial: string | null
          estagio: string
          estrutura_familiar: string | null
          exige_idioma_entrevista: string | null
          geracao_ascendente: string | null
          gravacao_link_interno: string | null
          id: string
          indicado_por: string | null
          linha_transmissao: string | null
          localidades_conhecidas: string | null
          marco_preliminar: string | null
          marco_referencia_id: string | null
          motivo_perda: string | null
          nacionalidade: string | null
          nacionalidades_interesse: string[]
          narrativa_familiar: string | null
          nivel_intencao: string | null
          nome: string
          nucleo_id: string | null
          objecao_predominante: string | null
          objetivo: string | null
          observacoes: string | null
          organization_id: string
          origem: string | null
          pagamento_previsto_em: string | null
          pais_interesse: string | null
          pais_linha_prioritaria: string | null
          pendencia_documental_prioritaria: string | null
          pesquisa_previa_autorizacao: string
          pesquisa_previa_escopo: string[]
          pesquisa_previa_limite: string | null
          produtos_recomendados: string[]
          proposta_link_interno: string | null
          proposta_referencia_interna: string | null
          proxima_acao: string | null
          proxima_acao_em: string | null
          requerentes_potenciais: number | null
          responsavel_nome: string | null
          responsavel_user_id: string | null
          resumo_call: string | null
          resumo_validado: boolean
          risco_ruptura: string | null
          scan_triagem_id: string | null
          servico_inicial_aprovado: string | null
          sku_referencia: string | null
          spin_implicacao: boolean
          spin_necessidade: boolean
          spin_problema: boolean
          spin_situacao: boolean
          status_call: string | null
          status_via: string | null
          telefone: string | null
          trilha_referencia_id: string | null
          ultimo_followup_em: string | null
          updated_at: string
          updated_by: string | null
          via_juridica_preliminar: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          area_responsavel?: string | null
          asaas_evento_referencia?: string | null
          call_agendada_em?: string | null
          call_realizada_em?: string | null
          case_id?: string | null
          codigo?: string | null
          complexidade_documental?: string | null
          confianca_triagem?: string | null
          consentimento_canal?: string | null
          consentimento_em?: string | null
          consentimento_gravacao?: boolean
          consentimento_status?: string
          consentimento_versao_aviso?: string | null
          contrato_link_interno?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          data_origin?: string
          demo?: boolean
          despesas_terceiros_faixa?: string | null
          despesas_terceiros_regra?: string | null
          despesas_terceiros_status?: string | null
          discovery_registro?: Json
          discovery_resultado?: string | null
          documentos_chave?: string[]
          dossie_ambiente?: string | null
          dossie_ativo?: boolean
          dossie_link_interno?: string | null
          dossie_mae_ref?: string | null
          dossie_nivel_acesso?: string | null
          dossie_responsavel?: string | null
          eixo_comercial?: string
          eixo_formalizacao?: string
          elegibilidade_preliminar?: string | null
          email?: string | null
          estado_documental_inicial?: string | null
          estagio?: string
          estrutura_familiar?: string | null
          exige_idioma_entrevista?: string | null
          geracao_ascendente?: string | null
          gravacao_link_interno?: string | null
          id?: string
          indicado_por?: string | null
          linha_transmissao?: string | null
          localidades_conhecidas?: string | null
          marco_preliminar?: string | null
          marco_referencia_id?: string | null
          motivo_perda?: string | null
          nacionalidade?: string | null
          nacionalidades_interesse?: string[]
          narrativa_familiar?: string | null
          nivel_intencao?: string | null
          nome: string
          nucleo_id?: string | null
          objecao_predominante?: string | null
          objetivo?: string | null
          observacoes?: string | null
          organization_id: string
          origem?: string | null
          pagamento_previsto_em?: string | null
          pais_interesse?: string | null
          pais_linha_prioritaria?: string | null
          pendencia_documental_prioritaria?: string | null
          pesquisa_previa_autorizacao?: string
          pesquisa_previa_escopo?: string[]
          pesquisa_previa_limite?: string | null
          produtos_recomendados?: string[]
          proposta_link_interno?: string | null
          proposta_referencia_interna?: string | null
          proxima_acao?: string | null
          proxima_acao_em?: string | null
          requerentes_potenciais?: number | null
          responsavel_nome?: string | null
          responsavel_user_id?: string | null
          resumo_call?: string | null
          resumo_validado?: boolean
          risco_ruptura?: string | null
          scan_triagem_id?: string | null
          servico_inicial_aprovado?: string | null
          sku_referencia?: string | null
          spin_implicacao?: boolean
          spin_necessidade?: boolean
          spin_problema?: boolean
          spin_situacao?: boolean
          status_call?: string | null
          status_via?: string | null
          telefone?: string | null
          trilha_referencia_id?: string | null
          ultimo_followup_em?: string | null
          updated_at?: string
          updated_by?: string | null
          via_juridica_preliminar?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          area_responsavel?: string | null
          asaas_evento_referencia?: string | null
          call_agendada_em?: string | null
          call_realizada_em?: string | null
          case_id?: string | null
          codigo?: string | null
          complexidade_documental?: string | null
          confianca_triagem?: string | null
          consentimento_canal?: string | null
          consentimento_em?: string | null
          consentimento_gravacao?: boolean
          consentimento_status?: string
          consentimento_versao_aviso?: string | null
          contrato_link_interno?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          data_origin?: string
          demo?: boolean
          despesas_terceiros_faixa?: string | null
          despesas_terceiros_regra?: string | null
          despesas_terceiros_status?: string | null
          discovery_registro?: Json
          discovery_resultado?: string | null
          documentos_chave?: string[]
          dossie_ambiente?: string | null
          dossie_ativo?: boolean
          dossie_link_interno?: string | null
          dossie_mae_ref?: string | null
          dossie_nivel_acesso?: string | null
          dossie_responsavel?: string | null
          eixo_comercial?: string
          eixo_formalizacao?: string
          elegibilidade_preliminar?: string | null
          email?: string | null
          estado_documental_inicial?: string | null
          estagio?: string
          estrutura_familiar?: string | null
          exige_idioma_entrevista?: string | null
          geracao_ascendente?: string | null
          gravacao_link_interno?: string | null
          id?: string
          indicado_por?: string | null
          linha_transmissao?: string | null
          localidades_conhecidas?: string | null
          marco_preliminar?: string | null
          marco_referencia_id?: string | null
          motivo_perda?: string | null
          nacionalidade?: string | null
          nacionalidades_interesse?: string[]
          narrativa_familiar?: string | null
          nivel_intencao?: string | null
          nome?: string
          nucleo_id?: string | null
          objecao_predominante?: string | null
          objetivo?: string | null
          observacoes?: string | null
          organization_id?: string
          origem?: string | null
          pagamento_previsto_em?: string | null
          pais_interesse?: string | null
          pais_linha_prioritaria?: string | null
          pendencia_documental_prioritaria?: string | null
          pesquisa_previa_autorizacao?: string
          pesquisa_previa_escopo?: string[]
          pesquisa_previa_limite?: string | null
          produtos_recomendados?: string[]
          proposta_link_interno?: string | null
          proposta_referencia_interna?: string | null
          proxima_acao?: string | null
          proxima_acao_em?: string | null
          requerentes_potenciais?: number | null
          responsavel_nome?: string | null
          responsavel_user_id?: string | null
          resumo_call?: string | null
          resumo_validado?: boolean
          risco_ruptura?: string | null
          scan_triagem_id?: string | null
          servico_inicial_aprovado?: string | null
          sku_referencia?: string | null
          spin_implicacao?: boolean
          spin_necessidade?: boolean
          spin_problema?: boolean
          spin_situacao?: boolean
          status_call?: string | null
          status_via?: string | null
          telefone?: string | null
          trilha_referencia_id?: string | null
          ultimo_followup_em?: string | null
          updated_at?: string
          updated_by?: string | null
          via_juridica_preliminar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_marco_referencia_id_fkey"
            columns: ["marco_referencia_id"]
            isOneToOne: false
            referencedRelation: "legal_reference_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_scan_triagem_id_fkey"
            columns: ["scan_triagem_id"]
            isOneToOne: false
            referencedRelation: "ancestralscan_triagens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_trilha_referencia_id_fkey"
            columns: ["trilha_referencia_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_catalog_import: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          id: string
          imported_at: string
          integrity_hash: string
          legacy_link: string | null
          legacy_name: string | null
          legacy_price: number | null
          legacy_sku: string
          organization_id: string
          price_catalog_rescued_id: string | null
          reconciliation_status: string
          source_artifact: string
          source_line: string | null
          source_version: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          imported_at?: string
          integrity_hash: string
          legacy_link?: string | null
          legacy_name?: string | null
          legacy_price?: number | null
          legacy_sku: string
          organization_id: string
          price_catalog_rescued_id?: string | null
          reconciliation_status?: string
          source_artifact: string
          source_line?: string | null
          source_version?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          imported_at?: string
          integrity_hash?: string
          legacy_link?: string | null
          legacy_name?: string | null
          legacy_price?: number | null
          legacy_sku?: string
          organization_id?: string
          price_catalog_rescued_id?: string | null
          reconciliation_status?: string
          source_artifact?: string
          source_line?: string | null
          source_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legacy_catalog_import_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legacy_catalog_import_price_catalog_rescued_id_fkey"
            columns: ["price_catalog_rescued_id"]
            isOneToOne: false
            referencedRelation: "price_catalog_rescued"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_record_links: {
        Row: {
          archived_at: string | null
          canonical_record_id: string | null
          canonical_reference: string | null
          confidence: string
          created_at: string
          deduplication_reason: string | null
          entity_type: string
          id: string
          imported_at: string
          legacy_record_id: string
          legacy_reference: string | null
          legacy_system: string
          migration_batch_id: string | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          canonical_record_id?: string | null
          canonical_reference?: string | null
          confidence?: string
          created_at?: string
          deduplication_reason?: string | null
          entity_type: string
          id?: string
          imported_at?: string
          legacy_record_id: string
          legacy_reference?: string | null
          legacy_system: string
          migration_batch_id?: string | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          canonical_record_id?: string | null
          canonical_reference?: string | null
          confidence?: string
          created_at?: string
          deduplication_reason?: string | null
          entity_type?: string
          id?: string
          imported_at?: string
          legacy_record_id?: string
          legacy_reference?: string | null
          legacy_system?: string
          migration_batch_id?: string | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_record_links_migration_batch_id_fkey"
            columns: ["migration_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_clause_matrix: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          bloqueia_assinatura: boolean
          created_at: string
          created_by: string | null
          decidido_em: string | null
          decisao: string | null
          id: string
          impacto_templates: string[]
          justificativa: string | null
          organization_id: string
          origem: string
          referencia_versao: string | null
          responsavel_revisao: string | null
          status: string
          substituicao_motivo: string | null
          substituido_por_id: string | null
          tema: string
          tema_codigo: string
          tema_codigo_historico: string | null
          updated_at: string
          updated_by: string | null
          versao_juridica_aplicavel: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueia_assinatura?: boolean
          created_at?: string
          created_by?: string | null
          decidido_em?: string | null
          decisao?: string | null
          id?: string
          impacto_templates?: string[]
          justificativa?: string | null
          organization_id: string
          origem?: string
          referencia_versao?: string | null
          responsavel_revisao?: string | null
          status?: string
          substituicao_motivo?: string | null
          substituido_por_id?: string | null
          tema: string
          tema_codigo: string
          tema_codigo_historico?: string | null
          updated_at?: string
          updated_by?: string | null
          versao_juridica_aplicavel?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueia_assinatura?: boolean
          created_at?: string
          created_by?: string | null
          decidido_em?: string | null
          decisao?: string | null
          id?: string
          impacto_templates?: string[]
          justificativa?: string | null
          organization_id?: string
          origem?: string
          referencia_versao?: string | null
          responsavel_revisao?: string | null
          status?: string
          substituicao_motivo?: string | null
          substituido_por_id?: string | null
          tema?: string
          tema_codigo?: string
          tema_codigo_historico?: string | null
          updated_at?: string
          updated_by?: string | null
          versao_juridica_aplicavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_clause_matrix_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_clause_matrix_substituido_por_id_fkey"
            columns: ["substituido_por_id"]
            isOneToOne: false
            referencedRelation: "legal_clause_matrix"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_reference_milestones: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          id: string
          label: string
          lifecycle_status: string
          notes: string | null
          official_source_url: string | null
          organization_id: string
          reference_type: string
          review_required: string
          status: string
          summary_internal: string | null
          track_id: string
          updated_at: string
          updated_by: string | null
          verified_at: string | null
          verified_by: string | null
          versao: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          lifecycle_status?: string
          notes?: string | null
          official_source_url?: string | null
          organization_id: string
          reference_type?: string
          review_required?: string
          status?: string
          summary_internal?: string | null
          track_id: string
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
          versao?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          lifecycle_status?: string
          notes?: string | null
          official_source_url?: string | null
          organization_id?: string
          reference_type?: string
          review_required?: string
          status?: string
          summary_internal?: string | null
          track_id?: string
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_reference_milestones_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      lineage_encounters: {
        Row: {
          approval_status: string
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_deliverable_id: string | null
          confidence_internal: string
          contexto_historico: string | null
          created_at: string
          created_by: string | null
          data_marco: string | null
          disclaimer_obrigatorio: boolean
          encontros_no_brasil: string | null
          encounter_type: string
          evidence_links: string[] | null
          evidence_links_a: string[]
          evidence_links_b: string[]
          family_id: string | null
          id: string
          lineage_path_a_id: string | null
          lineage_path_b_id: string | null
          memoria_familiar: string | null
          organization_id: string
          praticas_culturais_documentadas: string | null
          repertorios_narrativos: string | null
          responsible_user_id: string | null
          resumo_aprovado_cliente: string | null
          resumo_interno: string | null
          territorios_migratorios: string | null
          timeline_impact: string
          title_client: string | null
          title_internal: string
          tree_impact: string
          updated_at: string
          updated_by: string | null
          validation_status: string
        }
        Insert: {
          approval_status?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_deliverable_id?: string | null
          confidence_internal?: string
          contexto_historico?: string | null
          created_at?: string
          created_by?: string | null
          data_marco?: string | null
          disclaimer_obrigatorio?: boolean
          encontros_no_brasil?: string | null
          encounter_type: string
          evidence_links?: string[] | null
          evidence_links_a?: string[]
          evidence_links_b?: string[]
          family_id?: string | null
          id?: string
          lineage_path_a_id?: string | null
          lineage_path_b_id?: string | null
          memoria_familiar?: string | null
          organization_id: string
          praticas_culturais_documentadas?: string | null
          repertorios_narrativos?: string | null
          responsible_user_id?: string | null
          resumo_aprovado_cliente?: string | null
          resumo_interno?: string | null
          territorios_migratorios?: string | null
          timeline_impact?: string
          title_client?: string | null
          title_internal: string
          tree_impact?: string
          updated_at?: string
          updated_by?: string | null
          validation_status?: string
        }
        Update: {
          approval_status?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_deliverable_id?: string | null
          confidence_internal?: string
          contexto_historico?: string | null
          created_at?: string
          created_by?: string | null
          data_marco?: string | null
          disclaimer_obrigatorio?: boolean
          encontros_no_brasil?: string | null
          encounter_type?: string
          evidence_links?: string[] | null
          evidence_links_a?: string[]
          evidence_links_b?: string[]
          family_id?: string | null
          id?: string
          lineage_path_a_id?: string | null
          lineage_path_b_id?: string | null
          memoria_familiar?: string | null
          organization_id?: string
          praticas_culturais_documentadas?: string | null
          repertorios_narrativos?: string | null
          responsible_user_id?: string | null
          resumo_aprovado_cliente?: string | null
          resumo_interno?: string | null
          territorios_migratorios?: string | null
          timeline_impact?: string
          title_client?: string | null
          title_internal?: string
          tree_impact?: string
          updated_at?: string
          updated_by?: string | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lineage_encounters_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineage_encounters_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineage_encounters_client_deliverable_id_fkey"
            columns: ["client_deliverable_id"]
            isOneToOne: false
            referencedRelation: "client_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineage_encounters_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineage_encounters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lineage_paths: {
        Row: {
          aderencia_percentual: number | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          citizenship_track_id: string | null
          created_at: string
          created_by: string | null
          evidencias_chave: string[]
          family_id: string | null
          geracao_alvo: string | null
          id: string
          nome_da_linha: string
          objetivo: string | null
          organization_id: string
          pessoa_ancora_id: string | null
          proximo_marco: string | null
          responsavel: string | null
          risco_principal: string | null
          status: string
          tipo_da_linha: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aderencia_percentual?: number | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          citizenship_track_id?: string | null
          created_at?: string
          created_by?: string | null
          evidencias_chave?: string[]
          family_id?: string | null
          geracao_alvo?: string | null
          id?: string
          nome_da_linha: string
          objetivo?: string | null
          organization_id: string
          pessoa_ancora_id?: string | null
          proximo_marco?: string | null
          responsavel?: string | null
          risco_principal?: string | null
          status?: string
          tipo_da_linha?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aderencia_percentual?: number | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          citizenship_track_id?: string | null
          created_at?: string
          created_by?: string | null
          evidencias_chave?: string[]
          family_id?: string | null
          geracao_alvo?: string | null
          id?: string
          nome_da_linha?: string
          objetivo?: string | null
          organization_id?: string
          pessoa_ancora_id?: string | null
          proximo_marco?: string | null
          responsavel?: string | null
          risco_principal?: string | null
          status?: string
          tipo_da_linha?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lineage_paths_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineage_paths_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineage_paths_citizenship_track_id_fkey"
            columns: ["citizenship_track_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineage_paths_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineage_paths_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineage_paths_pessoa_ancora_id_fkey"
            columns: ["pessoa_ancora_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          archived_at: string | null
          canal: string | null
          codigo: string
          created_at: string
          fim: string | null
          id: string
          inicio: string | null
          lead_source_id: string | null
          nome: string
          observacao: string | null
          organization_id: string
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          archived_at?: string | null
          canal?: string | null
          codigo: string
          created_at?: string
          fim?: string | null
          id?: string
          inicio?: string | null
          lead_source_id?: string | null
          nome: string
          observacao?: string | null
          organization_id: string
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          archived_at?: string | null
          canal?: string | null
          codigo?: string
          created_at?: string
          fim?: string | null
          id?: string
          inicio?: string | null
          lead_source_id?: string | null
          nome?: string
          observacao?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_lead_source_id_fkey"
            columns: ["lead_source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_investments: {
        Row: {
          archived_at: string | null
          campaign_id: string | null
          canal: string | null
          competencia: string
          created_at: string
          id: string
          lead_source_id: string | null
          moeda: string
          observacao: string | null
          organization_id: string
          origem_dado: string
          referencia_interna: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          archived_at?: string | null
          campaign_id?: string | null
          canal?: string | null
          competencia: string
          created_at?: string
          id?: string
          lead_source_id?: string | null
          moeda?: string
          observacao?: string | null
          organization_id: string
          origem_dado?: string
          referencia_interna?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          archived_at?: string | null
          campaign_id?: string | null
          canal?: string | null
          competencia?: string
          created_at?: string
          id?: string
          lead_source_id?: string | null
          moeda?: string
          observacao?: string | null
          organization_id?: string
          origem_dado?: string
          referencia_interna?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketing_investments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_investments_lead_source_id_fkey"
            columns: ["lead_source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      master_library_items: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          arquivo_ou_url_interna: string | null
          categoria: string
          created_at: string
          created_by: string | null
          descricao_interna: string | null
          homologacao_criterio: string | null
          homologado_em: string | null
          homologado_por: string | null
          id: string
          organization_id: string
          owner: string | null
          referencia_interna: string | null
          status: string
          substitui_item_id: string | null
          substituido_por_item_id: string | null
          suspensao_motivo: string | null
          suspenso_em: string | null
          suspenso_por: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
          versao: string
          vigencia_estado: string
          vigencia_justificativa: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          arquivo_ou_url_interna?: string | null
          categoria: string
          created_at?: string
          created_by?: string | null
          descricao_interna?: string | null
          homologacao_criterio?: string | null
          homologado_em?: string | null
          homologado_por?: string | null
          id?: string
          organization_id: string
          owner?: string | null
          referencia_interna?: string | null
          status?: string
          substitui_item_id?: string | null
          substituido_por_item_id?: string | null
          suspensao_motivo?: string | null
          suspenso_em?: string | null
          suspenso_por?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
          versao?: string
          vigencia_estado?: string
          vigencia_justificativa?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          arquivo_ou_url_interna?: string | null
          categoria?: string
          created_at?: string
          created_by?: string | null
          descricao_interna?: string | null
          homologacao_criterio?: string | null
          homologado_em?: string | null
          homologado_por?: string | null
          id?: string
          organization_id?: string
          owner?: string | null
          referencia_interna?: string | null
          status?: string
          substitui_item_id?: string | null
          substituido_por_item_id?: string | null
          suspensao_motivo?: string | null
          suspenso_em?: string | null
          suspenso_por?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          versao?: string
          vigencia_estado?: string
          vigencia_justificativa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_library_items_substitui_item_id_fkey"
            columns: ["substitui_item_id"]
            isOneToOne: false
            referencedRelation: "master_library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_library_items_substituido_por_item_id_fkey"
            columns: ["substituido_por_item_id"]
            isOneToOne: false
            referencedRelation: "master_library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      master_library_state_events: {
        Row: {
          ator_user_id: string | null
          created_at: string
          criterio_registrado: boolean
          estado_anterior: string | null
          estado_novo: string
          id: string
          item_id: string
          justificativa: string | null
          organization_id: string
          predecessor_id: string | null
          responsavel: string | null
          sucessor_id: string | null
          versao: string | null
        }
        Insert: {
          ator_user_id?: string | null
          created_at?: string
          criterio_registrado?: boolean
          estado_anterior?: string | null
          estado_novo: string
          id?: string
          item_id: string
          justificativa?: string | null
          organization_id: string
          predecessor_id?: string | null
          responsavel?: string | null
          sucessor_id?: string | null
          versao?: string | null
        }
        Update: {
          ator_user_id?: string | null
          created_at?: string
          criterio_registrado?: boolean
          estado_anterior?: string | null
          estado_novo?: string
          id?: string
          item_id?: string
          justificativa?: string | null
          organization_id?: string
          predecessor_id?: string | null
          responsavel?: string | null
          sucessor_id?: string | null
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_library_state_events_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "master_library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      message_template_categories: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          key: string
          name: string
          organization_id: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          name: string
          organization_id: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          organization_id?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_template_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_template_usage: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          bloqueado: boolean
          bloqueios: Json
          case_id: string | null
          channel: string
          created_at: string
          created_by: string | null
          external_evidence_reference: string | null
          external_send_status: string
          id: string
          lead_id: string | null
          notes: string | null
          opportunity_id: string | null
          organization_id: string
          person_id: string | null
          purpose: string | null
          rendered_preview: string | null
          template_id: string
          template_version: number
          updated_at: string
          updated_by: string | null
          used_at: string
          used_by: string | null
          variables_used: Json
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueado?: boolean
          bloqueios?: Json
          case_id?: string | null
          channel: string
          created_at?: string
          created_by?: string | null
          external_evidence_reference?: string | null
          external_send_status?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          organization_id: string
          person_id?: string | null
          purpose?: string | null
          rendered_preview?: string | null
          template_id: string
          template_version: number
          updated_at?: string
          updated_by?: string | null
          used_at?: string
          used_by?: string | null
          variables_used?: Json
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueado?: boolean
          bloqueios?: Json
          case_id?: string | null
          channel?: string
          created_at?: string
          created_by?: string | null
          external_evidence_reference?: string | null
          external_send_status?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          organization_id?: string
          person_id?: string | null
          purpose?: string | null
          rendered_preview?: string | null
          template_id?: string
          template_version?: number
          updated_at?: string
          updated_by?: string | null
          used_at?: string
          used_by?: string | null
          variables_used?: Json
        }
        Relationships: [
          {
            foreignKeyName: "message_template_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_template_usage_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      message_template_versions: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          body_snapshot: string
          change_reason: string | null
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          status_snapshot: string
          subject_snapshot: string | null
          template_id: string
          updated_at: string
          updated_by: string | null
          variables_snapshot: Json
          version: number
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          body_snapshot: string
          change_reason?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          status_snapshot: string
          subject_snapshot?: string | null
          template_id: string
          updated_at?: string
          updated_by?: string | null
          variables_snapshot?: Json
          version: number
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          body_snapshot?: string
          change_reason?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          status_snapshot?: string
          subject_snapshot?: string | null
          template_id?: string
          updated_at?: string
          updated_by?: string | null
          variables_snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_template_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          audience: string
          body: string
          category_id: string
          channel: string
          created_at: string
          created_by: string | null
          effective_from: string | null
          effective_until: string | null
          id: string
          is_demo: boolean
          key: string
          name: string
          objective: string | null
          organization_id: string
          prohibited_claims: Json
          required_variables: Json
          requires_gate_validation: boolean
          requires_human_review: boolean
          safe_variables: Json
          stage_scope: string | null
          status: string
          subject: string | null
          supersedes_template_id: string | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          audience: string
          body: string
          category_id: string
          channel: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          is_demo?: boolean
          key: string
          name: string
          objective?: string | null
          organization_id: string
          prohibited_claims?: Json
          required_variables?: Json
          requires_gate_validation?: boolean
          requires_human_review?: boolean
          safe_variables?: Json
          stage_scope?: string | null
          status?: string
          subject?: string | null
          supersedes_template_id?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          audience?: string
          body?: string
          category_id?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          is_demo?: boolean
          key?: string
          name?: string
          objective?: string | null
          organization_id?: string
          prohibited_claims?: Json
          required_variables?: Json
          requires_gate_validation?: boolean
          requires_human_review?: boolean
          safe_variables?: Json
          stage_scope?: string | null
          status?: string
          subject?: string | null
          supersedes_template_id?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "message_template_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_supersedes_template_id_fkey"
            columns: ["supersedes_template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      microentregas: {
        Row: {
          caso_id: string
          created_at: string
          descricao: string | null
          entregue_em: string | null
          id: string
          prazo: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          visivel_cliente: boolean
        }
        Insert: {
          caso_id: string
          created_at?: string
          descricao?: string | null
          entregue_em?: string | null
          id?: string
          prazo?: string | null
          status?: string
          tipo?: string
          titulo: string
          updated_at?: string
          visivel_cliente?: boolean
        }
        Update: {
          caso_id?: string
          created_at?: string
          descricao?: string | null
          entregue_em?: string | null
          id?: string
          prazo?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          visivel_cliente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "microentregas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "casos"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_exceptions: {
        Row: {
          archived_at: string | null
          assigned_to: string | null
          created_at: string
          exception_type: string
          id: string
          migration_batch_id: string | null
          organization_id: string
          payload: Json
          proposed_resolution: string | null
          reason: string
          source_record_id: string | null
          source_system: string
          status: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          assigned_to?: string | null
          created_at?: string
          exception_type: string
          id?: string
          migration_batch_id?: string | null
          organization_id: string
          payload?: Json
          proposed_resolution?: string | null
          reason: string
          source_record_id?: string | null
          source_system: string
          status?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          assigned_to?: string | null
          created_at?: string
          exception_type?: string
          id?: string
          migration_batch_id?: string | null
          organization_id?: string
          payload?: Json
          proposed_resolution?: string | null
          reason?: string
          source_record_id?: string | null
          source_system?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "migration_exceptions_migration_batch_id_fkey"
            columns: ["migration_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      military_records: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "military_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_records_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      name_variants: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          estado_validacao: string
          evidence_id: string | null
          id: string
          localidade: string | null
          nivel_confianca: string
          observacao_interna: string | null
          organization_id: string
          periodo: string | null
          person_id: string
          source_id: string | null
          tipo: string
          updated_at: string
          updated_by: string | null
          variante: string
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          estado_validacao?: string
          evidence_id?: string | null
          id?: string
          localidade?: string | null
          nivel_confianca?: string
          observacao_interna?: string | null
          organization_id: string
          periodo?: string | null
          person_id: string
          source_id?: string | null
          tipo: string
          updated_at?: string
          updated_by?: string | null
          variante: string
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          estado_validacao?: string
          evidence_id?: string | null
          id?: string
          localidade?: string | null
          nivel_confianca?: string
          observacao_interna?: string | null
          organization_id?: string
          periodo?: string | null
          person_id?: string
          source_id?: string | null
          tipo?: string
          updated_at?: string
          updated_by?: string | null
          variante?: string
        }
        Relationships: [
          {
            foreignKeyName: "name_variants_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "name_variants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "name_variants_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "name_variants_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      notarial_records: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notarial_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notarial_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notarial_records_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notarial_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notarial_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notarial_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notarial_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notarial_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      nucleo_membros: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          cliente_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          id: string
          nome: string
          nucleo_id: string
          ordem: number
          organization_id: string
          papel: string
          papel_no_caso: string | null
          processo: string | null
          representacao_documentada: boolean
          representacao_necessaria: boolean
          status_cadastral: string
          updated_at: string
          updated_by: string | null
          vinculo: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          cliente_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nome: string
          nucleo_id: string
          ordem?: number
          organization_id: string
          papel: string
          papel_no_caso?: string | null
          processo?: string | null
          representacao_documentada?: boolean
          representacao_necessaria?: boolean
          status_cadastral?: string
          updated_at?: string
          updated_by?: string | null
          vinculo?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          cliente_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nome?: string
          nucleo_id?: string
          ordem?: number
          organization_id?: string
          papel?: string
          papel_no_caso?: string | null
          processo?: string | null
          representacao_documentada?: boolean
          representacao_necessaria?: boolean
          status_cadastral?: string
          updated_at?: string
          updated_by?: string | null
          vinculo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nucleo_membros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_membros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_membros_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_membros_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_membros_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nucleos_familiares: {
        Row: {
          ambiente: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          contratante_contact_id: string | null
          contratante_nome: string | null
          created_at: string
          created_by: string | null
          descricao: string | null
          dossie_mae: string | null
          dossie_status: string
          id: string
          link_interno: string | null
          nivel_acesso: string | null
          nome: string
          organization_id: string
          responsavel_nome: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ambiente?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          contratante_contact_id?: string | null
          contratante_nome?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          dossie_mae?: string | null
          dossie_status?: string
          id?: string
          link_interno?: string | null
          nivel_acesso?: string | null
          nome: string
          organization_id: string
          responsavel_nome?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ambiente?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          contratante_contact_id?: string | null
          contratante_nome?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          dossie_mae?: string | null
          dossie_status?: string
          id?: string
          link_interno?: string | null
          nivel_acesso?: string | null
          nome?: string
          organization_id?: string
          responsavel_nome?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nucleos_familiares_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleos_familiares_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleos_familiares_contratante_contact_id_fkey"
            columns: ["contratante_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleos_familiares_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      occupations_assets: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "occupations_assets_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupations_assets_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupations_assets_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupations_assets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupations_assets_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupations_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupations_assets_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupations_assets_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checklist: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          bloqueio_codigo: string | null
          case_id: string
          concluido_em: string | null
          concluido_por: string | null
          created_at: string
          created_by: string | null
          descricao_interna: string | null
          evidencia_referencia_interna: string | null
          id: string
          item_code: string
          label: string
          obrigatorio: boolean
          observacao: string | null
          ordem: number
          organization_id: string
          responsavel_user_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio_codigo?: string | null
          case_id: string
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          created_by?: string | null
          descricao_interna?: string | null
          evidencia_referencia_interna?: string | null
          id?: string
          item_code: string
          label: string
          obrigatorio?: boolean
          observacao?: string | null
          ordem?: number
          organization_id: string
          responsavel_user_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio_codigo?: string | null
          case_id?: string
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          created_by?: string | null
          descricao_interna?: string | null
          evidencia_referencia_interna?: string | null
          id?: string
          item_code?: string
          label?: string
          obrigatorio?: boolean
          observacao?: string | null
          ordem?: number
          organization_id?: string
          responsavel_user_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklist_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklist_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_planos: {
        Row: {
          ambiente_autorizado: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          checklist_inicial: Json
          created_at: string
          created_by: string | null
          dossie_mae_referencia: string | null
          dossie_mae_status: string
          estado: string
          grupo_familiar_status: string
          id: string
          inicio_previsto: string | null
          motivos_bloqueio: Json
          nivel_acesso: string | null
          observacao_interna: string | null
          organization_id: string
          plano_acao: Json
          primeira_microentrega_descricao: string | null
          primeira_microentrega_prazo_dias: number
          responsavel_principal: string | null
          template_id: string | null
          touchpoints: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ambiente_autorizado?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          checklist_inicial?: Json
          created_at?: string
          created_by?: string | null
          dossie_mae_referencia?: string | null
          dossie_mae_status?: string
          estado?: string
          grupo_familiar_status?: string
          id?: string
          inicio_previsto?: string | null
          motivos_bloqueio?: Json
          nivel_acesso?: string | null
          observacao_interna?: string | null
          organization_id: string
          plano_acao?: Json
          primeira_microentrega_descricao?: string | null
          primeira_microentrega_prazo_dias?: number
          responsavel_principal?: string | null
          template_id?: string | null
          touchpoints?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ambiente_autorizado?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          checklist_inicial?: Json
          created_at?: string
          created_by?: string | null
          dossie_mae_referencia?: string | null
          dossie_mae_status?: string
          estado?: string
          grupo_familiar_status?: string
          id?: string
          inicio_previsto?: string | null
          motivos_bloqueio?: Json
          nivel_acesso?: string | null
          observacao_interna?: string | null
          organization_id?: string
          plano_acao?: Json
          primeira_microentrega_descricao?: string | null
          primeira_microentrega_prazo_dias?: number
          responsavel_principal?: string | null
          template_id?: string | null
          touchpoints?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_planos_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_planos_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_planos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_planos_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_template_items: {
        Row: {
          archived_at: string | null
          created_at: string
          descricao: string | null
          fase: string
          id: string
          item: string
          obrigatorio: boolean
          ordem: number
          organization_id: string
          prazo_dias: number | null
          template_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          descricao?: string | null
          fase: string
          id?: string
          item: string
          obrigatorio?: boolean
          ordem?: number
          organization_id: string
          prazo_dias?: number | null
          template_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          descricao?: string | null
          fase?: string
          id?: string
          item?: string
          obrigatorio?: boolean
          ordem?: number
          organization_id?: string
          prazo_dias?: number | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          active: boolean
          archived_at: string | null
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          organization_id: string
          updated_at: string
          versao: string
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          organization_id: string
          updated_at?: string
          versao?: string
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          organization_id?: string
          updated_at?: string
          versao?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          bloqueio_interno: string | null
          case_id: string | null
          citizenship_track_id: string | null
          contact_id: string
          created_at: string
          created_by: string | null
          etapa_comercial: string
          id: string
          lead_id: string | null
          objetivo_declarado: string
          organization_id: string
          pais_linha_prioritaria: string | null
          prazo_proxima_acao: string | null
          proxima_acao: string | null
          responsavel_nome: string | null
          responsavel_user_id: string | null
          resumo_interno: string | null
          updated_at: string
          updated_by: string | null
          via_preliminar: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio_interno?: string | null
          case_id?: string | null
          citizenship_track_id?: string | null
          contact_id: string
          created_at?: string
          created_by?: string | null
          etapa_comercial?: string
          id?: string
          lead_id?: string | null
          objetivo_declarado: string
          organization_id: string
          pais_linha_prioritaria?: string | null
          prazo_proxima_acao?: string | null
          proxima_acao?: string | null
          responsavel_nome?: string | null
          responsavel_user_id?: string | null
          resumo_interno?: string | null
          updated_at?: string
          updated_by?: string | null
          via_preliminar?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio_interno?: string | null
          case_id?: string | null
          citizenship_track_id?: string | null
          contact_id?: string
          created_at?: string
          created_by?: string | null
          etapa_comercial?: string
          id?: string
          lead_id?: string | null
          objetivo_declarado?: string
          organization_id?: string
          pais_linha_prioritaria?: string | null
          prazo_proxima_acao?: string | null
          proxima_acao?: string | null
          responsavel_nome?: string | null
          responsavel_user_id?: string | null
          resumo_interno?: string | null
          updated_at?: string
          updated_by?: string | null
          via_preliminar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_citizenship_track_id_fkey"
            columns: ["citizenship_track_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_excecoes: {
        Row: {
          autorizado_em: string
          autorizado_por: string | null
          caso_id: string | null
          consumida_em: string | null
          created_at: string
          created_by: string | null
          id: string
          motivo: string
          organization_id: string
          referencia_entidade: string | null
          referencia_id: string | null
          tipo: string
          updated_at: string
          updated_by: string | null
          valido_ate: string | null
        }
        Insert: {
          autorizado_em?: string
          autorizado_por?: string | null
          caso_id?: string | null
          consumida_em?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          motivo: string
          organization_id: string
          referencia_entidade?: string | null
          referencia_id?: string | null
          tipo: string
          updated_at?: string
          updated_by?: string | null
          valido_ate?: string | null
        }
        Update: {
          autorizado_em?: string
          autorizado_por?: string | null
          caso_id?: string | null
          consumida_em?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          motivo?: string
          organization_id?: string
          referencia_entidade?: string | null
          referencia_id?: string | null
          tipo?: string
          updated_at?: string
          updated_by?: string | null
          valido_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ops_excecoes_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_excecoes_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_excecoes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_microentregas: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          caso_id: string
          concluida_em: string | null
          concluida_por: string | null
          created_at: string
          created_by: string | null
          criterio_aceite: string | null
          descricao: string | null
          evidencia_descricao: string | null
          evidencia_url: string | null
          excecao_id: string | null
          fase: string
          id: string
          justificativa_sem_evidencia: string | null
          organization_id: string
          prazo: string | null
          prioridade: string
          responsavel_id: string | null
          status: string
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id: string
          concluida_em?: string | null
          concluida_por?: string | null
          created_at?: string
          created_by?: string | null
          criterio_aceite?: string | null
          descricao?: string | null
          evidencia_descricao?: string | null
          evidencia_url?: string | null
          excecao_id?: string | null
          fase?: string
          id?: string
          justificativa_sem_evidencia?: string | null
          organization_id: string
          prazo?: string | null
          prioridade?: string
          responsavel_id?: string | null
          status?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id?: string
          concluida_em?: string | null
          concluida_por?: string | null
          created_at?: string
          created_by?: string | null
          criterio_aceite?: string | null
          descricao?: string | null
          evidencia_descricao?: string | null
          evidencia_url?: string | null
          excecao_id?: string | null
          fase?: string
          id?: string
          justificativa_sem_evidencia?: string | null
          organization_id?: string
          prazo?: string | null
          prioridade?: string
          responsavel_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ops_microentregas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_microentregas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_microentregas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_sla_regras: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          horas_alerta: number
          horas_alvo: number
          id: string
          observacoes: string | null
          organization_id: string
          prioridade: string
          tipo_tarefa: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          horas_alerta?: number
          horas_alvo?: number
          id?: string
          observacoes?: string | null
          organization_id: string
          prioridade?: string
          tipo_tarefa?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          horas_alerta?: number
          horas_alvo?: number
          id?: string
          observacoes?: string | null
          organization_id?: string
          prioridade?: string
          tipo_tarefa?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ops_sla_regras_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          id: string
          organization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          id?: string
          organization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          demo: boolean
          id: string
          nome: string
          slug: string
          updated_at: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          demo?: boolean
          id?: string
          nome: string
          slug: string
          updated_at?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          demo?: boolean
          id?: string
          nome?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      owner_override_events: {
        Row: {
          acao: string
          acao_externa: boolean
          actor_papel: string
          actor_user_id: string
          anexos: Json
          campo: string | null
          categoria: string
          confirmacao_manual: boolean
          conteudo_resumo: string | null
          created_at: string
          dados_enviados: Json | null
          dados_teste: boolean
          destinatario: string | null
          entidade: string
          entidade_id: string | null
          executado: boolean
          fonte: string | null
          id: string
          impacto: string | null
          irreversivel: boolean
          modulo: string | null
          motivo: string
          operacao: string | null
          organization_id: string
          pendencias_assumidas: Json
          valor_anterior: Json | null
          valor_financeiro: number | null
          valor_novo: Json | null
        }
        Insert: {
          acao: string
          acao_externa?: boolean
          actor_papel?: string
          actor_user_id?: string
          anexos?: Json
          campo?: string | null
          categoria: string
          confirmacao_manual?: boolean
          conteudo_resumo?: string | null
          created_at?: string
          dados_enviados?: Json | null
          dados_teste?: boolean
          destinatario?: string | null
          entidade: string
          entidade_id?: string | null
          executado?: boolean
          fonte?: string | null
          id?: string
          impacto?: string | null
          irreversivel?: boolean
          modulo?: string | null
          motivo: string
          operacao?: string | null
          organization_id: string
          pendencias_assumidas?: Json
          valor_anterior?: Json | null
          valor_financeiro?: number | null
          valor_novo?: Json | null
        }
        Update: {
          acao?: string
          acao_externa?: boolean
          actor_papel?: string
          actor_user_id?: string
          anexos?: Json
          campo?: string | null
          categoria?: string
          confirmacao_manual?: boolean
          conteudo_resumo?: string | null
          created_at?: string
          dados_enviados?: Json | null
          dados_teste?: boolean
          destinatario?: string | null
          entidade?: string
          entidade_id?: string | null
          executado?: boolean
          fonte?: string | null
          id?: string
          impacto?: string | null
          irreversivel?: boolean
          modulo?: string | null
          motivo?: string
          operacao?: string | null
          organization_id?: string
          pendencias_assumidas?: Json
          valor_anterior?: Json | null
          valor_financeiro?: number | null
          valor_novo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_override_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          conciliacao_status: string
          created_at: string
          created_by: string | null
          dados_teste: boolean
          id: string
          invoice_id: string | null
          metodo: string | null
          moeda: string
          organization_id: string
          pago_em: string | null
          referencia_externa: string | null
          status: string
          updated_at: string
          updated_by: string | null
          valor: number
          vencimento: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          conciliacao_status?: string
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          id?: string
          invoice_id?: string | null
          metodo?: string | null
          moeda?: string
          organization_id: string
          pago_em?: string | null
          referencia_externa?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor?: number
          vencimento?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          conciliacao_status?: string
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          id?: string
          invoice_id?: string | null
          metodo?: string | null
          moeda?: string
          organization_id?: string
          pago_em?: string | null
          referencia_externa?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      piloto_bloqueios: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          chave: string
          created_at: string
          created_by: string | null
          criticidade: string
          descricao: string
          id: string
          justificativa: string | null
          organization_id: string
          resolvido_em: string | null
          resolvido_por: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          chave: string
          created_at?: string
          created_by?: string | null
          criticidade?: string
          descricao: string
          id?: string
          justificativa?: string | null
          organization_id: string
          resolvido_em?: string | null
          resolvido_por?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          chave?: string
          created_at?: string
          created_by?: string | null
          criticidade?: string
          descricao?: string
          id?: string
          justificativa?: string | null
          organization_id?: string
          resolvido_em?: string | null
          resolvido_por?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "piloto_bloqueios_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piloto_bloqueios_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piloto_bloqueios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      piloto_conferencia: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          campo: string
          case_id: string
          created_at: string
          created_by: string | null
          id: string
          label: string
          obrigatorio: boolean
          observacao: string | null
          organization_id: string
          origem: string | null
          origem_detalhe: string | null
          secao: string
          updated_at: string
          updated_by: string | null
          valor: string | null
          verificado: boolean
          verificado_em: string | null
          verificado_por: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          campo: string
          case_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          obrigatorio?: boolean
          observacao?: string | null
          organization_id: string
          origem?: string | null
          origem_detalhe?: string | null
          secao: string
          updated_at?: string
          updated_by?: string | null
          valor?: string | null
          verificado?: boolean
          verificado_em?: string | null
          verificado_por?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          campo?: string
          case_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          obrigatorio?: boolean
          observacao?: string | null
          organization_id?: string
          origem?: string | null
          origem_detalhe?: string | null
          secao?: string
          updated_at?: string
          updated_by?: string | null
          valor?: string | null
          verificado?: boolean
          verificado_em?: string | null
          verificado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "piloto_conferencia_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piloto_conferencia_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piloto_conferencia_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_catalog_feed: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          commercial_model: string | null
          country_scope: string[]
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          journey_phase_default: string | null
          legacy_aliases: string[]
          name: string
          organization_id: string
          prefix: string
          price_status: string | null
          product_parent: string | null
          reconciliation_note: string | null
          requires_case_gate: boolean
          source_artifact: string
          source_version: string
          status_dictionary: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          commercial_model?: string | null
          country_scope?: string[]
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          journey_phase_default?: string | null
          legacy_aliases?: string[]
          name: string
          organization_id: string
          prefix: string
          price_status?: string | null
          product_parent?: string | null
          reconciliation_note?: string | null
          requires_case_gate?: boolean
          source_artifact: string
          source_version: string
          status_dictionary: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          commercial_model?: string | null
          country_scope?: string[]
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          journey_phase_default?: string | null
          legacy_aliases?: string[]
          name?: string
          organization_id?: string
          prefix?: string
          price_status?: string | null
          product_parent?: string | null
          reconciliation_note?: string | null
          requires_case_gate?: boolean
          source_artifact?: string
          source_version?: string
          status_dictionary?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_catalog_feed_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_tarefas: {
        Row: {
          caso_id: string
          concluida_em: string | null
          created_at: string
          etapa: string
          id: string
          observacao: string | null
          prazo: string | null
          prioridade: string
          responsavel: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          caso_id: string
          concluida_em?: string | null
          created_at?: string
          etapa?: string
          id?: string
          observacao?: string | null
          prazo?: string | null
          prioridade?: string
          responsavel?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          caso_id?: string
          concluida_em?: string | null
          created_at?: string
          etapa?: string
          id?: string
          observacao?: string | null
          prazo?: string | null
          prioridade?: string
          responsavel?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_tarefas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "casos"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_document_requests: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          categoria: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          descricao: string | null
          document_id: string | null
          finalidade: string | null
          id: string
          motivo_recusa: string | null
          obrigatorio: boolean
          organization_id: string
          participante_id: string | null
          participante_nome: string | null
          prazo: string | null
          responsavel_id: string | null
          status: string
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          categoria?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          document_id?: string | null
          finalidade?: string | null
          id?: string
          motivo_recusa?: string | null
          obrigatorio?: boolean
          organization_id: string
          participante_id?: string | null
          participante_nome?: string | null
          prazo?: string | null
          responsavel_id?: string | null
          status?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          categoria?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          document_id?: string | null
          finalidade?: string | null
          id?: string
          motivo_recusa?: string | null
          obrigatorio?: boolean
          organization_id?: string
          participante_id?: string | null
          participante_nome?: string | null
          prazo?: string | null
          responsavel_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_document_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_document_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_document_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_document_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_document_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_document_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_ticket_messages: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          autor_tipo: string
          autor_user_id: string | null
          corpo: string
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          ticket_id: string
          updated_at: string
          updated_by: string | null
          visivel_cliente: boolean
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          autor_tipo: string
          autor_user_id?: string | null
          corpo: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          ticket_id: string
          updated_at?: string
          updated_by?: string | null
          visivel_cliente?: boolean
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          autor_tipo?: string
          autor_user_id?: string | null
          corpo?: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          ticket_id?: string
          updated_at?: string
          updated_by?: string | null
          visivel_cliente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "portal_ticket_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "portal_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_tickets: {
        Row: {
          aberto_por: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          assunto: string
          case_id: string
          categoria: string
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          origem: string
          responsavel_id: string | null
          status: string
          ultima_mensagem_em: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aberto_por?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assunto: string
          case_id: string
          categoria?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          origem?: string
          responsavel_id?: string | null
          status?: string
          ultima_mensagem_em?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aberto_por?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assunto?: string
          case_id?: string
          categoria?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          origem?: string
          responsavel_id?: string | null
          status?: string
          ultima_mensagem_em?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_tickets_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_tickets_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      preserved_objects: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preserved_objects_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preserved_objects_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preserved_objects_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preserved_objects_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preserved_objects_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preserved_objects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preserved_objects_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preserved_objects_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      price_catalog_rescued: {
        Row: {
          amount: number | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_only: boolean
          country_code: string | null
          created_at: string
          created_by: string | null
          currency: string
          effective_from: string | null
          effective_to: string | null
          id: string
          item_id: string | null
          notes: string | null
          organization_id: string
          phase: string | null
          price_component: string
          price_status: string
          source_date: string | null
          source_reference: string
          source_type: string
        }
        Insert: {
          amount?: number | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_only?: boolean
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          organization_id: string
          phase?: string | null
          price_component: string
          price_status: string
          source_date?: string | null
          source_reference: string
          source_type: string
        }
        Update: {
          amount?: number | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_only?: boolean
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          organization_id?: string
          phase?: string | null
          price_component?: string
          price_status?: string
          source_date?: string | null
          source_reference?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_catalog_rescued_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_alerts: {
        Row: {
          case_id: string | null
          client_id: string | null
          consent_id: string | null
          created_at: string
          id: string
          mensagem: string
          organization_id: string
          resolvido_em: string | null
          resolvido_por: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          consent_id?: string | null
          created_at?: string
          id?: string
          mensagem: string
          organization_id: string
          resolvido_em?: string | null
          resolvido_por?: string | null
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          consent_id?: string | null
          created_at?: string
          id?: string
          mensagem?: string
          organization_id?: string
          resolvido_em?: string | null
          resolvido_por?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_alerts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_alerts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_alerts_consent_id_fkey"
            columns: ["consent_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_catalog: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          ativo: boolean
          auditoria_origem: Json
          canal_fechamento_fonte: string | null
          categoria_fonte: string | null
          code: string
          condicao_comercial_padrao: string | null
          condicao_comercial_vigente: string | null
          created_at: string
          created_by: string | null
          dados_teste: boolean
          data_ultima_validacao: string | null
          dependencias_externas: Json
          descricao_curta_fonte: string | null
          divergencia: string | null
          elegivel_para_proposta: boolean
          entregas_principais: string | null
          entregaveis: Json
          escopo_aplicavel: Json
          escopo_aprovado: string | null
          estado_catalogo: string
          estado_reconciliacao: string
          exclusoes: Json
          exige_case_service: boolean
          exige_justificativa_escopo: boolean
          faixa_prioridade: string
          familia_comercial: string | null
          familia_fonte: string | null
          fonte_aba: string | null
          fonte_arquivo: string | null
          fonte_linha: number | null
          fonte_versao: string | null
          gera_comunicacao_automatica: boolean
          homologado_em: string | null
          homologado_por: string | null
          id: string
          importado_em: string | null
          inclusoes: Json
          jornada_fase: string | null
          link_asaas_fonte: string | null
          link_asaas_validado: string | null
          moeda: string
          nome_comercial: string
          observacao_de_governanca: string | null
          organization_id: string
          origem_legada_referencia: string | null
          papel_comercial: string | null
          parcelas_padrao: number | null
          pareto_classificacao: string | null
          permite_recorrencia: boolean
          planilha_mestre_identificador: string | null
          planilha_mestre_versao: string | null
          prazo_fonte_formal: string | null
          pre_requisitos: Json
          preco_atual_fonte: number | null
          preco_comercial_vigente: number | null
          preco_estado_homologacao: string
          preco_fonte: string | null
          preco_historico_legado: number | null
          preco_sugerido_fonte: number | null
          prioridade_catalogo: string
          prioridade_portfolio: string
          produto_pai_id: string | null
          regra_uso: string | null
          regras_anexos: Json
          requer_fechamento_humano: boolean
          responsavel_comercial: string | null
          responsavel_homologacao: string | null
          responsavel_operacional: string | null
          responsavel_validacao_fonte: string | null
          status_fonte: string | null
          status_homologacao: string
          status_link_asaas: string
          status_link_asaas_fonte: string | null
          status_produto: string
          subcategoria_fonte: string | null
          substituido_por: string | null
          tipo_cobranca: string
          tipo_fonte: string | null
          tipo_oferta: string
          updated_at: string
          updated_by: string | null
          versao_catalogo: string
          versao_vigencia: string | null
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativo?: boolean
          auditoria_origem?: Json
          canal_fechamento_fonte?: string | null
          categoria_fonte?: string | null
          code: string
          condicao_comercial_padrao?: string | null
          condicao_comercial_vigente?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          data_ultima_validacao?: string | null
          dependencias_externas?: Json
          descricao_curta_fonte?: string | null
          divergencia?: string | null
          elegivel_para_proposta?: boolean
          entregas_principais?: string | null
          entregaveis?: Json
          escopo_aplicavel?: Json
          escopo_aprovado?: string | null
          estado_catalogo?: string
          estado_reconciliacao?: string
          exclusoes?: Json
          exige_case_service?: boolean
          exige_justificativa_escopo?: boolean
          faixa_prioridade?: string
          familia_comercial?: string | null
          familia_fonte?: string | null
          fonte_aba?: string | null
          fonte_arquivo?: string | null
          fonte_linha?: number | null
          fonte_versao?: string | null
          gera_comunicacao_automatica?: boolean
          homologado_em?: string | null
          homologado_por?: string | null
          id?: string
          importado_em?: string | null
          inclusoes?: Json
          jornada_fase?: string | null
          link_asaas_fonte?: string | null
          link_asaas_validado?: string | null
          moeda?: string
          nome_comercial: string
          observacao_de_governanca?: string | null
          organization_id: string
          origem_legada_referencia?: string | null
          papel_comercial?: string | null
          parcelas_padrao?: number | null
          pareto_classificacao?: string | null
          permite_recorrencia?: boolean
          planilha_mestre_identificador?: string | null
          planilha_mestre_versao?: string | null
          prazo_fonte_formal?: string | null
          pre_requisitos?: Json
          preco_atual_fonte?: number | null
          preco_comercial_vigente?: number | null
          preco_estado_homologacao?: string
          preco_fonte?: string | null
          preco_historico_legado?: number | null
          preco_sugerido_fonte?: number | null
          prioridade_catalogo?: string
          prioridade_portfolio?: string
          produto_pai_id?: string | null
          regra_uso?: string | null
          regras_anexos?: Json
          requer_fechamento_humano?: boolean
          responsavel_comercial?: string | null
          responsavel_homologacao?: string | null
          responsavel_operacional?: string | null
          responsavel_validacao_fonte?: string | null
          status_fonte?: string | null
          status_homologacao?: string
          status_link_asaas?: string
          status_link_asaas_fonte?: string | null
          status_produto?: string
          subcategoria_fonte?: string | null
          substituido_por?: string | null
          tipo_cobranca?: string
          tipo_fonte?: string | null
          tipo_oferta?: string
          updated_at?: string
          updated_by?: string | null
          versao_catalogo?: string
          versao_vigencia?: string | null
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativo?: boolean
          auditoria_origem?: Json
          canal_fechamento_fonte?: string | null
          categoria_fonte?: string | null
          code?: string
          condicao_comercial_padrao?: string | null
          condicao_comercial_vigente?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          data_ultima_validacao?: string | null
          dependencias_externas?: Json
          descricao_curta_fonte?: string | null
          divergencia?: string | null
          elegivel_para_proposta?: boolean
          entregas_principais?: string | null
          entregaveis?: Json
          escopo_aplicavel?: Json
          escopo_aprovado?: string | null
          estado_catalogo?: string
          estado_reconciliacao?: string
          exclusoes?: Json
          exige_case_service?: boolean
          exige_justificativa_escopo?: boolean
          faixa_prioridade?: string
          familia_comercial?: string | null
          familia_fonte?: string | null
          fonte_aba?: string | null
          fonte_arquivo?: string | null
          fonte_linha?: number | null
          fonte_versao?: string | null
          gera_comunicacao_automatica?: boolean
          homologado_em?: string | null
          homologado_por?: string | null
          id?: string
          importado_em?: string | null
          inclusoes?: Json
          jornada_fase?: string | null
          link_asaas_fonte?: string | null
          link_asaas_validado?: string | null
          moeda?: string
          nome_comercial?: string
          observacao_de_governanca?: string | null
          organization_id?: string
          origem_legada_referencia?: string | null
          papel_comercial?: string | null
          parcelas_padrao?: number | null
          pareto_classificacao?: string | null
          permite_recorrencia?: boolean
          planilha_mestre_identificador?: string | null
          planilha_mestre_versao?: string | null
          prazo_fonte_formal?: string | null
          pre_requisitos?: Json
          preco_atual_fonte?: number | null
          preco_comercial_vigente?: number | null
          preco_estado_homologacao?: string
          preco_fonte?: string | null
          preco_historico_legado?: number | null
          preco_sugerido_fonte?: number | null
          prioridade_catalogo?: string
          prioridade_portfolio?: string
          produto_pai_id?: string | null
          regra_uso?: string | null
          regras_anexos?: Json
          requer_fechamento_humano?: boolean
          responsavel_comercial?: string | null
          responsavel_homologacao?: string | null
          responsavel_operacional?: string | null
          responsavel_validacao_fonte?: string | null
          status_fonte?: string | null
          status_homologacao?: string
          status_link_asaas?: string
          status_link_asaas_fonte?: string | null
          status_produto?: string
          subcategoria_fonte?: string | null
          substituido_por?: string | null
          tipo_cobranca?: string
          tipo_fonte?: string | null
          tipo_oferta?: string
          updated_at?: string
          updated_by?: string | null
          versao_catalogo?: string
          versao_vigencia?: string | null
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_catalog_produto_pai_id_fkey"
            columns: ["produto_pai_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_catalog_substituido_por_fkey"
            columns: ["substituido_por"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposal_canva_pages: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          campos_nao_localizados: string[]
          case_id: string | null
          created_at: string
          created_by: string | null
          extracao_status: string
          extraido_em: string
          extraido_por: string | null
          id: string
          observacao_interna: string | null
          organization_id: string
          page_content_structured: Json
          page_number: number
          proposal_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          campos_nao_localizados?: string[]
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          extracao_status?: string
          extraido_em?: string
          extraido_por?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id: string
          page_content_structured?: Json
          page_number: number
          proposal_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          campos_nao_localizados?: string[]
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          extracao_status?: string
          extraido_em?: string
          extraido_por?: string | null
          id?: string
          observacao_interna?: string | null
          organization_id?: string
          page_content_structured?: Json
          page_number?: number
          proposal_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_canva_pages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_canva_pages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_canva_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_canva_pages_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          aprovada_em: string | null
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          dados_teste: boolean
          deck_referencia_interna: string | null
          derivada_de_id: string | null
          enviada_em: string | null
          escopo: string | null
          escopo_estruturado: Json | null
          escopo_paginas: Json
          exclusoes: string | null
          extracao_em: string | null
          extracao_por: string | null
          extracao_status: string
          forma_pagamento: string | null
          id: string
          lead_id: string | null
          moeda: string
          observacoes_cliente: string | null
          observacoes_internas: string | null
          organization_id: string
          origem: string
          origem_referencia: string | null
          paginas_registradas: number[]
          plan_id: string | null
          preco_fonte_referencia: string | null
          product_catalog_id: string | null
          recusada_em: string | null
          responsavel_comercial: string | null
          responsavel_operacional: string | null
          restauracao_motivo: string | null
          restaurado_em: string | null
          restaurado_por: string | null
          status: string
          substituida_em: string | null
          substituida_por_id: string | null
          updated_at: string
          updated_by: string | null
          validade: string | null
          validade_renovada_em: string | null
          validade_renovada_motivo: string | null
          validade_renovada_por: string | null
          valor: number
          versao: number
        }
        Insert: {
          aprovada_em?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          deck_referencia_interna?: string | null
          derivada_de_id?: string | null
          enviada_em?: string | null
          escopo?: string | null
          escopo_estruturado?: Json | null
          escopo_paginas?: Json
          exclusoes?: string | null
          extracao_em?: string | null
          extracao_por?: string | null
          extracao_status?: string
          forma_pagamento?: string | null
          id?: string
          lead_id?: string | null
          moeda?: string
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          organization_id: string
          origem?: string
          origem_referencia?: string | null
          paginas_registradas?: number[]
          plan_id?: string | null
          preco_fonte_referencia?: string | null
          product_catalog_id?: string | null
          recusada_em?: string | null
          responsavel_comercial?: string | null
          responsavel_operacional?: string | null
          restauracao_motivo?: string | null
          restaurado_em?: string | null
          restaurado_por?: string | null
          status?: string
          substituida_em?: string | null
          substituida_por_id?: string | null
          updated_at?: string
          updated_by?: string | null
          validade?: string | null
          validade_renovada_em?: string | null
          validade_renovada_motivo?: string | null
          validade_renovada_por?: string | null
          valor?: number
          versao?: number
        }
        Update: {
          aprovada_em?: string | null
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          deck_referencia_interna?: string | null
          derivada_de_id?: string | null
          enviada_em?: string | null
          escopo?: string | null
          escopo_estruturado?: Json | null
          escopo_paginas?: Json
          exclusoes?: string | null
          extracao_em?: string | null
          extracao_por?: string | null
          extracao_status?: string
          forma_pagamento?: string | null
          id?: string
          lead_id?: string | null
          moeda?: string
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          organization_id?: string
          origem?: string
          origem_referencia?: string | null
          paginas_registradas?: number[]
          plan_id?: string | null
          preco_fonte_referencia?: string | null
          product_catalog_id?: string | null
          recusada_em?: string | null
          responsavel_comercial?: string | null
          responsavel_operacional?: string | null
          restauracao_motivo?: string | null
          restaurado_em?: string | null
          restaurado_por?: string | null
          status?: string
          substituida_em?: string | null
          substituida_por_id?: string | null
          updated_at?: string
          updated_by?: string | null
          validade?: string | null
          validade_renovada_em?: string | null
          validade_renovada_motivo?: string | null
          validade_renovada_por?: string | null
          valor?: number
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_derivada_de_id_fkey"
            columns: ["derivada_de_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "case_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_product_catalog_id_fkey"
            columns: ["product_catalog_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_substituida_por_id_fkey"
            columns: ["substituida_por_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checklist_templates: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          descricao: string | null
          fase: string
          id: string
          item_key: string
          label: string
          obrigatorio: boolean
          ordem: number
          organization_id: string
          tipo_servico: string
          updated_at: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          fase?: string
          id?: string
          item_key: string
          label: string
          obrigatorio?: boolean
          ordem?: number
          organization_id: string
          tipo_servico?: string
          updated_at?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          fase?: string
          id?: string
          item_key?: string
          label?: string
          obrigatorio?: boolean
          ordem?: number
          organization_id?: string
          tipo_servico?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checklist_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_exports: {
        Row: {
          campos: string[]
          conjunto: string
          exportado_em: string
          exportado_por: string
          filtros: Json
          id: string
          linhas: number
          organization_id: string
        }
        Insert: {
          campos: string[]
          conjunto: string
          exportado_em?: string
          exportado_por: string
          filtros?: Json
          id?: string
          linhas?: number
          organization_id: string
        }
        Update: {
          campos?: string[]
          conjunto?: string
          exportado_em?: string
          exportado_por?: string
          filtros?: Json
          id?: string
          linhas?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_issues: {
        Row: {
          bloqueia_ativacao: boolean
          case_id: string | null
          created_at: string
          detalhe: string | null
          detectada_em: string
          dominio: string
          entidade: string
          entidade_id: string
          exige_suspensao: boolean
          id: string
          organization_id: string
          reconhecida_em: string | null
          reconhecida_por: string | null
          regra_key: string
          resolucao_comentario: string | null
          resolucao_evidencia: string | null
          resolvida_em: string | null
          resolvida_por: string | null
          sanada_em: string | null
          severidade: string
          status: string
          titulo: string
          updated_at: string
          vista_em: string | null
        }
        Insert: {
          bloqueia_ativacao?: boolean
          case_id?: string | null
          created_at?: string
          detalhe?: string | null
          detectada_em?: string
          dominio: string
          entidade: string
          entidade_id: string
          exige_suspensao?: boolean
          id?: string
          organization_id: string
          reconhecida_em?: string | null
          reconhecida_por?: string | null
          regra_key: string
          resolucao_comentario?: string | null
          resolucao_evidencia?: string | null
          resolvida_em?: string | null
          resolvida_por?: string | null
          sanada_em?: string | null
          severidade: string
          status?: string
          titulo: string
          updated_at?: string
          vista_em?: string | null
        }
        Update: {
          bloqueia_ativacao?: boolean
          case_id?: string | null
          created_at?: string
          detalhe?: string | null
          detectada_em?: string
          dominio?: string
          entidade?: string
          entidade_id?: string
          exige_suspensao?: boolean
          id?: string
          organization_id?: string
          reconhecida_em?: string | null
          reconhecida_por?: string | null
          regra_key?: string
          resolucao_comentario?: string | null
          resolucao_evidencia?: string | null
          resolvida_em?: string | null
          resolvida_por?: string | null
          sanada_em?: string | null
          severidade?: string
          status?: string
          titulo?: string
          updated_at?: string
          vista_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_issues_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_issues_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_issues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      religious_records: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "religious_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "religious_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "religious_records_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "religious_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "religious_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "religious_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "religious_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "religious_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      report_evidence_links: {
        Row: {
          archived_at: string | null
          archived_reason: string | null
          created_at: string
          created_by: string | null
          evidence_id: string
          id: string
          observacao_interna: string | null
          organization_id: string
          relacao: string
          report_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_reason?: string | null
          created_at?: string
          created_by?: string | null
          evidence_id: string
          id?: string
          observacao_interna?: string | null
          organization_id: string
          relacao: string
          report_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_reason?: string | null
          created_at?: string
          created_by?: string | null
          evidence_id?: string
          id?: string
          observacao_interna?: string | null
          organization_id?: string
          relacao?: string
          report_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_evidence_links_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_evidence_links_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "case_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_microdelivery_links: {
        Row: {
          archived_at: string | null
          archived_reason: string | null
          created_at: string
          created_by: string | null
          id: string
          microentrega_id: string
          observacao_interna: string | null
          organization_id: string
          report_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_reason?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          microentrega_id: string
          observacao_interna?: string | null
          organization_id: string
          report_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_reason?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          microentrega_id?: string
          observacao_interna?: string | null
          organization_id?: string
          report_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_microdelivery_links_microentrega_id_fkey"
            columns: ["microentrega_id"]
            isOneToOne: false
            referencedRelation: "ops_microentregas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_microdelivery_links_microentrega_id_fkey"
            columns: ["microentrega_id"]
            isOneToOne: false
            referencedRelation: "v_ops_microentregas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_microdelivery_links_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "case_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      research_action_plan_items: {
        Row: {
          action_type: string
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          communication_draft: string | null
          communication_queue_id: string | null
          contact_result_internal: string | null
          contacted_at: string | null
          created_at: string
          created_by: string | null
          data_origin: string
          document_request_id: string | null
          due_date: string | null
          estimated_cost_amount: number | null
          estimated_cost_currency: string
          evidence_id: string | null
          expense_approval_status: string
          finding_id: string | null
          id: string
          institution_id: string | null
          internal_evidence_link: string | null
          next_action: string | null
          next_check_at: string | null
          notes_internal: string | null
          organization_id: string
          payer: string
          priority: string
          reason: string
          requires_human_approval: boolean
          research_item_id: string | null
          responsible_user_id: string | null
          status: string
          suggested_channel: string
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action_type: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          communication_draft?: string | null
          communication_queue_id?: string | null
          contact_result_internal?: string | null
          contacted_at?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          document_request_id?: string | null
          due_date?: string | null
          estimated_cost_amount?: number | null
          estimated_cost_currency?: string
          evidence_id?: string | null
          expense_approval_status?: string
          finding_id?: string | null
          id?: string
          institution_id?: string | null
          internal_evidence_link?: string | null
          next_action?: string | null
          next_check_at?: string | null
          notes_internal?: string | null
          organization_id: string
          payer?: string
          priority?: string
          reason: string
          requires_human_approval?: boolean
          research_item_id?: string | null
          responsible_user_id?: string | null
          status?: string
          suggested_channel?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action_type?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          communication_draft?: string | null
          communication_queue_id?: string | null
          contact_result_internal?: string | null
          contacted_at?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          document_request_id?: string | null
          due_date?: string | null
          estimated_cost_amount?: number | null
          estimated_cost_currency?: string
          evidence_id?: string | null
          expense_approval_status?: string
          finding_id?: string | null
          id?: string
          institution_id?: string | null
          internal_evidence_link?: string | null
          next_action?: string | null
          next_check_at?: string | null
          notes_internal?: string | null
          organization_id?: string
          payer?: string
          priority?: string
          reason?: string
          requires_human_approval?: boolean
          research_item_id?: string | null
          responsible_user_id?: string | null
          status?: string
          suggested_channel?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_action_plan_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_action_plan_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_action_plan_items_communication_queue_id_fkey"
            columns: ["communication_queue_id"]
            isOneToOne: false
            referencedRelation: "communication_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_action_plan_items_document_request_id_fkey"
            columns: ["document_request_id"]
            isOneToOne: false
            referencedRelation: "document_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_action_plan_items_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_action_plan_items_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "genealogical_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_action_plan_items_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_action_plan_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      research_audit_events: {
        Row: {
          actor_user_id: string | null
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          organization_id: string
          research_case_id: string | null
        }
        Insert: {
          actor_user_id?: string | null
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          organization_id: string
          research_case_id?: string | null
        }
        Update: {
          actor_user_id?: string | null
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          organization_id?: string
          research_case_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      research_case_events: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          confidence_level: string
          country_context: string | null
          created_at: string
          created_by: string | null
          event_date: string | null
          event_date_precision: string
          event_type: string
          id: string
          location_text: string | null
          notes_internal: string | null
          organization_id: string
          person_id: string | null
          research_case_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          confidence_level?: string
          country_context?: string | null
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          event_date_precision?: string
          event_type?: string
          id?: string
          location_text?: string | null
          notes_internal?: string | null
          organization_id: string
          person_id?: string | null
          research_case_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          confidence_level?: string
          country_context?: string | null
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          event_date_precision?: string
          event_type?: string
          id?: string
          location_text?: string | null
          notes_internal?: string | null
          organization_id?: string
          person_id?: string | null
          research_case_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_case_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_case_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_case_events_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      research_case_hypotheses: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          category: string
          client_visibility: string
          closure_reason: string | null
          confidence_level: string
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          related_event_id: string | null
          related_person_id: string | null
          related_relationship_id: string | null
          research_case_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          statement: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category?: string
          client_visibility?: string
          closure_reason?: string | null
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          related_event_id?: string | null
          related_person_id?: string | null
          related_relationship_id?: string | null
          research_case_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          statement?: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category?: string
          client_visibility?: string
          closure_reason?: string | null
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          related_event_id?: string | null
          related_person_id?: string | null
          related_relationship_id?: string | null
          research_case_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          statement?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_case_hypotheses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_case_hypotheses_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "research_case_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_case_hypotheses_related_person_id_fkey"
            columns: ["related_person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_case_hypotheses_related_relationship_id_fkey"
            columns: ["related_relationship_id"]
            isOneToOne: false
            referencedRelation: "research_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_case_hypotheses_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      research_cases: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          assigned_researcher_user_id: string | null
          authorized_scope: string | null
          case_id: string
          citizenship_track_id: string | null
          client_summary_status: string
          confidence_level: string
          country_context: string | null
          created_at: string
          created_by: string | null
          demo: boolean
          external_research_authorization_status: string
          external_research_gate_status: string
          family_id: string | null
          family_line_summary_internal: string | null
          id: string
          internal_hypothesis: string | null
          internal_risk_summary: string | null
          next_milestone: string | null
          next_research_action: string | null
          next_research_action_due_at: string | null
          organization_id: string
          research_objective: string
          research_scope_summary: string | null
          research_type: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_researcher_user_id?: string | null
          authorized_scope?: string | null
          case_id: string
          citizenship_track_id?: string | null
          client_summary_status?: string
          confidence_level?: string
          country_context?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          external_research_authorization_status?: string
          external_research_gate_status?: string
          family_id?: string | null
          family_line_summary_internal?: string | null
          id?: string
          internal_hypothesis?: string | null
          internal_risk_summary?: string | null
          next_milestone?: string | null
          next_research_action?: string | null
          next_research_action_due_at?: string | null
          organization_id: string
          research_objective?: string
          research_scope_summary?: string | null
          research_type?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_researcher_user_id?: string | null
          authorized_scope?: string | null
          case_id?: string
          citizenship_track_id?: string | null
          client_summary_status?: string
          confidence_level?: string
          country_context?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          external_research_authorization_status?: string
          external_research_gate_status?: string
          family_id?: string | null
          family_line_summary_internal?: string | null
          id?: string
          internal_hypothesis?: string | null
          internal_risk_summary?: string | null
          next_milestone?: string | null
          next_research_action?: string | null
          next_research_action_due_at?: string | null
          organization_id?: string
          research_objective?: string
          research_scope_summary?: string | null
          research_type?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_cases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_cases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_cases_citizenship_track_id_fkey"
            columns: ["citizenship_track_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      research_client_summaries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          released_at: string | null
          released_by: string | null
          research_case_id: string
          status: string
          summary_client_facing: string
          title_client_facing: string
          updated_at: string
          updated_by: string | null
          validated_facts_only: boolean
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          released_at?: string | null
          released_by?: string | null
          research_case_id: string
          status?: string
          summary_client_facing?: string
          title_client_facing: string
          updated_at?: string
          updated_by?: string | null
          validated_facts_only?: boolean
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          released_at?: string | null
          released_by?: string | null
          research_case_id?: string
          status?: string
          summary_client_facing?: string
          title_client_facing?: string
          updated_at?: string
          updated_by?: string | null
          validated_facts_only?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "research_client_summaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_client_summaries_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      research_document_requests: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          client_visible: boolean
          created_at: string
          created_by: string | null
          due_at: string | null
          external_action_required: boolean
          external_gate_status: string
          id: string
          notes_internal: string | null
          organization_id: string
          person_id: string | null
          received_at: string | null
          request_type: string
          requested_at: string | null
          requested_document_type: string
          research_case_id: string
          responsible_user_id: string | null
          status: string
          target_institution: string | null
          target_location: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          external_action_required?: boolean
          external_gate_status?: string
          id?: string
          notes_internal?: string | null
          organization_id: string
          person_id?: string | null
          received_at?: string | null
          request_type?: string
          requested_at?: string | null
          requested_document_type: string
          research_case_id: string
          responsible_user_id?: string | null
          status?: string
          target_institution?: string | null
          target_location?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          external_action_required?: boolean
          external_gate_status?: string
          id?: string
          notes_internal?: string | null
          organization_id?: string
          person_id?: string | null
          received_at?: string | null
          request_type?: string
          requested_at?: string | null
          requested_document_type?: string
          research_case_id?: string
          responsible_user_id?: string | null
          status?: string
          target_institution?: string | null
          target_location?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_document_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_document_requests_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_document_requests_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      research_events: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          confirmado: boolean
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          demo: boolean
          descricao: string | null
          evidencia_id: string | null
          hypothesis_id: string | null
          id: string
          local: string | null
          organization_id: string
          periodo_texto: string | null
          person_id: string | null
          tipo: string
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          confirmado?: boolean
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          demo?: boolean
          descricao?: string | null
          evidencia_id?: string | null
          hypothesis_id?: string | null
          id?: string
          local?: string | null
          organization_id: string
          periodo_texto?: string | null
          person_id?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          confirmado?: boolean
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          demo?: boolean
          descricao?: string | null
          evidencia_id?: string | null
          hypothesis_id?: string | null
          id?: string
          local?: string | null
          organization_id?: string
          periodo_texto?: string | null
          person_id?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_events_evidencia_id_fkey"
            columns: ["evidencia_id"]
            isOneToOne: false
            referencedRelation: "evidencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_events_hypothesis_id_fkey"
            columns: ["hypothesis_id"]
            isOneToOne: false
            referencedRelation: "research_hypotheses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
        ]
      }
      research_evidence_items: {
        Row: {
          access_level: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          client_visibility: string
          confidence_level: string
          created_at: string
          created_by: string | null
          description: string | null
          discard_reason: string | null
          document_id: string | null
          epistemic_validation_status: string | null
          event_id: string | null
          evidence_nature: string | null
          evidence_status: string
          evidence_type: string
          external_reference: string | null
          fornecida_pelo_cliente: boolean
          id: string
          legal_review_notes_internal: string | null
          legal_review_status: string | null
          negative_search_date: string | null
          negative_search_next_action: string | null
          negative_search_source: string | null
          organization_id: string
          origem_externa: boolean
          person_id: string | null
          reference_date: string | null
          reference_location: string | null
          relationship_id: string | null
          research_case_id: string
          research_item_id: string | null
          responsible_user_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sensitivity_level: string
          source_id: string | null
          storage_reference_internal: string | null
          title: string
          updated_at: string
          updated_by: string | null
          validated_at: string | null
          validated_by: string | null
          validation_rationale: string | null
          workflow_status: string | null
        }
        Insert: {
          access_level?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_visibility?: string
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discard_reason?: string | null
          document_id?: string | null
          epistemic_validation_status?: string | null
          event_id?: string | null
          evidence_nature?: string | null
          evidence_status?: string
          evidence_type?: string
          external_reference?: string | null
          fornecida_pelo_cliente?: boolean
          id?: string
          legal_review_notes_internal?: string | null
          legal_review_status?: string | null
          negative_search_date?: string | null
          negative_search_next_action?: string | null
          negative_search_source?: string | null
          organization_id: string
          origem_externa?: boolean
          person_id?: string | null
          reference_date?: string | null
          reference_location?: string | null
          relationship_id?: string | null
          research_case_id: string
          research_item_id?: string | null
          responsible_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sensitivity_level?: string
          source_id?: string | null
          storage_reference_internal?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_rationale?: string | null
          workflow_status?: string | null
        }
        Update: {
          access_level?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_visibility?: string
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discard_reason?: string | null
          document_id?: string | null
          epistemic_validation_status?: string | null
          event_id?: string | null
          evidence_nature?: string | null
          evidence_status?: string
          evidence_type?: string
          external_reference?: string | null
          fornecida_pelo_cliente?: boolean
          id?: string
          legal_review_notes_internal?: string | null
          legal_review_status?: string | null
          negative_search_date?: string | null
          negative_search_next_action?: string | null
          negative_search_source?: string | null
          organization_id?: string
          origem_externa?: boolean
          person_id?: string | null
          reference_date?: string | null
          reference_location?: string | null
          relationship_id?: string | null
          research_case_id?: string
          research_item_id?: string | null
          responsible_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sensitivity_level?: string
          source_id?: string | null
          storage_reference_internal?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_rationale?: string | null
          workflow_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_evidence_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_evidence_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "research_case_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_evidence_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_evidence_items_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_evidence_items_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "research_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_evidence_items_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_evidence_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      research_evidence_links: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          evidence_item_id: string
          id: string
          link_role: string
          notes: string | null
          organization_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          evidence_item_id: string
          id?: string
          link_role?: string
          notes?: string | null
          organization_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          evidence_item_id?: string
          id?: string
          link_role?: string
          notes?: string | null
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_evidence_links_evidence_item_id_fkey"
            columns: ["evidence_item_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_evidence_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      research_hypotheses: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          created_at: string
          created_by: string | null
          demo: boolean
          descricao: string | null
          grau_confianca: string
          id: string
          justificativa: string | null
          organization_id: string
          person_id: string | null
          pesquisador_id: string | null
          revisado_em: string | null
          status: string
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao?: string | null
          grau_confianca?: string
          id?: string
          justificativa?: string | null
          organization_id: string
          person_id?: string | null
          pesquisador_id?: string | null
          revisado_em?: string | null
          status?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao?: string | null
          grau_confianca?: string
          id?: string
          justificativa?: string | null
          organization_id?: string
          person_id?: string | null
          pesquisador_id?: string | null
          revisado_em?: string | null
          status?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_hypotheses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_hypotheses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_hypotheses_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
        ]
      }
      research_name_variants: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          organization_id: string
          person_id: string
          source_evidence_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
          variant_name: string
          variant_type: string
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          person_id: string
          source_evidence_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          variant_name: string
          variant_type?: string
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          person_id?: string
          source_evidence_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          variant_name?: string
          variant_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_name_variants_evidence_fkey"
            columns: ["source_evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_name_variants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_name_variants_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
        ]
      }
      research_pending_items: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          blocking_reason: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          organization_id: string
          research_case_id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          responsible_user_id: string | null
          severity: string
          status: string
          tarefa_id: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          blocking_reason?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          organization_id: string
          research_case_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          responsible_user_id?: string | null
          severity?: string
          status?: string
          tarefa_id?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          blocking_reason?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          organization_id?: string
          research_case_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          responsible_user_id?: string | null
          severity?: string
          status?: string
          tarefa_id?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_pending_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_pending_items_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_pending_items_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_pending_items_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "v_ops_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      research_people: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          birth_date: string | null
          birth_date_precision: string
          birth_place: string | null
          canonical_name: string
          created_at: string
          created_by: string | null
          death_date: string | null
          death_date_precision: string | null
          death_place: string | null
          family_member_id: string | null
          gender_or_descriptor: string | null
          genealogical_person_profile_id: string | null
          geracao: string | null
          id: string
          identity_status: string
          is_minor: boolean
          linha_transmissao: string | null
          living_status: string
          nationality_context: string | null
          notes_internal: string | null
          organization_id: string
          pais_localidade: string | null
          papel_na_linhagem: string | null
          person_status: string
          preferred_display_name: string | null
          research_case_id: string
          sensitivity_level: string
          updated_at: string
          updated_by: string | null
          visible_to_client_summary: boolean
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          birth_date?: string | null
          birth_date_precision?: string
          birth_place?: string | null
          canonical_name: string
          created_at?: string
          created_by?: string | null
          death_date?: string | null
          death_date_precision?: string | null
          death_place?: string | null
          family_member_id?: string | null
          gender_or_descriptor?: string | null
          genealogical_person_profile_id?: string | null
          geracao?: string | null
          id?: string
          identity_status?: string
          is_minor?: boolean
          linha_transmissao?: string | null
          living_status?: string
          nationality_context?: string | null
          notes_internal?: string | null
          organization_id: string
          pais_localidade?: string | null
          papel_na_linhagem?: string | null
          person_status?: string
          preferred_display_name?: string | null
          research_case_id: string
          sensitivity_level?: string
          updated_at?: string
          updated_by?: string | null
          visible_to_client_summary?: boolean
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          birth_date?: string | null
          birth_date_precision?: string
          birth_place?: string | null
          canonical_name?: string
          created_at?: string
          created_by?: string | null
          death_date?: string | null
          death_date_precision?: string | null
          death_place?: string | null
          family_member_id?: string | null
          gender_or_descriptor?: string | null
          genealogical_person_profile_id?: string | null
          geracao?: string | null
          id?: string
          identity_status?: string
          is_minor?: boolean
          linha_transmissao?: string | null
          living_status?: string
          nationality_context?: string | null
          notes_internal?: string | null
          organization_id?: string
          pais_localidade?: string | null
          papel_na_linhagem?: string | null
          person_status?: string
          preferred_display_name?: string | null
          research_case_id?: string
          sensitivity_level?: string
          updated_at?: string
          updated_by?: string | null
          visible_to_client_summary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "research_people_genealogical_person_profile_id_fkey"
            columns: ["genealogical_person_profile_id"]
            isOneToOne: false
            referencedRelation: "genealogical_person_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_people_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_people_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      research_relationships: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          confidence_level: string
          created_at: string
          created_by: string | null
          directionality: string
          id: string
          notes_internal: string | null
          organization_id: string
          person_a_id: string
          person_b_id: string
          relationship_type: string
          research_case_id: string
          status: string
          supporting_evidence_count: number
          updated_at: string
          updated_by: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          directionality?: string
          id?: string
          notes_internal?: string | null
          organization_id: string
          person_a_id: string
          person_b_id: string
          relationship_type?: string
          research_case_id: string
          status?: string
          supporting_evidence_count?: number
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          directionality?: string
          id?: string
          notes_internal?: string | null
          organization_id?: string
          person_a_id?: string
          person_b_id?: string
          relationship_type?: string
          research_case_id?: string
          status?: string
          supporting_evidence_count?: number
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_relationships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_relationships_person_a_id_fkey"
            columns: ["person_a_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_relationships_person_b_id_fkey"
            columns: ["person_b_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_relationships_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      research_reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_summary_client: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          client_release_authorized_at: string | null
          client_release_authorized_by: string | null
          content: string
          created_at: string
          created_by: string | null
          evidence_summary_internal: string | null
          file_hash: string | null
          file_path: string | null
          generated_from_snapshot_at: string | null
          id: string
          internal_reference: string | null
          organization_id: string
          published_at: string | null
          report_type: string
          research_case_id: string
          responsible_user_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
          version: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_summary_client?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_release_authorized_at?: string | null
          client_release_authorized_by?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          evidence_summary_internal?: string | null
          file_hash?: string | null
          file_path?: string | null
          generated_from_snapshot_at?: string | null
          id?: string
          internal_reference?: string | null
          organization_id: string
          published_at?: string | null
          report_type?: string
          research_case_id: string
          responsible_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_summary_client?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_release_authorized_at?: string | null
          client_release_authorized_by?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          evidence_summary_internal?: string | null
          file_hash?: string | null
          file_path?: string | null
          generated_from_snapshot_at?: string | null
          id?: string
          internal_reference?: string | null
          organization_id?: string
          published_at?: string | null
          report_type?: string
          research_case_id?: string
          responsible_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_reports_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      research_sources: {
        Row: {
          access_date: string | null
          access_level: string
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          citation_text: string | null
          consulted_at: string | null
          consulted_by: string | null
          created_at: string
          created_by: string | null
          external_source: boolean
          id: string
          notes_internal: string | null
          organization_id: string
          publication_or_record_date: string | null
          repository_or_institution: string | null
          research_case_id: string | null
          result_summary_internal: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_location: string | null
          source_status: string
          source_type: string
          title: string
          updated_at: string
          updated_by: string | null
          url: string | null
        }
        Insert: {
          access_date?: string | null
          access_level?: string
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          citation_text?: string | null
          consulted_at?: string | null
          consulted_by?: string | null
          created_at?: string
          created_by?: string | null
          external_source?: boolean
          id?: string
          notes_internal?: string | null
          organization_id: string
          publication_or_record_date?: string | null
          repository_or_institution?: string | null
          research_case_id?: string | null
          result_summary_internal?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_location?: string | null
          source_status?: string
          source_type?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Update: {
          access_date?: string | null
          access_level?: string
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          citation_text?: string | null
          consulted_at?: string | null
          consulted_by?: string | null
          created_at?: string
          created_by?: string | null
          external_source?: boolean
          id?: string
          notes_internal?: string | null
          organization_id?: string
          publication_or_record_date?: string | null
          repository_or_institution?: string | null
          research_case_id?: string | null
          result_summary_internal?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_location?: string | null
          source_status?: string
          source_type?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_sources_research_case_id_fkey"
            columns: ["research_case_id"]
            isOneToOne: false
            referencedRelation: "research_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      residences_migrations: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residences_migrations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residences_migrations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residences_migrations_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residences_migrations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residences_migrations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residences_migrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residences_migrations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residences_migrations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          client_visible_summary: string | null
          commercial_condition_id: string | null
          conteudo_hash: string | null
          contract_id: string
          contract_version_id: string | null
          created_at: string
          created_by: string | null
          dados_teste: boolean
          deliverable_summary: string | null
          demo: boolean
          end_date: string | null
          id: string
          internal_notes: string | null
          organization_id: string
          origem: string | null
          previous_version_id: string | null
          proposal_id: string | null
          responsible_user_id: string | null
          scope_summary: string | null
          service_order_number: string
          source_annex_id: string | null
          start_condition_notes: string | null
          start_condition_status: string
          start_date: string | null
          status: string
          updated_at: string
          updated_by: string | null
          versao: number
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_visible_summary?: string | null
          commercial_condition_id?: string | null
          conteudo_hash?: string | null
          contract_id: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          deliverable_summary?: string | null
          demo?: boolean
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          organization_id: string
          origem?: string | null
          previous_version_id?: string | null
          proposal_id?: string | null
          responsible_user_id?: string | null
          scope_summary?: string | null
          service_order_number: string
          source_annex_id?: string | null
          start_condition_notes?: string | null
          start_condition_status?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_visible_summary?: string | null
          commercial_condition_id?: string | null
          conteudo_hash?: string | null
          contract_id?: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          dados_teste?: boolean
          deliverable_summary?: string | null
          demo?: boolean
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          organization_id?: string
          origem?: string | null
          previous_version_id?: string | null
          proposal_id?: string | null
          responsible_user_id?: string | null
          scope_summary?: string | null
          service_order_number?: string
          source_annex_id?: string | null
          start_condition_notes?: string | null
          start_condition_status?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_commercial_condition_id_fkey"
            columns: ["commercial_condition_id"]
            isOneToOne: false
            referencedRelation: "commercial_conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_contract_version_id_fkey"
            columns: ["contract_version_id"]
            isOneToOne: false
            referencedRelation: "contract_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_source_annex_id_fkey"
            columns: ["source_annex_id"]
            isOneToOne: false
            referencedRelation: "contract_annexes"
            referencedColumns: ["id"]
          },
        ]
      }
      sku_catalog: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          ativo: boolean
          condicao_pagamento: string | null
          created_at: string
          created_by: string | null
          demo: boolean
          entrada: number | null
          fonte: string
          homologado: boolean
          homologado_em: string | null
          homologado_por: string | null
          id: string
          moeda: string
          nome: string
          observacoes: string | null
          organization_id: string
          parcelas: number | null
          preco_total: number | null
          sku: string
          updated_at: string
          updated_by: string | null
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativo?: boolean
          condicao_pagamento?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          entrada?: number | null
          fonte?: string
          homologado?: boolean
          homologado_em?: string | null
          homologado_por?: string | null
          id?: string
          moeda?: string
          nome: string
          observacoes?: string | null
          organization_id: string
          parcelas?: number | null
          preco_total?: number | null
          sku: string
          updated_at?: string
          updated_by?: string | null
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativo?: boolean
          condicao_pagamento?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          entrada?: number | null
          fonte?: string
          homologado?: boolean
          homologado_em?: string | null
          homologado_por?: string | null
          id?: string
          moeda?: string
          nome?: string
          observacoes?: string | null
          organization_id?: string
          parcelas?: number | null
          preco_total?: number | null
          sku?: string
          updated_at?: string
          updated_by?: string | null
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "sku_catalog_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sku_price_exceptions: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          condicao_pagamento: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          demo: boolean
          id: string
          justificativa: string | null
          moeda: string
          motivo: string
          opportunity_id: string | null
          organization_id: string
          preco_total: number | null
          product_catalog_id: string | null
          responsavel: string
          sku: string
          status: string
          updated_at: string
          updated_by: string | null
          valido_ate: string
          valor_excepcional: number | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          condicao_pagamento?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          demo?: boolean
          id?: string
          justificativa?: string | null
          moeda?: string
          motivo: string
          opportunity_id?: string | null
          organization_id: string
          preco_total?: number | null
          product_catalog_id?: string | null
          responsavel: string
          sku: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          valido_ate: string
          valor_excepcional?: number | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          condicao_pagamento?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          demo?: boolean
          id?: string
          justificativa?: string | null
          moeda?: string
          motivo?: string
          opportunity_id?: string | null
          organization_id?: string
          preco_total?: number | null
          product_catalog_id?: string | null
          responsavel?: string
          sku?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          valido_ate?: string
          valor_excepcional?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sku_price_exceptions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sku_price_exceptions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sku_price_exceptions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sku_price_exceptions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sku_price_exceptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sku_price_exceptions_product_catalog_id_fkey"
            columns: ["product_catalog_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_regras: {
        Row: {
          aplica_a: string
          chave: string
          created_at: string
          descricao: string | null
          horas_alvo: number
          id: string
          rotulo: string
          updated_at: string
        }
        Insert: {
          aplica_a?: string
          chave: string
          created_at?: string
          descricao?: string | null
          horas_alvo: number
          id?: string
          rotulo: string
          updated_at?: string
        }
        Update: {
          aplica_a?: string
          chave?: string
          created_at?: string
          descricao?: string | null
          horas_alvo?: number
          id?: string
          rotulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_political_records: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          client_visibility: string
          created_at: string
          created_by: string | null
          dados: Json
          data_precisao: string
          descricao_interna: string | null
          evidence_id: string | null
          family_id: string | null
          id: string
          institution_id: string | null
          localidade: string | null
          organization_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          person_id: string | null
          responsible_user_id: string | null
          source_id: string | null
          status_verificacao: string
          subtipo: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string
          client_visibility?: string
          created_at?: string
          created_by?: string | null
          dados?: Json
          data_precisao?: string
          descricao_interna?: string | null
          evidence_id?: string | null
          family_id?: string | null
          id?: string
          institution_id?: string | null
          localidade?: string | null
          organization_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          person_id?: string | null
          responsible_user_id?: string | null
          source_id?: string | null
          status_verificacao?: string
          subtipo?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_political_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_political_records_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_political_records_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "research_evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_political_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "nucleos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_political_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_political_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_political_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_political_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_access_logs: {
        Row: {
          acesso_tipo: string
          case_id: string | null
          estrutura_futura: boolean
          id: string
          organization_id: string
          registrado_em: string
          registrado_por: string | null
          resumo_interno: string | null
          source_id: string
        }
        Insert: {
          acesso_tipo?: string
          case_id?: string | null
          estrutura_futura?: boolean
          id?: string
          organization_id: string
          registrado_em?: string
          registrado_por?: string | null
          resumo_interno?: string | null
          source_id: string
        }
        Update: {
          acesso_tipo?: string
          case_id?: string | null
          estrutura_futura?: boolean
          id?: string
          organization_id?: string
          registrado_em?: string
          registrado_por?: string | null
          resumo_interno?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_access_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "genealogical_sources_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      source_evaluation_matrix: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          avaliado_em: string | null
          avaliado_por: string | null
          bloqueante: boolean
          created_at: string
          created_by: string | null
          criterio: string
          evidencia_interna: string | null
          id: string
          nota: number | null
          organization_id: string
          parecer_interno: string | null
          source_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          avaliado_em?: string | null
          avaliado_por?: string | null
          bloqueante?: boolean
          created_at?: string
          created_by?: string | null
          criterio: string
          evidencia_interna?: string | null
          id?: string
          nota?: number | null
          organization_id: string
          parecer_interno?: string | null
          source_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          avaliado_em?: string | null
          avaliado_por?: string | null
          bloqueante?: boolean
          created_at?: string
          created_by?: string | null
          criterio?: string
          evidencia_interna?: string | null
          id?: string
          nota?: number | null
          organization_id?: string
          parecer_interno?: string | null
          source_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_evaluation_matrix_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "genealogical_sources_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      sources_activation_backlog: {
        Row: {
          acao_interna: string
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          bloqueio_atual: string | null
          created_at: string
          created_by: string | null
          id: string
          motivo: string
          organization_id: string
          prazo: string | null
          prioridade: string
          requires_human_approval: boolean
          responsavel: string | null
          resultado_interno: string | null
          source_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          acao_interna: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio_atual?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          motivo: string
          organization_id: string
          prazo?: string | null
          prioridade?: string
          requires_human_approval?: boolean
          responsavel?: string | null
          resultado_interno?: string | null
          source_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          acao_interna?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueio_atual?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          motivo?: string
          organization_id?: string
          prazo?: string | null
          prioridade?: string
          requires_human_approval?: boolean
          responsavel?: string | null
          resultado_interno?: string | null
          source_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_activation_backlog_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "genealogical_sources_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_access: {
        Row: {
          activated_at: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          auth_user_id: string | null
          created_at: string
          created_by: string | null
          demo: boolean
          email: string
          full_name: string | null
          id: string
          invitation_expires_at: string | null
          invited_at: string
          invited_by: string | null
          last_login_at: string | null
          organization_id: string
          reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["staff_status"]
          suspended_at: string | null
          suspended_by: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activated_at?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          email: string
          full_name?: string | null
          id?: string
          invitation_expires_at?: string | null
          invited_at?: string
          invited_by?: string | null
          last_login_at?: string | null
          organization_id: string
          reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["staff_status"]
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activated_at?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          email?: string
          full_name?: string | null
          id?: string
          invitation_expires_at?: string | null
          invited_at?: string
          invited_by?: string | null
          last_login_at?: string | null
          organization_id?: string
          reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["staff_status"]
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_access_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          bloqueado_em: string | null
          bloqueio: boolean
          caso_id: string | null
          concluida_em: string | null
          created_at: string
          created_by: string | null
          data_origin: string
          demo: boolean
          desbloqueado_em: string | null
          desbloqueio_justificativa: string | null
          desbloqueio_por: string | null
          descricao: string | null
          evidencia_id: string | null
          hypothesis_id: string | null
          id: string
          motivo_bloqueio: string | null
          organization_id: string
          person_id: string | null
          prazo: string | null
          prioridade: string
          responsavel_id: string | null
          sla_alerta_em: string | null
          sla_horas: number | null
          sla_prazo_em: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueado_em?: string | null
          bloqueio?: boolean
          caso_id?: string | null
          concluida_em?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          demo?: boolean
          desbloqueado_em?: string | null
          desbloqueio_justificativa?: string | null
          desbloqueio_por?: string | null
          descricao?: string | null
          evidencia_id?: string | null
          hypothesis_id?: string | null
          id?: string
          motivo_bloqueio?: string | null
          organization_id: string
          person_id?: string | null
          prazo?: string | null
          prioridade?: string
          responsavel_id?: string | null
          sla_alerta_em?: string | null
          sla_horas?: number | null
          sla_prazo_em?: string | null
          status?: string
          tipo?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bloqueado_em?: string | null
          bloqueio?: boolean
          caso_id?: string | null
          concluida_em?: string | null
          created_at?: string
          created_by?: string | null
          data_origin?: string
          demo?: boolean
          desbloqueado_em?: string | null
          desbloqueio_justificativa?: string | null
          desbloqueio_por?: string | null
          descricao?: string | null
          evidencia_id?: string | null
          hypothesis_id?: string | null
          id?: string
          motivo_bloqueio?: string | null
          organization_id?: string
          person_id?: string | null
          prazo?: string | null
          prioridade?: string
          responsavel_id?: string | null
          sla_alerta_em?: string | null
          sla_horas?: number | null
          sla_prazo_em?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_evidencia_id_fkey"
            columns: ["evidencia_id"]
            isOneToOne: false
            referencedRelation: "evidencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_hypothesis_id_fkey"
            columns: ["hypothesis_id"]
            isOneToOne: false
            referencedRelation: "research_hypotheses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
        ]
      }
      third_party_expenses: {
        Row: {
          aprovacao_evidencia: string | null
          aprovado_pelo_cliente_em: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          categoria: string | null
          comunicado_em: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          demo: boolean
          descricao: string
          estado: string
          estimativa_max: number | null
          estimativa_min: number | null
          excecao_id: string | null
          executado_em: string | null
          id: string
          moeda: string
          observacoes: string | null
          organization_id: string
          pagador: string
          updated_at: string
          updated_by: string | null
          valor_pago: number | null
        }
        Insert: {
          aprovacao_evidencia?: string | null
          aprovado_pelo_cliente_em?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          categoria?: string | null
          comunicado_em?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao: string
          estado?: string
          estimativa_max?: number | null
          estimativa_min?: number | null
          excecao_id?: string | null
          executado_em?: string | null
          id?: string
          moeda?: string
          observacoes?: string | null
          organization_id: string
          pagador?: string
          updated_at?: string
          updated_by?: string | null
          valor_pago?: number | null
        }
        Update: {
          aprovacao_evidencia?: string | null
          aprovado_pelo_cliente_em?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          categoria?: string | null
          comunicado_em?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao?: string
          estado?: string
          estimativa_max?: number | null
          estimativa_min?: number | null
          excecao_id?: string | null
          executado_em?: string | null
          id?: string
          moeda?: string
          observacoes?: string | null
          organization_id?: string
          pagador?: string
          updated_at?: string
          updated_by?: string | null
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "third_party_expenses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "third_party_expenses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "third_party_expenses_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "third_party_expenses_excecao_id_fkey"
            columns: ["excecao_id"]
            isOneToOne: false
            referencedRelation: "contract_exceptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "third_party_expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      touchpoints: {
        Row: {
          aguardando_resposta: boolean
          autor: string | null
          canal: string
          caso_id: string
          conteudo: string | null
          created_at: string
          direcao: string
          id: string
          interno: boolean
          ocorrido_em: string
          resumo: string
          transcricao: string | null
          updated_at: string
        }
        Insert: {
          aguardando_resposta?: boolean
          autor?: string | null
          canal: string
          caso_id: string
          conteudo?: string | null
          created_at?: string
          direcao?: string
          id?: string
          interno?: boolean
          ocorrido_em?: string
          resumo: string
          transcricao?: string | null
          updated_at?: string
        }
        Update: {
          aguardando_resposta?: boolean
          autor?: string | null
          canal?: string
          caso_id?: string
          conteudo?: string | null
          created_at?: string
          direcao?: string
          id?: string
          interno?: boolean
          ocorrido_em?: string
          resumo?: string
          transcricao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "touchpoints_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "casos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      versioned_legal_rules: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          dados_necessarios: string | null
          escopo: string | null
          excecoes: string | null
          fonte_referencia: string | null
          id: string
          organization_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tema: string
          track_id: string | null
          updated_at: string
          updated_by: string | null
          versao: string
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          dados_necessarios?: string | null
          escopo?: string | null
          excecoes?: string | null
          fonte_referencia?: string | null
          id?: string
          organization_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tema: string
          track_id?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          dados_necessarios?: string | null
          escopo?: string | null
          excecoes?: string | null
          fonte_referencia?: string | null
          id?: string
          organization_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tema?: string
          track_id?: string | null
          updated_at?: string
          updated_by?: string | null
          versao?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "versioned_legal_rules_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "citizenship_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      portal_casos: {
        Row: {
          app_access_status: string | null
          ativo: boolean | null
          cliente_id: string | null
          codigo: string | null
          composicao: string | null
          created_at: string | null
          fase_jornada: string | null
          id: string | null
          onboarding_iniciado_em: string | null
          organization_id: string | null
          pais: string | null
          pendencia_cliente_pendente: boolean | null
          proxima_entrega_prevista_em: string | null
          status: string | null
          suspenso_em: string | null
          titulo: string | null
          updated_at: string | null
          via: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_casos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_casos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "portal_meu_cadastro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_casos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_meu_cadastro: {
        Row: {
          email: string | null
          id: string | null
          nome: string | null
          nome_social: string | null
          organization_id: string | null
          pais_interesse: string | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
          nome?: string | null
          nome_social?: string | null
          organization_id?: string | null
          pais_interesse?: string | null
          status?: string | null
          telefone?: string | null
        }
        Update: {
          email?: string | null
          id?: string | null
          nome?: string | null
          nome_social?: string | null
          organization_id?: string | null
          pais_interesse?: string | null
          status?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_projecoes: {
        Row: {
          case_id: string | null
          content_sanitized: string | null
          effective_from: string | null
          geracao_cliente: number | null
          id: string | null
          pessoa_id: string | null
          projection_type: string | null
          source_entity_id: string | null
          updated_at: string | null
          vinculo_projecao_id: string | null
        }
        Insert: {
          case_id?: string | null
          content_sanitized?: string | null
          effective_from?: string | null
          geracao_cliente?: number | null
          id?: string | null
          pessoa_id?: string | null
          projection_type?: string | null
          source_entity_id?: string | null
          updated_at?: string | null
          vinculo_projecao_id?: string | null
        }
        Update: {
          case_id?: string | null
          content_sanitized?: string | null
          effective_from?: string | null
          geracao_cliente?: number | null
          id?: string | null
          pessoa_id?: string | null
          projection_type?: string | null
          source_entity_id?: string | null
          updated_at?: string | null
          vinculo_projecao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_proj_vinculo_projecao_fk"
            columns: ["vinculo_projecao_id"]
            isOneToOne: false
            referencedRelation: "app_projections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_proj_vinculo_projecao_fk"
            columns: ["vinculo_projecao_id"]
            isOneToOne: false
            referencedRelation: "portal_projecoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projections_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projections_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_projections_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "research_people"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ops_microentregas: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          caso_codigo: string | null
          caso_id: string | null
          caso_status: string | null
          caso_titulo: string | null
          concluida_em: string | null
          concluida_por: string | null
          created_at: string | null
          created_by: string | null
          criterio_aceite: string | null
          descricao: string | null
          evidencia_descricao: string | null
          evidencia_url: string | null
          excecao_id: string | null
          fase: string | null
          id: string | null
          justificativa_sem_evidencia: string | null
          organization_id: string | null
          prazo: string | null
          prazo_status: string | null
          prioridade: string | null
          responsavel_id: string | null
          status: string | null
          titulo: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ops_microentregas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_microentregas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_microentregas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ops_tarefas: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          bloqueado_em: string | null
          bloqueio: boolean | null
          caso_codigo: string | null
          caso_id: string | null
          caso_status: string | null
          caso_titulo: string | null
          concluida_em: string | null
          created_at: string | null
          created_by: string | null
          demo: boolean | null
          desbloqueado_em: string | null
          desbloqueio_justificativa: string | null
          desbloqueio_por: string | null
          descricao: string | null
          evidencia_id: string | null
          hypothesis_id: string | null
          id: string | null
          motivo_bloqueio: string | null
          organization_id: string | null
          person_id: string | null
          prazo: string | null
          prioridade: string | null
          responsavel_id: string | null
          sla_alerta_em: string | null
          sla_horas: number | null
          sla_prazo_em: string | null
          sla_status: string | null
          status: string | null
          tipo: string | null
          titulo: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_evidencia_id_fkey"
            columns: ["evidencia_id"]
            isOneToOne: false
            referencedRelation: "evidencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_hypothesis_id_fkey"
            columns: ["hypothesis_id"]
            isOneToOne: false
            referencedRelation: "research_hypotheses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "case_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      activation_check_definicoes: {
        Args: never
        Returns: {
          check_key: string
          dominio: string
          label: string
          obrigatorio: boolean
        }[]
      }
      atendimento_bloqueios: { Args: { _case: string }; Returns: string[] }
      bootstrap_minha_organizacao: { Args: { _nome?: string }; Returns: string }
      bootstrap_permitido: { Args: never; Returns: boolean }
      bootstrap_primeiro_admin: {
        Args: {
          _email: string
          _nome: string
          _organizacao: string
          _user_id: string
        }
        Returns: string
      }
      can_write: { Args: { _org: string }; Returns: boolean }
      can_write_financeiro: { Args: { _org: string }; Returns: boolean }
      case_activacao_bloqueios: { Args: { _case: string }; Returns: string[] }
      case_activation_gates: {
        Args: { _case: string }
        Returns: {
          check_key: string
          dominio: string
          estado: string
          evidencia: string
          isencao_expira_em: string
          isencao_motivo: string
          label: string
          motivo: string
          obrigatorio: boolean
          origem: string
          validado_em: string
          validado_por: string
        }[]
      }
      case_activation_pendencias: {
        Args: { _case: string }
        Returns: {
          check_key: string
          label: string
          motivo: string
        }[]
      }
      case_ativacao_bloqueios_reais: {
        Args: { _case: string }
        Returns: {
          cta_tela: string
          dominio: string
          motivo: string
          regra: string
          tabela_campo: string
          valor_atual: string
        }[]
      }
      case_gate_satisfeito_por_dado: {
        Args: { _case: string; _check_key: string }
        Returns: boolean
      }
      caso_saude_cadencia: {
        Args: { _case: string }
        Returns: {
          dias_sem_touchpoint: number
          status_cadencia: string
        }[]
      }
      consentimento_ativo: {
        Args: { _case: string; _client: string }
        Returns: boolean
      }
      consentimento_dispensado: {
        Args: { _case: string; _client: string }
        Returns: boolean
      }
      contract_parameter_confianca: {
        Args: { _origem: string }
        Returns: number
      }
      contract_parameter_definicoes: {
        Args: never
        Returns: {
          campo: string
          grupo: string
          label: string
          obrigatorio: boolean
          ordem: number
        }[]
      }
      contract_parameters_completude: { Args: { _id: string }; Returns: Json }
      contract_parameters_pendencias: {
        Args: { _id: string }
        Returns: {
          campo: string
          grupo: string
          label: string
          motivo: string
        }[]
      }
      contract_pode_aprovar: { Args: { _org: string }; Returns: boolean }
      contract_pode_financeiro: { Args: { _org: string }; Returns: boolean }
      contract_pode_ler: { Args: { _org: string }; Returns: boolean }
      contract_pode_preparar: { Args: { _org: string }; Returns: boolean }
      fn_app_projection_compartilhada_com_cliente: {
        Args: { p_client_id: string; p_projection_id: string }
        Returns: boolean
      }
      fn_app_projection_org_bate: {
        Args: { p_organization_id: string; p_projection_id: string }
        Returns: boolean
      }
      fn_decisao_proprietaria_ativa: {
        Args: {
          p_entidade: string
          p_entidade_id: string
          p_janela?: string
          p_org: string
        }
        Returns: boolean
      }
      fn_eh_proprietaria_ativa: { Args: { p_org: string }; Returns: boolean }
      fn_linguagem_proibida: { Args: { _txt: string }; Returns: string }
      fn_proprietaria_operando: { Args: never; Returns: boolean }
      fn_sou_titular_app_projection: {
        Args: { p_projection_id: string }
        Returns: boolean
      }
      fn_validar_uso_template: {
        Args: {
          _actor_id?: string
          _case_id?: string
          _channel?: string
          _lead_id?: string
          _opportunity_id?: string
          _person_id?: string
          _template_id: string
        }
        Returns: Json
      }
      gerar_case_id: {
        Args: { _ano?: number; _demo?: boolean; _modelo: string; _org: string }
        Returns: string
      }
      has_org_role: {
        Args: { _org: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string }; Returns: boolean }
      is_staff_ativo: { Args: { _org: string }; Returns: boolean }
      matriz_juridica_deduplicar: {
        Args: { _org: string }
        Returns: {
          arquivadas: number
          canonica_id: string
          tema_codigo: string
        }[]
      }
      nucleo_completude: { Args: { _case: string }; Returns: Json }
      ops_painel: { Args: { _org: string }; Returns: Json }
      ops_sla_status: {
        Args: { _alerta_em: string; _prazo_em: string; _status: string }
        Returns: string
      }
      pais_canonico: { Args: { _valor: string }; Returns: string }
      pode_iniciar_pesquisa_externa: { Args: { _rc: string }; Returns: Json }
      pode_pesquisar_caso: { Args: { _case: string }; Returns: boolean }
      portal_caso_permitido: { Args: { _case: string }; Returns: boolean }
      portal_meu_acesso: { Args: never; Returns: string }
      portal_meu_cliente: { Args: never; Returns: string }
      portal_meu_nivel: {
        Args: never
        Returns: Database["public"]["Enums"]["portal_access_level"]
      }
      portal_minha_org: { Args: never; Returns: string }
      proxima_acao_prioritaria: {
        Args: { _case: string }
        Returns: {
          motivo: string
          nivel: number
          origem_id: string
          origem_tabela: string
          prazo: string
        }[]
      }
      proxima_acao_prioritaria_lote: {
        Args: { _cases: string[] }
        Returns: {
          case_id: string
          motivo: string
          nivel: number
          origem_id: string
          origem_tabela: string
          prazo: string
        }[]
      }
      quality_relatorio_semanal: {
        Args: { _inicio?: string; _org: string }
        Returns: Json
      }
      quality_scan: {
        Args: { _org: string }
        Returns: {
          abertas: number
          criadas: number
          sanadas: number
        }[]
      }
      quality_sync_checklist: { Args: { _case: string }; Returns: number }
      research_quality_scan: {
        Args: { _org: string }
        Returns: {
          abertas: number
          criadas: number
          sanadas: number
        }[]
      }
      resolver_case_canonico: {
        Args: { _ref: string }
        Returns: {
          alias: boolean
          case_id: string
          codigo: string
        }[]
      }
      rg_admin: { Args: { _org: string }; Returns: boolean }
      rg_editar: { Args: { _org: string }; Returns: boolean }
      rg_ler_detalhe: { Args: { _org: string }; Returns: boolean }
      rg_ler_resumo: { Args: { _org: string }; Returns: boolean }
      rg_papel: {
        Args: { _org: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      rg_pode_editar_caso: { Args: { _rc: string }; Returns: boolean }
      rg_tem_evidencia_validada: {
        Args: { _id: string; _tipo: string }
        Returns: boolean
      }
      sku_preco_homologado: {
        Args: { _org: string; _sku: string }
        Returns: Json
      }
      staff_meu_papel: {
        Args: { _org: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      transicao_permitida: {
        Args: { _de: string; _entidade: string; _para: string }
        Returns: boolean
      }
      unaccent_imutavel: { Args: { _t: string }; Returns: string }
      validate_contract_readiness: {
        Args: { _contract_id: string; _version_id?: string }
        Returns: {
          details: string
          label: string
          severity: string
          status: string
          validation_key: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "operacoes"
        | "pesquisador"
        | "comercial"
        | "financeiro"
        | "leitura"
      portal_access_level: "proposal_portal" | "client_workspace"
      portal_access_status:
        | "pending"
        | "invited"
        | "active"
        | "suspended"
        | "revoked"
        | "expired"
      portal_case_status: "active" | "suspended" | "revoked"
      portal_event_type:
        | "invite_created"
        | "invite_resent"
        | "magic_link_requested"
        | "magic_link_sent"
        | "authenticated"
        | "authentication_denied"
        | "access_denied"
        | "access_revoked"
        | "access_suspended"
        | "case_access_granted"
        | "case_access_revoked"
        | "session_expired"
      staff_status: "invited" | "active" | "suspended" | "revoked"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "operacoes",
        "pesquisador",
        "comercial",
        "financeiro",
        "leitura",
      ],
      portal_access_level: ["proposal_portal", "client_workspace"],
      portal_access_status: [
        "pending",
        "invited",
        "active",
        "suspended",
        "revoked",
        "expired",
      ],
      portal_case_status: ["active", "suspended", "revoked"],
      portal_event_type: [
        "invite_created",
        "invite_resent",
        "magic_link_requested",
        "magic_link_sent",
        "authenticated",
        "authentication_denied",
        "access_denied",
        "access_revoked",
        "access_suspended",
        "case_access_granted",
        "case_access_revoked",
        "session_expired",
      ],
      staff_status: ["invited", "active", "suspended", "revoked"],
    },
  },
} as const
