import { Form, useLoaderData } from "react-router";
import type { Route } from "./+types/painel.$id";
import {
  adicionarNota,
  atualizarStatusPessoa,
  listarNotas,
  obterPessoa,
  precisaReentrevista,
} from "~/models/pessoa.server";
import type { StatusAcompanhamento } from "~/utils/supabase.types";

const STATUS_OPCOES: StatusAcompanhamento[] = [
  "novo",
  "em_acompanhamento",
  "busca_familiar",
  "vinculado_a_servico",
];

export async function loader({ params }: Route.LoaderArgs) {
  const pessoa = await obterPessoa(params.id!);
  const notas = await listarNotas(params.id!);
  return { pessoa, notas, reentrevista: precisaReentrevista(pessoa) };
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "status") {
    await atualizarStatusPessoa(params.id!, form.get("status") as StatusAcompanhamento);
  } else if (intent === "nota") {
    const texto = form.get("texto") as string;
    const autor = form.get("autor") as string;
    if (texto?.trim() && autor?.trim()) {
      await adicionarNota(params.id!, texto.trim(), autor.trim());
    }
  }

  return { ok: true };
}

export default function DetalhesPessoa() {
  const { pessoa, notas, reentrevista } = useLoaderData<typeof loader>();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{pessoa.nome}</h1>
        {pessoa.apelido && <p className="text-gray-500">"{pessoa.apelido}"</p>}
        {reentrevista && (
          <p className="mt-2 rounded bg-amber-100 text-amber-800 p-3 text-sm">
            Cadastro sem atualização há mais de 24 meses — recomenda-se nova entrevista (RF13).
          </p>
        )}
      </div>

      <section className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Referência" valor={pessoa.referencia} />
        <Info label="Agente" valor={pessoa.agente} />
        <Info label="Tempo em situação de rua" valor={pessoa.tempo_rua} />
        <Info label="Onde dorme" valor={pessoa.dorme} />
        <Info label="Contato com família" valor={pessoa.contato_familia} />
        <Info label="NIS" valor={pessoa.nis} />
      </section>

      <Form method="post" className="flex items-center gap-3">
        <input type="hidden" name="intent" value="status" />
        <label className="text-sm font-medium">Status:</label>
        <select name="status" defaultValue={pessoa.status} className="rounded border px-3 py-2">
          {STATUS_OPCOES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 rounded border">
          Atualizar
        </button>
      </Form>

      <section>
        <h2 className="font-medium mb-3">Histórico de anotações</h2>
        <Form method="post" className="space-y-2 mb-4">
          <input type="hidden" name="intent" value="nota" />
          <textarea
            name="texto"
            placeholder="Nova anotação de acompanhamento"
            required
            className="w-full rounded border px-3 py-2"
          />
          <input
            name="autor"
            placeholder="Seu nome"
            required
            className="w-full rounded border px-3 py-2"
          />
          <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white">
            Adicionar anotação
          </button>
        </Form>

        <ul className="space-y-3">
          {notas.map((n) => (
            <li key={n.id} className="rounded border p-3 text-sm">
              <p>{n.texto}</p>
              <p className="text-gray-500 mt-1">
                {n.autor} — {new Date(n.ts).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
          {notas.length === 0 && (
            <li className="text-gray-500 text-sm">Nenhuma anotação registrada.</li>
          )}
        </ul>
      </section>
    </main>
  );
}

function Info({ label, valor }: { label: string; valor: string | null }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{valor || "—"}</p>
    </div>
  );
}
