import { Form, Link, useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/painel._index";
import { listarPessoas, obterIndicadores } from "~/models/pessoa.server";
import type { StatusAcompanhamento } from "~/utils/supabase.types";

const STATUS_LABEL: Record<StatusAcompanhamento, string> = {
  novo: "Novo",
  em_acompanhamento: "Em acompanhamento",
  busca_familiar: "Busca familiar",
  vinculado_a_servico: "Vinculado a serviço",
};

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

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Painel de acompanhamento</h1>
        <Link to="/cadastro" className="px-4 py-2 rounded bg-emerald-600 text-white">
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

      <Form method="get" className="flex gap-3 mb-4">
        <input
          type="search"
          name="nome"
          placeholder="Buscar por nome"
          defaultValue={searchParams.get("nome") ?? ""}
          className="flex-1 rounded border px-3 py-2"
        />
        <select
          name="status"
          defaultValue={searchParams.get("status") ?? ""}
          className="rounded border px-3 py-2"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 rounded border">
          Filtrar
        </button>
      </Form>

      <ul className="divide-y rounded border">
        {pessoas.map((p) => (
          <li key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <Link to={`/painel/${p.id}`} className="font-medium hover:underline">
                {p.nome}
              </Link>
              <p className="text-sm text-gray-500">{p.referencia}</p>
            </div>
            <span className="text-sm rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1">
              {STATUS_LABEL[p.status]}
            </span>
          </li>
        ))}
        {pessoas.length === 0 && (
          <li className="p-4 text-gray-500">Nenhum cadastro encontrado.</li>
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
    <div className="rounded border p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-semibold ${alerta && valor > 0 ? "text-red-600" : ""}`}>
        {valor}
      </p>
    </div>
  );
}
