import { useEffect, useRef, useState } from "react";
import { Form, redirect, useActionData, useBlocker, useNavigation } from "react-router";
import type { Route } from "./+types/cadastro";
import { criarPessoa } from "~/models/pessoa.server";
import { salvarFoto } from "~/models/foto.server";
import { ehJpegDeVerdade } from "~/utils/foto";
import { FotoPessoa } from "~/components/FotoPessoa";
import { ProgressBar } from "~/components/ProgressBar";
import { Campo, GrupoOpcoes, Linha, Marca, Selecao } from "~/components/campos";
import { DiasPorSemana } from "~/components/DiasPorSemana";
import { Alerta } from "~/components/Alerta";
import { Botao, Seta } from "~/components/Botao";
import { SignaturePad } from "~/components/SignaturePad";
import {
  ATIVIDADES_COMUNITARIAS,
  ATIVIDADES_RENDA,
  CONTATO_PARENTE,
  FAIXAS_TEMPO,
  FORMA_COLETA,
  LOCAIS_ATENDIMENTO,
  MODALIDADE_OPERACAO,
  MOTIVOS_RUA,
  UFS,
} from "~/utils/formulario-suplementar2";
import {
  CAMPOS_POR_ETAPA,
  TITULOS_ETAPAS,
  lerFormulario,
  normalizarCadastro,
  validarFormulario,
  type Erros,
} from "~/utils/cadastro";
import { dataLocalIso, mascaraCpf, mascaraNis, mascaraTelefone } from "~/utils/validators";

const TOTAL_STEPS = TITULOS_ETAPAS.length;

export function meta({}: Route.MetaArgs) {
  return [{ title: "Novo cadastro — NaRua" }];
}
const SIM_NAO = [
  { value: 1, label: "Sim" },
  { value: 2, label: "Não" },
];

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const erros = validarFormulario(form);
  const foto = form.get("foto");
  const temFoto = foto instanceof File && foto.size > 0;
  if (!erros.foto && temFoto && !(await ehJpegDeVerdade(foto))) erros.foto = "A foto precisa ser uma imagem JPEG.";
  if (Object.keys(erros).length > 0) return { erros, erro: null };

  try {
    const pessoa = await criarPessoa(normalizarCadastro(lerFormulario(form)));
    let fotoSalva = true;
    if (temFoto) {
      try {
        await salvarFoto(pessoa.id, foto);
      } catch {
        fotoSalva = false; // o cadastro já foi gravado; a ficha avisa que a foto não foi
      }
    }
    return redirect(`/painel/${pessoa.id}?criado=1${fotoSalva ? "" : "&foto=falhou"}`);
  } catch (err) {
    return { erros: {} as Erros, erro: err instanceof Error ? err.message : "Erro ao salvar cadastro." };
  }
}

const chaveDoErro = (nome: string) => (/^dorme_.+_dias$/.test(nome) ? "dorme_dias" : nome);

