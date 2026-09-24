// types/database.ts — Supabase PostgreSQL Raw Types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          full_name: string;
          avatar_url: string | null;
          bank_name: string | null;
          bank_account_number: string | null;
          bank_account_holder: string | null;
          vietqr_syntax_template: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      properties: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string;
          total_floors: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      rooms: {
        Row: {
          id: string;
          property_id: string;
          room_code: string;
          floor: number;
          base_rent: number;
          status: 'vacant' | 'occupied' | 'reserved' | 'maintenance';
          area_m2: number | null;
          max_occupants: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
      tenants: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          national_id: string;
          id_issue_date: string | null;
          id_issue_place: string | null;
          avatar_url: string | null;
          id_front_image_url: string | null;
          id_back_image_url: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          status: 'active' | 'moved_out';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
      };
      leases: {
        Row: {
          id: string;
          room_id: string;
          tenant_id: string;
          start_date: string;
          end_date: string;
          monthly_rent: number;
          deposit_amount: number;
          deposit_status: 'held' | 'partially_refunded' | 'refunded' | 'forfeited';
          status: 'active' | 'expired' | 'terminated';
          contract_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leases']['Insert']>;
      };
      utility_rates: {
        Row: {
          id: string;
          property_id: string;
          electric_rate_type: 'flat' | 'tiered';
          electric_rate: number;
          water_rate_type: 'cubic_meter' | 'per_head' | 'fixed_room';
          water_rate: number;
          internet_fee: number;
          garbage_fee: number;
          parking_fee_motorbike: number;
          elevator_fee: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['utility_rates']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['utility_rates']['Insert']>;
      };
      meter_readings: {
        Row: {
          id: string;
          property_id: string;
          room_id: string;
          billing_month: string;
          electric_previous: number;
          electric_current: number;
          electric_usage: number;
          water_previous: number;
          water_current: number;
          water_usage: number;
          recorded_at: string;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['meter_readings']['Row'], 'id' | 'electric_usage' | 'water_usage' | 'recorded_at'>;
        Update: Partial<Database['public']['Tables']['meter_readings']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          property_id: string;
          room_id: string;
          tenant_id: string | null;
          lease_id: string | null;
          invoice_code: string;
          billing_month: string;
          issue_date: string;
          due_date: string;
          total_amount: number;
          amount_paid: number;
          balance_due: number;
          payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
          vietqr_payload: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          item_type: 'rent' | 'electricity' | 'water' | 'internet' | 'garbage' | 'parking' | 'other';
          description: string;
          previous_reading: number | null;
          current_reading: number | null;
          quantity: number;
          unit_price: number;
          amount: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoice_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          amount: number;
          payment_method: 'vietqr' | 'bank_transfer' | 'cash' | 'zalo_pay';
          transaction_ref: string | null;
          payment_date: string;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          tenant_id: string | null;
          invoice_id: string | null;
          channel: 'zalo' | 'sms' | 'system';
          message_content: string;
          delivery_status: 'queued' | 'sent' | 'failed';
          sent_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
}
