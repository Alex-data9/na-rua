import {
  ATIVIDADES_COMUNITARIAS,
  ATIVIDADES_RENDA,
  CONTATO_PARENTE,
  EXCLUSIVOS,
  FAIXAS_TEMPO,
  FORMA_COLETA,
  LOCAIS_ATENDIMENTO,
  LOCAIS_DORMIR,
  MODALIDADE_OPERACAO,
  MOTIVOS_RUA,
  UFS,
  type Opcao,
} from "./formulario-suplementar2";
import {
  normalizarTelefone,
  nomeValido,
  soDigitos,
  validarCpf,
  validarDataEntrevista,
  validarNis,
} from "./validators";

export type Erros = Record<string, string>;

const TEXTOS = [
  "modalidade_operacao", "forma_coleta", "data_entrevista", "agente", "entrevistador_cpf",
  "uf", "municipio", "distrito", "subdistrito", "setor_censitario", "referencia", "obs",
  "nome", "apelido", "idade", "cidade_nascimento", "estado_nascimento", "estado_civil",
  "nome_pais", "cpf", "rg", "nis", "telefone",
  "dorme_rua_dias", "dorme_albergue_dias", "dorme_domicilio_dias", "dorme_outro_dias",
  "tempo_rua_faixa", "tempo_cidade_faixa", "vive_familia_na_rua", "contato_parente",
  "moradia_anterior", "moradia_atual", "redes_apoio", "carteira_assinada",
  "assinatura_rf", "assinatura_entrevistador", "assinatura_representante",
] as const;
const LISTAS = ["motivos", "atividades_comunitarias", "atendimentos_6m", "atividades_renda"] as const;
const MARCAS = ["campanha_pop_rua", "consentimento_lgpd"] as const;

export type ValoresCadastro = Record<(typeof TEXTOS)[number], string> &
  Record<(typeof LISTAS)[number], string[]> &
  Record<(typeof MARCAS)[number], boolean>;

export function lerFormulario(form: FormData): ValoresCadastro {
  const v: Record<string, string | string[] | boolean> = {};
  for (const c of TEXTOS) v[c] = String(form.get(c) ?? "").trim();
  for (const c of LISTAS) v[c] = form.getAll(c).map(String);
  for (const c of MARCAS) v[c] = form.get(c) === "on";
  return v as ValoresCadastro;
}

export const CAMPOS_POR_ETAPA: string[][] = [
  ["modalidade_operacao", "forma_coleta", "data_entrevista", "agente", "entrevistador_cpf", "uf",
    "municipio", "distrito", "subdistrito", "setor_censitario", "referencia", "obs"],
  ["nome", "apelido", "idade", "cidade_nascimento", "estado_nascimento", "estado_civil", "nome_pais",
    "cpf", "rg", "nis", "telefone"],
  ["dorme_dias", "tempo_rua_faixa", "tempo_cidade_faixa", "motivos", "vive_familia_na_rua",
    "contato_parente", "moradia_anterior", "moradia_atual", "redes_apoio"],
  ["atividades_comunitarias", "atendimentos_6m", "carteira_assinada", "atividades_renda"],
  ["consentimento_lgpd", "assinatura_rf", "assinatura_entrevistador", "assinatura_representante"],
];

const NOME_MAX = 70;
const ASSINATURA_MAX = 300_000;

const naLista = (opcoes: Opcao[], v: string) => opcoes.some((o) => String(o.value) === v);

function validarMultipla(
  e: Erros,
  campo: keyof Pick<ValoresCadastro, (typeof LISTAS)[number]>,
  valores: string[],
  opcoes: Opcao[],
  exclusivos: readonly number[],
) {
  if (valores.length === 0) return void (e[campo] = "Marque ao menos uma opção.");
  if (!valores.every((x) => naLista(opcoes, x))) return void (e[campo] = "Opção inválida.");
  const marcados = valores.map(Number);
  const temExclusivo = marcados.some((m) => exclusivos.includes(m));
  if (temExclusivo && marcados.length > 1) {
    const rotulos = opcoes.filter((o) => exclusivos.includes(o.value)).map((o) => `"${o.label}"`);
    e[campo] =
      rotulos.length > 1
        ? `${rotulos.join(" e ")} não podem ser combinadas com outras opções.`
        : `${rotulos[0]} não pode ser combinada com outras opções.`;
  }
}

