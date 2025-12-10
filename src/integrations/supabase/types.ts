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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          barbearia_id: string
          barbeiro_id: string
          cliente_id: string | null
          cliente_nome: string
          created_at: string
          data: string
          hora: string
          id: string
          observacoes: string | null
          servico_id: string
          status: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          barbearia_id: string
          barbeiro_id: string
          cliente_id?: string | null
          cliente_nome: string
          created_at?: string
          data: string
          hora: string
          id?: string
          observacoes?: string | null
          servico_id: string
          status?: string
          updated_at?: string
          valor_total: number
        }
        Update: {
          barbearia_id?: string
          barbeiro_id?: string
          cliente_id?: string | null
          cliente_nome?: string
          created_at?: string
          data?: string
          hora?: string
          id?: string
          observacoes?: string | null
          servico_id?: string
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_barbearia_id_fkey"
            columns: ["barbearia_id"]
            isOneToOne: false
            referencedRelation: "barbearias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_barbeiro_id_fkey"
            columns: ["barbeiro_id"]
            isOneToOne: false
            referencedRelation: "barbeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      barbearias: {
        Row: {
          created_at: string
          descricao: string | null
          email: string
          endereco: string | null
          id: string
          logo_url: string | null
          nome: string
          plano_tipo: string
          plano_valor: number
          proprietario_nome: string
          senha_hash: string | null
          slug: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          email: string
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          plano_tipo?: string
          plano_valor?: number
          proprietario_nome: string
          senha_hash?: string | null
          slug: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          email?: string
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          plano_tipo?: string
          plano_valor?: number
          proprietario_nome?: string
          senha_hash?: string | null
          slug?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      barbeiros: {
        Row: {
          ativo: boolean
          avaliacao: number | null
          barbearia_id: string
          bio: string | null
          created_at: string
          especialidades: string[] | null
          foto_url: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avaliacao?: number | null
          barbearia_id: string
          bio?: string | null
          created_at?: string
          especialidades?: string[] | null
          foto_url?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avaliacao?: number | null
          barbearia_id?: string
          bio?: string | null
          created_at?: string
          especialidades?: string[] | null
          foto_url?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "barbeiros_barbearia_id_fkey"
            columns: ["barbearia_id"]
            isOneToOne: false
            referencedRelation: "barbearias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          barbearia_id: string | null
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          barbearia_id?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          barbearia_id?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_barbearia_id_fkey"
            columns: ["barbearia_id"]
            isOneToOne: false
            referencedRelation: "barbearias"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          barbearia_id: string
          created_at: string
          descricao: string | null
          duracao_minutos: number
          id: string
          nome: string
          preco: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          barbearia_id: string
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome: string
          preco: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          barbearia_id?: string
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome?: string
          preco?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_barbearia_id_fkey"
            columns: ["barbearia_id"]
            isOneToOne: false
            referencedRelation: "barbearias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_barbearia_by_slug: {
        Args: { p_slug: string }
        Returns: {
          id: string
          nome: string
          senha_hash: string
          slug: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
