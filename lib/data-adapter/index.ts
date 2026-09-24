// lib/data-adapter/index.ts — Dual-Mode Adapter Factory & Resolver
import { TrolyRepository } from './interface';
import { LocalStorageAdapter } from './local-adapter';
import { SupabaseAdapter } from './supabase-adapter';

/**
 * Checks whether valid Supabase environment variables exist at runtime
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    url.startsWith('http') &&
    !url.includes('placeholder') &&
    !key.includes('YOUR_SUPABASE') &&
    !key.includes('your_supabase') &&
    !key.includes('placeholder') &&
    key.length > 20
  );
}

/**
 * Singleton Data Provider Instance
 */
class DataAdapterProvider {
  private static instance: TrolyRepository | null = null;

  public static getInstance(): TrolyRepository {
    if (!this.instance) {
      this.instance = isSupabaseConfigured()
        ? new SupabaseAdapter()
        : new LocalStorageAdapter();
    }
    return this.instance;
  }
}

export const dataAdapter: TrolyRepository = DataAdapterProvider.getInstance();
export * from './interface';
export * from './seed-data';
