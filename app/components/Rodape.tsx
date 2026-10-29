import { Logo } from "./Logo";

export function Rodape() {
  return (
    <footer className="mt-16 bg-tinta text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_2fr]">
        <div className="text-white">
          <Logo subtitulo={false} />
        </div>
        <div className="grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <p className="rotulo-tecnico mb-2 !text-gray-400">Base</p>
            <p>O formulário de cadastro é baseado no Formulário Suplementar 2 do Cadastro Único (MDS).</p>
          </div>
          <div>
            <p className="rotulo-tecnico mb-2 !text-gray-400">Privacidade</p>
            <p>Os dados tratados são sensíveis: registre-os somente com o consentimento da pessoa atendida (LGPD).</p>
          </div>
        </div>
      </div>
      {/* faixa de pedestre clara sobre o asfalto */}
      <div
        aria-hidden="true"
        className="h-3 opacity-80"
        style={{ background: "repeating-linear-gradient(90deg, var(--color-papel) 0 28px, transparent 28px 52px)" }}
      />
    </footer>
  );
}
