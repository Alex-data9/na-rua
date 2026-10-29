import type { CSSProperties, ReactNode } from "react";
import type { Route } from "./+types/home";
import { Link, useRouteLoaderData } from "react-router";
import { Seta, classeBotao } from "~/components/Botao";
import { MapaLinha } from "~/components/MapaLinha";
import { TITULOS_ETAPAS } from "~/utils/cadastro";
import { doisDigitos } from "~/utils/numeros";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NaRua — Sistema de Cadastro e Acompanhamento" },
    {
      name: "description",
      content: "Cadastro digital e acompanhamento de pessoas em situação de rua.",
    },
  ];
}

const ordem = (i: number) => ({ "--i": i }) as CSSProperties;

const PASSOS: ReactNode[] = [
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

const AVISOS = [
  "O endereço informado é o do equipamento de referência (CRAS, CREAS, abrigo), nunca um domicílio.",
  "Cadastros sem atualização há mais de 24 meses são sinalizados para uma nova entrevista.",
  "Os dados são sensíveis: registre-os somente com o consentimento da pessoa atendida.",
];

export default function Home() {
  const admin = useRouteLoaderData<{ admin: boolean }>("root")?.admin ?? false;
  return (
    <main>
      {/* N° 01 — Abertura: asfalto, malha de ruas e a linha do cadastro */}
      <section aria-labelledby="titulo-inicio" className="asfalto relative isolate overflow-hidden text-papel">
        <div aria-hidden="true" className="paralaxe malha-ruas absolute inset-x-0 -top-16 -bottom-16 -z-10" />
        <div
          aria-hidden="true"
          className="absolute -top-40 right-[-10rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgb(255_190_61/0.22),transparent_62%)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-12 md:py-20">
          <div className="flex flex-col gap-8 md:col-span-6">
            <p className="rotulo-tecnico entra !text-poste-400" style={ordem(0)}>
              N° 01 — Sistema de cadastro e acompanhamento
            </p>
            <h1 id="titulo-inicio" className="titulo-display text-[3.4rem] sm:text-7xl lg:text-[5.75rem]">
              <span className="camada" style={ordem(0)}>Cadastro que </span>
              <span className="camada" style={ordem(1)}>chega até quem </span>
              <span className="camada text-poste-400" style={ordem(2)}>
                está na rua<span className="text-papel">.</span>
              </span>
            </h1>
            <p className="entra max-w-xl text-lg text-asfalto-200" style={ordem(1)}>
              Uma ferramenta para organizar registros, facilitar o acompanhamento e apoiar o atendimento às pessoas em
              situação de rua.
            </p>
            <div className="entra flex flex-col gap-3 sm:flex-row" style={ordem(2)}>
              <Link to="/cadastro" className={classeBotao("poste")}>
                Novo cadastro <Seta />
              </Link>
              <Link
                to={admin ? "/painel" : "/login"}
                className="btn border border-papel/60 text-papel hover:bg-papel hover:text-tinta"
              >
                {admin ? "Painel de acompanhamento" : "Acesso restrito"}
              </Link>
            </div>
          </div>
          <div className="entra md:col-span-6" style={ordem(3)}>
            <MapaLinha etapas={TITULOS_ETAPAS} />
          </div>
        </div>
      </section>

      <div className="faixa-pedestre" aria-hidden="true" />

      {/* 02 — Acesso rápido: placas de rua */}
      <section aria-labelledby="titulo-acesso" className="malha-ruas-clara">
        <div className="revelar mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 id="titulo-acesso" className="rotulo-tecnico mb-8">
            02 — Acesso rápido
          </h2>
          <ul className="grid gap-10 md:grid-cols-2 md:gap-12">
            <Placa
              to="/cadastro"
              letra="A"
              titulo="Novo cadastro"
              apoio={`${TITULOS_ETAPAS.length} etapas · Suplementar 2`}
              texto={`Registre uma pessoa em ${TITULOS_ETAPAS.length} etapas, seguindo o Formulário Suplementar 2 do Cadastro Único.`}
            />
            <Placa
              to={admin ? "/painel" : "/login"}
              letra="B"
              titulo={admin ? "Painel de acompanhamento" : "Acesso restrito"}
              apoio={admin ? "Administração" : "Somente administradores"}
              texto={
                admin
                  ? "Veja os indicadores, busque cadastros por nome ou situação, registre anotações e exclua cadastros."
                  : "Área dos administradores: consulta, acompanhamento e exclusão de cadastros. Entre para acessar."
              }
              asfalto
            />
          </ul>
        </div>
      </section>

      {/* 03 — Como usar: paradas de uma linha que se preenche ao rolar */}
      <section aria-labelledby="titulo-uso" className="border-t border-linha dark:border-asfalto-800">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-12 md:py-20">
          <div className="revelar md:col-span-4">
            <p className="rotulo-tecnico mb-3">03 — Como usar</p>
            <h2 id="titulo-uso" className="titulo-display text-5xl md:text-6xl">
              Quatro paradas<span aria-hidden="true" className="text-poste-500">.</span>
            </h2>
          </div>
          <ol className="relative md:col-span-8">
            <span aria-hidden="true" className="absolute top-3 bottom-3 left-[19px] w-1.5 rounded-full bg-linha dark:bg-asfalto-800" />
            <span aria-hidden="true" className="linha-rolagem absolute top-3 bottom-3 left-[19px] w-1.5 rounded-full bg-poste-500" />
            {PASSOS.map((p, i) => (
              <li key={i} className="revelar relative flex gap-5 pb-10 last:pb-0">
                <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border-4 border-tinta bg-caderno font-mono text-sm font-bold dark:border-asfalto-200 dark:bg-noite">
                  {doisDigitos(i + 1)}
                </span>
                <p className="pt-2 text-lg leading-relaxed text-asfalto-800 dark:text-gray-200">{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 — Atenção: folha de caderneta de campo */}
      <section aria-labelledby="titulo-aviso" className="px-4 pb-16 md:pb-24">
        <div className="revelar relative mx-auto max-w-4xl">
          <span className="absolute -top-3 right-6 z-10 rotate-3 rounded-[2px] bg-poste-400 px-3 py-1 font-mono text-[11px] font-bold tracking-[0.14em] text-tinta uppercase shadow-sm">
            04 — Atenção
          </span>
          <div className="caderneta rounded-[4px] border border-linha p-6 pl-12 shadow-[0_18px_40px_-24px_rgb(23_33_42/0.45)] md:p-10 md:pl-20 dark:border-asfalto-800">
            <h2 id="titulo-aviso" className="titulo-display relative inline-block text-4xl md:text-5xl">
              Antes de começar
              <TracoSublinhado />
            </h2>
            <ul className="mt-6 space-y-2 text-lg leading-8">
              {AVISOS.map((t) => (
                <li key={t} className="flex gap-3">
                  <SetaMao />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

// Placa de rua com poste (decorativo). Ao passar o mouse ou focar: a placa sobe, a seta avança e o poste "acende".
function Placa({
  to, letra, titulo, apoio, texto, asfalto,
}: { to: string; letra: string; titulo: string; apoio: string; texto: string; asfalto?: boolean }) {
  return (
    <li className="flex flex-col items-stretch">
      <Link to={to} className="group block rounded-[10px]">
        <span
          className={`placa group-hover:-translate-y-1 group-hover:shadow-poste group-focus-visible:-translate-y-1 group-focus-visible:shadow-poste ${asfalto ? "placa-asfalto" : ""}`}
        >
          <span className="flex items-center justify-between">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white font-mono text-sm font-bold text-tinta">
              {letra}
            </span>
            <span className="grid h-10 w-14 place-items-center rounded-[4px] border-2 border-white/90">
              <Seta className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5" />
            </span>
          </span>
          <span className="titulo-display block text-4xl md:text-5xl">{titulo}</span>
          <span className="block max-w-md text-base text-white/90">{texto}</span>
        </span>
        <span className="mx-auto block w-fit rounded-b-[4px] bg-white px-3 py-1 font-mono text-[11px] font-bold tracking-[0.12em] text-tinta uppercase shadow-sm ring-1 ring-linha dark:ring-asfalto-700">
          {apoio}
        </span>
      </Link>
      <span aria-hidden="true" className="mx-auto h-10 w-2.5 rounded-b-sm bg-asfalto-400 dark:bg-asfalto-600" />
    </li>
  );
}

// Anotações "à mão" em traço (SVG), no tom do lápis âmbar da caderneta.
function TracoSublinhado() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 16" preserveAspectRatio="none" className="absolute -bottom-3 left-0 h-3.5 w-full">
      <path
        d="M3 10c42-6 88-7 132-4 46 3 96 2 160-6"
        pathLength={1}
        className="linha-desenha"
        fill="none"
        stroke="var(--color-poste-500)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SetaMao() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 20" className="mt-2 h-4 w-6 shrink-0 text-sinal-600 dark:text-sinal-300">
      <path d="M2 11c6-1 13-2 21-1M17 4c3 2 5 4 7 6-3 2-5 4-7 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
