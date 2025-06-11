export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      marketplace_suppliers: {
        Row: {
          created_at: string
          id: number
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          avg_sales: number
          category: string
          code: string
          created_at: string
          current_stock: number
          harga_jual: number | null
          id: number
          last_update: string
          max_stock: number
          min_stock: number
          name: string
          status: string
          updated_at: string
          wac_harga_beli: number | null
        }
        Insert: {
          avg_sales: number
          category: string
          code: string
          created_at?: string
          current_stock: number
          harga_jual?: number | null
          id?: number
          last_update: string
          max_stock: number
          min_stock: number
          name: string
          status: string
          updated_at?: string
          wac_harga_beli?: number | null
        }
        Update: {
          avg_sales?: number
          category?: string
          code?: string
          created_at?: string
          current_stock?: number
          harga_jual?: number | null
          id?: number
          last_update?: string
          max_stock?: number
          min_stock?: number
          name?: string
          status?: string
          updated_at?: string
          wac_harga_beli?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          default_role: Database["public"]["Enums"]["user_role"] | null
          id: string
          owner_name: string | null
          phone: string | null
          store_name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          default_role?: Database["public"]["Enums"]["user_role"] | null
          id: string
          owner_name?: string | null
          phone?: string | null
          store_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          default_role?: Database["public"]["Enums"]["user_role"] | null
          id?: string
          owner_name?: string | null
          phone?: string | null
          store_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_details: {
        Row: {
          created_at: string
          harga_per_unit: number
          id: number
          product_id: number
          purchase_id: number
          qty: number
          total_harga: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          harga_per_unit: number
          id?: number
          product_id: number
          purchase_id: number
          qty: number
          total_harga: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          harga_per_unit?: number
          id?: number
          product_id?: number
          purchase_id?: number
          qty?: number
          total_harga?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_details_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          akun: string
          created_at: string
          id: number
          marketplace_supplier: string
          no_pesanan: string
          status: string
          tanggal_pemesanan: string
          total_harga: number
          updated_at: string
        }
        Insert: {
          akun: string
          created_at?: string
          id?: number
          marketplace_supplier: string
          no_pesanan: string
          status: string
          tanggal_pemesanan: string
          total_harga: number
          updated_at?: string
        }
        Update: {
          akun?: string
          created_at?: string
          id?: number
          marketplace_supplier?: string
          no_pesanan?: string
          status?: string
          tanggal_pemesanan?: string
          total_harga?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          cashier_name: string
          created_at: string | null
          discount_amount: number | null
          id: number
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          sale_date: string | null
          sale_number: string
          status: Database["public"]["Enums"]["sale_status"] | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          total_cost: number
          total_margin: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cashier_name: string
          created_at?: string | null
          discount_amount?: number | null
          id?: number
          notes?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          sale_date?: string | null
          sale_number: string
          status?: Database["public"]["Enums"]["sale_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          total_cost?: number
          total_margin?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cashier_name?: string
          created_at?: string | null
          discount_amount?: number | null
          id?: number
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          sale_date?: string | null
          sale_number?: string
          status?: Database["public"]["Enums"]["sale_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          total_cost?: number
          total_margin?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales_details: {
        Row: {
          created_at: string | null
          id: number
          margin: number
          product_code: string
          product_id: number | null
          product_name: string
          quantity: number
          sale_id: number
          total_cost: number
          total_price: number
          unit_cost: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          margin: number
          product_code: string
          product_id?: number | null
          product_name: string
          quantity: number
          sale_id: number
          total_cost: number
          total_price: number
          unit_cost: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: number
          margin?: number
          product_code?: string
          product_id?: number | null
          product_name?: string
          quantity?: number
          sale_id?: number
          total_cost?: number
          total_price?: number
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_details_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: number
          movement_type: string
          notes: string | null
          product_id: number | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          movement_type: string
          notes?: string | null
          product_id?: number | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          movement_type?: string
          notes?: string | null
          product_id?: number | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_accounts: {
        Row: {
          account_name: string
          created_at: string
          id: number
          marketplace_supplier_id: number
          updated_at: string
        }
        Insert: {
          account_name: string
          created_at?: string
          id?: number
          marketplace_supplier_id: number
          updated_at?: string
        }
        Update: {
          account_name?: string
          created_at?: string
          id?: number
          marketplace_supplier_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_accounts_marketplace_supplier_id_fkey"
            columns: ["marketplace_supplier_id"]
            isOneToOne: false
            referencedRelation: "marketplace_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      payment_method: "cash" | "card" | "qris" | "bank_transfer" | "e_wallet"
      sale_status: "completed" | "cancelled" | "returned"
      user_role: "owner" | "kasir"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_method: ["cash", "card", "qris", "bank_transfer", "e_wallet"],
      sale_status: ["completed", "cancelled", "returned"],
      user_role: ["owner", "kasir"],
    },
  },
} as const