export default function Cadastro() {
  const [step, setStep] = useState(1);
  const [erros, setErros] = useState<Erros>({});
  const [preenchido, setPreenchido] = useState(false);
  const enviando = useRef(false);
  const primeiraRenderizacao = useRef(true);
  const tituloEtapa = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Evita perder o cadastro por engano ao sair da página (link, botão voltar ou fechar a aba).
  const bloqueio = useBlocker(
    ({ currentLocation, nextLocation }) =>
      preenchido && !enviando.current && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (bloqueio.state !== "blocked") return;
    if (window.confirm("Você tem um cadastro em andamento. Sair desta página descartará os dados preenchidos. Deseja sair?")) {
      bloqueio.proceed();
    } else {
      bloqueio.reset();
    }
  }, [bloqueio]);
  useEffect(() => {
    if (!preenchido) return;
    const aviso = (e: BeforeUnloadEvent) => {
      if (!enviando.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [preenchido]);

  // Ao trocar de etapa, leva o foco (e a leitura de tela) para o título da nova etapa.
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    tituloEtapa.current?.focus();
  }, [step]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const hoje = dataLocalIso();
    const campo = form.elements.namedItem("data_entrevista") as HTMLInputElement;
    campo.max = hoje;
    if (!campo.value) campo.value = hoje;
  }, []);

  useEffect(() => {
    if (!actionData) return;
    enviando.current = false;
    if (!actionData.erros || Object.keys(actionData.erros).length === 0) return;
    setErros(actionData.erros);
    irParaPrimeiraEtapaComErro(actionData.erros);
  }, [actionData]);

  function irParaPrimeiraEtapaComErro(e: Erros) {
    const idx = CAMPOS_POR_ETAPA.findIndex((campos) => campos.some((c) => e[c]));
    if (idx >= 0) setStep(idx + 1);
  }

  function validarTudo() {
    return validarFormulario(new FormData(formRef.current!));
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

  // Enter em um campo avança a etapa (em vez de enviar o formulário inteiro por engano).
  function aoTeclar(e: React.KeyboardEvent<HTMLFormElement>) {
    const alvo = e.target as HTMLElement;
    if (e.key === "Enter" && alvo.tagName === "INPUT" && (alvo as HTMLInputElement).type !== "checkbox" && step < TOTAL_STEPS) {
      e.preventDefault();
      proximo();
    }
  }

  function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    if (enviando.current) {
      e.preventDefault(); // já há um envio em andamento
      return;
    }
    const todos = validarTudo();
    if (Object.keys(todos).length > 0) {
      e.preventDefault();
      setErros(todos);
      irParaPrimeiraEtapaComErro(todos);
    } else {
      enviando.current = true;
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-8 border-b border-tinta pb-6 dark:border-gray-700">
        <p className="rotulo-tecnico mb-3">Formulário Suplementar 2 — Cadastro Único</p>
        <h1 className="titulo-display text-4xl md:text-5xl">Novo cadastro<span className="text-sinal-500">.</span></h1>
        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
          Pessoa em situação de rua — Formulário Suplementar 2 do Cadastro Único (MDS). Campos marcados com{" "}
          <span aria-hidden="true" className="text-sinal-700 dark:text-sinal-500">*</span>
          <span className="sr-only">asterisco</span> são obrigatórios.
        </p>
      </div>

      <div className="cartao space-y-6">
        <ProgressBar step={step} totalSteps={TOTAL_STEPS} titulos={TITULOS_ETAPAS} />

        {actionData?.erro && <Alerta tipo="erro">{actionData.erro}</Alerta>}
        {Object.keys(erros).length > 0 && (
          <Alerta tipo="erro">Corrija os campos destacados para continuar.</Alerta>
        )}

        <h2 ref={tituloEtapa} tabIndex={-1} className="flex items-baseline gap-3 outline-offset-4">
          <span className="font-mono text-sm font-semibold text-sinal-700 dark:text-sinal-500">{String(step).padStart(2, "0")}</span>
          <span className="titulo-display text-2xl md:text-3xl">{TITULOS_ETAPAS[step - 1]}</span>
        </h2>

        <Form
          ref={formRef}
          method="post"
          encType="multipart/form-data"
          noValidate
          onBlur={aoSair}
          onInput={() => setPreenchido(true)}
          onKeyDown={aoTeclar}
          onSubmit={aoEnviar}
          className="space-y-6"
        >
          <fieldset hidden={step !== 1} className="space-y-5">
            <legend className="sr-only">{TITULOS_ETAPAS[0]}</legend>
            <GrupoOpcoes legenda="1.07 Modalidade da operação" name="modalidade_operacao" tipo="radio" obrigatorio
              opcoes={MODALIDADE_OPERACAO} defaultValue="1" erro={erros.modalidade_operacao} />
            <GrupoOpcoes legenda="1.08 Forma de coleta de dados" name="forma_coleta" tipo="radio" obrigatorio
              opcoes={FORMA_COLETA} erro={erros.forma_coleta} />
            <Linha>
              <Campo label="1.10 Data da entrevista" name="data_entrevista" type="date" obrigatorio erro={erros.data_entrevista} />
            </Linha>
            <Linha>
              <Campo label="1.11 Nome completo do entrevistador" name="agente" autoComplete="name" obrigatorio maxLength={70}
                erro={erros.agente} />
              <Campo label="1.12 CPF do entrevistador" name="entrevistador_cpf" inputMode="numeric" mascara={mascaraCpf}
                placeholder="000.000.000-00" obrigatorio erro={erros.entrevistador_cpf} />
            </Linha>
            <Linha>
              <Selecao label="1.02 UF" name="uf" opcoes={UFS} obrigatorio erro={erros.uf} />
              <Campo label="1.03 Município" name="municipio" obrigatorio maxLength={60} erro={erros.municipio} />
            </Linha>
            <Linha>
              <Campo label="1.04 Distrito" name="distrito" maxLength={60} erro={erros.distrito} />
              <Campo label="1.05 Subdistrito" name="subdistrito" maxLength={60} erro={erros.subdistrito} />
            </Linha>
            <Campo label="1.06 Setor censitário" name="setor_censitario" maxLength={15}
              dica="Código do IBGE, 15 caracteres (opcional)." erro={erros.setor_censitario} />
            <Campo label="Equipamento de referência (CRAS, CREAS, abrigo)" name="referencia" maxLength={100} obrigatorio
              dica="Nunca um domicílio residencial (Portaria GM/MDS nº 376/2008)." erro={erros.referencia} />
            <Campo label="1.13 Observações" name="obs" textarea maxLength={500} erro={erros.obs} />
          </fieldset>

          <fieldset hidden={step !== 2} className="space-y-5">
            <legend className="sr-only">{TITULOS_ETAPAS[1]}</legend>
            <Campo label="2.02 Nome completo" name="nome" maxLength={70} obrigatorio
              dica="Copie do documento oficial, sem abreviar. Um só nome é aceito apenas para quem não tem nenhum documento."
              erro={erros.nome} />
            <Linha>
              <Campo label="Apelido" name="apelido" maxLength={40} erro={erros.apelido} />
              <Campo label="Idade" name="idade" type="number" inputMode="numeric" min={0} max={130} erro={erros.idade} />
            </Linha>
            <Linha>
              <Campo label="Cidade de nascimento" name="cidade_nascimento" maxLength={60} erro={erros.cidade_nascimento} />
              <Selecao label="Estado de nascimento" name="estado_nascimento" opcoes={UFS} erro={erros.estado_nascimento} />
            </Linha>
            <Linha>
              <Campo label="Estado civil" name="estado_civil" maxLength={30} erro={erros.estado_civil} />
              <Campo label="Nome dos pais" name="nome_pais" maxLength={140} erro={erros.nome_pais} />
            </Linha>
            <Linha>
              <Campo label="CPF" name="cpf" inputMode="numeric" mascara={mascaraCpf} placeholder="000.000.000-00"
                erro={erros.cpf} />
              <Campo label="RG" name="rg" maxLength={20} erro={erros.rg} />
            </Linha>
            <Linha>
              <Campo label="2.03 NIS/PIS/PASEP" name="nis" inputMode="numeric" mascara={mascaraNis}
                placeholder="000.00000.00-0" dica="Opcional; deixe em branco se a pessoa não tiver."
                erro={erros.nis} />
              <Campo label="Telefone de contato (com DDD)" name="telefone" type="tel" inputMode="tel" mascara={mascaraTelefone}
                placeholder="(92) 99999-9999"
                dica="Opcional. Pode ser de familiar, vizinho ou de um equipamento de assistência social."
                erro={erros.telefone} />
            </Linha>
          </fieldset>

          <fieldset hidden={step !== 3} className="space-y-5">
            <legend className="sr-only">{TITULOS_ETAPAS[2]}</legend>
            <DiasPorSemana erro={erros.dorme_dias} />
            <Linha>
              <Selecao label="2.05 Há quanto tempo vive na rua?" name="tempo_rua_faixa" opcoes={FAIXAS_TEMPO} obrigatorio
                erro={erros.tempo_rua_faixa} />
              <Selecao label="2.07 Há quanto tempo mora nesta cidade?" name="tempo_cidade_faixa" opcoes={FAIXAS_TEMPO}
                obrigatorio erro={erros.tempo_cidade_faixa} />
            </Linha>
            <GrupoOpcoes legenda="2.06 Principais motivos pelos quais passou a morar na rua/albergue/outro" name="motivos"
              tipo="checkbox" opcoes={MOTIVOS_RUA} obrigatorio dica="Pode marcar mais de um." erro={erros.motivos} />
            <GrupoOpcoes legenda="2.08 Vive com sua família na rua?" name="vive_familia_na_rua" tipo="radio" opcoes={SIM_NAO}
              obrigatorio erro={erros.vive_familia_na_rua}
              dica="Se sim, os componentes da família vão no Bloco 3 do Formulário Principal." />
            <Selecao label="2.09 Tem contato com parente que vive fora da rua?" name="contato_parente" opcoes={CONTATO_PARENTE}
              obrigatorio erro={erros.contato_parente} />
            <Campo label="Onde morava antes" name="moradia_anterior" maxLength={200} erro={erros.moradia_anterior} />
            <Linha>
              <Campo label="Onde mora atualmente" name="moradia_atual" maxLength={200} erro={erros.moradia_atual} />
              <Campo label="Redes de apoio social/familiar" name="redes_apoio" maxLength={200} erro={erros.redes_apoio} />
            </Linha>
          </fieldset>

          <fieldset hidden={step !== 4} className="space-y-5">
            <legend className="sr-only">{TITULOS_ETAPAS[3]}</legend>
            <GrupoOpcoes legenda="2.10 Nos últimos seis meses, frequentou ou participou de alguma atividade comunitária?"
              name="atividades_comunitarias" tipo="checkbox" opcoes={ATIVIDADES_COMUNITARIAS} obrigatorio
              dica="Pode marcar mais de um, exceto “não sabe” e “não respondeu”." erro={erros.atividades_comunitarias} />
            <GrupoOpcoes legenda="2.11 Nos últimos seis meses, foi atendido em algum dos lugares abaixo?"
              name="atendimentos_6m" tipo="checkbox" opcoes={LOCAIS_ATENDIMENTO} obrigatorio
              dica="Pode marcar mais de um, exceto “nenhum”." erro={erros.atendimentos_6m} />
            <GrupoOpcoes legenda="2.12 Alguma vez teve emprego com carteira de trabalho assinada?" name="carteira_assinada"
              tipo="radio" opcoes={SIM_NAO} obrigatorio erro={erros.carteira_assinada} />
            <GrupoOpcoes legenda="2.13 O que faz para ganhar dinheiro?" name="atividades_renda" tipo="checkbox"
              opcoes={ATIVIDADES_RENDA} obrigatorio dica="Pode marcar mais de um, exceto “não respondeu”."
              erro={erros.atividades_renda} />
          </fieldset>

          <fieldset hidden={step !== 5} className="space-y-5">
            <legend className="sr-only">{TITULOS_ETAPAS[4]}</legend>
            <Marca name="consentimento_lgpd" erro={erros.consentimento_lgpd} obrigatorio
              label="A pessoa entrevistada consentiu com o uso destes dados (LGPD)" />
            <Marca name="campanha_pop_rua" label="Vincular à Campanha Pop Rua" />
            <FotoPessoa erro={erros.foto} />
            <p className="border-l-2 border-linha pl-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400">
              Declaro, sob as penas da lei (Art. 299 do Código Penal), que as declarações deste formulário correspondem à
              verdade e comprometo-me a procurar a gestão municipal para atualizá-las sempre que houver mudanças ou, no
              máximo, em até dois anos da data desta entrevista.
            </p>
            <SignaturePad label="Assinatura do responsável pela unidade familiar (RF)" name="assinatura_rf" obrigatorio
              erro={erros.assinatura_rf} />
            <SignaturePad label="Assinatura do entrevistador" name="assinatura_entrevistador" erro={erros.assinatura_entrevistador} />
            <SignaturePad label="Assinatura do representante da prefeitura/órgão responsável" name="assinatura_representante"
              erro={erros.assinatura_representante} />
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-tinta pt-5 sm:flex-row sm:justify-between dark:border-gray-700">
            <Botao variante="secundario" className="w-full sm:w-auto" disabled={step === 1 || isSubmitting}
              onClick={() => setStep((s) => Math.max(1, s - 1))}>
              Voltar
            </Botao>
            {step < TOTAL_STEPS ? (
              <Botao className="w-full sm:w-auto" onClick={proximo}>
                Próximo <Seta />
              </Botao>
            ) : (
              <Botao type="submit" variante="destaque" className="w-full sm:w-auto" carregando={isSubmitting} textoCarregando="Salvando...">
                Concluir cadastro
              </Botao>
            )}
          </div>
        </Form>
      </div>
    </main>
  );
}
