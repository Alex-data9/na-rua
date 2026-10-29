// Marca NaRua: uma "placa de rua" verde (moldura interna, como as placas de logradouro) com uma seta de direção,
// ao lado do nome em letreiro condensado terminado por um ponto âmbar de poste.
// O mesmo desenho da placa está em public/favicon.svg.
export function MarcaPlaca({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 28" aria-hidden="true" className={className}>
      <rect width="40" height="28" rx="3" fill="#0c6b4e" />
      <rect x="3" y="3" width="34" height="22" fill="none" stroke="#fff" strokeWidth="1.6" />
      <path d="M10 14h18m-6-5.5L28 14l-6 5.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="square" />
    </svg>
  );
}

export function Logo({ subtitulo = true }: { subtitulo?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <MarcaPlaca />
      <span className="leading-none">
        <span className="titulo-display block text-[1.35rem] lowercase">
          narua<span aria-hidden="true" className="text-poste-500">.</span>
        </span>
        {subtitulo && <span className="rotulo-tecnico mt-1 block !text-[10px]">Cadastro &amp; acompanhamento</span>}
      </span>
    </span>
  );
}
