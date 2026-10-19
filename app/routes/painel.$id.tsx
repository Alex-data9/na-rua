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
import {
  ATIVIDADES_COMUNITARIAS,
  ATIVIDADES_RENDA,
  CONTATO_PARENTE,
  FAIXAS_TEMPO,
  FORMA_COLETA,
  LOCAIS_ATENDIMENTO,
  LOCAIS_DORMIR,
  MODALIDADE_OPERACAO,
  MOTIVOS_RUA,
  rotulo,
  rotulos,
} from "~/utils/formulario-suplementar2";
import { formatarCpf, formatarNis, formatarTelefone } from "~/utils/validators";

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

      <Secao titulo="Identificação e controle">
        <Info label="Código familiar" valor={String(pessoa.codigo_familiar)} />
        <Info label="Modalidade" valor={rotulo(MODALIDADE_OPERACAO, pessoa.modalidade_operacao)} />
        <Info label="Data da entrevista" valor={new Date(`${pessoa.data_entrevista}T12:00:00`).toLocaleDateString("pt-BR")} />
        <Info label="Forma de coleta" valor={rotulo(FORMA_COLETA, pessoa.forma_coleta)} />
        <Info label="Entrevistador" valor={pessoa.agente} />
        <Info label="CPF do entrevistador" valor={formatarCpf(pessoa.entrevistador_cpf)} />
        <Info label="Município/UF" valor={[pessoa.municipio, pessoa.uf].filter(Boolean).join(" / ") || null} />
        <Info label="Equipamento de referência" valor={pessoa.referencia} />
        <Info label="Observações" valor={pessoa.obs} />
      </Secao>

      <Secao titulo="Pessoa">
        <Info label="CPF" valor={formatarCpf(pessoa.cpf)} />
        <Info label="RG" valor={pessoa.rg} />
        <Info label="NIS/PIS/PASEP" valor={formatarNis(pessoa.nis)} />
        <Info label="Telefone" valor={formatarTelefone(pessoa.telefone)} />
        <Info label="Idade" valor={pessoa.idade?.toString() ?? null} />
        <Info label="Naturalidade" valor={[pessoa.cidade_nascimento, pessoa.estado_nascimento].filter(Boolean).join(" / ") || null} />
      </Secao>

      <Secao titulo="Situação de rua">
        <Info
          label="Onde costuma dormir (dias por semana)"
          valor={
            LOCAIS_DORMIR.filter((l) => pessoa[l.campo] != null)
              .map((l) => `${l.label}: ${pessoa[l.campo]}`)
              .join(" · ") || null
          }
        />
        <Info label="Tempo na rua" valor={rotulo(FAIXAS_TEMPO, pessoa.tempo_rua_faixa)} />
        <Info label="Motivos" valor={rotulos(MOTIVOS_RUA, pessoa.motivos).join("; ") || null} />
        <Info label="Tempo na cidade" valor={rotulo(FAIXAS_TEMPO, pessoa.tempo_cidade_faixa)} />
        <Info label="Vive com a família na rua" valor={simNao(pessoa.vive_familia_na_rua)} />
        <Info label="Contato com parente fora da rua" valor={rotulo(CONTATO_PARENTE, pessoa.contato_parente)} />
        <Info label="Atividade comunitária (6 meses)" valor={rotulos(ATIVIDADES_COMUNITARIAS, pessoa.atividades_comunitarias).join("; ") || null} />
        <Info label="Atendido em (6 meses)" valor={rotulos(LOCAIS_ATENDIMENTO, pessoa.atendimentos_6m).join("; ") || null} />
        <Info label="Já teve carteira assinada" valor={simNao(pessoa.carteira_assinada)} />
        <Info label="Atividades de renda" valor={rotulos(ATIVIDADES_RENDA, pessoa.atividades_renda).join("; ") || null} />
        <Info label="Onde morava antes" valor={pessoa.moradia_anterior} />
        <Info label="Onde mora atualmente" valor={pessoa.moradia_atual} />
        <Info label="Redes de apoio" valor={pessoa.redes_apoio} />
      </Secao>

      {pessoa.assinatura_rf && (
        <section>
          <h2 className="font-medium mb-2">Assinatura do responsável familiar</h2>
          <img src={pessoa.assinatura_rf} alt="Assinatura do responsável familiar" className="h-24 rounded border bg-white" />
        </section>
      )}

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

const simNao = (v: boolean | null) => (v == null ? null : v ? "Sim" : "Não");

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-medium mb-2">{titulo}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">{children}</div>
    </section>
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
