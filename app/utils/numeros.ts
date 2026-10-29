// Número com dois dígitos: 1 → "01". Usado na numeração editorial (estações, etapas, passos) e em datas.
export const doisDigitos = (n: number) => String(n).padStart(2, "0");
