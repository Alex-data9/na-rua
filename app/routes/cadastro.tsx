import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/cadastro";
import { criarPessoa } from "~/models/pessoa.server";
import { ProgressBar } from "~/components/ProgressBar";

const TOTAL_STEPS = 4;

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const texto = (name: string) => (form.get(name) as string) || null;
  const lista = (name: string) =>
    texto(name)
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? null;

  const referencia = texto("referencia");
  if (!texto("nome") || !referencia) {
    return { erro: "Nome e equipamento de referência são obrigatórios." };
  }

  try {
    const pessoa = await criarPessoa({
      nome: texto("nome")!,
      apelido: texto("apelido"),
      idade: form.get("idade") ? Number(form.get("idade")) : null,
      cidade_nascimento: texto("cidade_nascimento"),
      estado_nascimento: texto("estado_nascimento"),
      estado_civil: texto("estado_civil"),
      nome_pais: texto("nome_pais"),
      documentos: lista("documentos"),
      nis: texto("nis"),
      foto_url: null,
      dorme: texto("dorme"),
      tempo_rua: texto("tempo_rua"),
      motivo: lista("motivo"),
      contato_familia: texto("contato_familia"),
      renda: lista("renda"),
      moradia_anterior: texto("moradia_anterior"),
      moradia_atual: texto("moradia_atual"),
      redes_apoio: texto("redes_apoio"),
      referencia: referencia!,
      agente: texto("agente"),
      telefone: texto("telefone"),
      campanha_pop_rua: form.get("campanha_pop_rua") === "on",
      consentimento_lgpd: form.get("consentimento_lgpd") === "on",
      assinatura_confirmada: form.get("assinatura_confirmada") === "on",
      obs: texto("obs"),
    });
    return redirect(`/painel/${pessoa.id}`);
  } catch (err) {
    return { erro: err instanceof Error ? err.message : "Erro ao salvar cadastro." };
  }
}

export default function Cadastro() {
  const [step, setStep] = useState(1);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Cadastro — Pessoa em situação de rua</h1>
      <ProgressBar step={step} totalSteps={TOTAL_STEPS} />

      {actionData?.erro && (
        <p role="alert" className="mt-4 rounded bg-red-100 text-red-800 p-3">
          {actionData.erro}
        </p>
      )}

      <Form method="post" className="mt-6 space-y-6">
        <fieldset hidden={step !== 1} className="space-y-3">
          <legend className="font-medium mb-2">1. Identificação</legend>
          <Campo label="Nome*" name="nome" required />
          <Campo label="Apelido" name="apelido" />
          <Campo label="Idade" name="idade" type="number" />
          <Campo label="Cidade de nascimento" name="cidade_nascimento" />
          <Campo label="Estado de nascimento" name="estado_nascimento" />
          <Campo label="Estado civil" name="estado_civil" />
          <Campo label="Nome dos pais" name="nome_pais" />
          <Campo label="Documentos (RG, CPF — separados por vírgula)" name="documentos" />
          <Campo label="NIS" name="nis" />
        </fieldset>

        <fieldset hidden={step !== 2} className="space-y-3">
          <legend className="font-medium mb-2">2. Situação de rua</legend>
          <Campo label="Onde costuma dormir" name="dorme" />
          <Campo label="Há quanto tempo em situação de rua" name="tempo_rua" />
          <Campo label="Motivo(s) principal(is) — separados por vírgula" name="motivo" />
          <Campo label="Contato com familiares" name="contato_familia" />
          <Campo label="Atividades de renda — separadas por vírgula" name="renda" />
          <Campo label="Onde morava antes" name="moradia_anterior" />
          <Campo label="Onde mora atualmente" name="moradia_atual" />
          <Campo label="Redes de apoio social/familiar" name="redes_apoio" />
        </fieldset>

        <fieldset hidden={step !== 3} className="space-y-3">
          <legend className="font-medium mb-2">3. Acompanhamento e referência</legend>
          <Campo
            label="Equipamento de referência (CRAS/CREAS/abrigo)*"
            name="referencia"
            required
          />
          <Campo label="Agente responsável" name="agente" />
          <Campo label="Telefone de contato" name="telefone" />
          <Campo label="Observações" name="obs" textarea />
          <Checkbox label="Vincular à Campanha Pop Rua" name="campanha_pop_rua" />
        </fieldset>

        <fieldset hidden={step !== 4} className="space-y-3">
          <legend className="font-medium mb-2">4. Consentimento e confirmação</legend>
          <Checkbox
            label="A pessoa entrevistada consentiu com o uso destes dados (LGPD)"
            name="consentimento_lgpd"
          />
          <Checkbox
            label="Assinatura digital de confirmação do cadastro obtida"
            name="assinatura_confirmada"
          />
        </fieldset>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            className="px-4 py-2 rounded border disabled:opacity-40"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Voltar
          </button>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              className="px-4 py-2 rounded bg-emerald-600 text-white"
              onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-700 text-white disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Concluir cadastro"}
            </button>
          )}
        </div>
      </Form>
    </main>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {textarea ? (
        <textarea name={name} required={required} className="w-full rounded border px-3 py-2" />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          className="w-full rounded border px-3 py-2"
        />
      )}
    </label>
  );
}

function Checkbox({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </label>
  );
}
