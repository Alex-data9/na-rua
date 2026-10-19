import { Form, Link, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { Botao, classeBotao } from "~/components/Botao";
import type { Route } from "./+types/painel._index";
import { listarPessoas, obterIndicadores } from "~/models/pessoa.server";
import { STATUS_ROTULO } from "~/utils/status";
import type { StatusAcompanhamento } from "~/utils/supabase.types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Painel de acompanhamento — NaRua" }];
}

export async function loader({ request }: Route.LoaderArgs) {
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
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold md:text-3xl">Painel de acompanhamento</h1>
        <Link to="/cadastro" className={classeBotao("primario")}>
          Novo cadastro
        </Link>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Indicador label="Total cadastrados" valor={indicadores.totalCadastrados} />
        <Indicador label="Novos na semana" valor={indicadores.novosNaSemana} />
        <Indicador label="Buscas familiares ativas" valor={indicadores.buscasFamiliaresAtivas} />
        <Indicador
          label="Sem atualização há 30+ dias"
          valor={indicadores.semAtualizacao30Dias}
          alerta
        />
      </section>

      <Form method="get" role="search" aria-label="Buscar cadastros" className="mb-4 flex flex-col gap-3 sm:flex-row">
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

      <ul className="cartao divide-y divide-gray-200 p-0 dark:divide-gray-800">
        {pessoas.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div className="min-w-0">
              <Link to={`/painel/${p.id}`} className="inline-flex min-h-11 items-center font-medium hover:underline">
                {p.nome}
              </Link>
              <p className="break-words text-sm text-gray-700 dark:text-gray-300">{p.referencia}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
              {STATUS_ROTULO[p.status]}
            </span>
          </li>
        ))}
        {pessoas.length === 0 && (
          <li className="p-4 text-gray-700 dark:text-gray-300">Nenhum cadastro encontrado.</li>
        )}
      </ul>
    </main>
  );
}

function Indicador({
  label,
  valor,
  alerta,
}: {
  label: string;
  valor: number;
  alerta?: boolean;
}) {
  return (
    <div className="cartao p-4">
      <p className="text-sm text-gray-700 dark:text-gray-300">{label}</p>
      <p className={`text-3xl font-semibold ${alerta && valor > 0 ? "text-red-700 dark:text-red-300" : ""}`}>
        {valor}
      </p>
    </div>
  );
}
