import { useEffect, useRef, useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/cadastro";
import { criarPessoa } from "~/models/pessoa.server";
import { ProgressBar } from "~/components/ProgressBar";
import { Campo, Erro, GrupoOpcoes, Marca, Selecao } from "~/components/campos";
import { SignaturePad } from "~/components/SignaturePad";
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
  UFS,
} from "~/utils/formulario-suplementar2";
import {
  CAMPOS_POR_ETAPA,
  lerFormulario,
  normalizarCadastro,
  validarCadastro,
  type Erros,
} from "~/utils/cadastro";
import { mascaraCpf, mascaraNis, mascaraTelefone } from "~/utils/validators";

const TITULOS = [
  "Identificação e controle",
  "Identificação da pessoa",
  "Situação de rua",
  "Rede de apoio e renda",
  "Consentimento e assinaturas",
];
const TOTAL_STEPS = TITULOS.length;
const SIM_NAO = [
  { value: 1, label: "Sim" },
  { value: 2, label: "Não" },
];

export async function action({ request }: Route.ActionArgs) {
  const valores = lerFormulario(await request.formData());
  const erros = validarCadastro(valores);
  if (Object.keys(erros).length > 0) return { erros, erro: null };

  try {
    const pessoa = await criarPessoa(normalizarCadastro(valores));
    return redirect(`/painel/${pessoa.id}`);
  } catch (err) {
    return { erros: {} as Erros, erro: err instanceof Error ? err.message : "Erro ao salvar cadastro." };
  }
}

const chaveDoErro = (nome: string) => (/^dorme_.+_dias$/.test(nome) ? "dorme_dias" : nome);

