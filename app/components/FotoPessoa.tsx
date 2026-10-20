import { useEffect, useRef, useState } from "react";
import { FOTO_LADO_MAX, FOTO_QUALIDADE, FOTO_TIPO } from "~/utils/foto";
import { classeBotao, Spinner } from "./Botao";
import { Erro } from "./campos";

// Reduz e converte para JPEG no próprio aparelho: foto de celular tem vários MB e pode vir em HEIC.
async function prepararFoto(origem: File): Promise<File> {
  const imagem = await createImageBitmap(origem, { imageOrientation: "from-image" });
  const escala = Math.min(1, FOTO_LADO_MAX / Math.max(imagem.width, imagem.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(imagem.width * escala);
  canvas.height = Math.round(imagem.height * escala);
  canvas.getContext("2d")!.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  imagem.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, FOTO_TIPO, FOTO_QUALIDADE));
  if (!blob) throw new Error("conversão falhou");
  return new File([blob], "foto.jpg", { type: FOTO_TIPO });
}

// Foto opcional da pessoa: "Tirar foto" abre a câmera em celulares/tablets; "Escolher da fototeca" abre a galeria/arquivos.
// O arquivo final vai no campo `foto` do formulário (enviado como multipart).
export function FotoPessoa({ erro }: { erro?: string }) {
  const campoFormulario = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const fototeca = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<{ url: string; kb: number } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erroLocal, setErroLocal] = useState<string>();

  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa.url); }, [previa]);

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const origem = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!origem) return;
    setErroLocal(undefined);
    setProcessando(true);
    try {
      const pronta = await prepararFoto(origem);
      const lista = new DataTransfer();
      lista.items.add(pronta);
      campoFormulario.current!.files = lista.files;
      setPrevia({ url: URL.createObjectURL(pronta), kb: Math.round(pronta.size / 1024) });
    } catch {
      setErroLocal("Não foi possível usar esta imagem. Tente tirar outra foto ou escolher outro arquivo.");
    } finally {
      setProcessando(false);
    }
  }

  function remover() {
    campoFormulario.current!.value = "";
    setPrevia(null);
    setErroLocal(undefined);
  }

  const mensagem = erroLocal ?? erro;
  const botao = classeBotao("secundario");

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">Foto da pessoa (opcional)</p>
      <p id="foto-ajuda" className="text-xs text-gray-600 dark:text-gray-400">
        Tire a foto somente com o consentimento da pessoa. Ela é guardada em local restrito e usada apenas para
        identificar o cadastro.
      </p>

      {/* campo real enviado com o formulário; preenchido por aoEscolher */}
      <input ref={campoFormulario} type="file" name="foto" accept={FOTO_TIPO} className="sr-only" tabIndex={-1} aria-hidden="true" />
      <input ref={camera} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={aoEscolher} />
      <input ref={fototeca} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={aoEscolher} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className={botao} aria-describedby="foto-ajuda" disabled={processando} onClick={() => camera.current!.click()}>
          Tirar foto
        </button>
        <button type="button" className={botao} aria-describedby="foto-ajuda" disabled={processando} onClick={() => fototeca.current!.click()}>
          Escolher da fototeca
        </button>
      </div>

      <div role="status" aria-live="polite">
        {processando && (
          <p className="flex items-center gap-2 text-sm">
            <Spinner /> Preparando a foto...
          </p>
        )}
      </div>

      {previa && (
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <img src={previa.url} alt="Pré-visualização da foto da pessoa" className="h-40 w-40 max-w-full border border-gray-400 object-cover dark:border-gray-600" />
          <div className="space-y-2 text-sm">
            <p>Foto pronta para enviar ({previa.kb} KB).</p>
            <button type="button" className={classeBotao("secundario")} onClick={remover}>
              Remover foto
            </button>
          </div>
        </div>
      )}

      <Erro id="foto-erro" mensagem={mensagem} />
    </div>
  );
}
