import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigation } from "react-router";
import { Logo } from "./Logo";

// Só rotas que existem de fato. Acrescentar aqui quando houver novas páginas.
const ITENS_NAVEGACAO = [
  { to: "/", rotulo: "Início", end: true },
  { to: "/cadastro", rotulo: "Novo cadastro", end: false },
  { to: "/painel", rotulo: "Painel", end: false },
] as const;

const ITEM = "flex min-h-11 items-center gap-2 px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] transition-colors";
const ITEM_ATIVO = "text-tinta dark:text-white";
const ITEM_INATIVO = "text-gray-600 hover:text-tinta dark:text-gray-400 dark:hover:text-white";

function ListaNavegacao({ className }: { className: string }) {
  return (
    <ul className={className}>
      {ITENS_NAVEGACAO.map((i, n) => (
        <li key={i.to}>
          <NavLink to={i.to} end={i.end} className={({ isActive }) => `${ITEM} ${isActive ? ITEM_ATIVO : ITEM_INATIVO}`}>
            {({ isActive }) => (
              <>
                <span aria-hidden="true" className={`h-2 w-2 ${isActive ? "bg-sinal-500" : "bg-transparent"}`} />
                <span aria-hidden="true" className="text-gray-400">0{n + 1}</span>
                {i.rotulo}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const { pathname } = useLocation();
  const carregando = useNavigation().state === "loading";
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => setAberto(false), [pathname]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  return (
    <header className="sticky top-0 z-40 border-b border-tinta bg-papel/90 backdrop-blur dark:border-gray-700 dark:bg-[#0b0b0b]/90">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-gray-900"
      >
        Ir para o conteúdo
      </a>
      <div role="status" aria-live="polite" className="h-1">
        {carregando && (
          <>
            <span className="sr-only">Carregando página…</span>
            <div className="h-1 w-full animate-pulse bg-sinal-500" />
          </>
        )}
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link to="/" className="flex min-h-11 items-center" aria-label="NaRua — ir para a página inicial">
          <Logo />
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:block">
          <ListaNavegacao className="flex gap-1" />
        </nav>

        <button
          ref={botao}
          type="button"
          className="flex min-h-11 items-center border border-tinta px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] md:hidden dark:border-gray-300"
          aria-expanded={aberto}
          aria-controls="menu-movel"
          onClick={() => setAberto((a) => !a)}
        >
          {aberto ? "Fechar menu" : "Menu"}
        </button>
      </div>

      {aberto && (
        <nav id="menu-movel" aria-label="Navegação principal" className="border-t border-linha px-4 py-2 md:hidden dark:border-gray-800">
          <ListaNavegacao className="flex flex-col gap-1" />
        </nav>
      )}
    </header>
  );
}
