import type { CSSProperties } from "react";
import { doisDigitos } from "~/utils/numeros";


// Estações da "Linha Cadastro" (uma por etapa) e equipamentos da rede (pontos de referência do mapa).
const ESTACOES = [
  { x: 64, y: 318, rotulo: { x: 40, y: 354, ancora: "start" } },
  { x: 168, y: 238, rotulo: { x: 168, y: 206, ancora: "middle" } },
  { x: 300, y: 238, rotulo: { x: 300, y: 274, ancora: "middle" } },
  { x: 392, y: 146, rotulo: { x: 372, y: 128, ancora: "end" } },
  { x: 500, y: 84, rotulo: { x: 540, y: 50, ancora: "end" } },
] as const;

const EQUIPAMENTOS = [
  { x: 104, y: 120, nome: "CRAS" },
  { x: 236, y: 330, nome: "CREAS" },
  { x: 446, y: 296, nome: "ABRIGO" },
];

const TRACADO = ESTACOES.map((e, i) => `${i === 0 ? "M" : "L"}${e.x} ${e.y}`).join(" ");

// Mapa de transporte decorativo: a linha se desenha no carregamento e as estações surgem e pulsam em sequência.
// O conteúdo (as etapas) vai também na legenda em lista, que é o que leitores de tela leem.
export function MapaLinha({ etapas }: { etapas: string[] }) {
  return (
    <figure className="relative rounded-[10px] border border-white/15 bg-asfalto-950/60 shadow-[inset_0_0_0_5px_rgb(255_255_255/0.04)]">
      <figcaption className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase">
        <span className="flex items-center gap-2 text-poste-400">
          <span aria-hidden="true" className="inline-block h-3 w-6 rounded-full bg-poste-400" />
          Linha Cadastro
        </span>
        <span className="text-asfalto-200">{doisDigitos(etapas.length)} estações</span>
      </figcaption>

      <svg viewBox="0 0 560 400" aria-hidden="true" className="block h-auto w-full">
        {/* Quadras */}
        <g fill="rgb(255 255 255 / 0.035)">
          <rect x="20" y="20" width="120" height="70" rx="4" />
          <rect x="170" y="20" width="160" height="70" rx="4" />
          <rect x="20" y="150" width="110" height="60" rx="4" />
          <rect x="200" y="140" width="150" height="62" rx="4" />
          <rect x="420" y="160" width="120" height="90" rx="4" />
          <rect x="90" y="270" width="90" height="100" rx="4" />
          <rect x="330" y="290" width="70" height="80" rx="4" />
        </g>
        {/* Ruas e avenidas */}
        <g stroke="rgb(255 255 255 / 0.10)" strokeWidth="10" fill="none" strokeLinecap="round">
          <path d="M0 116 H560" />
          <path d="M0 262 C140 262 200 232 300 232 S470 280 560 260" />
          <path d="M156 0 V400" />
          <path d="M370 0 C380 120 400 200 410 400" />
        </g>
        <g stroke="rgb(255 255 255 / 0.05)" strokeWidth="4" fill="none">
          <path d="M0 52 H560 M0 196 H560 M0 340 H560 M74 0 V400 M250 0 V400 M480 0 V400" />
        </g>
        {/* Curvas de nível */}
        <g stroke="rgb(255 190 61 / 0.10)" strokeWidth="1.2" fill="none" strokeDasharray="3 5">
          <path d="M-10 380 C120 330 220 390 330 350 S520 300 580 330" />
          <path d="M-10 30 C90 70 210 10 320 50 S500 80 580 40" />
        </g>

        {/* Equipamentos da rede de apoio */}
        {EQUIPAMENTOS.map((e) => (
          <g key={e.nome} transform={`translate(${e.x} ${e.y})`}>
            <rect x="-9" y="-9" width="18" height="18" rx="3" fill="#0c6b4e" stroke="#fff" strokeWidth="1.5" />
            <path d="M-4 0h8m-3-3 3 3-3 3" stroke="#fff" strokeWidth="1.6" fill="none" />
            <text x="14" y="4" fill="rgb(197 206 213)" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="1.2">
              {e.nome}
            </text>
          </g>
        ))}

        {/* Traçado: base (planejado) e linha âmbar que se desenha */}
        <path d={TRACADO} fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={TRACADO}
          pathLength={1}
          className="linha-desenha"
          fill="none"
          stroke="var(--color-poste-400)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Estações */}
        {ESTACOES.map((e, i) => {
          const atraso = { "--i": i } as CSSProperties;
          return (
            <g key={i}>
              <circle cx={e.x} cy={e.y} r="16" fill="var(--color-poste-400)" className="estacao-halo" style={atraso} />
              <g className="estacao" style={atraso}>
                <circle cx={e.x} cy={e.y} r="16" fill="var(--color-asfalto-900)" stroke="#fff" strokeWidth="4" />
                <text x={e.x} y={e.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
                  {doisDigitos(i + 1)}
                </text>
                <text
                  x={e.rotulo.x}
                  y={e.rotulo.y}
                  textAnchor={e.rotulo.ancora}
                  fill="var(--color-papel)"
                  fontSize="13"
                  fontWeight="700"
                  className="max-sm:hidden"
                >
                  {etapas[i]}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Legenda: visível no celular (onde os nomes não cabem no mapa), só para leitor de tela a partir de 640 px */}
      <ol className="grid gap-1 border-t border-white/10 px-4 py-3 text-sm text-asfalto-200 sm:sr-only">
        {etapas.map((t, i) => (
          <li key={t} className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] font-bold text-poste-400">{doisDigitos(i + 1)}</span>
            {t}
          </li>
        ))}
      </ol>
    </figure>
  );
}
