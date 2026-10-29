import { doisDigitos } from "./numeros";

// Validadores e máscaras de formato — usados no navegador (feedback imediato) e no servidor (decisão final).
// Valores são sempre guardados "limpos" (só dígitos) e exibidos com máscara.

export const soDigitos = (s: string) => s.replace(/\D/g, "");

// ---------- CPF: 000.000.000-00 ----------
export function validarCpf(valor: string) {
  const d = soDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
    const dv = ((soma * 10) % 11) % 10;
    if (dv !== Number(d[tamanho])) return false;
  }
  return true;
}

export function mascaraCpf(valor: string) {
  const d = soDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

// ---------- NIS/PIS/PASEP: 000.00000.00-0 (11 dígitos, DV módulo 11) ----------
export function validarNis(valor: string) {
  const d = soDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const pesos = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const soma = pesos.reduce((acc, p, i) => acc + p * Number(d[i]), 0);
  const resto = soma % 11;
  const dv = resto < 2 ? 0 : 11 - resto;
  return dv === Number(d[10]);
}

export function mascaraNis(valor: string) {
  const d = soDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{5})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{5})\.(\d{2})(\d)/, "$1.$2.$3-$4");
}

// ---------- Telefone: (DDD) 9XXXX-XXXX ou (DDD) XXXX-XXXX ----------
const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

// Aceita +55 na frente; devolve só DDD + número (10 ou 11 dígitos) ou null se inválido.
export function normalizarTelefone(valor: string) {
  let d = soDigitos(valor);
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  if (!DDDS_VALIDOS.has(Number(d.slice(0, 2)))) return null;
  const numero = d.slice(2);
  if (numero.length === 9 && numero[0] !== "9") return null; // celular começa com 9
  if (numero.length === 8 && !/[2-5]/.test(numero[0])) return null; // fixo começa com 2 a 5
  if (/^(\d)\1+$/.test(numero)) return null;
  return d;
}

// Colar "+55 92 99123-4567" ou "5592991234567" não pode virar um número errado: tira o código do país.
function semCodigoDoPais(valor: string) {
  const d = soDigitos(valor);
  const comMais = valor.trim().startsWith("+55");
  const colado = (d.length === 12 || d.length === 13) && d.startsWith("55"); // DDD+número nunca passa de 11 dígitos
  return comMais || colado ? d.slice(2) : d;
}

export function mascaraTelefone(valor: string) {
  const d = semCodigoDoPais(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Exibição de valores guardados só com dígitos: vazio/nulo vira null.
const formatarOuNulo = (mascara: (v: string) => string) => (digitos: string | null | undefined) =>
  digitos ? mascara(digitos) : null;

export const formatarTelefone = formatarOuNulo(mascaraTelefone);
export const formatarCpf = formatarOuNulo(mascaraCpf);
export const formatarNis = formatarOuNulo(mascaraNis);

// ---------- Nomes ----------
const NOME_VALIDO = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’. -]*$/;
export const nomeValido = (s: string) => NOME_VALIDO.test(s);

// ---------- Datas ----------
// Data local no formato AAAA-MM-DD (o mesmo valor de <input type="date">).
export function dataLocalIso(data = new Date()) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

// Não pode ser futura nem anterior a 2000.
export function validarDataEntrevista(valor: string, hoje = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return "Informe uma data válida.";
  const [a, m, d] = valor.split("-").map(Number);
  const data = new Date(Date.UTC(a, m - 1, d));
  if (data.getUTCFullYear() !== a || data.getUTCMonth() !== m - 1 || data.getUTCDate() !== d) {
    return "Informe uma data válida.";
  }
  if (valor > dataLocalIso(hoje)) return "A data da entrevista não pode ser futura.";
  if (a < 2000) return "Data da entrevista anterior a 2000 não é aceita.";
  return null;
}
