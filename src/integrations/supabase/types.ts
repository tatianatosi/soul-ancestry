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
          observacoes: string | null
          organization_id: string
          pais_interesse: string | null
          status: string
          telefone: string | null
          updated_at: string
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
          observacoes?: string | null
          organization_id: string
          pais_interesse?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
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
          observacoes?: string | null
          organization_id?: string
          pais_interesse?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
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
          demo: boolean
          documentos_minimos_ok: boolean
          hipotese_elegibilidade: string | null
          id: string
          info_cliente_liberada: boolean
          organization_id: string
          pagamento_confirmado: boolean
          pais: string | null
          status: string
          titulo: string
          updated_at: string
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
          demo?: boolean
          documentos_minimos_ok?: boolean
          hipotese_elegibilidade?: string | null
          id?: string
          info_cliente_liberada?: boolean
          organization_id: string
          pagamento_confirmado?: boolean
          pais?: string | null
          status?: string
          titulo: string
          updated_at?: string
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
          demo?: boolean
          documentos_minimos_ok?: boolean
          hipotese_elegibilidade?: string | null
          id?: string
          info_cliente_liberada?: boolean
          organization_id?: string
          pagamento_confirmado?: boolean
          pais?: string | null
          status?: string
          titulo?: string
          updated_at?: string
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
          id: string
          liberada_cliente: boolean
          organization_id: string
          origem: string
          status: string
          storage_path: string | null
          tipo: string
          titulo: string
          updated_at: string
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
          id?: string
          liberada_cliente?: boolean
          organization_id: string
          origem?: string
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
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
          id?: string
          liberada_cliente?: boolean
          organization_id?: string
          origem?: string
          status?: string
          storage_path?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
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
          caso_id: string | null
          concluida_em: string | null
          created_at: string
          created_by: string | null
          demo: boolean
          descricao: string | null
          id: string
          organization_id: string
          prazo: string | null
          prioridade: string
          responsavel_id: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id?: string | null
          concluida_em?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao?: string | null
          id?: string
          organization_id: string
          prazo?: string | null
          prioridade?: string
          responsavel_id?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          archive_motivo?: string | null
          archived_at?: string | null
          archived_by?: string | null
          caso_id?: string | null
          concluida_em?: string | null
          created_at?: string
          created_by?: string | null
          demo?: boolean
          descricao?: string | null
          id?: string
          organization_id?: string
          prazo?: string | null
          prioridade?: string
          responsavel_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string
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
      bootstrap_minha_organizacao: { Args: { _nome?: string }; Returns: string }
      can_write: { Args: { _org: string }; Returns: boolean }
      can_write_financeiro: { Args: { _org: string }; Returns: boolean }
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
