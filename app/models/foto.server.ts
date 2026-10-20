import { getSupabaseClient } from "~/utils/supabase.server";
import { FOTO_TIPO } from "~/utils/foto";

const BUCKET = "fotos";
const VALIDADE_URL_SEGUNDOS = 5 * 60;

export async function salvarFoto(pessoaId: string, arquivo: File) {
  const supabase = getSupabaseClient();
  const caminho = `${pessoaId}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, await arquivo.arrayBuffer(), { contentType: FOTO_TIPO, upsert: true });
  if (error) throw new Error(`Falha ao enviar a foto: ${error.message}`);

  const { error: erroPessoa } = await supabase.from("pessoa").update({ foto_url: caminho }).eq("id", pessoaId);
  if (erroPessoa) throw new Error(`Falha ao vincular a foto ao cadastro: ${erroPessoa.message}`);
}

// Link temporário (o bucket é privado). Nulo se não houver foto ou se não for possível assinar.
export async function urlDaFoto(caminho: string | null) {
  if (!caminho) return null;
  const { data, error } = await getSupabaseClient().storage.from(BUCKET).createSignedUrl(caminho, VALIDADE_URL_SEGUNDOS);
  return error ? null : data.signedUrl;
}
