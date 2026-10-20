import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { Alerta } from "~/components/Alerta";
import { urlDaFoto } from "~/models/foto.server";
import { Botao, Seta } from "~/components/Botao";
import { StatusEtiqueta } from "~/components/StatusEtiqueta";
import { Rotulo } from "~/components/campos";
import type { Route } from "./+types/painel.$id";
import {
  adicionarNota,
  atualizarStatusPessoa,
  excluirPessoa,
  listarNotas,
  obterPessoa,
  precisaReentrevista,
} from "~/models/pessoa.server";
import { STATUS_OPCOES, STATUS_ROTULO } from "~/utils/status";
import { exigirAdmin } from "~/utils/sessao.server";
import { ExcluirCadastro } from "~/components/ExcluirCadastro";
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

export function meta({}: Route.MetaArgs) {
  return [{ title: "Ficha de acompanhamento — NaRua" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await exigirAdmin(request);
  const pessoa = await obterPessoa(params.id!).catch(() => {
    throw new Response("Cadastro não encontrado.", { status: 404 }); // ex.: já foi excluído
  });
  const notas = await listarNotas(params.id!);
  const fotoUrl = await urlDaFoto(pessoa.foto_url);
  return { pessoa, notas, fotoUrl, reentrevista: precisaReentrevista(pessoa) };
}

export async function action({ request, params }: Route.ActionArgs) {
  await exigirAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "excluir") {
    const { fotoRemovida } = await excluirPessoa(params.id!);
    return redirect(`/painel?excluido=1${fotoRemovida ? "" : "&foto=falhou"}`);
  }

  if (intent === "status") {
    await atualizarStatusPessoa(params.id!, form.get("status") as StatusAcompanhamento);
  } else if (intent === "nota") {
    const texto = form.get("texto") as string;
    const autor = form.get("autor") as string;
    if (texto?.trim() && autor?.trim()) {
      await adicionarNota(params.id!, texto.trim(), autor.trim());
    }
  }

  return { ok: true, intent: String(intent) };
}

export default function DetalhesPessoa() {
  const { pessoa, notas, fotoUrl, reentrevista } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const intencao = navigation.state === "submitting" ? String(navigation.formData?.get("intent")) : null;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:py-12">
      <Link to="/painel" className="rotulo-tecnico inline-flex min-h-11 items-center gap-2 hover:!text-tinta dark:hover:!text-white">
        <Seta className="h-4 w-4 rotate-180" /> Voltar ao painel
      </Link>
      <div className="space-y-4 border-b border-tinta pb-6 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3">
          <p className="rotulo-tecnico">Ficha N° {String(pessoa.codigo_familiar)}</p>
          <StatusEtiqueta status={pessoa.status} />
        </div>
        <h1 className="titulo-display text-4xl leading-none md:text-6xl">
          {pessoa.nome}<span className="text-sinal-500">.</span>
        </h1>
        {pessoa.apelido && <p className="font-mono text-sm text-gray-600 dark:text-gray-400">“{pessoa.apelido}”</p>}
        {actionData?.intent === "status" && <Alerta tipo="sucesso">Status atualizado.</Alerta>}
        {actionData?.intent === "nota" && <Alerta tipo="sucesso">Anotação adicionada.</Alerta>}
        {reentrevista && (
          <Alerta tipo="info">Cadastro sem atualização há mais de 24 meses — recomenda-se nova entrevista (RF13).</Alerta>
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

      {fotoUrl && (
        <section className="cartao">
          <h2 className="titulo-display mb-4 text-xl">Foto</h2>
          <img src={fotoUrl} alt={`Foto de ${pessoa.nome}`} className="h-56 w-56 border border-linha object-cover" />
        </section>
      )}

      {pessoa.assinatura_rf && (
        <section className="cartao">
          <h2 className="titulo-display mb-4 text-xl">Assinatura do responsável familiar</h2>
          <img src={pessoa.assinatura_rf} alt="Assinatura do responsável familiar" className="h-24 border border-linha bg-white" />
        </section>
      )}

      <section className="cartao">
        <h2 className="titulo-display mb-4 text-xl">Status de acompanhamento</h2>
        <Form method="post" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="intent" value="status" />
          <div className="sm:w-64">
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium">Status</label>
            <select id="status" name="status" defaultValue={pessoa.status} className="campo">
              {STATUS_OPCOES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_ROTULO[s]}
                </option>
              ))}
            </select>
          </div>
          <Botao type="submit" variante="secundario" carregando={intencao === "status"} textoCarregando="Atualizando...">
            Atualizar status
          </Botao>
        </Form>
      </section>

      <section className="cartao">
        <h2 className="titulo-display mb-4 text-xl">Histórico de anotações</h2>
        <Form method="post" key={notas.length} className="mb-5 space-y-4">
          <input type="hidden" name="intent" value="nota" />
          <div>
            <label htmlFor="texto" className="mb-1.5 block text-sm font-medium">
              <Rotulo obrigatorio>Nova anotação de acompanhamento</Rotulo>
            </label>
            <textarea id="texto" name="texto" required rows={3} className="campo" />
          </div>
          <div>
            <label htmlFor="autor" className="mb-1.5 block text-sm font-medium">
              <Rotulo obrigatorio>Seu nome</Rotulo>
            </label>
            <input id="autor" name="autor" required autoComplete="name" className="campo" />
          </div>
          <Botao type="submit" carregando={intencao === "nota"} textoCarregando="Salvando...">
            Adicionar anotação
          </Botao>
        </Form>

        <ul className="space-y-3">
          {notas.map((n) => (
            <li key={n.id} className="border-l-2 border-sinal-500 bg-papel p-3 text-sm dark:bg-[#0b0b0b]">
              <p className="whitespace-pre-line break-words">{n.texto}</p>
              <p className="mt-2 font-mono text-[11px] tracking-[0.08em] uppercase text-gray-600 dark:text-gray-400">
                {n.autor} — {new Date(n.ts).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
          {notas.length === 0 && (
            <li className="text-sm text-gray-700 dark:text-gray-300">Nenhuma anotação registrada.</li>
          )}
        </ul>
      </section>

      <ExcluirCadastro nome={pessoa.nome} excluindo={intencao === "excluir"} />
    </main>
  );
}

const simNao = (v: boolean | null) => (v == null ? null : v ? "Sim" : "Não");

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="cartao">
      <h2 className="titulo-display mb-5 text-xl">{titulo}</h2>
      <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Info({ label, valor }: { label: string; valor: string | null }) {
  return (
    <div className="min-w-0 border-t border-linha pt-2 dark:border-gray-800">
      <dt className="font-mono text-[11px] tracking-[0.1em] uppercase text-gray-600 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 break-words font-medium">{valor || "—"}</dd>
    </div>
  );
}
