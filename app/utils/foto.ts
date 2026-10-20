// Regras da foto da pessoa cadastrada. O navegador sempre reduz e converte para JPEG antes de enviar;
// o servidor revalida tipo, tamanho e o cabeçalho real do arquivo (não confia no que o cliente declara).
export const FOTO_TIPO = "image/jpeg";
export const FOTO_MAX_BYTES = 2 * 1024 * 1024; // mesmo limite do bucket "fotos"
export const FOTO_LADO_MAX = 1024; // px do maior lado depois de reduzir
export const FOTO_QUALIDADE = 0.82;

// Foto é opcional: ausente ou vazia é válido.
export function validarFoto(valor: FormDataEntryValue | null): string | null {
  if (!(valor instanceof File) || valor.size === 0) return null;
  if (valor.type !== FOTO_TIPO) return "A foto precisa ser uma imagem JPEG.";
  if (valor.size > FOTO_MAX_BYTES) return "A foto é grande demais (máximo de 2 MB).";
  return null;
}

// JPEG começa com FF D8 FF.
export async function ehJpegDeVerdade(arquivo: File) {
  const inicio = new Uint8Array(await arquivo.slice(0, 3).arrayBuffer());
  return inicio[0] === 0xff && inicio[1] === 0xd8 && inicio[2] === 0xff;
}
