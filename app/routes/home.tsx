import type { Route } from "./+types/home";
import { Link } from "react-router";
import { classeBotao } from "~/components/Botao";
import { TITULOS_ETAPAS } from "~/utils/cadastro";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NaRua — Sistema de Cadastro e Acompanhamento" },
    {
      name: "description",
      content: "Cadastro digital e acompanhamento de pessoas em situação de rua.",
    },
  ];
}


export default function Home() {
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <section aria-labelledby="titulo-inicio" className="space-y-4">
        <h1 id="titulo-inicio" className="text-3xl font-semibold leading-tight md:text-4xl">
          NaRua — Sistema de Cadastro e Acompanhamento
        </h1>
        <p className="max-w-2xl text-lg text-gray-700 dark:text-gray-200">
          Uma ferramenta para organizar registros, facilitar o acompanhamento e apoiar o atendimento às pessoas em
          situação de rua.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/cadastro" className={classeBotao("primario")}>
            Novo cadastro
          </Link>
          <Link to="/painel" className={classeBotao("secundario")}>
            Painel de acompanhamento
          </Link>
        </div>
      </section>

      <section aria-labelledby="titulo-acesso" className="space-y-4">
        <h2 id="titulo-acesso" className="text-xl font-semibold">
          Acesso rápido
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          <li className="cartao flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Novo cadastro</h3>
            <p className="flex-1 text-gray-700 dark:text-gray-200">
              Registre uma pessoa em {TITULOS_ETAPAS.length} etapas, seguindo o Formulário Suplementar 2 do Cadastro Único.
            </p>
            <Link to="/cadastro" className={classeBotao("primario", "self-start")}>
              Iniciar cadastro
            </Link>
          </li>
          <li className="cartao flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Painel de acompanhamento</h3>
            <p className="flex-1 text-gray-700 dark:text-gray-200">
              Veja os indicadores, busque cadastros por nome ou situação e registre anotações de acompanhamento.
            </p>
            <Link to="/painel" className={classeBotao("secundario", "self-start")}>
              Abrir painel
            </Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="titulo-uso" className="space-y-4">
        <h2 id="titulo-uso" className="text-xl font-semibold">
          Como usar
        </h2>
        <ol className="list-decimal space-y-2 pl-6 text-gray-800 dark:text-gray-100">
          <li>
            Acesse <Link to="/cadastro" className="font-medium text-emerald-800 underline dark:text-emerald-300">Novo cadastro</Link>.
          </li>
          <li>
            Preencha as {TITULOS_ETAPAS.length} etapas: {TITULOS_ETAPAS.join(", ")}.
          </li>
          <li>
            Registre o consentimento da pessoa entrevistada e a assinatura do responsável familiar, que são obrigatórios.
          </li>
          <li>
            Conclua o cadastro. Os dados são gravados e você segue para a ficha da pessoa, onde é possível atualizar o
            status de acompanhamento e adicionar anotações.
          </li>
        </ol>
      </section>

      <section aria-labelledby="titulo-aviso" className="space-y-2 rounded-lg bg-gray-100 p-5 dark:bg-gray-900">
        <h2 id="titulo-aviso" className="text-xl font-semibold">
          Antes de começar
        </h2>
        <ul className="list-disc space-y-1 pl-6 text-gray-800 dark:text-gray-100">
          <li>O endereço informado é o do equipamento de referência (CRAS, CREAS, abrigo), nunca um domicílio.</li>
          <li>Cadastros sem atualização há mais de 24 meses são sinalizados para uma nova entrevista.</li>
          <li>Os dados são sensíveis: registre-os somente com o consentimento da pessoa atendida.</li>
        </ul>
      </section>
    </main>
  );
}