export function validarCadastro(v: ValoresCadastro, hoje = new Date()): Erros {
  const e: Erros = {};

  // ---- Bloco 1: identificação e controle ----
  if (!naLista(MODALIDADE_OPERACAO, v.modalidade_operacao)) e.modalidade_operacao = "Selecione Inclusão ou Alteração.";
  if (!naLista(FORMA_COLETA, v.forma_coleta)) e.forma_coleta = "Selecione a forma de coleta.";
  const erroData = validarDataEntrevista(v.data_entrevista, hoje);
  if (erroData) e.data_entrevista = erroData;

  if (!v.agente) e.agente = "Informe o nome do entrevistador.";
  else if (!nomeValido(v.agente) || v.agente.length > NOME_MAX || v.agente.split(/\s+/).length < 2)
    e.agente = "Informe o nome completo do entrevistador (somente letras, até 70 caracteres).";
  if (!v.entrevistador_cpf) e.entrevistador_cpf = "Informe o CPF do entrevistador.";
  else if (!validarCpf(v.entrevistador_cpf)) e.entrevistador_cpf = "CPF inválido. Use o formato 000.000.000-00.";

  if (!(UFS as readonly string[]).includes(v.uf)) e.uf = "Selecione a UF.";
  if (v.municipio.length < 2 || v.municipio.length > 60) e.municipio = "Informe o município (2 a 60 caracteres).";
  if (v.distrito.length > 60) e.distrito = "Máximo de 60 caracteres.";
  if (v.subdistrito.length > 60) e.subdistrito = "Máximo de 60 caracteres.";
  if (v.setor_censitario && !/^[0-9A-Za-z]{15}$/.test(v.setor_censitario))
    e.setor_censitario = "O setor censitário tem 15 caracteres (código do IBGE).";
  if (v.referencia.length < 3 || v.referencia.length > 100)
    e.referencia = "Informe o equipamento de referência (CRAS, CREAS, abrigo — nunca um domicílio).";
  if (v.obs.length > 500) e.obs = "Máximo de 500 caracteres.";

  // ---- 2.01 a 2.03: identificação da pessoa ----
  const temDocumento = Boolean(v.cpf || v.rg);
  if (!v.nome) e.nome = "Informe o nome completo.";
  else if (!nomeValido(v.nome) || v.nome.length > NOME_MAX)
    e.nome = "Use somente letras, espaços, apóstrofo, ponto e hífen (até 70 caracteres).";
  else if (v.nome.split(/\s+/).length < 2 && temDocumento)
    e.nome = "Copie o nome completo do documento, sem abreviar. Um só nome é aceito apenas para quem não tem nenhum documento.";
  if (v.apelido.length > 40) e.apelido = "Máximo de 40 caracteres.";
  if (v.idade && !(/^\d{1,3}$/.test(v.idade) && Number(v.idade) <= 130)) e.idade = "Idade deve estar entre 0 e 130.";
  if (v.cidade_nascimento.length > 60) e.cidade_nascimento = "Máximo de 60 caracteres.";
  if (v.estado_nascimento && !(UFS as readonly string[]).includes(v.estado_nascimento)) e.estado_nascimento = "UF inválida.";
  if (v.estado_civil.length > 30) e.estado_civil = "Máximo de 30 caracteres.";
  if (v.nome_pais.length > 140) e.nome_pais = "Máximo de 140 caracteres.";
  if (v.cpf && !validarCpf(v.cpf)) e.cpf = "CPF inválido. Use o formato 000.000.000-00.";
  if (v.rg && !/^[0-9A-Za-z./ -]{5,20}$/.test(v.rg)) e.rg = "RG inválido (5 a 20 caracteres: letras, números, ponto, hífen ou barra).";
  if (v.nis && !validarNis(v.nis)) e.nis = "NIS/PIS/PASEP inválido. São 11 dígitos, formato 000.00000.00-0.";
  if (v.telefone && !normalizarTelefone(v.telefone)) e.telefone = "Telefone inválido. Use DDD + número: (92) 99999-9999 ou (92) 3333-4444.";

  // ---- 2.04: onde costuma dormir (dias por semana, soma máxima 7) ----
  let soma = 0;
  let dormeInvalido = false;
  for (const l of LOCAIS_DORMIR) {
    const bruto = v[l.campo];
    if (bruto === "") continue;
    if (!/^[0-7]$/.test(bruto)) dormeInvalido = true;
    else soma += Number(bruto);
  }
  if (dormeInvalido) e.dorme_dias = "Informe de 0 a 7 dias por semana em cada local.";
  else if (soma < 1) e.dorme_dias = "Informe em quantos dias por semana a pessoa dorme em ao menos um local.";
  else if (soma > 7) e.dorme_dias = `A soma dos dias por semana não pode passar de 7 (atual: ${soma}).`;

  if (!naLista(FAIXAS_TEMPO, v.tempo_rua_faixa)) e.tempo_rua_faixa = "Selecione há quanto tempo vive na rua.";
  if (!naLista(FAIXAS_TEMPO, v.tempo_cidade_faixa)) e.tempo_cidade_faixa = "Selecione há quanto tempo mora na cidade.";
  validarMultipla(e, "motivos", v.motivos, MOTIVOS_RUA, EXCLUSIVOS.motivos);
  if (!["1", "2"].includes(v.vive_familia_na_rua)) e.vive_familia_na_rua = "Selecione Sim ou Não.";
  if (!naLista(CONTATO_PARENTE, v.contato_parente)) e.contato_parente = "Selecione a frequência de contato.";
  for (const c of ["moradia_anterior", "moradia_atual", "redes_apoio"] as const) {
    if (v[c].length > 200) e[c] = "Máximo de 200 caracteres.";
  }

  // ---- 2.10 a 2.13 ----
  validarMultipla(e, "atividades_comunitarias", v.atividades_comunitarias, ATIVIDADES_COMUNITARIAS, EXCLUSIVOS.atividades_comunitarias);
  validarMultipla(e, "atendimentos_6m", v.atendimentos_6m, LOCAIS_ATENDIMENTO, EXCLUSIVOS.atendimentos_6m);
  if (!["1", "2"].includes(v.carteira_assinada)) e.carteira_assinada = "Selecione Sim ou Não.";
  validarMultipla(e, "atividades_renda", v.atividades_renda, ATIVIDADES_RENDA, EXCLUSIVOS.atividades_renda);

  // ---- Fechamento ----
  if (!v.consentimento_lgpd) e.consentimento_lgpd = "É necessário registrar o consentimento da pessoa entrevistada (LGPD).";
  if (!v.assinatura_rf) e.assinatura_rf = "A assinatura do responsável familiar é obrigatória.";
  for (const c of ["assinatura_rf", "assinatura_entrevistador", "assinatura_representante"] as const) {
    const s = v[c];
    if (s && (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(s) || s.length > ASSINATURA_MAX)) e[c] = "Assinatura inválida. Desenhe novamente.";
  }

  return e;
}