export default function Cadastro() {
  const [step, setStep] = useState(1);
  const [erros, setErros] = useState<Erros>({});
  const [dias, setDias] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const somaDias = LOCAIS_DORMIR.reduce((acc, l) => acc + (Number(dias[l.campo]) || 0), 0);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const d = new Date();
    const hoje = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const campo = form.elements.namedItem("data_entrevista") as HTMLInputElement;
    campo.max = hoje;
    if (!campo.value) campo.value = hoje;
  }, []);

  useEffect(() => {
    if (!actionData?.erros || Object.keys(actionData.erros).length === 0) return;
    setErros(actionData.erros);
    irParaPrimeiraEtapaComErro(actionData.erros);
  }, [actionData]);

  function irParaPrimeiraEtapaComErro(e: Erros) {
    const idx = CAMPOS_POR_ETAPA.findIndex((campos) => campos.some((c) => e[c]));
    if (idx >= 0) setStep(idx + 1);
  }

  function validarTudo() {
    return validarCadastro(lerFormulario(new FormData(formRef.current!)));
  }

  function proximo() {
    const todos = validarTudo();
    const daEtapa: Erros = {};
    for (const c of CAMPOS_POR_ETAPA[step - 1]) if (todos[c]) daEtapa[c] = todos[c];
    setErros((prev) => {
      const limpo = { ...prev };
      for (const c of CAMPOS_POR_ETAPA[step - 1]) delete limpo[c];
      return { ...limpo, ...daEtapa };
    });
    if (Object.keys(daEtapa).length === 0) setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function aoSair(e: React.FocusEvent<HTMLElement>) {
    const alvo = e.target as HTMLInputElement;
    if (!alvo.name || alvo.type === "checkbox" || alvo.type === "radio" || alvo.type === "hidden") return;
    const chave = chaveDoErro(alvo.name);
    const todos = validarTudo();
    setErros((prev) => {
      const novo = { ...prev };
      if (alvo.value !== "" && todos[chave]) novo[chave] = todos[chave];
      else delete novo[chave];
      return novo;
    });
  }

  function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    const todos = validarTudo();
    if (Object.keys(todos).length > 0) {
      e.preventDefault();
      setErros(todos);
      irParaPrimeiraEtapaComErro(todos);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-1">Cadastro — Pessoa em situação de rua</h1>
      <p className="text-sm text-gray-500 mb-4">Formulário Suplementar 2 — Cadastro Único (MDS)</p>
      <ProgressBar step={step} totalSteps={TOTAL_STEPS} />

      {actionData?.erro && (
        <p role="alert" className="mt-4 rounded bg-red-100 text-red-800 p-3">
          {actionData.erro}
        </p>
      )}
      {Object.keys(erros).length > 0 && (
        <p role="alert" className="mt-4 rounded bg-red-100 text-red-800 p-3 text-sm">
          Corrija os campos destacados para continuar.
        </p>
      )}

      <Form ref={formRef} method="post" noValidate onBlur={aoSair} onSubmit={aoEnviar} className="mt-6 space-y-6">
        <fieldset hidden={step !== 1} className="space-y-3">
          <legend className="font-medium mb-2">1. {TITULOS[0]}</legend>
          <GrupoOpcoes legenda="1.07 Modalidade da operação" name="modalidade_operacao" tipo="radio"
            opcoes={MODALIDADE_OPERACAO} defaultValue="1" erro={erros.modalidade_operacao} />
          <GrupoOpcoes legenda="1.08 Forma de coleta de dados" name="forma_coleta" tipo="radio"
            opcoes={FORMA_COLETA} erro={erros.forma_coleta} />
          <Campo label="1.10 Data da entrevista" name="data_entrevista" type="date" erro={erros.data_entrevista} />
          <Campo label="1.11 Nome completo do entrevistador" name="agente" autoComplete="name" erro={erros.agente} maxLength={70} />
          <Campo label="1.12 CPF do entrevistador" name="entrevistador_cpf" inputMode="numeric" mascara={mascaraCpf}
            placeholder="000.000.000-00" maxLength={14} erro={erros.entrevistador_cpf} />
          <Selecao label="1.02 UF" name="uf" opcoes={UFS} erro={erros.uf} />
          <Campo label="1.03 Município" name="municipio" erro={erros.municipio} maxLength={60} />
          <Campo label="1.04 Distrito" name="distrito" erro={erros.distrito} maxLength={60} />
          <Campo label="1.05 Subdistrito" name="subdistrito" erro={erros.subdistrito} maxLength={60} />
          <Campo label="1.06 Setor censitário" name="setor_censitario" maxLength={15}
            dica="Código do IBGE, 15 caracteres (opcional)." erro={erros.setor_censitario} />
          <Campo label="Equipamento de referência (CRAS, CREAS, abrigo)*" name="referencia" maxLength={100}
            dica="Nunca um domicílio residencial (Portaria GM/MDS nº 376/2008)." erro={erros.referencia} />
          <Campo label="1.13 Observações" name="obs" textarea maxLength={500} erro={erros.obs} />
        </fieldset>

        <fieldset hidden={step !== 2} className="space-y-3">
          <legend className="font-medium mb-2">2. {TITULOS[1]}</legend>
          <Campo label="2.02 Nome completo*" name="nome" maxLength={70} autoComplete="off"
            dica="Copie do documento oficial, sem abreviar. Um só nome é aceito apenas para quem não tem nenhum documento."
            erro={erros.nome} />
          <Campo label="Apelido" name="apelido" maxLength={40} erro={erros.apelido} />
          <Campo label="Idade" name="idade" type="number" inputMode="numeric" min={0} max={130} erro={erros.idade} />
          <Campo label="Cidade de nascimento" name="cidade_nascimento" maxLength={60} erro={erros.cidade_nascimento} />
          <Selecao label="Estado de nascimento" name="estado_nascimento" opcoes={UFS} erro={erros.estado_nascimento} />
          <Campo label="Estado civil" name="estado_civil" maxLength={30} erro={erros.estado_civil} />
          <Campo label="Nome dos pais" name="nome_pais" maxLength={140} erro={erros.nome_pais} />
          <Campo label="CPF" name="cpf" inputMode="numeric" mascara={mascaraCpf} placeholder="000.000.000-00"
            maxLength={14} erro={erros.cpf} />
          <Campo label="RG" name="rg" maxLength={20} erro={erros.rg} />
          <Campo label="2.03 NIS/PIS/PASEP" name="nis" inputMode="numeric" mascara={mascaraNis}
            placeholder="000.00000.00-0" maxLength={14} dica="Opcional; deixe em branco se a pessoa não tiver."
            erro={erros.nis} />
          <Campo label="Telefone de contato (com DDD)" name="telefone" type="tel" inputMode="tel" mascara={mascaraTelefone}
            placeholder="(92) 99999-9999" maxLength={15}
            dica="Opcional. Pode ser de familiar, vizinho ou de um equipamento de assistência social de referência."
            erro={erros.telefone} />
        </fieldset>

        <fieldset hidden={step !== 3} className="space-y-4">
          <legend className="font-medium mb-2">3. {TITULOS[2]}</legend>
          <fieldset aria-describedby={erros.dorme_dias ? "dorme_dias-erro" : undefined}>
            <legend className="text-sm font-medium">2.04 Onde costuma dormir? Quantas vezes por semana?</legend>
            <p className="text-xs text-gray-500 mb-2">Preencha os locais que se aplicam; a soma pode ser no máximo 7.</p>
            <div className="grid grid-cols-2 gap-3">
              {LOCAIS_DORMIR.map((l) => (
                <label key={l.campo} className="text-sm">
                  {l.value} - {l.label}
                  <input
                    type="number" name={l.campo} min={0} max={7} inputMode="numeric"
                    value={dias[l.campo] ?? ""}
                    onChange={(e) => setDias((d) => ({ ...d, [l.campo]: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </label>
              ))}
            </div>
            <p className={`mt-1 text-sm ${somaDias > 7 ? "text-red-500" : "text-gray-500"}`}>Total: {somaDias} de 7 dias</p>
            <Erro id="dorme_dias-erro" mensagem={erros.dorme_dias} />
          </fieldset>
          <Selecao label="2.05 Há quanto tempo vive na rua?" name="tempo_rua_faixa" opcoes={FAIXAS_TEMPO} erro={erros.tempo_rua_faixa} />
          <GrupoOpcoes legenda="2.06 Principais motivos pelos quais passou a morar na rua/albergue/outro" name="motivos"
            tipo="checkbox" opcoes={MOTIVOS_RUA} dica="Pode marcar mais de um." erro={erros.motivos} />
          <Selecao label="2.07 Há quanto tempo mora nesta cidade?" name="tempo_cidade_faixa" opcoes={FAIXAS_TEMPO}
            erro={erros.tempo_cidade_faixa} />
          <GrupoOpcoes legenda="2.08 Vive com sua família na rua?" name="vive_familia_na_rua" tipo="radio" opcoes={SIM_NAO}
            erro={erros.vive_familia_na_rua} dica="Se sim, os componentes da família vão no Bloco 3 do Formulário Principal." />
          <Selecao label="2.09 Tem contato com parente que vive fora da rua?" name="contato_parente" opcoes={CONTATO_PARENTE}
            erro={erros.contato_parente} />
          <Campo label="Onde morava antes" name="moradia_anterior" maxLength={200} erro={erros.moradia_anterior} />
          <Campo label="Onde mora atualmente" name="moradia_atual" maxLength={200} erro={erros.moradia_atual} />
          <Campo label="Redes de apoio social/familiar" name="redes_apoio" maxLength={200} erro={erros.redes_apoio} />
        </fieldset>

        <fieldset hidden={step !== 4} className="space-y-4">
          <legend className="font-medium mb-2">4. {TITULOS[3]}</legend>
          <GrupoOpcoes legenda="2.10 Nos últimos seis meses, frequentou ou participou de alguma atividade comunitária?"
            name="atividades_comunitarias" tipo="checkbox" opcoes={ATIVIDADES_COMUNITARIAS}
            dica="Pode marcar mais de um, exceto “não sabe” e “não respondeu”." erro={erros.atividades_comunitarias} />
          <GrupoOpcoes legenda="2.11 Nos últimos seis meses, foi atendido em algum dos lugares abaixo?"
            name="atendimentos_6m" tipo="checkbox" opcoes={LOCAIS_ATENDIMENTO}
            dica="Pode marcar mais de um, exceto “nenhum”." erro={erros.atendimentos_6m} />
          <GrupoOpcoes legenda="2.12 Alguma vez teve emprego com carteira de trabalho assinada?" name="carteira_assinada"
            tipo="radio" opcoes={SIM_NAO} erro={erros.carteira_assinada} />
          <GrupoOpcoes legenda="2.13 O que faz para ganhar dinheiro?" name="atividades_renda" tipo="checkbox"
            opcoes={ATIVIDADES_RENDA} dica="Pode marcar mais de um, exceto “não respondeu”." erro={erros.atividades_renda} />
        </fieldset>

        <fieldset hidden={step !== 5} className="space-y-4">
          <legend className="font-medium mb-2">5. {TITULOS[4]}</legend>
          <Marca name="consentimento_lgpd" erro={erros.consentimento_lgpd}
            label="A pessoa entrevistada consentiu com o uso destes dados (LGPD)*" />
          <Marca name="campanha_pop_rua" label="Vincular à Campanha Pop Rua" />
          <p className="text-xs text-gray-500">
            Declaro, sob as penas da lei (Art. 299 do Código Penal), que as declarações deste formulário correspondem à
            verdade e comprometo-me a procurar a gestão municipal para atualizá-las sempre que houver mudanças ou, no
            máximo, em até dois anos da data desta entrevista.
          </p>
          <SignaturePad label="Assinatura do responsável pela unidade familiar (RF)* — obrigatória" name="assinatura_rf"
            erro={erros.assinatura_rf} />
          <SignaturePad label="Assinatura do entrevistador" name="assinatura_entrevistador" erro={erros.assinatura_entrevistador} />
          <SignaturePad label="Assinatura do representante da prefeitura/órgão responsável" name="assinatura_representante"
            erro={erros.assinatura_representante} />
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
            <button type="button" className="px-4 py-2 rounded bg-emerald-600 text-white" onClick={proximo}>
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
