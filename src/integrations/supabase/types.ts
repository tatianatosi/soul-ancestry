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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
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
        ]
      }
      case_members: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          created_at: string
          created_by: string | null
          data_nascimento: string | null
          id: string
          local_nascimento: string | null
          nome: string
          observacoes_protegidas: string | null
          organization_id: string
          parentesco: string
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
          data_nascimento?: string | null
          id?: string
          local_nascimento?: string | null
          nome: string
          observacoes_protegidas?: string | null
          organization_id: string
          parentesco: string
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
          data_nascimento?: string | null
          id?: string
          local_nascimento?: string | null
          nome?: string
          observacoes_protegidas?: string | null
          organization_id?: string
          parentesco?: string
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
            foreignKeyName: "case_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      casos: {
        Row: {
          canvas_publicado: boolean
          canvas_token: string
          case_id: string
          case_nome: string | null
          cliente_nome: string
          created_at: string
          dados_sensiveis_ocultos: boolean
          id: string
          pais: string | null
          produto_nome: string | null
          produto_sku: string | null
          responsavel: string | null
          status: string
          ultima_atualizacao: string | null
          updated_at: string
          via: string
        }
        Insert: {
          canvas_publicado?: boolean
          canvas_token?: string
          case_id: string
          case_nome?: string | null
          cliente_nome: string
          created_at?: string
          dados_sensiveis_ocultos?: boolean
          id?: string
          pais?: string | null
          produto_nome?: string | null
          produto_sku?: string | null
          responsavel?: string | null
          status?: string
          ultima_atualizacao?: string | null
          updated_at?: string
          via?: string
        }
        Update: {
          canvas_publicado?: boolean
          canvas_token?: string
          case_id?: string
          case_nome?: string | null
          cliente_nome?: string
          created_at?: string
          dados_sensiveis_ocultos?: boolean
          id?: string
          pais?: string | null
          produto_nome?: string | null
          produto_sku?: string | null
          responsavel?: string | null
          status?: string
          ultima_atualizacao?: string | null
          updated_at?: string
          via?: string
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
            foreignKeyName: "client_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          client_id: string
          created_at: string
          created_by: string | null
          demo: boolean
          email: string
          first_authenticated_at: string | null
          id: string
          invitation_expires_at: string | null
          invited_at: string | null
          invited_by: string | null
          last_authenticated_at: string | null
          notes_internal: string | null
          organization_id: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
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
          client_id: string
          created_at?: string
          created_by?: string | null
          demo?: boolean
          email: string
          first_authenticated_at?: string | null
          id?: string
          invitation_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          last_authenticated_at?: string | null
          notes_internal?: string | null
          organization_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
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
          client_id?: string
          created_at?: string
          created_by?: string | null
          demo?: boolean
          email?: string
          first_authenticated_at?: string | null
          id?: string
          invitation_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          last_authenticated_at?: string | null
          notes_internal?: string | null
          organization_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
          created_at: string
          created_by: string | null
          demo: boolean
          documento: string | null
          email: string | null
          id: string
          nome: string
          nome_social: string | null
          observacoes: string | null
          organization_id: string
          origem: string | null
          pais_interesse: string | null
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
          demo?: boolean
          documento?: string | null
          email?: string | null
          id?: string
          nome: string
          nome_social?: string | null
          observacoes?: string | null
          organization_id: string
          origem?: string | null
          pais_interesse?: string | null
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
          demo?: boolean
          documento?: string | null
          email?: string | null
          id?: string
          nome?: string
          nome_social?: string | null
          observacoes?: string | null
          organization_id?: string
          origem?: string | null
          pais_interesse?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
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
      consent_records: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          client_id: string
          coletado_em: string | null
          created_at: string
          created_by: string | null
          evidencia_consentimento: string | null
          id: string
          organization_id: string
          revogado_em: string | null
          status: string
          tipo_consentimento: string
          updated_at: string
          updated_by: string | null
          versao_texto: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id: string
          coletado_em?: string | null
          created_at?: string
          created_by?: string | null
          evidencia_consentimento?: string | null
          id?: string
          organization_id: string
          revogado_em?: string | null
          status?: string
          tipo_consentimento: string
          updated_at?: string
          updated_by?: string | null
          versao_texto: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id?: string
          coletado_em?: string | null
          created_at?: string
          created_by?: string | null
          evidencia_consentimento?: string | null
          id?: string
          organization_id?: string
          revogado_em?: string | null
          status?: string
          tipo_consentimento?: string
          updated_at?: string
          updated_by?: string | null
          versao_texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
      contract_annexes: {
        Row: {
          annex_code: string
          annex_type: string
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          contract_id: string
          contract_version_id: string | null
          created_at: string
          created_by: string | null
          file_hash: string | null
          file_path: string | null
          id: string
          internal_notes: string | null
          organization_id: string
          prepared_by: string | null
          reason_not_applicable: string | null
          required_for_contract: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          source_reference: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          annex_code: string
          annex_type: string
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          contract_id: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          file_hash?: string | null
          file_path?: string | null
          id?: string
          internal_notes?: string | null
          organization_id: string
          prepared_by?: string | null
          reason_not_applicable?: string | null
          required_for_contract?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_reference?: string | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          annex_code?: string
          annex_type?: string
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          contract_id?: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          file_hash?: string | null
          file_path?: string | null
          id?: string
          internal_notes?: string | null
          organization_id?: string
          prepared_by?: string | null
          reason_not_applicable?: string | null
          required_for_contract?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_reference?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
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
          contract_id: string
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          organization_id: string
          requires_human_validation: boolean
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
          contract_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          organization_id: string
          requires_human_validation?: boolean
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
          contract_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          organization_id?: string
          requires_human_validation?: boolean
          source_reference?: string | null
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
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
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
      crm_casos: {
        Row: {
          app_access_status: string
          app_visibility_level: string
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          ativado_em: string | null
          ativado_por: string | null
          ativo: boolean
          cliente_id: string | null
          codigo: string
          condicoes_verificadas_em: string | null
          condicoes_verificadas_por: string | null
          consentimento_compartilhamento: boolean
          contrato_assinado: boolean
          created_at: string
          created_by: string | null
          data_ativacao: string | null
          data_entrada: string
          demo: boolean
          documentos_minimos_ok: boolean
          fase: string | null
          hipotese_elegibilidade: string | null
          id: string
          info_cliente_liberada: boolean
          organization_id: string
          pagamento_confirmado: boolean
          pais: string | null
          prioridade: string
          proxima_acao: string | null
          responsavel_id: string | null
          resumo: string | null
          risco: string | null
          status: string
          suspenso_em: string | null
          suspenso_motivo: string | null
          suspenso_por: string | null
          tipo_servico: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
          via: string
        }
        Insert: {
          app_access_status?: string
          app_visibility_level?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativado_em?: string | null
          ativado_por?: string | null
          ativo?: boolean
          cliente_id?: string | null
          codigo: string
          condicoes_verificadas_em?: string | null
          condicoes_verificadas_por?: string | null
          consentimento_compartilhamento?: boolean
          contrato_assinado?: boolean
          created_at?: string
          created_by?: string | null
          data_ativacao?: string | null
          data_entrada?: string
          demo?: boolean
          documentos_minimos_ok?: boolean
          fase?: string | null
          hipotese_elegibilidade?: string | null
          id?: string
          info_cliente_liberada?: boolean
          organization_id: string
          pagamento_confirmado?: boolean
          pais?: string | null
          prioridade?: string
          proxima_acao?: string | null
          responsavel_id?: string | null
          resumo?: string | null
          risco?: string | null
          status?: string
          suspenso_em?: string | null
          suspenso_motivo?: string | null
          suspenso_por?: string | null
          tipo_servico?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
          via?: string
        }
        Update: {
          app_access_status?: string
          app_visibility_level?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativado_em?: string | null
          ativado_por?: string | null
          ativo?: boolean
          cliente_id?: string | null
          codigo?: string
          condicoes_verificadas_em?: string | null
          condicoes_verificadas_por?: string | null
          consentimento_compartilhamento?: boolean
          contrato_assinado?: boolean
          created_at?: string
          created_by?: string | null
          data_ativacao?: string | null
          data_entrada?: string
          demo?: boolean
          documentos_minimos_ok?: boolean
          fase?: string | null
          hipotese_elegibilidade?: string | null
          id?: string
          info_cliente_liberada?: boolean
          organization_id?: string
          pagamento_confirmado?: boolean
          pais?: string | null
          prioridade?: string
          proxima_acao?: string | null
          responsavel_id?: string | null
          resumo?: string | null
          risco?: string | null
          status?: string
          suspenso_em?: string | null
          suspenso_motivo?: string | null
          suspenso_por?: string | null
          tipo_servico?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          via?: string
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
            foreignKeyName: "crm_casos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          file_hash: string | null
          id: string
          liberado_cliente: boolean
          observacoes: string | null
          organization_id: string
          status: string
          storage_path: string | null
          tipo: string
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          file_hash?: string | null
          id?: string
          liberado_cliente?: boolean
          observacoes?: string | null
          organization_id: string
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          file_hash?: string | null
          id?: string
          liberado_cliente?: boolean
          observacoes?: string | null
          organization_id?: string
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
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
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
      eventos_financeiros: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          caso_id: string | null
          created_at: string
          created_by: string | null
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
            foreignKeyName: "eventos_financeiros_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          demo: boolean
          descricao: string | null
          fonte: string | null
          grau_confianca: string | null
          id: string
          liberada_cliente: boolean
          local_relacionado: string | null
          observacao: string | null
          organization_id: string
          origem: string
          periodo: string | null
          pessoa_relacionada: string | null
          status: string
          storage_path: string | null
          tipo: string
          titulo: string
          updated_at: string
          updated_by: string | null
          visibilidade: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao?: string | null
          fonte?: string | null
          grau_confianca?: string | null
          id?: string
          liberada_cliente?: boolean
          local_relacionado?: string | null
          observacao?: string | null
          organization_id: string
          origem?: string
          periodo?: string | null
          pessoa_relacionada?: string | null
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          visibilidade?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao?: string | null
          fonte?: string | null
          grau_confianca?: string | null
          id?: string
          liberada_cliente?: boolean
          local_relacionado?: string | null
          observacao?: string | null
          organization_id?: string
          origem?: string
          periodo?: string | null
          pessoa_relacionada?: string | null
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
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
            foreignKeyName: "evidencias_organization_id_fkey"
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
          descricao: string | null
          emitida_em: string | null
          id: string
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
          descricao?: string | null
          emitida_em?: string | null
          id?: string
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
          descricao?: string | null
          emitida_em?: string | null
          id?: string
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
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
      leads: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          demo: boolean
          email: string | null
          estagio: string
          id: string
          nome: string
          observacoes: string | null
          organization_id: string
          origem: string | null
          pais_interesse: string | null
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
          demo?: boolean
          email?: string | null
          estagio?: string
          id?: string
          nome: string
          observacoes?: string | null
          organization_id: string
          origem?: string | null
          pais_interesse?: string | null
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
          demo?: boolean
          email?: string | null
          estagio?: string
          id?: string
          nome?: string
          observacoes?: string | null
          organization_id?: string
          origem?: string | null
          pais_interesse?: string | null
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      payments: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          conciliacao_status: string
          created_at: string
          created_by: string | null
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
          enviada_em: string | null
          escopo: string | null
          exclusoes: string | null
          forma_pagamento: string | null
          id: string
          lead_id: string | null
          moeda: string
          observacoes_cliente: string | null
          observacoes_internas: string | null
          organization_id: string
          recusada_em: string | null
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
          enviada_em?: string | null
          escopo?: string | null
          exclusoes?: string | null
          forma_pagamento?: string | null
          id?: string
          lead_id?: string | null
          moeda?: string
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          organization_id: string
          recusada_em?: string | null
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
          enviada_em?: string | null
          escopo?: string | null
          exclusoes?: string | null
          forma_pagamento?: string | null
          id?: string
          lead_id?: string | null
          moeda?: string
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          organization_id?: string
          recusada_em?: string | null
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
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
            foreignKeyName: "proposals_substituida_por_id_fkey"
            columns: ["substituida_por_id"]
            isOneToOne: false
            referencedRelation: "proposals"
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
          contract_id: string
          contract_version_id: string | null
          created_at: string
          created_by: string | null
          deliverable_summary: string | null
          demo: boolean
          end_date: string | null
          id: string
          internal_notes: string | null
          organization_id: string
          responsible_user_id: string | null
          scope_summary: string | null
          service_order_number: string
          start_condition_notes: string | null
          start_condition_status: string
          start_date: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_visible_summary?: string | null
          contract_id: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_summary?: string | null
          demo?: boolean
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          organization_id: string
          responsible_user_id?: string | null
          scope_summary?: string | null
          service_order_number: string
          start_condition_notes?: string | null
          start_condition_status?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          case_id?: string | null
          client_visible_summary?: string | null
          contract_id?: string
          contract_version_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_summary?: string | null
          demo?: boolean
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          organization_id?: string
          responsible_user_id?: string | null
          scope_summary?: string | null
          service_order_number?: string
          start_condition_notes?: string | null
          start_condition_status?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
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
          bloqueio: boolean
          caso_id: string | null
          concluida_em: string | null
          created_at: string
          created_by: string | null
          demo: boolean
          descricao: string | null
          id: string
          motivo_bloqueio: string | null
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
          bloqueio?: boolean
          caso_id?: string | null
          concluida_em?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao?: string | null
          id?: string
          motivo_bloqueio?: string | null
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
          bloqueio?: boolean
          caso_id?: string | null
          concluida_em?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao?: string | null
          id?: string
          motivo_bloqueio?: string | null
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
            foreignKeyName: "tarefas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "crm_casos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_organization_id_fkey"
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
    }
    Views: {
      [_ in never]: never
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
      case_activation_pendencias: {
        Args: { _case: string }
        Returns: {
          check_key: string
          label: string
          motivo: string
        }[]
      }
      contract_pode_aprovar: { Args: { _org: string }; Returns: boolean }
      contract_pode_financeiro: { Args: { _org: string }; Returns: boolean }
      contract_pode_ler: { Args: { _org: string }; Returns: boolean }
      contract_pode_preparar: { Args: { _org: string }; Returns: boolean }
      has_org_role: {
        Args: { _org: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string }; Returns: boolean }
      is_staff_ativo: { Args: { _org: string }; Returns: boolean }
      portal_caso_permitido: { Args: { _case: string }; Returns: boolean }
      portal_meu_acesso: { Args: never; Returns: string }
      portal_meu_cliente: { Args: never; Returns: string }
      portal_meu_nivel: {
        Args: never
        Returns: Database["public"]["Enums"]["portal_access_level"]
      }
      portal_minha_org: { Args: never; Returns: string }
      staff_meu_papel: {
        Args: { _org: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      transicao_permitida: {
        Args: { _de: string; _entidade: string; _para: string }
        Returns: boolean
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