const inteiroOuNull = (s: string) => (s === "" ? null : Number(s));
const textoOuNull = (s: string) => (s === "" ? null : s);

// Converte valores já validados para as colunas do banco (CPF/NIS/telefone só com dígitos).
export function normalizarCadastro(v: ValoresCadastro) {
  return {
    modalidade_operacao: Number(v.modalidade_operacao),
    forma_coleta: Number(v.forma_coleta),
    data_entrevista: v.data_entrevista,
    agente: v.agente,
    entrevistador_cpf: soDigitos(v.entrevistador_cpf),
    uf: v.uf,
    municipio: v.municipio,
    distrito: textoOuNull(v.distrito),
    subdistrito: textoOuNull(v.subdistrito),
    setor_censitario: textoOuNull(v.setor_censitario.toUpperCase()),
    referencia: v.referencia,
    obs: textoOuNull(v.obs),

    nome: v.nome,
    apelido: textoOuNull(v.apelido),
    idade: inteiroOuNull(v.idade),
    cidade_nascimento: textoOuNull(v.cidade_nascimento),
    estado_nascimento: textoOuNull(v.estado_nascimento),
    estado_civil: textoOuNull(v.estado_civil),
    nome_pais: textoOuNull(v.nome_pais),
    cpf: v.cpf ? soDigitos(v.cpf) : null,
    rg: textoOuNull(v.rg),
    nis: v.nis ? soDigitos(v.nis) : null,
    telefone: v.telefone ? normalizarTelefone(v.telefone) : null,

    dorme_rua_dias: inteiroOuNull(v.dorme_rua_dias),
    dorme_albergue_dias: inteiroOuNull(v.dorme_albergue_dias),
    dorme_domicilio_dias: inteiroOuNull(v.dorme_domicilio_dias),
    dorme_outro_dias: inteiroOuNull(v.dorme_outro_dias),
    tempo_rua_faixa: Number(v.tempo_rua_faixa),
    tempo_cidade_faixa: Number(v.tempo_cidade_faixa),
    motivos: v.motivos.map(Number),
    vive_familia_na_rua: v.vive_familia_na_rua === "1",
    contato_parente: Number(v.contato_parente),
    moradia_anterior: textoOuNull(v.moradia_anterior),
    moradia_atual: textoOuNull(v.moradia_atual),
    redes_apoio: textoOuNull(v.redes_apoio),

    atividades_comunitarias: v.atividades_comunitarias.map(Number),
    atendimentos_6m: v.atendimentos_6m.map(Number),
    carteira_assinada: v.carteira_assinada === "1",
    atividades_renda: v.atividades_renda.map(Number),

    campanha_pop_rua: v.campanha_pop_rua,
    consentimento_lgpd: v.consentimento_lgpd,
    assinatura_rf: v.assinatura_rf,
    assinatura_entrevistador: textoOuNull(v.assinatura_entrevistador),
    assinatura_representante: textoOuNull(v.assinatura_representante),
    assinatura_confirmada: true,
  };
}
