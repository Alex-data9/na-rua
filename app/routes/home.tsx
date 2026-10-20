import type { Route } from "./+types/home";
import { Link, useRouteLoaderData } from "react-router";
import { Seta, classeBotao } from "~/components/Botao";
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

const dois = (n: number) => String(n).padStart(2, "0");

const PASSOS = [
  <>
    Acesse <Link to="/cadastro" className="link">Novo cadastro</Link>.
  </>,
  <>Preencha as {TITULOS_ETAPAS.length} etapas, na ordem do Formulário Suplementar 2.</>,
  <>Registre o consentimento da pessoa entrevistada e a assinatura do responsável familiar, que são obrigatórios.</>,
  <>
    Conclua o cadastro. Os dados são gravados e você recebe a confirmação. A consulta e o acompanhamento dos cadastros
    ficam com os administradores.
  </>,
];

export default function Home() {
  const admin = useRouteLoaderData<{ admin: boolean }>("root")?.admin ?? false;
  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* Abertura */}
      <section aria-labelledby="titulo-inicio" className="grid gap-8 border-b border-tinta py-10 md:grid-cols-12 md:py-16 dark:border-gray-700">
        <div className="flex flex-col justify-between gap-8 md:col-span-7">
          <p className="rotulo-tecnico">N° 01 — Sistema de cadastro e acompanhamento</p>
          <div className="space-y-6">
            <h1 id="titulo-inicio" className="titulo-display text-[2.75rem] leading-[0.95] sm:text-6xl lg:text-7xl">
              Cadastro que chega até quem está na rua<span className="text-sinal-500">.</span>
            </h1>
            <p className="max-w-xl text-lg text-gray-700 dark:text-gray-300">
              Uma ferramenta para organizar registros, facilitar o acompanhamento e apoiar o atendimento às pessoas em
              situação de rua.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/cadastro" className={classeBotao("primario")}>
              Novo cadastro <Seta />
            </Link>
            <Link to={admin ? "/painel" : "/login"} className={classeBotao("secundario")}>
              {admin ? "Painel de acompanhamento" : "Acesso restrito"}
            </Link>
          </div>
        </div>

        {/* Bloco vermelho: as etapas do cadastro como composição tipográfica */}
        <div className="relative flex min-h-[26rem] flex-col justify-between gap-8 bg-sinal-500 p-6 text-tinta md:col-span-5 md:min-h-[32rem] md:p-8">
          <div className="flex items-start justify-between font-mono text-[11px] font-medium tracking-[0.14em] uppercase">
            <span>Formulário<br />Suplementar 2</span>
            <span className="text-right">Cadastro<br />Único / MDS</span>
          </div>
          <div>
            <p className="titulo-display text-[7rem] leading-[0.8] font-black font-stretch-expanded md:text-[9rem]">
              {dois(TITULOS_ETAPAS.length)}
            </p>
            <p className="mt-2 font-mono text-xs font-semibold tracking-[0.14em] uppercase">Etapas</p>
          </div>
          <ol className="divide-y divide-tinta/30 border-y border-tinta/30 text-sm font-medium">
            {TITULOS_ETAPAS.map((t, i) => (
              <li key={t} className="flex items-baseline gap-3 py-1.5">
                <span className="font-mono text-[11px]">{dois(i + 1)}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Acesso rápido */}
      <section aria-labelledby="titulo-acesso" className="py-10 md:py-14">
        <h2 id="titulo-acesso" className="rotulo-tecnico mb-4">
          02 — Acesso rápido
        </h2>
        <ul className="grid border-t border-tinta md:grid-cols-2 dark:border-gray-700">
          <AcessoRapido
            to="/cadastro"
            numero="A"
            titulo="Novo cadastro"
            texto={`Registre uma pessoa em ${TITULOS_ETAPAS.length} etapas, seguindo o Formulário Suplementar 2 do Cadastro Único.`}
          />
          <AcessoRapido
            to={admin ? "/painel" : "/login"}
            numero="B"
            titulo={admin ? "Painel de acompanhamento" : "Acesso restrito"}
            texto={
              admin
                ? "Veja os indicadores, busque cadastros por nome ou situação, registre anotações e exclua cadastros."
                : "Área dos administradores: consulta, acompanhamento e exclusão de cadastros. Entre para acessar."
            }
          />
        </ul>
      </section>

      {/* Como usar */}
      <section aria-labelledby="titulo-uso" className="pb-10 md:pb-14">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="rotulo-tecnico mb-3">03 — Como usar</p>
            <h2 id="titulo-uso" className="titulo-display text-3xl md:text-4xl">
              Quatro passos<span className="text-sinal-500">.</span>
            </h2>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2 md:col-span-8">
            {PASSOS.map((p, i) => (
              <li key={i} className="border-t-2 border-tinta pt-3 dark:border-gray-300">
                <span className="mb-2 block font-mono text-sm font-semibold text-sinal-700 dark:text-sinal-500">
                  {dois(i + 1)}
                </span>
                <p className="text-gray-800 dark:text-gray-200">{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Avisos */}
      <section aria-labelledby="titulo-aviso" className="grid gap-6 bg-tinta p-6 text-white md:grid-cols-12 md:p-10">
        <div className="md:col-span-4">
          <p className="rotulo-tecnico mb-3 !text-sinal-500">04 — Atenção</p>
          <h2 id="titulo-aviso" className="titulo-display text-3xl">
            Antes de começar
          </h2>
        </div>
        <ul className="space-y-4 md:col-span-8">
          {[
            "O endereço informado é o do equipamento de referência (CRAS, CREAS, abrigo), nunca um domicílio.",
            "Cadastros sem atualização há mais de 24 meses são sinalizados para uma nova entrevista.",
            "Os dados são sensíveis: registre-os somente com o consentimento da pessoa atendida.",
          ].map((t) => (
            <li key={t} className="flex gap-3 border-b border-white/15 pb-4 text-gray-200 last:border-0 last:pb-0">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-sinal-500" />
              {t}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function AcessoRapido({ to, numero, titulo, texto }: { to: string; numero: string; titulo: string; texto: string }) {
  return (
    <li className="border-b border-tinta md:odd:border-r dark:border-gray-700">
      <Link
        to={to}
        className="group flex h-full flex-col gap-6 p-5 transition-colors hover:bg-tinta hover:text-white md:p-8 dark:hover:bg-gray-100 dark:hover:text-tinta"
      >
        <span className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold">{numero}</span>
          <Seta className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:text-sinal-500" />
        </span>
        <span>
          <span className="titulo-display block text-2xl md:text-3xl">{titulo}</span>
          <span className="mt-2 block max-w-md text-gray-700 group-hover:text-gray-300 dark:text-gray-300 dark:group-hover:text-gray-700">
            {texto}
          </span>
        </span>
      </Link>
    </li>
  );
}
