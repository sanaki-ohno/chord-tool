// src/lib/supabaseClient.ts - Supabase クライアント初期化
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  const message =
    'Supabase 環境変数 (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) が設定されていません。';
  console.error(message);
  throw new Error(message);
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
