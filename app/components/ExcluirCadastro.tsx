import { useRef } from "react";
import { Form } from "react-router";
import { Botao } from "./Botao";

// Exclusão definitiva com confirmação. A caixa é um <dialog> nativo: o foco fica preso nela e Esc cancela.
// O servidor confere o administrador de novo (a caixa é só proteção contra clique acidental).
export function ExcluirCadastro({ nome, excluindo }: { nome: string; excluindo: boolean }) {
  const caixa = useRef<HTMLDialogElement>(null);

  return (
    <section className="cartao border-sinal-600 dark:border-sinal-500" aria-labelledby="titulo-excluir">
      <h2 id="titulo-excluir" className="titulo-display mb-2 text-xl">Excluir cadastro</h2>
      <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        Remove definitivamente este cadastro, as anotações e a foto da base. Não há como desfazer.
      </p>
      <Botao variante="secundario" onClick={() => caixa.current?.showModal()}>
        Excluir cadastro…
      </Botao>

      <dialog
        ref={caixa}
        aria-labelledby="titulo-confirmar"
        className="m-auto w-[calc(100%-2rem)] max-w-md border border-tinta bg-white p-6 text-tinta backdrop:bg-black/60 dark:border-gray-300 dark:bg-gray-900 dark:text-gray-100"
      >
        <h3 id="titulo-confirmar" className="titulo-display mb-3 text-2xl">
          Excluir este cadastro?
        </h3>
        <p className="mb-6 text-sm">
          O cadastro de <strong>{nome}</strong>, as anotações e a foto serão apagados da base. Esta ação não pode ser
          desfeita.
        </p>
        <Form method="post" className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <input type="hidden" name="intent" value="excluir" />
          <Botao variante="secundario" onClick={() => caixa.current?.close()} disabled={excluindo}>
            Cancelar
          </Botao>
          <Botao type="submit" variante="destaque" carregando={excluindo} textoCarregando="Excluindo...">
            Excluir definitivamente
          </Botao>
        </Form>
      </dialog>
    </section>
  );
}
