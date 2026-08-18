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
          {
            foreignKeyName: "case_activation_checks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
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
      case_members: {
        Row: {
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          case_id: string
          created_at: string
          created_by: string | null
          data_nascimento: string | null
          data_obito: string | null
          id: string
          local_nascimento: string | null
          local_obito: string | null
          mae_id: string | null
          nacionalidade: string | null
          nome: string
          observacoes_protegidas: string | null
          organization_id: string
          pai_id: string | null
          parentesco: string
          requerente: boolean
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
          data_obito?: string | null
          id?: string
          local_nascimento?: string | null
          local_obito?: string | null
          mae_id?: string | null
          nacionalidade?: string | null
          nome: string
          observacoes_protegidas?: string | null
          organization_id: string
          pai_id?: string | null
          parentesco: string
          requerente?: boolean
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
          data_obito?: string | null
          id?: string
          local_nascimento?: string | null
          local_obito?: string | null
          mae_id?: string | null
          nacionalidade?: string | null
          nome?: string
          observacoes_protegidas?: string | null
          organization_id?: string
          pai_id?: string | null
          parentesco?: string
          requerente?: boolean
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
          created_at: string
          created_by: string | null
          estado: string
          evento: string | null
          gerado_por: string | null
          html: string
          id: string
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
          created_at?: string
          created_by?: string | null
          estado?: string
          evento?: string | null
          gerado_por?: string | null
          html?: string
          id?: string
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
          created_at?: string
          created_by?: string | null
          estado?: string
          evento?: string | null
          gerado_por?: string | null
          html?: string
          id?: string
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
      crm_casos: {
        Row: {
          aceite_comercial_em: string | null
          aceite_comercial_registrado_por: string | null
          app_access_status: string
          app_visibility_level: string
          archive_motivo: string | null
          archived_at: string | null
          archived_by: string | null
          ativacao_operacional: string | null
          ativado_em: string | null
          ativado_por: string | null
          ativo: boolean
          cliente_id: string | null
          codigo: string
          codigos_legados: string[]
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
          piloto: boolean
          preparacao_status: string | null
          prioridade: string
          proxima_acao: string | null
          responsavel_id: string | null
          resumo: string | null
          risco: string | null
          selo_interno: string | null
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
          aceite_comercial_em?: string | null
          aceite_comercial_registrado_por?: string | null
          app_access_status?: string
          app_visibility_level?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativacao_operacional?: string | null
          ativado_em?: string | null
          ativado_por?: string | null
          ativo?: boolean
          cliente_id?: string | null
          codigo: string
          codigos_legados?: string[]
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
          piloto?: boolean
          preparacao_status?: string | null
          prioridade?: string
          proxima_acao?: string | null
          responsavel_id?: string | null
          resumo?: string | null
          risco?: string | null
          selo_interno?: string | null
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
          aceite_comercial_em?: string | null
          aceite_comercial_registrado_por?: string | null
          app_access_status?: string
          app_visibility_level?: string
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          ativacao_operacional?: string | null
          ativado_em?: string | null
          ativado_por?: string | null
          ativo?: boolean
          cliente_id?: string | null
          codigo?: string
          codigos_legados?: string[]
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
          piloto?: boolean
          preparacao_status?: string | null
          prioridade?: string
          proxima_acao?: string | null
          responsavel_id?: string | null
          resumo?: string | null
          risco?: string | null
          selo_interno?: string | null
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
          entrega_cliente: boolean
          file_hash: string | null
          id: string
          liberado_cliente: boolean
          liberado_em: string | null
          liberado_por: string | null
          mime_type: string | null
          nome_arquivo: string | null
          observacoes: string | null
          organization_id: string
          origem: string
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
          entrega_cliente?: boolean
          file_hash?: string | null
          id?: string
          liberado_cliente?: boolean
          liberado_em?: string | null
          liberado_por?: string | null
          mime_type?: string | null
          nome_arquivo?: string | null
          observacoes?: string | null
          organization_id: string
          origem?: string
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
          entrega_cliente?: boolean
          file_hash?: string | null
          id?: string
          liberado_cliente?: boolean
          liberado_em?: string | null
          liberado_por?: string | null
          mime_type?: string | null
          nome_arquivo?: string | null
          observacoes?: string | null
          organization_id?: string
          origem?: string
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
          client_id: string | null
          created_at: string
          created_by: string | null
          descricao: string | null
          document_id: string | null
          id: string
          motivo_recusa: string | null
          obrigatorio: boolean
          organization_id: string
          prazo: string | null
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
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          document_id?: string | null
          id?: string
          motivo_recusa?: string | null
          obrigatorio?: boolean
          organization_id: string
          prazo?: string | null
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
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          document_id?: string | null
          id?: string
          motivo_recusa?: string | null
          obrigatorio?: boolean
          organization_id?: string
          prazo?: string | null
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
          derivada_de_id: string | null
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
          derivada_de_id?: string | null
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
          derivada_de_id?: string | null
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
          case_id: string
          client_summary_status: string
          confidence_level: string
          country_context: string | null
          created_at: string
          created_by: string | null
          demo: boolean
          external_research_authorization_status: string
          external_research_gate_status: string
          family_line_summary_internal: string | null
          id: string
          internal_risk_summary: string | null
          next_research_action: string | null
          next_research_action_due_at: string | null
          organization_id: string
          research_objective: string
          research_scope_summary: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_researcher_user_id?: string | null
          case_id: string
          client_summary_status?: string
          confidence_level?: string
          country_context?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          external_research_authorization_status?: string
          external_research_gate_status?: string
          family_line_summary_internal?: string | null
          id?: string
          internal_risk_summary?: string | null
          next_research_action?: string | null
          next_research_action_due_at?: string | null
          organization_id: string
          research_objective?: string
          research_scope_summary?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_researcher_user_id?: string | null
          case_id?: string
          client_summary_status?: string
          confidence_level?: string
          country_context?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          external_research_authorization_status?: string
          external_research_gate_status?: string
          family_line_summary_internal?: string | null
          id?: string
          internal_risk_summary?: string | null
          next_research_action?: string | null
          next_research_action_due_at?: string | null
          organization_id?: string
          research_objective?: string
          research_scope_summary?: string | null
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
          event_id: string | null
          evidence_status: string
          evidence_type: string
          external_reference: string | null
          fornecida_pelo_cliente: boolean
          id: string
          organization_id: string
          origem_externa: boolean
          person_id: string | null
          relationship_id: string | null
          research_case_id: string
          responsible_user_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sensitivity_level: string
          source_id: string | null
          title: string
          updated_at: string
          updated_by: string | null
          validated_at: string | null
          validated_by: string | null
          validation_rationale: string | null
        }
        Insert: {
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
          event_id?: string | null
          evidence_status?: string
          evidence_type?: string
          external_reference?: string | null
          fornecida_pelo_cliente?: boolean
          id?: string
          organization_id: string
          origem_externa?: boolean
          person_id?: string | null
          relationship_id?: string | null
          research_case_id: string
          responsible_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sensitivity_level?: string
          source_id?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_rationale?: string | null
        }
        Update: {
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
          event_id?: string | null
          evidence_status?: string
          evidence_type?: string
          external_reference?: string | null
          fornecida_pelo_cliente?: boolean
          id?: string
          organization_id?: string
          origem_externa?: boolean
          person_id?: string | null
          relationship_id?: string | null
          research_case_id?: string
          responsible_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sensitivity_level?: string
          source_id?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_rationale?: string | null
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
          gender_or_descriptor: string | null
          id: string
          identity_status: string
          is_minor: boolean
          living_status: string
          nationality_context: string | null
          notes_internal: string | null
          organization_id: string
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
          gender_or_descriptor?: string | null
          id?: string
          identity_status?: string
          is_minor?: boolean
          living_status?: string
          nationality_context?: string | null
          notes_internal?: string | null
          organization_id: string
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
          gender_or_descriptor?: string | null
          id?: string
          identity_status?: string
          is_minor?: boolean
          living_status?: string
          nationality_context?: string | null
          notes_internal?: string | null
          organization_id?: string
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
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          client_release_authorized_at: string | null
          client_release_authorized_by: string | null
          content: string
          created_at: string
          created_by: string | null
          file_hash: string | null
          file_path: string | null
          generated_from_snapshot_at: string | null
          id: string
          organization_id: string
          report_type: string
          research_case_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_release_authorized_at?: string | null
          client_release_authorized_by?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          file_hash?: string | null
          file_path?: string | null
          generated_from_snapshot_at?: string | null
          id?: string
          organization_id: string
          report_type?: string
          research_case_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_release_authorized_at?: string | null
          client_release_authorized_by?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          file_hash?: string | null
          file_path?: string | null
          generated_from_snapshot_at?: string | null
          id?: string
          organization_id?: string
          report_type?: string
          research_case_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
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
          created_at: string
          created_by: string | null
          external_source: boolean
          id: string
          notes_internal: string | null
          organization_id: string
          publication_or_record_date: string | null
          repository_or_institution: string | null
          research_case_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
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
          created_at?: string
          created_by?: string | null
          external_source?: boolean
          id?: string
          notes_internal?: string | null
          organization_id: string
          publication_or_record_date?: string | null
          repository_or_institution?: string | null
          research_case_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
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
          created_at?: string
          created_by?: string | null
          external_source?: boolean
          id?: string
          notes_internal?: string | null
          organization_id?: string
          publication_or_record_date?: string | null
          repository_or_institution?: string | null
          research_case_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
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
            foreignKeyName: "service_orders_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "portal_casos"
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
          bloqueado_em: string | null
          bloqueio: boolean
          caso_id: string | null
          concluida_em: string | null
          created_at: string
          created_by: string | null
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
      portal_casos: {
        Row: {
          app_access_status: string | null
          ativo: boolean | null
          cliente_id: string | null
          codigo: string | null
          created_at: string | null
          id: string | null
          organization_id: string | null
          pais: string | null
          status: string | null
          suspenso_em: string | null
          titulo: string | null
          updated_at: string | null
          via: string | null
        }
        Insert: {
          app_access_status?: string | null
          ativo?: boolean | null
          cliente_id?: string | null
          codigo?: string | null
          created_at?: string | null
          id?: string | null
          organization_id?: string | null
          pais?: string | null
          status?: string | null
          suspenso_em?: string | null
          titulo?: string | null
          updated_at?: string | null
          via?: string | null
        }
        Update: {
          app_access_status?: string | null
          ativo?: boolean | null
          cliente_id?: string | null
          codigo?: string | null
          created_at?: string | null
          id?: string | null
          organization_id?: string | null
          pais?: string | null
          status?: string | null
          suspenso_em?: string | null
          titulo?: string | null
          updated_at?: string | null
          via?: string | null
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
      has_org_role: {
        Args: { _org: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string }; Returns: boolean }
      is_staff_ativo: { Args: { _org: string }; Returns: boolean }
      ops_painel: { Args: { _org: string }; Returns: Json }
      ops_sla_status: {
        Args: { _alerta_em: string; _prazo_em: string; _status: string }
        Returns: string
      }
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
