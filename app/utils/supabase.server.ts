import { createClient } from "@supabase/supabase-js";

// Cliente não tipado via generics: o schema real ainda não existe no Supabase
// (ver supabase/migrations/0001_init.sql). Os models em app/models tipam as
// respostas manualmente com os tipos de app/utils/supabase.types.ts.
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos (veja .env.example).",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
