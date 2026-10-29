import { Form, Link, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { Botao, Seta, classeBotao } from "~/components/Botao";
import type { Route } from "./+types/painel._index";
import { listarPessoas, obterIndicadores } from "~/models/pessoa.server";
import { STATUS_ROTULO } from "~/utils/status";
import { exigirAdmin } from "~/utils/sessao.server";
import { Alerta } from "~/components/Alerta";
import { StatusEtiqueta } from "~/components/StatusEtiqueta";
import type { StatusAcompanhamento } from "~/utils/supabase.types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Painel de acompanhamento — NaRua" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await exigirAdmin(request);
  const url = new URL(request.url);
  const nome = url.searchParams.get("nome") ?? undefined;
  const status = (url.searchParams.get("status") as StatusAcompanhamento) || undefined;

  const [pessoas, indicadores] = await Promise.all([
    listarPessoas({ nome, status }),
    obterIndicadores(),
  ]);

  return { pessoas, indicadores };
}

export default function Painel() {
  const { pessoas, indicadores } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const carregando = useNavigation().state !== "idle";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-tinta pb-6 dark:border-gray-700">
        <div>
          <p className="rotulo-tecnico mb-3">Acompanhamento</p>
          <h1 className="titulo-display text-4xl md:text-5xl">Painel<span aria-hidden="true" className="text-poste-500">.</span></h1>
        </div>
        <Link to="/cadastro" className={classeBotao("primario")}>
          Novo cadastro <Seta />
        </Link>
      </div>

      {searchParams.get("excluido") === "1" && (
        <div className="mb-6 space-y-3">
          <Alerta tipo="sucesso">Cadastro excluído.</Alerta>
          {searchParams.get("foto") === "falhou" && (
            <Alerta tipo="erro">
              A foto não pôde ser removida do armazenamento. Remova o arquivo manualmente no Supabase (Storage → fotos).
            </Alerta>
          )}
        </div>
      )}

      <section aria-label="Indicadores" className="mb-10 grid grid-cols-2 border-t border-l border-tinta md:grid-cols-4 dark:border-gray-700">
        <Indicador numero="01" label="Total cadastrados" valor={indicadores.totalCadastrados} />
        <Indicador numero="02" label="Novos na semana" valor={indicadores.novosNaSemana} />
        <Indicador numero="03" label="Buscas familiares ativas" valor={indicadores.buscasFamiliaresAtivas} />
        <Indicador numero="04" label="Sem atualização há 30+ dias" valor={indicadores.semAtualizacao30Dias} alerta />
      </section>

      <Form method="get" role="search" aria-label="Buscar cadastros" className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          name="nome"
          aria-label="Buscar por nome"
          placeholder="Buscar por nome"
          defaultValue={searchParams.get("nome") ?? ""}
          className="campo sm:flex-1"
        />
        <select
          name="status"
          aria-label="Filtrar por status"
          defaultValue={searchParams.get("status") ?? ""}
          className="campo sm:w-56"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_ROTULO).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Botao type="submit" variante="secundario" carregando={carregando} textoCarregando="Buscando...">
          Filtrar
        </Botao>
      </Form>

      <div className="rotulo-tecnico hidden grid-cols-[3rem_1fr_12rem_2rem] gap-4 border-b border-tinta px-2 pb-2 sm:grid dark:border-gray-700">
        <span>N°</span>
        <span>Pessoa / referência</span>
        <span>Status</span>
        <span />
      </div>
      <ul className="divide-y divide-linha border-b border-linha dark:divide-gray-800 dark:border-gray-800">
        {pessoas.map((p, i) => (
          <li key={p.id}>
            <Link
              to={`/painel/${p.id}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-2 py-4 transition-colors hover:bg-white sm:grid-cols-[3rem_1fr_12rem_2rem] dark:hover:bg-[#151515]"
            >
              <span className="hidden font-mono text-xs text-gray-500 sm:block">{String(i + 1).padStart(3, "0")}</span>
              <span className="min-w-0">
                <span className="block font-semibold group-hover:underline group-hover:decoration-poste-500 group-hover:decoration-2 group-hover:underline-offset-4">
                  {p.nome}
                </span>
                <span className="block break-words text-sm text-gray-600 dark:text-gray-400">{p.referencia}</span>
              </span>
              <StatusEtiqueta status={p.status} />
              <Seta className="hidden h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-poste-600 sm:block" />
            </Link>
          </li>
        ))}
        {pessoas.length === 0 && (
          <li className="px-2 py-8 text-gray-600 dark:text-gray-400">Nenhum cadastro encontrado.</li>
        )}
      </ul>
    </main>
  );
}

function Indicador({
  numero,
  label,
  valor,
  alerta,
}: {
  numero: string;
  label: string;
  valor: number;
  alerta?: boolean;
}) {
  const destaque = alerta && valor > 0;
  return (
    <div
      className={`flex min-h-36 flex-col justify-between gap-4 border-r border-b border-tinta p-4 md:p-5 dark:border-gray-700 ${
        destaque ? "bg-poste-400 text-tinta" : "bg-white dark:bg-noite-superficie"
      }`}
    >
      <p className="flex justify-between gap-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
        <span>{label}</span>
        <span className={destaque ? "" : "text-gray-500"}>{numero}</span>
      </p>
      <p className="titulo-display text-5xl md:text-6xl">{valor}</p>
    </div>
  );
}
